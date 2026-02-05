
let map; // global scope

function view_map(location) {
  const lat = parseFloat(location.split(",")[0]);
  const lng = parseFloat(location.split(",")[1]);

  // Show the modal
  $("#map-modal").modal("show");

  setTimeout(() => {
    if (map) {
      map.remove(); // remove previous map instance
    }

    // Recreate the map fresh
    map = L.map('map-popup').setView([lat, lng], 16);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    L.marker([lat, lng]).addTo(map).bindPopup("Clock-in Location").openPopup();
  }, 300);
}
