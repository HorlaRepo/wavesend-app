module.exports = {
    onPostBuild: ({ utils }) => {
      console.log('Creating runtime config.js with environment variables');
      
      const fs = require('fs');
      const path = require('path');
      
      // Create the config content with environment variables
      const configContent = `window.appConfig = {
    apiUrl: '${process.env.API_URL || "https://api.wavesend.cc"}',
    keycloak: {
      url: '${process.env.KEYCLOAK_URL || "https://auth.wavesend.com"}',
      realm: '${process.env.KEYCLOAK_REALM || "wavesend"}',
      clientId: '${process.env.KEYCLOAK_CLIENT_ID || "wavesend-frontend"}'
    }
  };`;
      
      // Write to the build output directory
      const configPath = path.join(__dirname, 'dist/money-transfer/assets/config.js');
      fs.writeFileSync(configPath, configContent);
      
      console.log('Runtime config.js created successfully');
    }
  };