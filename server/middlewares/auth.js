const admin = require("../models/utils/firebaseAdmin");
const { db } = require("../models/firebase");
const { doc, getDoc, query, collection, where, getDocs } = require("firebase/firestore");
const bcrypt = require("bcrypt");


exports.ensureAuthenticated = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log(req.headers.authorization);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // 👉 No token = not logged in (but still allowed)
      req.user = null;
      return next();
    }


    const token = authHeader.replace("Bearer ", "").trim();

    const decoded = await admin.auth().verifyIdToken(token);

    const userRef = doc(db, "users", decoded.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      req.user = null;
      return next();
    }

    const userData = userSnap.data();

    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      role: userData.role,
      departmentId: userData.departmentId || null,
      isActive: userData.isActive ?? true
    };
    console.log("USER:", req.user);
    console.log("ROLE:", req.user?.role);
    console.log("UID:", req.user?.uid);

    next();

  } catch (error) {
    console.error("AUTH ERROR:", error);

    // ❗ don’t block — just treat as unauthenticated
    req.user = null;
    next();
  }
};
exports.optionalAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return next(); // anonymous user
    }

    const token = header.split(" ")[1];

    const decoded = await admin.auth().verifyIdToken(token);

    req.user = {
      uid: decoded.uid,
      email: decoded.email,
    };

    next();
  } catch (err) {
    next(); // invalid token → continue as anonymous
  }
};

exports.ensureAdmin = (req, res, next) => {
  this.ensureAuthenticated(req, res, () => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only."
      });
    }

    next();
  });
};



exports.verifyToken = async (req, res, next) => {
  const header = req.headers.authorization;
  
  
  if (!header) return res.status(401).json({ message: "No token" });

  const token = header.split(" ")[1];

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// middleware/requireRole.js
exports.requireRole = (...roles) => {
  return (req, res, next) => {
    const user = req.user;

    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    next();
  };
};



exports.requireCaseAccess = async (req, res, next) => {
  try {
    const user = req.user;
    const { reportId } = req.params;

    const reportRef = doc(db, "report", reportId);
    const reportSnap = await getDoc(reportRef);

    if (!reportSnap.exists()) {
      return res.status(404).json({
        success: false,
        message: "Report not found"
      });
    }

    const report = reportSnap.data();

    // ✅ Super admin = full access
    if (user.role === "superadmin") {
      req.report = report;
      return next();
    }

    // ✅ Caseworker must be assigned
    if (
      user.role === "caseworker" &&
      report.assignment?.individualId === user.uid
    ) {
      req.report = report;
      return next();
    }

    return res.status(403).json({
      success: false,
      message: "Not authorized for this case"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Authorization failed"
    });
  }
};


exports.verifyMessageAccess = async (req, res, next) => {
  try {
    console.log("VERIFY:", req.user);

    const caseId = req.params.caseId || req.body.caseId;

    if (!caseId) {
      return res.status(400).json({ message: "Case ID required" });
    }

    // 🔍 Find report first
    const q = query(
      collection(db, "report"),
      where("caseId", "==", caseId)
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      return res.status(404).json({ message: "Case not found" });
    }

    const reportDoc = snap.docs[0];
    const report = reportDoc.data();

    // =========================
    // 1️⃣ AUTHENTICATED USERS
    // =========================
    if (req.user) {

      // 🔐 Worker/Admin access
      if (req.user && (req.user.role === "caseworker")) {
        req.accessType = "worker";
        req.case = report;
        return next();
      }

      // 🔐 Reporter access (owner of case)
      if (report.reporter.uid === req.user.uid) {
        req.accessType = "survivor";
        req.case = report;
        return next();
      }

      return res.status(403).json({ message: "Not authorized for this case" });
    }

    // =========================
    // 2️⃣ ANONYMOUS (PIN)
    // =========================
    const pin = req.headers["x-case-pin"];

    if (!pin) {
      return res.status(401).json({ message: "PIN required" });
    }

    const isMatch = await bcrypt.compare(pin, report.hashedPin);

    if (!isMatch) {
      return res.status(403).json({ message: "Invalid PIN" });
    }

    req.accessType = "survivor";
    req.case = report;

    return next();

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Access error" });
  }
};