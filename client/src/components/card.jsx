// Card.jsx
import React from "react";

const Card = ({ title, value, color = "#1976D2" }) => {
  return (
    <div style={{
      background: "#fff",
      borderRadius: "8px",
      padding: "1.5rem",
      flex: "1",
      minWidth: "200px",
      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
      textAlign: "center"
    }}>
      <h3 style={{ color: color, marginBottom: "0.5rem" }}>{title}</h3>
      <p style={{ fontSize: "1.8rem", fontWeight: "bold", color: "#212121" }}>{value}</p>
    </div>
  );
};

export default Card;