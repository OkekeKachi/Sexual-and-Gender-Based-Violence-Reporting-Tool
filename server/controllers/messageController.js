const { db } = require("../models/firebase");
const {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} = require("firebase/firestore");


// ==============================
// SEND MESSAGE (worker/admin)
// ==============================



exports.sendMessage = async (req, res) => {
  try {
    const { caseId, message } = req.body;

    if (!caseId || !message) {
      return res.status(400).json({ error: "caseId and message required" });
    }

    // 🔥 find report first
    const q = query(
      collection(db, "report"),
      where("caseId", "==", caseId)
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      return res.status(404).json({ error: "Case not found" });
    }

    const reportDoc = snap.docs[0];

    // 🔥 subcollection reference
    const msgRef = doc(collection(db, "report", reportDoc.id, "messages"));

    const newMessage = {
      id: msgRef.id,
      message,
      createdAt: serverTimestamp(),
    };

    // 🔐 ROLE LOGIC
    if (req.accessType === "worker") {
      newMessage.senderRole = req.user.role;
      newMessage.senderId = req.user.uid;
    } else if (req.accessType === "survivor") {
      newMessage.senderRole = "survivor";
      newMessage.senderId = null;
    } else {
      return res.status(400).json({ error: "Invalid sender" });
    }

    await setDoc(msgRef, newMessage);

    return res.status(201).json({
      success: true,
      message: newMessage,
    });

  } catch (err) {
    console.error(err)
      ;
    return res.status(500).json({ error: "Failed to send message" });
  }
};

// ==============================
// GET CASE MESSAGES
// ==============================
exports.getCaseMessages = async (req, res) => {
  try {
    const caseId = req.params.caseId;

    const q = query(
      collection(db, "report"),
      where("caseId", "==", caseId),
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      return res.status(404).json({ error: "Case not found" });
    }

    const reportDoc = snap.docs[0];

    const msgQuery = query(
      collection(db, "report", reportDoc.id, "messages"),
      orderBy("createdAt", "asc") // 🔥 THIS FIXES ORDER
    );

    const msgSnap = await getDocs(msgQuery);
    const messages = msgSnap.docs.map(doc => doc.data());

    return res.json({
      success: true,
      messages
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch messages" });
  }
};



// ==============================
// SURVIVOR MESSAGE
// ==============================
exports.survivorMessage = async (req, res) => {
  try {
    const { caseId, pin, message } = req.body;

    if (!caseId || !pin || !message) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // ✅ get report
    const reportRef = doc(db, "reports", caseId);
    const reportSnap = await getDoc(reportRef);

    if (!reportSnap.exists()) {
      return res.status(404).json({ error: "Case not found" });
    }

    const reportData = reportSnap.data();

    if (reportData.pin !== pin) {
      return res.status(403).json({ error: "Invalid PIN" });
    }

    // ✅ create message
    const msgRef = doc(collection(db, "messages"));

    const newMessage = {
      id: msgRef.id,
      caseId,
      senderRole: "survivor",
      senderId: null,
      message,
      createdAt: serverTimestamp(),
    };

    await setDoc(msgRef, newMessage);

    return res.status(201).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to send message" });
  }
};

exports.verifyCaseAccess = async (req, res) => {
  try {
    const { caseId, pin } = req.body;

    const snap = await db
      .collection("reports")
      .where("caseId", "==", caseId)
      .limit(1)
      .get();

    if (snap.empty) {
      return res.status(404).json({ error: "Case not found" });
    }

    const report = snap.docs[0].data();

    if (report.pin !== pin) {
      return res.status(403).json({ error: "Invalid PIN" });
    }

    return res.json({
      success: true,
      report,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Access check failed" });
  }
};