const nodemailer = require('nodemailer');
require('dotenv').config();
const senderEmail = async (content, receiver, subject) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SENDER_BREVO_EMAIL,
        pass: process.env.SENDER_BREVO_PASSWORD,
      },
    });

    // send mail with defined transport object
    const info = await transporter.sendMail({
      from: process.env.SENDER_BREVO_EMAIL, // sender address
      to: receiver,
      subject,
      html: content,
    });
    return info;
  } catch (error) {
    return error;
  }
};

module.exports = senderEmail;
