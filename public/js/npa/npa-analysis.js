document.addEventListener('DOMContentLoaded', function() {
    
    // --- 1. ACCORDION LOGIC (Hierarchy View) ---
    const toggles = document.querySelectorAll('.custom-toggle');
    if (toggles.length > 0) {
        toggles.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const targetSelector = this.getAttribute('data-target');
                const targetEl = document.querySelector(targetSelector);
                const parentAccordion = this.closest('.accordion');
                
                if (!targetEl || !parentAccordion) return;

                const isOpen = targetEl.classList.contains('show');
                const allCollapses = parentAccordion.querySelectorAll('.accordion-collapse');
                const allButtons = parentAccordion.querySelectorAll('.custom-toggle');
                
                allCollapses.forEach(coll => coll.classList.remove('show'));
                allButtons.forEach(b => b.classList.add('collapsed'));

                if (!isOpen) {
                    targetEl.classList.add('show');
                    this.classList.remove('collapsed');
                }
            });
        });
    }

    // --- 2. SEARCH & FILTER LOGIC (Focus View) ---
    const searchInput = document.getElementById('metricSearch');
    const typeFilter = document.getElementById('typeFilter');
    const rows = Array.from(document.querySelectorAll('.metric-row'));
    
    if (searchInput && rows.length > 0) {
        // Pre-cache to avoid lag
        const rowCache = rows.map(row => ({
            element: row,
            text: row.innerText.toLowerCase(),
            type: row.getAttribute('data-type')
        }));

        let timeout = null;

        const performFilter = () => {
            const query = searchInput.value.toLowerCase();
            const type = typeFilter ? typeFilter.value.toLowerCase() : 'all';

            requestAnimationFrame(() => {
                rowCache.forEach(item => {
                    const matchesSearch = !query || item.text.includes(query);
                    const matchesType = type === 'all' || item.type === type;
                    item.element.style.display = (matchesSearch && matchesType) ? '' : 'none';
                });
            });
        };

        searchInput.addEventListener('input', () => {
            clearTimeout(timeout);
            timeout = setTimeout(performFilter, 250);
        });

        if (typeFilter) typeFilter.addEventListener('change', performFilter);
    }

    // --- 3. MDA BREAKDOWN MODAL LOGIC (Both Views) ---
    document.addEventListener('click', function(e) {
    const btn = e.target.closest('.view-mda-performance') || e.target.closest('.view-breakdown');
    if (!btn) return;

    const dataRaw = btn.getAttribute('data-metric') || btn.getAttribute('data-indicator');
    if (!dataRaw) return;

    const data = JSON.parse(dataRaw);
    
    // --- 1. SETUP UI ELEMENTS ---
    const titleEl = document.getElementById('modalTitle');
    const subTitleEl = document.getElementById('modalSubTitle');
    const totalEl = document.getElementById('modalTotalValue');
    const tbody = document.getElementById('mdaBreakdownBody');
    const emptyState = document.getElementById('noMdaData');

    // --- 2. CATEGORIZE UNITS ---
    // Standard/Quality (Averages): We want to see compliance with a target level.
    const unitsToAverage = [
        '%', 'Years', 'Ratio (X:1)', 'Ratio (1:X)', 
        'Per capita', 'Rate per 100,000', 'Rate per 1000', 'Days'
    ];
    
    // Volume/Quantity (Sums): We want to see who contributed what share of the total.
    const isAveraged = unitsToAverage.includes(data.unit);

    if (titleEl) titleEl.innerText = data.name;
    
    const polarityLabel = data.polarity === 'Decr' ? 'Goal: Decrease' : 'Goal: Increase';
    if (subTitleEl) subTitleEl.innerText = `Code: ${data.code} | Unit: ${data.unit || 'Units'} | ${polarityLabel}`;
    
    // Parse National Baseline Numbers
    const rawTotal = String(data.nationalActual || data.actual || 0).replace(/,/g, '');
    const totalNum = parseFloat(rawTotal) || 0;
    const targetNum = parseFloat(String(data.target || 0).replace(/,/g, '')) || 0;
    
    const totalLabel = isAveraged ? 'National Average' : 'National Total';
    if (totalEl) totalEl.innerText = `${totalNum.toLocaleString()} ${data.unit || ''} (${totalLabel})`;

    if (tbody) {
        tbody.innerHTML = '';
        if (data.mdaReports && data.mdaReports.length > 0) {
            if (emptyState) emptyState.classList.add('d-none');
            
            data.mdaReports.forEach(report => {
                const rawVal = String(report.value).replace(/,/g, '');
                const valNum = parseFloat(rawVal) || 0;
                
                let primaryBadge = '';
                let secondaryText = '';
                
                if (isAveraged) {
                    // --- QUALITY LOGIC (Standard Compliance) ---
                    // Performance: How the MDA's value compares to the national target
                    let mdaPerf = 0;
                    if (targetNum > 0 && valNum > 0) {
                        mdaPerf = data.polarity === 'Decr' ? (targetNum / valNum * 100) : (valNum / targetNum * 100);
                    }
                    
                    // Variance: How the MDA compares to the current group average
                    const variance = totalNum > 0 ? (((valNum - totalNum) / totalNum) * 100).toFixed(1) : "0.0";
                    const prefix = variance > 0 ? '+' : '';
                    
                    const perfColor = mdaPerf >= 100 ? 'bg-soft-success text-success' : 'bg-soft-danger text-danger';
                    
                    primaryBadge = `<span class="badge ${perfColor} border">${mdaPerf.toFixed(1)}% Performance</span>`;
                    secondaryText = `<div class="x-small text-muted mt-1">${prefix}${variance}% variance from Average</div>`;
                } else {
                    // --- VOLUME LOGIC (Portion of Pie) ---
                    // Share: What % of the national total this MDA provided
                    const share = totalNum > 0 ? ((valNum / totalNum) * 100).toFixed(1) : "0.0";
                    
                    // Progress: What % of the total national target this one MDA covered
                    const progress = targetNum > 0 ? ((valNum / targetNum) * 100).toFixed(1) : "0.0";
                    
                    primaryBadge = `<span class="badge bg-soft-info text-info border">${share}% Share</span>`;
                    secondaryText = `<div class="x-small text-muted mt-1">Covers ${progress}% of National Target</div>`;
                }

                tbody.insertAdjacentHTML('beforeend', `
                    <tr>
                        <td class="ps-4">
                            <div class="fw-semibold">${report.mda}</div>
                            ${secondaryText}
                        </td>
                        <td class="text-end">
                            <div class="fw-bold">${valNum.toLocaleString()}</div>
                            <small class="text-muted">${data.unit || ''}</small>
                        </td>
                        <td class="text-center align-middle">${primaryBadge}</td>
                    </tr>
                `);
            });
        } else if (emptyState) {
            emptyState.classList.remove('d-none');
        }
    }
});
});