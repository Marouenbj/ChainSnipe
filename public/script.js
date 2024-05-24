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
    const message = event.data;
    console.log('WebSocket message received:', message);
    
    // Filter messages with the [bot] prefix
    if (message.startsWith('[bot]')) {
      const newMessageElement = document.createElement('div');
      newMessageElement.textContent = message.replace('[bot] ', '');
      outputDiv.appendChild(newMessageElement);
      outputDiv.scrollTop = outputDiv.scrollHeight;
    } else {
      console.log('Filtered out message:', message);
    }
  };

  ws.onclose = (event) => {
    console.log(`WebSocket connection closed: ${event.code} - ${event.reason}`);
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
});
