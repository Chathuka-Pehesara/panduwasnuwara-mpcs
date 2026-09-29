import { supabase } from '@/lib/supabase';
import { FuelPrice } from '@/lib/types';

export const DEFAULT_FUEL_PRICES: FuelPrice[] = [
  {
    id: 'kerosene',
    name_en: 'Kerosene',
    name_si: 'භූමිතෙල්',
    price_per_liter: 235.00,
    updated_at: new Date().toISOString()
  },
  {
    id: 'petrol-92',
    name_en: 'Petrol 92',
    name_si: 'පෙට්රල් 92',
    price_per_liter: 311.00,
    updated_at: new Date().toISOString()
  },
  {
    id: 'super-diesel',
    name_en: 'Super Diesel',
    name_si: 'සුපර් ඩීසල්',
    price_per_liter: 328.00,
    updated_at: new Date().toISOString()
  }
];

const ORDER_MAP: Record<string, number> = {
  'petrol-92': 1,
  'super-diesel': 2,
  'kerosene': 3
};

export async function getAllFuelPrices(): Promise<FuelPrice[]> {
  try {
    const { data, error } = await supabase
      .from('fuel_prices')
      .select('id, name_en, name_si, price_per_liter, updated_at');

    if (error || !data || data.length === 0) {
      return DEFAULT_FUEL_PRICES;
    }

    const prices: FuelPrice[] = data.map((row: any) => ({
      id: row.id,
      name_en: row.name_en,
      name_si: row.name_si,
      price_per_liter: Number(row.price_per_liter) || 0,
      updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString()
    }));

    return prices.sort((a, b) => {
      const orderA = ORDER_MAP[a.id] || 99;
      const orderB = ORDER_MAP[b.id] || 99;
      return orderA - orderB;
    });
  } catch (err) {
    console.error('Error in getAllFuelPrices:', err);
    return DEFAULT_FUEL_PRICES;
  }
}

export async function updateFuelPrice(id: string, price: number): Promise<FuelPrice | null> {
  try {
    const { data, error } = await supabase
      .from('fuel_prices')
      .update({
        price_per_liter: price,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('id, name_en, name_si, price_per_liter, updated_at')
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      name_en: data.name_en,
      name_si: data.name_si,
      price_per_liter: Number(data.price_per_liter) || 0,
      updated_at: data.updated_at ? new Date(data.updated_at).toISOString() : new Date().toISOString()
    };
  } catch (err) {
    console.error(`Error updating fuel price for ${id}:`, err);
    return null;
  }
}

export async function updateAllFuelPrices(prices: Record<string, number>): Promise<FuelPrice[]> {
  for (const [id, price] of Object.entries(prices)) {
    if (typeof price === 'number' && !isNaN(price)) {
      await updateFuelPrice(id, price);
    }
  }
  return getAllFuelPrices();
}
