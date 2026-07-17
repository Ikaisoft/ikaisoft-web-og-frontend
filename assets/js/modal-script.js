/* ============================================
   ENROLLMENT MODAL - COMPLETE JAVASCRIPT
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    // Get DOM Elements
    const enrollButtons = document.querySelectorAll('.enroll-open-btn');
    const enrollModal = document.getElementById('enroll-modal');
    const closeEnrollModalBtn = document.getElementById('enroll-modal-close');
    const enrollForm = document.getElementById('enroll-form');
    const enrollStatus = document.getElementById('enroll-status');
    const enrollSubmitBtn = document.querySelector('.enroll-submit-btn');

    if (!enrollModal || !enrollForm || !enrollStatus || !enrollSubmitBtn || !closeEnrollModalBtn) {
        console.warn('Enrollment modal elements not found on this page.');
        return;
    }

    // ============================================
    // OPEN MODAL FUNCTION
    // ============================================
    function openEnrollModal(courseTitle){
        const courseInput = document.getElementById('enroll-course-title');
        const nameInput = document.getElementById('enroll-name');
enrollForm.reset();
        courseInput.value = courseTitle;

        enrollModal.classList.add('open');
        enrollModal.style.opacity = '1';
        enrollModal.style.visibility = 'visible';
        enrollModal.style.pointerEvents = 'auto';
        enrollModal.querySelector('.enroll-box').style.opacity = '1';
        enrollModal.querySelector('.enroll-box').style.transform = 'translateY(0) scale(1)';
        enrollModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
        clearStatus();
        
        setTimeout(() => {
            if (nameInput) {
                nameInput.focus();
            }
        }, 300);
    }

    // ============================================
    // CLOSE MODAL FUNCTION
    // ============================================
    function closeEnrollModal() {
        enrollModal.classList.remove('open');
        enrollModal.style.opacity = '0';
        enrollModal.style.visibility = 'hidden';
        enrollModal.style.pointerEvents = 'none';
        const box = enrollModal.querySelector('.enroll-box');
        if (box) {
            box.style.opacity = '0';
            box.style.transform = 'translateY(40px) scale(0.94)';
        }
        enrollModal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
        setTimeout(() => {
            enrollForm.reset();
            clearStatus();
        }, 300);
    }

    // ============================================
    // CLEAR STATUS MESSAGE
    // ============================================
    function clearStatus() {
        enrollStatus.style.display = 'none';
        enrollStatus.className = '';
        enrollStatus.innerHTML = '';
    }

    // ============================================
    // SHOW STATUS MESSAGE
    // ============================================
    function showStatus(message, type = 'info') {
        enrollStatus.style.display = 'block';
        enrollStatus.className = type;
        enrollStatus.innerHTML = message;
        enrollStatus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // ============================================
    // FORM VALIDATION
    // ============================================
    function validateForm() {
        const name = document.getElementById('enroll-name').value.trim();
        const email = document.getElementById('enroll-email').value.trim();
        const phone = document.getElementById('enroll-phone').value.trim();

        // Name validation
        if (!name) {
            showStatus('❌ Please enter your full name', 'error');
            document.getElementById('enroll-name').focus();
            return false;
        }

        if (name.length < 3) {
            showStatus('❌ Full name must be at least 3 characters long', 'error');
            document.getElementById('enroll-name').focus();
            return false;
        }

        // Check if name contains only letters and spaces
        if (!/^[a-zA-Z\s]+$/.test(name)) {
            showStatus('❌ Full name should contain only letters and spaces', 'error');
            document.getElementById('enroll-name').focus();
            return false;
        }

        // Email validation
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailPattern.test(email)) {
            showStatus('❌ Please enter a valid email address', 'error');
            document.getElementById('enroll-email').focus();
            return false;
        }

        // Phone validation
        const phonePattern = /^[\d\s\-\+\(\)]{7,}$/;
        if (!phone || !phonePattern.test(phone)) {
            showStatus('❌ Please enter a valid phone number (at least 7 digits)', 'error');
            document.getElementById('enroll-phone').focus();
            return false;
        }

        return true;
    }

    // ============================================
    // FORM SUBMISSION
    // ============================================
    enrollForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        // Validate form
        if (!validateForm()) {
            return;
        }

        // Get form values
        const course = document.getElementById('enroll-course-title').value;
        const name = document.getElementById('enroll-name').value.trim();
        const email = document.getElementById('enroll-email').value.trim();
        const phone = document.getElementById('enroll-phone').value.trim();
        const message = document.getElementById('enroll-message').value.trim();

        // Disable submit button
        enrollSubmitBtn.disabled = true;
        enrollSubmitBtn.innerHTML = '<span class="spinner">⟳</span> Submitting...';

        try {
            showStatus('📤 Submitting your enrollment...', 'info');

            // Call enrollment API
            const response = await submitEnrollment({
                course,
                name,
                email,
                phone,
                message
            });

            // Success response
            if (response && response.success) {
                showStatus(
                    '✅ <strong>Success!</strong><br>Your enrollment has been submitted! We will contact you soon.',
                    'success'
                );
                enrollForm.reset();
                setTimeout(() => {
                    closeEnrollModal();
                }, 2500);
            } else {
                // Error response from API
                const errorMsg = response?.message || 'Failed to submit enrollment. Please try again.';
                showStatus(`❌ ${errorMsg}`, 'error');
            }
        } catch (error) {
            console.error('Enrollment Error:', error);
            showStatus('❌ Network error. Please check your connection and try again.', 'error');
        } finally {
            // Re-enable submit button
            enrollSubmitBtn.disabled = false;
            enrollSubmitBtn.innerHTML = 'Submit Enrollment';
        }
    });

    // ============================================
    // SUBMIT ENROLLMENT FUNCTION
    // ============================================
    async function submitEnrollment(data) {
        if (typeof sendEnrollment === 'function') {
            return sendEnrollment(data);
        }

        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Enrollment Data:', data);
                resolve({
                    success: true,
                    message: 'Enrollment submitted successfully!'
                });
            }, 1500);
        });
    }

    // ============================================
    // EVENT LISTENERS - OPEN MODAL
    // ============================================
    enrollButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const courseTitle = this.getAttribute('data-course');
            openEnrollModal(courseTitle);
        });
    });

    // ============================================
    // EVENT LISTENERS - CLOSE MODAL
    // ============================================
    if (closeEnrollModalBtn) {
        closeEnrollModalBtn.addEventListener('click', closeEnrollModal);
    }

    // Close modal when clicking outside (on backdrop)
    enrollModal.addEventListener('click', function(event) {
        if (event.target === enrollModal) {
            closeEnrollModal();
        }
    });

    // Close modal on ESC key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && enrollModal.classList.contains('open')) {
            closeEnrollModal();
        }
    });

    // ============================================
    // INPUT FIELD ENHANCEMENTS
    // ============================================

    // Phone number formatting - allow only numbers, spaces, dashes, plus, parentheses
    const phoneInput = document.getElementById('enroll-phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            this.value = this.value.replace(/[^\d\s\-\+\(\)]/g, '');
        });
    }

    // Name trimming - remove leading/trailing whitespace
    const nameInput = document.getElementById('enroll-name');
    if (nameInput) {
        nameInput.addEventListener('blur', function() {
            this.value = this.value.trim();
        });

        // Optional: Allow only letters and spaces
        nameInput.addEventListener('input', function(e) {
            // Uncomment next line to restrict to letters only
            // this.value = this.value.replace(/[^a-zA-Z\s]/g, '');
        });
    }

    // Email lowercase - convert to lowercase on blur
    const emailInput = document.getElementById('enroll-email');
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            this.value = this.value.trim().toLowerCase();
        });
    }

    // ============================================
    // REAL-TIME CHARACTER COUNT (Optional)
    // ============================================
    const messageInput = document.getElementById('enroll-message');
    if (messageInput) {
        messageInput.addEventListener('input', function() {
            // Optional: Add character counter
            // console.log('Message length:', this.value.length);
        });
    }

    // ============================================
    // ACCESSIBILITY ATTRIBUTES
    // ============================================
    enrollForm.setAttribute('aria-label', 'Course Enrollment Form');
    enrollSubmitBtn.setAttribute('aria-label', 'Submit enrollment form');
    closeEnrollModalBtn.setAttribute('aria-label', 'Close enrollment modal');

    console.log('✅ Enrollment Modal initialized successfully!');
});

/* ============================================
   ALTERNATIVE: GLOBAL FUNCTION (Optional)
   ============================================ */

// Expose global function for manual modal opening (if needed)
window.openEnrollmentModal = function(courseTitle = 'Data Science Mastery Course') {
    const modal = document.getElementById('enroll-modal');
    if (modal) {
        document.getElementById('enroll-course-title').value = courseTitle;
        modal.classList.add('open');
        document.body.classList.add('modal-open');
        document.getElementById('enroll-name').focus();
    }
};
