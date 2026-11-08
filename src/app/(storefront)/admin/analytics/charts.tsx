"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatMoney } from "@/lib/money";

const AXIS_TICK = { fontSize: 11 };
const GRID_STROKE = "#eee";

/** S75-11 (L-2): warm taupe/stone palette for the category mix pie —
 * anchored on the brand primary (no blues/indigos; the kitchen-era orange
 * family retired with the run-75 sweep). */
const PIE_PALETTE = ["#897a6c", "#a3937f", "#6f6357", "#bfae9a", "#5c534a", "#d6c9b8", "#9c8a76", "#7d7062"];

function ChartEmpty({ label }: { label: string }) {
  return (
    <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
      {label}
    </div>
  );
}

/** Top products by revenue — horizontal bars (recharts vertical layout). */
export function TopProductsChart({ data }: { data: { name: string; revenue: number }[] }) {
  if (data.length === 0) {
    return (
      <div className="h-[320px]">
        <ChartEmpty label="No sales data yet — place an order to see analytics." />
      </div>
    );
  }
  return (
    <div className="h-[320px] w-full" role="img" aria-label="Top products by revenue">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={GRID_STROKE} />
          <XAxis
            type="number"
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            // S75-11: ৳ axis ticks — the `$` prefix was a kitchen-era
            // residual on a BDT store.
            tickFormatter={(value: number) => `৳${Math.round(value / 100).toLocaleString("en-US")}`}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={150}
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip formatter={(value: unknown) => formatMoney(Number(value ?? 0))} />
          <Bar dataKey="revenue" fill="#897a6c" radius={[0, 6, 6, 0]} maxBarSize={22} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Revenue mix by category — pie with warm palette + legend. */
export function CategoryMixChart({ data }: { data: { name: string; value: number }[] }) {
  if (data.length === 0) {
    return (
      <div className="h-[300px]">
        <ChartEmpty label="No category revenue yet." />
      </div>
    );
  }
  return (
    <div className="h-[300px] w-full" role="img" aria-label="Revenue mix by category">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={PIE_PALETTE[index % PIE_PALETTE.length]} />
            ))}
          </Pie>
          <Legend verticalAlign="bottom" height={36} iconSize={10} wrapperStyle={{ fontSize: 11 }} />
          <Tooltip formatter={(value: unknown) => formatMoney(Number(value ?? 0))} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export type StatusSlice = { name: string; value: number; color: string };

/** Revenue by order status — donut with status-pill colors. */
export function StatusRevenueChart({ data }: { data: StatusSlice[] }) {
  if (data.length === 0) {
    return (
      <div className="h-[300px]">
        <ChartEmpty label="No order revenue yet." />
      </div>
    );
  }
  return (
    <div className="h-[300px] w-full" role="img" aria-label="Revenue by order status">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Legend verticalAlign="bottom" height={36} iconSize={10} wrapperStyle={{ fontSize: 11 }} />
          <Tooltip formatter={(value: unknown) => formatMoney(Number(value ?? 0))} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
