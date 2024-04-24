import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/verificationEmail";
import { ApiResponse } from "../types/ApiResponse";

export async function sendVerificationEmails(email: string, username: string, verifyCode:string): Promise<ApiResponse>{
    try {
        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'whoIsThis opt verification ',
            react: VerificationEmail({username,otp: verifyCode}),
        });
        return {success: true, message:"verification email send successfully"}
    } catch (error) {
        console.log("error sending verification emaail : ", error);
        return {success: false, message:"failed to send verification email"}
    }
}
