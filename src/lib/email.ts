import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM_EMAIL = process.env.SMTP_FROM_EMAIL;
const SMTP_FROM_NAME = process.env.SMTP_FROM_NAME || 'FlowFi';

if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_FROM_EMAIL) {
  throw new Error(
    'Missing SMTP configuration. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM_EMAIL.'
  );
}

if (SMTP_HOST.includes('@')) {
  throw new Error(
    'Invalid SMTP_HOST: expected a hostname like smtp.gmail.com, not an email address.'
  );
}

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT),
  secure: Number(SMTP_PORT) === 465,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

export async function sendVerificationEmail(email: string, verificationUrl: string, verificationCode: string) {
  const from = `${SMTP_FROM_NAME} <${SMTP_FROM_EMAIL}>`;

  // Log verification URL for debugging (only logs server-side; not exposed to users)
  console.info(
    `Verification URL for ${email}: ${verificationUrl} (code: ${verificationCode})`
  );

  const subject = 'Verify your FlowFi email address';
  const text = `Please verify your email by clicking the following link:\n\n${verificationUrl}\n\nYour verification code is: ${verificationCode}\n\nIf you did not create this account, you can ignore this message.`;
  const html = `
    <div style="font-family: system-ui, sans-serif; line-height: 1.5; color: #111;">
      <h1 style="color: #047857;">Verify your FlowFi email address</h1>
      <p>Thanks for signing up. To complete your registration, click the button below:</p>
      <p style="margin: 24px 0;"><a href="${verificationUrl}" style="display: inline-block; padding: 14px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 8px;">Verify email</a></p>
      <p>Your verification code is: <strong>${verificationCode}</strong></p>
      <p>If the button does not work, copy and paste this link into your browser:</p>
      <p><a href="${verificationUrl}" style="color: #047857;">${verificationUrl}</a></p>
      <p>If you did not sign up, you can safely ignore this email.</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from,
      to: email,
      subject,
      text,
      html,
    });
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw new Error('Unable to send verification email. Please check SMTP settings.');
  }
}
