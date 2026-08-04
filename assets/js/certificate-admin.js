import * as adminApi from "../../api/adminApi.js";

let colleges = [];
let certificates = [];
let certificateFilters = { search: "", college: "", course: "", year: "", status: "", issueDate: "" };
let certificatePage = 1;
let certificateLimit = 10;
let certificateTotal = 0;

function showAlert(message, type = "success") {
  const alert = document.getElementById("global-alert");
  if (!alert) return;
  alert.style.display = "flex";
  alert.className = `alert alert-${type}`;
  alert.innerHTML = `<i class="fa-solid ${type === "success" ? "fa-circle-check" : "fa-circle-exclamation"}"></i><span>${message}</span>`;
  setTimeout(() => {
    alert.style.display = "none";
  }, 5000);
}

function escapeHTML(str) {
  if (!str) return "";
  return String(str).replace(/[&<>"']/g, (tag) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[tag] || tag));
}

async function loadCollegeManagementTab() {
  await Promise.all([loadColleges(), loadCertificateMetaFilters()]);
}

async function loadCertificateManagementTab() {
  await Promise.all([loadColleges(), loadCertificates()]);
}

window.loadCollegeManagementTab = loadCollegeManagementTab;
window.loadCertificateManagementTab = loadCertificateManagementTab;

async function loadColleges() {
  try {
    const res = await adminApi.getColleges();
    if (res.success) {
      colleges = res.data || [];
      renderCollegeSelectOptions();
      renderColleges();
    }
  } catch (error) {
    console.error("Load colleges error", error);
  }
}

function renderCollegeSelectOptions() {
  const collegeFilter = document.getElementById("certificate-college-filter");
  const certificateCollegeInput = document.getElementById("certificate-college");
  if (!collegeFilter && !certificateCollegeInput) return;
  const options = ["<option value=\"\">All Colleges</option>"].concat(colleges.map((college) => `<option value="${escapeHTML(college.name)}">${escapeHTML(college.name)}</option>`));
  if (collegeFilter) collegeFilter.innerHTML = options.join("");
  if (certificateCollegeInput) {
    certificateCollegeInput.innerHTML = "";
    const select = document.createElement("select");
    select.id = "certificate-college";
    select.innerHTML = ["<option value=\"\">Select College</option>"].concat(colleges.map((college) => `<option value="${escapeHTML(college.name)}">${escapeHTML(college.name)}</option>`)).join("");
    certificateCollegeInput.replaceWith(select);
  }
}

function renderColleges() {
  const tbody = document.getElementById("colleges-tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  if (!colleges.length) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);">No colleges found.</td></tr>';
    return;
  }

  colleges.forEach((college) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${escapeHTML(college.name)}</strong></td>
      <td>${escapeHTML(college.code)}</td>
      <td>${escapeHTML(college.coordinatorName || "N/A")}</td>
      <td><span class="badge ${college.status === "Active" ? "badge-success" : "badge-warning"}">${escapeHTML(college.status || "Active")}</span></td>
      <td>${new Date(college.createdDate || college.createdAt).toLocaleDateString()}</td>
      <td>
        <div class="actions-cell">
          <button class="btn btn-secondary btn-sm edit-college-btn" data-id="${college._id}"><i class="fa-solid fa-edit"></i> Edit</button>
          <button class="btn btn-danger btn-sm delete-college-btn" data-id="${college._id}"><i class="fa-solid fa-trash"></i> Delete</button>
        </div>
      </td>`;
    tbody.appendChild(tr);
  });

  document.querySelectorAll(".edit-college-btn").forEach((btn) => {
    btn.addEventListener("click", () => openEditCollegeModal(btn.getAttribute("data-id")));
  });
  document.querySelectorAll(".delete-college-btn").forEach((btn) => {
    btn.addEventListener("click", () => deleteCollege(btn.getAttribute("data-id")));
  });
}

async function loadCertificates() {
  try {
    const res = await adminApi.getCertificates({
      page: certificatePage,
      limit: certificateLimit,
      search: certificateFilters.search,
      college: certificateFilters.college,
      course: certificateFilters.course,
      year: certificateFilters.year,
      status: certificateFilters.status,
      issueDate: certificateFilters.issueDate,
    });
    if (res.success) {
      certificates = res.data || [];
      certificateTotal = res.total || 0;
      renderCertificates();
      renderCertificatePagination();
    }
  } catch (error) {
    console.error("Load certificates error", error);
  }
}

function renderCertificates() {
  const tbody = document.getElementById("certificates-tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  if (!certificates.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);">No certificates found.</td></tr>';
    return;
  }

  certificates.forEach((certificate) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${escapeHTML(certificate.studentName)}</strong><div style="color: var(--text-muted); font-size: 12px; margin-top: 4px;">${escapeHTML(certificate.email)}</div></td>
      <td>${escapeHTML(certificate.college || "N/A")}</td>
      <td>${escapeHTML(certificate.courseName || "N/A")}</td>
      <td>${escapeHTML(certificate.certificateNumber || "N/A")}</td>
      <td><span class="badge ${certificate.status === "Issued" ? "badge-success" : certificate.status === "Pending" ? "badge-warning" : "badge-danger"}">${escapeHTML(certificate.status || "Issued")}</span></td>
      <td>${new Date(certificate.issuedDate || certificate.createdAt).toLocaleDateString()}</td>
      <td>
        <div class="actions-cell">
          <button class="btn btn-secondary btn-sm preview-certificate-btn" data-id="${certificate._id}"><i class="fa-solid fa-eye"></i> Preview</button>
          <button class="btn btn-secondary btn-sm edit-certificate-btn" data-id="${certificate._id}"><i class="fa-solid fa-edit"></i> Edit</button>
          <a class="btn btn-secondary btn-sm" href="${certificate.pdfUrl || "#"}" target="_blank" rel="noreferrer"><i class="fa-solid fa-download"></i> PDF</a>
          <button class="btn btn-danger btn-sm delete-certificate-btn" data-id="${certificate._id}"><i class="fa-solid fa-trash"></i> Delete</button>
        </div>
      </td>`;
    tbody.appendChild(tr);
  });

  document.querySelectorAll(".edit-certificate-btn").forEach((btn) => {
    btn.addEventListener("click", () => openEditCertificateModal(btn.getAttribute("data-id")));
  });
  document.querySelectorAll(".preview-certificate-btn").forEach((btn) => {
    btn.addEventListener("click", () => previewCertificate(btn.getAttribute("data-id")));
  });
  document.querySelectorAll(".delete-certificate-btn").forEach((btn) => {
    btn.addEventListener("click", () => deleteCertificate(btn.getAttribute("data-id")));
  });
}

function renderCertificatePagination() {
  const container = document.getElementById("certificate-pagination");
  if (!container) return;
  const totalPages = Math.max(1, Math.ceil(certificateTotal / certificateLimit));
  const buttons = [];
  for (let i = 1; i <= totalPages; i += 1) {
    buttons.push(`<button class="btn btn-sm ${certificatePage === i ? "btn-primary" : "btn-secondary"}" data-page="${i}">${i}</button>`);
  }
  container.innerHTML = buttons.join("");
  container.querySelectorAll("button[data-page]").forEach((button) => {
    button.addEventListener("click", () => {
      certificatePage = Number(button.getAttribute("data-page"));
      loadCertificates();
    });
  });
}

async function loadCertificateMetaFilters() {
  const courseFilter = document.getElementById("certificate-course-filter");
  if (courseFilter) {
    courseFilter.innerHTML = '<option value="">All Courses</option><option value="Python">Python</option><option value="Machine Learning">Machine Learning</option><option value="Web Development">Web Development</option><option value="AI">AI</option>';
  }
  await loadColleges();
}

async function createCollege(payload) {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => formData.append(key, value));
  const fileInput = document.getElementById("college-logo");
  if (fileInput && fileInput.files[0]) formData.append("logo", fileInput.files[0]);
  try {
    const res = await adminApi.createCollege(formData);
    if (res.success) {
      showAlert("College created successfully.", "success");
      closeCollegeModal();
      await loadColleges();
    } else {
      showAlert(res.message || "Failed to create college.", "error");
    }
  } catch (error) {
    showAlert("Unable to create college.", "error");
  }
}

async function updateCollege(id, payload) {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => formData.append(key, value));
  const fileInput = document.getElementById("college-logo");
  if (fileInput && fileInput.files[0]) formData.append("logo", fileInput.files[0]);
  try {
    const res = await adminApi.updateCollege(id, formData);
    if (res.success) {
      showAlert("College updated successfully.", "success");
      closeCollegeModal();
      await loadColleges();
    } else {
      showAlert(res.message || "Failed to update college.", "error");
    }
  } catch (error) {
    showAlert("Unable to update college.", "error");
  }
}

async function deleteCollege(id) {
  if (!confirm("Delete this college?")) return;
  try {
    const res = await adminApi.deleteCollege(id);
    if (res.success) {
      showAlert("College deleted successfully.", "success");
      await loadColleges();
    } else {
      showAlert(res.message || "Failed to delete college.", "error");
    }
  } catch (error) {
    showAlert("Unable to delete college.", "error");
  }
}

async function createCertificate(payload) {
  try {
    const res = await adminApi.createCertificate(payload);
    if (res.success) {
      showAlert("Student certificate added successfully.", "success");
      closeCertificateModal();
      await loadCertificates();
    } else {
      showAlert(res.message || "Failed to create certificate.", "error");
    }
  } catch (error) {
    showAlert("Unable to create certificate.", "error");
  }
}

async function updateCertificate(id, payload) {
  try {
    const res = await adminApi.updateCertificate(id, payload);
    if (res.success) {
      showAlert("Certificate updated successfully.", "success");
      closeCertificateModal();
      await loadCertificates();
    } else {
      showAlert(res.message || "Failed to update certificate.", "error");
    }
  } catch (error) {
    showAlert("Unable to update certificate.", "error");
  }
}

async function deleteCertificate(id) {
  if (!confirm("Delete this certificate record?")) return;
  try {
    const res = await adminApi.deleteCertificate(id);
    if (res.success) {
      showAlert("Certificate removed successfully.", "success");
      await loadCertificates();
    } else {
      showAlert(res.message || "Failed to delete certificate.", "error");
    }
  } catch (error) {
    showAlert("Unable to delete certificate.", "error");
  }
}

async function previewCertificate(id) {
  const certificate = certificates.find((item) => item._id === id);
  if (!certificate) return;
  const holder = document.getElementById("certificate-preview-frame-holder");
  if (!holder) return;
  holder.innerHTML = `<iframe src="${certificate.pdfUrl || "#"}" title="Certificate Preview" style="width:100%;height:560px;border:none;background:#fff"></iframe>`;
  document.getElementById("certificate-preview-title").textContent = `Certificate Preview - ${certificate.certificateNumber || "Preview"}`;
  document.getElementById("certificate-preview-modal").style.display = "flex";
  document.getElementById("certificate-print-btn").onclick = () => {
    window.open(certificate.pdfUrl, "_blank");
  };
}

async function exportCertificatesExcel() {
  try {
    const res = await adminApi.exportCertificates();
    if (res.success === false) {
      showAlert(res.message || "Export failed.", "error");
    }
  } catch (error) {
    showAlert("Unable to export certificates.", "error");
  }
}

async function downloadAllCertificatesZip() {
  try {
    const res = await adminApi.downloadAllCertificatesZip();
    if (res.success === false) {
      showAlert(res.message || "ZIP download failed.", "error");
    }
  } catch (error) {
    showAlert("Unable to download ZIP.", "error");
  }
}

window.openAddCollegeModal = function () {
  document.getElementById("college-form").reset();
  document.getElementById("college-id").value = "";
  document.getElementById("college-modal-title").textContent = "Add College";
  document.getElementById("college-modal").style.display = "flex";
};

window.closeCollegeModal = function () {
  document.getElementById("college-modal").style.display = "none";
};

window.openAddCertificateModal = function () {
  document.getElementById("certificate-form").reset();
  document.getElementById("certificate-id").value = "";
  document.getElementById("certificate-modal-title").textContent = "Add Student Certificate";
  document.getElementById("certificate-modal").style.display = "flex";
};

window.closeCertificateModal = function () {
  document.getElementById("certificate-modal").style.display = "none";
};

window.closeCertificatePreviewModal = function () {
  document.getElementById("certificate-preview-modal").style.display = "none";
};

window.exportCertificatesExcel = exportCertificatesExcel;
window.downloadAllCertificatesZip = downloadAllCertificatesZip;

function openEditCollegeModal(id) {
  const college = colleges.find((item) => item._id === id);
  if (!college) return;
  document.getElementById("college-id").value = college._id;
  document.getElementById("college-name").value = college.name || "";
  document.getElementById("college-code").value = college.code || "";
  document.getElementById("college-address").value = college.address || "";
  document.getElementById("college-coordinator-name").value = college.coordinatorName || "";
  document.getElementById("college-coordinator-email").value = college.coordinatorEmail || "";
  document.getElementById("college-phone").value = college.phone || "";
  document.getElementById("college-status").value = college.status || "Active";
  document.getElementById("college-created-date").value = college.createdDate ? new Date(college.createdDate).toISOString().split("T")[0] : "";
  document.getElementById("college-modal-title").textContent = "Edit College";
  document.getElementById("college-modal").style.display = "flex";
}

function openEditCertificateModal(id) {
  const certificate = certificates.find((item) => item._id === id);
  if (!certificate) return;
  document.getElementById("certificate-id").value = certificate._id;
  document.getElementById("certificate-student-name").value = certificate.studentName || "";
  document.getElementById("certificate-email").value = certificate.email || "";
  document.getElementById("certificate-phone").value = certificate.phone || "";
  document.getElementById("certificate-college").value = certificate.college || "";
  document.getElementById("certificate-course-name").value = certificate.courseName || "";
  document.getElementById("certificate-course-duration").value = certificate.courseDuration || "";
  document.getElementById("certificate-completion-date").value = certificate.completionDate ? new Date(certificate.completionDate).toISOString().split("T")[0] : "";
  document.getElementById("certificate-grade").value = certificate.grade || "";
  document.getElementById("certificate-status").value = certificate.status || "Issued";
  document.getElementById("certificate-issued-date").value = certificate.issuedDate ? new Date(certificate.issuedDate).toISOString().split("T")[0] : "";
  document.getElementById("certificate-remarks").value = certificate.remarks || "";
  document.getElementById("certificate-modal-title").textContent = "Edit Student Certificate";
  document.getElementById("certificate-modal").style.display = "flex";
}

document.getElementById("college-form")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const id = document.getElementById("college-id").value;
  const payload = {
    name: document.getElementById("college-name").value,
    code: document.getElementById("college-code").value,
    address: document.getElementById("college-address").value,
    coordinatorName: document.getElementById("college-coordinator-name").value,
    coordinatorEmail: document.getElementById("college-coordinator-email").value,
    phone: document.getElementById("college-phone").value,
    status: document.getElementById("college-status").value,
    createdDate: document.getElementById("college-created-date").value,
  };
  if (id) {
    await updateCollege(id, payload);
  } else {
    await createCollege(payload);
  }
});

document.getElementById("certificate-form")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const id = document.getElementById("certificate-id").value;
  const payload = {
    studentName: document.getElementById("certificate-student-name").value,
    email: document.getElementById("certificate-email").value,
    phone: document.getElementById("certificate-phone").value,
    college: document.getElementById("certificate-college").value,
    courseName: document.getElementById("certificate-course-name").value,
    courseDuration: document.getElementById("certificate-course-duration").value,
    completionDate: document.getElementById("certificate-completion-date").value,
    grade: document.getElementById("certificate-grade").value,
    status: document.getElementById("certificate-status").value,
    issuedDate: document.getElementById("certificate-issued-date").value,
    remarks: document.getElementById("certificate-remarks").value,
  };
  if (id) {
    await updateCertificate(id, payload);
  } else {
    await createCertificate(payload);
  }
});

document.getElementById("college-search")?.addEventListener("input", (event) => {
  const q = event.target.value.toLowerCase();
  const filtered = colleges.filter((college) => [college.name, college.code, college.coordinatorName, college.address].some((value) => String(value || "").toLowerCase().includes(q)));
  renderCollegeList(filtered);
});

function renderCollegeList(data) {
  const tbody = document.getElementById("colleges-tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  if (!data.length) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);">No colleges found.</td></tr>';
    return;
  }
  data.forEach((college) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${escapeHTML(college.name)}</strong></td>
      <td>${escapeHTML(college.code)}</td>
      <td>${escapeHTML(college.coordinatorName || "N/A")}</td>
      <td><span class="badge ${college.status === "Active" ? "badge-success" : "badge-warning"}">${escapeHTML(college.status || "Active")}</span></td>
      <td>${new Date(college.createdDate || college.createdAt).toLocaleDateString()}</td>
      <td>
        <div class="actions-cell">
          <button class="btn btn-secondary btn-sm edit-college-btn" data-id="${college._id}"><i class="fa-solid fa-edit"></i> Edit</button>
          <button class="btn btn-danger btn-sm delete-college-btn" data-id="${college._id}"><i class="fa-solid fa-trash"></i> Delete</button>
        </div>
      </td>`;
    tbody.appendChild(tr);
  });
}

document.getElementById("certificate-search")?.addEventListener("input", (event) => {
  certificateFilters.search = event.target.value;
  certificatePage = 1;
  loadCertificates();
});

document.getElementById("certificate-college-filter")?.addEventListener("change", (event) => {
  certificateFilters.college = event.target.value;
  certificatePage = 1;
  loadCertificates();
});
document.getElementById("certificate-course-filter")?.addEventListener("change", (event) => {
  certificateFilters.course = event.target.value;
  certificatePage = 1;
  loadCertificates();
});
document.getElementById("certificate-year-filter")?.addEventListener("change", (event) => {
  certificateFilters.year = event.target.value;
  certificatePage = 1;
  loadCertificates();
});
document.getElementById("certificate-status-filter")?.addEventListener("change", (event) => {
  certificateFilters.status = event.target.value;
  certificatePage = 1;
  loadCertificates();
});
document.getElementById("certificate-date-filter")?.addEventListener("change", (event) => {
  certificateFilters.issueDate = event.target.value;
  certificatePage = 1;
  loadCertificates();
});
document.getElementById("certificate-import-file")?.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const formData = new FormData();
  formData.append("file", file);
  try {
    const res = await adminApi.importCertificates(formData);
    if (res.success) {
      showAlert(res.message || "Import completed.", "success");
      await loadCertificates();
    } else {
      showAlert(res.message || "Import failed.", "error");
    }
  } catch (error) {
    showAlert("Import failed.", "error");
  }
});

window.addEventListener("DOMContentLoaded", () => {
  loadCollegeManagementTab();
  loadCertificateManagementTab();
});
