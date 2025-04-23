module.exports = {
  onPostBuild: ({ utils }) => {
    console.log('Creating runtime config.js with environment variables');
    
    const fs = require('fs');
    const path = require('path');
    
    // Create the config content with environment variables
    const configContent = `window.appConfig = {
  apiUrl: '${process.env.API_URL || "https://api.wavesend.com"}',
  keycloak: {
    url: '${process.env.KEYCLOAK_URL || "https://auth.wavesend.com"}',
    realm: '${process.env.KEYCLOAK_REALM || "wavesend"}',
    clientId: '${process.env.KEYCLOAK_CLIENT_ID || "wavesend-frontend"}'
  }
};`;
    
    // Ensure the assets directory exists
    const assetsDir = path.join(process.cwd(), 'dist/money-transfer/assets');
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }
    
    // Write to the build output directory
    const configPath = path.join(process.cwd(), 'dist/money-transfer/assets/config.js');
    fs.writeFileSync(configPath, configContent);
    
    console.log('Runtime config.js created successfully at', configPath);
  }
};