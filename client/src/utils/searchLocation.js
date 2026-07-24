const API_URL = import.meta.env.VITE_API_URL;

export async function searchLocation(query) {
  if (!query) return [];

  try {
    const res = await fetch(
      `${API_URL}/location/search?q=${encodeURIComponent(query)}`
    );

    if (!res.ok) {
      throw new Error("Failed to fetch locations");
    }

    const data = await res.json();

    console.log("SEARCH RESPONSE:", data);

    return data.data || [];
  } catch (err) {
    console.error("Search failed:", err);
    return [];
  }
}