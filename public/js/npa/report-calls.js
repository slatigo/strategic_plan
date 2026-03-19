/**
 * Save a new Report Call
 */
async function saveReportCall() {
    const form = document.getElementById('reportCallForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
        const res = await fetch('/npa/api/report-calls', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            window.location.reload();
        } else {
            const error = await res.json();
            alert('Error: ' + error.message);
        }
    } catch (err) {
        console.error(err);
        alert('Failed to save snapshot window.');
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