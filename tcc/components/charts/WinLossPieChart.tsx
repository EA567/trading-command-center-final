"use client";

import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { useTheme } from "@/lib/theme/ThemeContext";
import { getChartColors } from "@/lib/utils/chartColors";

export function WinLossPieChart({ wins, losses, height = 208 }: { wins: number; losses: number; height?: number }) {
  const { theme } = useTheme();
  const colors = getChartColors(theme);
  const data = [
    { name: "Wins", value: wins, color: colors.profit },
    { name: "Losses", value: losses, color: colors.loss },
  ];
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={4}>
            {data.map((e, i) => (
              <Cell key={i} fill={e.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip contentStyle={{ background: colors.tooltipBg, border: `1px solid ${colors.tooltipBorder}`, borderRadius: 10, fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
