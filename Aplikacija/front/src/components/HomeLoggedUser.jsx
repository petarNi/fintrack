import "../styles/HomeLoggedUser.css";
import { useEffect, useState } from "react";
import BalanceView from "./BalanceView";
import api from "../api";
import { useNavigate } from "react-router-dom";
import getAuth from "../utils/auth";

export default function HomePageLoggedUser() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [balanceData, setBalanceData] = useState(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        async function fetchUserData() {
            const auth = getAuth();
            const userId = localStorage.getItem("userId")
            if (!auth || !userId) {
                navigate("/prijava");
                return;
            }
            try {
                const response = await api.get(`/user/Myinfo`, auth);
                setUserData(response.data);

                const responseBalance = await api.get(`/user/balance`, auth);
                setBalanceData(responseBalance.data);

            } catch (error) {
                console.error("Greška pri dohvatanju podataka:", error);
                if (error.response && error.response.status === 401) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("userId");
                    navigate("/prijava");
                }

            }finally {
                setLoading(false);
            }
        }
        fetchUserData();
    }, []);

    if (loading) {
    return (
      <main className="home-logged">
        <h2 className="section-title">Učitavanje podataka</h2>
        <p className="home-logged__status">Molimo sačekajte...</p>
      </main>
    );
  }

  if (!userData || !balanceData) {
    return (
      <main className="home-logged">
        <h2 className="section-title">Podaci nedostupni</h2>
        <p className="home-logged__status">
          Trenutno ne možemo da prikažemo informacije. Pokušajte ponovo kasnije.
        </p>
      </main>
    );
  }

  const username = userData.username;

   return (
    <main className="home-logged" >
      <header className="home-logged__header">
        <h2 className="section-title">
          <span className="home-logged__pulse" ></span>
          Kontrolna tabla
        </h2>
        <h1 id="home-logged-heading" className="home-logged__welcome">Dobrodošao, {username}</h1>
        <p className="home-logged__subtitle">
          Pregled svih tvojih finansijskih tokova na jednom mestu.
        </p>
      </header>

      <section className="home-logged__summary">
        <article className="metric-card metric-card--primary">
          <p className="metric-card__label">Ukupni balans</p>
          <p className="metric-card__value">{balanceData.totalBalance} RSD</p>
        </article>
        <article className="metric-card metric-card--accent">
          <p className="metric-card__label">Keš stanje</p>
          <p className="metric-card__value">{userData.cashBalance} RSD</p>
        </article>
        <article className="metric-card metric-card--muted">
          <p className="metric-card__label">Kartica</p>
          <p className="metric-card__value">{userData.cardBalance} RSD</p>
        </article>
      </section>

      <div className="card home-logged__cta">
        <div className="home-logged__cta-inner">
          <div>
            <h2 className="home-logged__cta-title">Dodaj novu transakciju</h2>
            <p className="home-logged__cta-text">
              Zabeleži prihod, rashod ili transfer u samo par klikova.
            </p>
          </div>
          <button className="btn home-logged__cta-button" onClick={() => navigate("/dodajTransakciju")}>
            Dodaj transakciju
          </button>
        </div>
      </div>

      <section className="home-logged__balances">
        <BalanceView
          title="Keš nalog"
          income={userData.cashIncome}
          expense={userData.cashExpense}
          balance={userData.cashBalance}
        />
        <BalanceView
          title="Kartični nalog"
          income={userData.cardIncome}
          expense={userData.cardExpense}
          balance={userData.cardBalance}
        />
      </section>
    </main>
  );
}
