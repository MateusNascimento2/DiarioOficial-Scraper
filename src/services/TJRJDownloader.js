/* eslint-disable no-return-await */
/* eslint-disable no-promise-executor-return */
const axios = require('axios');

/**
 * Aguarda até que o PDF esteja realmente disponível no TJRJ.
 */
async function fetchPDFStream({ data, caderno, pagina = '-1' }) {
  const url = `https://www3.tjrj.jus.br/consultadje/pdf.aspx?dtPub=${data}&caderno=${caderno}&pagina=${pagina}`;

  const tentarBaixarPDF = async (tentativa = 1) => {
    try {
      console.log(`Tentativa ${tentativa}: baixando PDF...`);

      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });

      const contentType = response.headers['content-type'];
      const inicio = Buffer.from(response.data).toString('utf8', 0, 4);

      const isPDF = contentType === 'application/pdf' && inicio === '%PDF';

      if (!isPDF) {
        console.log('PDF ainda indisponível. Tentando novamente em 10 segundos...');
        await new Promise((res) => setTimeout(res, 10000));
        return tentarBaixarPDF(tentativa + 1);
      }

      console.log('PDF válido encontrado!');
      return Buffer.from(response.data);
    } catch (err) {
      console.log(`Erro ao tentar baixar: ${err.message}. Nova tentativa em 10 segundos...`);
      await new Promise((res) => setTimeout(res, 10000));
      return tentarBaixarPDF(tentativa + 1);
    }
  };

  return await tentarBaixarPDF();
}

module.exports = { fetchPDFStream };
