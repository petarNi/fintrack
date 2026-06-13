import { useEffect, useState } from "react"
import { CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts"
import { useNavigate } from "react-router-dom";
import "../styles/report.css"
import getAuthorization from "../utils/auth";
import api from "../api";

export default function Report() {
  const [userData, setUserData] = useState([]);
  const [year, setYear] = useState("");
  const [allYears, setAllYears] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function fetchStats() {
    const auth = getAuthorization();

    if (!auth) {
      navigate("/prijava");
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (year) params.append("year", year);
      if (allYears) params.append("allYears", allYears);
      let chartData = [];
      const response = await api.get(`/transaction/stats/period?${params.toString()}`, auth);
      if (response.data.scope === "allYears") {
        chartData = response.data.years.map(y => ({

          Period: y.year,
          Prihodi: y.income,
          Rashodi: y.expense,
          Transferi: y.transfer

        }));
      }
      else {
        chartData = response.data.months.map(m => ({
          Period: m.monthName,
          Prihodi: m.income,
          Rashodi: m.expense,
          Transferi: m.transfer
        }));
      }


      setUserData(chartData);
    } catch (error) {
      console.log("Greska pri prihvatanju podataka!", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStats();
  }, []);

  const styles = typeof window !== "undefined" ? getComputedStyle(document.documentElement) : null;
  const palette = {
    income: styles?.getPropertyValue("--primary").trim() || "#00FF88",
    expense: styles?.getPropertyValue("--danger").trim() || "#FF5C7C",
    transfer: styles?.getPropertyValue("--accent").trim() || "#00D9FF"
  };

  const hasData = userData.length > 0;

  return (
    <main className="report">
      <h2 className="section-title">Izveštaji</h2>
      <h1 id="report-heading" className="report__title">Periodični puls bilansa</h1>
      <p className="report__subtitle">
        Pregled kretanja prihoda, rashoda i transfera po mesecima uz neon analitiku.
      </p>

      <div className="card report__filters">
        <h3 className="card__title">Filter</h3>
        <form className="report__form" onSubmit={(event) => event.preventDefault()}>
          <div className="report__field">
            <label htmlFor="report-year">Godina</label>
            <input
              className="input"
              id="report-year"
              type="number"
              min="2000"
              max="2100"
              value={year}
              onChange={(event) => setYear(event.target.value)}
              placeholder="npr. 2024"
              disabled={allYears}
            />
          </div>
          <div className="report__field report__toggle">
            <label htmlFor="report-all-years">Sve godine</label>
            <input
              id="report-all-years"
              type="checkbox"
              checked={allYears}
              onChange={(event) => setAllYears(event.target.checked)}
            />
          </div>
          <div className="report__actions">
            <button className="btn" type="button" onClick={fetchStats} disabled={loading}>
              {loading ? "Učitavanje..." : "Prikaži"}
            </button>
          </div>
        </form>
      </div>

      <div className="card report__chart-card">
        <h3 className="card__title">{allYears ? "Godišnja raspodela" : "Mesečna raspodela"}</h3>
        {hasData ? (
          <div className="report__chart">
            <ResponsiveContainer width="100%" height={360}>
              <BarChart data={userData} barGap={12}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,255,136,0.12)" />
                <XAxis dataKey="Period" stroke="var(--muted)" tickLine={false} axisLine={false} />
                <YAxis
                  stroke="var(--muted)"
                  tickFormatter={(value) => `${value / 1000}k`}
                  tickLine={false}
                  axisLine={false}
                />
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
                <Legend formatter={(value) => <span className="report__legend-text">{value}</span>} />
                <Bar dataKey="Prihodi" fill={palette.income} radius={[10, 10, 0, 0]} />
                <Bar dataKey="Rashodi" fill={palette.expense} radius={[10, 10, 0, 0]} />
                <Bar dataKey="Transferi" fill={palette.transfer} radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="report__empty">Nema podataka za odabrani period.</p>
        )}
      </div>
    </main>
  );
}