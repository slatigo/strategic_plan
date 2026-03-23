let planCallModal;

document.addEventListener('DOMContentLoaded', () => {
    const modalEl = document.getElementById('planCallModal');
    if (modalEl) planCallModal = new bootstrap.Modal(modalEl);
});

let isEditMode = false;
let currentEditId = null;

// ... (Keep your global variables and DOMContentLoaded as is)

function openPlanCallModal(data = null) {
    const form = document.getElementById('planCallForm');
    const title = document.querySelector('.modal-title');
    form.reset();
    
    if (data) {
        isEditMode = true;
        currentEditId = data.id;
        // IMPROVEMENT: Display as FY 2025/2026 even if data.fy is just 2025
        const fyLabel = data.fy.toString().includes('/') ? data.fy : `${data.fy}/${parseInt(data.fy) + 1}`;
        
        title.innerText = `Edit Call for ${fyLabel}`;
        form.fy.value = fyLabel; // Fill with the full label
        form.fy.readOnly = true; 
        form.deadline.value = data.deadline;
        form.description.value = data.description;
    } else {
        isEditMode = false;
        title.innerText = "Issue New Plan Call";
        form.fy.readOnly = false;
        form.fy.placeholder = "e.g., 2025/2030"; // Guide the user
    }
    planCallModal.show();
}

async function savePlanCall() {
    const form = document.getElementById('planCallForm');
    const url = isEditMode ? `/npa/api/plan-calls/${currentEditId}` : '/npa/api/plan-calls';
    const method = isEditMode ? 'PUT' : 'POST';

    const payload = {
        fy: form.fy.value, // User types "2025/2030", Controller will clean it
        deadline: form.deadline.value,
        description: form.description.value
    };

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok) {
            window.location.reload();
        } else {
            // IMPROVEMENT: Show the ACTUAL error message from your AppError class
            alert(result.message || "Error saving plan call.");
        }
    } catch (err) {
        console.error(err);
        alert("A network error occurred. Please try again.");
    }
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


