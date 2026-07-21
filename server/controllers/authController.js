const { auth, db } = require("../models/firebase");
const {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} = require("firebase/auth");

const {
  doc,
  setDoc,
  collection,
  getDocs,
  query,
  where
} = require("firebase/firestore");


// ==============================
// SIGNUP (React-friendly API)
// ==============================
exports.signup = async (req, res) => {
  const { email, password, confirm_password, firstName, lastName, phone } = req.body;

  try {
    if (!email || !password || !firstName || !lastName || !phone) {
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
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      firstName,
      lastName,
      email,
      phone,
      role: "user",
      createdAt: Date.now()
    });

    return res.status(201).json({
      success: true,
      message: "Signup successful"
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


exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // 🔥 GET USER DIRECTLY BY UID
    const q = query(
      collection(db, "users"),
      where("email", "==", firebaseUser.email)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return res.status(404).json({
        success: false,
        message: "User profile not found"
      });
    }

    const userData = snapshot.docs[0].data();


    // 🔥 SESSION FIX (THIS IS THE KEY PART)
    req.session.user = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,

      name: `${userData.firstName} ${userData.lastName}`,
      phone: userData.phone,

      role: userData.role || "user",
      departmentId: userData.departmentId || null, // 🔥 ADD THIS
      isActive: userData.isActive !== false
    };

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: req.session.user
    });

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: err.message
    });
  }
};

