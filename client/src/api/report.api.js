import API from "../services/api";
import { getAuth } from "firebase/auth";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider } from "firebase/auth";
const auth = getAuth();



API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // ✅ DEFINE TOKEN
  
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// =========================
// CREATE REPORT
// =========================
export const createReport = async (payload) => {
  const res = await API.post("/reports/create-report", payload);
  return res.data;
};

// =========================
// TRACK REPORT
// =========================
export const trackReport = async (caseId) => {
  const res = await API.get(`/reports/track/${caseId}`);
  return res.data.report;
};

// =========================
// ADMIN: GET REPORTS
// =========================
export const getAdminReports = async (params) => {
  const res = await API.get("/admin/reports", { params });
  console.log(res);
  
  return res.data;
};

// =========================
// ADMIN: GET STATS
// =========================
export const getDashboardStats = async () => {
  const res = await API.get("/admin/dashboard");
  return res.data.data;
};

// =========================
// ADMIN: UPDATE STATUS
// =========================
export const updateReportStatus = async (id, status) => {
  const res = await API.patch(`/admin/reports/${id}/status`, {
    status
  });

  return res.data;
};
export const updateReport = async (id, data) => {
  const res = await API.patch(`/admin/reports/${id}`, data);
  return res.data;
};


// =========================
// ADMIN: ADD ACTION
// =========================
export const addAction = async (id, message) => {
  const res = await API.patch(`/admin/reports/${id}/action`, {
    message
  });

  return res.data;
};

export const getSingleReport = async (id) => {
  const res = await API.get(`/admin/reports/${id}`);
  console.log(res);
  return res.data.data;
};

// 
export const deleteReport = async (id) => {
  const res = await API.delete(`/admin/reports/${id}`);
  return res.data;
};

export const getUserReports = async () => {
  const res = await API.get("/reports/view-reports");
  return res.data.data;
};

export const createDepartment = async (data) => {
  const res = await API.post("/admin/create-department", data);
  return res.data;
} 
export const getDepartment = async () => {
  const res = await API.get("/admin/departments");
  return res.data.data;
}
export const createWorker = async (data) => {
  const res = await API.post("/admin/create-worker", data);
  return res.data;
}

export const updatePasswordBackend = async (newPassword, currentPassword) => {
  const user = auth.currentUser;

  if (!user) throw new Error("No user logged in");

  // 🔐 STEP 1: re-authenticate (fixes your error)
  const credential = EmailAuthProvider.credential(
    user.email,
    currentPassword
  );

  await reauthenticateWithCredential(user, credential);

  // 🔥 STEP 2: update password
  await updatePassword(user, newPassword);
};

export const getQueueReports = async () => {
  const res = await API.get("/worker/queue");
  console.log(res);
  
  
  return res.data;
};

// ===============================
// 📌 GET MY CASES
// ===============================
export const getMyCases = async () => {
  const res = await API.get("/worker/my-cases");
  return res.data;
};

// ===============================
// 📌 CLAIM CASE
// ===============================
export const claimCase = async (reportId) => {
  const res = await API.post("/worker/claim", { reportId });
  return res.data;
};

// ===============================
// 💬 SEND MESSAGE
// ===============================
export const getMessages = async (caseId, pin = null) => {
  console.log(caseId);
  
  if (!caseId) throw new Error("caseId is required");

  const headers = {};

  // ✅ Only attach PIN if it exists (survivor flow)
  if (pin) {
    headers["x-case-pin"] = pin;
  }

  const res = await API.get(`/messages/${caseId}`, { headers });
  
  return res;
};




// SEND message (worker)
export const sendMessage = async (data, pin) => {
  
  const res = await API.post("/messages", data, {
    headers: {
      "x-case-pin": pin, // 🔥 REQUIRED
    },
  });

  return res.data;
};

export const getDepartments = async () => { 
  const res = await API.get("/admin/departments");
  return res.data.data;
}
export const trackCase = async ({ caseId, pin }) => {
  const res = await API.post("/reports/track", {
    caseId,
    pin,
  });
  
  return res.data;
};

export const resolveReport = async (reportId) => {
  const res = await API.post("/reports/resolve", {
    reportId,
  });

  return res.data;
};