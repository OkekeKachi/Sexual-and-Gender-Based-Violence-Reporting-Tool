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

export const loginUser = async ({ email, password }) => {
  const auth = getAuth();

  const credential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );

  return credential.user;
};  

// SIGNUP
// services/auth.js (or report.api.js — wherever you prefer)
export const signupUser = async (data) => {
  const res = await API.post('/users/signup', data);
  return res.data;
};