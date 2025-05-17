import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './index.css'; // Make sure to import your CSS file with Tailwind directives
import Dashboard from './pages/Dashboard'; // Adjust the path based on your project structure

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />          
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;