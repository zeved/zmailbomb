const nodeMailer = require('nodemailer');

const SMTP_CONFIG = {
  host: '192.168.8.3',        // replace with your email server
  port: 2500,                 // replace with your SMTP port
  secure: false,
  auth: {
    user: 'ion@192.168.8.3',
    pass: 'password'        
  },
  tls: {
    rejectUnauthorized: false
  }
};

const FROM_EMAIL = 'fromaddress@domain.com'
const DELAY_BETWEEN_EMAILS = 1;
const EMAILS_PER_BATCH = 10;
const DELAY_BETWEEN_BATCHES = 30;

var transporter;

var mailingList = [], emailIndex = 0;

// array with email addresses and subject + content
mailingList = [
  {
    email: 'ion@192.168.8.3',
    subject: 'test',
    content: 'test'
  },
];

function ZMailBomb(mailingList) {
  if(mailingList === undefined) {
    console.warn('[!] the mailing list is empty, nothing to do.')
    return;
  }

  var self = this;
  console.info('[i] ZMassMailer starting...');

  transporter = nodeMailer.createTransport(SMTP_CONFIG);
  transporter.verify((error) => {
    if(error) {
      console.error(`[-] ${error}`);
      return false;
    }
    else
      self.runBomb(mailingList);
  });
}



ZMailBomb.prototype.runBomb = function(mailingList) {
  console.info(`[i] running job ${emailIndex + 1} out of ${mailingList.length} -> ${mailingList[emailIndex].email}`);

  if((emailIndex > 0 && emailIndex % EMAILS_PER_BATCH == 0) && emailIndex < mailingList.length) {
    console.info(`[i] ${emailIndex + 1} / ${mailingList.length} done, waiting ${DELAY_BETWEEN_BATCHES} seconds...`);
    setTimeout(() => {
      emailIndex++;
      if(emailIndex < mailingList.length)
        this.runBomb(mailingList);
    }, DELAY_BETWEEN_BATCHES * 1000);
  }
  else {
    setTimeout(() => {
      if(mailingList[emailIndex] !== undefined) {
        sendMail(mailingList[emailIndex].email, mailingList[emailIndex].subject, mailingList[emailIndex].content);
        emailIndex++;
        if(emailIndex < mailingList.length)
          this.runBomb(mailingList);
      }
    }, DELAY_BETWEEN_EMAILS * 1000);
  }
}

  function sendMail(email, subject, content) {
  if(email !== undefined) {
    const mailOptions = {
      from: FROM_EMAIL,
      to: email,
      subject: subject,
      html: content
    };

    transporter.sendMail(mailOptions, (error) => {
      if(error)
        console.error(`[-] error sending email #${emailIndex} to ${mailingList[emailIndex].email}`);
    });
  }
}

var mailBomb = new ZMailBomb(mailingList);