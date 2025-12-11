'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Line
} from 'recharts'
import { DashboardData } from '@/actions/dashboard'

interface DashboardChartsProps {
  data: DashboardData | null
}

export function DashboardCharts({ data }: DashboardChartsProps) {
  if (!data) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>学习能力分析 (雷达图)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-[350px]">
              <p className="text-muted-foreground">暂无学习数据，请开始学习！</p>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>近7天活跃度 (折线图)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-[350px]">
              <p className="text-muted-foreground">暂无活跃数据，请开始学习！</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Prepare data for Radar Chart
  const radarChartData = data.subjectStrengths.map(s => ({
    subject: s.subject,
    accuracy: s.accuracy,
    fullMark: 100 // Max accuracy is 100%
  }))

  // Prepare data for Line Chart
  const lineChartData = data.dailyActivity.map(d => ({
    date: d.date,
    activity: d.activityCount
  }))

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>学习能力分析 (雷达图)</CardTitle>
        </CardHeader>
        <CardContent className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarChartData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar
                name="准确率"
                dataKey="accuracy"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>近7天活跃度 (折线图)</CardTitle>
        </CardHeader>
        <CardContent className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={lineChartData}
              margin={{
                top: 5,
                right: 10,
                left: 10,
                bottom: 5
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="activity"
                stroke="#82ca9d"
                activeDot={{ r: 8 }}
                name="活动量"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
