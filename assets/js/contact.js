const form = document.getElementById("contactForm");

form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        service: document.getElementById("service").value,
        message: document.getElementById("message").value,
    };

    try {
        const result = await sendContactMessage(formData);

        if (result.success) {
            alert("Message sent successfully!");
            form.reset();
        } else {
            alert(result.message || "Something went wrong.");
        }
    } catch (err) {
        console.error(err);
        alert("Server Error");
    }
});