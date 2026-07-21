export async function searchLocation(query) {
  if (!query) return [];

  try {
    const res = await fetch(
      `http://localhost:3003/api/location/search?q=${query}`
    );

    const data = await res.json();

    console.log("SEARCH RESPONSE:", data); // 🔥 IMPORTANT DEBUG

    return data.data || [];
  } catch (err) {
    console.log("Search failed:", err);
    return [];
  }
}

