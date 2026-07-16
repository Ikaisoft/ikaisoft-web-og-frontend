const BASE_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.port !== ""
  ? "http://localhost:5000/api"
  : "https://ikaisoft-website-backend.onrender.com/api";

// Helper for authenticated fetch requests
async function authFetch(url, options = {}) {
  const token = localStorage.getItem("adminToken");
  
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Token expired or invalid, clear and redirect to login
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    if (!window.location.pathname.endsWith("index.html") && window.location.pathname !== "/" && !window.location.pathname.endsWith("contact.html")) {
      window.location.href = "index.html";
    }
  }

  return response;
}

// Auth API
export async function loginAdmin(email, password) {
  const res = await fetch(`${BASE_URL}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return await res.json();
}

export async function resetPassword(oldPassword, newPassword) {
  const res = await authFetch(`${BASE_URL}/admin/reset-password`, {
    method: "POST",
    body: JSON.stringify({ oldPassword, newPassword }),
  });
  return await res.json();
}

// Stats & Submissions API
export async function getDashboardStats() {
  const res = await authFetch(`${BASE_URL}/admin/stats`);
  return await res.json();
}

export async function getContacts() {
  const res = await authFetch(`${BASE_URL}/admin/contacts`);
  return await res.json();
}

export async function getEnrollments() {
  const res = await authFetch(`${BASE_URL}/admin/enrollments`);
  return await res.json();
}

export async function getRegistrations() {
  const res = await authFetch(`${BASE_URL}/admin/registrations`);
  return await res.json();
}

// Jobs API
export async function getAllJobs() {
  const res = await fetch(`${BASE_URL}/jobs`);
  return await res.json();
}

export async function getAllJobsAdmin() {
  const res = await authFetch(`${BASE_URL}/jobs/admin`);
  return await res.json();
}

export async function createJob(jobData) {
  const res = await authFetch(`${BASE_URL}/jobs`, {
    method: "POST",
    body: JSON.stringify(jobData),
  });
  return await res.json();
}

export async function updateJob(id, jobData) {
  const res = await authFetch(`${BASE_URL}/jobs/${id}`, {
    method: "PUT",
    body: JSON.stringify(jobData),
  });
  return await res.json();
}

export async function toggleJobStatus(id) {
  const res = await authFetch(`${BASE_URL}/jobs/${id}/toggle`, {
    method: "PATCH",
  });
  return await res.json();
}

export async function deleteJob(id) {
  const res = await authFetch(`${BASE_URL}/jobs/${id}`, {
    method: "DELETE",
  });
  return await res.json();
}

export async function submitJobApplication(applicationData) {
  const res = await fetch(`${BASE_URL}/jobs/apply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(applicationData),
  });
  return await res.json();
}

export async function getJobApplications(id) {
  const res = await authFetch(`${BASE_URL}/jobs/${id}/applications`);
  return await res.json();
}

// Courses API
export async function getAllCourses() {
  const res = await fetch(`${BASE_URL}/courses`);
  return await res.json();
}

export async function getAllCoursesAdmin() {
  const res = await authFetch(`${BASE_URL}/courses/admin`);
  return await res.json();
}

export async function createCourse(courseData) {
  const res = await authFetch(`${BASE_URL}/courses`, {
    method: "POST",
    body: JSON.stringify(courseData),
  });
  return await res.json();
}

export async function updateCourse(id, courseData) {
  const res = await authFetch(`${BASE_URL}/courses/${id}`, {
    method: "PUT",
    body: JSON.stringify(courseData),
  });
  return await res.json();
}

export async function toggleCourseStatus(id) {
  const res = await authFetch(`${BASE_URL}/courses/${id}/toggle`, {
    method: "PATCH",
  });
  return await res.json();
}

export async function deleteCourse(id) {
  const res = await authFetch(`${BASE_URL}/courses/${id}`, {
    method: "DELETE",
  });
  return await res.json();
}
