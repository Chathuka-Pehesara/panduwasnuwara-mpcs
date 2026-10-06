import { NextRequest, NextResponse } from 'next/server';
import { getMembersForDownload } from '@/lib/models/stats';
import { initDatabaseSchema } from '@/lib/db/schema';

function escapeCsvCell(val: any): string {
  if (val === null || val === undefined) return '';
  const str = String(val).trim();
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(req: NextRequest) {
  try {
    await initDatabaseSchema();
    const { searchParams } = new URL(req.url);
    const fileParam = searchParams.get('file') || searchParams.get('location') || '';

    const records = await getMembersForDownload(fileParam);

    // CSV header row
    const headers = [
      'Member Number',
      'NIC',
      'Full Name',
      'Address',
      'Postal Address',
      'Gender',
      'Phone',
      'File Name'
    ];

    const lines: string[] = [headers.join(',')];

    for (const row of records) {
      const line = [
        escapeCsvCell(row.member_number),
        escapeCsvCell(row.nic),
        escapeCsvCell(row.full_name),
        escapeCsvCell(row.address),
        escapeCsvCell(row.postal_address),
        escapeCsvCell(row.gender),
        escapeCsvCell(row.phone),
        escapeCsvCell(row.file_name)
      ].join(',');
      lines.push(line);
    }

    // \uFEFF Byte Order Mark ensures Excel correctly parses UTF-8 Sinhala / Tamil text
    const csvContent = '\uFEFF' + lines.join('\r\n');

    let filename = 'all_registered_members.csv';
    if (fileParam && fileParam.toLowerCase() !== 'all') {
      const baseName = fileParam.endsWith('.csv') ? fileParam : `${fileParam}.csv`;
      filename = baseName.replace(/[^a-zA-Z0-9_.\u0D80-\u0DFF-]/g, '_');
    }

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    });
  } catch (error) {
    console.error('Error generating member CSV download:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate member download' },
      { status: 500 }
    );
  }
}
