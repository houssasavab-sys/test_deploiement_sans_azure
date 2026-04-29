import { useState, useEffect } from "react";
import { PublicClientApplication, AccountInfo } from "@azure/msal-browser";
import { msalConfig, loginRequest } from "./authConfig";
import {
  getEmployes,
  createEmploye,
  updateEmploye,
  deleteEmploye,
} from "./graphService";

const msalInstance = new PublicClientApplication(msalConfig);
let msalInitialized = false;

async function getMsalInstance() {
  if (!msalInitialized) {
    await msalInstance.initialize();
    msalInitialized = true;
  }
  return msalInstance;
}

export default function App() {
  const [token, setToken] = useState<string>("");
  const [employes, setEmployes] = useState<any[]>([]);
  const [form, setForm] = useState({ Nom: "", Prenom: "", Poste: "" });
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    getMsalInstance().then((msal) => {
      const accounts = msal.getAllAccounts();
      if (accounts.length > 0) {
        msal.acquireTokenSilent({
          ...loginRequest,
          account: accounts[0],
        }).then((result) => {
          setToken(result.accessToken);
          chargerEmployes(result.accessToken);
        }).catch(() => {
          // Token expiré, l'utilisateur doit se reconnecter
        });
      }
    });
  }, []);

  async function login() {
    try {
      setError("");
      const msal = await getMsalInstance();
      const result = await msal.loginPopup(loginRequest);
      setToken(result.accessToken);
      chargerEmployes(result.accessToken);
    } catch (err: any) {
      console.error("Erreur:", err);
      setError("Erreur de connexion : " + err.message);
    }
  }

  async function chargerEmployes(t: string) {
    setLoading(true);
    try {
      const data = await getEmployes(t);
      setEmployes(data);
    } catch (err) {
      setError("Erreur lors du chargement des employés");
    }
    setLoading(false);
  }

  async function sauvegarder() {
    if (!form.Nom || !form.Prenom || !form.Poste) {
      alert("Veuillez remplir tous les champs !");
      return;
    }
    setLoading(true);
    try {
      if (editId) {
        await updateEmploye(token, editId, form);
      } else {
        await createEmploye(token, form);
      }
      setForm({ Nom: "", Prenom: "", Poste: "" });
      setEditId(null);
      chargerEmployes(token);
    } catch (err) {
      setError("Erreur lors de la sauvegarde");
      setLoading(false);
    }
  }

  function editer(employe: any) {
    setEditId(employe.id);
    setForm({
      Nom: employe.fields.Nom || "",
      Prenom: employe.fields.Prenom || "",
      Poste: employe.fields.Poste || "",
    });
  }

  async function supprimer(id: string) {
    if (!confirm("Confirmer la suppression ?")) return;
    setLoading(true);
    try {
      await deleteEmploye(token, id);
      chargerEmployes(token);
    } catch (err) {
      setError("Erreur lors de la suppression");
      setLoading(false);
    }
  }

  function annuler() {
    setEditId(null);
    setForm({ Nom: "", Prenom: "", Poste: "" });
  }

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>👥 Gestion des Employés</h1>

      {error && (
        <div style={{ padding: "10px", background: "#FFE5E5", color: "#D13438", borderRadius: "4px", marginBottom: "15px" }}>
          ⚠️ {error}
        </div>
      )}

      {!token ? (
        <button
          onClick={login}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            background: "#6264A7",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          🔐 Se connecter
        </button>
      ) : (
        <>
          <div style={{ marginBottom: "20px", padding: "15px", border: "1px solid #ddd", borderRadius: "8px", background: "#f9f9f9" }}>
            <h2>{editId ? "✏️ Modifier" : "➕ Ajouter"} un employé</h2>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <input
                placeholder="Nom"
                value={form.Nom}
                onChange={(e) => setForm({ ...form, Nom: e.target.value })}
                style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
              />
              <input
                placeholder="Prénom"
                value={form.Prenom}
                onChange={(e) => setForm({ ...form, Prenom: e.target.value })}
                style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
              />
              <input
                placeholder="Poste"
                value={form.Poste}
                onChange={(e) => setForm({ ...form, Poste: e.target.value })}
                style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
              />
              <button onClick={sauvegarder}
                style={{ padding: "8px 16px", background: "#6264A7", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                {editId ? "✅ Modifier" : "➕ Ajouter"}
              </button>
              {editId && (
                <button onClick={annuler}
                  style={{ padding: "8px 16px", background: "#ccc", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                  ❌ Annuler
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <p>⏳ Chargement...</p>
          ) : employes.length === 0 ? (
            <p>Aucun employé trouvé.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#6264A7", color: "white" }}>
                  <th style={{ padding: "12px", textAlign: "left" }}>Nom</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>Prénom</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>Poste</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employes.map((e) => (
                  <tr key={e.id} style={{ borderBottom: "1px solid #ddd" }}>
                    <td style={{ padding: "10px" }}>{e.fields.Nom}</td>
                    <td style={{ padding: "10px" }}>{e.fields.Prenom}</td>
                    <td style={{ padding: "10px" }}>{e.fields.Poste}</td>
                    <td style={{ padding: "10px", display: "flex", gap: "8px" }}>
                      <button onClick={() => editer(e)}
                        style={{ padding: "5px 10px", background: "#0078D4", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                        ✏️ Modifier
                      </button>
                      <button onClick={() => supprimer(e.id)}
                        style={{ padding: "5px 10px", background: "#D13438", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                        🗑️ Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}