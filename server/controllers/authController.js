const { auth, db } = require("../models/firebase");
// ── Firebase Admin SDK ──────────────────────────────────────────────────
// createCustomToken() only exists on the Admin SDK (admin.auth()), never on
// the client SDK (`firebase/auth`) that the rest of this file uses to create
// the user. I don't have visibility into your project beyond this file, so
// I can't confirm whether an Admin init module already exists elsewhere.
// This import assumes one at "../models/firebaseAdmin". If you already have
// an Admin SDK init file under a different path/name, change this one line
// to point at it instead of creating a new one. If you don't have one yet,
// see the "BACKEND SETUP REQUIRED" note at the bottom of this file for
// exactly what that module needs to contain.
const admin = require("../models/utils/firebaseAdmin");

const {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendEmailVerification
} = require("firebase/auth");

const {
  doc,
  setDoc,
  collection,
  getDocs,
  query,
  where,
  serverTimestamp
} = require("firebase/firestore");


// ==============================
// SIGNUP (React-friendly API)
// ==============================
exports.signup = async (req, res) => {
  const { email, password, confirm_password, firstName, lastName, phone } = req.body;

  try {
    if (
      !email ||
      !password ||
      !confirm_password ||
      !firstName ||
      !lastName ||
      !phone
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    if (password !== confirm_password) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match"
      });
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, {
      displayName: `${firstName} ${lastName}`
    });
    const user = userCredential.user;
    // await sendEmailVerification(user);

    await setDoc(doc(db, "users", user.uid), {
      firstName,
      lastName,
      displayName: `${firstName} ${lastName}`,
      email,
      emailVerified: false,
      phone,
      role: "user",
      createdAt: serverTimestamp(),
    });

    // Generate a Firebase custom token for the EXACT uid just created above.
    // This lets the frontend sign into this same account (via
    // signInWithCustomToken) so it has a client-side Firebase session to
    // call sendEmailVerification()/resend from — it does not create any
    // new Firebase account or user.
    const customToken = await admin.auth().createCustomToken(user.uid);

    return res.status(201).json({
      success: true,
      message: "Account created. Please verify your email before logging in.",
      emailVerificationRequired: true,
      customToken
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Signup failed"
    });
  }
};


// ==============================
// LOGIN (React-friendly API)
// ==============================


// exports.login = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     if (!email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: "All fields are required"
//       });
//     }

//     const userCredential = await signInWithEmailAndPassword(auth, email, password);
//     const firebaseUser = userCredential.user;

//     // 🔥 GET USER DIRECTLY BY UID
//     const q = query(
//       collection(db, "users"),
//       where("email", "==", firebaseUser.email)
//     );

//     const snapshot = await getDocs(q);

//     if (snapshot.empty) {
//       return res.status(404).json({
//         success: false,
//         message: "User profile not found"
//       });
//     }

//     const userData = snapshot.docs[0].data();


//     // 🔥 SESSION FIX (THIS IS THE KEY PART)
//     req.session.user = {
//       uid: firebaseUser.uid,
//       email: firebaseUser.email,

//       name: `${userData.firstName} ${userData.lastName}`,
//       phone: userData.phone,

//       role: userData.role || "user",
//       departmentId: userData.departmentId || null, // 🔥 ADD THIS
//       isActive: userData.isActive !== false
//     };

//     return res.status(200).json({
//       success: true,
//       message: "Login successful",
//       user: req.session.user
//     });

//   } catch (error) {
//     return res.status(401).json({
//       success: false,
//       message: err.message
//     });
//   }
// };



exports.login = async (req, res) => {
  return res.status(410).json({
    success: false,
    message: "This endpoint is no longer used. Authenticate with Firebase on the frontend."
  });
};

// ==============================
// RESEND VERIFICATION EMAIL
// ==============================
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    // Find the Firebase account
    const userRecord = await admin.auth().getUserByEmail(email);

    // Don't resend if already verified
    if (userRecord.emailVerified) {
      return res.status(400).json({
        success: false,
        message: "This email is already verified."
      });
    }

    // Generate a fresh custom token for the SAME Firebase UID
    const customToken = await admin.auth().createCustomToken(
      userRecord.uid
    );

    return res.status(200).json({
      success: true,
      message: "Verification email can be resent.",
      customToken
    });

  } catch (error) {
    console.error("RESEND VERIFICATION ERROR:", error);

    if (error.code === "auth/user-not-found") {
      return res.status(404).json({
        success: false,
        message: "No account was found with this email."
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to prepare verification email."
    });
  }
};
// ==============================
// VERIFICATION STATUS (Login page polling)
// ==============================
// Read-only check used ONLY so the Login page can poll for the latest
// Firebase emailVerified value after signing an unverified user out.
// Uses the existing Admin SDK import at the top of this file — no new
// Firebase Admin initialization, no token issuance, no Firestore writes.
exports.verificationStatus = async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  try {
    const userRecord = await admin.auth().getUserByEmail(email);

    return res.status(200).json({
      success: true,
      emailVerified: !!userRecord.emailVerified,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// BACKEND SETUP REQUIRED (only if you don't already have this)
//
// admin.auth().createCustomToken() requires the Firebase ADMIN SDK
// (`firebase-admin`), which is a separate package from the client SDK
// (`firebase`) already used above for createUserWithEmailAndPassword. If
// your project doesn't already initialize the Admin SDK somewhere, create
// a new file, e.g. models/firebaseAdmin.js:
//
//   const admin = require("firebase-admin");
//   const serviceAccount = require("../path/to/serviceAccountKey.json");
//
//   if (!admin.apps.length) {
//     admin.initializeApp({
//       credential: admin.credential.cert(serviceAccount),
//     });
//   }
//
//   module.exports = admin;
//
// and install the package: npm install firebase-admin
//
// Get the service account key from Firebase Console → Project Settings →
// Service Accounts → Generate new private key. Keep that JSON file out of
// version control (.gitignore it) and load it via an env var in production
// rather than committing it.
//
// If you already have an Admin SDK init file somewhere in this project,
// just update the `require("../models/firebaseAdmin")` path at the top of
// this file to point at it instead — don't create a second one.
// ─────────────────────────────────────────────────────────────────────────