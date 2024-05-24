document.addEventListener('DOMContentLoaded', function () {
  // Fetch config.ini and display it
  fetch('/api/config')
      .then(response => response.text())
      .then(data => {
          document.getElementById('configContent').innerText = data;
      })
      .catch(error => console.error('Error fetching config:', error));

  // Handle console logs
  const socket = io();
  socket.on('consoleLog', function (log) {
      const consoleOutput = document.getElementById('consoleOutput');
      consoleOutput.innerHTML += `<p>${log}</p>`;
  });
});
