// components/PriorityChart.jsx
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, LabelList
} from "recharts";

const PRIORITY_COLORS = {
  low: { bar: "#639922", bg: "#eaf3de", text: "#27500a" },
  medium: { bar: "#ba7517", bg: "#faeeda", text: "#633806" },
  high: { bar: "#e24b4a", bg: "#fcebeb", text: "#791f1f" },
};

const DEFAULT_COLOR = { bar: "#378add", bg: "#e6f1fb", text: "#0c447c" };

function getColor(name) {
  return PRIORITY_COLORS[name?.toLowerCase()] || DEFAULT_COLOR;
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const cfg = getColor(label);
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #d3d1c7",
      borderRadius: 8,
      padding: "8px 14px",
      fontSize: 12,
      boxShadow: "0 4px 16px rgba(0,0,0,0.08)"
    }}>
      <div style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: 4,
        background: cfg.bg,
        color: cfg.text,
        fontSize: 11,
        fontWeight: 600,
        marginBottom: 4,
        textTransform: "capitalize"
      }}>
        {label}
      </div>
      <div style={{ fontSize: 18, fontWeight: 600, color: cfg.bar }}>
        {payload[0].value}
        <span style={{ fontSize: 11, fontWeight: 400, color: "#888780", marginLeft: 4 }}>cases</span>
      </div>
    </div>
  );
}

export default function PriorityChart({ data }) {
  if (!data?.length) return (
    <div style={{ padding: "24px 18px", fontSize: 13, color: "#b4b2a9", textAlign: "center" }}>
      No priority data available
    </div>
  );

  // Ensure consistent order: high → medium → low
  const ORDER = ["high", "medium", "low"];
  const sorted = [...data].sort(
    (a, b) => ORDER.indexOf(a.name?.toLowerCase()) - ORDER.indexOf(b.name?.toLowerCase())
  );

  return (
    <div style={{ padding: "16px 18px 12px" }}>
      {/* Mini summary pills */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {sorted.map((d, i) => {
          const cfg = getColor(d.name);
          return (
            <div key={i} style={{
              flex: 1,
              background: cfg.bg,
              borderRadius: 8,
              padding: "8px 10px",
              textAlign: "center"
            }}>
              <div style={{ fontSize: 20, fontWeight: 600, color: cfg.bar }}>{d.value}</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: cfg.text, textTransform: "capitalize", marginTop: 2 }}>
                {d.name}
              </div>
            </div>
          );
        })}
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <BarChart
          data={sorted}
          margin={{ top: 16, right: 8, left: -20, bottom: 0 }}
          barCategoryGap="40%"
        >
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: "#888780", fontFamily: "DM Sans, sans-serif", textTransform: "capitalize" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => v.charAt(0).toUpperCase() + v.slice(1)}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#888780", fontFamily: "DM Sans, sans-serif" }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f0f2f5" }} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {sorted.map((d, i) => (
              <Cell key={i} fill={getColor(d.name).bar} />
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