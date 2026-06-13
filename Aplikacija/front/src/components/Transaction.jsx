import "../styles/transaction.css"
import { useState } from "react";
import { useNavigate } from "react-router-dom"
import getAuthorization from "../utils/auth";
import api from "../api";
import { useEffect } from "react";
import { useToast } from "../context/ToastContext";
import { useAlert } from "../context/AlertContext";

const APPROVAL_LIMIT = 10000;


export default function Transaction() {
    const navigate = useNavigate();
    const [type, setType] = useState("Income");
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("");
    const [categories, setCategories] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState(0);
    const [fromPaymentMethod, setFromPaymentMethod] = useState("Cash");
    const [toPaymentMethod, setToPaymentMethod] = useState("Card");
    const { showToast } = useToast();
    const { showAlert } = useAlert();

    useEffect(() => {
        const fetchCategories = async () => {
            if (type === "Transfer") {
                setCategories([]);
                setCategory("");
                return;
            }
            try {
                const auth = getAuthorization();
                const response = await api.get(`/category/by-type/${type}`, auth);
                const cats = response.data || [];
                setCategories(cats);

                if (response.data.length > 0)
                    setCategory(response.data[0].id)
            }
            catch (err) {
                console.error("Greska pri ucitavanju kateogorija!", err);
                setCategories([]);
                setCategory("");
            }
        }
        fetchCategories();
    }, [type])

    let headerCopy = "Nova transakcija";
    if (type === "Income") {
        headerCopy = "Zabeleži novi prihod";
    } else if (type === "Expense") {
        headerCopy = "Dodaj rashod sa razlogom";
    } else if (type === "Transfer") {
        headerCopy = "Planirani transfer između naloga";
    }



    const handleSubmit = async (e) => {
        e.preventDefault();

        const userId = localStorage.getItem("userId");
        const auth = getAuthorization();

        if (!userId || !auth) {
            await showAlert("Niste prijavljeni", { title: "Greška" });
            return;
        }

        try {

            const descriptionValue = description.trim();
            if (descriptionValue.length < 3) {
                await showAlert("Opis mora sadržati najmanje 3 karaktera.");
                return;
            }

            let payload;

            if (type === "Transfer") {
                payload = {
                    Description: description,
                    Amount: parseFloat(amount),
                    Type: 2, // Transfer
                    FromPaymentMethod: fromPaymentMethod === "Cash" ? 0 : 1,
                    ToPaymentMethod: toPaymentMethod === "Cash" ? 0 : 1
                };

            } else {
                payload = {
                    Description: description,
                    Amount: parseFloat(amount),
                    Type: type === "Income" ? 0 : 1,
                    PaymentMethod: paymentMethod === 0 ? 0 : 1,
                    CategoryId: parseInt(category)
                }
            }
            const response = await api.post("/transaction/add", payload, auth);
            const serverMsg = response?.data?.message?.toLowerCase() || "";

            const approvalPending =
              parseFloat(amount) > APPROVAL_LIMIT ||
              response?.status === 202 ||
              serverMsg.includes("odobrenje") ||
              serverMsg.includes("pending") ||
              response?.data?.approvalRequired === true;

            showToast(
              approvalPending
                ? "Transakcija čeka odobrenje"
                : "Transakcija uspešno dodata",
              approvalPending ? "info" : "success"
            );

            setDescription("");
            setAmount("");
            setPaymentMethod(0);
            setFromPaymentMethod("Cash");
            setToPaymentMethod("Card");

        } catch (err) {
            console.error("Axios error:", err.response?.data || err.message);
            const msg = err.response?.data?.message || "Greška pri dodavanju transakcije.";
            await showAlert(msg, { title: "Greška" });        }
    }
  return (
    <main className="transaction">
      <h2 className="section-title">Nova transakcija</h2>
      <div className="transaction__grid">
        <div className="card transaction__card">
          <h3 className="card__title">{headerCopy}</h3>
          <p className="card__subtitle">Sve promene se sinhronizuju u realnom vremenu.</p>
          <form className="transaction__form" onSubmit={handleSubmit} noValidate>
            <div className="transaction__field">
              <label htmlFor="transaction-type">Tip transakcije</label>
              <select
                className="select"
                id="transaction-type"
                value={type}
                onChange={(event) => setType(event.target.value)}
              >
                <option value="Income">Prihod</option>
                <option value="Expense">Rashod</option>
                <option value="Transfer">Transfer</option>
              </select>
            </div>

            <div className="transaction__field">
              <label htmlFor="transaction-description">Opis</label>
              <input
                className="input"
                id="transaction-description"
                type="text"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Npr. plata, kirija, prenos na štednju"
                required
              />
            </div>

            <div className="transaction__field">
              <label htmlFor="transaction-amount">Iznos (RSD)</label>
              <input
                className="input"
                id="transaction-amount"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            {type === "Transfer" ? (
              <div className="transaction__transfer">
                <div className="transaction__field">
                  <label htmlFor="from-method">Sa naloga</label>
                  <select
                    className="select"
                    id="from-method"
                    value={fromPaymentMethod}
                    onChange={(event) => setFromPaymentMethod(event.target.value)}
                  >
                    <option value="Cash">Keš</option>
                    <option value="Card">Kartica</option>
                  </select>
                </div>
                <div className="transaction__field">
                  <label htmlFor="to-method">Na nalog</label>
                  <select
                    className="select"
                    id="to-method"
                    value={toPaymentMethod}
                    onChange={(event) => setToPaymentMethod(event.target.value)}
                  >
                    <option value="Cash">Keš</option>
                    <option value="Card">Kartica</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="transaction__grid">
                <div className="transaction__field">
                  <label htmlFor="payment-method">Način plaćanja</label>
                  <select
                    className="select"
                    id="payment-method"
                    value={paymentMethod}
                    onChange={(event) => setPaymentMethod(Number(event.target.value))}
                  >
                    <option value={0}>Keš</option>
                    <option value={1}>Kartica</option>
                  </select>
                </div>
                <div className="transaction__field">
                  <label htmlFor="transaction-category">Kategorija</label>
                  <select
                    className="select"
                    id="transaction-category"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                  >
                    {categories.length === 0 && (
                      <option value="">Nema dostupnih kategorija</option>
                    )}
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            <div className="transaction__actions">
              <button className="btn" type="submit">
                Sačuvaj transakciju
              </button>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => navigate(-1)}
              >
                Nazad
              </button>
            </div>
          </form>
        </div>

        <aside className="transaction__aside">
          <div className="card">
            <h3 className="card__title">Saveti za precizno knjiženje</h3>
            <ul className="transaction__tips">
              <li>Preciziraj opis kako bi lakše filtrirao kasnije.</li>
              <li>Transfer koristi kada prebacuješ između keš i kartičnog naloga.</li>
              <li>Za ponavljajuće troškove razmisli o namenskim kategorijama.</li>
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}