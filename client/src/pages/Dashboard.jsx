// pages/Dashboard.jsx
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, orderBy, onSnapshot, limit } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import { db } from "./firebase";
import { getDashboardStats, updateReportStatus, updateReport, deleteReport } from "../api/report.api";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import StatCard from "../components/StatCard";
import { HotspotBanner, EscalatedBanner } from "../components/AlertBanner";
import ReportsFilter from "../components/ReportsFilter";
import ReportsTable from "../components/ReportsTable";
import EditReportModal from "../components/EditReportModal";
import Toast from "../components/Toast";
import CityBarChart from "../components/CityBarChart";
import TypePieChart from "../components/TypePieChart";
import PriorityChart from "../components/PriorityChart";
import Map from "../components/Map";

export default function Dashboard() {
  const navigate = useNavigate();
  const prevReportsRef = useRef([]);

  const [currentUser, setCurrentUser] = useState(null);
  const [notification, setNotification] = useState(null);
  const [reports, setReports] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [hotspots, setHotspots] = useState([]);
  const [escalated, setEscalated] = useState([]);
  const [editingReport, setEditingReport] = useState(null);
  const [form, setForm] = useState({ status: "", priority: "" });
  const [filters, setFilters] = useState({ status: "all", city: "", search: "" });

  const stats = analytics || { total: 0, pending: 0, reviewed: 0, resolved: 0, assigned: 0 };

  // ── Auth ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const auth = getAuth();
    
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user || null);
      if (user) {
        const token = await user.getIdTokenResult();
        console.log("CLAIMS:", token.claims);
      }
    });
    
    return () => unsubscribe();
  }, []);

  // ── Real-time reports ─────────────────────────────────────────────────────
  useEffect(() => {
    const q = query(collection(db, "report"), orderBy("createdAt", "desc"), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveReports = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      if (prevReportsRef.current.length > 0 && liveReports[0]?.id !== prevReportsRef.current[0]?.id) {
        showToast("🚨 New report submitted!");
      }
      prevReportsRef.current = liveReports;
      setReports(liveReports);
    });
    return () => unsubscribe();
  }, []);

  // ── Analytics ─────────────────────────────────────────────────────────────
  useEffect(() => {
    getDashboardStats().then((res) => {
      setAnalytics(res);
      setHotspots(res.hotspots || []);
      setEscalated(res.escalated || []);
    });
  }, []);

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleStatusChange = async (id, status) => {
    await updateReportStatus(id, status);
    showToast(`✏️ Case marked as ${status}`);
  };

  const openEditModal = (report) => {
    setEditingReport(report);
    setForm({ status: report.status, priority: report.priority });
  };

  const handleUpdate = async () => {
    await updateReport(editingReport.id, form);
    setEditingReport(null);
    showToast("✏️ Report updated successfully");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this report? This action cannot be undone.")) return;
    await deleteReport(id);
    showToast("🗑️ Report deleted");
  };

  const showToast = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 5000);
  };

  // ── Filtered reports ──────────────────────────────────────────────────────
  const filteredReports = reports.filter((r) => {
    if (filters.status !== "all" && r.status !== filters.status) return false;
    if (filters.city && !r.location?.city?.toLowerCase().includes(filters.city.toLowerCase())) return false;
    if (filters.search && !r.caseId?.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar user={currentUser} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar
          title="Dashboard"
          notificationCount={escalated.length + hotspots.length}
        />

        <main className="flex-1 overflow-y-auto overflow-x-hidden px-6 pt-5 pb-10 flex flex-col gap-4 relative z-0 isolate">

          {/* Alerts */}
          {/* <HotspotBanner hotspots={hotspots} />
          <EscalatedBanner escalated={escalated} /> */}

          {/* Stats */}
          <div className="grid grid-cols-4 gap-[14px] relative z-10 [&>*]:min-w-0">
            <StatCard title="Total cases" value={stats.total} variant="total" />
            <StatCard title="Pending" value={stats.pending} variant="pending" total={stats.total} />
            <StatCard title="Assigned" value={stats.assigned} variant="assigned" total={stats.total} />
            <StatCard title="Resolved" value={stats.resolved} variant="resolved" total={stats.total} />
          </div>

          {/* Filter bar — above map */}
          <div className="relative z-10">
            <ReportsFilter filters={filters} onChange={setFilters} />
          </div>

          {/* Table — above map */}
          <div className="relative z-10">
            <ReportsTable
              reports={filteredReports}
              onStatusChange={handleStatusChange}
              onEdit={openEditModal}
              onDelete={handleDelete}
            />
          </div>

          {/* Charts */}
          {analytics && (
            <div className="grid grid-cols-3 gap-4 relative z-10 [&>*]:min-w-0">
              <div className="bg-[var(--surface-card)] border border-[var(--gray-100)] rounded-[var(--radius-lg)] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                <div className="px-[18px] py-[14px] pb-3 text-[13px] font-semibold text-[var(--gray-700)] tracking-tight border-b border-[var(--gray-50)]">Cases by city</div>
                <CityBarChart data={analytics.byCity} />
              </div>
              <div className="bg-[var(--surface-card)] border border-[var(--gray-100)] rounded-[var(--radius-lg)] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                <div className="px-[18px] py-[14px] pb-3 text-[13px] font-semibold text-[var(--gray-700)] tracking-tight border-b border-[var(--gray-50)]">By type</div>
                <TypePieChart data={analytics.byType} />
              </div>
              <div className="bg-[var(--surface-card)] border border-[var(--gray-100)] rounded-[var(--radius-lg)] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                <div className="px-[18px] py-[14px] pb-3 text-[13px] font-semibold text-[var(--gray-700)] tracking-tight border-b border-[var(--gray-50)]">By priority</div>
                <PriorityChart data={analytics.byPriority} />
              </div>
            </div>
          )}

          {/* Map — z-index: 1, NO isolate (breaks Leaflet tile painting) */}
          <div className="relative z-[1] min-h-[500px] bg-[var(--surface-card)] border border-[var(--gray-100)] rounded-[var(--radius-lg)] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="px-[18px] py-[14px] pb-3 text-[13px] font-semibold text-[var(--gray-700)] tracking-tight border-b border-[var(--gray-50)]">Incident map</div>
            <div className="relative z-0 h-[800px]">
              <Map reports={reports} hotspots={hotspots} />
            </div>
          </div>

        </main>
      </div>

      <EditReportModal
        report={editingReport}
        form={form}
        onChange={setForm}
        onSave={handleUpdate}
        onClose={() => setEditingReport(null)}
      />

      <Toast message={notification} onClose={() => setNotification(null)} />
    </div>
  );
}