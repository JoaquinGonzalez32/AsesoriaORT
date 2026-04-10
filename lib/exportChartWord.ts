import { BarItem } from '../components/informes/reportSections';

const W = 600;
const PAD = 16;
const BAR_H = 20;
const BAR_GAP = 6;
const LABEL_W = 120;

function truncate(ctx: CanvasRenderingContext2D, text: string, maxW: number): string {
  if (ctx.measureText(text).width <= maxW) return text;
  while (text.length > 0 && ctx.measureText(text + '…').width > maxW) text = text.slice(0, -1);
  return text + '…';
}

export function renderBarChartToBase64(items: BarItem[], _title: string): string | null {
  if (items.length === 0) return null;

  const totalH = items.length * (BAR_H + BAR_GAP) + PAD * 2;
  const scale = 2;
  const canvas = document.createElement('canvas');
  canvas.width = W * scale;
  canvas.height = totalH * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.scale(scale, scale);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, totalH);

  const maxVal = Math.max(...items.map(i => i.value), 1);
  const barArea = W - PAD * 2 - LABEL_W - 50;

  items.forEach((item, i) => {
    const y = PAD + i * (BAR_H + BAR_GAP);

    // Label
    ctx.font = '600 11px system-ui, sans-serif';
    ctx.fillStyle = '#374151';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'right';
    ctx.fillText(truncate(ctx, item.label, LABEL_W - 8), PAD + LABEL_W - 8, y + 4);

    // Bar
    const bw = (item.value / maxVal) * barArea;
    ctx.fillStyle = item.color;
    ctx.beginPath();
    ctx.roundRect(PAD + LABEL_W, y, Math.max(bw, 4), BAR_H, 4);
    ctx.fill();

    // Value
    ctx.fillStyle = '#6b7280';
    ctx.font = '700 11px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(String(item.value), PAD + LABEL_W + bw + 6, y + 4);
  });

  // Extract base64 (strip the data:image/png;base64, prefix)
  const dataUrl = canvas.toDataURL('image/png');
  return dataUrl.split(',')[1] || null;
}
