/* eslint-disable no-useless-escape */
/* eslint-disable no-return-await */
/* eslint-disable no-promise-executor-return */
const axios = require('axios');

/**
 * Aguarda até que o PDF esteja realmente disponível no TJRJ.
 */
async function fetchPDFStream({ data, caderno, pagina = '-1' }) {
  const url = `https://www3.tjrj.jus.br/consultadje/pdf.aspx?dtPub=${data}&caderno=${caderno}&pagina=${pagina}`;

  const tentarBaixarDoTemp = async (pdfUrl, tentativa = 1) => {
    try {
      console.log(`Tentando baixar do temp (tentativa ${tentativa}): ${pdfUrl}`);

      const pdfResp = await axios.get(pdfUrl, {
        responseType: 'arraybuffer',
        headers: { 'User-Agent': 'Mozilla/5.0' },
        validateStatus: () => true, // não estourar exceção em 404
      });

      if (pdfResp.status === 404) {
        console.log('Ainda não gerou o PDF (404). Tentando novamente em 5s...');
        await new Promise((res) => setTimeout(res, 5000));
        return tentarBaixarDoTemp(pdfUrl, tentativa + 1);
      }

      const buf = Buffer.from(pdfResp.data);
      const inicio = buf.toString('utf8', 0, 4);

      if (!inicio.startsWith('%PDF')) {
        console.log('Resposta não parece PDF. Tentando novamente em 5s...');
        await new Promise((res) => setTimeout(res, 5000));
        return tentarBaixarDoTemp(pdfUrl, tentativa + 1);
      }

      console.log('PDF válido encontrado!');
      return buf;
    } catch (err) {
      console.log(`Erro ao baixar do temp: ${err.message}. Tentando novamente em 5s...`);
      await new Promise((res) => setTimeout(res, 5000));
      return tentarBaixarDoTemp(pdfUrl, tentativa + 1);
    }
  };

  const tentarBaixarPDF = async (tentativa = 1) => {
    try {
      console.log(`Tentativa ${tentativa}: acessando ${url}...`);

      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });

      const buf = Buffer.from(response.data);
      const inicio = buf.toString('utf8', 0, 4);

      // Se já for PDF direto
      if (inicio.startsWith('%PDF')) {
        console.log('PDF válido encontrado direto no pdf.aspx!');
        return buf;
      }

      // Caso contrário: extrair o link do /temp/
      const html = buf.toString('utf8');
      const match = html.match(/filename=(\/consultadje\/temp\/[^\"]+\.pdf)/);

      if (!match) {
        console.log('Nenhum filename encontrado no HTML. Tentando novamente em 10s...');
        await new Promise((res) => setTimeout(res, 10000));
        return tentarBaixarPDF(tentativa + 1);
      }

      const pdfUrl = `https://www3.tjrj.jus.br${match[1]}`;
      console.log('URL real do PDF encontrada:', pdfUrl);

      return await tentarBaixarDoTemp(pdfUrl);
    } catch (err) {
      console.log(`Erro ao tentar acessar pdf.aspx: ${err.message}. Nova tentativa em 10s...`);
      await new Promise((res) => setTimeout(res, 10000));
      return tentarBaixarPDF(tentativa + 1);
    }
  };

  return await tentarBaixarPDF();
}

module.exports = { fetchPDFStream };
