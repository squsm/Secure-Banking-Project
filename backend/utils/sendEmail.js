const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
};

const sendOTPEmail = async (toEmail, fullName, otp) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"NovBank Security" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: `${otp} is your NovBank verification code`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body style="margin:0;padding:0;background:#0a0e1a;font-family:'Segoe UI',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0e1a;padding:40px 20px;">
            <tr>
              <td align="center">
                <table width="520" cellpadding="0" cellspacing="0"
                  style="background:#141c2e;border-radius:20px;border:1px solid #2d3748;overflow:hidden;">

                  <tr>
                    <td style="background:linear-gradient(135deg,#0d2a22,#0a1a2e);padding:32px;text-align:center;border-bottom:1px solid #1e293b;">
                      <p style="font-size:26px;margin:0;color:#00d4aa;font-weight:900;letter-spacing:-1px;">◈ NovBank</p>
                      <p style="color:#8899bb;font-size:13px;margin:8px 0 0;">Security Verification</p>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:36px 40px;">
                      <p style="color:#f0f4ff;font-size:18px;font-weight:600;margin:0 0 8px;">
                        Hi ${fullName} 👋
                      </p>
                      <p style="color:#8899bb;font-size:14px;line-height:1.6;margin:0 0 28px;">
                        You're almost there! Use the code below to verify your email address
                        and activate your NovBank account.
                      </p>

                      <div style="background:#0a0e1a;border:2px solid #00d4aa;border-radius:14px;
                                  padding:28px;text-align:center;margin-bottom:28px;">
                        <p style="color:#8899bb;font-size:12px;letter-spacing:0.1em;
                                  text-transform:uppercase;margin:0 0 12px;">
                          Your Verification Code
                        </p>
                        <p style="color:#00d4aa;font-size:42px;font-weight:900;
                                  letter-spacing:14px;margin:0;font-family:monospace;">
                          ${otp}
                        </p>
                        <p style="color:#4a5568;font-size:12px;margin:12px 0 0;">
                          Expires in ${process.env.OTP_EXPIRE_MINUTES || 10} minutes
                        </p>
                      </div>

                      <p style="color:#4a5568;font-size:13px;line-height:1.6;margin:0;">
                        If you didn't create a NovBank account, you can safely ignore this email.
                        Never share this code with anyone.
                      </p>
                    </td>
                  </tr>

                  <tr>
                    <td style="background:#0f1520;padding:20px 40px;border-top:1px solid #1e293b;text-align:center;">
                      <p style="color:#4a5568;font-size:12px;margin:0;">
                        © 2024 NovBank · This is an automated security email
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOTPEmail };