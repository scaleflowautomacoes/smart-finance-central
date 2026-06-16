export type PjTransactionDirection = 'entrada' | 'saida';

export interface PjCategorizationInput {
  name?: string | null;
  description?: string | null;
  direction?: PjTransactionDirection | null;
}

export interface PjCategoryRule {
  name: string;
  keywords: string[];
  direction?: PjTransactionDirection;
  confidence: number;
}

export const PJ_CATEGORY_RULES: PjCategoryRule[] = [
  {
    name: 'Alimentação',
    keywords: ['ifd', 'ifood', 'restaurante', 'frango', 'lanch', 'hamb', 'pizza', 'bar', 'churrasc', 'padaria', 'cafe', 'caf', 'lanche', 'marmit', 'sushi', 'adega', 'bistro', 'grill', 'burger', 'pastel', 'carnes', 'fogareu', 'muffato', 'amigao', 'itamaraty', 'habanero', 'molicenter', 'catuai', 'mercado'],
    direction: 'saida',
    confidence: 0.98,
  },
  {
    name: 'Mercado/Condomínio',
    keywords: ['yuri yago'],
    direction: 'saida',
    confidence: 0.97,
  },
  {
    name: 'Estacionamento',
    keywords: ['estacenter', 'estacionamento', 'parking', 'shop maringa park'],
    direction: 'saida',
    confidence: 0.96,
  },
  {
    name: 'Combustível',
    keywords: ['posto', 'autoposto', 'gasolina', 'etanol', 'diesel', 'combustivel', 'combustível'],
    direction: 'saida',
    confidence: 0.96,
  },
  {
    name: 'Transporte',
    keywords: ['uber', 'via araucaria', 'concessionaria de rodo', 'sem parar', 'pedagio', 'rodovia', 'toll'],
    direction: 'saida',
    confidence: 0.9,
  },
  {
    name: 'Marketing',
    keywords: ['facebook', 'instagram', 'google', 'meta', 'four pixel', 'pixels', 'ads', 'trafego', 'pixel'],
    direction: 'saida',
    confidence: 0.88,
  },
  {
    name: 'Impostos',
    keywords: ['receita federal', 'das', 'simples', 'darf', 'inss', 'imposto'],
    direction: 'saida',
    confidence: 0.99,
  },
  {
    name: 'Estrutura',
    keywords: ['telefonica', 'telefone', 'copel', 'internet', 'mgp', 'associacao comercial', 'callx', 'servicos online', 'associacao', 'comercial'],
    direction: 'saida',
    confidence: 0.82,
  },
  {
    name: 'Transferências internas',
    keywords: ['brenda tamara', 'higor raphael plens', 'rosangela borguezan'],
    direction: 'saida',
    confidence: 0.95,
  },
];

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const matchesAny = (haystack: string, needles: string[]) =>
  needles.some((needle) => haystack.includes(normalize(needle)));

export const normalizePjText = normalize;

export const inferPjTransactionDirection = (input: PjCategorizationInput): PjTransactionDirection | null => {
  const text = normalize([input.name, input.description].filter(Boolean).join(' '));

  if (text.includes('transferencia recebida') || text.includes('reembolso recebido')) {
    return 'entrada';
  }

  if (
    text.includes('transferencia enviada') ||
    text.includes('compra no debito') ||
    text.includes('pagamento de boleto') ||
    text.includes('tarifa')
  ) {
    return 'saida';
  }

  return input.direction ?? null;
};

export const inferPjCategory = (input: PjCategorizationInput): { category: string | null; confidence: number } => {
  const text = normalize([input.name, input.description].filter(Boolean).join(' '));
  const direction = inferPjTransactionDirection(input);

  for (const rule of PJ_CATEGORY_RULES) {
    if (rule.direction && direction && rule.direction !== direction) {
      continue;
    }

    if (matchesAny(text, rule.keywords)) {
      return { category: rule.name, confidence: rule.confidence };
    }
  }

  if (direction === 'entrada') {
    return { category: 'Recebimentos', confidence: 0.55 };
  }

  return { category: 'Estrutura', confidence: 0.55 };
};

export const PJ_CATEGORY_SEED = PJ_CATEGORY_RULES.map((rule) => ({
  nome: rule.name,
  origem: 'PJ' as const,
  tipo: rule.direction ?? 'saida',
}));
