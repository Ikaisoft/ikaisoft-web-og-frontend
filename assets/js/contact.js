const form = document.getElementById("contactForm");

const successMessage = document.getElementById("successMessage");
const errorMessage = document.getElementById("errorMessage");

form.addEventListener("submit", async function (e) {
    e.preventDefault();

    successMessage.style.display = "none";
    errorMessage.style.display = "none";

    const submitBtn = form.querySelector("button[type='submit']");
    submitBtn.disabled = true;
    submitBtn.innerHTML = "Sending...";

    const formData = {
        name: document.getElementById("ContactForm-name").value.trim(),
        email: document.getElementById("ContactForm-email").value.trim(),
        phone: document.getElementById("ContactForm-phone").value.trim(),
        service: document.getElementById("ContactForm-service").value,
        message: document.getElementById("ContactForm-body").value.trim(),
    };

    try {
        const result = await sendContactMessage(formData);

        if (result.success) {
            form.reset();

            successMessage.style.display = "block";

            successMessage.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        } else {
            errorMessage.innerHTML = result.message || "Something went wrong.";
            errorMessage.style.display = "block";
        }
    } catch (err) {
        console.error(err);

        errorMessage.innerHTML = "Server Error. Please try again later.";
        errorMessage.style.display = "block";
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
            Send Message
            <span class="svg-wrapper">
                <svg class="icon-20" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M13.3365 7.84518L6.16435 15.0173L4.98584 13.8388L12.158 6.66667H5.83652V5H15.0032V14.1667H13.3365V7.84518Z" fill="currentColor"></path>
                </svg>
            </span>
        `;
    }
});