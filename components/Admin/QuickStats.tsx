import { Clock, TrendingUp, Users, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { stat } from 'fs';

interface QuickStatsProps {
  conversionRate: number;
  avgSession: string;
  bounceRate: string;
  activeUsers: number;
}

export const QuickStats = ({ conversionRate, avgSession, bounceRate, activeUsers }: QuickStatsProps) => {
  const stats = [
    { label: 'Taux de conversion', value: `${conversionRate}%`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Session moyenne', value: avgSession, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Taux de rebond', value: bounceRate, icon: Zap, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Utilisateurs actifs', value: activeUsers.toLocaleString(), icon: Users, color: 'text-violet-600', bg: 'bg-violet-50' },
  ];

  return (
    <Card className="border-gray-200 shadow-md bg-white h-full">
      <CardHeader className="pb-4 border-b border-gray-100">
        <CardTitle className="text-xl font-bold text-gray-900">Statistiques rapides</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};