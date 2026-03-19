/**
 * Report Editor - Planner View Logic
 * Handles AJAX saving and UI feedback
 */

document.addEventListener('DOMContentLoaded', () => {
    const reportForm = document.getElementById('reportForm');
    const saveBtn = document.getElementById('saveDraftBtn');

    if (reportForm) {
        reportForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // 1. UI Feedback: Loading State
            const originalContent = saveBtn.innerHTML;
            saveBtn.innerHTML = `<i class="fas fa-spinner fa-spin me-2"></i> Saving...`;
            saveBtn.disabled = true;

            // 2. Prepare Data
            const formData = new URLSearchParams(new FormData(reportForm));

            try {
                // 3. Send to API
                const response = await fetch('/mda/reports/save-progress', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: formData.toString()
                });

                const result = await response.json();

                if (result.success) {
                    // Show a toast or brief success message
                    showStatus('Changes saved to draft', 'success');
                } else {
                    showStatus('Save failed: ' + result.message, 'danger');
                }
            } catch (error) {
                console.error('Save Error:', error);
                showStatus('Network error. Check your connection.', 'danger');
            } finally {
                // 4. Reset Button
                saveBtn.innerHTML = originalContent;
                saveBtn.disabled = false;
            }
        });
    }
});

/**
 * Helper to show temporary status messages
 */
function showStatus(msg, type) {
    const statusDiv = document.createElement('div');
    statusDiv.className = `alert alert-${type} position-fixed bottom-0 end-0 m-3 shadow-lg`;
    statusDiv.style.zIndex = "9999";
    statusDiv.innerHTML = msg;
    document.body.appendChild(statusDiv);
    
    setTimeout(() => statusDiv.remove(), 3000);
}

async function submitFinalReport() {
    // 1. Confirm with the Planner
    const confirmed = confirm(
        "Are you sure you want to submit? This will lock the report and send it to the NPA for review. You won't be able to make further changes."
    );
    
    if (!confirmed) return;

    const reportForm = document.getElementById('reportForm');
    const formData = new URLSearchParams(new FormData(reportForm));

    try {
        // 2. Send to a dedicated 'submit' endpoint
        const response = await fetch('/mda/reports/final-submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData.toString()
        });

        const result = await response.json();

        if (result.success) {
            alert('Report submitted successfully! Redirecting to dashboard...');
            window.location.href = '/mda/reports'; // Redirect away so they can't edit
        } else {
            alert('Submission Failed: ' + result.message);
        }
    } catch (error) {
        console.error('Final Submit Error:', error);
        alert('A network error occurred during submission.');
    }
}


function formatNumber(input) {
  // 1. Remove any non-digit characters (except the decimal point)
  let value = input.value.replace(/,/g, '');
  
  // 2. Split into integer and decimal parts
  let parts = value.split('.');
  
  // 3. Add commas to the integer part
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  
  // 4. Join them back together
  input.value = parts.join('.');
}