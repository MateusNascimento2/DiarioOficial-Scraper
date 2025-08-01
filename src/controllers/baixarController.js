const path = require('path');
const { fetchPDFStream } = require('../services/TJRJDownloader');
const { ensureFolderExists, saveBufferToFile } = require('../utils/fileUtils');

async function baixarPDF({ data, caderno }) {
  const buffer = await fetchPDFStream({ data, caderno });

  const dataFormatada = data.replace(/\//g, '-');
  const fileName = `I - Administrativo - ${dataFormatada}.pdf`;
  const pastaPDFs = path.join(__dirname, '..', 'pdfs');
  const filePath = path.join(pastaPDFs, fileName);

  ensureFolderExists(pastaPDFs);
  await saveBufferToFile(buffer, filePath);

  return filePath;
}

module.exports = { baixarPDF };
