export const sendSmsMessage = async ({ to, message }) => {
  if (process.env.SMS_API_URL && process.env.SMS_API_KEY) {
    const response = await fetch(process.env.SMS_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.SMS_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ to, message })
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || 'SMS service failed to send message');
    }

    return { delivered: true };
  }

  return { delivered: false, message };
};

export const sendPasswordResetSmsOtp = async ({ to, otp }) => {
  const message = `Your Team Task Manager password reset OTP is ${otp}. It expires in 10 minutes.`;

  if (process.env.SMS_API_URL && process.env.SMS_API_KEY) {
    const response = await fetch(process.env.SMS_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.SMS_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ to, message, otp })
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || 'SMS service failed to send OTP');
    }

    return { delivered: true };
  }

  return { delivered: false, otp };
};

export const sendApprovalSms = ({ to }) => sendSmsMessage({
  to,
  message: 'Team Task Manager: your login credentials are approved. You can login now.'
});
