const BASE_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.port !== ""
  ? "http://localhost:5000/api"
  : "https://ikaisoft-website-backend.onrender.com/api";

async function sendContactMessage(formData) {
    const res = await fetch(`${BASE_URL}/contact`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
    });

    return await res.json();
}