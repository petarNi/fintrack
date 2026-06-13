import { Route, Routes } from "react-router-dom"
import Header from "./Header.jsx"
import Home from "./Home.jsx";
import Transaction from "./Transaction.jsx";
import Stats from "./Stats.jsx";
import Report from "./Report.jsx";
import LogIn from "./LogIn.jsx"
import Footer from "./Footer.jsx"
import SignUp from "./SignUp.jsx";
import getAuthorization from "../utils/auth.js";
import { useState, useEffect } from "react";
import FilterTransactions from "./FilterTransactions.jsx";
import AdminUser from "./AdminUser.jsx";
import AdminTransactions from "./AdminTransactions.jsx";


export default function App() {
    const [loggedIn, setLoggedIn] = useState(null);

    useEffect(() => {
        const auth = getAuthorization(); // vrati null ili { headers: { Authorization: ... } }
        if (auth) {
            setLoggedIn(true);
        } else {
            setLoggedIn(false);
        }
    }, []);

    return (
        <div>
            <Header loggedIn={loggedIn} setLoggedIn={setLoggedIn} />
            <Routes>
                <Route path="/" element={<Home loggedIn={loggedIn} />} />
                <Route path="/dodajTransakciju" element={<Transaction />} />
                <Route path="/izvestaji" element={<Report />} />
                <Route path="/prijava" element={<LogIn setLoggedIn={setLoggedIn} />} />
                <Route path="/registracija" element={<SignUp />} />
                <Route path="/statistika" element={<Stats />} />
                <Route path="/filtriranje" element={<FilterTransactions />} />
                <Route path="/admin/users" element={<AdminUser />} />
                <Route path="/admin/transactions" element={<AdminTransactions />} />
            </Routes>
            <Footer />
        </div>
    )
} 