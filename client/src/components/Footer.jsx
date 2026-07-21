import { Link } from "react-router-dom";
const Icon = ({ d, size = 20, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}>
    {typeof d === "string" ? <path d={d} /> : d}
  </svg>
);

const Icons = {
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
};
export default function Footer() {
  return (
    <footer className="bg-[#0F2744] text-white/70 py-12 px-6 font-['DM_Sans']">
      <div style={{ background: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "14px 18px", marginBottom: "28px", display: "flex", alignItems: "center", gap: "10px" }}>
        <Icon d={Icons.shield} size={15} style={{ color: "#FCD34D", flexShrink: 0 }} />
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12.5px", color: "rgba(255,255,255,0.65)", margin: 0, lineHeight: 1.5 }}>
          <strong style={{ color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>Disclaimer:</strong> This platform does not replace emergency services. If you are in immediate danger, call 112 or your local emergency number.
        </p>
      </div>
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-10">
        
        <div className="col-span-1 md:col-span-2">
          <h3 className="text-white font-bold text-xl mb-4">SafeSpeak</h3>
          <p className="text-sm leading-relaxed max-w-sm">
            Empowering survivors through secure, confidential, and compassionate reporting.
            Your safety is our priority. Available 24/7.
          </p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/report" className="hover:text-[#2A9D8F]">Report Incident</Link></li>
            <li><Link to="/resources" className="hover:text-[#2A9D8F]">Safety Resources</Link></li>
            <li><Link to="/about" className="hover:text-[#2A9D8F]">About Us</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Support</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="tel:199" className="hover:text-[#F4A261]">Emergency: 199</a></li>
            <li><Link to="/contact" className="hover:text-[#2A9D8F]">Contact Support</Link></li>
            <li><Link to="/privacy" className="hover:text-[#2A9D8F]">Privacy Policy</Link></li>
          </ul>
        </div>
        
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 text-center text-xs">
        © {new Date().getFullYear()} SafeSpeak SGBV Platform. All rights reserved.
      </div>
    </footer>
  );
}