import { useState, useEffect, useRef } from "react";
import { createReport } from "../api/report.api";
import MapPicker from "../components/MapPicker";
import LocationSearch from "../components/LocationSearch";
import { getAddress } from "../utils/getAddress";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
const API_URL = import.meta.env.VITE_API_URL;


// ─── ANIMATION HOOK ─────────────────────────────────────────────   ──────────────
function useInView(threshold = 0.1) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

function FadeIn({ children, delay = 0, className = "" }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section
      style={{
        background: `linear-gradient(145deg, rgba(15,39,68,0.92) 0%, rgba(27,58,92,0.85) 45%, rgba(26,74,107,0.7) 100%), url('/hero-image.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        minHeight: "60vh",
        position: "relative",
        overflow: "hidden",
      }}
      className="flex items-center"
    >
      <div
        style={{
          position: "absolute", top: "-120px", right: "-80px",
          width: "500px", height: "500px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(42,157,143,0.2) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute", inset: 0, opacity: 0.05,
          backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "90px 90px",
          pointerEvents: "none",
        }}
      />
      <div className="max-w-7xl mx-auto px-6 py-32 relative z-10 w-full text-center">
        <FadeIn>
          <div
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: "rgba(42,157,143,0.2)", border: "1px solid rgba(42,157,143,0.4)",
              borderRadius: "100px", padding: "8px 20px", marginBottom: "28px",
              backdropFilter: "blur(4px)",
            }}
          >
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#2A9D8F" }} />
            <span style={{ color: "#7DD8D1", fontSize: "13px", fontWeight: 600, letterSpacing: "0.05em" }}>
              SECURE · ENCRYPTED · ANONYMOUS
            </span>
          </div>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(2.5rem, 6vw, 4.2rem)",
              fontWeight: 700, color: "#fff", lineHeight: 1.1,
              marginBottom: "24px", textShadow: "0 2px 10px rgba(0,0,0,0.3)",
            }}
          >
            Report an <span style={{ color: "#2A9D8F" }}>Incident</span>
          </h1>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "1.2rem", color: "rgba(255,255,255,0.9)",
              lineHeight: 1.8, maxWidth: "650px", margin: "0 auto",
            }}
          >
            Your safety is our priority. Provide details through our encrypted
            portal to receive the support and justice you deserve.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const INCIDENT_TYPES = [
  "Sexual Harassment",
  "Sexual Assault",
  "Rape / Attempted Rape",
  "Domestic Violence",
  "Physical Assault",
  "Psychological / Emotional Abuse",
  "Stalking / Cyberstalking",
  "Child Abuse",
  "Human Trafficking",
  "Forced Marriage",
  "Economic Abuse",
  "Discrimination / Gender-Based Violence",
  "Other"
];
function ReportPage() {
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [manualLocation, setManualLocation] = useState("");
  const [incidentDate, setIncidentDate] = useState("");
  const [relationship, setRelationship] = useState("unknown");
  const [witnessAvailable, setWitnessAvailable] = useState(false);
  const [witnessDescription, setWitnessDescription] = useState("");
  const [witnessContactType, setWitnessContactType] = useState("phone"); // "phone" | "email"
  const [witnessContact, setWitnessContact] = useState("");
  const [files, setFiles] = useState([]);
  const [uploadedEvidence, setUploadedEvidence] = useState([]);
  const [anonymous, setAnonymous] = useState(false);
  const [mapLocation, setMapLocation] = useState(null);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [caseInfo, setCaseInfo] = useState(null); // { caseId, pin }

  // Revoke object URLs on unmount to avoid memory leaks
  useEffect(() => {
    return () => previewUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [previewUrls]);

  const API_URL = import.meta.env.VITE_API_URL;

  // ── Upload evidence ───────────────────────────────────────────────────────────
  const uploadFiles = async () => {
    if (!files.length) return [];

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    const res = await fetch(`${API_URL}/upload/evidence`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Upload failed");
    }

    setUploadedEvidence(data.files);
    return data.files;
  };

  // ── Cleanup uploaded files if submit fails ────────────────────────────────────
  const cleanupUploads = async () => {
    if (!uploadedEvidence.length) return;

    try {
      await fetch(`${API_URL}/upload/evidence`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          public_ids: uploadedEvidence.map((file) => file.public_id),
        }),
      });
    } catch (err) {
      console.error("Cleanup failed:", err);
    }
  };
  // ── Reverse-geocode map pin or fall back to manual input ───────────────────
  const buildLocation = async () => {
    if (!mapLocation) {
      return {
        address: manualLocation || "Unknown location",
        city: "Unknown city",
        state: "Unknown state",
        lat: null,
        lng: null,
      };
    }

    const addr = await getAddress(mapLocation.lat, mapLocation.lng);
    return {
      address: addr.address || manualLocation || "Unknown location",
      city: addr.city || "Unknown city",
      state: addr.state || "Unknown state",
      lat: Number(mapLocation.lat),
      lng: Number(mapLocation.lng),
    };
  };

  // ── Image preview management ────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected);
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setPreviewUrls(selected.map((f) => URL.createObjectURL(f)));
  };

  const handleRemoveImage = (index) => {
    URL.revokeObjectURL(previewUrls[index]);
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Location search selection ───────────────────────────────────────────────
  const handleSearchSelect = (place) => {
    setMapLocation({ lat: place.lat, lng: place.lng });
    setManualLocation(place.display);
  };

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    if (!type.trim()) return "Please select an incident type.";
    if (!description.trim()) return "Please describe what happened.";
    if (!manualLocation && !mapLocation) return "Please provide a location.";
    return null;
  };

  // ── Reset ──────────────────────────────────────────────────────────────────
  const resetForm = () => {
    setType("");
    setDescription("");
    setManualLocation("");
    setIncidentDate("");
    setRelationship("unknown");
    setWitnessAvailable(false);
    setWitnessDescription("");
    setWitnessContactType("phone");
    setWitnessContact("");
    setFiles([]);
    setUploadedEvidence([]);
    setMapLocation(null);
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setPreviewUrls([]);
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validate();
    if (validationError) return setError(validationError);

    try {
      setLoading(true);

      const [evidence, location] = await Promise.all([
        uploadFiles(),
        buildLocation(),
      ]);

      const payload = {
        type,
        description,
        location,
        manualLocation,
        incidentDate,
        perpetratorRelationship: relationship,
        witness: {
          available: witnessAvailable,
          description: witnessDescription,
          contact: witnessAvailable && witnessContact
            ? { type: witnessContactType, value: witnessContact }
            : null,
        },
        evidence,
        anonymous,
      };

      const res = await createReport(payload);
      const { caseId, pin } = res;

      // store it
      setCaseInfo({ caseId, pin });

      resetForm();
      setSuccess("Your report has been submitted safely.");
    } catch (err) {
      console.error(err);

      if (err.response?.status === 401) {
        setError("Create an account or log in to submit a non-anonymous report.");
      } else {
        setError(err.message || "Something went wrong. Please try again.");
      }

      await cleanupUploads();
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ─────────────────────────────────────────────────────────
  if (success) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
          <FadeIn className="max-w-md w-full">

            <div className="w-20 h-20 bg-[#EBF7F6] text-[#2A9D8F] rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckIcon size={40} />
            </div>

            <h2 className="text-3xl font-bold text-[#1B3A5C] mb-4">
              Report Submitted
            </h2>

            <p className="text-[#64748B] mb-6">
              Please save your Case ID and PIN to track your report and receive updates.
            </p>

            {/* 🔥 CASE INFO DISPLAY */}
            {caseInfo && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6 text-left">
                <p className="text-sm text-slate-500 mb-1">Case ID</p>
                <p className="font-mono text-lg font-bold text-blue-700">
                  {caseInfo.caseId}
                </p>

                <p className="text-sm text-slate-500 mt-4 mb-1">PIN</p>
                <p className="font-mono text-lg font-bold text-red-600">
                  {caseInfo.pin}
                </p>
              </div>
            )}

            <p className="text-xs text-red-500 mb-6">
              ⚠️ This PIN will not be shown again. Keep it safe.
            </p>

            <button
              onClick={() => {
                setSuccess("");
                setCaseInfo(null);
              }}
              className="w-full py-4 bg-[#2A9D8F] text-white rounded-xl font-bold"
            >
              Submit Another Report
            </button>

          </FadeIn>
        </div>
      </div>
    );
  }

  // ── Main form ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#ffffff] font-sans">
      <Navbar />

      <HeroSection />

      <div className="max-w-3xl mx-auto px-6 -mt-10 pb-24">
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* 01 — Incident Details */}
          <FormSection step="01" title="Incident Details">
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-lg font-bold text-[#1B3A5C] uppercase tracking-wide">
                  Category
                </label>

                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-[#E2EEF8] focus:border-[#2A9D8F] outline-none transition-all bg-white text-[#334155] text-base"
                >
                  <option value="">Select incident category</option>

                  {INCIDENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div><br />

              <div className="space-y-5">
                <label className="text-lg font-bold text-[#1B3A5C] uppercase tracking-wide">
                  Description
                </label>
                <textarea
                  className="w-full p-4 rounded-xl border border-[#E2EEF8] focus:border-[#2A9D8F] outline-none transition-all min-h-[160px] text-[#334155] bg-white text-base leading-relaxed"
                  placeholder="Tell us what happened..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div><br />

              <div className="space-y-2">
                <label className="text-lg font-bold text-[#1B3A5C] uppercase tracking-wide">
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  className="w-full h-12 px-4 rounded-xl border border-[#E2EEF8] focus:border-[#2A9D8F] outline-none transition-all bg-white text-base"
                  value={incidentDate}
                  onChange={(e) => setIncidentDate(e.target.value)}
                />
              </div><br />

              <div className="space-y-2">
                <label className="text-lg font-bold text-[#1B3A5C] uppercase tracking-wide">
                  Relationship to Perpetrator
                </label>
                <select
                  className="w-full h-12 px-4 rounded-xl border border-[#E2EEF8] focus:border-[#2A9D8F] outline-none transition-all bg-white text-base text-[#334155]"
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                >
                  <option value="unknown">Unknown / Prefer not to say</option>
                  <option value="stranger">Stranger</option>
                  <option value="partner">Partner</option>
                  <option value="family">Family</option>
                  <option value="acquaintance">Acquaintance</option>
                  <option value="roomate">Roommate</option>
                  <option value="colleague">Colleague</option>
                  <option value="teacher">Teacher</option>
                  <option value="boss">Boss</option>
                  <option value="other">Other</option>
                </select>
              </div><br />

              {/* Witness */}
              <div className="space-y-3">
                <div
                  onClick={() => setWitnessAvailable((v) => !v)}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${witnessAvailable
                    ? "bg-[#EBF7F6] border-[#2A9D8F]"
                    : "bg-white border-[#E2EEF8]"
                    }`}
                >
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center border-2 flex-shrink-0 ${witnessAvailable
                      ? "bg-[#2A9D8F] border-[#2A9D8F]"
                      : "bg-white border-[#E2EEF8]"
                      }`}
                  >
                    {witnessAvailable && <CheckIcon size={14} color="#fff" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1B3A5C] text-lg">Witness Available</h4>
                    <p className="text-base text-[#64748B]">
                      There was someone who witnessed this incident.
                    </p>
                  </div>
                </div>

                {witnessAvailable && (
                  <div className="space-y-3">
                    <textarea
                      className="w-full p-4 rounded-xl border border-[#E2EEF8] focus:border-[#2A9D8F] outline-none transition-all min-h-[100px] text-[#334155] bg-white text-sm leading-relaxed"
                      placeholder="Describe the witness (name, what they saw)..."
                      value={witnessDescription}
                      onChange={(e) => setWitnessDescription(e.target.value)}
                    />

                    {/* Witness contact */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-[#1B3A5C] uppercase tracking-wide">
                        Witness Contact <span className="text-[#94A3B8] font-normal normal-case tracking-normal">(optional)</span>
                      </label>
                      <div className="flex gap-2">
                        {/* Toggle: phone / email */}
                        <div className="flex rounded-xl border border-[#E2EEF8] overflow-hidden flex-shrink-0">
                          {["phone", "email"].map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => { setWitnessContactType(opt); setWitnessContact(""); }}
                              className={`px-4 h-12 text-sm font-bold capitalize transition-all ${witnessContactType === opt
                                ? "bg-[#2A9D8F] text-white"
                                : "bg-white text-[#64748B] hover:bg-[#F8FAFC]"
                                }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                        <input
                          type={witnessContactType === "email" ? "email" : "tel"}
                          className="flex-1 h-12 px-4 rounded-xl border border-[#E2EEF8] focus:border-[#2A9D8F] outline-none transition-all bg-white text-base text-[#334155]"
                          placeholder={witnessContactType === "email" ? "witness@example.com" : "+234 800 000 0000"}
                          value={witnessContact}
                          onChange={(e) => setWitnessContact(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </FormSection>

          {/* 02 — Location */}
          <FormSection step="02" title="Location Details">
            <div className="space-y-4">
              <p className="text-base text-[#64748B]">
                Our map uses OpenStreetMap, so some buildings or newer locations may not
                appear. If you can't find your exact location, select the nearest landmark
                and provide additional details below.
              </p>

              <LocationSearch onSelect={handleSearchSelect} />

              <input
                className="w-full h-12 px-4 rounded-xl border border-[#E2EEF8] focus:border-[#2A9D8F] outline-none transition-all bg-white text-base"
                placeholder="Specific area (building, room number, landmark...)"
                value={manualLocation}
                onChange={(e) => setManualLocation(e.target.value)}
              />

              

              <div className="h-[300px] rounded-2xl overflow-hidden border border-[#E2EEF8] shadow-inner">
                <MapPicker onSelect={setMapLocation} externalPosition={mapLocation} />
              </div>

              {mapLocation && (
                <p className="text-xs text-[#64748B]">
                  Pin dropped at {mapLocation.lat.toFixed(5)}, {mapLocation.lng.toFixed(5)}
                </p>
              )}
            </div>
          </FormSection>

          {/* 03 — Evidence & Privacy */}
          <FormSection step="03" title="Evidence & Privacy">
            <div className="space-y-6">

              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full py-12 border-2 border-dashed border-[#E2EEF8] rounded-2xl hover:border-[#2A9D8F] transition-all cursor-pointer bg-white group"
              >
                <div className="w-14 h-14 rounded-full bg-[#EBF7F6] text-[#2A9D8F] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <UploadIcon />
                </div>
                <span className="text-base font-bold text-[#1B3A5C]">
                  Click to upload evidence
                </span>
                <span className="text-base text-[#64748B] mt-1">
                  Only image upload is available for now(Max 5MB)
                </span>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>

              {previewUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Evidence preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-xl border border-[#E2EEF8]"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 bg-black/60 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Remove image"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div
                onClick={() => setAnonymous((v) => !v)}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${anonymous
                  ? "bg-[#EBF7F6] border-[#2A9D8F]"
                  : "bg-white border-[#E2EEF8]"
                  }`}
              >
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center border-2 flex-shrink-0 ${anonymous
                    ? "bg-[#2A9D8F] border-[#2A9D8F]"
                    : "bg-white border-[#E2EEF8]"
                    }`}
                >
                  {anonymous && <CheckIcon size={14} color="#fff" />}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-[#1B3A5C] text-lg">Submit Anonymously</h4>
                  <p className="text-base text-[#64748B]">
                    Your identity will be scrubbed from this report's metadata.
                  </p>
                </div>
              </div>

              {!anonymous && (
                <p className="text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
                  You must be logged in to submit a non-anonymous report.
                </p>
              )}
            </div>
          </FormSection>

          {error && (
            <div className="p-4 bg-orange-50 border border-orange-200 text-orange-700 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-16 bg-[#2A9D8F] text-white rounded-2xl font-bold text-lg shadow-xl shadow-[#2A9D8F]/20 hover:bg-[#23857a] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading ? "Processing Securely..." : <><SendIcon /> Submit Incident Report</>}
          </button>

        </form>
      </div>

      <Footer />
    </div>
  );
}

// ─── REUSABLE COMPONENTS ──────────────────────────────────────────────────────
function FormSection({ step, title, children }) {
  return (
    <FadeIn>
      <div className="bg-white rounded-[24px] p-8 border border-[#E2EEF8] shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-3 mb-8 border-b border-[#F0F7FF] pb-4">
          <span className="text-[#2A9D8F] font-bold text-sm tracking-widest uppercase">
            {step}
          </span>
          <h3
            style={{ fontFamily: "'Playfair Display', serif" }}
            className="text-2xl font-bold text-[#1B3A5C]"
          >
            {title}
          </h3>
        </div>
        {children}
      </div>
    </FadeIn>
  );
}

// ─── ICONS ────────────────────────────────────────────────────────────────────
function CheckIcon({ size = 24, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function UploadIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}
function SendIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

export default ReportPage;