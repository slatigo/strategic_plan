/**
 * Save a new Report Call
 */
// Add these variables at the top of your file
let isEditMode = false;
let currentEditId = null;
let reportModal;
document.addEventListener('DOMContentLoaded', () => {
    // 2. Assign to the existing global variable
    const modalEl = document.getElementById('createReportModal');
    if (modalEl) {
        reportModal = new bootstrap.Modal(modalEl);
    }
});
async function saveReportCall() {
    const form = document.getElementById('reportCallForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Switch URL and Method based on mode
    const url = isEditMode ? `/npa/api/report-calls/${currentEditId}` : '/npa/api/report-calls';
    const method = isEditMode ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            window.location.reload();
        } else {
            const error = await res.json();
            alert('Error: ' + (error.message || 'Failed to save.'));
        }
    } catch (err) {
        console.error(err);
        alert('Failed to save snapshot window.');
    }
}
function openReportModal(data = null) {
    const form = document.getElementById('reportCallForm');
    const title = document.querySelector('.modal-title');
    console.log(data)
    if (data) {
        isEditMode = true;
        currentEditId = data.id;
        title.innerText = "Edit Reporting Window";
        
        form.planCallId.value = data.planCallId || '';
        form.reportingYear.value = data.reportingYear || '';
        form.quarter.value = data.quarter || '';
        form.description.value = data.description || '';

        // ROBUST DEADLINE HANDLING
        if (data.deadline) {
    let dateToSet = data.deadline;
    
    // If it's the specific array format you showed, extract index 0
    if (Array.isArray(dateToSet)) {
        dateToSet = dateToSet;
    }
    
    // If it's a string like "2026-03-19T00:00:00.000Z", split it
    if (typeof dateToSet === 'string' && dateToSet.includes('T')) {
        dateToSet = dateToSet.split('T');
    }

    form.deadline.value = dateToSet;
    console.log("Setting deadline to:", dateToSet);
}
    } else {
        isEditMode = false;
        currentEditId = null;
        title.innerText = "Setup New Reporting Window";
        form.reset();
    }
    
    if (reportModal) {
        reportModal.show();
    } else {
        console.error("reportModal not initialized.");
    }
}

/**
 * Publish: Move status from Draft to Open
 */
async function publishCall(id) {
    if (!confirm('Are you sure you want to open this window for MDAs?')) return;

    try {
        const res = await fetch(`/npa/api/report-calls/${id}/publish`, { method: 'PATCH' });
        const result = await res.json(); // Parse the response
        
        if (res.ok) {
            window.location.reload();
        } else {
            alert(result.message || 'Failed to publish.');
        }
    } catch (err) {
        alert('Network error: Failed to publish.');
    }
}

/**
 * Close: Move status to Closed
 */
async function closeCall(id) {
    if (!confirm('This will stop all MDA submissions for this quarter. Proceed?')) return;

    try {
        const res = await fetch(`/npa/api/report-calls/${id}/close`, { method: 'PATCH' });
        if (res.ok) window.location.reload();
    } catch (err) {
        alert('Failed to close window.');
    }
}
async function reopenCall(id) {
    if (!confirm("Are you sure you want to re-open this reporting window? MDAs will be able to submit reports again.")) return;

    try {
        const response = await fetch(`/npa/api/report-calls/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Open' })
        });

        const result = await response.json();
        if (response.ok) {
            window.location.reload();
        } else {
            alert(result.message || "Failed to reopen call.");
        }
    } catch (err) {
        console.error(err);
        alert("Network error occurred.");
    }
}
/**
 * Delete
 */
async function deleteCall(id) {
    if (!confirm('Delete this report call? This cannot be undone.')) return;

    try {
        const res = await fetch(`/npa/api/report-calls/${id}`, { method: 'DELETE' });
        if (res.ok) window.location.reload();
    } catch (err) {
        alert('Failed to delete.');
    }
}