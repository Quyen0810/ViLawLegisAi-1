'use client'

import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from 'recharts'
import { motion } from 'framer-motion'

interface ChartCardProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  className?: string
}

export function ChartCard({ title, subtitle, children, className = '' }: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl border border-slate-200 p-6 shadow-sm ${className}`}
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {children}
    </motion.div>
  )
}

// Area Chart for activity over time
interface ActivityChartProps {
  data: { name: string; value: number; prevValue?: number }[]
}

export function ActivityChart({ data }: ActivityChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis 
          dataKey="name" 
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
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}
          labelStyle={{ color: '#1e293b', fontWeight: 600 }}
        />
        <Area 
          type="monotone" 
          dataKey="value" 
          stroke="#3b82f6" 
          strokeWidth={2.5}
          fillOpacity={1} 
          fill="url(#colorValue)" 
          name="Hoạt động"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// Bar Chart for category distribution
interface BarChartData {
  name: string
  value: number
  color?: string
}

interface CategoryBarChartProps {
  data: BarChartData[]
}

export function CategoryBarChart({ data }: CategoryBarChartProps) {
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis 
          dataKey="name" 
          stroke="#94a3b8" 
          fontSize={11}
          tickLine={false}
          axisLine={false}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis 
          stroke="#94a3b8" 
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}
          labelStyle={{ color: '#1e293b', fontWeight: 600 }}
        />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} name="Số lượng">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color || colors[index % colors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// Pie Chart for distribution
interface PieChartData {
  name: string
  value: number
  color: string
  [key: string]: string | number
}

interface DistributionPieChartProps {
  data: PieChartData[]
}

export function DistributionPieChart({ data }: DistributionPieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}
        />
        <Legend 
          wrapperStyle={{ fontSize: '12px' }}
          iconType="circle"
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

// Line Chart for trends
interface LineChartData {
  name: string
  users: number
  chats: number
  documents: number
}

interface TrendLineChartProps {
  data: LineChartData[]
}

export function TrendLineChart({ data }: TrendLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis 
          dataKey="name" 
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
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}
          labelStyle={{ color: '#1e293b', fontWeight: 600 }}
        />
        <Legend 
          wrapperStyle={{ fontSize: '12px' }}
          iconType="circle"
        />
        <Line 
          type="monotone" 
          dataKey="users" 
          stroke="#3b82f6" 
          strokeWidth={2.5}
          dot={{ fill: '#3b82f6', strokeWidth: 2 }}
          name="Người dùng"
        />
        <Line 
          type="monotone" 
          dataKey="chats" 
          stroke="#10b981" 
          strokeWidth={2.5}
          dot={{ fill: '#10b981', strokeWidth: 2 }}
          name="Cuộc trò chuyện"
        />
        <Line 
          type="monotone" 
          dataKey="documents" 
          stroke="#f59e0b" 
          strokeWidth={2.5}
          dot={{ fill: '#f59e0b', strokeWidth: 2 }}
          name="Văn bản"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
