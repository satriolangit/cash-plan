import { randomBytes } from "crypto";

export function generateToken(length = 32): string {
  return randomBytes(length).toString("hex");
}

// Note: Email sending implementation depends on provider choice (Resend, Nodemailer, etc.)
// For now, we log the reset URL. In production, replace with actual email sending.
export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string
): Promise<void> {
  console.log("─── Password Reset Email ───");
  console.log(`To: ${email}`);
  console.log(`URL: ${resetUrl}`);
  console.log("────────────────────────────");

  // TODO: Implement with Resend, Nodemailer, or SES
  // const { data, error } = await resend.emails.send({
  //   from: "Family Wallet <noreply@your-domain.com>",
  //   to: [email],
  //   subject: "Reset Your Password",
  //   html: `<p>Click the link below to reset your password:</p><a href="${resetUrl}">${resetUrl}</a>`,
  // });
}
