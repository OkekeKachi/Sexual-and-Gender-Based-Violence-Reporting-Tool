import { useState } from "react";
import { createDepartment } from "../api/report.api";
import Sidebar from "../components/Sidebar";
import {
  Building2, MapPin, Tag, Plus, X, CheckCircle2,
  AlertCircle, Loader2, Sparkles,
} from "lucide-react";

export default function CreateDepartment({ user }) {
  const [form, setForm] = useState({ name: "", location: "", incidentTypes: "" });
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const addTag = () => {
    const val = tagInput.trim();
    if (val && !tags.includes(val)) {
      const updated = [...tags, val];
      setTags(updated);
      setTagInput("");
      setForm({ ...form, incidentTypes: updated.join(", ") });
    }
  };

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  };

  const removeTag = (tag) => {
    const updated = tags.filter((t) => t !== tag);
    setTags(updated);
    setForm({ ...form, incidentTypes: updated.join(", ") });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      await createDepartment({
        ...form,
        incidentTypes: tags.length > 0 ? tags : form.incidentTypes.split(",").map((t) => t.trim()),
      });
      setStatus("success");
      setForm({ name: "", location: "", incidentTypes: "" });
      setTags([]);
    } catch (err) {
      console.error(err);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const isValid = form.name.trim() && form.location.trim() && tags.length > 0;

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/40 overflow-hidden">
      <Sidebar user={user} />
      
      {/* Main content */}
      <main className="flex-1 overflow-y-auto ">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-100 px-8 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">System Management</p>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-tight">Create Department</h1>
          </div>
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-teal-500 shadow-md shadow-blue-200">
            <Building2 size={18} className="text-white" />
          </div>
        </div>
        
        {/* Page body */}
        <div className="px-8 py-8 max-w-2xl">          
          {/* Description */}
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            Register a new response department and configure the incident categories it manages.
          </p>

          {/* Alerts */}
          {status === "success" && (
            <div className="mb-6 flex items-start gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl px-5 py-4 shadow-sm">
              <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-emerald-500" />
              <div>
                <p className="font-semibold text-sm">Department Created Successfully</p>
                <p className="text-xs text-emerald-600 mt-0.5">The department has been registered and is now active in the system.</p>
              </div>
            </div>
          )}
          {status === "error" && (
            <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 text-red-800 rounded-2xl px-5 py-4 shadow-sm">
              <AlertCircle size={20} className="mt-0.5 shrink-0 text-red-500" />
              <div>
                <p className="font-semibold text-sm">Failed to Create Department</p>
                <p className="text-xs text-red-600 mt-0.5">An error occurred. Please check your inputs and try again.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Section 1: Department Identity */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-gray-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Building2 size={14} className="text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-white">Department Identity</h2>
                    <p className="text-xs text-slate-400">Core identification details for the department</p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-5 space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    Department Name <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. Gender-Based Violence Response Unit"
                      value={form.name}
                      className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 hover:border-slate-300 transition-all duration-200"
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <p className="text-xs text-slate-400">Enter the full official name of the department</p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    Coverage Location <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. Lagos State or All"
                      value={form.location}
                      className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 hover:border-slate-300 transition-all duration-200"
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                    />
                  </div>
                  <p className="text-xs text-slate-400">Specify a state or enter "All" for nationwide coverage</p>
                </div>
              </div>
            </div>

            {/* Section 2: Incident Types */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-gray-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-100 flex items-center justify-center">
                    <Tag size={14} className="text-teal-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-white">Incident Type Configuration</h2>
                    <p className="text-xs text-slate-400">Define the categories of incidents this department handles</p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    Incident Types <span className="text-red-400">*</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Type a category and press Enter"
                        value={tagInput}
                        className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 hover:border-slate-300 transition-all duration-200"
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addTag}
                      className="flex items-center gap-1.5 px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-xl transition-colors duration-200 shrink-0"
                    >
                      <Plus size={15} />
                      Add
                    </button>
                  </div>
                  <p className="text-xs text-slate-400">
                    Press Enter or comma to add. e.g. Sexual Assault, Domestic Violence, Human Trafficking
                  </p>
                </div>

                {tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2 p-4 bg-slate-50 rounded-xl border border-slate-100 min-h-14">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-teal-200 text-teal-700 text-xs font-medium rounded-lg shadow-sm hover:border-teal-300 transition-colors"
                      >
                        <Sparkles size={11} className="text-teal-400" />
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-0.5 text-teal-400 hover:text-red-500 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center">
                    <Tag size={22} className="text-slate-300 mb-2" />
                    <p className="text-xs text-slate-400">No incident types added yet</p>
                    <p className="text-xs text-slate-300">Add categories using the input above</p>
                  </div>
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
                  <><Loader2 size={16} className="animate-spin" />Creating Department…</>
                ) : (
                  <><Building2 size={16} />Create Department</>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}