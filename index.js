const express = require('express');
const cors =  require('cors');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const Mailgen = require('mailgen');

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());
app.disable('x-power-by');


const port = process.env.PORT || 8080;

/** HTTP GET Request */
app.get('/', (req, res) => {
    res.status(201).json("Health Check PASS");
});



// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {
        user: process.env.USER, // generated mailtrap user
        pass: process.env.PASSWORD, // generated mailtrap password
    }
});

// generate email body using Mailgen
let MailGenerator = new Mailgen({
    theme: "default",
    product : {
        name: "Test Email",
        link: 'https://mailgen.js/'
    }
})

// define a route for sending emails
app.post('/send-email', (req, res) => {
    // get the recipient's email address, name and message from the request body
    const { to, name, message } = req.body;

    // body of the email
    const email = {
        body : {
            name: name,
            intro : message || 'Welcome to Test Mail! We\'re very excited to have you on board.',
            outro: 'Our Solid wood doors are made to suit your home, we have a wide variety of classic doors'
        }
    }

    const emailBody = MailGenerator.generate(email);

    // send mail with defined transport object
    const mailOptions = {
        from: process.env.EMAIL,
        to: to,
        subject: 'Test Email',
        html: emailBody
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.status(500).send('Error sending email');
        } else {
            console.log('Email sent: ' + info.response);
            res.send('Email sent successfully');
        }
    });
});

// start the server
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});