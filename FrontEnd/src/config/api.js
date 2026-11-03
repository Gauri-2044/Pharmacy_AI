const configuredApiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const apiUrl = (path) =>
  `${configuredApiUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
