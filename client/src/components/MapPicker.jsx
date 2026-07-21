import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useState, useEffect } from "react";
import L from "leaflet";

// Fix marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position ? (
    <Marker
      position={position}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const newPos = e.target.getLatLng();
          setPosition(newPos);
        },
      }}
    />
  ) : null;
}

function MapUpdater({ position }) {
  const map = useMapEvents({});

  useEffect(() => {
    if (position) {
      map.setView([position.lat, position.lng], 15);
    }
  }, [position]);

  return null;
}

function MapPicker({ onSelect, externalPosition }) {
  const [position, setPosition] = useState(null);

  // Sync with search selection
  useEffect(() => {
    if (externalPosition) {
      setPosition(externalPosition);
      onSelect(externalPosition);
    }
  }, [externalPosition]);

  const handleChange = (pos) => {
    setPosition(pos);
    onSelect(pos);
  };

  return (
    <MapContainer
      center={[9.0765, 7.3986]} // Abuja default
      zoom={13}
      style={{ height: "400px", width: "100%" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapUpdater position={position} />

      <LocationMarker position={position} setPosition={handleChange} />
    </MapContainer>
  );
}

export default MapPicker;