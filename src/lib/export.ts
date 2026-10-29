/** Baixa uma planilha CSV (abre no Excel com acentos, separada por ponto e vírgula). */
export function downloadCsv(fileName: string, header: string[], rows: (string | number)[][]) {
  const cell = (value: string | number) => {
    const text = String(value ?? "");
    return /[";\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const content = [header, ...rows].map((row) => row.map(cell).join(";")).join("\r\n");
  const blob = new Blob([`﻿${content}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);

/** Abre o documento (atestado, receita) numa janela própria e chama a impressão. */
export function printDocument({ clinic, title, body, footer }: { clinic: string; title: string; body: string; footer: string }) {
  const page = window.open("", "_blank", "width=800,height=900");
  if (!page) return false;
  page.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title>
<style>body{font-family:Arial,sans-serif;color:#1e2e3d;max-width:680px;margin:48px auto;padding:0 24px;line-height:1.6}
h1{font-size:14px;letter-spacing:2px;text-transform:uppercase;color:#5b6b7a;margin:0}h2{font-size:24px;margin:32px 0 24px}
p{white-space:pre-wrap;font-size:16px}footer{margin-top:72px;border-top:1px solid #1e2e3d;padding-top:8px;text-align:center;font-size:14px}</style>
</head><body><h1>${escapeHtml(clinic)}</h1><h2>${escapeHtml(title)}</h2><p>${escapeHtml(body)}</p><footer>${escapeHtml(footer)}</footer>
<script>window.onload=function(){window.print()}</script></body></html>`);
  page.document.close();
  return true;
}
