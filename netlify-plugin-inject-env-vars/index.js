module.exports = {
  onPostBuild: ({ utils }) => {
    console.log('Creating runtime config.js with environment variables');
    
    const fs = require('fs');
    const path = require('path');
    
    // Create the config content with environment variables
    const configContent = `window.appConfig = {
  apiUrl: '${process.env.API_URL || "https://wavesend-api.tryordira.com/api/v1"}',
  keycloak: {
    url: '${process.env.KEYCLOAK_URL || "https://auth.wavesend.cc"}',
    realm: '${process.env.KEYCLOAK_REALM || "wavesend"}',
    clientId: '${process.env.KEYCLOAK_CLIENT_ID || "wavesend-frontend"}'
  }
};`;
    
    // Ensure the assets directory exists
    const configDir = path.join(process.cwd(), 'dist/money-transfer/assets/config');
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    // Write to the build output directory
    const configPath = path.join(configDir, 'config.js');
    fs.writeFileSync(configPath, configContent);
    
    console.log('Runtime config.js created successfully at', configPath);
  }
};
