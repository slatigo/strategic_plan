// Initialize the Bootstrap modal instance
let mdaAdminModal;
document.addEventListener('DOMContentLoaded', () => {
    const modalElement = document.getElementById('mdaAdminModal');
    if (modalElement) {
        mdaAdminModal = new bootstrap.Modal(modalElement);
    }
});

function openMdaAdminModal() {
    const form = document.getElementById('mdaAdminForm');
    form.reset();
    document.getElementById('adminId').value = '';
    
    document.getElementById('mdaAdminModalLabel').innerText = 'Invite MDA Administrator';
    document.getElementById('passwordField').style.display = 'block';
    document.getElementById('statusField').style.display = 'none';
    
    mdaAdminModal.show();
}

function prepareEdit(id, name, email, active) {
    const form = document.getElementById('mdaAdminForm');
    document.getElementById('adminId').value = id;
    form.name.value = name;
    form.email.value = email;
    
    document.getElementById('mdaAdminModalLabel').innerText = 'Edit MDA Administrator';
    document.getElementById('passwordField').style.display = 'none';
    document.getElementById('statusField').style.display = 'block';
    
    // Set the status switch - handles both boolean and string "true"
    document.getElementById('adminStatus').checked = (active === true || active === 'true');
    
    mdaAdminModal.show();
}

async function saveMdaAdmin() {
    const form = document.getElementById('mdaAdminForm');
    const id = document.getElementById('adminId').value;
    // UPDATED: Ensure this matches the hidden input ID in your Pug
    const mda_id = document.getElementById('mdaId').value; 
    const saveBtn = document.getElementById('saveMdaAdminBtn');

    if (!form.name.value || !form.email.value) {
        return alert("Please fill in all required fields.");
    }

    const isEdit = id !== '';
    const url = isEdit ? `/npa/api/admins/${id}` : '/npa/api/admins';
    const method = isEdit ? 'PUT' : 'POST';

    // Build the payload
    const payload = {
        name: form.name.value,
        email: form.email.value,
        // UPDATED: Use underscored key to match your Sequelize Model
        mda_id: mda_id || null, 
        role: 'mda_admin',
        active: isEdit ? document.getElementById('adminStatus').checked : true
    };

    if (!isEdit) {
        payload.password = form.password.value;
        if (!payload.password || payload.password.length < 6) {
            return alert("Password is required (min 6 characters).");
        }
    }

    try {
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Saving...';

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok) {
            window.location.reload();
        } else {
            // Check if backend sent a specific error message
            alert(result.message || "An error occurred while saving.");
        }
    } catch (err) {
        console.error("Save Admin Error:", err);
        alert("Failed to connect to the server. Please check your connection.");
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fas fa-save me-2"></i> Save Admin';
    }
}


async function confirmDelete(id) {
    // Simple confirmation to prevent accidents
    if (!confirm("Are you sure you want to remove this administrator? This action cannot be undone.")) {
        return;
    }

    try {
        const response = await fetch(`/npa/api/admins/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });

        const result = await response.json();

        if (response.ok) {
            // Refresh to show updated list or empty state
            window.location.reload();
        } else {
            alert(result.message || "Failed to delete the administrator.");
        }
    } catch (err) {
        console.error("Delete Error:", err);
        alert("Server connection failed. Could not delete user.");
    }
}