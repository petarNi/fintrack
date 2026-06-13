import "../styles/login.css"
import { useState } from "react"
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import { useToast } from "../context/ToastContext";
import { useAlert } from "../context/AlertContext";

export default function LogIn({ setLoggedIn }) {
  const [credentials, setCredentials] = useState({
    usernameOrEmail: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const { showAlert } = useAlert();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post("/auth/login", credentials);

      const user = response.data.user;

      localStorage.setItem("token", response.data.token);
      console.log(response.data.user);
      navigate("/");
      console.log(user.role);
      if (response.status === 200) {
        showToast("Uspešno ste se prijavili", "success");
        localStorage.setItem("userId", user.id);
        const role = user.role === "Admin" ? "Admin" : "User";
        console.log(role);
        localStorage.setItem("role", role)
        setLoggedIn(true);
        navigate("/");
      }
    }
    catch (error) {
      if (error.response) {
        await showAlert("Greška " + error.response.data.message, { title: "Greška" });
      }
      else {
        await showAlert("Došlo je do greške pri povezivanju sa serverom.", { title: "Greška" });
      }
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login">
      <div className="login__grid">
        <section className="login__hero">
          <h2 className="section-title">FinTrack</h2>
          <h1 id="login-heading" className="login__title">Prijava u kontrolni centar</h1>
          <p className="login__subtitle">
            Upravljaj finansijama uz futuristički interfejs, analitiku u realnom vremenu i bezbednu sinhronizaciju.
          </p>
          <ul className="login__bullets">
            <li>Automatski obračuni prihoda, rashoda i neto stanja.</li>
            <li>Neonski grafici koji jasno prate trendove.</li>
            <li>Detaljna filtriranja i brze izmene transakcija.</li>
          </ul>
        </section>

        <div className="card login__card">
          <h3 className="card__title">Prijavite se</h3>
          <form className="login__form" onSubmit={handleSubmit}>
            <div className="login__field">
              <label htmlFor="usernameOrEmail">Korisničko ime ili email</label>
              <input
                id="usernameOrEmail"
                name="usernameOrEmail"
                type="text"
                className="input"
                autoComplete="username"
                placeholder="npr. milan.fintrack"
                value={credentials.usernameOrEmail}
                onChange={handleChange}
                required
              />
            </div>

            <div className="login__field">
              <label htmlFor="password">Lozinka</label>
              <input
                id="password"
                name="password"
                type="password"
                className="input"
                autoComplete="current-password"
                placeholder="••••••••"
                value={credentials.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="login__actions">
              <button type="submit" className="btn" disabled={loading}>
                {loading ? "Prijavljivanje..." : "Prijavi se"}
              </button>
              <Link to="/registracija" className="btn btn--ghost">
                Nemate nalog? Registrujte se
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}