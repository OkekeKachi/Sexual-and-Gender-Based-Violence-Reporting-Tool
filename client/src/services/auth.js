import API from "./api";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
// LOGIN
// export const loginUser = async (data) => {
//   const res = await API.post("/users/login", data);
//   const { email, password } = data;
  
//   const auth = getAuth();
//     try {
//       const userCredential = await signInWithEmailAndPassword(
//         auth,
//         email,
//         password
//       );

//       console.log("Logged in:", userCredential.user);
//       return userCredential.user;
//     } catch (err) {
//       console.log(err.message);
//       return err.message
//     }
  
  
// };

export const loginUser = async (data) => {
  // 1. Firebase login
  console.log(data);
  

  console.log("Attempting Firebase login with:", data); // 👈 ADD THIS
  const { email, password } = data;

  const auth = getAuth();


  const userCred = await signInWithEmailAndPassword(auth, email, password);

  const token = await userCred.user.getIdToken();
  localStorage.setItem("token", token);

  await API.post("/users/login", data);
 

  // 2. Send token to backend
  const res = await API.get("/worker/me", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  console.log(res.data.user);
  localStorage.setItem("user", JSON.stringify(res.data.user));
  
  return {
    token,
    user: res.data.user
  };
};


// SIGNUP
// services/auth.js (or report.api.js — wherever you prefer)
export const signupUser = async (data) => {
  const res = await API.post('/users/signup', data);
  return res.data;
};