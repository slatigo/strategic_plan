/**
 * Handles NPA decisions on MDA Quarterly Reports
 * @param {string} status - 'Approved' or 'Revision Required'
 */
async function handleDecision(status) {
    const remarks = document.getElementById('remarks').value;
    const reportId = window.reportConfig.id;

    // 1. Validation for Rejections (Updated to 'Needs Revision')
    if (status === 'Needs Revision' && (!remarks || remarks.trim().length < 5)) {
        return Swal.fire({
            icon: 'error',
            title: 'Remarks Required',
            text: 'Please provide specific instructions in the remarks field.'
        });
    }

    // 2. Confirmation Dialog
    const result = await Swal.fire({
        title: `Confirm ${status}?`,
        text: `Are you sure you want to mark this report as "${status}"?`,
        icon: status === 'Approved' ? 'success' : 'warning',
        showCancelButton: true,
        confirmButtonColor: status === 'Approved' ? '#198754' : '#f59e0b',
        cancelButtonColor: '#6c757d',
        confirmButtonText: status === 'Approved' ? 'Yes, Approve' : 'Yes, Request Revision',
        showLoaderOnConfirm: true,
        preConfirm: async () => {
            try {
                // This matches the PATCH route we defined earlier
                const response = await fetch(`/npa/api/reports/${reportId}/status`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
                        status: status, 
                        remarks: remarks 
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Failed to update status');
                }

                return data;
            } catch (error) {
                Swal.showValidationMessage(`Request failed: ${error}`);
            }
        },
        allowOutsideClick: () => !Swal.isLoading()
    });

    // 3. Success Handling
    if (result.isConfirmed) {
        await Swal.fire({
            icon: 'success',
            title: 'Updated!',
            text: result.value.message,
            timer: 2000,
            showConfirmButton: false
        });
        
        // Reload to show the new status and the comment in the timeline
        window.location.reload();
    }
}