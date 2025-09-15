const socket = io();
const username = prompt("Enter your name:"); // get username from user

if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      socket.emit("send_location", { username, latitude, longitude });
    },
    (err) => {
      console.error(err);
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    }
  );
}

const map = L.map("map").setView([0, 0], 16);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "openstreetmap",
}).addTo(map);

const markers = {};

socket.on("all_users", (users) => {
  users.forEach((user) => {
    if (user.latitude && user.longitude) {
      addOrUpdateMarker(user);
    }
  });
});

socket.on("receive_location", (data) => {
  addOrUpdateMarker(data);
});

socket.on("user_disconnected", (id) => {
  if (markers[id]) {
    map.removeLayer(markers[id]);
    delete markers[id];
  }
});

function addOrUpdateMarker(user) {
  const { id, latitude, longitude, username } = user;

  const customIcon = L.divIcon({
    className: "custom-marker",
    html: `<div style="text-align:center">
             <img src="https://cdn-icons-png.flaticon.com/512/149/149071.png" 
                  style="width:24px;height:24px;border-radius:50%"><br>
             <span style="background:white;padding:2px 4px;border-radius:4px;font-size:12px">
               ${username || "User"}
             </span>
           </div>`,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
  });

  if (markers[id]) {
    markers[id].setLatLng([latitude, longitude]);
  } else {
    markers[id] = L.marker([latitude, longitude], { icon: customIcon }).addTo(
      map
    );
  }
}
