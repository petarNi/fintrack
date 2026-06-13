import { useEffect, useState } from "react";
import getAuthorization from "../utils/auth"
import api from "../api";
import "../styles/admin.css";
import { useToast } from "../context/ToastContext";
import { useAlert } from "../context/AlertContext";

export default function AdminTransactions() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState([true]);
    const { showToast } = useToast();
    const { showAlert, showConfirm } = useAlert();

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const auth = getAuthorization();
                const token = localStorage.getItem("token");

                if (!token) {
                    setLoading(false);
                    return;
                }

                const response = await api.get("/Admin/transactions/pending", auth);
                setTransactions(response.data);
                setLoading(false);


            }
            catch (err) {
                console.error(err);
                await showAlert("Greška pri učitavanju transakcija.", { title: "Greška" });
                setLoading(false);
            }

        }
        fetchTransactions();
    }, [showAlert])

    const handleAprove = async (id) => {
        try {
            const auth = getAuthorization();
            const token = localStorage.getItem("token");

            if (!token) {
                setLoading(false);
                return;
            }

            await api.post(`/Admin/transactions/${id}/approve`, null, auth);

            setTransactions(prev => prev.filter(tx => tx.id !== id));
            showToast("Transakcija je odobrena!", "success");


        }
        catch (err) {
            console.error(err);
            await showAlert("Greška pri odobravanju transakcije.", { title: "Greška" });
            setLoading(false);
        }
    }

    const handleReject = async (id) => {
        try {

            const confirmed = await showConfirm("Da li ste sigurni da želite da odbijete ovu transakciju?", {
                title: "Potvrda odbijanja",
            });
            if (!confirmed) return;

            const auth = getAuthorization();
            const token = localStorage.getItem("token");

            if (!token) {
                setLoading(false);
                return;
            }

            await api.post(`/Admin/transactions/${id}/reject`, null, auth);

            setTransactions(prev => prev.filter(tx => tx.id !== id));
            showToast("Transakcija je odbijena!", "success");

        }
        catch (err) {
            console.error(err);
            await showAlert("Greška pri odbijanju transakcije.", { title: "Greška" });
            setLoading(false);
        }
    }

        function getTypeClass(type) {
        if (type === 2) return "transfer";
        if (type === 1) return "expense";
        return "income";
    }

    function getTypeLabel(type) {
        if (type === 2) return "Transfer";
        if (type === 1) return "Rashod";
        return "Prihod";
    }

    function getPaymentMethodLabel(method) {
        if (method === 0) return "Keš";
        if (method === 1) return "Kartica";
        return "-";
    }


    if (loading)
        return <p>Učitavanje...</p>;

    return (

        <main className="admin">
            <header className="admin__hero">
                <p className="badge">Kontrolni centar</p>
                <h1 className="admin__title">Transakcije na čekanju</h1>
                <p className="admin__subtitle">
                    Pregledaj sumnjive stavke i reaguj pre nego što udju u bilans.
                </p>
            </header>

            <section className="card admin__card">
                <div className="admin__card-header">
                    <div>
                        <h2 className="card__title">Zahtevi za odobrenje</h2>
                        <p className="card__muted">Ukupno na čekanju: {transactions.length}</p>
                    </div>
                </div>

                <div className="table-wrapper">
                    <table className="table admin__table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Korisničko ime</th>
                                <th>Tip</th>
                                <th>Iznos</th>
                                <th>Datum</th>
                                <th>Opis</th>
                                <th>Metod plaćanja</th>
                                <th>Od</th>
                                <th>Do</th>
                                <th>Kategorija</th>
                                <th>Akcije</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.length === 0 ? (
                                <tr>
                                    <td className="table__empty" colSpan={11}>
                                        Nema transakcija na čekanju
                                    </td>
                                </tr>
                            ) : (
                                transactions.map(tx => (
                                    <tr key={tx.id}>
                                        <td data-label="ID">
                                            <span className="admin__id">#{tx.id}</span>
                                        </td>
                                        <td data-label="Korisnicko ime">{tx.username}</td>
                                        <td data-label="Tip">
                                            <span className={`admin__badge admin__badge--${getTypeClass(tx.type)}`}>
                                                {getTypeLabel(tx.type)}
                                            </span>
                                        </td>
                                        <td data-label="Iznos" className="admin__amount">{tx.amount} RSD</td>
                                        <td data-label="Datum" className="admin__muted">{tx.date}</td>
                                        <td data-label="Opis" className="admin__description">{tx.description || "-"}</td>
                                        <td data-label="Metoda plaćanja" className="admin__muted">
                                            {getPaymentMethodLabel(tx.paymentMethod)}
                                        </td>
                                        <td data-label="Od" className="admin__muted">{getPaymentMethodLabel(tx.fromPaymentMethod)}</td>
                                        <td data-label="Do" className="admin__muted">{getPaymentMethodLabel(tx.toPaymentMethod)}</td>
                                        <td data-label="Kategorija">{tx.categoryName || "-"}</td>
                                        <td data-label="Akcije">
                                            <div className="admin__actions">
                                                <button className="btn admin__actions-btn" onClick={() => handleAprove(tx.id)}>Odobri</button>
                                                <button className="btn btn--ghost admin__actions-btn admin__actions-btn--reject" onClick={() => handleReject(tx.id)}>Odbij</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </main>
    )
}