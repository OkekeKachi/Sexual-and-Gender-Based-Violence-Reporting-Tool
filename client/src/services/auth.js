import API from "./api";
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithCustomToken,
  sendEmailVerification,
  signOut,
} from "firebase/auth";

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

  await credential.user.reload();

  console.log("LOGIN EMAIL VERIFIED:", credential.user.emailVerified);

  if (!credential.user.emailVerified) {
    await signOut(auth);
    throw new Error("Please verify your email before logging in.");
  }

  return credential.user;
};
// SIGNUP
// services/auth.js (or report.api.js — wherever you prefer)
//
// ── ARCHITECTURE NOTE ──────────────────────────────────────────────────────
// The Firebase Auth account is NOT created on the client. Your backend
// signup controller creates it server-side (that's the
// createUserWithEmailAndPassword(...) call you mentioned living in the
// backend). Calling createUserWithEmailAndPassword() again here would create
// a SECOND, orphaned Firebase account for the same person — so this file
// deliberately does not do that.
//
// To send the initial verification email — and to let resendVerificationEmail
// use `auth.currentUser` the way you specified — the client needs its own
// Firebase session for the exact account the backend just created. The
// standard way to get that without re-creating the account is a Firebase
// custom token: the backend mints one with admin.auth().createCustomToken(uid)
// and returns it in the signup response body as `customToken`. The client
// then signs in with signInWithCustomToken(), which attaches to the SAME
// Firebase uid the backend created — no duplicate account.
//
// This requires one backend change. See the note at the bottom of this file.
export const signupUser = async (data) => {
  const res = await API.post('/users/signup', data);

  const { customToken } = res.data || {};

  if (customToken) {
    // Sign the client into the account the backend already created, then
    // send the initial verification email. We never set any local
    // "verified" flag — Firebase's user.emailVerified stays the single
    // source of truth once the user clicks the link.
    const auth = getAuth();
    const credential = await signInWithCustomToken(auth, customToken);
    await sendEmailVerification(credential.user);
    await signOut(auth);
  } else {
    // No custom token means there's no client-side Firebase user to call
    // sendEmailVerification() on yet. Signup itself still succeeded (the
    // backend already created the account/Firestore profile), but the
    // verification email can't be sent from here until the backend returns
    // a customToken. See the note below for the backend change needed.
    console.warn(
      "signupUser: /users/signup did not return a customToken — the client " +
      "has no Firebase session to send the verification email from. " +
      "See services/auth.js for the backend change this needs."
    );
  }

  return res.data;
};

// RESEND VERIFICATION EMAIL
// Relies on the currently authenticated Firebase client user — the session
// established above via signInWithCustomToken during signup (or via
// loginUser). Firebase's user.emailVerified remains the single source of
// truth; this function never assumes or fakes verification.
export const resendVerificationEmail = async (email) => {
  const res = await API.post("/users/resend-verification", {
    email,
  });

  const { customToken } = res.data;

  if (!customToken) {
    throw new Error("Unable to resend verification email.");
  }

  const auth = getAuth();

  try {
    // Temporarily authenticate as the SAME Firebase account
    const credential = await signInWithCustomToken(
      auth,
      customToken
    );

    await credential.user.reload();

    if (credential.user.emailVerified) {
      throw new Error("This email is already verified.");
    }

    // Send Firebase's verification email
    await sendEmailVerification(credential.user);

  } finally {
    // NEVER leave an unverified user logged in
    await signOut(auth);
  }
};

// CHECK EMAIL VERIFIED (Login page polling)
// Used ONLY by the Login page to poll the backend for the latest Firebase
// emailVerified value while the user is sitting on the Login page after
// being signed out for being unverified. Does not touch auth.currentUser,
// does not sign anyone in, and does not create/refresh any token — it's a
// read-only status check proxied through the backend's Admin SDK.
export const checkEmailVerified = async (email) => {
  const res = await API.get("/users/verification-status", {
    params: { email },
  });

  return !!res.data?.emailVerified;
};

// ─────────────────────────────────────────────────────────────────────────
// BACKEND CHANGE REQUIRED
//
// For the customToken branch above to ever run, your backend signup
// controller (the one currently calling createUserWithEmailAndPassword(...)
// via the Firebase Admin SDK) needs to also do:
//
//   const customToken = await admin.auth().createCustomToken(userRecord.uid);
//   return res.status(201).json({ ...existingResponseBody, customToken });
//
// i.e. after creating the user (and writing firstName/lastName/displayName/
// phone to Firestore as it already does), generate a custom token for that
// same uid and include it in the JSON response under the key `customToken`.
// Nothing about the existing user-creation, Firestore-write, or
// error-handling logic needs to change — this is purely an additive return
// value.
//
// Until that backend change ships, signupUser() above will still create the
// account and Firestore profile exactly as before, but will log a warning
// instead of sending the verification email (no fake/duplicate account,
// no fake "verified" state) — and resendVerificationEmail() will throw
// "No authenticated user found." because there's no client session yet.
// ─────────────────────────────────────────────────────────────────────────