/**
 * Mail transport abstraction.
 * - If SMTP_* envs are set → sends via a real SMTP relay (fetch-compatible endpoint or nodemailer).
 * - Otherwise logs to console (demo mode). The OTP is surfaced on the verify screen via demo mode.
 */
export type MailResult = {
  transport: "smtp" | "console";
  delivered: boolean;
};

export async function sendOtpEmail(input: {
  to: string;
  code: string;
  mode: string;
}): Promise<MailResult> {
  const host = process.env.SMTP_HOST;
  if (host) {
    try {
      const res = await fetch(`https://${host}/api/mail`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: process.env.SMTP_FROM ?? "no-reply@bizflow.ai",
          to: input.to,
          subject: input.mode === "register" ? "Bizflow — verify your email" : "Bizflow — sign-in code",
          text: `Your Bizflow verification code: ${input.code}`,
        }),
      });
      return { transport: "smtp", delivered: res.ok };
    } catch {
      /* fall through */
    }
  }
  console.log(`[bizflow:mail][demo] OTP for ${input.to} (${input.mode}): ${input.code}`);
  return { transport: "console", delivered: true };
}