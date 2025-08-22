import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

interface ScoreRadarChartProps {
  scores: {
    content: number;
    delivery: number;
    impact: number;
  };
  size?: 'sm' | 'lg';
}

export function ScoreRadarChart({ scores, size = 'lg' }: ScoreRadarChartProps) {
  const data = [
    { subject: 'Content', value: scores.content * 100 },
    { subject: 'Delivery', value: scores.delivery * 100 },
    { subject: 'Impact', value: scores.impact * 100 },
  ];

  const height = size === 'sm' ? 200 : 300;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" className="text-sm fill-gray-600 dark:fill-gray-400" />
        <Radar
          name="Score"
          dataKey="value"
          stroke="#3B82F6"
          fill="#3B82F6"
          fillOpacity={0.3}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}