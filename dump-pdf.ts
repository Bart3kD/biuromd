import * as pdfjsLib from 'pdfjs-dist';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';

pdfjsLib.GlobalWorkerOptions.workerSrc = '';

const buf = await Bun.file('./src/assets/document.pdf').arrayBuffer();
const pdf = await pdfjsLib.getDocument({ data: buf, useWorkerFetch: false, isEvalSupported: false, useSystemFonts: true }).promise;

for (let pageNum = 1; pageNum <= 2; pageNum++) {
  const page = await pdf.getPage(pageNum);
  const viewport = page.getViewport({ scale: 1.0 });
  const tc = await page.getTextContent();
  console.log(`\n=== PAGE ${pageNum} (height=${viewport.height}) ===`);
  for (const item of tc.items) {
    const t = item as TextItem;
    if (t.str?.trim()) {
      const x = +t.transform[4].toFixed(1);
      const y = +(viewport.height - t.transform[5]).toFixed(1);
      console.log(`x=${x} y=${y} str="${t.str}"`);
    }
  }
}
