import { NextRequest, NextResponse } from 'next/server';
import { uploadEligibleVoters, VoterRecord } from '@/lib/models/stats';
import { initDatabaseSchema } from '@/lib/db/schema';
import * as XLSX from 'xlsx';

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

async function decodeFileToText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Check UTF-16 LE BOM (FF FE)
  if (buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xfe) {
    const decoder = new TextDecoder('utf-16le');
    return decoder.decode(buffer.subarray(2)).replace(/^\uFEFF/, '').replace(/\0/g, '');
  }
  // Check UTF-16 BE BOM (FE FF)
  if (buffer.length >= 2 && buffer[0] === 0xfe && buffer[1] === 0xff) {
    const decoder = new TextDecoder('utf-16be');
    return decoder.decode(buffer.subarray(2)).replace(/^\uFEFF/, '').replace(/\0/g, '');
  }
  // Check UTF-8 BOM (EF BB BF)
  if (buffer.length >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(buffer.subarray(3)).replace(/^\uFEFF/, '');
  }

  try {
    const utf8Decoder = new TextDecoder('utf-8', { fatal: true });
    return utf8Decoder.decode(buffer).replace(/^\uFEFF/, '');
  } catch {
    try {
      const winDecoder = new TextDecoder('windows-1252');
      return winDecoder.decode(buffer).replace(/^\uFEFF/, '');
    } catch {
      return buffer.toString('utf-8').replace(/^\uFEFF/, '');
    }
  }
}

/**
 * Robust Electoral Register CSV parser supporting exact format:
 * Member Number, NIC, FULL NAME, ADDRESS, POSTAL ADDRESS, GENDER
 */
function parseVoterCsv(text: string): VoterRecord[] {
  const cleanText = (text || '').replace(/^\uFEFF/, '').replace(/\0/g, '');
  const lines = cleanText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
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

/**
 * Robust Electoral Register Excel matrix parser supporting .xlsx / .xls
 */
function parseVoterMatrix(rows: any[][]): VoterRecord[] {
  if (!rows || rows.length === 0) return [];
  const lines = rows.map(r => (Array.isArray(r) ? r : []).map(c => String(c ?? '').trim()));
  const headerRow = lines[0].map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
  const hasHeader = headerRow.some(h => 
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
      voterNumber: headerRow.findIndex(h => h.includes('voter') || h.includes('member') || h.includes('no') || h.includes('reg') || h.includes('id')),
      nic: headerRow.findIndex(h => h.includes('nic') || h.includes('identity')),
      fullName: headerRow.findIndex(h => (h.includes('name') && !h.includes('voter') && !h.includes('member')) || h === 'fullname' || h === 'name'),
      address: headerRow.findIndex(h => h === 'address' || (h.includes('address') && !h.includes('postal'))),
      postalAddress: headerRow.findIndex(h => h.includes('postal') || h.includes('postaddress') || h.includes('mailing')),
      gender: headerRow.findIndex(h => h.includes('gender') || h.includes('sex')),
      division: headerRow.findIndex(h => h.includes('division') || h.includes('polling') || h.includes('ward')),
      location: headerRow.findIndex(h => h.includes('location') || h.includes('district') || h.includes('city') || h.includes('area') || h.includes('town'))
    };

    if (colMap.fullName === -1) {
      colMap.fullName = headerRow.findIndex(h => h.includes('name'));
    }
  }

  const dataRows = hasHeader ? lines.slice(1) : lines;
  const records: VoterRecord[] = [];

  for (const parts of dataRows) {
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

    if (hasHeader && colMap.fullName !== -1) {
      if (colMap.voterNumber !== -1 && parts[colMap.voterNumber]) voterNumber = parts[colMap.voterNumber];
      memberNumber = voterNumber;
      if (colMap.nic !== -1 && parts[colMap.nic]) nic = parts[colMap.nic];
      if (colMap.fullName !== -1 && parts[colMap.fullName]) fullName = parts[colMap.fullName];
      if (colMap.address !== -1 && parts[colMap.address]) address = parts[colMap.address];
      if (colMap.postalAddress !== -1 && parts[colMap.postalAddress]) postalAddress = parts[colMap.postalAddress];
      if (colMap.gender !== -1 && parts[colMap.gender]) gender = parts[colMap.gender];
      if (colMap.division !== -1 && parts[colMap.division]) division = parts[colMap.division];
      if (colMap.location !== -1 && parts[colMap.location]) location = parts[colMap.location];
    } else {
      if (parts.length >= 6) {
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

async function parseVoterRecordsFromFile(file: File): Promise<VoterRecord[]> {
  const name = file.name.toLowerCase();
  if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
    const arrayBuffer = await file.arrayBuffer();
    const wb = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = wb.SheetNames[0];
    if (!sheetName) return [];
    const sheet = wb.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, defval: '' });
    return parseVoterMatrix(rawRows);
  } else {
    const fileText = await decodeFileToText(file);
    return parseVoterCsv(fileText);
  }
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

      // Check if any file contains severe question marks (?) from destructive Excel ANSI export
      for (const file of fileList) {
        const testRecords = await parseVoterRecordsFromFile(file);
        const corruptCount = testRecords.filter(r => (r.fullName || '').includes('???')).length;
        if (corruptCount > 0 && corruptCount >= testRecords.length * 0.4) {
          return NextResponse.json({
            success: false,
            error: `The file "${file.name}" contains question marks (?) instead of Sinhala text. In Microsoft Excel, please save the file as "CSV UTF-8 (Comma delimited)" or upload the Excel workbook (.xlsx) directly.`,
            isEncodingError: true
          }, { status: 400 });
        }
      }

      // If user selected total replace, clear the whole table first before inserting from the files
      let isFirstFile = true;
      for (const file of fileList) {
        const records = await parseVoterRecordsFromFile(file);

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
