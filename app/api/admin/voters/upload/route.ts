import { NextRequest, NextResponse } from 'next/server';
import { uploadEligibleVoters, VoterRecord } from '@/lib/models/stats';
import { initDatabaseSchema } from '@/lib/db/schema';

function isAdmin(req: NextRequest): boolean {
  const token = req.cookies.get('mpcs_admin_token')?.value || req.cookies.get('mpcs_auth_token')?.value;
  if (!token) return false;
  try {
    const parts = token.split('_');
    return parts.length >= 3 && parts[2] === 'admin';
  } catch {
    return false;
  }
}

/**
 * RFC-4180 compliant CSV line splitter supporting quoted values with commas
 */
function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' || char === "'") {
      inQuotes = !inQuotes;
    } else if ((char === ',' || char === '\t' || char === ';') && !inQuotes) {
      result.push(current.trim().replace(/^["']|["']$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim().replace(/^["']|["']$/g, ''));
  return result;
}

/**
 * Robust Electoral Register CSV parser supporting exact format:
 * Member Number, NIC, FULL NAME, ADDRESS, POSTAL ADDRESS, GENDER
 */
function parseVoterCsv(text: string): VoterRecord[] {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];

  const rawHeaders = splitCsvLine(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
  const hasHeader = rawHeaders.some(h => 
    h.includes('voter') || h.includes('member') || h.includes('name') || h.includes('nic') || h.includes('address') || h.includes('division') || h.includes('gender')
  );

  let colMap = {
    voterNumber: 0,
    nic: 1,
    fullName: 2,
    address: 3,
    postalAddress: 4,
    gender: 5,
    division: -1
  };

  if (hasHeader) {
    colMap = {
      voterNumber: rawHeaders.findIndex(h => h.includes('voter') || h.includes('member') || h.includes('no') || h.includes('reg') || h.includes('id')),
      nic: rawHeaders.findIndex(h => h.includes('nic') || h.includes('identity')),
      fullName: rawHeaders.findIndex(h => (h.includes('name') && !h.includes('voter') && !h.includes('member')) || h === 'fullname' || h === 'name'),
      address: rawHeaders.findIndex(h => h === 'address' || (h.includes('address') && !h.includes('postal'))),
      postalAddress: rawHeaders.findIndex(h => h.includes('postal') || h.includes('postaddress') || h.includes('mailing')),
      gender: rawHeaders.findIndex(h => h.includes('gender') || h.includes('sex')),
      division: rawHeaders.findIndex(h => h.includes('division') || h.includes('polling') || h.includes('area') || h.includes('ward'))
    };

    if (colMap.fullName === -1) {
      colMap.fullName = rawHeaders.findIndex(h => h.includes('name'));
    }
  }

  const dataLines = hasHeader ? lines.slice(1) : lines;
  const records: VoterRecord[] = [];

  for (const line of dataLines) {
    const parts = splitCsvLine(line);
    if (parts.length === 0 || !parts.some(Boolean)) continue;

    let voterNumber = '';
    let memberNumber = '';
    let nic = '';
    let fullName = '';
    let address = '';
    let postalAddress = '';
    let gender = '';
    let division = '';

    if (hasHeader) {
      if (colMap.voterNumber !== -1 && parts[colMap.voterNumber]) {
        voterNumber = parts[colMap.voterNumber];
        memberNumber = parts[colMap.voterNumber];
      }
      if (colMap.nic !== -1 && parts[colMap.nic]) nic = parts[colMap.nic];
      if (colMap.fullName !== -1 && parts[colMap.fullName]) fullName = parts[colMap.fullName];
      if (colMap.address !== -1 && parts[colMap.address]) address = parts[colMap.address];
      if (colMap.postalAddress !== -1 && parts[colMap.postalAddress]) postalAddress = parts[colMap.postalAddress];
      if (colMap.gender !== -1 && parts[colMap.gender]) gender = parts[colMap.gender];
      if (colMap.division !== -1 && parts[colMap.division]) division = parts[colMap.division];
    } else {
      // Positional exact format: Member Number, NIC, FULL NAME, ADDRESS, POSTAL ADDRESS, GENDER
      if (parts.length >= 6) {
        voterNumber = parts[0];
        memberNumber = parts[0];
        nic = parts[1];
        fullName = parts[2];
        address = parts[3];
        postalAddress = parts[4];
        gender = parts[5];
        if (parts.length >= 7) division = parts[6];
      } else if (parts.length === 5) {
        voterNumber = parts[0];
        memberNumber = parts[0];
        nic = parts[1];
        fullName = parts[2];
        address = parts[3];
        postalAddress = parts[4];
      } else if (parts.length === 4) {
        voterNumber = parts[0];
        memberNumber = parts[0];
        nic = parts[1];
        fullName = parts[2];
        address = parts[3];
      } else if (parts.length === 3) {
        voterNumber = parts[0];
        memberNumber = parts[0];
        nic = parts[1];
        fullName = parts[2];
      } else if (parts.length === 2) {
        fullName = parts[0];
        nic = parts[1];
      } else if (parts.length === 1) {
        fullName = parts[0];
      }
    }

    if (fullName) {
      records.push({ voterNumber, memberNumber, nic, fullName, address, postalAddress, gender, division });
    }
  }

  return records;
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await initDatabaseSchema();
    const contentType = req.headers.get('content-type') || '';
    let records: VoterRecord[] = [];
    let mode: 'append' | 'replace' = 'append';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      mode = (formData.get('mode') as 'append' | 'replace') || 'append';

      if (!file) {
        return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
      }

      const fileText = await file.text();
      records = parseVoterCsv(fileText);
    } else {
      const body = await req.json();
      mode = body.mode || 'append';
      if (Array.isArray(body.records)) {
        records = body.records;
      } else if (typeof body.csvText === 'string') {
        records = parseVoterCsv(body.csvText);
      }
    }

    if (records.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No valid voter records found in the uploaded electoral register.'
      }, { status: 400 });
    }

    const totalCount = await uploadEligibleVoters(records, mode);

    return NextResponse.json({
      success: true,
      uploadedCount: records.length,
      totalCount,
      message: `Successfully processed ${records.length} eligible voters.`
    });
  } catch (err) {
    console.error('Error uploading electoral register:', err);
    return NextResponse.json({ success: false, error: 'Failed to upload electoral register' }, { status: 500 });
  }
}
