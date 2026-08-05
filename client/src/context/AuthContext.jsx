import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getAuth,
  onAuthStateChanged,
} from "firebase/auth";

import API from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const auth = getAuth();

  const [firebaseUser, setFirebaseUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await API.get("/worker/me");
      setProfile(res.data.user);
      
      return res.data.user;
    } catch (err) {
      console.log(err);
      setProfile(null);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);

      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      // Firebase auth is ready
      setLoading(false);

      // Fetch profile in the background
      fetchProfile();
      

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const refreshProfile = async () => {
    return await fetchProfile();
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        profile,
        loading,
        refreshProfile,
        setProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);