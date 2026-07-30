"use client";

import React, { useId } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { formatDate, formatMoney } from "@/lib/utils/format";
import { useTheme } from "@/lib/theme/ThemeContext";
import { getChartColors } from "@/lib/utils/chartColors";

export function EquityCurveChart({ data, height = 288 }: { data: { date: string; equity: number }[]; height?: number }) {
  const { theme } = useTheme();
  const colors = getChartColors(theme);
  const gradientId = useId();

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.profit} stopOpacity={0.35} />
              <stop offset="100%" stopColor={colors.profit} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: colors.tick, fontSize: 11 }}
            tickFormatter={(d) => formatDate(d).replace(/, \d+$/, "")}
            axisLine={{ stroke: colors.grid }}
            tickLine={false}
            minTickGap={30}
          />
          <YAxis tick={{ fill: colors.tick, fontSize: 11 }} axisLine={false} tickLine={false} width={60} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
          <Tooltip
            contentStyle={{ background: colors.tooltipBg, border: `1px solid ${colors.tooltipBorder}`, borderRadius: 10, fontSize: 12 }}
            labelFormatter={(d) => formatDate(d)}
            formatter={(v: number) => [formatMoney(v), "Equity"]}
          />
          <Area type="monotone" dataKey="equity" stroke={colors.profit} strokeWidth={2} fill={`url(#${gradientId})`} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
