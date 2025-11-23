import { ChevronRight, Lock, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { OperationalCard as OperationalCardType } from '../../types/executive-dashboard';
import * as LucideIcons from 'lucide-react';

interface OperationalCardProps {
  card: OperationalCardType;
  onClick?: () => void;
}

export default function OperationalCard({ card, onClick }: OperationalCardProps) {
  // Dynamically get the icon component from lucide-react
  const IconComponent = (LucideIcons as any)[card.icon] || LucideIcons.BarChart3;

  const isClickable = card.isActive && onClick;

  const cardClasses = `
    relative bg-white rounded-lg shadow-md border-2 transition-all duration-200
    ${card.isActive 
      ? 'border-blue-500 cursor-pointer hover:scale-105 hover:shadow-lg' 
      : 'border-gray-300 bg-gray-50 opacity-60 cursor-not-allowed'
    }
  `;

  const iconBgClasses = card.isActive 
    ? 'bg-blue-100' 
    : 'bg-gray-200';

  const iconColorClasses = card.isActive 
    ? 'text-blue-600' 
    : 'text-gray-400';

  const textPrimaryClasses = card.isActive 
    ? 'text-gray-900' 
    : 'text-gray-500';

  const textSecondaryClasses = card.isActive 
    ? 'text-gray-600' 
    : 'text-gray-500';

  const handleClick = () => {
    if (isClickable) {
      onClick?.();
    }
  };

  const renderTrend = (trend?: string, trendValue?: string) => {
    if (!trend || !trendValue) return null;

    const trendColors = {
      up: 'text-green-600',
      down: 'text-red-600',
      stable: 'text-gray-500'
    };

    const TrendIcon = trend === 'up' 
      ? TrendingUp 
      : trend === 'down' 
      ? TrendingDown 
      : Minus;

    return (
      <div className={`flex items-center gap-1 text-xs font-medium ${trendColors[trend as keyof typeof trendColors]}`}>
        <TrendIcon className="w-3 h-3" />
        {trendValue}
      </div>
    );
  };

  return (
    <div
      className={cardClasses}
      onClick={handleClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : -1}
      onKeyDown={(e) => {
        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Lock icon for inactive cards */}
      {!card.isActive && (
        <div className="absolute top-4 right-4">
          <Lock className="w-5 h-5 text-gray-400" />
        </div>
      )}

      {/* Chevron for active cards */}
      {card.isActive && (
        <div className="absolute top-4 right-4">
          <ChevronRight className="w-5 h-5 text-blue-600" />
        </div>
      )}

      <div className="p-6">
        {/* Icon and Title Section */}
        <div className="flex items-start gap-4 mb-4">
          <div className={`p-3 rounded-lg ${iconBgClasses}`}>
            <IconComponent className={`w-8 h-8 ${iconColorClasses}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`text-xl font-bold mb-1 ${textPrimaryClasses}`}>
              {card.title}
            </h3>
            <p className={`text-sm ${textSecondaryClasses}`}>
              {card.description}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mb-4">
          {card.isActive ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
              ✓ Active & Wired
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-200 text-gray-600">
              🔒 In Roadmap
            </span>
          )}
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 gap-4">
          {card.kpis.map((kpi, index) => (
            <div key={index} className="space-y-1">
              <div className={`text-xs ${textSecondaryClasses}`}>
                {kpi.label}
              </div>
              <div className={`text-lg font-bold ${textPrimaryClasses}`}>
                {kpi.value}
              </div>
              {renderTrend(kpi.trend, kpi.trendValue)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
