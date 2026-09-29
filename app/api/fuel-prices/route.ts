import { NextRequest, NextResponse } from 'next/server';
import { getAllFuelPrices, updateFuelPrice, updateAllFuelPrices } from '@/lib/models/fuelPrice';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const prices = await getAllFuelPrices();
    return NextResponse.json({ success: true, prices });
  } catch (error: any) {
    console.error('Error fetching fuel prices:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { auth, errorResponse } = await requireAdmin(req);
    if (errorResponse) return errorResponse;

    const body = await req.json();

    // Support single item update or batch prices update
    if (body.prices && typeof body.prices === 'object') {
      const updated = await updateAllFuelPrices(body.prices);
      return NextResponse.json({ success: true, prices: updated });
    }

    if (body.id && typeof body.price === 'number') {
      const updated = await updateFuelPrice(body.id, body.price);
      if (!updated) {
        return NextResponse.json({ success: false, error: 'Fuel item not found' }, { status: 404 });
      }
      const all = await getAllFuelPrices();
      return NextResponse.json({ success: true, item: updated, prices: all });
    }

    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating fuel prices:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export const PUT = POST;
