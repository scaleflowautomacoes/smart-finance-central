import { format } from 'date-fns';
import { inferPjCategory, inferPjTransactionDirection } from '@/lib/pjCategorization';

export type StatementWorkspace = 'PF' | 'PJ';
export type StatementDirection = 'entrada' | 'saida';
export type StatementMovementType = 'pix' | 'debito' | 'boleto' | 'transferencia' | 'reembolso' | 'tarifa' | 'outros';

export interface ParsedStatementMovement {
  statementDate: string;
  pageNumber: number;
  lineIndex: number;
  direction: StatementDirection;
  movementType: StatementMovementType;
  description: string;
  counterpartyName: string | null;
  counterpartyDocument: string | null;
  counterpartyBank: string | null;
  amount: number;
  runningBalance: number | null;
  rawText: string;
  suggestedCategory: string;
  confidence: number;
}

export interface ParsedStatementImport {
  sourceName: string;
  sourceHash: string;
  accountHolder: string | null;
  accountDocument: string | null;
  accountBank: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  pageCount: number;
  totalEntries: number;
  totalExits: number;
  finalBalance: number;
  movements: ParsedStatementMovement[];
  rawText: string;
}

const MONTHS: Record<string, number> = {
  JAN: 1,
  JANEIRO: 1,
  FEV: 2,
  FEVEREIRO: 2,
  MAR: 3,
  MARCO: 3,
  ABR: 4,
  ABRIL: 4,
  MAI: 5,
  MAIO: 5,
  JUN: 6,
  JUNHO: 6,
  JUL: 7,
  JULHO: 7,
  AGO: 8,
  AGOSTO: 8,
  SET: 9,
  SETEMBRO: 9,
  OUT: 10,
  OUTUBRO: 10,
  NOV: 11,
  NOVEMBRO: 11,
  DEZ: 12,
  DEZEMBRO: 12,
};

const NUMBER_REGEX = /-?\d{1,3}(?:\.\d{3})*,\d{2}/g;
const DATE_HEADER_REGEX = /^(\d{2})\s+([A-ZÇ]{3})\s+(\d{4})/i;
const TOTALS_REGEX = /^Total de (entradas|saídas)\s+([+-])\s+([\d.,]+)/i;
const BALANCE_REGEX = /^Saldo do dia\s+([\d.,-]+)/i;
const FOOTER_REGEX = /^Extrato gerado dia/i;
const MOVEMENT_PREFIXES = [
  'Transferência recebida pelo Pix',
  'Transferência Recebida',
  'Transferência enviada pelo Pix',
  'Transferência enviada',
  'Compra no débito',
  'Pagamento de boleto efetuado',
  'Reembolso recebido pelo Pix',
  'Tarifa',
];

const removeDoubleSpaces = (value: string) => value.replace(/\s+/g, ' ').trim();

export const normalizeBrazilianNumber = (value: string): number => {
  const normalized = value.replace(/\./g, '').replace(',', '.').replace(/[^0-9.-]/g, '');
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const formatBrazilianCurrency = (value: number): string =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export const formatDateIso = (date: Date): string => format(date, 'yyyy-MM-dd');

export const hashText = async (input: string): Promise<string> => {
  const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buffer)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
};

const parseStatementDate = (value: string): string | null => {
  const match = value.match(DATE_HEADER_REGEX);
  if (!match) return null;
  const [, day, monthAbbr, year] = match;
  const month = MONTHS[monthAbbr.toUpperCase()];
  if (!month) return null;
  return `${year}-${String(month).padStart(2, '0')}-${day}`;
};

const isMovementPrefix = (line: string) => MOVEMENT_PREFIXES.some((prefix) => line.startsWith(prefix));

const isFooterLine = (line: string) =>
  line.startsWith('Tem alguma dúvida?') ||
  line.startsWith('Caso a solução fornecida') ||
  FOOTER_REGEX.test(line);

const extractAccountInfo = (fullText: string) => {
  const normalized = removeDoubleSpaces(fullText.replace(/\n/g, ' '));
  const documentMatch = normalized.match(/(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})/);
  const holderMatch = normalized.match(/^\d{2}\.\d{3}\.\d{3}\s+([A-ZÁÉÍÓÚÂÊÔÃÕÇ .'-]+?)\s+\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/i);
  const bankMatch = normalized.match(/-\s+([A-ZÁÉÍÓÚÂÊÔÃÕÇ0-9 .()/-]+?)\s+(?:Agência|Conta)/i);

  return {
    accountDocument: documentMatch?.[1] ?? null,
    accountHolder: holderMatch ? removeDoubleSpaces(holderMatch[1]) : null,
    accountBank: bankMatch ? removeDoubleSpaces(bankMatch[1]) : null,
  };
};

const extractTotals = (fullText: string) => {
  const totalEntriesMatch = fullText.match(/Total de entradas\s+\+\s*([\d.]+,\d{2})/i);
  const totalExitsMatch = fullText.match(/Total de saídas\s+-\s*([\d.]+,\d{2})/i);
  const finalBalanceMatch = fullText.match(/Saldo final do período\s*\n\s*R\$\s*([\d.]+,\d{2})/i);

  return {
    totalEntries: totalEntriesMatch ? normalizeBrazilianNumber(totalEntriesMatch[1]) : 0,
    totalExits: totalExitsMatch ? normalizeBrazilianNumber(totalExitsMatch[1]) : 0,
    finalBalance: finalBalanceMatch ? normalizeBrazilianNumber(finalBalanceMatch[1]) : 0,
  };
};

const extractDateRange = (fullText: string) => {
  const rangeMatch = fullText.match(/a\s+(\d{2}\s+[A-ZÇ]{3,9}\s+\d{4})\s+(\d{2}\s+[A-ZÇ]{3,9}\s+\d{4})/i);
  if (!rangeMatch) return { periodStart: null, periodEnd: null };
  return {
    periodStart: parseStatementDate(rangeMatch[1]),
    periodEnd: parseStatementDate(rangeMatch[2]),
  };
};

const extractMovementMetadata = (description: string) => {
  const counterpartyMatch = description.match(/^(?:Transferência (?:recebida|enviada)(?: pelo Pix)?|Reembolso recebido pelo Pix|Compra no débito|Pagamento de boleto efetuado|Tarifa)\s+(.+?)(?:\s+-\s+|\s+\d{1,3}(?:\.\d{3})*,\d{2}$|$)/i);
  const withDocumentMatch = description.match(/^(.*?)\s+-\s+((?:\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}|\*{3}\.\d{3}\.\d{3}-\*{2}|\d{11,14}|•{3}\.\d{3}\.\d{3}-•{2}))\s+-\s+(.*)$/i);
  const bankMatch = description.match(/-\s+([A-ZÁÉÍÓÚÂÊÔÃÕÇ0-9 .()/-]+?)(?:\s+Agência:|$)/i);

  const counterpartyName = withDocumentMatch ? removeDoubleSpaces(withDocumentMatch[1]) : (counterpartyMatch ? removeDoubleSpaces(counterpartyMatch[1]) : null);
  const counterpartyDocument = withDocumentMatch ? removeDoubleSpaces(withDocumentMatch[2]) : null;
  const counterpartyBank = withDocumentMatch ? removeDoubleSpaces(withDocumentMatch[3]) : (bankMatch ? removeDoubleSpaces(bankMatch[1]) : null);

  return {
    counterpartyName,
    counterpartyDocument,
    counterpartyBank,
  };
};

const inferMovementType = (description: string): StatementMovementType => {
  const lowered = description.toLowerCase();
  if (lowered.includes('reembolso')) return 'reembolso';
  if (lowered.includes('boleto')) return 'boleto';
  if (lowered.includes('compra no débito') || lowered.includes('compra no debito')) return 'debito';
  if (lowered.includes('pix')) return 'pix';
  if (lowered.includes('tarifa')) return 'tarifa';
  if (lowered.includes('transferência')) return 'transferencia';
  return 'outros';
};

const inferDirection = (description: string, sectionDirection?: StatementDirection): StatementDirection => {
  return inferPjTransactionDirection({
    description,
    direction: sectionDirection || null,
  }) || 'saida';
};

const inferCategory = (description: string, direction: StatementDirection) => {
  const inferred = inferPjCategory({
    description,
    direction,
  });

  if (inferred.category) {
    return inferred;
  }

  return direction === 'entrada'
    ? { category: 'Receita', confidence: 0.7 }
    : { category: 'Administrativo', confidence: 0.5 };
};

const cleanDescription = (raw: string) => removeDoubleSpaces(raw)
  .replace(/^Transferência recebida pelo Pix\s+/i, '')
  .replace(/^Transferência Recebida\s+/i, '')
  .replace(/^Transferência enviada pelo Pix\s+/i, '')
  .replace(/^Transferência enviada\s+/i, '')
  .replace(/^Reembolso recebido pelo Pix\s+/i, '')
  .replace(/^Compra no débito\s+/i, '')
  .replace(/^Pagamento de boleto efetuado\s+/i, '')
  .replace(/^Tarifa\s+/i, '');

const parseAmountFromLine = (line: string) => {
  const matches = line.match(NUMBER_REGEX);
  if (!matches || matches.length === 0) return null;
  return normalizeBrazilianNumber(matches[matches.length - 1]);
};

const parsePageMovements = (pageText: string, pageNumber: number) => {
  const lines = pageText
    .split(/\n+/)
    .map((line) => removeDoubleSpaces(line))
    .filter(Boolean);

  const movements: ParsedStatementMovement[] = [];
  let currentDate: string | null = null;
  let sectionDirection: StatementDirection | undefined;
  let currentLines: string[] = [];
  let currentLineIndex = 0;
  let currentBalance: number | null = null;

  const flushCurrent = () => {
    if (!currentDate || currentLines.length === 0) return;
    const rawText = currentLines.join(' ');
    const amount = parseAmountFromLine(rawText) ?? parseAmountFromLine(currentLines[currentLines.length - 1]) ?? 0;
    const description = cleanDescription(rawText);
    const direction = inferDirection(description, sectionDirection);
    const movementType = inferMovementType(description);
    const { counterpartyName, counterpartyDocument, counterpartyBank } = extractMovementMetadata(description);
    const inferredCategory = inferCategory(description, direction);

    movements.push({
      statementDate: currentDate,
      pageNumber,
      lineIndex: currentLineIndex,
      direction,
      movementType,
      description,
      counterpartyName,
      counterpartyDocument,
      counterpartyBank,
      amount,
      runningBalance: currentBalance,
      rawText,
      suggestedCategory: inferredCategory.category,
      confidence: inferredCategory.confidence,
    });

    currentLines = [];
    sectionDirection = undefined;
  };

  for (const line of lines) {
    if (isFooterLine(line) || line.startsWith('Página') || line.startsWith('VALORES EM R$')) {
      continue;
    }

    let currentLine = line;
    const dateMatch = currentLine.match(DATE_HEADER_REGEX);
    if (dateMatch) {
      flushCurrent();
      currentDate = parseStatementDate(dateMatch[0]);
      currentLineIndex = 0;
      currentLine = removeDoubleSpaces(currentLine.replace(dateMatch[0], '')).trim();
      if (!currentLine) {
        continue;
      }
    }

    const totalMatch = currentLine.match(TOTALS_REGEX);
    if (totalMatch) {
      flushCurrent();
      sectionDirection = totalMatch[1].toLowerCase().includes('entrada') ? 'entrada' : 'saida';
      currentLineIndex += 1;
      continue;
    }

    const balanceMatch = currentLine.match(BALANCE_REGEX);
    if (balanceMatch) {
      currentBalance = normalizeBrazilianNumber(balanceMatch[1]);
      flushCurrent();
      continue;
    }

    if (!currentDate) {
      continue;
    }

    const startsNewMovement = isMovementPrefix(currentLine) || /^(Compra no débito|Transferência|Pagamento de boleto|Reembolso|Tarifa)/i.test(currentLine);
    if (startsNewMovement && currentLines.length > 0) {
      flushCurrent();
    }

    if (startsNewMovement && currentLines.length === 0) {
      currentLineIndex += 1;
    }

    currentLines.push(currentLine);

    const amountAtEnd = /\d{1,3}(?:\.\d{3})*,\d{2}$/.test(currentLine);
    if (amountAtEnd && currentLines.length > 0) {
      flushCurrent();
    }
  }

  flushCurrent();
  return movements;
};

export const parseStatementPdfText = async (pages: string[], sourceName: string, sourceHash: string): Promise<ParsedStatementImport> => {
  const fullText = pages.join('\n\n');
  const accountInfo = extractAccountInfo(fullText);
  const totals = extractTotals(fullText);
  const { periodStart, periodEnd } = extractDateRange(fullText);

  const movements = pages.flatMap((pageText, index) => parsePageMovements(pageText, index + 1));

  return {
    sourceName,
    sourceHash,
    accountHolder: accountInfo.accountHolder,
    accountDocument: accountInfo.accountDocument,
    accountBank: accountInfo.accountBank,
    periodStart,
    periodEnd,
    pageCount: pages.length,
    totalEntries: totals.totalEntries,
    totalExits: totals.totalExits,
    finalBalance: totals.finalBalance,
    movements,
    rawText: fullText,
  };
};
