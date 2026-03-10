async function handleLogin() {
    const emailEl = document.getElementById('email');
    const passwordEl = document.getElementById('password');
    const btn = document.getElementById('loginBtn');

    const email = emailEl.value.trim();
    const password = passwordEl.value;

    if (!email || !password) {
        alert("Please enter both email and password.");
        return;
    }

    // Capture original content to restore later
    const originalContent = btn.innerHTML;
    
    // UI Feedback: Loading state
    btn.disabled = true;
    btn.innerHTML = `
        <div class="d-flex align-items-center justify-content-center gap-2">
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            <span>Verifying...</span>
        </div>
    `;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok && data.status === 'success') {
            // REDIRECT BASED ON ROLE
                if (data.user.role === 'mda_admin') {
                    window.location.href = '/mda/dashboard';
                } else if (data.user.role === 'npa_admin') {
                    window.location.href = '/npa/dashboard';
                } else {
                    window.location.href = '/'; // Fallback
                }
        } else {
            // Server-side error (Wrong password, etc.)
            alert(data.message || 'Access Denied: Please check your credentials.');
            btn.innerHTML = originalContent;
            btn.disabled = false;
        }
    } catch (err) {
        // Network or Server crash error
        console.error('Login Error:', err);
        alert('Connection error. Please check your internet or try again later.');
        btn.innerHTML = originalContent;
        btn.disabled = false;
    }
}

// Extra Credit: Allow login by pressing "Enter"
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleLogin();
    }
});