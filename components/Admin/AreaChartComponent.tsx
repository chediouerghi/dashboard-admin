import { type } from 'os';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface ChartData {
  date: string;
  users: number;
  events: number;
  reservations: number;
  revenue: number;
}

interface AreaChartComponentProps {
  data: ChartData[];
}

export const AreaChartComponent = ({ data }: AreaChartComponentProps) => {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            stroke="#94a3b8" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#94a3b8" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          />
          <Area 
            type="monotone" 
            dataKey="users" 
            stackId="1"
            stroke="#3b82f6" 
            fill="#3b82f6" 
            fillOpacity={0.2}
            strokeWidth={2}
          />
          <Area 
            type="monotone" 
            dataKey="events" 
            stackId="2"
            stroke="#10b981" 
            fill="#10b981" 
            fillOpacity={0.2}
            strokeWidth={2}
          />
          <Area 
            type="monotone" 
            dataKey="reservations" 
            stackId="3"
            stroke="#8b5cf6" 
            fill="#8b5cf6" 
            fillOpacity={0.2}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};