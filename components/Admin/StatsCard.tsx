import { ArrowRight, LucideIcon, TrendingDown, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../ui/card';

interface StatsCardProps {
  title: string;
  count: number | string;
  icon: LucideIcon;
  description?: string;
  actionLabel?: string;
  actionLink?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo' | 'rose' | 'emerald' | 'amber';
  trend?: {
    value: number;
    positive: boolean;
  };
  compact?: boolean;
}

export const StatsCard = ({
  title,
  count,
  icon: Icon,
  description,
  actionLabel,
  actionLink,
  color = 'blue',
  trend,
  compact = false,
}: StatsCardProps) => {
  const colorClasses = {
    blue: {
      gradient: 'from-blue-600 to-blue-700',
      light: 'bg-blue-50',
      icon: 'text-blue-600',
      text: 'text-blue-600',
      border: 'border-blue-200',
      hover: 'hover:border-blue-300',
      trend: 'bg-blue-50 text-blue-700 border border-blue-200',
    },
    green: {
      gradient: 'from-emerald-600 to-emerald-700',
      light: 'bg-emerald-50',
      icon: 'text-emerald-600',
      text: 'text-emerald-600',
      border: 'border-emerald-200',
      hover: 'hover:border-emerald-300',
      trend: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    },
    purple: {
      gradient: 'from-violet-600 to-violet-700',
      light: 'bg-violet-50',
      icon: 'text-violet-600',
      text: 'text-violet-600',
      border: 'border-violet-200',
      hover: 'hover:border-violet-300',
      trend: 'bg-violet-50 text-violet-700 border border-violet-200',
    },
    orange: {
      gradient: 'from-orange-600 to-orange-700',
      light: 'bg-orange-50',
      icon: 'text-orange-600',
      text: 'text-orange-600',
      border: 'border-orange-200',
      hover: 'hover:border-orange-300',
      trend: 'bg-orange-50 text-orange-700 border border-orange-200',
    },
    red: {
      gradient: 'from-rose-600 to-rose-700',
      light: 'bg-rose-50',
      icon: 'text-rose-600',
      text: 'text-rose-600',
      border: 'border-rose-200',
      hover: 'hover:border-rose-300',
      trend: 'bg-rose-50 text-rose-700 border border-rose-200',
    },
    indigo: {
      gradient: 'from-indigo-600 to-indigo-700',
      light: 'bg-indigo-50',
      icon: 'text-indigo-600',
      text: 'text-indigo-600',
      border: 'border-indigo-200',
      hover: 'hover:border-indigo-300',
      trend: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    },
    rose: {
      gradient: 'from-pink-600 to-pink-700',
      light: 'bg-pink-50',
      icon: 'text-pink-600',
      text: 'text-pink-600',
      border: 'border-pink-200',
      hover: 'hover:border-pink-300',
      trend: 'bg-pink-50 text-pink-700 border border-pink-200',
    },
    emerald: {
      gradient: 'from-emerald-600 to-emerald-700',
      light: 'bg-emerald-50',
      icon: 'text-emerald-600',
      text: 'text-emerald-600',
      border: 'border-emerald-200',
      hover: 'hover:border-emerald-300',
      trend: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    },
    amber: {
      gradient: 'from-amber-600 to-amber-700',
      light: 'bg-amber-50',
      icon: 'text-amber-600',
      text: 'text-amber-600',
      border: 'border-amber-200',
      hover: 'hover:border-amber-300',
      trend: 'bg-amber-50 text-amber-700 border border-amber-200',
    },
  };

  const styles = colorClasses[color];

  if (compact) {
    return (
      <Card className={`border ${styles.border} ${styles.hover} transition-all duration-300 hover:shadow-lg overflow-hidden group bg-white`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className={`p-2 rounded-lg ${styles.light}`}>
              <Icon className={`w-5 h-5 ${styles.icon}`} />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-2xl font-bold text-gray-900">{count}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border ${styles.border} ${styles.hover} transition-all duration-300 hover:shadow-xl overflow-hidden group bg-white`}>
      <div className="relative">
        {/* Gradient Bar */}
        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${styles.gradient}`} />

        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-xl ${styles.light}`}>
              <Icon className={`w-6 h-6 ${styles.icon}`} />
            </div>

            {trend && (
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${trend.positive
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                {trend.positive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {Math.abs(trend.value)}%
              </div>
            )}
          </div>

          <div className="mb-4">
            <p className="text-3xl lg:text-4xl font-bold text-gray-900 mb-1">{count}</p>
            <p className="text-sm font-medium text-gray-700">{title}</p>
            {description && (
              <p className="text-xs text-gray-600 mt-2">{description}</p>
            )}
          </div>

          {actionLabel && actionLink && (
            <Link
              to={actionLink}
              className={`inline-flex items-center gap-2 text-sm font-semibold ${styles.text} transition-all group-hover:gap-3`}
            >
              {actionLabel}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </CardContent>
      </div>
    </Card>
  );
};