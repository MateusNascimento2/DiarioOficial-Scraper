Sistema automatizado para **download**, **processamento** e **análise de publicações judiciais (P.J.)** no Diário Oficial do Estado do RJ. O projeto identifica publicações de precatórios e cruza com uma base interna de cessões, notificando os responsáveis por e-mail sempre que houver correspondência.

---

## 🚀 Funcionalidades

- 📥 Baixa automaticamente o PDF do Diário Oficial (Caderno A)
- 🔍 Extrai blocos iniciados por `P.J. No ####.#####-#`
- 🧠 Faz parsing do conteúdo: número, advogado, procurador e observações
- 🗃️ Salva publicações no banco de dados
- 🔗 Compara precatórios encontrados com as cessões cadastradas
- 📧 Envia e-mails com as correspondências ou aviso de ausência de publicações

---

## 🧱 Tecnologias utilizadas

- [Node.js](https://nodejs.org)
- [pdf-parse](https://www.npmjs.com/package/pdf-parse)
- [dayjs](https://day.js.org/)
- [nodemailer](https://nodemailer.com/)
- [MySQL](https://www.mysql.com/)

