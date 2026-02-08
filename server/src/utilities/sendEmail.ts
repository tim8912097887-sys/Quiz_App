import { Resend } from 'resend';
import { env } from '@configs/env.js';

export const resend = new Resend(env.RESEND_API_KEY);

export const sendEmail = async(to: string,subject: string,html: string) => {
    const result = await resend.emails.send({
        from: env.EMAIL_SENDER_USER,
        to,
        subject,
        html
    })
    return result.error;
}