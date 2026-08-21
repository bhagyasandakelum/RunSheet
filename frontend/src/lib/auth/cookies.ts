const TOKEN_KEY = "runsheet_access_token";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  // Read from document.cookie
  const match = document.cookie.match(new RegExp("(^| )" + TOKEN_KEY + "=([^;]+)"));
  if (match) {
    return decodeURIComponent(match[2]);
  }

  // Fallback to localStorage if cookie isn't populated
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string, days = 7): void {
  if (typeof window === "undefined") return;

  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  const isSecure = window.location.protocol === "https:";
  const secureFlag = isSecure ? "; Secure" : "";
  document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; expires=${expires}; path=/; SameSite=Lax${secureFlag}`;

  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (e) {
    console.warn("Unable to access localStorage for token storage", e);
  }
}

export function removeAuthToken(): void {
  if (typeof window === "undefined") return;

  const isSecure = window.location.protocol === "https:";
  const secureFlag = isSecure ? "; Secure" : "";
  document.cookie = `${TOKEN_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax${secureFlag}`;

  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (e) {
    console.warn("Unable to clear localStorage token", e);
  }
}
