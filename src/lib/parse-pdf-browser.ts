import * as pdfjsLib from 'pdfjs-dist';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

// ##############################
// Constants
// ##############################

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const COL = {
  bookingDate: { min: 40, max: 100 },
  opDate: { min: 100, max: 148 },
  description: { min: 148, max: 455 },
  amount: { min: 455, max: 505 },
  balance: { min: 505, max: Infinity },
} as const;

// ##############################
// Types
// ##############################

interface Item {
  x: number;
  y: number;
  str: string;
}

interface Row {
  y: number;
  items: Item[];
}

export interface Transaction {
  bookingDate: string;
  operationDate: string;
  description: string;
  amount: number;
  balanceAfter: number;
}

export interface Summary {
  credits: { count: number; total: number };
  debits: { count: number; total: number };
  total: { count: number; net: number };
  openingBalance: number;
  closingBalance: number;
}

export interface BankStatement {
  summary: Summary;
  transactions: Transaction[];
}

// ##############################
// Utilities
// ##############################

function parsePolishNumber(str: string): number {
  return parseFloat(str.replace(/\s+/g, '').replace(',', '.'));
}

function groupIntoRows(items: Item[]): Row[] {
  const buckets = new Map<number, Item[]>();

  for (const item of items) {
    if (!item.str.trim()) continue;
    let key = item.y;
    for (const k of buckets.keys()) {
      if (Math.abs(k - item.y) <= 2) { key = k; break; }
    }
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(item);
  }

  return [...buckets.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([y, items]) => ({ y, items: items.sort((a, b) => a.x - b.x) }));
}

function isTransactionRow(row: Row): boolean {
  const hasBk = row.items.some(i => i.x >= COL.bookingDate.min && i.x < COL.bookingDate.max && DATE_RE.test(i.str.trim()));
  const hasOp = row.items.some(i => i.x >= COL.opDate.min && i.x < COL.opDate.max && DATE_RE.test(i.str.trim()));
  return hasBk && hasOp;
}

function isStructuralRow(row: Row): boolean {
  return row.items.some(i =>
    i.str.includes('Strona') ||
    i.str.trim() === 'Kwota' ||
    i.str.trim() === 'Opis operacji' ||
    i.str.includes('Saldo ko')
  );
}

// ##############################
// Parsing
// ##############################

function parseSummary(items: Item[]): Summary {
  const text = items.map(i => i.str).join(' ').replace(/\s+/g, ' ');

  const creditsMatch = text.match(/Uznania\s+(\d+)\s+([\d ]+,\d{2})/);
  const debitsMatch  = text.match(/Obci(?:ą|a)żenia\s+(\d+)\s+([\d ]+,\d{2})/);
  const totalMatch   = text.match(/Łącznie\s+(\d+)\s+([\d ]+,\d{2})/);
  const openingMatch = text.match(/Saldo pocz(?:ą|a)tkowe:\s*([\d ]+,\d{2})/);
  const closingMatch = text.match(/Saldo ko(?:ń|n)cowe:\s*([\d ]+,\d{2})/);

  return {
    credits:        { count: creditsMatch ? parseInt(creditsMatch[1]) : 0, total: creditsMatch ? parsePolishNumber(creditsMatch[2]) : 0 },
    debits:         { count: debitsMatch  ? parseInt(debitsMatch[1])  : 0, total: debitsMatch  ? parsePolishNumber(debitsMatch[2])  : 0 },
    total:          { count: totalMatch   ? parseInt(totalMatch[1])   : 0, net:   totalMatch   ? parsePolishNumber(totalMatch[2])   : 0 },
    openingBalance: openingMatch ? parsePolishNumber(openingMatch[1]) : 0,
    closingBalance: closingMatch ? parsePolishNumber(closingMatch[1]) : 0,
  };
}

function parseTransactions(rows: Row[]): Transaction[] {
  const starts: number[] = rows.reduce<number[]>((acc, row, i) => {
    if (isTransactionRow(row)) acc.push(i);
    return acc;
  }, []);

  return starts.map((startIdx, t) => {
    const txRows = rows.slice(startIdx, starts[t + 1] ?? rows.length);
    const [mainRow, ...contRows] = txRows;

    const dates = mainRow.items
      .filter(i => DATE_RE.test(i.str.trim()))
      .sort((a, b) => a.x - b.x);
    const bookingDate   = dates[0]?.str.trim() ?? '';
    const operationDate = dates[1]?.str.trim() ?? '';

    const amountItem = mainRow.items.find(i => i.x >= COL.amount.min && i.x < COL.amount.max);
    const amount = amountItem ? parsePolishNumber(amountItem.str) : 0;

    const balComplete = mainRow.items.find(i => i.x >= COL.balance.min && i.str.includes(','));
    const balInt = !balComplete
      ? mainRow.items.find(i => i.x >= COL.balance.min && /^\d+$/.test(i.str.trim()))
      : null;
    const balDec = !balComplete
      ? contRows.flatMap(r => r.items).find(i => i.x >= COL.balance.min && i.str.includes(','))
      : null;

    let balanceAfter = 0;
    if (balComplete) {
      balanceAfter = parsePolishNumber(balComplete.str);
    } else if (balInt && balDec) {
      balanceAfter = parsePolishNumber(`${balInt.str.trim()} ${balDec.str.trim()}`);
    } else if (balDec) {
      balanceAfter = parsePolishNumber(balDec.str.trim());
    }

    const description = txRows
      .filter(r => !isStructuralRow(r))
      .flatMap(r => r.items)
      .filter(i => i.x >= COL.description.min && i.x < COL.description.max)
      .map(i => i.str.trim())
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    return { bookingDate, operationDate, description, amount, balanceAfter };
  });
}

// ##############################
// Export
// ##############################

export async function parsePdfBrowser(buffer: ArrayBuffer): Promise<BankStatement> {
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

  const allItems: Item[] = [];
  let yOffset = 0;

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.0 });
    const textContent = await page.getTextContent();

    for (const item of textContent.items) {
      const textItem = item as TextItem;
      if (!textItem.str) continue;
      const x = textItem.transform[4];
      // flip y from bottom-up (PDF) to top-down to match pdf.js-extract output
      const y = viewport.height - textItem.transform[5];
      allItems.push({ x, y: y + yOffset, str: textItem.str });
    }

    yOffset += viewport.height + 10;
  }

  return {
    summary: parseSummary(allItems),
    transactions: parseTransactions(groupIntoRows(allItems)),
  };
}
