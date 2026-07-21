
exports.searchLocation = async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.json({ success: true, data: [] });
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${q} Nigeria&countrycodes=ng&format=json&limit=5`,
      {
        headers: {
          "User-Agent": "SGBV-App"
        }
      }
    );
    console.log(q);
    
    const data = await response.json();

    const results = data.map(item => ({
      display: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon)
    }));

    res.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Location search failed"
    });
  }
};  