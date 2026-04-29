export const msalConfig = {
  auth: {
    clientId: "aafa68ec-013e-4d1a-8a4e-ba47fe93e545",
    authority: "https://login.microsoftonline.com/4431d0bb-7e97-4ac6-8531-e2727c16fbc8",
    redirectUri: "https://test-deploiement-sans-azure.onrender.com/tabs/home",
  },
  cache: {
    cacheLocation: "sessionStorage",
  },
};

export const loginRequest = {
  scopes: [
    "User.Read",
    "https://microsoft.sharepoint.com/AllSites.Write"
  ]
};