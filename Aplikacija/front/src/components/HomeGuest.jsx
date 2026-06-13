import "../styles/homeGuest.css";
import { Link } from "react-router-dom";

export default function HomeGuest() {
  return (
    <main className="home-guest" >
      <section className="home-guest__hero">
        <div className="home-guest__glow" />
        <div className="home-guest__content">
          <h2 className="section-title">FinTrack</h2>
          <h1 id="home-guest-heading" className="home-guest__title">
            Upravljaj svojim finansijama
          </h1>
          <p className="home-guest__subtitle">
            Moderan dizajn donosi fokus na ono što je važno: podatke o vašem novcu.
          </p>
          <div className="home-guest__cta">
            <Link to="/prijava" className="btn">Prijava</Link>
            <Link to="/registracija" className="btn btn--ghost">Registracija</Link>
          </div>
        </div>
      </section>

      <section className="home-guest__features" >
        <h2 className="section-title">Šta dobijate</h2>
        <div className="home-guest__grid">
          <div className="card home-guest__card">
            <h3 className="card__title">Neonska analitika</h3>
            <p className="home-guest__card-text">
              Detaljni grafikoni prihoda, rashoda i neto salda u realnom vremenu.
            </p>
          </div>
          <div className="card home-guest__card">
            <h3 className="card__title">Bezbednost na prvom mestu</h3>
            <p className="home-guest__card-text">
              Token autentikacija i automatsko odjavljivanje kada sesija istekne.
            </p>
          </div>
          <div className="card home-guest__card">
            <h3 className="card__title">Brze radnje</h3>
            <p className="home-guest__card-text">
              Dodajte transakciju, filtrirajte ili izvezite podatke iz istog ekrana.
            </p>
          </div>
        </div>
      </section>

      <section className="home-guest__steps">
        <h2 className="section-title">Tri koraka do kontrole</h2>
        <div className="home-guest__steps-grid">
          <article className="home-guest__step">
            <span className="home-guest__step-number">01</span>
            <h3 className="home-guest__step-title">Registrujte se</h3>
            <p className="home-guest__step-text">
              Otvorite nalog za manje od jednog minuta.
            </p>
          </article>
          <article className="home-guest__step">
            <span className="home-guest__step-number">02</span>
            <h3 className="home-guest__step-title">Povežite izvore</h3>
            <p className="home-guest__step-text">
              Keš i kartica objedinjeni u jednoj kontrolnoj tabli.
            </p>
          </article>
          <article className="home-guest__step">
            <span className="home-guest__step-number">03</span>
            <h3 className="home-guest__step-title">Pratite trendove</h3>
            <p className="home-guest__step-text">
              Vizuelni uvidi i filtriranja koji otkrivaju skrivena troškarska mesta.
            </p>
          </article>
        </div>
      </section>

      <section className="home-guest__cta-block">
        <div className="card home-guest__cta-card">
          <div className="home-guest__cta-card-body">
            <div>
              <h2 className="home-guest__cta-title">Pređi na FinTrack danas</h2>
              <p className="home-guest__cta-text">
                Iskoristi naprednu analitiku, tematske grafikone i prilagodljive filtere.
              </p>
            </div>
            <Link to="/registracija" className="btn">Započni odmah</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
