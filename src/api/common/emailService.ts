import { Service } from 'typedi';
import nodemailer from "nodemailer";
@Service()
export class EmailService {
    public  sendEmail = (email: any,message:any) => {
        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: 465,
            secure: true,
            auth: {
                user: process.env.MAIL_USERNAME,
                pass: process.env.MAIL_PASSWORD
            }
        });
        // send email
         transporter.sendMail({
            from: "jyoti.chaudhary@velocis.co.in",
            to: email,
            subject: message.subject,
            text: message.body
        });
    }
}