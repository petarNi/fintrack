import "../styles/header.css";
import React, { useState, useEffect } from "react"
import { useNavigate, NavLink, useLocation } from "react-router-dom"
import finTracLogo from "../images/logo.png"

export default function Header({ loggedIn, setLoggedIn }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const role = localStorage.getItem("role");
  const isAdmin = role === "Admin";

  const routeLabels = {
    '/': 'Početna',
    '/dodajTransakciju': 'Transakcije',
    '/statistika': 'Statistika',
    '/filtriranje': 'Filtriranje',
    '/izvestaji': 'Izveštaji',
    '/admin/users': 'Admin · Korisnici',
    '/admin/transactions': 'Admin · Transakcije',
    '/dodajtransakciju': 'Transakcije',
    '/prijava': 'Prijava',
    '/registracija': 'Registracija'
  };
  const currentLabel = routeLabels[location.pathname] || 'FinTrack';


  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    setLoggedIn(false);
    navigate("/");
  }
  return (
    <header className="header" role="banner">
      <div className="header__inner">
        <button
          className="header__brand"
          type="button"
          onClick={() => navigate("/")}

        >
          <img src={finTracLogo} alt="FinTrack" className="header__logo" />
          <span className="header__title">FinTrack</span>
        </button>
        <button
          className="header__toggle"
          type="button"
          onClick={() => setMenuOpen((value) => !value)}
        >
          <span className="header__toggle-line" />
          <span className="header__toggle-line" />
          <span className="header__toggle-line" />
        </button>
        <span className="header__current">{currentLabel}</span>
        <nav
          id="primary-navigation"
          className={`header__links ${menuOpen ? "is-open" : ""}`.trim()}
        >
          {loggedIn && !isAdmin ? (
            <>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `header__link ${isActive ? "is-active" : ""}`.trim()
                }
              >
                Početna
              </NavLink>
              <NavLink
                to="/dodajTransakciju"
                className={({ isActive }) =>
                  `header__link ${isActive ? "is-active" : ""}`.trim()
                }
              >
                Transakcije
              </NavLink>
              <NavLink
                to="/statistika"
                className={({ isActive }) =>
                  `header__link ${isActive ? "is-active" : ""}`.trim()
                }
              >
                Statistika
              </NavLink>
              <NavLink
                to="/filtriranje"
                className={({ isActive }) =>
                  `header__link ${isActive ? "is-active" : ""}`.trim()
                }
              >
                Filtriranje
              </NavLink>
              <NavLink
                to="/izvestaji"
                className={({ isActive }) =>
                  `header__link ${isActive ? "is-active" : ""}`.trim()
                }
              >
                Izveštaji
              </NavLink>
              <button className="btn btn--ghost header__logout" onClick={handleLogout}>
                Odjava
              </button>
            </>
          ) :
            loggedIn && isAdmin ? (
              <>
                <NavLink
                  to="/admin/users"
                  className={({ isActive }) =>
                    `header__link ${isActive ? "is-active" : ""}`.trim()
                  }
                >
                  Korisnici
                </NavLink>
                <NavLink
                  to="/admin/transactions"
                  className={({ isActive }) =>
                    `header__link ${isActive ? "is-active" : ""}`.trim()
                  }
                >
                  Transakcije
                </NavLink>
                <button className="btn btn--ghost header__logout" onClick={handleLogout}>
                  Odjava
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `header__link ${isActive ? "is-active" : ""}`.trim()
                  }
                >
                  Početna
                </NavLink>
                <NavLink
                  to="/prijava"
                  className={({ isActive }) =>
                    `header__link ${isActive ? "is-active" : ""}`.trim()
                  }
                >
                  Prijava
                </NavLink>
                <NavLink
                  to="/registracija"
                  className={({ isActive }) =>
                    `header__link ${isActive ? "is-active" : ""}`.trim()
                  }
                >
                  Registracija
                </NavLink>
                <button className="btn header__cta" onClick={() => navigate("/prijava")}>
                  Prijavite se
                </button>
              </>
            )}
        </nav>
      </div>
    </header>
  );
}