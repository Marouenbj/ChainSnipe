document.addEventListener('DOMContentLoaded', () => {
  const configTextarea = document.getElementById('config');
  const saveConfigButton = document.getElementById('saveConfig');
  const startBotButton = document.getElementById('startBot');
  const stopBotButton = document.getElementById('stopBot');
  const outputDiv = document.getElementById('output');

  fetch('/api/config')
    .then(response => response.json())
    .then(data => {
      configTextarea.value = data.config;
    })
    .catch(error => console.error('Error fetching config:', error));

  saveConfigButton.addEventListener('click', () => {
    const config = configTextarea.value;
    fetch('/api/config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ config })
    })
      .then(response => response.text())
      .then(message => {
        alert(message);
      })
      .catch(error => console.error('Error saving config:', error));
  });

  startBotButton.addEventListener('click', () => {
    fetch('/api/bot/start', {
      method: 'POST'
    })
      .then(response => response.text())
      .then(message => {
        alert(message);
      })
      .catch(error => console.error('Error starting bot:', error));
  });

  stopBotButton.addEventListener('click', () => {
    fetch('/api/bot/stop', {
      method: 'POST'
    })
      .then(response => response.text())
      .then(message => {
        alert(message);
      })
      .catch(error => console.error('Error stopping bot:', error));
  });

  // Get the session ID from the cookie
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  };

  const sessionID = getCookie('connect.sid').split('.')[0].substring(2);

  const ws = new WebSocket(`ws://${window.location.host}`, sessionID);

  ws.onopen = () => {
    console.log('WebSocket connection opened.');
  };

  ws.onmessage = (event) => {
    const message = event.data.trim(); // Trim to remove trailing newlines
    console.log('WebSocket message received:', message); // Log received messages
    const newMessageElement = document.createElement('div');
    newMessageElement.textContent = message;
    outputDiv.appendChild(newMessageElement);
    outputDiv.scrollTop = outputDiv.scrollHeight;
  };

  ws.onclose = (event) => {
    console.log(`WebSocket connection closed: ${event.code} - ${event.reason}`);
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
});
