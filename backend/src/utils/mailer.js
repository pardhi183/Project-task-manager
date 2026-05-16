import nodemailer from 'nodemailer';

const getTransport = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error('Email service is not configured. Add SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and EMAIL_FROM in Railway.');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    family: 4,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    tls: {
      servername: host
    }
  });
};

export const sendPasswordResetOtp = async ({ to, otp }) => {
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER;
  const appName = 'Team Task Manager';

  await getTransport().sendMail({
    from,
    to,
    subject: `${appName} password reset OTP`,
    text: `Your ${appName} password reset OTP is ${otp}. It expires in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #172026;">
        <h2>Password reset OTP</h2>
        <p>Use this OTP to reset your ${appName} password:</p>
        <p style="font-size: 28px; font-weight: 800; letter-spacing: 4px;">${otp}</p>
        <p>This OTP expires in 10 minutes. If you did not request it, ignore this email.</p>
      </div>
    `
  });
};
