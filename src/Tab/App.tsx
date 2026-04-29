import { useState, useEffect } from "react";
import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig, loginRequest } from "./authConfig";
import {
  getEmployes,
  createEmploye,
  updateEmploye,
  deleteEmploye,
} from "./graphService";



const msalInstance = new PublicClientApplication(msalConfig);

export default function App() {
  const [token, setToken] = useState<string>("");
  const [employes, setEmployes] = useState<any[]>([]);
  const [form, setForm] = useState({ Nom: "", Prenom: "", Poste: "" });
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Connexion
  async function login() {
    await msalInstance.initialize();
    const result = await msalInstance.loginPopup(loginRequest);
    setToken(result.accessToken);
    chargerEmployes(result.accessToken);
  }

  // Charger les employés
  async function chargerEmployes(t: string) {
    setLoading(true);
    const data = await getEmployes(t);
    setEmployes(data);
    setLoading(false);
  }

  // Créer ou modifier
  async function sauvegarder() {
    if (editId) {
      await updateEmploye(token, editId, form);
    } else {
      await createEmploye(token, form);
    }
    setForm({ Nom: "", Prenom: "", Poste: "" });
    setEditId(null);
    chargerEmployes(token);
  }

  // Préparer la modification
  function editer(employe: any) {
    setEditId(employe.id);
    setForm({
      Nom: employe.fields.Nom || "",
      Prenom: employe.fields.Prenom || "",
      Poste: employe.fields.Poste || "",
    });
  }

  // Supprimer
  async function supprimer(id: string) {
    await deleteEmploye(token, id);
    chargerEmployes(token);
  }

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>👥 Gestion des Employés</h1>

      {!token ? (
        <button onClick={login} style={{ padding: "10px 20px", fontSize: "16px" }}>
          🔐 Se connecter
        </button>
      ) : (
        <>
          {/* Formulaire */}
          <div style={{ marginBottom: "20px", padding: "15px", border: "1px solid #ddd", borderRadius: "8px" }}>
            <h2>{editId ? "✏️ Modifier" : "➕ Ajouter"} un employé</h2>
            <input
              placeholder="Nom"
              value={form.Nom}
              onChange={(e) => setForm({ ...form, Nom: e.target.value })}
              style={{ marginRight: "10px", padding: "8px" }}
            />
            <input
              placeholder="Prénom"
              value={form.Prenom}
              onChange={(e) => setForm({ ...form, Prenom: e.target.value })}
              style={{ marginRight: "10px", padding: "8px" }}
            />
            <input
              placeholder="Poste"
              value={form.Poste}
              onChange={(e) => setForm({ ...form, Poste: e.target.value })}
              style={{ marginRight: "10px", padding: "8px" }}
            />
            <button onClick={sauvegarder} style={{ padding: "8px 16px", background: "#6264A7", color: "white", border: "none", borderRadius: "4px" }}>
              {editId ? "Modifier" : "Ajouter"}
            </button>
            {editId && (
              <button onClick={() => { setEditId(null); setForm({ Nom: "", Prenom: "", Poste: "" }); }}
                style={{ marginLeft: "10px", padding: "8px 16px" }}>
                Annuler
              </button>
            )}
          </div>

          {/* Liste */}
          {loading ? <p>Chargement...</p> : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#6264A7", color: "white" }}>
                  <th style={{ padding: "10px" }}>Nom</th>
                  <th style={{ padding: "10px" }}>Prénom</th>
                  <th style={{ padding: "10px" }}>Poste</th>
                  <th style={{ padding: "10px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employes.map((e) => (
                  <tr key={e.id} style={{ borderBottom: "1px solid #ddd" }}>
                    <td style={{ padding: "10px" }}>{e.fields.Nom}</td>
                    <td style={{ padding: "10px" }}>{e.fields.Prenom}</td>
                    <td style={{ padding: "10px" }}>{e.fields.Poste}</td>
                    <td style={{ padding: "10px" }}>
                      <button onClick={() => editer(e)}
                        style={{ marginRight: "8px", padding: "5px 10px", background: "#0078D4", color: "white", border: "none", borderRadius: "4px" }}>
                        ✏️ Modifier
                      </button>
                      <button onClick={() => supprimer(e.id)}
                        style={{ padding: "5px 10px", background: "#D13438", color: "white", border: "none", borderRadius: "4px" }}>
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