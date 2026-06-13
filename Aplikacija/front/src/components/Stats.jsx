import { useState, useEffect } from "react";
import getAuthorization from "../utils/auth"
import "../styles/stats.css"
import api from "../api";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis
} from "recharts";


export default function Stats() {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const auth = getAuthorization();
                const response = await api.get("/transaction/stats", auth);
                setStats(response.data);
            } catch (error) {
                console.error("Greška pri učitavanju statistike: ", error.response?.data || error.message);
            await showAlert("Greška pri učitavanju statistike", { title: "Greška" });
                setStats(null);
            }
        };
        fetchStats();

    }, []);


    if (!stats) {
        return <p>Ucitavanja podataka...</p>;
    }
    const styles = typeof window !== "undefined" ? getComputedStyle(document.documentElement) : null;
    const palette = {
    primary: styles?.getPropertyValue("--primary").trim() || "#00FF88",
    danger: styles?.getPropertyValue("--danger").trim() || "#FF5C7C"
    };
    const totalsPieData = [
    { name: "Prihodi", value: stats.totals?.income ?? 0 },
    { name: "Rashodi", value: stats.totals?.expense ?? 0 }
    ];

    const methodBarData = [
    {
      name: "Keš",
      Prihodi: stats.method?.cash?.income ?? 0,
      Rashodi: stats.method?.cash?.expense ?? 0
    },
    {
      name: "Kartica",
      Prihodi: stats.method?.card?.income ?? 0,
      Rashodi: stats.method?.card?.expense ?? 0
    }
    ];



  return (
    <main className="stats">
      <h2 className="section-title">Statistika</h2>
      <h1 id="stats-heading" className="stats__title">Finansijski pulsevi</h1>
      <p className="stats__subtitle">
        Vizuelni pregled prihoda, rashoda i transfera kroz neon sočivo FinTrack analitike.
      </p>

      <div className="stats__grid">
        <div className="card stats__card">
          <h3 className="card__title">Ukupno</h3>
          <div className="stats__totals">
            <div>
              <span className="stats__label">Prihodi</span>
              <span className="stats__value stats__value--positive">{stats.totals?.income} RSD</span>
            </div>
            <div>
              <span className="stats__label">Rashodi</span>
              <span className="stats__value stats__value--negative">{stats.totals?.expense} RSD</span>
            </div>
            <div>
              <span className="stats__label">Neto saldo</span>
              <span className="stats__value">{stats.totals?.net} RSD</span>
            </div>
          </div>
        </div>

        <div className="card stats__card">
          <h3 className="card__title">Raspodela prihoda i rashoda</h3>
          <div className="stats__chart">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={totalsPieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={100} paddingAngle={6}>
                  {totalsPieData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={index === 0 ? palette.primary : palette.danger}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `${value} RSD`}
                  contentStyle={{
                    backgroundColor: "var(--surface)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid rgba(0,255,136,0.24)",
                  }}
                  itemStyle={{
                    color: "var(--text)"
                  }}
                />
                <Legend
                  formatter={(value) => <span className="stats__legend-text">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card stats__card">
          <h3 className="card__title">Način plaćanja</h3>
          <div className="stats__chart">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={methodBarData} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,255,136,0.12)" />
                <XAxis dataKey="name" stroke="var(--muted)" tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted)" tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                <Tooltip
                  formatter={(value) => `${value} RSD`}
                  contentStyle={{
                    backgroundColor: "var(--surface)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid rgba(0,255,136,0.24)",
                    color: "var(--text)"
                  }}
                  cursor={{ fill: "rgba(0, 217, 255, 0.08)" }}
                />
                <Legend
                  formatter={(value) => <span className="stats__legend-text">{value}</span>}
                />
                <Bar dataKey="Prihodi" fill={palette.primary} radius={[10, 10, 0, 0]} />
                <Bar dataKey="Rashodi" fill={palette.danger} radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card stats__card">
          <h3 className="card__title">Po kategorijama</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Kategorija</th>
                <th>Tip</th>
                <th>Ukupno</th>
              </tr>
            </thead>
            <tbody>
              {(stats.byCategory ?? []).map((row, index) => (
                <tr key={index}>
                  <td>{row.categoryName}</td>
                  <td>{row.categoryType === 0 ? "Prihod" : "Rashod"}</td>
                  <td>{row.total} RSD</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}