import { getAuth, signOut } from "firebase/auth";

export const useLogout = () => {
  const logout = async () => {
    const auth = getAuth();

    try {
      await signOut(auth);

      // optional cleanup (important for your app)
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      window.location.href = "/login"; // force reset state
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return logout;
};