document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("contactForm");

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        const formData = {
            name: form.name.value,
            email: form.email.value,
            phone: form.phone.value,
            service: form.service.value,
            message: form.message.value
        };

        try {

            const result = await sendContactMessage(formData);

            if(result.success){

                document.getElementById("successMessage").style.display="block";

                document.getElementById("errorMessage").style.display="none";

                form.reset();

            }

            else{

                document.getElementById("errorMessage").innerText=result.message;

                document.getElementById("errorMessage").style.display="block";

            }

        } catch(err){

            console.log(err);

            document.getElementById("errorMessage").style.display="block";

        }

    });

});