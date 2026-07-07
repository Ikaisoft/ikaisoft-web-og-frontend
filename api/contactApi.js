const BASE_URL = "https://ikaisoft-website-backend.onrender.com/api";

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