import axios from "axios";
import { getAuth } from "firebase/auth";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Automatically attach Firebase token
API.interceptors.request.use(async (config) => {
  const auth = getAuth();
  const user = auth.currentUser;

  console.log("Current Firebase user:", user);

  if (user) {
    const token = await user.getIdToken(false);
    console.log("TOKEN:", token.substring(0, 20));

    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default API;