(function() {
  const BASE_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.port !== ""
    ? "http://localhost:5000/api"
    : "https://ikaisoft-website-backend.onrender.com/api";

  // Check if styles already loaded, if not add them
  if (!document.getElementById("admin-modal-styles")) {
    const style = document.createElement("style");
    style.id = "admin-modal-styles";
    style.innerHTML = `
      #admin-login-link:hover {
        color: #229920 !important;
        text-decoration: underline !important;
      }
      #admin-login-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(15, 23, 42, 0.75);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999999;
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
      }
      #admin-login-modal.open {
        opacity: 1;
        pointer-events: auto;
      }
      .admin-login-box {
        background: #1e293b;
        border: 1px solid #334155;
        border-radius: 16px;
        padding: 32px;
        width: 90%;
        max-width: 400px;
        box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.5), 0 8px 10px -6px rgb(0 0 0 / 0.5);
        transform: scale(0.9);
        transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        color: #f8fafc;
        font-family: 'Inter', sans-serif;
      }
      #admin-login-modal.open .admin-login-box {
        transform: scale(1);
      }
      .admin-login-box h3 {
        margin-top: 0;
        margin-bottom: 24px;
        font-family: 'Poppins', sans-serif;
        font-weight: 600;
        font-size: 22px;
        color: #f8fafc;
        text-align: center;
      }
      .admin-form-group {
        margin-bottom: 20px;
        text-align: left;
      }
      .admin-form-group label {
        display: block;
        font-size: 13px;
        color: #94a3b8;
        margin-bottom: 8px;
        font-weight: 500;
      }
      .admin-form-group input {
        width: 100%;
        background: #0f172a;
        border: 1px solid #334155;
        border-radius: 8px;
        padding: 12px 14px;
        color: #f8fafc;
        outline: none;
        font-size: 14px;
        box-sizing: border-box;
        transition: border-color 0.2s ease;
      }
      .admin-form-group input:focus {
        border-color: #229920;
      }
      .admin-login-btn {
        width: 100%;
        background: #229920;
        color: white;
        border: none;
        border-radius: 8px;
        padding: 12px;
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        transition: background 0.2s ease;
        margin-top: 8px;
      }
      .admin-login-btn:hover {
        background: #1b801a;
      }
      .admin-close-btn {
        background: transparent;
        border: none;
        color: #94a3b8;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        display: block;
        margin: 16px auto 0 auto;
        text-align: center;
      }
      .admin-close-btn:hover {
        color: #f8fafc;
      }
      .admin-error-msg {
        color: #ef4444;
        font-size: 13px;
        margin-top: 12px;
        text-align: center;
        display: none;
      }
    `;
    document.head.appendChild(style);
  }

  // Inject modal markup on DOMContentLoaded
  function injectModalMarkup() {
    if (document.getElementById("admin-login-modal")) return;

    const modalDiv = document.createElement("div");
    modalDiv.id = "admin-login-modal";
    modalDiv.innerHTML = `
      <div class="admin-login-box">
        <h3>Admin Login Portal</h3>
        <form id="admin-login-form">
          <div class="admin-form-group">
            <label for="admin-email">Email Address</label>
            <input type="email" id="admin-email" placeholder="admin@ikaisoft.com" required>
          </div>
          <div class="admin-form-group">
            <label for="admin-password">Password</label>
            <input type="password" id="admin-password" placeholder="••••••••" required>
          </div>
          <button type="submit" class="admin-login-btn">Log In</button>
          <div class="admin-error-msg" id="admin-login-error">Invalid credentials. Please try again.</div>
          <button type="button" class="admin-close-btn" id="admin-modal-close">Close</button>
        </form>
      </div>
    `;
    document.body.appendChild(modalDiv);

    // Bind Close events
    document.getElementById("admin-modal-close").addEventListener("click", closeModal);
    modalDiv.addEventListener("click", function(e) {
      if (e.target === modalDiv) closeModal();
    });

    // Handle Form Submit
    document.getElementById("admin-login-form").addEventListener("submit", async function(e) {
      e.preventDefault();
      const email = document.getElementById("admin-email").value;
      const password = document.getElementById("admin-password").value;
      const errorDiv = document.getElementById("admin-login-error");
      
      errorDiv.style.display = "none";
      const submitBtn = e.target.querySelector(".admin-login-btn");
      submitBtn.innerText = "Logging in...";
      submitBtn.disabled = true;

      try {
        const response = await fetch(`${BASE_URL}/admin/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
        const res = await response.json();

        if (res.success) {
          localStorage.setItem("adminToken", res.token);
          localStorage.setItem("adminUser", JSON.stringify(res.admin));
          window.location.href = "admin.html";
        } else {
          errorDiv.innerText = res.message || "Invalid credentials.";
          errorDiv.style.display = "block";
        }
      } catch (err) {
        errorDiv.innerText = "Network error. Make sure server is running.";
        errorDiv.style.display = "block";
      } finally {
        submitBtn.innerText = "Log In";
        submitBtn.disabled = false;
      }
    });
  }

  // Inject link into footer-copyright
  function injectFooterLink() {
    const copyrights = document.querySelectorAll(".footer-copyright");
    copyrights.forEach(copyright => {
      if (copyright.querySelector("#admin-login-link")) return; // already added

      const link = document.createElement("a");
      link.id = "admin-login-link";
      link.href = "#";
      link.style.cssText = "color: inherit; text-decoration: none; font-weight: 500; margin-left: 10px; border-left: 1px solid #475569; padding-left: 10px;";
      link.innerText = "Admin Portal";
      
      link.addEventListener("click", function(e) {
        e.preventDefault();
        const token = localStorage.getItem("adminToken");
        if (token) {
          window.location.href = "admin.html";
        } else {
          openModal();
        }
      });
      
      copyright.appendChild(link);
    });
  }

  function openModal() {
    const modal = document.getElementById("admin-login-modal");
    if (modal) {
      modal.classList.add("open");
      document.getElementById("admin-email").focus();
    }
  }

  function closeModal() {
    const modal = document.getElementById("admin-login-modal");
    if (modal) {
      modal.classList.remove("open");
    }
  }

  // Initialize
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      injectModalMarkup();
      injectFooterLink();
    });
  } else {
    injectModalMarkup();
    injectFooterLink();
  }

  // Public triggers
  window.openAdminLogin = openModal;
})();
