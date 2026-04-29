const LIST_NAME = "Employés";

async function getSiteId(token: string): Promise<string> {
  const response = await fetch(
    `https://graph.microsoft.com/v1.0/sites/iokeo.sharepoint.com:/sites/Bree__test`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const data = await response.json();
  return data.id;
}

async function getListId(token: string, siteId: string): Promise<string> {
  const response = await fetch(
    `https://graph.microsoft.com/v1.0/sites/${siteId}/lists?$filter=displayName eq '${LIST_NAME}'`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const data = await response.json();
  return data.value[0].id;
}

// ✅ READ
export async function getEmployes(token: string) {
  const siteId = await getSiteId(token);
  const listId = await getListId(token, siteId);
  const response = await fetch(
    `https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${listId}/items?expand=fields`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const data = await response.json();
  return data.value;
}

// ✅ CREATE
export async function createEmploye(token: string, employe: {
  Nom: string;
  Prenom: string;
  Poste: string;
}) {
  const siteId = await getSiteId(token);
  const listId = await getListId(token, siteId);
  const response = await fetch(
    `https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${listId}/items`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: {
          Title: employe.Nom,
          Pr_x00e9_nom: employe.Prenom,
          Poste: employe.Poste,
        }
      }),
    }
  );
  return await response.json();
}

// ✅ UPDATE
export async function updateEmploye(token: string, itemId: string, employe: {
  Nom?: string;
  Prenom?: string;
  Poste?: string;
}) {
  const siteId = await getSiteId(token);
  const listId = await getListId(token, siteId);
  const response = await fetch(
    `https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${listId}/items/${itemId}/fields`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Title: employe.Nom,
        Pr_x00e9_nom: employe.Prenom,
        Poste: employe.Poste,
      }),
    }
  );
  return await response.json();
}

// ✅ DELETE
export async function deleteEmploye(token: string, itemId: string) {
  const siteId = await getSiteId(token);
  const listId = await getListId(token, siteId);
  await fetch(
    `https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${listId}/items/${itemId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }
  );
}