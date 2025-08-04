// Script para upload automático para seu servidor
const fs = require('fs');
const path = require('path');

async function uploadToServer(apkPath) {
  // Upload para seu servidor via FTP/API
  console.log('Uploading APK to server...');
  
  // Exemplo com fetch para sua API
  const formData = new FormData();
  formData.append('apk', fs.createReadStream(apkPath));
  
  const response = await fetch('https://seu-servidor.com/api/upload', {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': `Bearer ${process.env.SERVER_TOKEN}`
    }
  });
  
  if (response.ok) {
    const result = await response.json();
    console.log('APK uploaded:', result.downloadUrl);
    return result.downloadUrl;
  }
  
  throw new Error('Upload failed');
}

module.exports = { uploadToServer };