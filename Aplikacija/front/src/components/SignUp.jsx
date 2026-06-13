import "../styles/signup.css";
import { useState } from "react"
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import { useToast } from "../context/ToastContext";
import { useAlert } from "../context/AlertContext";

export default function SignUp() {
  const [user, setUser] = useState({
    FirstName: "",
    LastName: "",
    Username: "",
    Email: "",
    Password: "",
    CashBalance: 0,
    CardBalance: 0,
    AdminCode: ""
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { showAlert } = useAlert();

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setUser(prev => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? 0 : parseFloat(value)) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (user.Password.length < 6) {
      await showAlert("Šifra mora imati najmanje 6 karaktera!", { title: "Nevažeća lozinka" });
      return;
    }
    setLoading(true);
    try {
      const response = await api.post("/auth/signup", user);

      if (response.status === 201 || response.status === 200) {
        showToast("Uspešno ste se registrovali!", "success");
        setUser({
          FirstName: "",
          LastName: "",
          Username: "",
          Email: "",
          Password: "",
          CashBalance: 0,
          CardBalance: 0,
          AdminCode: ""
        });
        navigate("/prijava");
      }
    } catch (error) {
      if (error.response) {
        // Server vratio grešku (npr. 400 ili 500)
        await showAlert(`Greška: ${error.response.data.message}`, { title: "Registracija neuspešna" });
      } else {
        await showAlert("Došlo je do greške pri povezivanju sa serverom.", { title: "Greška" });
      }
      console.error(error);
    }
  }

  return (
    <main className="signup">
      <div className="signup__grid">
        <section className="signup__hero">
          <h2 className="section-title">FinTrack</h2>
          <h1 id="signup-heading" className="signup__title">Otvorite nalog</h1>
          <p className="signup__subtitle">
            Registrujte se i povežite svoje račune, kartice i keš u jedinstveni finansijski interfejs.
          </p>
          <ul className="signup__bullets">
            <li>Pratite svoje prihode i rashode na jednom mestu.</li>
            <li>Uvek znajte koliko ste potrošili i koliko ste u plusu.</li>
            <li>Analizirajte navike i preuzmite kontrolu nad finansijama.</li>
          </ul>
        </section>

        <div className="card signup__card">
          <h3 className="card__title">Registrujte nalog</h3>
          <form className="signup__form" onSubmit={handleSubmit}>
            <div className="signup__field">
              <label htmlFor="FirstName">Ime</label>
              <input
                className="input"
                id="FirstName"
                name="FirstName"
                type="text"
                placeholder="npr. Milica"
                value={user.FirstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="signup__field">
              <label htmlFor="LastName">Prezime</label>
              <input
                className="input"
                id="LastName"
                name="LastName"
                type="text"
                placeholder="npr. Petrović"
                value={user.LastName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="signup__field">
              <label htmlFor="Username">Korisničko ime</label>
              <input
                className="input"
                id="Username"
                name="Username"
                type="text"
                placeholder="npr. milica.fin"
                value={user.Username}
                onChange={handleChange}
                required
              />
            </div>
            <div className="signup__field">
              <label htmlFor="Email">Email</label>
              <input
                className="input"
                id="Email"
                name="Email"
                type="email"
                placeholder="primer@fintrack.rs"
                value={user.Email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="signup__field">
              <label htmlFor="Password">Lozinka</label>
              <input
                className="input"
                id="Password"
                name="Password"
                type="password"
                placeholder="Najmanje 6 karaktera"
                value={user.Password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="signup__field">
              <label htmlFor="CashBalance">Početno stanje (keš)</label>
              <input
                className="input"
                id="CashBalance"
                name="CashBalance"
                type="number"
                min="0"
                step="0.01"
                value={user.CashBalance}
                onChange={handleChange}
              />
            </div>
            <div className="signup__field">
              <label htmlFor="CardBalance">Početno stanje (kartica)</label>
              <input
                className="input"
                id="CardBalance"
                name="CardBalance"
                type="number"
                min="0"
                step="0.01"
                value={user.CardBalance}
                onChange={handleChange}
              />
            </div>
            <div className="signup__field">
              <label htmlFor="AdminCode">Admin kod (opciono)</label>
              <input
                className="input"
                id="AdminCode"
                name="AdminCode"
                type="text"
                placeholder="Unesite admin kod ako registrujete admina"
                value={user.AdminCode}
                onChange={handleChange}
              />
            </div>

            <div className="signup__actions">
              <button className="btn" type="submit" disabled={loading}>
                {loading ? "Kreiranje..." : "Registruj se"}
              </button>
              <Link to="/prijava" className="btn btn--ghost">
                Već imate nalog? Prijavite se
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}