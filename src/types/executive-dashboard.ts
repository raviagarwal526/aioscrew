export type ViewLevel = 'executive' | 'vp-crew';

export type TrendDirection = 'up' | 'down' | 'stable';

export interface KPI {
  label: string;
  value: string;
  trend?: TrendDirection;
  trendValue?: string;
}

export interface OperationalCard {
  id: string;
  title: string;
  icon: string; // Lucide icon name
  description: string;
  kpis: KPI[];
  isActive: boolean;
  category: 'executive' | 'crew';
  viewLevel: ViewLevel;
}
