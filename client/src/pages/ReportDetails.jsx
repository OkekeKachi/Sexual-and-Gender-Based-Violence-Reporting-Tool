import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";
import { addAction, updateReport, getDepartments } from "../api/report.api";
import {
  ArrowLeft, Briefcase, FileText, MapPin, Eye, User,
  Shield, Paperclip, RefreshCcw, Users, History, X
} from "lucide-react";





export default function ReportDetails() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [newAction, setNewAction] = useState("");
  const [saving, setSaving] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [departments, setDepartments] = useState([]);


  

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const deps = await getDepartments();
        console.log("DEPARTMENTS:", deps); // debug
        setDepartments(deps);
      } catch (err) {
        console.error("Failed to fetch departments:", err);
      }
    };

    fetchDepartments();
  }, []);

  useEffect(() => {
    const ref = doc(db, "report", id);
    return onSnapshot(ref, (snap) => {
      setReport({ id: snap.id, ...snap.data() });
    });
  }, [id]);

  const handleAddAction = async () => {
    if (!newAction.trim()) return;
    setSaving(true);
    await addAction(report.id, newAction);
    setNewAction("");
    setSaving(false);
  };

  const handleStatusUpdate = async () => {
    const canResolve = report?.assignedTo && report?.actions?.length > 0;
    if (report.status === "resolved" && !canResolve) {
      alert("Assign case and add at least one action first");
      return;
    }
    setSaving(true);
    await updateReport(report.id, { status: report.status });
    setSaving(false);
  };

  const handleAssign = async () => {
    if (!report.assignment?.entityId) return;

    await updateReport(report.id, {
      assignment: report.assignment,
      status: "assigned"
    });
  };

  const getDepartmentName = (id) => {
    const dep = departments.find(d => d.id === id);
    return dep ? dep.name : "Unknown Department";
  };

  const canResolve = report?.assignedTo && report?.actions?.length > 0;

  if (!report) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 text-slate-500">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
        <p className="animate-pulse font-medium">Loading case details...</p>
      </div>
    );
  }

  const createdAt = report.createdAt?.seconds
    ? new Date(report.createdAt.seconds * 1000).toLocaleString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    })
    : "—";

  const incidentDate = report.incidentDate
    ? new Date(report.incidentDate).toLocaleString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    })
    : "—";

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">

      {/* ── Topbar ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-slate-100 bg-white/80 px-6 py-4 backdrop-blur-md">
        <button
          className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex flex-1 items-center gap-3">
          <span className="font-mono text-lg font-bold text-blue-700">{report.caseId}</span>
          <StatusBadge status={report.status} />
          <PriorityBadge priority={report.priority} />
        </div>
        <div className="hidden text-sm font-medium text-slate-400 md:block">
          Reported {createdAt}
        </div>
      </header>

      {/* ── Body ────────────────────────────────────────────── */}
      <main className="mx-auto grid max-w-[1280px] gap-6 p-6 lg:grid-cols-[1fr_340px]">

        {/* Left Column */}
        <div className="flex flex-col gap-6">

          {/* Overview */}
          <Section icon={Briefcase} title="Case Overview">
            <div className="grid grid-cols-1 sm:grid-cols-2">
              <InfoRow label="Type" value={report.type || "—"} />
              <InfoRow label="Priority" value={<PriorityBadge priority={report.priority} />} />
              <InfoRow label="Status" value={<StatusBadge status={report.status} />} />
              <InfoRow label="Anonymous" value={report.anonymous ? "Yes" : "No"} />
              <InfoRow label="Relationship" value={report.perpetratorRelationship || "—"} />
              <InfoRow label="Incident date" value={incidentDate} />
              <InfoRow label="Reported at" value={createdAt} />
            </div>
          </Section>

          {/* Description */}
          <Section icon={FileText} title="Description">
            <p className="p-5 text-[15px] leading-relaxed text-slate-600">
              {report.description || "No description provided."}
            </p>
          </Section>

          {/* Location */}
          <Section icon={MapPin} title="Location">
            <div className="grid grid-cols-1 sm:grid-cols-2">
              <InfoRow label="City" value={report.location?.city || "—"} />
              <InfoRow label="State" value={report.location?.state || "—"} />
              <InfoRow label="Address" value={report.location?.address || "—"} fullWidth />
            </div>
            {report.location?.lat && (
              <div className="relative z-0 h-64 w-full overflow-hidden border-t border-slate-50">
                <MapContainer center={[report.location.lat, report.location.lng]} zoom={15} className="h-full w-full">
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[report.location.lat, report.location.lng]}>
                    <Popup>{report.location.address}</Popup>
                  </Marker>
                </MapContainer>
              </div>
            )}
          </Section>

          {/* Evidence */}
          <Section icon={Paperclip} title="Evidence" badge={report.evidence?.length}>
            {report.evidence?.length > 0 ? (
              <div className="flex flex-wrap gap-3 p-5">
                {report.evidence.map((file, i) => (
                  file.type?.startsWith("image") ? (
                    <img
                      key={i} src={file.url} alt="evidence"
                      className="h-24 w-32 cursor-pointer rounded-lg border border-slate-200 object-cover transition-transform hover:scale-105"
                      onClick={() => setSelectedImage(file.url)}
                    />
                  ) : (
                    <a key={i} href={file.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100">
                      <FileText size={16} /> View file
                    </a>
                  )
                ))}
              </div>
            ) : (
              <p className="p-5 text-sm text-slate-400">No evidence uploaded</p>
            )}
          </Section>
        </div>

        {/* Right Column */}
        <aside className="flex flex-col gap-6">

          {/* Update Status */}
          <Section icon={RefreshCcw} title="Update Status">
            <div className="flex flex-col gap-4 p-5">
              <select
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                value={report.status}
                onChange={(e) => setReport({ ...report, status: e.target.value })}
              >
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
              {report.status === "resolved" && !canResolve && (
                <div className="rounded-lg border-l-4 border-amber-500 bg-amber-50 p-3 text-sm text-amber-700">
                  Assign the case and add an action before resolving.
                </div>
              )}
              <button
                className="h-10 w-full rounded-lg bg-sky-800 text-sm font-bold text-white transition-colors hover:bg-blue-900 disabled:opacity-50"
                onClick={handleStatusUpdate} disabled={saving}
              >
                {saving ? "Saving..." : "Update Status"}
              </button>
            </div>
          </Section>

          {/* Assignment Section */}
          <Section icon={Users} title="Assignment">
            <div className="flex flex-col gap-4 p-5">
              {report.assignment?.entityId ? (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm font-bold text-blue-700">
                    Assigned to Department
                  </div>
                  <div className="text-sm text-slate-600">
                    {getDepartmentName(report.assignment.entityId)}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-slate-400">
                  Not yet assigned
                </div>
              )}

              {/* Assignment Dropdown */}
              <div className="flex flex-col gap-2">
                <select
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
                  onChange={(e) =>
                    setReport({
                      ...report,
                      assignment: {
                        entityId: e.target.value,
                        individualId: null
                      }
                    })
                  }
                  value={report.assignment?.entityId || ""}
                >
                  <option value="">Assign to department...</option>

                  {departments.map((dep) => (
                    <option key={dep.id} value={dep.id}>
                      {dep.name}
                    </option>
                  ))}
                </select>

                <button
                  className="h-10 w-full rounded-lg border border-blue-200 bg-white text-sm font-bold text-blue-700 transition-all hover:bg-blue-50 active:scale-[0.98] disabled:opacity-50"
                  onClick={handleAssign}
                  disabled={saving}
                >
                  {saving ? "Confirming..." : "Confirm Assignment"}
                </button>
              </div>
            </div>
          </Section>

          {/* Timeline / Actions */}
          <Section icon={History} title="Case Actions" badge={report.actions?.length}>
            <div className="flex flex-col p-5">
              <div className="relative flex flex-col gap-6 pb-4">
                {report.actions?.map((a, i) => (
                  <div key={i} className="relative flex gap-4 pl-6">
                    {/* Timeline Line */}
                    {i !== report.actions.length - 1 && (
                      <div className="absolute left-[5px] top-4 h-full w-px bg-slate-100" />
                    )}
                    <div className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-blue-100 bg-blue-500" />
                    <div className="flex-1">
                      <p className="text-[15px] leading-tight text-slate-700">{a.message}</p>
                      <span className="mt-1 block text-xs font-medium text-slate-400">{a.by} • {new Date(a.createdAt?.seconds * 1000).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
              <textarea
                className="mt-4 w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                placeholder="Add update..." rows={3}
                value={newAction} onChange={(e) => setNewAction(e.target.value)}
              />
              <button
                className="mt-3 h-10 w-full rounded-lg  bg-sky-800 text-sm font-bold text-white transition-colors hover:bg-slate-800"
                onClick={handleAddAction} disabled={saving || !newAction.trim()}
              >
                Add Action
              </button>
            </div>
          </Section>
        </aside>
      </main>

      {/* Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm" onClick={() => setSelectedImage(null)}>
          <img src={selectedImage} className="max-h-[85vh] max-w-[90vw] rounded-xl shadow-2xl" alt="Preview" />
          <button className="absolute right-6 top-6 rounded-full bg-white/10 p-2 text-white hover:bg-white/20">
            <X size={24} />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Components ──────────────────────────────────────────────────────────

function Section({ icon: Icon, title, children, badge }) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-50 bg-gray-200   px-5 py-3">
        <div className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider text-black">
          <Icon size={14} className="text-slate-400" /> {title}
        </div>
        {badge > 0 && (
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-600">{badge}</span>
        )}
      </div>
      {children}
    </section>
  );
}

function InfoRow({ label, value, fullWidth }) {
  return (
    <div className={`flex flex-col gap-1 border-b border-slate-50 p-4 last:border-b-0 ${fullWidth ? "sm:col-span-2" : ""}`}>
      <span className="text-[11px] font-bold uppercase tracking-widest text-slate-300">{label}</span>
      <div className="text-[15px] font-medium text-slate-700">{value}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    pending: "bg-amber-50 text-amber-700",
    resolved: "bg-emerald-50 text-emerald-700",
    escalated: "bg-red-50 text-red-700",
    default: "bg-blue-50 text-blue-700"
  };
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${styles[status] || styles.default}`}>
      {status.replace("_", " ")}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const styles = {
    high: "bg-red-50 text-red-600",
    medium: "bg-amber-50 text-amber-600",
    low: "bg-emerald-50 text-emerald-600"
  };
  return (
    <span className={`rounded px-1.5 py-0.5 text-[11px] font-black uppercase tracking-tighter ${styles[priority] || "bg-slate-100"}`}>
      {priority}
    </span>
  );
}