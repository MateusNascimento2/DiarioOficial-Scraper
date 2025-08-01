/* eslint-disable camelcase */
const db = require('./db');

function formatarDataParaBD(data) {
  const [dia, mes, ano] = data.split('/');
  return `${ano}-${mes}-${dia}`;
}

async function adicionarPublicacoes(precatorio, advogados, texto_publicacao, data_diario) {
  const dataFormatada = formatarDataParaBD(data_diario);

  try {
    await db.query(`
      INSERT INTO publicacoes_diario (precatorio, advogados, texto_publicacao, data_diario)
      VALUES (?, ?, ?, ?)
    `, [precatorio, advogados, texto_publicacao, dataFormatada]);

    console.log('✅ Publicação inserida com sucesso.');
  } catch (error) {
    console.error('❌ Erro ao inserir publicação:', error);
  }
}

async function buscarCessoes() {
  const query = `
    SELECT
      c.id,
      c.precatorio,
      c.cedente,
      c.ano,
      c.data_cessao,
      c.substatus,
      o.apelido AS ente,
      s.nome AS status,
      s.extra AS corStatus,
      n.nome AS natureza,
      e.nome AS empresa,
      es.nome AS escrevente,
      adv.nome AS anuencia_advogado,
      f.nome AS falecido
    FROM cessoes c
    LEFT JOIN status s ON s.id = c.status
    LEFT JOIN orcamentos o ON o.id = c.ente_id
    LEFT JOIN natureza n ON n.id = c.natureza
    LEFT JOIN empresas e ON e.id = c.empresa_id
    LEFT JOIN escreventes es ON es.id = c.escrevente_id
    LEFT JOIN adv adv ON adv.ordem = c.adv
    LEFT JOIN falecido f ON f.ordem = c.falecido
  `;

  const rows = await db.query(query);
  return rows;
}

module.exports = {
  buscarCessoes,
  adicionarPublicacoes,
};
