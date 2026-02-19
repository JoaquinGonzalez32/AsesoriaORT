export interface ChartData {
  title: string;
  data: { name: string; value: number; color?: string }[];
  type: 'bar' | 'bar-horizontal' | 'pie';
}

/* ── Constantes de diseño ───────────────────────────────────── */
const W = 720;
const PAD = 32;
const TITLE_H = 28;
const GAP_TITLE = 12;
const BAR_H = 22;
const BAR_GAP = 8;
const LABEL_W = 120;
const PIE_R = 70;
const LEG_DOT = 7;
const LEG_LINE = 20;
const LEG_GAP = 16;
const SECTION_GAP = 40;
const COLORS_FALLBACK = [
  '#2563eb','#7c3aed','#0891b2','#059669','#d97706',
  '#dc2626','#4f46e5','#0d9488','#ca8a04','#be185d',
];

/* ── Helpers ────────────────────────────────────────────────── */
function color(d: { color?: string }, i: number) {
  return d.color || COLORS_FALLBACK[i % COLORS_FALLBACK.length];
}

function sectionHeight(c: ChartData): number {
  const legendRows = Math.ceil(c.data.length / 3);
  if (c.type === 'pie') {
    return TITLE_H + GAP_TITLE + PIE_R * 2 + 20 + legendRows * LEG_LINE + LEG_GAP;
  }
  if (c.type === 'bar-horizontal') {
    return TITLE_H + GAP_TITLE + c.data.length * (BAR_H + BAR_GAP) + legendRows * LEG_LINE + LEG_GAP;
  }
  // bar vertical
  const chartH = 140;
  return TITLE_H + GAP_TITLE + chartH + 24 + legendRows * LEG_LINE + LEG_GAP;
}

function truncate(ctx: CanvasRenderingContext2D, text: string, maxW: number): string {
  if (ctx.measureText(text).width <= maxW) return text;
  while (text.length > 0 && ctx.measureText(text + '…').width > maxW) text = text.slice(0, -1);
  return text + '…';
}

/* ── Dibujar gráficos ───────────────────────────────────────── */
function drawTitle(ctx: CanvasRenderingContext2D, title: string, x: number, y: number) {
  ctx.font = '700 15px system-ui, sans-serif';
  ctx.fillStyle = '#111827';
  ctx.textBaseline = 'top';
  ctx.fillText(title, x, y);
  // línea decorativa
  ctx.fillStyle = '#2563eb';
  ctx.fillRect(x, y + TITLE_H - 4, 28, 3);
}

function drawLegend(ctx: CanvasRenderingContext2D, data: ChartData['data'], x: number, y: number) {
  ctx.font = '600 11px system-ui, sans-serif';
  ctx.textBaseline = 'top';
  const colW = (W - PAD * 2) / 3;
  data.forEach((d, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const lx = x + col * colW;
    const ly = y + row * LEG_LINE;
    // dot
    ctx.fillStyle = color(d, i);
    ctx.beginPath();
    ctx.arc(lx + LEG_DOT / 2, ly + LEG_DOT / 2 + 2, LEG_DOT / 2, 0, Math.PI * 2);
    ctx.fill();
    // text
    ctx.fillStyle = '#6b7280';
    ctx.fillText(`${d.name}: ${d.value}`, lx + LEG_DOT + 6, ly);
  });
}

function drawBarHorizontal(ctx: CanvasRenderingContext2D, chart: ChartData, x: number, y: number) {
  const maxVal = Math.max(...chart.data.map((d) => d.value), 1);
  const barArea = W - PAD * 2 - LABEL_W - 60;

  chart.data.forEach((d, i) => {
    const by = y + i * (BAR_H + BAR_GAP);
    // label
    ctx.font = '600 11px system-ui, sans-serif';
    ctx.fillStyle = '#374151';
    ctx.textBaseline = 'top';
    ctx.fillText(truncate(ctx, d.name, LABEL_W - 8), x, by + 4);
    // bar
    const bw = (d.value / maxVal) * barArea;
    ctx.fillStyle = color(d, i);
    ctx.beginPath();
    ctx.roundRect(x + LABEL_W, by, Math.max(bw, 4), BAR_H, 4);
    ctx.fill();
    // value
    ctx.fillStyle = '#6b7280';
    ctx.font = '700 11px system-ui, sans-serif';
    ctx.fillText(String(d.value), x + LABEL_W + bw + 8, by + 4);
  });
}

function drawBarVertical(ctx: CanvasRenderingContext2D, chart: ChartData, x: number, y: number) {
  const chartH = 140;
  const maxVal = Math.max(...chart.data.map((d) => d.value), 1);
  const count = chart.data.length;
  const totalW = W - PAD * 2;
  const barW = Math.min(36, (totalW - count * 6) / count);
  const spacing = (totalW - barW * count) / (count + 1);

  // eje horizontal
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y + chartH);
  ctx.lineTo(x + totalW, y + chartH);
  ctx.stroke();

  chart.data.forEach((d, i) => {
    const bx = x + spacing + i * (barW + spacing);
    const bh = (d.value / maxVal) * (chartH - 20);
    const by = y + chartH - bh;

    ctx.fillStyle = color(d, i);
    ctx.beginPath();
    ctx.roundRect(bx, by, barW, bh, [4, 4, 0, 0]);
    ctx.fill();

    // value encima
    ctx.fillStyle = '#374151';
    ctx.font = '700 10px system-ui, sans-serif';
    ctx.textBaseline = 'bottom';
    ctx.textAlign = 'center';
    ctx.fillText(String(d.value), bx + barW / 2, by - 4);

    // label abajo
    ctx.fillStyle = '#9ca3af';
    ctx.font = '600 9px system-ui, sans-serif';
    ctx.textBaseline = 'top';
    ctx.fillText(truncate(ctx, d.name, barW + spacing - 4), bx + barW / 2, y + chartH + 6);
    ctx.textAlign = 'left';
  });
}

function drawPie(ctx: CanvasRenderingContext2D, chart: ChartData, cx: number, cy: number) {
  const total = chart.data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return;
  let startAngle = -Math.PI / 2;

  chart.data.forEach((d, i) => {
    const sliceAngle = (d.value / total) * Math.PI * 2;
    ctx.fillStyle = color(d, i);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, PIE_R, startAngle, startAngle + sliceAngle);
    ctx.closePath();
    ctx.fill();

    // porcentaje dentro del slice
    const midAngle = startAngle + sliceAngle / 2;
    const labelR = PIE_R * 0.6;
    const lx = cx + Math.cos(midAngle) * labelR;
    const ly = cy + Math.sin(midAngle) * labelR;
    const pct = Math.round((d.value / total) * 100);
    if (pct >= 5) {
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 12px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${pct}%`, lx, ly);
      ctx.textAlign = 'left';
    }

    startAngle += sliceAngle;
  });
}

/* ── Exports ────────────────────────────────────────────────── */

export function exportChartsAsImage(charts: ChartData[], filename: string) {
  if (charts.length === 0) return;

  const totalH = charts.reduce((h, c) => h + sectionHeight(c), 0) + SECTION_GAP * (charts.length - 1) + PAD * 2;
  const scale = 2;
  const canvas = document.createElement('canvas');
  canvas.width = W * scale;
  canvas.height = totalH * scale;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(scale, scale);

  // fondo
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, totalH);

  let curY = PAD;

  charts.forEach((chart, ci) => {
    drawTitle(ctx, chart.title, PAD, curY);
    curY += TITLE_H + GAP_TITLE;

    if (chart.type === 'bar-horizontal') {
      drawBarHorizontal(ctx, chart, PAD, curY);
      curY += chart.data.length * (BAR_H + BAR_GAP);
    } else if (chart.type === 'bar') {
      drawBarVertical(ctx, chart, PAD, curY);
      curY += 140 + 24;
    } else if (chart.type === 'pie') {
      const cx = W / 2;
      const cy = curY + PIE_R;
      drawPie(ctx, chart, cx, cy);
      curY += PIE_R * 2 + 20;
    }

    curY += LEG_GAP;
    drawLegend(ctx, chart.data, PAD, curY);
    const legendRows = Math.ceil(chart.data.length / 3);
    curY += legendRows * LEG_LINE;

    // separador entre secciones
    if (ci < charts.length - 1) {
      curY += SECTION_GAP / 2;
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(PAD, curY);
      ctx.lineTo(W - PAD, curY);
      ctx.stroke();
      curY += SECTION_GAP / 2;
    }
  });

  // descargar
  const link = document.createElement('a');
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.png`;
  link.href = canvas.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportChartsAsCSV(charts: ChartData[], filename: string) {
  if (charts.length === 0) return;

  const lines: string[] = [];

  charts.forEach((chart, i) => {
    if (i > 0) lines.push('');
    lines.push(chart.title);
    lines.push('Nombre,Cantidad');
    chart.data.forEach((d) => {
      lines.push(`"${d.name}",${d.value}`);
    });
  });

  const csv = lines.join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
