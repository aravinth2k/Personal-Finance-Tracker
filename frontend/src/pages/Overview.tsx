import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { TrendingUp, TrendingDown, Wallet, PiggyBank, ChevronLeft, ChevronRight } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useYearlyOverview } from '@/hooks/useOverview'
import { formatCurrency, shortAmount } from '@/utils/format'

const PIE_COLORS = [
  '#6366f1','#f59e0b','#10b981','#ef4444','#3b82f6','#8b5cf6',
  '#ec4899','#14b8a6','#f97316','#84cc16','#06b6d4','#a78bfa',
]

// ── Summary Card ─────────────────────────────────────────────────────────────

interface SummaryCardProps {
  title: string
  value: number
  icon: React.ReactNode
  colorClass: string
  bgClass: string
}

function SummaryCard({ title, value, icon, colorClass, bgClass }: SummaryCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className={`text-2xl font-bold mt-1 ${colorClass}`}>{formatCurrency(value)}</p>
          </div>
          <div className={`h-12 w-12 rounded-full flex items-center justify-center ${bgClass}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Custom Tooltip ────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-background border rounded-lg shadow-lg p-3 text-sm">
      <p className="font-medium mb-2">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  )
}

function PieTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-background border rounded-lg shadow-lg p-3 text-sm">
      <p className="font-medium">{payload[0].name}</p>
      <p>{formatCurrency(payload[0].value)}</p>
    </div>
  )
}

// ── Overview Page ─────────────────────────────────────────────────────────────

export function Overview() {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear)
  const { data, isLoading } = useYearlyOverview(year)

  const currentMonthPath = `/month/${year}/${new Date().getMonth() + 1}`

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Overview</h1>
        </div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  const d = data!
  const hasExpenseData = d.expense_by_category.length > 0
  const hasAnyData = d.total_income > 0 || d.total_expenses > 0 || d.total_investments > 0

  // Only show months that have data OR all months (always show all 12)
  const chartData = d.months.map((m) => ({
    name: m.month_name.slice(0, 3),
    Income: m.income,
    Expenses: m.expenses,
    Investments: m.investments,
    'Net Savings': m.net_savings,
  }))

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header + Year selector */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Overview</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setYear((y) => y - 1)}
            className="p-1 rounded hover:bg-accent transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-lg font-semibold w-16 text-center">{year}</span>
          <button
            onClick={() => setYear((y) => y + 1)}
            disabled={year >= currentYear}
            className="p-1 rounded hover:bg-accent transition-colors disabled:opacity-30"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Income"
          value={d.total_income}
          colorClass="text-green-600"
          bgClass="bg-green-100"
          icon={<TrendingUp className="h-6 w-6 text-green-600" />}
        />
        <SummaryCard
          title="Total Expenses"
          value={d.total_expenses}
          colorClass="text-red-500"
          bgClass="bg-red-100"
          icon={<TrendingDown className="h-6 w-6 text-red-500" />}
        />
        <SummaryCard
          title="Total Investments"
          value={d.total_investments}
          colorClass="text-blue-600"
          bgClass="bg-blue-100"
          icon={<Wallet className="h-6 w-6 text-blue-600" />}
        />
        <SummaryCard
          title="Net Savings"
          value={d.net_savings}
          colorClass={d.net_savings >= 0 ? 'text-emerald-600' : 'text-red-500'}
          bgClass={d.net_savings >= 0 ? 'bg-emerald-100' : 'bg-red-100'}
          icon={<PiggyBank className={`h-6 w-6 ${d.net_savings >= 0 ? 'text-emerald-600' : 'text-red-500'}`} />}
        />
      </div>

      {!hasAnyData && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No data for {year}.</p>
            <Link to={currentMonthPath} className="text-primary text-sm underline-offset-4 hover:underline mt-2 inline-block">
              Start adding entries for this month →
            </Link>
          </CardContent>
        </Card>
      )}

      {hasAnyData && (
        <>
          {/* Monthly Breakdown Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Monthly Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead className="text-right text-green-600">Income</TableHead>
                    <TableHead className="text-right text-red-500">Expenses</TableHead>
                    <TableHead className="text-right text-blue-600 hidden sm:table-cell">Investments</TableHead>
                    <TableHead className="text-right">Net Savings</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {d.months.map((m) => {
                    const hasData = m.income > 0 || m.expenses > 0 || m.investments > 0
                    return (
                      <TableRow key={m.month} className={!hasData ? 'opacity-40' : ''}>
                        <TableCell>
                          <Link
                            to={`/month/${year}/${m.month}`}
                            className="hover:underline text-primary font-medium"
                          >
                            {m.month_name}
                          </Link>
                        </TableCell>
                        <TableCell className="text-right text-green-600">{formatCurrency(m.income)}</TableCell>
                        <TableCell className="text-right text-red-500">{formatCurrency(m.expenses)}</TableCell>
                        <TableCell className="text-right text-blue-600 hidden sm:table-cell">{formatCurrency(m.investments)}</TableCell>
                        <TableCell className={`text-right font-semibold ${m.net_savings >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                          {formatCurrency(m.net_savings)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Bar Chart — Income vs Expenses vs Investments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Income vs Expenses vs Investments</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={shortAmount} tick={{ fontSize: 11 }} width={60} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend />
                  <Bar dataKey="Income" fill="#16a34a" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Expenses" fill="#ef4444" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Investments" fill="#2563eb" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Line Chart — Net Savings Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Net Savings Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={shortAmount} tick={{ fontSize: 11 }} width={60} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="Net Savings"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pie Chart — Expense by Category */}
          {hasExpenseData && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Expense Breakdown by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={d.expense_by_category}
                        dataKey="amount"
                        nameKey="category_name"
                        cx="50%"
                        cy="50%"
                        outerRadius={110}
                        label={({ category_name, percent }) =>
                          `${category_name} ${(percent * 100).toFixed(0)}%`
                        }
                        labelLine={false}
                      >
                        {d.expense_by_category.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Legend table */}
                  <div className="w-full md:w-64 shrink-0 space-y-1 text-sm">
                    {d.expense_by_category.map((item, i) => (
                      <div key={item.category_name} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block h-3 w-3 rounded-full shrink-0"
                            style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                          />
                          <span className="text-muted-foreground truncate max-w-[120px]">{item.category_name}</span>
                        </div>
                        <span className="font-medium">{formatCurrency(item.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
