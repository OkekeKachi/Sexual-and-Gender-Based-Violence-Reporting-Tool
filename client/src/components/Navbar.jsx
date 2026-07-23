import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useLogout } from "../utils/useLogout";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const logout = useLogout();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Report Incident", path: "/report" },
    { name: "Resources", path: "/resources" },
    {name:"Track", path:"/track"}
  ];

  const getInitials = (user) => {
    if (!user) return "";
    if (user.displayName) return user.displayName.split(" ").map((n) => n[0]).join("").toUpperCase();
    return user.email ? user.email.slice(0, 2).toUpperCase() : "U";
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-400 bg-[#1B3A5C]/95 backdrop-blur-md shadow-lg"
      }`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br from-[#2A9D8F] to-[#1B3A5C]">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M12 22V12M3 7l9 5 9-5" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="font-['DM_Sans'] text-white">
            <span className="font-bold text-lg tracking-tight block leading-tight">SafeSpeak</span>
            <span className="text-[#7DD8D1] text-[10px] font-medium uppercase tracking-wider block">SGBV Reporting</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-1 font-['DM_Sans']">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${location.pathname === link.path ? "bg-[#2A9D8F] text-white" : "text-white/80 hover:bg-white/10"
                }`}
            >
              {link.name}
            </Link>
          ))}
          {user && (
            <Link
              to="/my-reports"
              onClick={() => setMenuOpen(false)}
              className={`rounded-xl px-4 py-3 text-sm font-medium transition-colors ${location.pathname === "/my-reports"
                  ? "bg-[#2A9D8F] text-white"
                  : "text-white/90 hover:bg-white/10 hover:text-white"
                }`}
            >
              My Reports
            </Link>
          )}
          <div className="ml-4 pl-4 border-l border-white/10">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2A9D8F] to-[#1B3A5C] flex items-center justify-center text-xs font-semibold text-white">
                  {getInitials(user)}
                </div>            
                <div>
                  <button onClick={logout} className="px-3 py-1 rounded-lg text-sm font-medium bg-gradient-to-br from-[#E76F51] to-[#D62828] text-white">Logout</button>
                </div> 
              </div>  
            ) : (
              <Link to="/login" className="px-5 py-2 rounded-lg text-sm font-semibold bg-[#2A9D8F] text-white">Login</Link>
            )}
          </div>
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden flex flex-col gap-1.5 p-2">
          <span className={`block w-6 h-0.5 bg-white transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-6 h-0.5 bg-white transition-all ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-white transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${menuOpen ? "max-h-[500px] mt-4" : "max-h-0"
          }`}
      >
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-3">
          {/* Navigation Links */}
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMenuOpen(false)}
                className={`rounded-xl px-4 py-3 text-sm font-medium transition-colors ${location.pathname === link.path
                    ? "bg-[#2A9D8F] text-white"
                    : "text-white/90 hover:bg-white/10 hover:text-white"
                  }`}
              >
                {link.name}
              </Link>
            ))}

            {user && (
              <Link
                to="/my-reports"
                onClick={() => setMenuOpen(false)}
                className={`rounded-xl px-4 py-3 text-sm font-medium transition-colors ${location.pathname === "/my-reports"
                    ? "bg-[#2A9D8F] text-white"
                    : "text-white/90 hover:bg-white/10 hover:text-white"
                  }`}
              >
                My Reports
              </Link>
            )}
          </div>
          {/* Divider */}
          <div className="my-3 border-t border-white/10" />

          {/* Authentication */}
          {user ? (
            <div className="flex items-center justify-between rounded-xl bg-white/5 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#2A9D8F] to-[#1B3A5C] text-sm font-bold text-white">
                  {getInitials(user)}
                </div>

                <div>
                  {/* <p className="text-sm font-semibold text-white">
                    {user.displayName || "User"}
                  </p> */}
                  <p className="text-xs text-white/60">
                    {user.email}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                }}
                className="rounded-lg bg-gradient-to-r from-[#E76F51] to-[#D62828] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="block rounded-xl bg-gradient-to-r from-[#2A9D8F] to-[#1B3A5C] px-4 py-3 text-center text-sm font-semibold text-white transition hover:opacity-90"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}