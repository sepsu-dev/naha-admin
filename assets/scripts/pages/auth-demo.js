// Demo only: no credentials are sent, stored, or checked against an account.
document.querySelectorAll('[data-demo-auth]').forEach((form) => {
    const password = form.querySelector('[autocomplete="new-password"]');
    const confirmation = form.querySelector('[data-confirm-password]');
    const status = form.querySelector('[role="status"]');

    function checkConfirmation() {
        if (confirmation) {
            confirmation.setCustomValidity(confirmation.value === password.value ? '' : 'Passwords must match.');
        }
    }

    form.addEventListener('input', () => {
        checkConfirmation();
        status.textContent = '';
    });

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        checkConfirmation();
        if (!form.reportValidity()) return;
        form.reset();
        checkConfirmation();
        status.textContent = 'Demo complete. No account was accessed or created, and no email was sent.';
    });
});