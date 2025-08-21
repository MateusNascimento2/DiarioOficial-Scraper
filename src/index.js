/* eslint-disable max-len */
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');

dayjs.extend(customParseFormat);
const { processarPDF } = require('./controllers/processaPDFController');
const { baixarPDF } = require('./controllers/baixarController');
const { buscarCessoes, adicionarPublicacoes } = require('./database/cessaoRepository');
const { enviarEmailPublicacoes, enviarEmail0Publicacoes } = require('./services/emailService');

function getProximaDataUtil(simuladoHoje = '21/08/2025') {
  const hoje = dayjs(simuladoHoje, 'DD/MM/YYYY');
  // const hoje = dayjs();
  // console.log(hoje);
  // let proxima = hoje.add(1, 'day');
  let proxima = hoje.add(0, 'day');

  // Se cair sábado (6), pula dois dias para segunda
  if (proxima.day() === 6) {
    proxima = proxima.add(2, 'day');
  }

  // Se cair domingo (0), pula um dia para segunda
  if (proxima.day() === 0) {
    proxima = proxima.add(1, 'day');
  }

  return proxima.format('DD/MM/YYYY');
}

(async () => {
  try {
    // 1. Baixar o PDF
    const data = getProximaDataUtil();
    const filePath = await baixarPDF({ data, caderno: 'A' });
    console.log('PDF salvo em:', filePath);

    // 2. Processar o PDF
    const publicacoesDiario = await processarPDF(filePath);

    // 3. Adiciona todas as publicações em um DB
    /*     for (const publicacao of publicacoesDiario) {
      await adicionarPublicacoes(
        publicacao.numero,
        publicacao.partes,
        publicacao.texto,
        data,
      );
    } */

    const cessoes = await buscarCessoes();

    // 4. Acha todas as cessões que correspondem com as cessões já existentes no BD
    const matchedPublicacoes = publicacoesDiario
      .map((publicacao) => {
        const cessao = cessoes.find((c) => c.precatorio === publicacao.numero);
        if (!cessao) return null;

        return {
          precatorioPublicacao: publicacao.numero,
          advogadosPublicacao: publicacao.partes,
          textoPublicacao: publicacao.texto,

          id: cessao.id,
          cedente: cessao.cedente,
          ano: cessao.ano,
          data_cessao: cessao.data_cessao,
          substatus: cessao.substatus,
          ente: cessao.ente,
          status: cessao.status,
          corStatus: cessao.corStatus,
          natureza: cessao.natureza,
          empresa: cessao.empresa,
          escrevente: cessao.escrevente,
          anuencia_advogado: cessao.anuencia_advogado,
          falecido: cessao.falecido,
        };
      })
      .filter(Boolean);

    // 5. Se tiver publicações envia um email com o corpo contendo as publicações, se não, envia um email contendo um corpo com 'Nenhum resultado com os filtros escolhidos'
    if (matchedPublicacoes.length > 0) {
      await enviarEmailPublicacoes(matchedPublicacoes, matchedPublicacoes.length, data);
    } else {
      await enviarEmail0Publicacoes(data);
    }
  } catch (err) {
    console.error('Erro:', err);
  }
})();
