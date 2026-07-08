document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("registrationForm");
    const successMessage = document.getElementById("successMessage");
    const errorMessage = document.getElementById("errorMessage");
    const submitButton = form.querySelector("button[type='submit']");
    const originalButtonHTML = submitButton.innerHTML;

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        const formData = {
            name: form.name.value.trim(),
            email: form.email.value.trim(),
            phone: form.phone.value.trim(),
            course: form.course.value,
            message: form.message.value.trim()
        };

        submitButton.disabled = true;
        submitButton.setAttribute("aria-busy", "true");
        submitButton.classList.add("is-loading");
        submitButton.innerHTML = "Submitting...";

        successMessage.style.display = "none";
        errorMessage.style.display = "none";

        try {

            const result = await sendRegistration(formData);

            if (result.success) {

                form.reset();
                form.style.display = "none";
                successMessage.innerText = result.message;
                successMessage.style.display = "block";

            } else {

                errorMessage.innerText =
                    result.message || "Something went wrong. Please try again.";

                errorMessage.style.display = "block";
            }

        } catch (err) {

            console.error(err);

            errorMessage.innerText =
                "Unable to connect to the server. Please try again later.";

            errorMessage.style.display = "block";

        } finally {

            submitButton.disabled = false;
            submitButton.removeAttribute("aria-busy");
            submitButton.classList.remove("is-loading");
            submitButton.innerHTML = originalButtonHTML;

        }

    });

});