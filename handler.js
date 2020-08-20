const axios = require('axios');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.mail.com',
  port: 465,
  service: 'mail.com',
  auth: {
    user: process.env.MAIL_DOT_COM_EMAIL,
    pass: process.env.MAIL_DOT_COM_PW
  }
});

module.exports.jText = async (event) => {
  const response = await axios.get('http://jservice.io/api/random');

  const mailOptions = {
    from: process.env.MAIL_DOT_COM_EMAIL,
    to: process.env.PHONE_EMAIL,
    text: `\nCategory: ${response.data[0].category.title.toUpperCase()}\nClue: ${
      response.data[0].question
    }`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log(`Email sent: ${info.response}`);
    }
  });

  function answer() {
    const answerMailOptions = {
      from: process.env.MAIL_DOT_COM_EMAIL,
      to: process.env.PHONE_EMAIL,
      text: response.data[0].answer
    };

    transporter.sendMail(answerMailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log(`Email sent: ${info.response}`);
      }
    });
  }

  setTimeout(answer, 180000);
};
