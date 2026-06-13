import { useEffect, useState } from "react";
import getAuthorization from "../utils/auth"
import api from "../api";
import "../styles/admin.css";
import { useToast } from "../context/ToastContext";
import { useAlert } from "../context/AlertContext";

export default function AdminUser() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState([true]);
    const { showToast } = useToast();
    const { showAlert, showConfirm } = useAlert();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const auth = getAuthorization();
                const token = localStorage.getItem("token");
                if (!token) {
                    setLoading(false);
                    return;
                }
                const response = await api.get("/Admin/users", auth);
                setUsers(response.data);
                setLoading(false);
            }
            catch (err) {
                console.error(err);
                await showAlert("Greška prilikom učitavanja korisnika.", { title: "Greška" });
                setLoading(false);
            }
        }
        fetchUsers();
    }, [showAlert]);

    const handleChange = async (userID, newRole) => {
        try {

            const confirmed = await showConfirm(
                `Da li ste sigurni da želite da promenite ulogu korisniku #${userID} na "${newRole}"?`,
                { title: "Potvrda promene uloge" }
            );
            if (!confirmed) return;

            const auth = getAuthorization();
            const roleValue = newRole === "Admin" ? 1 : 0;
            console.log(roleValue);
            await api.put(`/Admin/users/${userID}/role`, roleValue, auth);

            setUsers((prev) =>
                prev.map((u) => (u.id === userID ? { ...u, role: newRole } : u))
            );
            showToast(`Uloga uspešno promenjena na "${newRole}"`, "success");


        }
        catch (err) {
            console.error(err);
            await showAlert("Greška prilikom promene uloge korisniku.", { title: "Greška" })
        }
    }

    if (loading)
        return <p>Učitavanje...</p>;


    return (
        <main className="admin">
            <header className="admin__hero">
                <p className="badge">Kontrolni centar</p>
                <h1 className="admin__title">Upravljanje korisnicima</h1>
                <p className="admin__subtitle">
                    Prati naloge i dodeljuj administratorske privilegije u jednom potezu.
                </p>
            </header>

            <section className="card admin__card">
                <div className="admin__card-header">
                    <div>
                        <h2 className="card__title">Aktivni nalozi</h2>
                        <p className="card__muted">Ukupno korisnika: {users.length}</p>
                    </div>
                </div>

                <div className="table-wrapper">
                    <table className="table admin__table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Korisnicko ime</th>
                                <th>Email</th>
                                <th>Ime i prezime</th>
                                <th>Uloga</th>
                                <th>Kes</th>
                                <th>Kartica</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr>
                                    <td className="table__empty" colSpan={7}>
                                        Nema korisnika za prikaz.
                                    </td>
                                </tr>
                            ) : (
                                users.map((u) => (
                                    <tr key={u.id}>
                                        <td data-label="ID"><span className="admin__id"  >#{u.id}</span></td>
                                        <td data-label="Korisnicko ime">{u.username}</td>
                                        <td data-label="Email" className="admin__muted">{u.email}</td>
                                        <td data-label="Ime i prezime">{u.fullName}</td>
                                        <td data-label="Uloga">
                                            <select
                                                className="select admin__role-select"
                                                value={u.role}
                                                onChange={(e) => handleChange(u.id, e.target.value)}
                                            >
                                                <option value="User">User</option>
                                                <option value="Admin">Admin</option>
                                            </select>
                                        </td>
                                        <td data-label="Kes" className="admin__amount">{u.cashBalance} RSD</td>
                                        <td data-label="Kartica" className="admin__amount">{u.cardBalance} RSD</td>
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