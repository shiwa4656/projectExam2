export const API_KEY = "fd8ac414-9690-48cf-9579-f5ef44e495d2";
export const API_URL = "https://api.noroff.dev/api/v1/holidaze";

export const headers = (token) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
  "X-Noroff-API-Key": API_KEY
}); 