/* eslint-disable max-len */
/* eslint-disable no-plusplus */
const fs = require('fs');
const pdfParse = require('pdf-parse');

// Função que extrai blocos de texto que contêm "P.J." de um PDF.
async function extrairBlocosPJ(pathDoPDF) {
  const buffer = fs.readFileSync(pathDoPDF);
  const { text } = await pdfParse(buffer);

  // Substitui quebras de linha \r\n por "\n \n" para preservar espaçamento e facilitar leitura de blocos
  const texto = text.replace(/\r\n/g, '\n \n');
  // Expressão regular que procura por ocorrências do tipo: "P.J. No 2021.12345-9"
  const regexPJ = /P\.J\.\s+No\s+\d{4}\.\d{5}-\d/g;
  // Executa a regex sobre o texto e armazena os índices onde ocorrem as correspondências
  const indices = [...texto.matchAll(regexPJ)].map((match) => match.index);

  // Lista de expressões que sinalizam o fim dos blocos, usada para cortar o texto final corretamente
  const marcadoresDeFim = [
    'P.A.',
    'DEPJU - SERVIÇOS',
    'Secretaria-Geral de Contratos e Licitações',
    'DEPJU - DEPARTAMENTO DE PRECATORIOS JUDICIAIS',
  ];

  // Array onde serão armazenados os blocos de texto extraídos
  const blocos = [];

  // Percorre os índices encontrados para extrair os blocos entre eles
  for (let i = 0; i < indices.length; i++) {
    const inicio = indices[i]; // Início do bloco atual (posição da ocorrência de P.J.)
    const fim = indices[i + 1] || texto.length; // Fim do bloco (ou o fim do texto, se for o último)
    const bloco = texto.slice(inicio, fim).trim(); // Extrai o texto entre as posições e remove espaços extras
    blocos.push(bloco); // Adiciona o bloco ao array final
  }

  // Verifica se há blocos e aplica um corte no último bloco, se necessário
  if (blocos.length > 0) {
    let ultimo = blocos[blocos.length - 1]; // Pega o último bloco adicionado

    // Procura pelos marcadores de fim e corta o bloco a partir do primeiro marcador encontrado (se ele estiver depois de 200 caracteres)
    for (const marcador of marcadoresDeFim) {
      const pos = ultimo.indexOf(marcador); // Procura a posição do marcador
      if (pos !== -1 && pos > 200) {
        ultimo = ultimo.slice(0, pos).trim(); // Corta o texto até o marcador e remove espaços
        break; // Para de procurar após o primeiro marcador encontrado
      }
    }

    // Atualiza o último bloco no array com a versão cortada
    blocos[blocos.length - 1] = ultimo;
  }

  return blocos;
}

module.exports = { extrairBlocosPJ };
