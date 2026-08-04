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
          <button class="btn btn-secondary btn-sm download-certificate-btn" data-id="${certificate._id}"><i class="fa-solid fa-download"></i> PDF</button>
              <button class="btn btn-warning btn-sm regenerate-certificate-btn" data-id="${certificate._id}"><i class="fa-solid fa-sync"></i> Regenerate</button>
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
  // Download PDF (authenticated) handler
  document.querySelectorAll(".download-certificate-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      try {
        const blob = await adminApi.downloadCertificatePdf(id);
        const cert = certificates.find((c) => c._id === id) || {};
        const filename = `${cert.certificateNumber || id}.pdf`;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } catch (err) {
        showAlert(err.message || "Failed to download PDF.", "error");
      }
    });
  });

  // Regenerate PDF + QR handler
  document.querySelectorAll(".regenerate-certificate-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      if (!confirm("Regenerate certificate PDF and QR for this student?")) return;
      try {
        const res = await adminApi.regenerateCertificate(id);
        if (res && res.success) {
          showAlert("Certificate regenerated successfully.", "success");
          await loadCertificates();
        } else {
          showAlert((res && res.message) || "Failed to regenerate.", "error");
        }
      } catch (err) {
        showAlert(err.message || "Failed to regenerate.", "error");
      }
    });
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

function formatCertificateDate(value) {
  const date = value ? new Date(value) : new Date();
  return date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

function renderCertificatePreviewHtml(certificate) {
  const studentName = escapeHTML(certificate.studentName || "Student Name");
  const courseName = escapeHTML(certificate.courseName || "Course Name");
  const collegeName = escapeHTML(certificate.college || "College Name");
  const certificateNumber = escapeHTML(certificate.certificateNumber || "CERT-0000");
  const issuedDate = formatCertificateDate(certificate.issuedDate || certificate.completionDate || certificate.createdAt);
  const verifyUrl = escapeHTML(`${window.location.origin}/verify/${certificate.certificateNumber}`);
  const qrSrc = certificate.qrCodeUrl
    ? certificate.qrCodeUrl
    : `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(verifyUrl)}`;
  const qrImage = `<img src="${qrSrc}" alt="QR Code" style="width:140px;height:140px;object-fit:contain;border-radius:16px;box-shadow:0 10px 20px rgba(0,0,0,0.12);"/>`;

  return `
    <div style="width:100%;min-height:560px;background:#f6fbf7;padding:28px;display:flex;justify-content:center;align-items:center;">
      <div style="width:100%;max-width:900px;background:white;border:12px solid #144a21;border-radius:24px;box-shadow:0 30px 70px rgba(0,0,0,0.12);overflow:hidden;font-family:'Poppins',sans-serif;color:#0f2a18;">
        <div style="padding:32px 40px 24px;border-bottom:8px solid #144a21;background:linear-gradient(180deg,rgba(13,60,29,0.95),rgba(20,74,33,0.96));color:white;position:relative;">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:16px;">
            <div>
              <div style="font-size:20px;font-weight:700;letter-spacing:1px;text-transform:uppercase;opacity:0.85;">IKAISOFT</div>
              <div style="font-size:12px;letter-spacing:0.35em;opacity:0.75;margin-top:6px;">CONSULTANCY SERVICES</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:32px;font-weight:800;letter-spacing:0.18em;">CERTIFICATE</div>
              <div style="font-size:16px;opacity:0.9;margin-top:8px;">OF COMPLETION</div>
            </div>
          </div>
        </div>

        <div style="padding:40px 44px 32px;">
          <p style="margin:0;font-size:16px;opacity:0.75;">This is to certify that</p>
          <h1 style="margin:18px 0 14px;font-size:46px;font-weight:700;line-height:1.05;color:#144a21;letter-spacing:0.02em;">${studentName}</h1>
          <p style="margin:0;font-size:18px;opacity:0.8;">has successfully completed the</p>
          <div style="margin:22px 0 30px;padding:28px;background:#eef7ea;border-left:6px solid #1b4f23;border-radius:18px;">
            <p style="margin:0;font-size:18px;opacity:0.85;">${courseName}</p>
            <p style="margin:8px 0 0;font-size:14px;opacity:0.65;">conducted by <strong>${collegeName}</strong></p>
          </div>

          <div style="display:flex;justify-content:space-between;gap:24px;flex-wrap:wrap;">
            <div style="flex:1;min-width:220px;">
              <p style="margin:0;font-size:14px;opacity:0.75;text-transform:uppercase;letter-spacing:0.12em;">Date of Completion</p>
              <p style="margin:8px 0 0;font-size:18px;font-weight:600;color:#144a21;">${issuedDate}</p>
            </div>
            <div style="flex:1;min-width:220px;">
              <p style="margin:0;font-size:14px;opacity:0.75;text-transform:uppercase;letter-spacing:0.12em;">Certificate ID</p>
              <p style="margin:8px 0 0;font-size:18px;font-weight:600;color:#144a21;">${certificateNumber}</p>
            </div>
            <div style="min-width:170px;text-align:center;">${qrImage}</div>
          </div>
        </div>

        <div style="padding:0 40px 42px;border-top:1px solid rgba(20,74,33,0.08);display:flex;justify-content:space-between;flex-wrap:wrap;gap:18px;">
          <div style="flex:1;min-width:240px;">
            <div style="margin-bottom:16px;font-size:14px;opacity:0.75;text-transform:uppercase;letter-spacing:0.12em;">Verified Student</div>
            <div style="font-size:16px;line-height:1.5;opacity:0.85;">${studentName} successfully completed the ${courseName} course under ${collegeName} and is eligible for certification.</div>
          </div>
          <div style="flex:1;min-width:240px;text-align:right;">
            <div style="font-size:14px;opacity:0.75;text-transform:uppercase;letter-spacing:0.12em;">Authorized Signature</div>
            <div style="margin-top:20px;font-size:22px;font-family:'Dancing Script',cursive;color:#0f2a18;">Ikaisoft</div>
          </div>
        </div>

        <div style="background:#ecf7ee;border-top:1px solid #d7ecd2;padding:18px 40px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;">
          <div style="font-size:13px;opacity:0.75;line-height:1.5;">Scan the QR code to verify this certificate or visit <strong>${verifyUrl}</strong></div>
          <div style="font-size:12px;opacity:0.65;">Powered by Ikaisoft Consultancy Services</div>
        </div>
      </div>
    </div>
  `;
}

async function previewCertificate(id) {
  const certificate = certificates.find((item) => item._id === id);
  if (!certificate) return;
  const holder = document.getElementById("certificate-preview-frame-holder");
  if (!holder) return;
  holder.innerHTML = renderCertificatePreviewHtml(certificate);
  document.getElementById("certificate-preview-title").textContent = `Certificate Preview - ${certificate.certificateNumber || "Preview"}`;
  document.getElementById("certificate-preview-modal").style.display = "flex";
  document.getElementById("certificate-print-btn").onclick = async () => {
    try {
      const blob = await adminApi.downloadCertificatePdf(certificate._id);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) {
      showAlert(err.message || "Failed to open PDF.", "error");
    }
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
