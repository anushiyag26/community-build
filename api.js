// REST API module. Uses the free JSONPlaceholder demo API (no API key needed).
export const BASE_URL = "https://jsonplaceholder.typicode.com";

export function handleAPIError(err) {
  console.error("API error:", err);
  if (err instanceof TypeError) {
    return "Network problem. Please check your connection and try again.";
  }
  if (err && err.status) {
    return `Server responded with an error (${err.status}). Please try again later.`;
  }
  return "Something went wrong. Please try again.";
}

async function request(endpoint, options = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { "Content-Type": "application/json; charset=UTF-8" },
    ...options,
  });
  if (!res.ok) {
    const error = new Error(`HTTP ${res.status}`);
    error.status = res.status;
    throw error;
  }
  return res.json();
}

// GET
export async function fetchData(endpoint) {
  try {
    return { data: await request(endpoint), error: null };
  } catch (err) {
    return { data: null, error: handleAPIError(err) };
  }
}

// POST
export async function postData(endpoint, body) {
  try {
    const data = await request(endpoint, { method: "POST", body: JSON.stringify(body) });
    return { data, error: null };
  } catch (err) {
    return { data: null, error: handleAPIError(err) };
  }
}
