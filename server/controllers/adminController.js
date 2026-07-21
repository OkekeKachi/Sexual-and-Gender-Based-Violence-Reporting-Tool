const { db } = require("../models/firebase");
const {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  query,
  orderBy,
  where,
  limit,
  startAfter,
  getCountFromServer,
  arrayUnion,
  setDoc,
  deleteDoc
} = require("firebase/firestore");
const  sendInviteEmail  = require("../models/utils/sendinvitemail");
const admin = require("../models/utils/firebaseAdmin");


exports.getAllReports = async (req, res) => {
  try {
    const {
      status,
      city,
      state,
      search,
      limit: pageLimit = 10,
      cursor
    } = req.query;

    console.log("QUERY:", req.query);

    let constraints = [];

    // =========================
    // ONLY SAFE FIRESTORE FILTER
    // =========================
    if (status && status !== "all") {
      constraints.push(where("status", "==", status));
    }

    // =========================
    // ORDERING (REQUIRED)
    // =========================
    constraints.push(orderBy("createdAt", "desc"));

    // =========================
    // PAGINATION (CURSOR)
    // =========================
    if (cursor) {
      const cursorSnap = await getDoc(doc(db, "report", cursor));

      if (cursorSnap.exists()) {
        constraints.push(startAfter(cursorSnap));
      }
    }

    // =========================
    // LIMIT
    // =========================
    constraints.push(limit(parseInt(pageLimit)));

    // =========================
    // QUERY FIRESTORE
    // =========================
    const q = query(collection(db, "report"), ...constraints);
    const snapshot = await getDocs(q);

    let reports = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));

    // =========================
    // 🔍 FILTER IN MEMORY (SAFE)
    // =========================

    // CITY FILTER
    if (city && city.trim() !== "") {
      reports = reports.filter(r =>
        (r.location?.city || "")
          .toLowerCase()
          .includes(city.toLowerCase())
      );
    }

    // STATE FILTER
    if (state && state.trim() !== "") {
      reports = reports.filter(r =>
        (r.location?.state || "")
          .toLowerCase()
          .includes(state.toLowerCase())
      );
    }

    // SEARCH (CASE ID)
    if (search && search.trim() !== "") {
      const keyword = search.toLowerCase();

      reports = reports.filter(r =>
        (r.caseId || "").toLowerCase().includes(keyword)
      );
    }

    // =========================
    // NEXT CURSOR
    // =========================
    const lastDoc = snapshot.docs[snapshot.docs.length - 1];

    return res.json({
      success: true,
      data: reports,
      nextCursor: lastDoc ? lastDoc.id : null
    });

  } catch (error) {
    console.error("ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch reports"
    });
  }
};
// ==============================
// GET SINGLE REPORT
// ==============================
exports.getReportById = async (req, res) => {
  try {
    const reportRef = doc(db, "report", req.params.id);
    const reportSnap = await getDoc(reportRef);

    if (!reportSnap.exists()) {
      return res.status(404).json({
        success: false,
        message: "Report not found"
      });
    }

    const data = reportSnap.data();

    return res.json({
      success: true,
      data: {
        id: reportSnap.id,
        ...data,
        location: data.location || null
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error fetching report"
    });
  }
};


// ==============================
// UPDATE REPORT STATUS
// ==============================
exports.updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "reviewed", "resolved"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      });
    }

    const reportRef = doc(db, "report", id);

    await updateDoc(reportRef, {
      status,
      updatedAt: Date.now()
    });

    return res.json({
      success: true,
      message: "Status updated"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to update status"
    });
  }
};

// ==============================
// DASHBOARD STATS (WITH HOTSPOTS + ESCALATION)
// ==============================
exports.getDashboardStats = async (req, res) => {
  try {
    const snapshot = await getDocs(collection(db, "report"));

    const reports = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));

    const now = new Date();
    const ESCALATION_HOURS = 48;

    // =============================
    // BASE STATS
    // =============================
    const stats = {
      total: reports.length,
      pending: 0,
      reviewed: 0,
      resolved: 0,
      assigned: 0
    };

    // =============================
    // GROUPING OBJECTS
    // =============================
    const byCity = {};
    const byType = {};
    const byPriority = {};

    const hotspots = [];
    const escalated = [];

    const hotspot_threshold = 5;

    // =============================
    // PROCESS REPORTS
    // =============================
    reports.forEach(r => {
      // STATUS
      if (r.status === "pending") stats.pending++;
      if (r.status === "reviewed") stats.reviewed++;
      if (r.status === "resolved") stats.resolved++;
      if (r.status === "assigned") stats.assigned++;

      // CITY
      const city = r.location?.city || "Unknown";
      byCity[city] = (byCity[city] || 0) + 1;

      // TYPE
      const type = r.type || "Unknown";
      byType[type] = (byType[type] || 0) + 1;

      // PRIORITY
      const priority = r.priority || "Unknown";
      byPriority[priority] = (byPriority[priority] || 0) + 1;

      // =============================
      // ESCALATION LOGIC
      // =============================
      if (r.status !== "resolved" && r.status !== "closed") {
        const createdAt = r.createdAt?.seconds
          ? new Date(r.createdAt.seconds * 1000)
          : new Date(r.createdAt);

        const hoursOld = (now - createdAt) / (1000 * 60 * 60);

        const isOverdue = hoursOld >= ESCALATION_HOURS;
        const isHighPriority = r.priority === "high";

        if (isOverdue || isHighPriority) {
          escalated.push({
            id: r.caseId,
            city,
            priority: r.priority,
            reason: isHighPriority ? "HIGH_PRIORITY" : "OVERDUE",
            hoursOld: Math.floor(hoursOld)
          });
        }
      }
    });

    // =============================
    // FORMAT FOR CHARTS
    // =============================
    const formatChartData = (obj) =>
      Object.entries(obj).map(([name, value]) => ({
        name,
        value
      }));

    // =============================
    // HOTSPOT DETECTION
    // =============================
    Object.entries(byCity).forEach(([city, count]) => {
      if (count >= hotspot_threshold) {
        hotspots.push({
          city,
          count,
          level: count >= 10 ? "CRITICAL" : "HIGH"
        });
      }
    });

    // =============================
    // RESPONSE
    // =============================
    return res.json({
      success: true,
      data: {
        ...stats,
        byCity: formatChartData(byCity),
        byType: formatChartData(byType),
        byPriority: formatChartData(byPriority),
        hotspots,
        escalated
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Dashboard error"
    });
  }
};

exports.updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const ref = doc(db, "report", id);

    await updateDoc(ref, {
      ...updates,
      updatedAt: new Date()
    });

    return res.json({
      success: true,
      message: "Report updated"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Update failed"
    });
  }
};


// PATCH /api/reports/:id/action
exports.addAction = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    const ref = doc(db, "report", id);

    await updateDoc(ref, {
      actions: arrayUnion({
        message,
        by: "Admin",
        createdAt: new Date()
      })
    });

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ success: false });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    const { id } = req.params;

    await deleteDoc(doc(db, "report", id));

    return res.json({
      success: true,
      message: "Report deleted"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Delete failed"
    });
  }
};
exports.runEscalationCheck = async () => {
  const snapshot = await getDocs(collection(db, "report"));

  const now = new Date();
  const ESCALATION_HOURS = 48;

  snapshot.forEach(async (docSnap) => {
    const r = docSnap.data();
    const docRef = doc(db, "report", docSnap.id);

    if (r.status === "resolved" || r.status === "closed") return;

    const createdAt = r.createdAt?.seconds
      ? new Date(r.createdAt.seconds * 1000)
      : new Date(r.createdAt);

    const hoursOld = (now - createdAt) / (1000 * 60 * 60);

    const isOld = hoursOld >= ESCALATION_HOURS;
    const isHighPriority = r.priority === "high";

    if (isOld || isHighPriority) {
      await updateDoc(docRef, {
        status: "escalated"
      });
    }
  });
};

exports.autoAssignEscalatedCases = async () => {
  const snapshot = await getDocs(collection(db, "report"));

  snapshot.forEach(async (docSnap) => {
    const r = docSnap.data();
    const docRef = doc(db, "report", docSnap.id);

    // ❌ skip resolved cases
    if (r.status === "resolved" || r.status === "closed") return;

    let assignedTo = null;

    // =========================
    // ASSIGNMENT RULES
    // =========================

    // 🔴 HIGH PRIORITY → Police
    if (r.priority === "high") {
      assignedTo = {
        name: "Police Unit",
        role: "Emergency Response"
      };
    }

    // 🟠 SGBV / violence cases → NGO
    else if (r.type?.toLowerCase().includes("gbv") ||
      r.type?.toLowerCase().includes("violence") ||
      r.type?.toLowerCase().includes("rape") ||
      r.type?.toLowerCase().includes("assault")) {
      assignedTo = {
        name: "NGO Team",
        role: "Support & Protection"
      };
    }

    // 🔵 DEFAULT → Social Worker
    else {
      assignedTo = {
        name: "Social Worker",
        role: "Case Management"
      };
    }

    // =========================
    // UPDATE ONLY IF NOT ASSIGNED
    // =========================
    if (!r.assignedTo) {
      await updateDoc(docRef, {
        assignedTo,
        status: "assigned"
      });
    }
  });
};


exports.createWorker = async (req, res) => {
  try {
    const adminUser = req.user;

    if (!adminUser || adminUser.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only super admin can create workers"
      });
    }

    const { email, firstName, lastName, phone, departmentId } = req.body;

    // 🔥 Create Firebase Auth user (no usable password yet)
    const userRecord = await admin.auth().createUser({
      email,
      emailVerified: false
    });

    // 🔥 Generate password setup link
    const link = await admin.auth().generatePasswordResetLink(email);

    // 🔥 Save user in Firestore
    await setDoc(doc(db, "users", userRecord.uid), {
      uid: userRecord.uid,
      email,
      firstName,
      lastName,
      phone,

      role: "caseworker",
      departmentId,
      isActive: true,

      mustChangePassword: true,
      createdAt: Date.now()
    });

    // 👉 Send email (next step below)
    await sendInviteEmail(email, link);

    return res.status(201).json({
      success: true,
      message: "Worker invited successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to create worker"
    });
  }
};


exports.createDepartment = async (req, res) => {
  try {
    const admin = req.user;

    if (!admin || admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only super admin can create departments"
      });
    }

    const { name, location, incidentTypes } = req.body;

    if (!name || !incidentTypes) {
      return res.status(400).json({
        success: false,
        message: "Name and incident types are required"
      });
    }

    const { db } = require("../models/firebase");
    const { doc, setDoc } = require("firebase/firestore");

    const id = name.toLowerCase().replace(/\s/g, "_") + "_" + Date.now();

    await setDoc(doc(db, "departments", id), {
      id,
      name,
      location: location || "All",
      incidentTypes,
      createdAt: Date.now()
    });

    return res.status(201).json({
      success: true,
      message: "Department created successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to create department"
    });
  }
};

exports.getDepartments = async (req, res) => {
  try {
    const snapshot = await getDocs(collection(db, "departments"));

    const departments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return res.status(200).json({
      success: true,
      data: departments
    });

  } catch (error) {
    console.error("GET DEPARTMENTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch departments"
    });
  }
};

exports.completePasswordSetup = async (req, res) => {
  try {
    const uid = req.user.uid;

    const userRef = doc(db, "users", uid);

    await updateDoc(userRef, {
      mustChangePassword: false,
      passwordSetupCompleted: true
    });

    return res.json({
      success: true,
      message: "Password setup completed"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to update setup"
    });
  }
};