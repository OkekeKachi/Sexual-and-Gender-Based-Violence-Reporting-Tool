import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";

export default function HeatmapLayer({ reports }) {
  const map = useMap();

  useEffect(() => {
    if (!reports || reports.length === 0) return;

    const points = reports
      .filter(r => r.location?.lat && r.location?.lng)
      .map(r => [
        r.location.lat,
        r.location.lng,
        1 // intensity
      ]);

    const heat = L.heatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
    });

    heat.addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [reports, map]);

  return null;
}