async function handleDecision(status) {
    const remarks = document.getElementById('remarks').value;
    
    // Use the variables we passed from Pug
    const planId = window.planConfig.id;
    const callId = window.planConfig.callId;

    const result = await Swal.fire({
        title: `Confirm ${status}?`,
        text: `Are you sure you want to set this plan to ${status}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: status === 'Approved' ? '#198754' : (status === 'Rejected' ? '#dc3545' : '#ffc107'),
        confirmButtonText: 'Yes, Proceed',
        showLoaderOnConfirm: true, // Adds a built-in loading spinner to the button
        preConfirm: async () => {
            try {
                const response = await fetch(`/npa/plans/${planId}/review`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status, remarks })
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.message || 'Server error');
                return data;
            } catch (error) {
                Swal.showValidationMessage(`Request failed: ${error}`);
            }
        },
        allowOutsideClick: () => !Swal.isLoading()
    });

    if (result.isConfirmed) {
        await Swal.fire({
            title: 'Success!',
            text: result.value.message,
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
        });
        
        // Redirect using the callId we passed
        window.location.href = `/npa/plan-calls/${callId}/submissions`;
    }
}