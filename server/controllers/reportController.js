const { db } = require("../models/firebase");
const {
  collection, where,addDoc, doc, setDoc,updateDoc, getDocs, getDoc,query, arrayUnion
} = require("firebase/firestore");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const  generatePin  = require("../models/utils/generatePin");
const { hashPin } = require("../models/utils/hashPin");
const { sendMail } = require("../models/utils/mailer");

const cloudinary = require("../config/cloudinary");



function normalize(str = "") {
  return str.toLowerCase().replace(/\s/g, "");
}

async function findDepartment(type, state) {
  const snapshot = await getDocs(collection(db, "departments"));

  for (let docSnap of snapshot.docs) {
    const dept = docSnap.data();

    const matchesType = dept.incidentTypes?.some(
      t => normalize(t) === normalize(type)
    );

    const matchesLocation =
      dept.location === "All" ||
      normalize(dept.location) === normalize(state);

    if (matchesType && matchesLocation) {
      return docSnap.id;
    }
  }

  return null;
}



exports.createReport = async (req, res) => {
  let {
    type,
    description,
    location,
    evidence = [],
    manualLocation,
    incidentDate,
    perpetratorRelationship,
    witness,
    anonymous
  } = req.body;
  console.log(req.body)

  try {
    if (typeof evidence === "string") {
      evidence = JSON.parse(evidence);
    }
  } catch {
    evidence = [];
  }

  const isAnonymous = anonymous === true || anonymous === "true";

  try {
    // ================= VALIDATION =================
    if (!type?.trim() || !description?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Type and description are required"
      });
    }

    if (!location || typeof location !== "object") {
      return res.status(400).json({
        success: false,
        message: "Invalid location"
      });
    }

    const { address, lat, lng } = location;

    if (!address) {
      return res.status(400).json({
        success: false,
        message: "Location address is required"
      });
    }

    if (lat !== null && lng !== null) {
      if (
        typeof lat !== "number" ||
        typeof lng !== "number" ||
        lat < -90 || lat > 90 ||
        lng < -180 || lng > 180
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid coordinates"
        });
      }
    }

    if (!Array.isArray(evidence)) {
      return res.status(400).json({
        success: false,
        message: "Invalid evidence format"
      });
    }

    // ================= AUTH =================
    
    const user = req.user || null;
    let reporter = null;

    if (!isAnonymous) {
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Login required for non-anonymous report"
        });
      }

      reporter = {
        uid: user.uid,
        email: user.email
      };
    }

   const docRef = doc(collection(db, "reports"));

    // ================= 🔐 SECURITY =================
    const caseId = `SS-${new Date().getFullYear()}-${docRef.id.slice(0, 6).toUpperCase()}`;
    const pin = generatePin();
    const hashedPin = await bcrypt.hash(pin, 10);

    const entityId = await findDepartment(type, location.state);
    console.log("DEBUG ASSIGNMENT:", {
      type,
      state: location.state,
      entityId
    });

    // ================= BUILD =================
    const reportData = {
      caseId,
      hashedPin, // 🔐 store hashed only

      type,
      description,
      incidentDate: incidentDate || null,
      perpetratorRelationship: perpetratorRelationship || "unknown",

      location: {
        address: location.address,
        city: location.city || "Unknown",
        state: location.state || "Unknown",
        lat: location.lat ?? null,
        lng: location.lng ?? null
      },

      manualLocation: manualLocation || "",

      witness: witness || {
        available: false,
        description: "",
        contact: null
      },

      anonymous: isAnonymous,
      reporter,
      evidence,

      status: "pending",
      priority: "medium",

      assignment: {
        entityId,
        individualId: null
      },

      createdAt: new Date(),
      updatedAt: new Date()
    };

    await addDoc(collection(db, "report"), reportData);

    return res.status(201).json({
      success: true,
      message: "Report created successfully",

      // 🔥 RETURN ONLY ONCE
      caseId,
      pin
    });

  } catch (error) {
    console.error("Report creation failed:", error);

    if (Array.isArray(evidence)) {
      await Promise.all(
        evidence.map(file =>
          file.public_id
            ? cloudinary.uploader.destroy(file.public_id)
            : null
        )
      );
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create report"
    });
  }
};
// ==============================
// GET USER REPORTS (React-friendly)
// ==============================
exports.getUserReports = async (req, res) => {
  try {    
    const userId = req.user.uid;

    const snapshot = await getDocs(collection(db, "report"));

    const reports = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(r => r.reporter?.uid === userId);

    return res.json({
      success: true,
      data: reports
    });

  } catch (error) {
    console.error("VIEW REPORTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch reports"
    });
  }
};



exports.trackReport = async (req, res) => {
  try {
    const { caseId } = req.body;
    const { pin } = req.body; // 🔥 require PIN

    if (!caseId || !pin) {
      return res.status(400).json({
        success: false,
        message: "Case ID and PIN are required"
      });
    }

    const q = query(
      collection(db, "report"),
      where("caseId", "==", caseId)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return res.status(404).json({
        success: false,
        message: "Invalid Case ID"
      });
    }

    const docSnap = snapshot.docs[0];
    const report = docSnap.data();

    // 🔐 VERIFY PIN
    const isMatch = await bcrypt.compare(pin, report.hashedPin);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid PIN"
      });
    }

    const sessionToken = crypto.randomBytes(32).toString("hex");

    // 💾 SAVE SESSION TO DB
    await updateDoc(docSnap.ref, {
      sessionToken,
      sessionCreatedAt: new Date()
    });

    // 🔥 RETURN SAFE DATA ONLY
    return res.status(200).json({
      success: true,
      report: {
        caseId: report.caseId,
        status: report.status,
        priority: report.priority,
        assignment: report.assignment,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt
      },
      sessionToken // 🔥 ADD THIS
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to track report"
    });
  }
}; 

exports.resolveReport = async (req, res) => {
  try {
    const user = req.user;
    const { reportId } = req.body;

    if (!user || user.role !== "caseworker") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const reportRef = doc(db, "report", reportId);
    const reportSnap = await getDoc(reportRef);

    if (!reportSnap.exists()) {
      return res.status(404).json({
        success: false,
        message: "Report not found"
      });
    }

    const report = reportSnap.data();

    // 🔐 only assigned worker can resolve
    if (report.assignment.individualId !== user.uid) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to this case"
      });
    }

    await updateDoc(reportRef, {
      status: "resolved",
      resolvedAt: new Date(),
      updatedAt: new Date(),

      actions: arrayUnion({
        type: "RESOLVED",
        by: user.uid,
        role: user.role,
        timestamp: new Date()
      })
    });

    return res.json({
      success: true,
      message: "Case resolved successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to resolve report"
    });
  }
};