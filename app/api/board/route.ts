import { NextResponse } from 'next/server';
import { getBoardMembers } from '@/lib/models/board';
import { boardMembersData } from '@/app/components/BoardSection';

export async function GET() {
  try {
    const dbMembers = await getBoardMembers(true);
    if (dbMembers && dbMembers.length > 0) {
      // Map to frontend BoardMember interface
      const members = dbMembers.map(m => ({
        id: String(m.id),
        nameSi: m.name_si,
        nameEn: m.name_en,
        positionSi: m.position_si,
        positionEn: m.position_en,
        qualification: m.qualification || '',
        phone: m.phone || '',
        email: m.email || '',
        address: m.address || '',
        roleType: m.role_type,
        imageSrc: m.image_src || undefined,
        displayOrder: m.display_order
      }));

      return NextResponse.json({ success: true, members });
    }

    // Fallback to static default data if DB is empty
    return NextResponse.json({ success: true, members: boardMembersData });
  } catch (error: any) {
    console.error('Error fetching public board members:', error);
    return NextResponse.json({ success: true, members: boardMembersData });
  }
}
