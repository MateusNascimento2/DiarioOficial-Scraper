const { extrairBlocosPJ } = require('../services/pdfParserService');
const { parseBlocoPJ } = require('../parsers/blocoPJParser');

async function processarPDF(pathPDF) {
  const blocos = await extrairBlocosPJ(pathPDF);
  const blocosFormatados = blocos.map(parseBlocoPJ);
  return blocosFormatados;
}

module.exports = { processarPDF };
