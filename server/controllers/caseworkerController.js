const { db } = require("../models/firebase");
const {
  collection, where, addDoc, doc, setDoc, updateDoc, getDocs, query,getDoc, arrayUnion
} = require("firebase/firestore");


exports.getDepartmentQueue = async (req, res) => {
  try {
    const user = req.user;

    if (!user || user.role !== "caseworker") {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    const q = query(
      collection(db, "report"),
      where("assignment.entityId", "==", user.departmentId),
      where("assignment.individualId", "==", null)
    );

    const snapshot = await getDocs(q);

    const reports = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return res.json({
      success: true,
      reports
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch queue"
    });
  }
};



exports.claimReport = async (req, res) => {
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

    // 🔐 Check department match
    if (report.assignment.entityId !== user.departmentId) {
      return res.status(403).json({
        success: false,
        message: "Not your department"
      });
    }

    // 🔐 Prevent double claim
    if (report.assignment.individualId) {
      return res.status(400).json({
        success: false,
        message: "Already claimed"
      });
    }

    // ✅ CLAIM
    await updateDoc(reportRef, {
      "assignment.individualId": user.uid,
      status: "in_progress",
      claimedAt: new Date(),
      updatedAt: new Date(),

      actions: arrayUnion({
        type: "CLAIMED",
        by: user.uid,
        role: user.role,
        timestamp: new Date()
      })
    });

    return res.json({
      success: true,
      message: "Case claimed successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to claim report"
    });
  }
};

exports.getMyCases = async (req, res) => {
  try {
    const worker = req.user;

    const snapshot = await getDocs(collection(db, "report"));

    const reports = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(r =>
        r.assignment?.individualId === worker.uid // 🔥 CLAIMED BY ME
      );

    res.json({ reports });

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch cases" });
  }
};

exports.getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const uid = req.user.uid;

    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.json({
      success: true,
      user: snap.data()
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to get user"
    });
  }
};