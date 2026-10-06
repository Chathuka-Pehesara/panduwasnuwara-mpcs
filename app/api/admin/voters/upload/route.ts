import { NextRequest, NextResponse } from 'next/server';
import { uploadEligibleVoters, VoterRecord } from '@/lib/models/stats';
import { initDatabaseSchema } from '@/lib/db/schema';

function isAdmin(req: NextRequest): boolean {
  const token = req.cookies.get('mpcs_admin_token')?.value || req.cookies.get('mpcs_auth_token')?.value;
  if (!token) return false;
  try {
    const parts = token.split('_');
    return parts.length >= 3 && (parts[2] === 'admin' || parts[2] === 'superadmin');
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
    division: -1,
    location: -1
  };

  if (hasHeader) {
    colMap = {
      voterNumber: rawHeaders.findIndex(h => h.includes('voter') || h.includes('member') || h.includes('no') || h.includes('reg') || h.includes('id')),
      nic: rawHeaders.findIndex(h => h.includes('nic') || h.includes('identity')),
      fullName: rawHeaders.findIndex(h => (h.includes('name') && !h.includes('voter') && !h.includes('member')) || h === 'fullname' || h === 'name'),
      address: rawHeaders.findIndex(h => h === 'address' || (h.includes('address') && !h.includes('postal'))),
      postalAddress: rawHeaders.findIndex(h => h.includes('postal') || h.includes('postaddress') || h.includes('mailing')),
      gender: rawHeaders.findIndex(h => h.includes('gender') || h.includes('sex')),
      division: rawHeaders.findIndex(h => h.includes('division') || h.includes('polling') || h.includes('ward')),
      location: rawHeaders.findIndex(h => h.includes('location') || h.includes('district') || h.includes('city') || h.includes('area') || h.includes('town'))
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
    let location = '';

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
      if (colMap.location !== -1 && parts[colMap.location]) location = parts[colMap.location];
    } else {
      // Positional exact format: Member Number, NIC, FULL NAME, ADDRESS, POSTAL ADDRESS, GENDER, (LOCATION/DIVISION)
      if (parts.length >= 7) {
        voterNumber = parts[0];
        memberNumber = parts[0];
        nic = parts[1];
        fullName = parts[2];
        address = parts[3];
        postalAddress = parts[4];
        gender = parts[5];
        location = parts[6];
        division = parts[6];
      } else if (parts.length === 6) {
        voterNumber = parts[0];
        memberNumber = parts[0];
        nic = parts[1];
        fullName = parts[2];
        address = parts[3];
        postalAddress = parts[4];
        gender = parts[5];
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
      records.push({ voterNumber, memberNumber, nic, fullName, address, postalAddress, gender, division, location });
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
    let mode: 'append' | 'replace' | 'replace_file' = 'append';

    let totalUploaded = 0;
    const processedFiles: string[] = [];

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      mode = (formData.get('mode') as 'append' | 'replace' | 'replace_file') || 'append';

      const fileList: File[] = [];
      const multi = formData.getAll('files') as File[];
      if (multi && multi.length > 0) {
        fileList.push(...multi.filter(f => f && typeof f.name === 'string' && f.size > 0));
      }
      const single = formData.get('file') as File | null;
      if (single && typeof single.name === 'string' && single.size > 0 && !fileList.some(f => f.name === single.name)) {
        fileList.push(single);
      }

      if (fileList.length === 0) {
        return NextResponse.json({ success: false, error: 'No files provided for upload.' }, { status: 400 });
      }

      // If user selected total replace, clear the whole table first before inserting from the files
      let isFirstFile = true;
      for (const file of fileList) {
        const fileText = await file.text();
        const records = parseVoterCsv(fileText);

        if (records.length > 0) {
          const fileMode = mode === 'replace' ? (isFirstFile ? 'replace' : 'append') : mode;
          await uploadEligibleVoters(records, fileMode, file.name);
          totalUploaded += records.length;
          processedFiles.push(file.name);
          isFirstFile = false;
        }
      }
    } else {
      const body = await req.json();
      mode = body.mode || 'append';
      const fileName = body.fileName || body.file_name || 'electoral_register.csv';
      let records: VoterRecord[] = [];
      if (Array.isArray(body.records)) {
        records = body.records;
      } else if (typeof body.csvText === 'string') {
        records = parseVoterCsv(body.csvText);
      }

      if (records.length > 0) {
        await uploadEligibleVoters(records, mode, fileName);
        totalUploaded += records.length;
        processedFiles.push(fileName);
      }
    }

    if (totalUploaded === 0) {
      return NextResponse.json({
        success: false,
        error: 'No valid voter records found in the uploaded CSV file(s).'
      }, { status: 400 });
    }

    const { getLiveStats } = await import('@/lib/models/stats');
    const stats = await getLiveStats();

    return NextResponse.json({
      success: true,
      uploadedCount: totalUploaded,
      filesCount: processedFiles.length,
      files: processedFiles,
      totalCount: stats.votersCount,
      message: `Successfully processed ${totalUploaded} eligible voters from ${processedFiles.join(', ')}.`
    });
  } catch (err) {
    console.error('Error uploading electoral register files:', err);
    return NextResponse.json({ success: false, error: 'Failed to upload electoral register' }, { status: 500 });
  }
}
