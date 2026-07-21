// components/TypePieChart.jsx
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#0c447c", "#185fa5", "#378add", "#85b7eb", "#b5d4f4", "#e6f1fb"];

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #d3d1c7",
      borderRadius: 8,
      padding: "8px 14px",
      fontSize: 12,
      boxShadow: "0 4px 16px rgba(0,0,0,0.08)"
    }}>
      <div style={{ color: "#888780", marginBottom: 3 }}>{d.name}</div>
      <div style={{ fontSize: 18, fontWeight: 600, color: "#0c447c" }}>
        {d.value}
        <span style={{ fontSize: 11, fontWeight: 400, color: "#888780", marginLeft: 4 }}>
          ({((d.value / d.payload.total) * 100).toFixed(0)}%)
        </span>
      </div>
    </div>
  );
}

export default function TypePieChart({ data }) {
  if (!data?.length) return (
    <div style={{ padding: "24px 18px", fontSize: 13, color: "#b4b2a9", textAlign: "center" }}>
      No type data available
    </div>
  );

  const total = data.reduce((s, d) => s + d.value, 0);
  const withTotal = data.map(d => ({ ...d, total }));

  return (
    <div style={{ padding: "16px 18px 12px" }}>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={withTotal}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={3}
            strokeWidth={0}
          >
            {withTotal.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Custom legend */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "8px 16px",
        marginTop: 4,
        paddingTop: 10,
        borderTop: "1px solid #f0f2f5"
      }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
            <span style={{
              width: 8, height: 8, borderRadius: 2,
              background: COLORS[i % COLORS.length],
              flexShrink: 0, display: "inline-block"
            }} />
            <span style={{ color: "#888780" }}>{d.name}</span>
            <span style={{ fontWeight: 600, color: "#444441" }}>{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}