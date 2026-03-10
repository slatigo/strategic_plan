/**
 * Opens the "Start Plan" Modal and sets the Call ID
 */
function openStartPlanModal(callId, fy) {
    document.getElementById('modal_call_id').value = callId;
    document.getElementById('display_fy').innerText = fy;
    
    // Show the Bootstrap Modal
    const myModal = new bootstrap.Modal(document.getElementById('startPlanModal'));
    myModal.show();
}

/**
 * Sends the request to create the Plan Header
 */
async function submitNewPlan() {
    const callId = document.getElementById('modal_call_id').value;
    const programmeId = document.getElementById('programme_id').value;
    const submitBtn = document.getElementById('btnSubmitPlan');

    if (!programmeId) {
        return alert("Please select a Programme to continue.");
    }

    try {
        // Disable button to prevent double submission
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Starting...';

        const response = await fetch('/mda/api/plans/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                call_id: callId, 
                programme_id: programmeId 
            })
        });

        const result = await response.json();

        if (response.ok && result.status === 'success') {
            // Success! Redirect to the detailed form
            window.location.href = `/mda/plans/${result.planId}/edit`;
        } else {
            alert(result.message || "Failed to start the plan.");
            submitBtn.disabled = false;
            submitBtn.innerText = 'Start Submission';
        }
    } catch (err) {
        console.error("Error starting plan:", err);
        alert("A server error occurred. Please try again.");
        submitBtn.disabled = false;
    }
}