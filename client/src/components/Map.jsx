import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import HeatmapLayer from "./HeatmapLayer";

export default function HeatmapMap({ reports, hotspots }) {
  return (
    <MapContainer
      center={[8.9, 7.4]}
      zoom={9}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution="OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* 🔥 Heatmap */}
      <HeatmapLayer reports={reports} />

      {/* 🔴 HOTSPOT CIRCLES */}
      {hotspots.map((h, index) => {
        const cityReports = reports.filter(
          r => r.location?.city === h.city
        );

        if (cityReports.length === 0) return null;

        // const lat = cityReports[0].location.lat;
        // const lng = cityReports[0].location.lng;

        const validReports = cityReports.filter(
          r => r.location?.lat && r.location?.lng
        );

        if (validReports.length === 0) return null;

        const avgLat =
          validReports.reduce((sum, r) => sum + r.location.lat, 0) /
          validReports.length;

        const avgLng =
          validReports.reduce((sum, r) => sum + r.location.lng, 0) /
          validReports.length;

        const weight = h.level === "CRITICAL" ? 2 : 1;
        return (
          <Circle
            key={index}
            center={[avgLat, avgLng]}
            radius={Math.min(8000, 1200 + h.count * 250 * weight)}
            pathOptions={{
              color: h.level === "CRITICAL" ? "red" : "orange",
              fillColor: h.level === "CRITICAL" ? "red" : "orange",
              fillOpacity: 0.4
            }}
          >
            <Popup>
              🚨 <b>{h.city}</b><br />
              {h.level} hotspot<br />
              {h.count} reports
            </Popup>
          </Circle>
        );
      })}

      {/* 📍 Individual markers */}
      {reports.map(r => (
        r.location?.lat && (
          <Marker
            key={r.id}
            position={[r.location.lat, r.location.lng]}
          >
            <Popup>
              <b>{r.caseId}</b><br />
              {r.type}<br />
              {r.status}
            </Popup>
          </Marker>
        )
      ))}
    </MapContainer>
  );
}