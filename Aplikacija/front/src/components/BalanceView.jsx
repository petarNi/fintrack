import "../styles/HomeLoggedUser.css";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

export default function BalanceView({ title, income = 0, expense = 0, balance = 0 }) {
  const styles = typeof window !== "undefined" ? getComputedStyle(document.documentElement) : null;
  const palette = [
    styles?.getPropertyValue("--primary").trim() || "#00FF88",
    styles?.getPropertyValue("--danger").trim() || "#FF5C7C"
  ];
  const data = [
    { name: "Prihodi", value: Number(income) || 0 },
    { name: "Rashodi", value: Number(expense) || 0 }
  ];

  const hasData = data.some((item) => item.value > 0);

  return (
    <div className="card balance-card">
      <h2 className="section-title">{title}</h2>
      <div className="balance-card__grid">
        <div className="balance-card__metrics">
          <div className="balance-card__metric">
            <p className="balance-card__label">Ukupni prihodi</p>
            <p className="balance-card__value balance-card__value--positive">{income} RSD</p>
          </div>
          <div className="balance-card__metric">
            <p className="balance-card__label">Ukupni rashodi</p>
            <p className="balance-card__value balance-card__value--negative">{expense} RSD</p>
          </div>
          <div className="balance-card__metric">
            <p className="balance-card__label">Stanje</p>
            <p className="balance-card__value">{balance} RSD</p>
          </div>
        </div>
        <div className="balance-card__chart">
          {hasData ? (
            <ResponsiveContainer width={260} height={260}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={6}
                >
                  {data.map((entry, index) => (
                    <Cell key={entry.name} fill={palette[index % palette.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `${value} RSD`}
                  contentStyle={{
                    backgroundColor: "var(--surface)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid rgba(0,255,136,0.24)",
                    color: "var(--text)",
                    fontSize: "var(--fs-sm)"
                  }}
                  itemStyle={{ color: "var(--text)", fontSize: "var(--fs-sm)" }}
                />
                <Legend
                  formatter={(value) => <span className="balance-card__legend-text">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="balance-card__empty">Nema dovoljno podataka za grafikon.</p>
          )}
        </div>
      </div>
    </div>
  );
}
