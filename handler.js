const axios = require('axios');
const nodemailer = require('nodemailer');

const getClue = async () => {
  const clue = await axios.get('http://jservice.io/api/random');

  const text = `${clue.data[0].category.title.toUpperCase()}\n${
    clue.data[0].question
  }`;

  if (text.length > 160) {
    return getClue();
  }

  return clue.data[0];
};

module.exports.jText = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = true;

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.mail.com',
      port: 465,
      service: 'mail.com',
      auth: {
        user: process.env.MAIL_DOT_COM_EMAIL,
        pass: process.env.MAIL_DOT_COM_PW
      }
    });

    const clue = await getClue();

    const mailOptions = {
      from: process.env.MAIL_DOT_COM_EMAIL,
      to: process.env.PHONE_EMAIL,
      text: `${clue.category.title.toUpperCase()}\n${
        clue.question
      }`
    };

    await new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return reject(error);
        }
        return resolve(`Email sent: ${info.response}`);
      });
    });

    const answer = async () => {
      const answerMailOptions = {
        from: process.env.MAIL_DOT_COM_EMAIL,
        to: process.env.PHONE_EMAIL,
        text: clue.answer
      };

      const answerEmail = await new Promise((resolve, reject) => {
        transporter.sendMail(answerMailOptions, (error, info) => {
          if (error) {
            return reject(error);
          }
          return resolve(`Email sent: ${info.response}`);
        });
      });

      return answerEmail;
    };

    const awaitTimeout = (fn) => new Promise((resolve) => {
      setTimeout(() => resolve(fn()), 180000);
    });

    return await awaitTimeout(answer);
  } catch (err) {
    return err;
  }
};
