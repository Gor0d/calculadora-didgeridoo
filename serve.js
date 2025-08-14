const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the build directory
app.use(express.static(path.join(__dirname, 'build')));

// Handle client-side routing by serving index.html for all routes
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'build', 'index.html');
  
  // Check if index.html exists
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Build not found. Please run "npm run build:web" first.');
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Calculadora Didgeridoo rodando em http://localhost:${port}`);
  console.log(`📱 Acesse no seu celular usando o IP da rede local na porta ${port}`);
  console.log(`💻 Para parar o servidor, pressione Ctrl+C`);
});