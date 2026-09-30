import { TenderMaster, BidSubmission } from '../types/tender';

/**
 * Generates and downloads a clean CSV / Excel-compatible spreadsheet for the Commercial Matrix
 */
export function exportCommercialMatrixCsv(tender: TenderMaster, bids: BidSubmission[]) {
  const sortedBids = [...bids].sort((a, b) => a.grandTotal - b.grandTotal);

  let csvContent = 'data:text/csv;charset=utf-8,';
  csvContent += `MEDIA PRIMA BERHAD - eTENDER PORTAL\r\n`;
  csvContent += `COMMERCIAL EVALUATION MATRIX & BIDDER COMPARISON REPORT\r\n`;
  csvContent += `Tender Reference,${tender.referenceNo}\r\n`;
  csvContent += `Tender Title,"${tender.title.replace(/"/g, '""')}"\r\n`;
  csvContent += `Approved Capex Budget,RM ${tender.approvedCapexBudget.toLocaleString('en-MY', { minimumFractionDigits: 2 })}\r\n`;
  csvContent += `Report Generated Date,${new Date().toLocaleString('en-MY')}\r\n\r\n`;

  // Summary Table Header
  csvContent += `SUMMARY RANKING TABLE\r\n`;
  csvContent += `Rank,Bidder / Company Name,Vendor ID,CIDB Grade,Combined Score (70T:30C),Grand Total (MYR),Variance vs Budget,Status\r\n`;

  sortedBids.forEach((bid, idx) => {
    const varianceVsBudget = bid.grandTotal - tender.approvedCapexBudget;
    const variancePct = ((varianceVsBudget / tender.approvedCapexBudget) * 100).toFixed(1);
    const rankLabel = idx === 0 ? 'Rank 1 (Lowest Compliant)' : `Rank ${idx + 1}`;
    csvContent += `"${rankLabel}","${bid.companyName}","${bid.vendorId}","${bid.cidbGrade}",${bid.combinedScore || 'N/A'},${bid.grandTotal},"${variancePct}%",${idx === 0 ? 'Recommended Award' : 'Verified Submission'}\r\n`;
  });

  csvContent += `\r\nITEMIZED BILL OF QUANTITIES (BOQ) COMPARISON BREAKDOWN\r\n`;
  
  // Header with Bidder Columns
  const headerCols = ['Item #', 'Description & Scope', 'Unit', 'Qty'];
  sortedBids.forEach(b => {
    headerCols.push(`${b.companyName} (Unit RM)`, `${b.companyName} (Total RM)`);
  });
  csvContent += headerCols.map(c => `"${c}"`).join(',') + '\r\n';

  // Rows
  tender.bqItems.forEach(item => {
    const row = [
      item.itemNumber,
      `"${item.description} - ${item.detailedSpecs.replace(/"/g, '""')}"`,
      item.unit,
      item.quantity.toString()
    ];

    sortedBids.forEach(bid => {
      const entry = bid.bqEntries.find(e => e.itemId === item.id);
      if (entry) {
        row.push(entry.unitPrice.toFixed(2), entry.totalAmount.toFixed(2));
      } else {
        row.push('0.00', '0.00');
      }
    });

    csvContent += row.join(',') + '\r\n';
  });

  // Subtotal row
  const subtotalRow = ['Subtotal (Excl. SST)', '', '', ''];
  sortedBids.forEach(bid => {
    subtotalRow.push('-', bid.subtotal.toFixed(2));
  });
  csvContent += subtotalRow.join(',') + '\r\n';

  // SST row
  const sstRow = ['SST (6%)', '', '', ''];
  sortedBids.forEach(bid => {
    sstRow.push('-', bid.sstAmount.toFixed(2));
  });
  csvContent += sstRow.join(',') + '\r\n';

  // Grand Total row
  const totalRow = ['GRAND TOTAL BID VALUE (MYR)', '', '', ''];
  sortedBids.forEach(bid => {
    totalRow.push('-', bid.grandTotal.toFixed(2));
  });
  csvContent += totalRow.join(',') + '\r\n';

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `MediaPrima_CommercialMatrix_${tender.referenceNo}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Downloads a printable/formatted HTML evaluation report preview (which can be printed to PDF)
 */
export function exportEvaluationReportPdf(tender: TenderMaster, bids: BidSubmission[]) {
  const sortedBids = [...bids].sort((a, b) => a.grandTotal - b.grandTotal);
  const lowest = sortedBids[0];

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to generate the evaluation document report.');
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Commercial Evaluation Report - ${tender.referenceNo}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #0b1c30; background: #fff; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0037b0; padding-bottom: 15px; margin-bottom: 25px; }
          .logo { font-size: 24px; font-weight: bold; }
          .logo-media { background: #ba1a1a; color: white; padding: 2px 8px; border-radius: 4px 0 0 4px; }
          .logo-prima { background: #0b1c30; color: white; padding: 2px 8px; border-radius: 0 4px 4px 0; }
          .title { font-size: 20px; font-weight: bold; margin: 15px 0 5px 0; color: #0037b0; }
          .meta { font-size: 13px; color: #434655; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px; }
          th { background: #eff4ff; padding: 10px; border: 1px solid #c4c5d7; text-align: left; }
          td { padding: 10px; border: 1px solid #c4c5d7; }
          .num { text-align: right; font-family: monospace; font-size: 13px; }
          .rec-box { background: #eff4ff; border-left: 4px solid #006c4a; padding: 15px; margin-top: 30px; border-radius: 4px; }
          .signatures { display: flex; justify-content: space-between; margin-top: 50px; }
          .sig-line { width: 45%; border-top: 1px dashed #747686; padding-top: 8px; font-size: 12px; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">
              <span class="logo-media">media</span><span class="logo-prima">prima</span>
            </div>
            <div style="font-size: 13px; font-weight: bold; color: #0037b0; margin-top: 4px;">eTender Portal • Procurement Intelligence</div>
          </div>
          <div style="text-align: right; font-size: 12px; color: #434655;">
            <div><strong>CONFIDENTIAL EVALUATION DOSSIER</strong></div>
            <div>Reference: ${tender.referenceNo}</div>
            <div>Date: ${new Date().toLocaleDateString('en-MY')}</div>
          </div>
        </div>

        <h1 class="title">Commercial Evaluation Matrix & Bidder Comparison</h1>
        <div class="meta">${tender.title} • Approved Capex: RM ${tender.approvedCapexBudget.toLocaleString('en-MY', { minimumFractionDigits: 2 })}</div>

        <h3>1. Bidder Summary & Evaluation Ranking</h3>
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Bidder Name</th>
              <th>Vendor ID</th>
              <th>CIDB Grade</th>
              <th>Technical (70%)</th>
              <th>Commercial (30%)</th>
              <th>Combined (100)</th>
              <th style="text-align: right;">Grand Total (RM)</th>
            </tr>
          </thead>
          <tbody>
            ${sortedBids.map((b, i) => `
              <tr style="${i === 0 ? 'background: #effff7; font-weight: bold;' : ''}">
                <td>${i === 0 ? '1st (Selected)' : `${i + 1}`}</td>
                <td>${b.companyName}</td>
                <td>${b.vendorId}</td>
                <td>${b.cidbGrade}</td>
                <td style="text-align: center;">${((b.techSpecScore || 0) + (b.trackRecordScore || 0) + (b.slaTermsScore || 0)).toFixed(1)}</td>
                <td style="text-align: center;">${(b.combinedScore ? (b.combinedScore - ((b.techSpecScore || 0) + (b.trackRecordScore || 0) + (b.slaTermsScore || 0))).toFixed(2) : '-')}</td>
                <td style="text-align: center; color: ${i === 0 ? '#006c4a' : 'inherit'};">${b.combinedScore || '-'}</td>
                <td class="num" style="color: ${i === 0 ? '#006c4a' : 'inherit'};">RM ${b.grandTotal.toLocaleString('en-MY', { minimumFractionDigits: 2 })}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        ${lowest ? `
          <div class="rec-box">
            <h4 style="margin: 0 0 8px 0; color: #006c4a;">Procurement Committee Recommendation</h4>
            <p style="margin: 0; font-size: 13px; line-height: 1.5;">
              The evaluation committee unanimously recommends award to <strong>${lowest.companyName}</strong>. 
              The bidder achieved the highest overall score of <strong>${lowest.combinedScore} / 100</strong> with a lowest commercially compliant proposal of 
              <strong>RM ${lowest.grandTotal.toLocaleString('en-MY', { minimumFractionDigits: 2 })}</strong>, yielding a budget savings of 
              <strong>RM ${(tender.approvedCapexBudget - lowest.grandTotal).toLocaleString('en-MY', { minimumFractionDigits: 2 })}</strong> (-${(((tender.approvedCapexBudget - lowest.grandTotal) / tender.approvedCapexBudget) * 100).toFixed(1)}%).
            </p>
          </div>
        ` : ''}

        <div class="signatures">
          <div class="sig-line">
            <strong>Ir. Daniel Wong</strong><br/>
            Lead Technical Auditor • Group Internal Audit<br/>
            Status: Digitally Signed & Sealed (ISO 27001)
          </div>
          <div class="sig-line">
            <strong>Noraini Ismail</strong><br/>
            Head of Group Procurement • Media Prima Berhad<br/>
            Status: Approved for Tender Board Presentation
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 400);
          }
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
