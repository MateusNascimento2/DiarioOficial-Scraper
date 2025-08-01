require('dotenv').config({ path: '../.env' });
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const templatePath = path.join(__dirname, '../utils/emailTemplate.html');
const template = fs.readFileSync(templatePath, 'utf8');

function preencherTemplate(base, item, data) {
  return base
    .replace(/{precatorioPublicacao}/g, item.precatorioPublicacao || '')
    .replace(/{id}/g, item.id || '')
    .replace(/{cedente}/g, item.cedente || '')
    .replace(/{corStatus}/g, item.corStatus || '#e1e3ea')
    .replace(/{status}/g, item.status || '')
    .replace(/{falecido}/g, item.falecido || '')
    .replace(/{anuencia_advogado}/g, item.anuencia_advogado || '')
    .replace(/{ente}/g, item.ente || '')
    .replace(/{ano}/g, item.ano || '')
    .replace(/{natureza}/g, item.natureza || '')
    .replace(/{data_cessao}/g, item.data_cessao || '')
    .replace(/{empresa}/g, item.empresa || '')
    .replace(/{escrevente}/g, item.escrevente || '')
    .replace(/{advogadosPublicacao}/g, item.advogadosPublicacao || '')
    .replace(/{textoPublicacao}/g, item.textoPublicacao || '')
    .replace(/{data}/g, data);
}

async function enviarEmailPublicacoes(lista, qtdCessoes, data) {
  const corpoHtml = lista.map((item) => preencherTemplate(template, item, data)).join('<br/>');

  const transporter = nodemailer.createTransport({
    host: process.env.HOST_EMAIL,
    port: process.env.PORT_EMAIL,
    secure: false,
    auth: {
      user: process.env.USER_EMAIL,
      pass: process.env.PASSWORD_EMAIL,
    },
    tls: {
      minVersion: 'TLSv1.2',
      rejectUnauthorized: false,
    },
  });

  const usersEmails = process.env.USERS_EMAILS.split(',');

  await transporter.sendMail({
    from: '"Robô Diário Oficial" <diariooficialrobo@precsys.app.br>',
    to: usersEmails,
    subject: `Diário Oficial: Administrativo ${data} | Quantidade de Publicacões: ${qtdCessoes}`,
    html: corpoHtml,
  });

  console.log('E-mail enviado com sucesso.');
}

async function enviarEmail0Publicacoes(data) {
  const transporter = nodemailer.createTransport({
    host: process.env.HOST_EMAIL,
    port: process.env.PORT_EMAIL,
    secure: false,
    auth: {
      user: process.env.USER_EMAIL,
      pass: process.env.PASSWORD_EMAIL,
    },
    tls: {
      minVersion: 'TLSv1.2',
      rejectUnauthorized: false,
    },
  });

  const usersEmails = process.env.USERS_EMAILS.split(',');

  await transporter.sendMail({
    from: '"Robô Diário Oficial" <diariooficialrobo@precsys.app.br>',
    to: usersEmails,
    subject: `Diário Oficial: Administrativo ${data} | Quantidade de Publicacões: 0`,
    html: `
        <!DOCTYPE html>
          <html lang="en">

          <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
          </head>

          <body
            style="background-color:#f5f8fa; font-family:Verdana, Geneva, Tahoma, sans-serif; padding-top:2rem; padding-bottom:1rem;">
            <div style=" background-color: white; border-radius: 15px; margin:0 auto; max-width:800px; padding: 1rem">
              <div style="padding: 1rem;">
                <h2 style="margin: 0px; color:#181c32; font-size: 1.2rem;">Nenhum resultado com os filtros escolhidos</h2>
              </div>
            </div>
          </body>

          </html>
          `,
  });
}

module.exports = { enviarEmailPublicacoes, enviarEmail0Publicacoes };
