let planCallModal;

document.addEventListener('DOMContentLoaded', () => {
    const modalEl = document.getElementById('planCallModal');
    if (modalEl) planCallModal = new bootstrap.Modal(modalEl);
});

let isEditMode = false;
let currentEditId = null;

function openPlanCallModal(data = null) {
    const form = document.getElementById('planCallForm');
    const title = document.querySelector('.modal-title');
    form.reset();
    
    if (data) {
        isEditMode = true;
        currentEditId = data.id;
        title.innerText = `Edit Call for ${data.fy}`;
        form.fy.value = data.fy;
        form.fy.readOnly = true; // Don't allow changing the year once issued
        form.deadline.value = data.deadline;
        form.description.value = data.description;
    } else {
        isEditMode = false;
        title.innerText = "Issue New Plan Call";
        form.fy.readOnly = false;
    }
    planCallModal.show();
}

async function savePlanCall() {
    const form = document.getElementById('planCallForm');
    const url = isEditMode ? `/npa/api/plan-calls/${currentEditId}` : '/npa/api/plan-calls';
    const method = isEditMode ? 'PUT' : 'POST';

    const payload = {
        fy: form.fy.value,
        deadline: form.deadline.value,
        description: form.description.value
    };

    const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (response.ok) window.location.reload();
    else alert("Error saving plan call.");
}

async function toggleCallStatus(id, newStatus) {
    if (!confirm(`Are you sure you want to set this call to ${newStatus}?`)) return;

    try {
        const response = await fetch(`/npa/api/plan-calls/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) window.location.reload();
    } catch (err) {
        console.error(err);
    }
}


async function deletePlanCall(id, fy) {
    if (!confirm(`WARNING: Are you sure you want to delete the ${fy} call? This action cannot be undone.`)) {
        return;
    }

    try {
        const response = await fetch(`/npa/api/plan-calls/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            window.location.reload();
        } else {
            const err = await response.json();
            alert(err.message || "Failed to delete call.");
        }
    } catch (err) {
        console.error(err);
        alert("Network error occurred.");
    }
}