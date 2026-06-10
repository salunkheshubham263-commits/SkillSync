const nodeMailer = require("nodemailer");
const config = require("../config/config");

const transpoter = nodeMailer.createTransport({
    service: "gmail",
    auth: {
        type: "OAUTH2",
        user: config.google_user,
        clientId: config.google_client_id,
        clientSecret: config.google_client_secret,
        refreshToken: config.google_refresh_token
    }
});

transpoter.verify((error, success)=> {  
    if (error) {
        console.error("Error connecting to email server: ", error);
    }else{
        console.log("Email server is ready to send messages");
    }
});

const sendEmail = async (to, subject, text, html) => {
    try {
        const info = await transpoter.sendMail({
            from: `"Your Name" <${config.google_user}>`,
            to,
            subject,
            text,
            html,
        });

        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodeMailer.getTestMessageUrl(info));
    } catch (err) {
        console.error("Error sending email:", err);
    }
};

module.exports = sendEmail;