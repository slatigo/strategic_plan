document.addEventListener('DOMContentLoaded', function() {
        const searchInput = document.getElementById('metricSearch');
        const typeFilter = document.getElementById('typeFilter');
        const rows = Array.from(document.querySelectorAll('.metric-row'));
        
        // Pre-cache the searchable text to avoid expensive innerText calls during typing
        const rowCache = rows.map(row => ({
          element: row,
          text: row.innerText.toLowerCase(),
          type: row.getAttribute('data-type')
        }));

        let timeout = null;

        function performFilter() {
          const query = searchInput.value.toLowerCase();
          const type = typeFilter.value.toLowerCase();

          // Use RequestAnimationFrame for smooth UI updates
          requestAnimationFrame(() => {
            rowCache.forEach(item => {
              const matchesSearch = !query || item.text.includes(query);
              const matchesType = type === 'all' || item.type === type;
              
              item.element.style.display = (matchesSearch && matchesType) ? '' : 'none';
            });
          });
        }

        // Debounce function: Waits for user to stop typing
        searchInput.addEventListener('input', () => {
          clearTimeout(timeout);
          timeout = setTimeout(performFilter, 250); // 250ms delay
        });

        typeFilter.addEventListener('change', performFilter);
      });