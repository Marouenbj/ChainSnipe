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
    });

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
      });
  });

  startBotButton.addEventListener('click', () => {
    fetch('/api/bot/start', {
      method: 'POST'
    })
      .then(response => response.text())
      .then(message => {
        alert(message);
      });
  });

  stopBotButton.addEventListener('click', () => {
    fetch('/api/bot/stop', {
      method: 'POST'
    })
      .then(response => response.text())
      .then(message => {
        alert(message);
      });
  });

  const ws = new WebSocket(`ws://${window.location.host}`);

  ws.onopen = () => {
    console.log('WebSocket connection opened.');
  };

  ws.onmessage = (event) => {
    const message = event.data.trim(); // Trim to remove trailing newlines
    const lines = message.split('\n'); // Split the message by newlines
    lines.forEach(line => {
      const newMessageElement = document.createElement('div');
      newMessageElement.textContent = line;
      outputDiv.appendChild(newMessageElement);
    });
    outputDiv.scrollTop = outputDiv.scrollHeight;
  };

  ws.onclose = () => {
    console.log('WebSocket connection closed.');
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
});
