import { Activity, CheckCircle, Clock, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export const RecentActivity = () => {
  const activities = [
    { id: 1, user: 'Marie Dubois', action: 'a créé un événement', time: '5 min', icon: Activity, color: 'text-blue-600' },
    { id: 2, user: 'Jean Martin', action: 'a effectué une réservation', time: '12 min', icon: CheckCircle, color: 'text-emerald-600' },
    { id: 3, user: 'Sophie Bernard', action: 's\'est inscrite', time: '25 min', icon: Users, color: 'text-violet-600' },
    { id: 4, user: 'Pierre Leroy', action: 'a mis à jour son profil', time: '1h', icon: Users, color: 'text-orange-600' },
  ];

  return (
    <Card className="border-gray-200 shadow-md bg-white h-full">
      <CardHeader className="pb-4 border-b border-gray-100">
        <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          Activité récente
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className={`p-2 rounded-lg ${activity.color.replace('text', 'bg')}/10 flex-shrink-0`}>
                <activity.icon className={`w-4 h-4 ${activity.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  <span className="font-semibold">{activity.user}</span> {activity.action}
                </p>
                <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3 flex-shrink-0" />
                  {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
        <button className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium text-center py-2 hover:bg-blue-50 rounded-lg transition-colors">
          Voir toutes les activités →
        </button>
      </CardContent>
    </Card>
  );
};