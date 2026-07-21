import { useState, useEffect } from "react";
import { getDepartment, createWorker } from "../api/report.api";
import Sidebar from "../components/Sidebar";
import {
  UserPlus, Mail, Phone, Hash, User, Building2,
  CheckCircle2, AlertCircle, Loader2, Users,
  BadgeCheck, ChevronDown,
} from "lucide-react";

function InputField({ label, icon: Icon, required, helper, ...props }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        {Icon && <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />}
        <input
          className={`w-full ${Icon ? "pl-10" : "pl-4"} pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 hover:border-slate-300 transition-all duration-200`}
          {...props}
        />
      </div>
      {helper && <p className="text-xs text-slate-400">{helper}</p>}
    </div>
  );
}

export default function CreateWorker({ user }) {
  const [departments, setDepartments] = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(true);
  const [form, setForm] = useState({
    uid: "", firstName: "", lastName: "",
    email: "", phone: "", departmentId: "",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    getDepartment()
      .then((res) => setDepartments(res))
      .catch((err) => console.error(err))
      .finally(() => setLoadingDepts(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      await createWorker(form);
      setStatus("success");
      setForm({ uid: "", firstName: "", lastName: "", email: "", phone: "", departmentId: "" });
    } catch (err) {
      console.error(err);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const isValid = form.uid && form.firstName && form.lastName && form.email && form.departmentId;
  const initials = form.firstName && form.lastName
    ? `${form.firstName[0]}${form.lastName[0]}`.toUpperCase()
    : null;

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/40 overflow-hidden">
      <Sidebar user={user} />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto ">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-100 px-8 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">Personnel Management</p>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-tight">Onboard Staff Member</h1>
          </div>
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-teal-500 shadow-md shadow-blue-200">
            <Users size={18} className="text-white" />
          </div>
        </div>

        {/* Page body */}
        <div className="px-8 py-8 max-w-2xl">

          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            Register a new worker and assign them to a response department within the system.
          </p>

          {/* Alerts */}
          {status === "success" && (
            <div className="mb-6 flex items-start gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl px-5 py-4 shadow-sm">
              <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-emerald-500" />
              <div>
                <p className="font-semibold text-sm">Worker Onboarded Successfully</p>
                <p className="text-xs text-emerald-600 mt-0.5">The staff member has been registered and assigned to their department.</p>
              </div>
            </div>
          )}
          {status === "error" && (
            <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 text-red-800 rounded-2xl px-5 py-4 shadow-sm">
              <AlertCircle size={20} className="mt-0.5 shrink-0 text-red-500" />
              <div>
                <p className="font-semibold text-sm">Onboarding Failed</p>
                <p className="text-xs text-red-600 mt-0.5">An error occurred. Please verify all fields and try again.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Avatar Preview */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-6 py-5">
              <div className="flex items-center gap-5">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold shadow-inner transition-all duration-300
                  ${initials
                    ? "bg-gradient-to-br from-blue-500 to-teal-400 text-white shadow-blue-100"
                    : "bg-slate-100 text-slate-300 border-2 border-dashed border-slate-200"}`}>
                  {initials ?? <User size={28} />}
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-base">
                    {form.firstName || form.lastName
                      ? `${form.firstName} ${form.lastName}`.trim()
                      : <span className="text-slate-400 font-normal text-sm">Full name will appear here</span>}
                  </p>
                  {form.email && <p className="text-xs text-slate-400 mt-0.5">{form.email}</p>}
                  {form.departmentId && (
                    <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 bg-teal-50 border border-teal-100 text-teal-600 text-xs rounded-full font-medium">
                      <BadgeCheck size={11} />
                      {departments.find((d) => String(d.id) === String(form.departmentId))?.name ?? "Department assigned"}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Section 1: System Credentials */}
            {/* <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-50/60 to-transparent">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Hash size={14} className="text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-700">System Credentials</h2>
                    <p className="text-xs text-slate-400">Firebase authentication identifier</p>
                  </div>
                </div>
              </div>
              <div className="px-6 py-5">
                <InputField
                  label="Firebase UID"
                  icon={Hash}
                  required
                  placeholder="e.g. abc123xyz789..."
                  value={form.uid}
                  helper="Unique identifier from Firebase Authentication console"
                  onChange={(e) => setForm({ ...form, uid: e.target.value })}
                />
              </div>
            </div> */}

            {/* Section 2: Personal Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-gray-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                    <User size={14} className="text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-white">Personal Information</h2>
                    <p className="text-xs text-slate-400">Staff member's identity and contact details</p>
                  </div>
                </div>
              </div>
              <div className="px-6 py-5 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <InputField
                    label="First Name"
                    icon={User}
                    required
                    placeholder="e.g. Amina"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  />
                  <InputField
                    label="Last Name"
                    icon={User}
                    required
                    placeholder="e.g. Ibrahim"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  />
                </div>
                <InputField
                  label="Email Address"
                  icon={Mail}
                  required
                  type="email"
                  placeholder="e.g. amina.ibrahim@agency.gov.ng"
                  value={form.email}
                  helper="Must match the email used during Firebase registration"
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <InputField
                  label="Phone Number"
                  icon={Phone}
                  type="tel"
                  placeholder="e.g. +234 801 234 5678"
                  value={form.phone}
                  helper="Optional — include country code for international numbers"
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>

            {/* Section 3: Department Assignment */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-gray-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-100 flex items-center justify-center">
                    <Building2 size={14} className="text-teal-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-white">Department Assignment</h2>
                    <p className="text-xs text-slate-400">Assign this worker to a registered response department</p>
                  </div>
                </div>
              </div>
              <div className="px-6 py-5 space-y-1.5">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Department <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <select
                    value={form.departmentId}
                    disabled={loadingDepts}
                    className="w-full appearance-none pl-10 pr-10 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 hover:border-slate-300 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                    onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                  >
                    <option value="">
                      {loadingDepts ? "Loading departments…" : "Select a department"}
                    </option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                {loadingDepts && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
                    <Loader2 size={12} className="animate-spin" />
                    Fetching available departments…
                  </div>
                )}
                {!loadingDepts && departments.length === 0 && (
                  <p className="text-xs text-amber-500 pt-1">No departments found. Please create a department first.</p>
                )}
                {!loadingDepts && departments.length > 0 && (
                  <p className="text-xs text-slate-400">{departments.length} department{departments.length !== 1 ? "s" : ""} available</p>
                )}
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-between pt-1 pb-8">
              <p className="text-xs text-slate-400"><span className="text-red-400">*</span> Required fields</p>
              <button
                type="submit"
                disabled={loading || !isValid}
                className={`inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-md
                  ${isValid && !loading
                    ? "bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white shadow-blue-200 hover:shadow-lg hover:-translate-y-0.5"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"}`}
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" />Onboarding Staff…</>
                ) : (
                  <><UserPlus size={16} />Onboard Staff Member</>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}