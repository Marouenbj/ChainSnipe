document.addEventListener('DOMContentLoaded', () => {
    const configTextarea = document.getElementById('config');
    const saveConfigButton = document.getElementById('saveConfig');
    const startBotButton = document.getElementById('startBot');
    const stopBotButton = document.getElementById('stopBot');
  
    // Fetch the current config and populate the textarea
    fetch('/api/config')
      .then(response => response.json())
      .then(data => {
        configTextarea.value = data.config;
      });
  
    // Save the updated config
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
  
    // Start the bot
    startBotButton.addEventListener('click', () => {
      fetch('/api/bot/start', {
        method: 'POST'
      })
        .then(response => response.text())
        .then(message => {
          alert(message);
        });
    });
  
    // Stop the bot
    stopBotButton.addEventListener('click', () => {
      fetch('/api/bot/stop', {
        method: 'POST'
      })
        .then(response => response.text())
        .then(message => {
          alert(message);
        });
    });
  });
  