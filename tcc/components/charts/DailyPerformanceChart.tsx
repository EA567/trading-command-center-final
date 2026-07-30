"use client";

import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { formatDate, formatMoney } from "@/lib/utils/format";
import { useTheme } from "@/lib/theme/ThemeContext";
import { getChartColors } from "@/lib/utils/chartColors";

export function DailyPerformanceChart({ data, height = 224 }: { data: { date: string; profit: number }[]; height?: number }) {
  const { theme } = useTheme();
  const colors = getChartColors(theme);

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
          <XAxis dataKey="date" tick={{ fill: colors.tick, fontSize: 10 }} tickFormatter={(d) => formatDate(d).replace(/, \d+$/, "")} axisLine={{ stroke: colors.grid }} tickLine={false} minTickGap={20} />
          <YAxis tick={{ fill: colors.tick, fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ background: colors.tooltipBg, border: `1px solid ${colors.tooltipBorder}`, borderRadius: 10, fontSize: 12 }} labelFormatter={(d) => formatDate(d)} formatter={(v: number) => [formatMoney(v), "P/L"]} />
          <Bar dataKey="profit" radius={[4, 4, 4, 4]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.profit >= 0 ? colors.profit : colors.loss} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
