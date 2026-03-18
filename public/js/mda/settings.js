/**
 * Tab Persistence Logic
 */
document.addEventListener("DOMContentLoaded", function() {
    // 1. Check if there is a saved tab in localStorage
    const activeTab = localStorage.getItem('mdaSettingsActiveTab');
    if (activeTab) {
        const tabTrigger = new bootstrap.Tab(document.querySelector(`#settingsTabs button[data-bs-target="${activeTab}"]`));
        tabTrigger.show();
    }

    // 2. Listen for tab clicks and save the target ID to localStorage
    const tabButtons = document.querySelectorAll('#settingsTabs button[data-bs-toggle="tab"]');
    tabButtons.forEach(button => {
        button.addEventListener('shown.bs.tab', (event) => {
            const targetId = event.target.getAttribute('data-bs-target');
            localStorage.setItem('mdaSettingsActiveTab', targetId);
        });
    });
});

/**
 * Office Modal Logic
 */
function openOfficeModal(data = null) {
    document.getElementById('officeModalLabel').innerText = data ? 'Edit Office' : 'Add Office';
    document.getElementById('off_id').value = data ? data.id : '';
    document.getElementById('off_name').value = data ? data.name : '';
    document.getElementById('off_code').value = data ? data.code : '';
    new bootstrap.Modal(document.getElementById('officeModal')).show();
}

/**
 * Budget Source Modal Logic
 */
function openBudgetModal(data = null) {
    document.getElementById('budgetModalLabel').innerText = data ? 'Edit Budget Source' : 'Add Budget Source';
    document.getElementById('src_id').value = data ? data.id : '';
    document.getElementById('src_name').value = data ? data.name : '';
    document.getElementById('src_code').value = data ? data.code : '';
    new bootstrap.Modal(document.getElementById('budgetModal')).show();
}

/**
 * Unified Delete Function
 */
async function deleteItem(type, id) {
    const displayType = type.replace('-', ' ');
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: `You are about to delete this ${displayType}. This cannot be undone.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, delete it!'
      });

    if (result.isConfirmed) {
        try {
            const response = await fetch(`/mda/settings/${type}/${id}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            if (data.success) {
                // We don't clear localStorage here so the user stays on the same tab after reload
                window.location.reload();
            } else {
                Swal.fire('Error!', 'Could not delete the item.', 'error');
            }
        } catch (err) {
            Swal.fire('Error!', 'Something went wrong on the server.', 'error');
        }
    }
}