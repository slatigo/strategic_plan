// public/js/npa/mda-management.js

let mdaModal;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Bootstrap Modal instance
    const modalElement = document.getElementById('mdaModal');
    if (modalElement) {
        mdaModal = new bootstrap.Modal(modalElement);
    }
});

function openCreateModal() {
    document.getElementById('mdaId').value = ''; // Clear hidden ID
    document.getElementById('addMdaForm').reset();
    document.getElementById('mdaModalLabel').innerText = 'Register New MDA';
    document.getElementById('saveBtn').innerText = 'Save MDA';
    mdaModal.show();
}

function prepareEdit(id, name, code, type) {
    document.getElementById('mdaId').value = id;
    const form = document.getElementById('addMdaForm');
    form.name.value = name;
    form.code.value = code;
    form.type.value = type;

    document.getElementById('mdaModalLabel').innerText = 'Edit MDA Details';
    document.getElementById('saveBtn').innerText = 'Update MDA';
    mdaModal.show();
}

async function saveMda() {
    const form = document.getElementById('addMdaForm');
    const id = document.getElementById('mdaId').value;
    const saveBtn = document.getElementById('saveBtn');

    // Clean RESTful URL structure
    // PUT /api/mda/1  OR  POST /api/mda
    const url = id ? `/npa/api/mda/${id}` : '/npa/api/mda';
    const method = id ? 'PUT' : 'POST';


    saveBtn.disabled = true;

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: form.name.value,
                code: form.code.value,
                type: form.type.value
            })
        });

        const result = await response.json();

        if (result.status === 'success') {
            location.reload();
        } else {
            alert(result.message);
            saveBtn.disabled = false;
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Network error');
        saveBtn.disabled = false;
    }
}

function confirmDelete(id) {
    if (confirm('Are you sure you want to delete this MDA?')) {
        fetch(`/npa/api/mda/${id}`, { 
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') location.reload();
            else alert(data.message);
        })
        .catch(err => alert('Failed to delete'));
    }
}