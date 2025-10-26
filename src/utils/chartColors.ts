
// Sistema de cores moderno e consistente para gráficos
export const CHART_COLORS = {
  // Cores principais
  primary: {
    blue: '#3B82F6',
    blueLight: '#60A5FA',
    blueDark: '#1D4ED8',
  },
  
  // Entradas (Verde)
  income: {
    main: '#10B981',
    light: '#34D399',
    dark: '#059669',
    gradient: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
  },
  
  // Saídas (Vermelho)
  expense: {
    main: '#EF4444',
    light: '#F87171',
    dark: '#DC2626',
    gradient: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)',
  },
  
  // Saldo (Azul)
  balance: {
    main: '#3B82F6',
    light: '#60A5FA',
    dark: '#1D4ED8',
    gradient: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
  },
  
  // Projeções (Roxo)
  projection: {
    main: '#8B5CF6',
    light: '#A78BFA',
    dark: '#7C3AED',
    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
  },
  
  // Paleta para categorias
  categories: [
    '#3B82F6', // Azul
    '#10B981', // Verde
    '#F59E0B', // Amarelo
    '#EF4444', // Vermelho
    '#8B5CF6', // Roxo
    '#EC4899', // Rosa
    '#06B6D4', // Ciano
    '#84CC16', // Lima
    '#F97316', // Laranja
    '#6366F1', // Índigo
    '#14B8A6', // Teal
    '#F43F5E', // Rosa
  ],
  
  // Tons neutros modernos
  neutral: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
};

export const getRandomCategoryColor = (index: number): string => {
  return CHART_COLORS.categories[index % CHART_COLORS.categories.length];
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};
