// Utility functions for exporting data to CSV (Excel compatible) and formatted PDF printing

export function exportToCSV(filename: string, headers: string[], rows: (string | number | undefined | null)[][]) {
  const processCell = (cell: any) => {
    if (cell === null || cell === undefined) return '""';
    const str = String(cell).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvContent =
    '\uFEFF' + // UTF-8 BOM for Microsoft Excel
    [
      headers.map(processCell).join(';'),
      ...rows.map(row => row.map(processCell).join(';'))
    ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function printFormattedReport(title: string, subtitle: string, headers: string[], rows: (string | number)[][], summaryCards?: { label: string; value: string }[]) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>${title} - Sra. Bela Mulher</title>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; margin: 20px; color: #111; background: #fff; }
        .header { border-bottom: 2px solid #d97706; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
        .title { font-size: 20px; font-weight: bold; color: #78350f; margin: 0; }
        .subtitle { font-size: 12px; color: #666; margin-top: 4px; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 20px; }
        .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; background: #fafafa; }
        .card-label { font-size: 10px; font-weight: bold; color: #6b7280; text-transform: uppercase; }
        .card-val { font-size: 16px; font-weight: bold; color: #92400e; margin-top: 4px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 10px; }
        th { background: #fef3c7; color: #78350f; text-align: left; padding: 8px 12px; font-weight: bold; border-bottom: 2px solid #f59e0b; }
        td { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; }
        tr:nth-child(even) { background: #f9fafb; }
        .footer { margin-top: 30px; font-size: 10px; color: #9ca3af; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 10px; }
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div className="header">
        <div>
          <h1 class="title">${title}</h1>
          <p class="subtitle">${subtitle} • Gerado em ${new Date().toLocaleString('pt-BR')}</p>
        </div>
        <div style="text-align: right;">
          <strong style="color: #d97706; font-size: 14px;">SRA. BELA MULHER</strong><br>
          <span style="font-size: 10px; color: #6b7280;">Salão & Estética Luxo</span>
        </div>
      </div>

      ${summaryCards && summaryCards.length > 0 ? `
        <div class="summary-grid">
          ${summaryCards.map(c => `
            <div class="card">
              <div class="card-label">${c.label}</div>
              <div class="card-val">${c.value}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <table>
        <thead>
          <tr>
            ${headers.map(h => `<th>${h}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${rows.map(r => `
            <tr>
              ${r.map(cell => `<td>${cell !== null && cell !== undefined ? cell : '-'}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="footer">
        Relatório Oficial Emitido pelo Sistema Integrado Sra. Bela Mulher
      </div>

      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
