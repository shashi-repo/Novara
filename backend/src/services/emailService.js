const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    }
});

const sendOTPEmail = async (email, otp) => {
    await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject: "Verify your Novara account",
        html: `
            <div style="font-family: Arial, sans-serif;">
                <h2>Welcome to Novara</h2>

                <p>Your email verification OTP is:</p>

                <h1>${otp}</h1>

                <p>This OTP will expire in 10 minutes.</p>

                <p>If you did not create a Novara account,
                you can safely ignore this email.</p>
            </div>
        `
    });
};

module.exports = {
    sendOTPEmail
};