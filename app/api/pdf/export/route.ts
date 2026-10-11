import { NextRequest, NextResponse } from 'next/server';
import { getVotersForDownload, getMembersForDownload } from '@/lib/models/stats';
import { initDatabaseSchema } from '@/lib/db/schema';

function escapeHtml(str: any): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function GET(req: NextRequest) {
  try {
    await initDatabaseSchema();
    const { searchParams } = new URL(req.url);

    const moduleType = (searchParams.get('module') || searchParams.get('type') || 'voters').toLowerCase();
    const fileParam = searchParams.get('file') || searchParams.get('location') || 'all';
    const autoPrint = searchParams.get('autoprint') === '1' || searchParams.get('print') === 'true';

    const isVoters = moduleType === 'voters';

    let records: any[] = [];
    if (isVoters) {
      records = await getVotersForDownload(fileParam);
    } else {
      records = await getMembersForDownload(fileParam);
    }

    // Clean display name for the village / file filter
    let villageDisplayName = 'සියලුම ගම්මාන / ප්‍රදේශ (All Villages & Areas)';
    if (fileParam && fileParam.toLowerCase() !== 'all') {
      villageDisplayName = fileParam.replace(/\.[^/.]+$/, "");
    }

    const documentTitle = isVoters 
      ? 'නිල ඡන්ද හිමි සාමාජික නාමලේඛනය (Cooperative Electoral Register)'
      : 'ලියාපදිංචි සාමාජික නාමාවලිය (Registered Members Directory)';

    const totalCount = records.length;
    const printedAt = new Date().toLocaleString('si-LK', {
      timeZone: 'Asia/Colombo',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const rowsHtml = records.map((row, index) => {
      const num = index + 1;
      const idNo = escapeHtml(row.member_number || row.voter_number || '—');
      const nic = escapeHtml(row.nic || '—');
      const fullName = escapeHtml(row.full_name || '—');
      const address = escapeHtml(row.address || '—');
      const postalAddress = escapeHtml(row.postal_address || '—');
      const gender = escapeHtml(row.gender || '—');

      return `
        <tr>
          <td class="col-num">${num}</td>
          <td class="col-mono col-id">${idNo}</td>
          <td class="col-mono col-nic">${nic}</td>
          <td class="col-name">${fullName}</td>
          <td class="col-addr">${address}</td>
          <td class="col-addr">${postalAddress}</td>
          <td class="col-gender">${gender}</td>
        </tr>
      `;
    }).join('');

    const htmlContent = `<!DOCTYPE html>
<html lang="si">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(documentTitle)} - ${escapeHtml(villageDisplayName)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Sinhala:wght@400;500;600;700;800&family=Outfit:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Sinhala:wght@400;500;600;700;800&family=Outfit:wght@400;600;700&display=swap');

    *, *::before, *::after {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      margin: 0;
      padding: 0;
      background: #f1f5f9;
      color: #0f172a;
      font-family: 'Noto Sans Sinhala', 'Iskoola Pota', 'Nirmala UI', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 11px;
      line-height: 1.4;
      -webkit-font-smoothing: antialiased;
    }

    /* Fixed Screen Toolbar */
    .screen-toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: #003399;
      color: #ffffff;
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    .screen-toolbar .title-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .screen-toolbar .badge {
      background: #ffffff;
      color: #003399;
      padding: 4px 10px;
      border-radius: 999px;
      font-weight: 700;
      font-size: 11px;
      letter-spacing: 0.5px;
    }
    .screen-toolbar .actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 8px;
      font-family: inherit;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      border: none;
      transition: all 0.15s ease;
      text-decoration: none;
    }
    .btn-primary {
      background: #f59e0b;
      color: #0f172a;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    }
    .btn-primary:hover {
      background: #d97706;
      color: #ffffff;
    }
    .btn-secondary {
      background: rgba(255, 255, 255, 0.15);
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.25);
    }

    /* Printable Paper Container */
    .paper-container {
      max-width: 1200px;
      margin: 24px auto;
      background: #ffffff;
      padding: 32px 36px;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
      border-radius: 12px;
    }

    /* Official Government / Co-op Header */
    .doc-header {
      border-bottom: 2px solid #003399;
      padding-bottom: 16px;
      margin-bottom: 16px;
    }
    .doc-header-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }
    .doc-branding {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .doc-logo {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      object-fit: contain;
      background: #8a004b;
      padding: 6px 0 2px 0;
      box-shadow: 0 1px 2px rgba(0,0,0,0.08);
    }
    .doc-titles h1 {
      margin: 0;
      font-size: 19px;
      font-weight: 800;
      color: #003399;
      letter-spacing: -0.2px;
    }
    .doc-titles h2 {
      margin: 2px 0 0;
      font-size: 12px;
      font-weight: 600;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .doc-meta-right {
      text-align: right;
      font-size: 10px;
      color: #64748b;
      line-height: 1.5;
    }
    .doc-meta-right strong {
      color: #0f172a;
    }

    /* Document Filter & Details Banner */
    .filter-banner {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-left: 5px solid ${isVoters ? '#059669' : '#003399'};
      padding: 10px 14px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
      flex-wrap: wrap;
      gap: 10px;
    }
    .filter-banner .banner-title {
      font-size: 13px;
      font-weight: 700;
      color: #0f172a;
    }
    .filter-banner .banner-stats {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 11px;
    }
    .filter-pill {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      padding: 3px 8px;
      border-radius: 4px;
      font-weight: 600;
    }
    .filter-pill.village {
      background: ${isVoters ? '#ecfdf5' : '#eff6ff'};
      border-color: ${isVoters ? '#a7f3d0' : '#bfdbfe'};
      color: ${isVoters ? '#065f46' : '#1e40af'};
    }

    /* Data Table */
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10px;
      margin-top: 8px;
    }
    table.data-table thead {
      display: table-header-group;
    }
    table.data-table tr {
      page-break-inside: avoid;
    }
    table.data-table th {
      background: ${isVoters ? '#064e3b' : '#003399'};
      color: #ffffff;
      text-align: left;
      padding: 7px 8px;
      font-weight: 700;
      border: 1px solid ${isVoters ? '#064e3b' : '#003399'};
      white-space: nowrap;
    }
    table.data-table td {
      padding: 5.5px 8px;
      border: 1px solid #cbd5e1;
      vertical-align: top;
      color: #1e293b;
    }
    table.data-table tbody tr:nth-child(even) {
      background-color: #f8fafc;
    }

    .col-num { width: 35px; text-align: center; font-weight: 600; color: #64748b; }
    .col-id { width: 90px; white-space: nowrap; font-weight: 600; color: #003399; }
    .col-nic { width: 95px; white-space: nowrap; font-weight: 600; }
    .col-name { min-width: 160px; font-weight: 600; color: #0f172a; }
    .col-addr { min-width: 150px; color: #334155; }
    .col-gender { width: 65px; text-align: center; }
    .col-mono { font-family: 'Courier New', Courier, monospace; }

    /* Empty state */
    .no-records {
      padding: 30px;
      text-align: center;
      color: #64748b;
      font-size: 13px;
      background: #f8fafc;
      border: 1px dashed #cbd5e1;
      border-radius: 8px;
      margin: 16px 0;
    }

    .doc-footer-note {
      margin-top: 24px;
      padding-top: 10px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 8.5px;
      color: #94a3b8;
    }

    /* Print Styles */
    @media print {
      body {
        background: #ffffff;
        font-size: 9pt;
      }
      .no-print, .screen-toolbar {
        display: none !important;
      }
      .paper-container {
        max-width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        box-shadow: none !important;
        border-radius: 0 !important;
      }
      table.data-table th {
        background: ${isVoters ? '#064e3b' : '#003399'} !important;
        color: #ffffff !important;
      }
      @page {
        size: A4 landscape;
        margin: 10mm 10mm 10mm 10mm;
      }
    }
  </style>
</head>
<body>

  <!-- Screen Toolbar -->
  <div class="screen-toolbar no-print">
    <div class="title-info">
      <span class="badge">PDF EXPORT</span>
      <span style="font-weight: 700; font-size: 13px;">${escapeHtml(documentTitle)}</span>
      <span style="opacity: 0.8; font-size: 11px;">• ගම/ප්‍රදේශය: <strong>${escapeHtml(villageDisplayName)}</strong></span>
    </div>
    <div class="actions">
      <span style="font-size: 11px; opacity: 0.9; margin-right: 8px;">වාර්තා: <strong>${totalCount}</strong></span>
      <button onclick="window.print()" class="btn btn-primary" title="Print or Save as PDF">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
        <span>Save as PDF / මුද්‍රණය කරන්න</span>
      </button>
      <button onclick="window.close()" class="btn btn-secondary" title="Close window">
        <span>වසන්න (Close)</span>
      </button>
    </div>
  </div>

  <!-- Printable Paper Document -->
  <div class="paper-container">

    <!-- Document Header -->
    <header class="doc-header">
      <div class="doc-header-top">
        <div class="doc-branding">
          <img src="/Logo_new.jpeg" alt="MPCS Emblem" class="doc-logo" onerror="this.style.display='none'">
          <div class="doc-titles">
            <h1>පඬුවස්නුවර විවිධ සේවා සමුපකාර සමිතිය</h1>
            <h2>Panduwasnuwara Multi-Purpose Co-operative Society Ltd.</h2>
          </div>
        </div>
        <div class="doc-meta-right">
          <div>ලියාපදිංචි අංකය: <strong>කු/235</strong></div>
          <div>ලිපිනය: <strong>පඬුවස්නුවර, හෙට්ටිපොළ</strong></div>
          <div>දුරකථන: <strong>037-2291012</strong></div>
          <div>මුද්‍රිත දිනය: <strong>${escapeHtml(printedAt)}</strong></div>
        </div>
      </div>
    </header>

    <!-- Document Info & Village Filter Banner -->
    <div class="filter-banner">
      <div>
        <div class="banner-title">${escapeHtml(documentTitle)}</div>
        <div style="font-size: 10px; color: #64748b; margin-top: 2px;">
          ${isVoters 
            ? 'සමුපකාර මැතිවරණ සහ ඡන්ද විමසීම් සඳහා සහතික කරන ලද නිල ඡන්ද හිමි නාමාවලිය' 
            : 'සමිතියේ සාමාජික අයිතිවාසිකම් සහ ප්‍රතිලාභ සඳහා ලියාපදිංචි නිල සාමාජික නාමාවලිය'}
        </div>
      </div>
      <div class="banner-stats">
        <div>තෝරාගත් ගම / ප්‍රදේශය: <span class="filter-pill village">${escapeHtml(villageDisplayName)}</span></div>
        <div>මුළු වාර්තා ගණන: <span class="filter-pill"><strong>${totalCount}</strong></span></div>
      </div>
    </div>

    <!-- Data Table -->
    ${totalCount === 0 ? `
      <div class="no-records">
        මෙම තෝරාගත් ගම / ප්‍රදේශය (${escapeHtml(villageDisplayName)}) සඳහා දත්ත වාර්තා කිසිවක් හමු නොවීය.
      </div>
    ` : `
      <table class="data-table">
        <thead>
          <tr>
            <th class="col-num">#</th>
            <th class="col-id">${isVoters ? 'සාමාජික / ඡන්ද අංකය' : 'සාමාජික අංකය'}</th>
            <th class="col-nic">ජා.හැ. අංකය (NIC)</th>
            <th class="col-name">සම්පූර්ණ නම (Full Name)</th>
            <th class="col-addr">ලිපිනය (Address)</th>
            <th class="col-addr">තැපැල් ලිපිනය (Postal Address)</th>
            <th class="col-gender">ස්ත්‍රී/පුරුෂ</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    `}

    <!-- Print Footer Note -->
    <div class="doc-footer-note">
      <span>පඬුවස්නුවර විවිධ සේවා සමුපකාර සමිතියේ නිල දත්ත පද්ධතිය මඟින් ස්වයංක්‍රීයව ජනනය කරන ලද ලේඛනයකි.</span>
      <span>පිටුව: <span class="page-number"></span> • මුද්‍රිත දිනය: ${escapeHtml(printedAt)}</span>
    </div>

  </div>

  <script>
    // Ensure all complex Sinhala fonts are 100% loaded before invoking print
    window.addEventListener('DOMContentLoaded', function() {
      if (document.fonts) {
        document.fonts.ready.then(function() {
          ${autoPrint ? `setTimeout(function() { window.print(); }, 400);` : ''}
        });
      } else {
        ${autoPrint ? `setTimeout(function() { window.print(); }, 600);` : ''}
      }
    });
  </script>
</body>
</html>`;

    return new NextResponse(htmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    });
  } catch (error) {
    console.error('Error generating PDF export document:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate PDF export report' },
      { status: 500 }
    );
  }
}
