let adminModal;

document.addEventListener('DOMContentLoaded', () => {
    adminModal = new bootstrap.Modal(document.getElementById('adminModal'));
});

// Open modal for NEW admin
function openAdminModal() {
    document.getElementById('adminForm').reset();
    document.getElementById('adminId').value = '';
    document.getElementById('adminModalLabel').innerText = 'Invite System Admin';
    document.getElementById('passwordField').style.display = 'block'; // Password required for new
    adminModal.show();
}

// Open modal for EDITING admin
function prepareAdminEdit(id, name, email) {
    document.getElementById('adminId').value = id;
    document.getElementById('adminForm').name.value = name;
    document.getElementById('adminForm').email.value = email;
    document.getElementById('adminModalLabel').innerText = 'Edit System Admin';
    document.getElementById('passwordField').style.display = 'none'; // Hide password on edit
    adminModal.show();
}

async function saveAdmin() {
    const form = document.getElementById('adminForm');
    const id = document.getElementById('adminId').value;
    const saveBtn = document.getElementById('saveAdminBtn');

    // Contextual URL: /npa/api/admins
    const url = id ? `/npa/api/admins/${id}` : '/npa/api/admins';
    const method = id ? 'PUT' : 'POST';

    const payload = {
        name: form.name.value,
        email: form.email.value
    };
    
    // Only add password if creating new
    if (!id) payload.password = form.password.value;

    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Saving...';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (result.status === 'success') {
            location.reload(); // Success: Reload to show new admin in table
        } else {
            alert(result.message || 'Error processing request');
            saveBtn.disabled = false;
            saveBtn.innerText = 'Save Admin';
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Network error occurred');
        saveBtn.disabled = false;
    }
}

function confirmAdminDelete(id) {
    if (confirm('Are you sure you want to remove this administrator?')) {
        fetch(`/npa/api/admins/${id}`, { method: 'DELETE' })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') location.reload();
                else alert(data.message);
            });
    }
}