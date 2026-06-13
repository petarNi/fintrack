import { useEffect, useState } from "react";
import axios from "axios"
import getAuthorization from "../utils/auth"
import "../styles/filter.css"
import api from "../api";
import { useAlert } from "../context/AlertContext";
import { useToast } from "../context/ToastContext";

export default function FilterTransactions() {
  const { showToast } = useToast();
  const { showAlert, showConfirm } = useAlert();

  //Transakcije
  const [transactions, setTransactions] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  //Transferi
  const [transfers, setTransfers] = useState([]);
  const [fromPaymentMethod, setFromPaymentMethod] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  //Azuriranje
  const [editingTx, setEditingTx] = useState(null);
  const [editAmount, setEditAmount] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editPaymentMethod, setEditPaymentMethod] = useState("");
  const [editFromPaymentMethod, setEditFromPaymentMethod] = useState("");

  //funkcija za otvaranje forme za editovanje

  const openEditForm = async (id) => {
    try {
      const auth = getAuthorization();
      const response = await api.get(`/transaction/${id}`, auth);
      const tx = response.data;

      setEditingTx(tx);
      setEditAmount(tx.amount);
      setEditDate(new Date(tx.date).toISOString().slice(0, 10));
      setEditDescription(tx.description || "");
      setEditCategoryId(tx.categoryId || "");
      if (tx.type === 2) {
        setEditFromPaymentMethod(tx.fromPaymentMethod);
      }
      else {
        setEditCategoryId(tx.categoryId || "");
        setPaymentMethod(tx.paymentMethod);
      }

    } catch (err) {
      console.error("Greska prilikom azuriranja", err.response?.data || err.message);
      await showAlert(err.response?.data?.message || "Greska pri azuriranju.");
    }
  }
  const updateTransaction = async () => {
    if (!editingTx)
      return;
    try {
      const auth = getAuthorization();

      const payload = {
        amount: editAmount ? parseFloat(editAmount) : undefined,
        date: editDate || undefined,
        description: editDescription || undefined,
        categoryId: editCategoryId || undefined,
      };
      if (editingTx.type === 2) { // Transfer
        payload.fromPaymentMethod = editFromPaymentMethod;
        payload.toPaymentMethod = editFromPaymentMethod === 0 ? 1 : 0; // suprotno od from
      } else {
        payload.categoryId = editCategoryId || undefined;
        payload.paymentMethod = editPaymentMethod !== "" ? parseInt(editPaymentMethod) : undefined;
      }
      await api.put(`/transaction/${editingTx.id}`, payload, auth);
      setEditingTx(null);

      fetchTransactions();
      fetchTransfers();
      showToast(editingTx.type === 2 ? "Transfer je ažuriran" : "Transakcija je ažurirana", "info");


    } catch (err) {
      console.error("Greska prilikom azuriranja", err.response?.data || err.message);
      await showAlert(err.response?.data?.message || "Greska pri azuriranju.");
    }
  }



  //kategorije
  const fetchCategories = async () => {

    try {
      const auth = getAuthorization();
      const response = await api.get("/category", auth);
      const cats = response.data || [];
      setCategories(cats);

    }
    catch (err) {
      console.error("Greška pri učitavanju kateogorija!", err);
      setCategories([]);
    }
  }

  //transakcije
  const fetchTransactions = async () => {
    try {
      const params = {};
      if (from) params.from = from;
      if (to) params.to = to;
      if (categoryId) params.categoryId = categoryId;
      if (paymentMethod) params.paymentMethod = paymentMethod;


      const auth = getAuthorization();
      const response = await axios.get("http://localhost:5146/api/transaction/inc-exp",
        {
          ...auth,
          params: params
        }
      );
      setTransactions(response.data);

    } catch (error) {
      console.error("Greska pri ucitavanju statistike:", error.response?.data || error.message);
      setTransactions([]);
    }
  };
  //transferi
  const fetchTransfers = async () => {
    try {
      const params = {};
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;
      if (fromPaymentMethod) params.fromPaymentMethod = fromPaymentMethod;


      const auth = getAuthorization();
      const response = await axios.get("http://localhost:5146/api/transaction/transfers",
        {
          ...auth,
          params: params
        }
      );
      setTransfers(response.data);

    } catch (error) {
      console.error("Greska pri ucitavanju statistike:", error.response?.data || error.message);
      setTransactions([]);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);



  //halde delete
  const deleteAction = async (id) => {
        const confirmed = await showConfirm("Da li ste sigurni da zelite da obrisete transakciju?", {
            title: "Potvrda brisanja",
            confirmLabel: "Obriši",
            cancelLabel: "Odustani"
        });
        if (!confirmed)
            return;
    try {
      const auth = getAuthorization();
      await axios.delete(`http://localhost:5146/api/transaction/${id}`, auth);

      fetchTransactions();
      fetchTransfers();
      showToast("Transakcija je obrisana", "error");

    } catch (err) {
      console.error("Greska prilikom brisanja", err.response?.data || err.message);
      await showAlert(err.response?.data?.message || "Greska pri brisanju.");
    }
  }

  const paymentMethodText = (pm) => {
    if (pm === 0) return "Keš";
    if (pm === 1) return "Kartica";
    return "";
  };
  return (
    <main className="filter">
      <h2 className="section-title">Filtriranje</h2>
      <h1 id="filter-heading" className="filter__title">
        Transakcije i transferi
      </h1>
      <p className="filter__subtitle">
        Filtiraj i pretraži sve svoje finansijske aktivnosti.
      </p>

      <div className="card filter__panel">
        <h3 className="card__title">Filtriraj transakcije</h3>
        <form
          className="filter__form"
          onSubmit={(e) => {
            e.preventDefault();
            fetchTransactions();
          }}
        >
          <div className="filter__field">
            <label htmlFor="tx-from">Od datuma</label>
            <input className="input" id="tx-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>

          <div className="filter__field">
            <label htmlFor="tx-to">Do datuma</label>
            <input className="input" id="tx-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>

          <div className="filter__field">
            <label htmlFor="tx-category">Kategorija</label>
            <select className="select" id="tx-category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">Sve kategorije</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter__field">
            <label htmlFor="tx-method">Način plaćanja</label>
            <select className="select" id="tx-method" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              <option value="">Sve</option>
              <option value="Cash">Keš</option>
              <option value="Card">Kartica</option>
            </select>
          </div>

          <div className="filter__actions">
            <button className="btn" type="submit">Filtriraj</button>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => {
                setFrom("");
                setTo("");
                setCategoryId("");
                setPaymentMethod("");
                setTransactions([]);
              }}
            >
              Resetuj
            </button>
          </div>
        </form>
      </div>

      {transactions.length > 0 && (
        <div className="card filter__table">
          <h3 className="card__title">Rezultati</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Datum</th>
                <th>Kategorija</th>
                <th>Tip</th>
                <th>Iznos</th>
                <th>Opis</th>
                <th>Akcija</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((row) => (
                <tr key={row.id}>
                  <td>{new Date(row.date).toLocaleDateString("sr-RS")}</td>
                  <td>{row.categoryName}</td>
                  <td>{row.categoryType === 0 ? "Prihod" : "Rashod"}</td>
                  <td>{row.amount} RSD</td>
                  <td>{row.description || "-"}</td>
                  <td>
                    <div className="filter__table-actions">
                      <button className="btn btn--ghost btn--sm" onClick={() => openEditForm(row.id)}>
                        Izmeni
                      </button>
                      <button className="btn btn--ghost btn--sm" onClick={() => deleteAction(row.id)}>
                        Obriši
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="card filter__panel">
        <h3 className="card__title">Filtriraj transfere</h3>
        <form
          className="filter__form"
          onSubmit={(e) => {
            e.preventDefault();
            fetchTransfers();
          }}
        >
          <div className="filter__field">
            <label htmlFor="tr-from">Od datuma</label>
            <input className="input" id="tr-from" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>

          <div className="filter__field">
            <label htmlFor="tr-to">Do datuma</label>
            <input className="input" id="tr-to" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>

          <div className="filter__field">
            <label htmlFor="tr-method">Smer transfera</label>
            <select className="select" id="tr-method" value={fromPaymentMethod} onChange={(e) => setFromPaymentMethod(e.target.value)}>
              <option value="">Svi transferi</option>
              <option value="Cash">Keš → Kartica</option>
              <option value="Card">Kartica → Keš</option>
            </select>
          </div>

          <div className="filter__actions">
            <button className="btn" type="submit">Filtriraj</button>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => {
                setFromDate("");
                setToDate("");
                setFromPaymentMethod("");
                setTransfers([]);
              }}
            >
              Resetuj
            </button>
          </div>
        </form>
      </div>

      {transfers.length > 0 && (
        <div className="card filter__table">
          <h3 className="card__title">Rezultati</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Datum</th>
                <th>Iznos</th>
                <th>Prebačeno sa</th>
                <th>Prebačeno na</th>
                <th>Opis</th>
                <th>Akcija</th>
              </tr>
            </thead>
            <tbody>
              {transfers.map((row) => (
                <tr key={row.id}>
                  <td>{new Date(row.date).toLocaleDateString("sr-RS")}</td>
                  <td>{row.amount} RSD</td>
                  <td>{paymentMethodText(row.fromPaymentMethod)}</td>
                  <td>{paymentMethodText(row.fromPaymentMethod === 0 ? 1 : 0)}</td>
                  <td>{row.description || "-"}</td>
                  <td>
                    <div className="filter__table-actions">
                      <button className="btn btn--ghost btn--sm" onClick={() => openEditForm(row.id)}>
                        Izmeni
                      </button>
                      <button className="btn btn--ghost btn--sm" onClick={() => deleteAction(row.id)}>
                        Obriši
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingTx && (
        <div className="modal-overlay" onClick={() => setEditingTx(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3 className="modal__title">
                Ažuriraj {editingTx.type === 2 ? "transfer" : "transakciju"}
              </h3>
              <button className="modal__close" onClick={() => setEditingTx(null)} >
                ✕
              </button>
            </div>

            <div className="modal__body">
              <div className="modal__field">
                <label htmlFor="edit-amount">Iznos</label>
                <input
                  id="edit-amount"
                  className="input"
                  type="number"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  placeholder="Unesite iznos"
                />
              </div>

              <div className="modal__field">
                <label htmlFor="edit-date">Datum</label>
                <input
                  id="edit-date"
                  className="input"
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                />
              </div>

              <div className="modal__field">
                <label htmlFor="edit-description">Opis</label>
                <input
                  id="edit-description"
                  className="input"
                  type="text"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Unesite opis"
                />
              </div>

              {editingTx.type === 2 ? (
                <div className="modal__field">
                  <label htmlFor="edit-transfer">Prebaceno sa</label>
                  <select
                    id="edit-transfer"
                    className="select"
                    value={editFromPaymentMethod}
                    onChange={(e) => setEditFromPaymentMethod(parseInt(e.target.value))}
                  >
                    <option value={0}>Keš → Kartica</option>
                    <option value={1}>Kartica → Keš</option>
                  </select>
                </div>
              ) : (
                <>
                  <div className="modal__field">
                    <label htmlFor="edit-category">Kategorija</label>
                    <select
                      id="edit-category"
                      className="select"
                      value={editCategoryId}
                      onChange={(e) => setEditCategoryId(e.target.value)}
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="modal__field">
                    <label htmlFor="edit-payment">Metoda plaćanja</label>
                    <select
                      id="edit-payment"
                      className="select"
                      value={editPaymentMethod}
                      onChange={(e) => setEditPaymentMethod(parseInt(e.target.value))}
                    >
                      <option value={0}>Keš</option>
                      <option value={1}>Kartica</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className="modal__footer">
              <button className="btn" onClick={updateTransaction}>
                Sačuvaj izmene
              </button>
              <button className="btn btn--ghost" onClick={() => setEditingTx(null)}>
                Otkaži
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}