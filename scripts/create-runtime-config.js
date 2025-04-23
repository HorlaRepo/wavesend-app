const fs = require('fs');
const path = require('path');

console.log('Creating runtime config.js with environment variables');
console.log('Environment variables:');
console.log('KEYCLOAK_URL:', process.env.KEYCLOAK_URL);
console.log('KEYCLOAK_REALM:', process.env.KEYCLOAK_REALM);
console.log('KEYCLOAK_CLIENT_ID:', process.env.KEYCLOAK_CLIENT_ID);
console.log('API_URL:', process.env.API_URL);

// Create the config content with environment variables
const configContent = `window.appConfig = {
  apiUrl: '${process.env.API_URL || "https://api.wavesend.com"}',
  keycloak: {
    url: '${process.env.KEYCLOAK_URL || "https://auth.wavesend.cc"}',
    realm: '${process.env.KEYCLOAK_REALM || "wavesend"}',
    clientId: '${process.env.KEYCLOAK_CLIENT_ID || "wavesend-frontend"}'
  }
};`;

// Determine the directory structure
const distDir = path.join(process.cwd(), 'dist/money-transfer');
const assetsDir = path.join(distDir, 'assets');
const configDir = path.join(assetsDir, 'config');

// Ensure the assets and config directories exist
if (!fs.existsSync(assetsDir)) {
  console.log('Creating assets directory');
  fs.mkdirSync(assetsDir, { recursive: true });
}

if (!fs.existsSync(configDir)) {
  console.log('Creating config directory');
  fs.mkdirSync(configDir, { recursive: true });
}

// Write to the build output directory
const configPath = path.join(configDir, 'config.js');
fs.writeFileSync(configPath, configContent);

console.log('Runtime config.js created successfully at', configPath);
console.log('Content:', configContent);