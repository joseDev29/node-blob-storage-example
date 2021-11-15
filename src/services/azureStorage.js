const azurestorageService = require("azure-storage");

const blobservice = azurestorageService.createBlobService();

module.exports = {
  blobservice,
};
