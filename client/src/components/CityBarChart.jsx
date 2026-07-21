// components/CityBarChart.jsx
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, LabelList
} from "recharts";

const BLUE_RAMP = ["#042c53", "#0c447c", "#185fa5", "#378add", "#85b7eb", "#b5d4f4"];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #d3d1c7",
      borderRadius: 8,
      padding: "8px 14px",
      fontSize: 12,
      boxShadow: "0 4px 16px rgba(0,0,0,0.08)"
    }}>
      <div style={{ color: "#888780", marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 600, color: "#0c447c" }}>
        {payload[0].value}
        <span style={{ fontSize: 11, fontWeight: 400, color: "#888780", marginLeft: 4 }}>reports</span>
      </div>
    </div>
  );
}

export default function CityBarChart({ data }) {
  if (!data?.length) return (
    <div style={{ padding: "24px 18px", fontSize: 13, color: "#b4b2a9", textAlign: "center" }}>
      No city data available
    </div>
  );

  const sorted = [...data].sort((a, b) => b.value - a.value);

  return (
    <div style={{ padding: "16px 18px 12px" }}>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={sorted}
          margin={{ top: 16, right: 8, left: -20, bottom: 0 }}
          barCategoryGap="35%"
        >
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: "#888780", fontFamily: "DM Sans, sans-serif" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#888780", fontFamily: "DM Sans, sans-serif" }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f0f2f5" }} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {sorted.map((_, i) => (
              <Cell
                key={i}
                fill={BLUE_RAMP[Math.min(i, BLUE_RAMP.length - 1)]}
              />
            ))}
            <LabelList
              dataKey="value"
              position="top"
              style={{ fontSize: 11, fontWeight: 600, fill: "#444441", fontFamily: "DM Sans, sans-serif" }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}