/* eslint-disable max-len */
/* eslint-disable no-useless-escape */

// Função que recebe um texto de um bloco P.J. e extrai informações úteis
function parseBlocoPJ(textoOriginal) {
  // Substitui todas as quebras de linha por espaço para facilitar a leitura com regex
  const texto = textoOriginal.replace(/\n/g, ' ');

  // Captura o número do precatório no formato P.J. No 2022.12345-6
  const numeroMatch = texto.match(/P\.J\.\s+No\s+(\d{4}\.\d{5}-\d)/);

  // Captura a parte do texto que vai de "Advogado" até o final do "PROCURADOR: ... (OAB/...)"
  const partesMatch = texto.match(/Advogado.*?PROCURADOR:.*?\(OAB\/[^)]+\)/s);

  // Captura o texto restante que aparece após o "PROCURADOR: ... (OAB/xxx)" ou "(CNPJ/xxx)"
  const restanteRaw = texto.match(/PROCURADOR:.*?\((?:OAB|CNPJ)\/[^)]*\)*\)*\s*(.*)/s);

  // Se a captura deu certo, pega o grupo 1 (conteúdo após o procurador); caso contrário, retorna null
  let restanteTexto = restanteRaw?.[1]?.trim() || null;

  // Lista de palavras que indicam o fim do conteúdo útil do bloco (rodapés administrativos)
  const palavrasChave = [
    'P.A.',
    'DEPJU - SERVIÇOS',
    'Secretaria-Geral de Contratos e Licitações',
    'DEPJU - DEPARTAMENTO DE PRECATORIOS JUDICIAIS',
  ];

  // Se o restanteTexto foi encontrado
  if (restanteTexto) {
    // Inicializa com o tamanho total do texto (usado para encontrar o menor índice entre os marcadores)
    let menorIndice = restanteTexto.length;

    // Percorre cada palavra-chave de corte
    for (const palavra of palavrasChave) {
      // Procura a posição da palavra dentro do texto
      const idx = restanteTexto.indexOf(palavra);

      // Se a palavra foi encontrada e aparece antes do que qualquer outra já encontrada
      if (idx !== -1 && idx < menorIndice) {
        // Atualiza o menor índice
        menorIndice = idx;
      }
    }

    // Se encontrou algum marcador e ele não está no final do texto
    if (menorIndice < restanteTexto.length) {
      // Corta o texto até o ponto do marcador encontrado
      restanteTexto = restanteTexto.slice(0, menorIndice).trim();
    }
  }

  // Retorna os dados estruturados extraídos do bloco
  return {
    numero: numeroMatch?.[1]?.trim() || null, // Número do precatório, se encontrado
    partes: partesMatch?.[0]?.trim() || null, // Trecho com advogado e procurador
    texto: restanteTexto, // Texto restante limpo
  };
}

// Exporta a função para ser usada em outros arquivos
module.exports = { parseBlocoPJ };
