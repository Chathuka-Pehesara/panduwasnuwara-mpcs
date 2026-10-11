import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const fileParam = url.searchParams.get('file') || url.searchParams.get('location') || 'all';
  const autoPrint = url.searchParams.get('autoprint') || '1';

  const exportUrl = new URL('/api/pdf/export', req.url);
  exportUrl.searchParams.set('module', 'members');
  exportUrl.searchParams.set('file', fileParam);
  exportUrl.searchParams.set('autoprint', autoPrint);

  return NextResponse.redirect(exportUrl);
}
