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
          <button class="btn btn-secondary btn-sm show-qr-certificate-btn" data-id="${certificate._id}" title="Show QR Code"><i class="fa-solid fa-qrcode"></i> QR</button>
          <button class="btn btn-secondary btn-sm preview-certificate-btn" data-id="${certificate._id}"><i class="fa-solid fa-eye"></i> Preview</button>
          <button class="btn btn-secondary btn-sm edit-certificate-btn" data-id="${certificate._id}"><i class="fa-solid fa-edit"></i> Edit</button>
          <button class="btn btn-secondary btn-sm download-certificate-btn" data-id="${certificate._id}"><i class="fa-solid fa-download"></i> PDF</button>
              
          <button class="btn btn-danger btn-sm delete-certificate-btn" data-id="${certificate._id}"><i class="fa-solid fa-trash"></i> Delete</button>
        </div>
      </td>`;
    tbody.appendChild(tr);
  });

  document.querySelectorAll(".show-qr-certificate-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const certificate = certificates.find((item) => item._id === btn.getAttribute("data-id"));
      if (!certificate) return;
      openCertificateQrModal(certificate);
    });
  });

  document.querySelectorAll(".edit-certificate-btn").forEach((btn) => {
    btn.addEventListener("click", () => openEditCertificateModal(btn.getAttribute("data-id")));
  });
  const previewBaseUrl = window.location.hostname === 'ikaisoft.com' || window.location.hostname === 'www.ikaisoft.com'
    ? 'https://ikaisoft.com'
    : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:5000'
      : window.location.origin;

  document.querySelectorAll(".preview-certificate-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const certificate = certificates.find((item) => item._id === btn.getAttribute("data-id"));
      if (!certificate) return;
      window.open(`${previewBaseUrl}/certificate.html?id=${encodeURIComponent(certificate.certificateNumber)}`, "_blank");
    });
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
  const backendBase = (window.location.hostname === 'ikaisoft.com' || window.location.hostname === 'www.ikaisoft.com')
    ? 'https://ikaisoft-website-backend.onrender.com'
    : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.port !== '')
      ? 'http://localhost:5000'
      : window.location.origin;
  const verifyUrl = 'https://ikaisoft.com/certificate';
  const qrSrc = `${backendBase}/api/certificate/qr`;
  const fallbackQr = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(verifyUrl)}`;
  const qrImage = `<div style="text-align:center;">
    <img 
      src="${qrSrc}" 
      onerror="this.onerror=null;this.src='${fallbackQr}';" 
      alt="QR Code" 
      style="width:130px;height:130px;object-fit:contain;border-radius:14px;box-shadow:0 8px 18px rgba(0,0,0,0.1);background:white;padding:4px;"
    />
    <div style="font-size:11px;color:#144a21;font-weight:600;margin-top:6px;">Scan to verify at /certificate</div>
  </div>`;

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
    await adminApi.exportCertificates();
  } catch (error) {
    showAlert(error.message || "Unable to export certificates.", "error");
  }
}

async function exportCertificatesPdf() {
  try {
    await adminApi.exportCertificatesPdf();
  } catch (error) {
    showAlert(error.message || "Unable to export certificates PDF.", "error");
  }
}

async function downloadAllCertificatesZip() {
  try {
    await adminApi.downloadAllCertificatesZip();
  } catch (error) {
    showAlert(error.message || "Unable to download ZIP.", "error");
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

// ==========================================
// QR CODE DISPLAY & SCANNING / VERIFICATION
// ==========================================

function extractCertificateId(input) {
  if (!input) return "";
  const str = String(input).trim();
  try {
    const url = new URL(str, window.location.origin);
    const idParam = url.searchParams.get("id") || url.searchParams.get("certificateNumber");
    if (idParam) return idParam.trim();
    if (url.pathname.endsWith("/certificate") || url.pathname.endsWith("/certificate.html")) {
      return "GENERIC_QR";
    }
  } catch (e) {}
  const match = str.match(/(?:id=|\/verify\/|\/certificate\/)([A-Za-z0-9\-_]+)/i);
  if (match) return match[1];
  return str;
}

window.openCertificateQrModal = function (cert) {
  const modal = document.getElementById("certificate-qr-display-modal");
  if (!modal) return;
  document.getElementById("qr-display-student-name").textContent = cert.studentName || "Student Certificate";
  document.getElementById("qr-display-cert-number").textContent = `Certificate No: ${cert.certificateNumber || "N/A"}`;

  const backendBase = (window.location.hostname === "ikaisoft.com" || window.location.hostname === "www.ikaisoft.com")
    ? "https://ikaisoft-website-backend.onrender.com"
    : (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.port !== "")
      ? "http://localhost:5000"
      : window.location.origin;

  const verifyUrl = "https://ikaisoft.com/certificate";
  const qrImg = `${backendBase}/api/certificate/qr`;
  const fallbackQr = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(verifyUrl)}`;

  const imgEl = document.getElementById("qr-display-image");
  if (imgEl) {
    imgEl.onerror = () => { imgEl.src = fallbackQr; };
    imgEl.src = qrImg;
  }
  document.getElementById("qr-display-open-link-btn").onclick = () => {
    window.open(verifyUrl, "_blank");
  };

  modal.style.display = "flex";
};

window.closeCertificateQrModal = function () {
  const modal = document.getElementById("certificate-qr-display-modal");
  if (modal) modal.style.display = "none";
};

let qrCameraStream = null;
let qrScanAnimId = null;
let detectedCertId = "";

window.openScanQrModal = function () {
  const modal = document.getElementById("scan-qr-modal");
  if (!modal) return;
  resetScanModalState();
  modal.style.display = "flex";
  switchScanTab("camera");
};

window.closeScanQrModal = function () {
  stopQrCamera();
  const modal = document.getElementById("scan-qr-modal");
  if (modal) modal.style.display = "none";
};

function resetScanModalState() {
  stopQrCamera();
  detectedCertId = "";
  const card = document.getElementById("qr-verified-card");
  const badge = document.getElementById("qr-detected-cert-badge");
  const errBox = document.getElementById("qr-verify-error");
  const emailInput = document.getElementById("qr-verify-email-input");
  const manualInput = document.getElementById("qr-manual-input");

  if (card) card.style.display = "none";
  if (badge) badge.textContent = "";
  if (errBox) errBox.style.display = "none";
  if (emailInput) emailInput.value = "";
  if (manualInput) manualInput.value = "";
}

function switchScanTab(tabName) {
  document.querySelectorAll(".qr-scan-tab-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-tab") === tabName);
  });

  const camTab = document.getElementById("qr-camera-tab-content");
  const uploadTab = document.getElementById("qr-upload-tab-content");
  const manualTab = document.getElementById("qr-manual-tab-content");

  if (camTab) camTab.style.display = tabName === "camera" ? "block" : "none";
  if (uploadTab) uploadTab.style.display = tabName === "upload" ? "block" : "none";
  if (manualTab) manualTab.style.display = tabName === "manual" ? "block" : "none";

  if (tabName === "camera") {
    startQrCamera();
  } else {
    stopQrCamera();
  }
}

async function startQrCamera() {
  const video = document.getElementById("qr-video");
  const overlay = document.getElementById("qr-scanning-overlay");
  const placeholder = document.getElementById("qr-camera-placeholder");
  const status = document.getElementById("qr-camera-status");
  const stopBtn = document.getElementById("qr-stop-camera-btn");

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    if (status) status.textContent = "Camera not supported on this browser. Try uploading an image.";
    return;
  }

  try {
    if (status) status.textContent = "Starting camera...";
    qrCameraStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
    });
    if (video) {
      video.srcObject = qrCameraStream;
      video.setAttribute("playsinline", "true");
      await video.play();
      video.style.display = "block";
    }
    if (overlay) overlay.style.display = "block";
    if (placeholder) placeholder.style.display = "none";
    if (stopBtn) stopBtn.style.display = "inline-flex";
    if (status) status.textContent = "Scanning for certificate QR code...";

    scanQrVideoLoop();
  } catch (err) {
    if (status) status.textContent = "Camera error: " + (err.message || "Permission denied");
    if (placeholder) placeholder.style.display = "block";
    if (video) video.style.display = "none";
    if (overlay) overlay.style.display = "none";
    if (stopBtn) stopBtn.style.display = "none";
  }
}

function stopQrCamera() {
  if (qrScanAnimId) {
    cancelAnimationFrame(qrScanAnimId);
    qrScanAnimId = null;
  }
  if (qrCameraStream) {
    qrCameraStream.getTracks().forEach((t) => t.stop());
    qrCameraStream = null;
  }
  const video = document.getElementById("qr-video");
  const overlay = document.getElementById("qr-scanning-overlay");
  const placeholder = document.getElementById("qr-camera-placeholder");
  const status = document.getElementById("qr-camera-status");
  const stopBtn = document.getElementById("qr-stop-camera-btn");

  if (video) video.style.display = "none";
  if (overlay) overlay.style.display = "none";
  if (placeholder) placeholder.style.display = "block";
  if (stopBtn) stopBtn.style.display = "none";
  if (status) status.textContent = "Camera stopped";
}

function scanQrVideoLoop() {
  const video = document.getElementById("qr-video");
  const canvas = document.getElementById("qr-canvas");
  if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
    qrScanAnimId = requestAnimationFrame(scanQrVideoLoop);
    return;
  }

  const ctx = canvas.getContext("2d");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  if (window.jsQR) {
    const code = window.jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    });
    if (code && code.data) {
      handleQrDetected(code.data);
      return;
    }
  }

  qrScanAnimId = requestAnimationFrame(scanQrVideoLoop);
}

function handleQrDetected(rawData) {
  stopQrCamera();
  const certId = extractCertificateId(rawData);
  if (!certId) {
    showAlert("Could not recognize Certificate ID from QR.", "error");
    return;
  }

  if (certId === "GENERIC_QR") {
    switchScanTab("manual");
    showAlert("Scanned generic certificate QR code. Enter the student Certificate ID and email to verify.", "success");
    return;
  }

  detectedCertId = certId;
  const card = document.getElementById("qr-verified-card");
  const badge = document.getElementById("qr-detected-cert-badge");
  const errBox = document.getElementById("qr-verify-error");
  const emailInput = document.getElementById("qr-verify-email-input");

  if (badge) badge.textContent = certId;
  if (errBox) errBox.style.display = "none";
  if (card) card.style.display = "block";
  if (emailInput) {
    emailInput.value = "";
    emailInput.focus();
  }
}

function scanQrFromImageFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.onload = function () {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      if (window.jsQR) {
        const code = window.jsQR(imageData.data, imageData.width, imageData.height);
        if (code && code.data) {
          handleQrDetected(code.data);
          return;
        }
      }
      showAlert("No readable QR code found in this image. Try another image or manual input.", "error");
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

async function verifyDetectedCertificateWithEmail() {
  const emailInput = document.getElementById("qr-verify-email-input");
  const email = emailInput?.value.trim();
  const errorBox = document.getElementById("qr-verify-error");
  const errorText = document.getElementById("qr-verify-error-text");
  const btn = document.getElementById("qr-verify-email-btn");

  if (!detectedCertId) {
    showAlert("No certificate ID detected.", "error");
    return;
  }
  if (!email) {
    if (errorBox && errorText) {
      errorText.textContent = "Please enter student registered email.";
      errorBox.style.display = "block";
    }
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Verifying...`;
  }

  try {
    const res = await adminApi.verifyCertificateAccess(detectedCertId, email);
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<i class="fa-solid fa-key"></i> Verify Email & View Certificate`;
    }

    if (!res.success) {
      if (errorBox && errorText) {
        errorText.textContent = res.message || "Email address does not match this certificate record.";
        errorBox.style.display = "block";
      }
      return;
    }

    closeScanQrModal();
    showAlert(`Verified successfully! Showing certificate for ${res.data.studentName}.`, "success");
    previewVerifiedCertificates(res.data, res.certificates);
  } catch (err) {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<i class="fa-solid fa-key"></i> Verify Email & View Certificate`;
    }
    if (errorBox && errorText) {
      errorText.textContent = "Network error verifying certificate.";
      errorBox.style.display = "block";
    }
  }
}

function previewVerifiedCertificates(currentCert, allCertificates = []) {
  const holder = document.getElementById("certificate-preview-frame-holder");
  if (!holder) return;

  const certList = allCertificates && allCertificates.length > 0 ? allCertificates : [currentCert];
  let activeIndex = certList.findIndex(
    (c) => String(c.certificateNumber).toLowerCase() === String(currentCert.certificateNumber).toLowerCase()
  );
  if (activeIndex < 0) activeIndex = 0;

  function render(index) {
    const cert = certList[index];
    let tabsHtml = "";
    if (certList.length > 1) {
      tabsHtml = `
        <div style="background:#eaf5ec; border:1px solid #c8e6cb; border-radius:12px; padding:12px 18px; margin-bottom:16px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px;">
          <div style="font-size:13px; font-weight:700; color:#144a21;">
            <i class="fa-solid fa-user-graduate"></i> Verified Certificates for ${escapeHTML(cert.studentName)} (${certList.length}):
          </div>
          <div style="display:flex; gap:6px; flex-wrap:wrap;">
            ${certList.map((c, i) => `
              <button type="button" class="btn btn-sm ${i === index ? "btn-primary" : "btn-secondary"} switch-cert-tab" data-idx="${i}" style="font-size:12px;">
                ${escapeHTML(c.courseName || "Course")} (${escapeHTML(c.certificateNumber)})
              </button>
            `).join("")}
          </div>
        </div>
      `;
    }

    holder.innerHTML = tabsHtml + renderCertificatePreviewHtml(cert);
    document.getElementById("certificate-preview-title").textContent = `Verified Certificate - ${cert.certificateNumber} (${cert.studentName})`;

    holder.querySelectorAll(".switch-cert-tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        render(Number(btn.getAttribute("data-idx")));
      });
    });

    document.getElementById("certificate-print-btn").onclick = async () => {
      try {
        const blob = await adminApi.downloadCertificatePdf(cert._id);
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      } catch (err) {
        showAlert(err.message || "Failed to open PDF.", "error");
      }
    };
  }

  render(activeIndex);
  document.getElementById("certificate-preview-modal").style.display = "flex";
}

window.exportCertificatesExcel = exportCertificatesExcel;
window.exportCertificatesPdf = exportCertificatesPdf;
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
  showAlert("Reading Excel sheet & generating certificates, please wait...", "info");
  try {
    const res = await adminApi.importCertificates(formData);
    if (res.success) {
      showAlert(res.message || "Import completed successfully.", "success");
      await loadCertificates();
    } else {
      showAlert(res.message || "Import failed. Please check the Excel format.", "error");
    }
  } catch (error) {
    showAlert(error.message || "Import failed. Please ensure the file contains Name and Email.", "error");
  } finally {
    event.target.value = "";
  }
});

// Attach QR scanning modal listeners
document.getElementById("scan-qr-verify-admin-btn")?.addEventListener("click", () => {
  window.openScanQrModal?.();
});

document.querySelectorAll(".qr-scan-tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    switchScanTab(btn.getAttribute("data-tab"));
  });
});

document.getElementById("qr-start-camera-btn")?.addEventListener("click", () => {
  startQrCamera();
});

document.getElementById("qr-stop-camera-btn")?.addEventListener("click", () => {
  stopQrCamera();
});

const qrDropzone = document.getElementById("qr-dropzone");
const qrFileInput = document.getElementById("qr-file-input");

qrDropzone?.addEventListener("click", () => {
  qrFileInput?.click();
});

qrDropzone?.addEventListener("dragover", (e) => {
  e.preventDefault();
  qrDropzone.style.borderColor = "var(--color-primary)";
  qrDropzone.style.background = "rgba(34, 153, 32, 0.1)";
});

qrDropzone?.addEventListener("dragleave", () => {
  qrDropzone.style.borderColor = "var(--border-color)";
  qrDropzone.style.background = "rgba(15, 23, 42, 0.4)";
});

qrDropzone?.addEventListener("drop", (e) => {
  e.preventDefault();
  qrDropzone.style.borderColor = "var(--border-color)";
  qrDropzone.style.background = "rgba(15, 23, 42, 0.4)";
  const file = e.dataTransfer?.files?.[0];
  if (file) scanQrFromImageFile(file);
});

qrFileInput?.addEventListener("change", (e) => {
  const file = e.target.files?.[0];
  if (file) scanQrFromImageFile(file);
});

document.getElementById("qr-apply-manual-btn")?.addEventListener("click", () => {
  const input = document.getElementById("qr-manual-input")?.value;
  if (!input) {
    showAlert("Please enter a Certificate ID or link.", "error");
    return;
  }
  handleQrDetected(input);
});

document.getElementById("qr-manual-input")?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    document.getElementById("qr-apply-manual-btn")?.click();
  }
});

document.getElementById("qr-verify-email-btn")?.addEventListener("click", () => {
  verifyDetectedCertificateWithEmail();
});

document.getElementById("qr-verify-email-input")?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    verifyDetectedCertificateWithEmail();
  }
});

window.addEventListener("DOMContentLoaded", () => {
  loadCollegeManagementTab();
  loadCertificateManagementTab();
});

