const fs = require('fs');

function ensureFolderExists(folderPath) {
  if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });
}

function saveBufferToFile(buffer, filePath) {
  return fs.promises.writeFile(filePath, buffer);
}

module.exports = {
  ensureFolderExists,
  saveBufferToFile,
};
