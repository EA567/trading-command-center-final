"use client";

import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { formatMoney } from "@/lib/utils/format";
import { useTheme } from "@/lib/theme/ThemeContext";
import { getChartColors } from "@/lib/utils/chartColors";

export function ProfitBarChart({
  data, xKey = "label", yKey = "profit", height = 224, layout = "horizontal",
}: {
  data: Record<string, any>[];
  xKey?: string;
  yKey?: string;
  height?: number;
  layout?: "horizontal" | "vertical";
}) {
  const { theme } = useTheme();
  const colors = getChartColors(theme);

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout={layout} margin={{ top: 5, right: 10, left: layout === "vertical" ? 0 : -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} horizontal={layout !== "vertical"} />
          {layout === "vertical" ? (
            <>
              <XAxis type="number" tick={{ fill: colors.tick, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <YAxis type="category" dataKey={xKey} tick={{ fill: colors.tickSecondary, fontSize: 11 }} axisLine={false} tickLine={false} width={110} />
            </>
          ) : (
            <>
              <XAxis dataKey={xKey} tick={{ fill: colors.tick, fontSize: 11 }} axisLine={{ stroke: colors.grid }} tickLine={false} />
              <YAxis tick={{ fill: colors.tick, fontSize: 11 }} axisLine={false} tickLine={false} />
            </>
          )}
          <Tooltip contentStyle={{ background: colors.tooltipBg, border: `1px solid ${colors.tooltipBorder}`, borderRadius: 10, fontSize: 12 }} formatter={(v: number) => [formatMoney(v), "Profit"]} />
          <Bar dataKey={yKey} radius={layout === "vertical" ? [0, 6, 6, 0] : [6, 6, 6, 6]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry[yKey] >= 0 ? colors.profit : colors.loss} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
