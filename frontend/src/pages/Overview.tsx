import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ComposedChart, Bar, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { TrendingUp, TrendingDown, Wallet, PiggyBank, ChevronLeft, ChevronRight } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useYearlyOverview } from '@/hooks/useOverview'
import { formatCurrency, shortAmount } from '@/utils/format'

const PIE_COLORS = [
  '#6366f1', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#84cc16', '#06b6d4', '#a78bfa',
]

function wrapLabel(text: string, maxCharsPerLine: number) {
  const cleaned = text.trim().replace(/\s+/g, ' ')
  if (!cleaned) return ['']

  const words = cleaned.split(' ')
  const lines: string[] = []
  let current = ''

  for (const w of words) {
    const next = current ? `${current} ${w}` : w
    if (next.length <= maxCharsPerLine) {
      current = next
      continue
    }

    if (current) lines.push(current)
    // If a single word is huge, hard-break it.
    if (w.length > maxCharsPerLine) {
      lines.push(w.slice(0, Math.max(1, maxCharsPerLine - 1)) + '…')
      current = ''
    } else {
      current = w
    }
  }
  if (current) lines.push(current)

  return lines.slice(0, 2)
}

function wrappedPieLabel({
  x,
  y,
  textAnchor,
  name,
  percent,
}: {
  x?: number
  y?: number
  textAnchor?: 'start' | 'middle' | 'end'
  name: string
  percent: number
}) {
  if (x == null || y == null) return null
  const pct = `${Math.round(percent * 100)}%`
  const lines = wrapLabel(`${name} ${pct}`, 14)

  return (
    <text x={x} y={y} textAnchor={textAnchor} fill="currentColor" className="text-xs text-muted-foreground">
      {lines.map((line, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : 12}>
          {line}
        </tspan>
      ))}
    </text>
  )
}

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
  const { data, isLoading, isError, error } = useYearlyOverview(year)
  const [panelIndex, setPanelIndex] = useState(0)

  const currentMonthPath = `/month/${year}/${new Date().getMonth() + 1}`

  const d = data ?? null
  const hasAnyData = !!d && (d.total_income > 0 || d.total_expenses > 0 || d.total_investments > 0)

  // Only show months that have data OR all months (always show all 12)
  const chartData = useMemo(() => {
    if (!d) return []
    return d.months.map((m) => ({
      name: m.month_name.slice(0, 3),
      Income: m.income,
      Expenses: m.expenses,
      Investments: m.investments,
      'Net Savings': m.net_savings,
    }))
  }, [d])

  const panels = useMemo(() => {
    if (!d) return []

    const allPanels = [
      {
        key: 'table',
        title: 'Monthly Breakdown',
        isVisible: true,
        content: (
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
        ),
      },
      {
        key: 'yearly-bar',
        title: 'Yearly Overview Plot',
        isVisible: true,
        content: (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Income vs Expenses vs Investments</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={shortAmount} tick={{ fontSize: 11 }} width={60} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend />
                  <Bar dataKey="Income" fill="#16a34a" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Expenses" fill="#ef4444" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Investments" fill="#2563eb" radius={[3, 3, 0, 0]} />
                  <Line
                    type="monotone"
                    dataKey="Income"
                    stroke="#15803d"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="Expenses"
                    stroke="#dc2626"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="Investments"
                    stroke="#1d4ed8"
                    strokeWidth={2}
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        ),
      },
      {
        key: 'expenses',
        title: 'Expense Plots',
        isVisible: d.expense_by_type.length > 0 || d.expense_by_category.length > 0,
        content: (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {d.expense_by_type.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Expense Breakdown (Need vs Want)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={d.expense_by_type}
                          dataKey="amount"
                          nameKey="expense_type"
                          cx="50%"
                          cy="50%"
                          outerRadius={110}
                          label={(props) =>
                            wrappedPieLabel({
                              x: (props as { x?: number }).x,
                              y: (props as { y?: number }).y,
                              textAnchor: (props as { textAnchor?: 'start' | 'middle' | 'end' }).textAnchor,
                              name: String((props as { expense_type?: string }).expense_type ?? ''),
                              percent: Number((props as { percent?: number }).percent ?? 0),
                            })
                          }
                          labelLine={false}
                          isAnimationActive
                          animationDuration={1000}
                        >
                          {d.expense_by_type.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[(i + 2) % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<PieTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>

                    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm">
                      {d.expense_by_type.map((item, i) => (
                        <div key={item.expense_type} className="flex items-center gap-2 min-w-0">
                          <span
                            className="inline-block h-3 w-3 rounded-full shrink-0"
                            style={{ background: PIE_COLORS[(i + 2) % PIE_COLORS.length] }}
                          />
                          <span className="text-muted-foreground truncate">{item.expense_type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {d.expense_by_category.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Expense Breakdown by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={d.expense_by_category}
                          dataKey="amount"
                          nameKey="category_name"
                          cx="50%"
                          cy="50%"
                          outerRadius={110}
                          label={(props) =>
                            wrappedPieLabel({
                              x: (props as { x?: number }).x,
                              y: (props as { y?: number }).y,
                              textAnchor: (props as { textAnchor?: 'start' | 'middle' | 'end' }).textAnchor,
                              name: String((props as { category_name?: string }).category_name ?? ''),
                              percent: Number((props as { percent?: number }).percent ?? 0),
                            })
                          }
                          labelLine={false}
                          isAnimationActive
                          animationDuration={1000}
                        >
                          {d.expense_by_category.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<PieTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>

                    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm">
                      {d.expense_by_category.map((item, i) => (
                        <div key={item.category_name} className="flex items-center gap-2 min-w-0">
                          <span
                            className="inline-block h-3 w-3 rounded-full shrink-0"
                            style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                          />
                          <span className="text-muted-foreground truncate">{item.category_name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ),
      },
      {
        key: 'investments',
        title: 'Investment Plots',
        isVisible: d.investment_by_risk.length > 0 || d.investment_by_type.length > 0,
        content: (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {d.investment_by_risk.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Investment by Risk</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={d.investment_by_risk}
                          dataKey="amount"
                          nameKey="risk_type"
                          cx="50%"
                          cy="50%"
                          outerRadius={110}
                          label={(props) =>
                            wrappedPieLabel({
                              x: (props as { x?: number }).x,
                              y: (props as { y?: number }).y,
                              textAnchor: (props as { textAnchor?: 'start' | 'middle' | 'end' }).textAnchor,
                              name: String((props as { risk_type?: string }).risk_type ?? ''),
                              percent: Number((props as { percent?: number }).percent ?? 0),
                            })
                          }
                          labelLine={false}
                          isAnimationActive
                          animationDuration={1000}
                        >
                          {d.investment_by_risk.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[(i + 4) % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<PieTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>

                    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm">
                      {d.investment_by_risk.map((item, i) => (
                        <div key={item.risk_type} className="flex items-center gap-2 min-w-0">
                          <span
                            className="inline-block h-3 w-3 rounded-full shrink-0"
                            style={{ background: PIE_COLORS[(i + 4) % PIE_COLORS.length] }}
                          />
                          <span className="text-muted-foreground truncate">{item.risk_type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {d.investment_by_type.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Investment by Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={d.investment_by_type}
                          dataKey="amount"
                          nameKey="investment_type_name"
                          cx="50%"
                          cy="50%"
                          outerRadius={110}
                          label={(props) =>
                            wrappedPieLabel({
                              x: (props as { x?: number }).x,
                              y: (props as { y?: number }).y,
                              textAnchor: (props as { textAnchor?: 'start' | 'middle' | 'end' }).textAnchor,
                              name: String((props as { investment_type_name?: string }).investment_type_name ?? ''),
                              percent: Number((props as { percent?: number }).percent ?? 0),
                            })
                          }
                          labelLine={false}
                          isAnimationActive
                          animationDuration={1000}
                        >
                          {d.investment_by_type.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[(i + 6) % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<PieTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>

                    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm">
                      {d.investment_by_type.map((item, i) => (
                        <div key={item.investment_type_name} className="flex items-center gap-2 min-w-0">
                          <span
                            className="inline-block h-3 w-3 rounded-full shrink-0"
                            style={{ background: PIE_COLORS[(i + 6) % PIE_COLORS.length] }}
                          />
                          <span className="text-muted-foreground truncate">{item.investment_type_name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ),
      },
    ]

    return allPanels.filter((p) => p.isVisible)
  }, [chartData, d, year])

  useEffect(() => {
    setPanelIndex(0)
  }, [year])

  useEffect(() => {
    setPanelIndex((idx) => Math.min(idx, Math.max(0, panels.length - 1)))
  }, [panels.length])

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

  if (!d) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
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

        <Card>
          <CardContent className="py-10 text-center space-y-2">
            <p className="font-medium">Couldn’t load overview for {year}.</p>
            {isError && (
              <p className="text-sm text-muted-foreground">
                {(error as Error | undefined)?.message ?? 'Please try again.'}
              </p>
            )}
            <Link
              to={currentMonthPath}
              className="text-primary text-sm underline-offset-4 hover:underline inline-block"
            >
              Go to this month →
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

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
          <Card>
            <CardContent className="py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPanelIndex((i) => Math.max(0, i - 1))}
                    disabled={panelIndex === 0}
                    className="p-2 rounded-lg border bg-card text-card-foreground shadow-sm hover:bg-accent transition-colors disabled:opacity-40 disabled:hover:bg-card"
                    aria-label="Previous panel"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  <p className="font-semibold truncate">{panels[panelIndex]?.title}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-1">
                    {panels.map((p, i) => (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => setPanelIndex(i)}
                        className={`h-2.5 w-2.5 rounded-full transition-colors ${i === panelIndex ? 'bg-primary' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'}`}
                        aria-label={`Go to ${p.title}`}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setPanelIndex((i) => Math.min(panels.length - 1, i + 1))}
                    disabled={panelIndex >= panels.length - 1}
                    className="p-2 rounded-lg border bg-card text-card-foreground shadow-sm hover:bg-accent transition-colors disabled:opacity-40 disabled:hover:bg-card"
                    aria-label="Next panel"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div key={panels[panelIndex]?.key}>
            {panels[panelIndex]?.content}
          </div>
        </>
      )}
    </div>
  )
}
