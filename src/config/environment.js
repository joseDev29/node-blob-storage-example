if (process.env.NODE_ENV === 'development') {
  const dotenv = require('dotenv')
  dotenv.config()
}

module.exports = {
  server: {
    port: process.env.PORT || 4398,
  },
  azureStorage: {
    accountName: process.env.AZURE_STORAGE_ACCOUNT,
    containerName: process.env.AZURE_STORAGE_CONTAINER_NAME,
  },
}
