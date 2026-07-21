import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminRoute from "./components/AdminRoutes";
import './index.css'; // Make sure to import your CSS file with Tailwind directives
import AdminDashboard from "./pages/adminDashboard";
import ReportPage from './pages/report';
import TrackReport from './pages/TrackReport';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login'; 
import ReportDetails from './pages/ReportDetails'; 
import Home from './pages/home'; 
import MyReports from './pages/MyReports';
import NotFound from './pages/notFound'; 
import Resources from './pages/Resources'; 
import CreateWorker from './pages/Worker'; 
import CreateDepartment from './pages/Department'; 
import WorkerDashboard from './pages/WorkerDashboard'; 
import ChangePassword from './pages/ChangePassword'; 
import StaffLogin from './pages/StaffLogin';
import Signup from './pages/Signup'; 


function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/AdminDashboard" element={<AdminDashboard />} /> 
          <Route path="/report" element={<ReportPage />} />
          <Route
            path="/dashboard"
            element={
              <AdminRoute>
                <Dashboard />
              </AdminRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/staff-login" element={<StaffLogin/>} />
          <Route path="/track/" element={<TrackReport />} />
          <Route path="/track/:id" element={<TrackReport />} />
          <Route path="/reports/:id" element={<ReportDetails />} />
          <Route path="/my-reports" element={<MyReports />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/create-worker" element={<CreateWorker />} />
          <Route path="/create-department" element={<CreateDepartment />} />
          <Route path='/worker-dashboard' element={<WorkerDashboard />} />
          <Route path='/change-password' element={<ChangePassword />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
