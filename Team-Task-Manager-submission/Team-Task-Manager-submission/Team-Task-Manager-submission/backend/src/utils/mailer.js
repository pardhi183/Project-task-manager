import nodemailer from 'nodemailer';
import dns from 'dns';

const lookupIPv4 = (hostname, options, callback) => {
  dns.lookup(hostname, { ...options, family: 4 }, callback);
};

const appName = 'Team Task Manager';

const buildOtpEmail = (otp) => ({
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

const sendWithResend = async ({ from, to, otp }) => {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from,
      to,
      ...buildOtpEmail(otp)
    })
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || 'Email API failed to send OTP');
  }
};

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
    lookup: lookupIPv4,
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

  if (process.env.RESEND_API_KEY) {
    await sendWithResend({ from, to, otp });
    return;
  }

  await getTransport().sendMail({ from, to, ...buildOtpEmail(otp) });
};
