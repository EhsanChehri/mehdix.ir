// Mail OP upon reply.
"use strict";
const nodemailer = require('nodemailer');
const request = require('request-promise-native');

exports.handler = async function(event, context) {
  try {
    const body = await main(event, context);
    return { statusCode: 200, body };
  } catch (err) {
    return { statusCode: 500, body: err.toString() };
  }
};

// async..await is not allowed in global scope, must use a wrapper
async function main(event, context){
  console.log('Event:', event);
  body = JSON.parse(event.body);

  if(!event.data['reply-to']){
    return Promise.resolve('Not a reply.');
  }

  let opEmail = await getOPEmail(event.data['reply-to'])
  console.log('OP Email:', opEmail);

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: 'smtp.mailgun.org',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_HOST,
      pass: process.env.SMTP_PASS
    }
  });

  let replyLink = event.site_url + event.data.page_id + ".html#" + event.id;

  let txt = `${event.name} به دیدگاهت رو سایت مهدیکس [جواب](${replyLink}) داد:

    ${event.body}`;

  let html = `<div dir="rtl">
    <p>${event.name} به دیدگاهت رو سایت مهدیکس <a href="${replyLink}">جواب</a> داد:</p>
    <blockquote><pre>${event.body}</pre></blockquoe></div>`;

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: 'mehdix.ir 👻🐶 <noreply@mehdix.ir>',
    to: opEmail,
    subject: `${event.name} جواب داد ✔`,
    text: txt,
    html: html
  });

  return Promise.resolve(`Message sent: ${info.messageId}`);
}

async function getOPEmail(replyToId){
  let options = {
    uri: (
      `https://api.netlify.com/api/v1/sites/${process.env.NETLIFY_SITE_ID}` +
      `/forms/${process.env.NETLIFY_FORM_ID}/submissions/${replyToId}`),
    qs: {
      access_token: process.env.NETLIFY_ACCESS_TOKEN
    },
    json: true
  }

  return Promise.resolve(
    request(options)
      .then((submission)=>{
        return submission.email
      })
      .catch((err)=>{
        console.log(err)
      })
    );
}
