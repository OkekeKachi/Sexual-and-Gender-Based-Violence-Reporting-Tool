export async function getAddress(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      {
        headers: {
          // Replace with your app name or email to comply with Nominatim policy
          "User-Agent": "SafeSpeak-App-Thesis-Project",
        },
      }
    );

    const data = await res.json();
    const addr = data.address || {};

    // Waterfall priority for "City"
    // We check every possible administrative level from specific to general
    const cityFallback =
      addr.city ||
      addr.town ||
      addr.village ||
      addr.suburb ||
      addr.municipality ||
      addr.county ||
      addr.district ||
      "Unknown Location";

    return {
      address: data.display_name || "Address not found",
      city: cityFallback,
      state: addr.state || addr.region || "",
    };
  } catch (err) {
    console.error("Reverse geocoding failed:", err);
    return {
      address: "",
      city: "Unknown City",
      state: "",
    };
  }
}