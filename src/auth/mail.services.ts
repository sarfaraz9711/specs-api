/*
* spurtcommerce
* http://www.spurtcommerce.com
*
* Copyright (c) 2022 Piccosoft Software Labs Pvt Ltd
* Author Piccosoft Software Labs Pvt Ltd <support@spurtcommerce.com>
* Licensed under the MIT license.
*/
import ejs from 'ejs';
import nodemailer from 'nodemailer';
import { mail } from '../env';
import {env} from '../env'
export class MAILService {

    public static customerLoginMail(orderData: any, emailContent: any, email: any, Subject: any, redirectUrl: any): Promise<any> {
        const productDetailData = undefined;
        const  storeRedirectUrl = env.storeRedirectUrl
        const mailLogo = mail.IMAGE_LINK
        return new Promise((resolve, reject) => {
            ejs.renderFile('./views/emailTemplate.ejs', { mailLogo, emailContent, productDetailData, storeRedirectUrl }, (err, data) => {
                if (err) {
                    throw err;
                } else {
                    this.nodeMailerFunction(orderData, Subject, email, data)
                }
            });
        });
    }

    public static registerMail(logo: any, emailContent: any, email: any, Subject: any, redirectUrl: any): Promise<any> {
        const productDetailData = undefined;
        const  storeRedirectUrl = env.storeRedirectUrl
        const mailLogo = mail.IMAGE_LINK
        return new Promise((resolve, reject) => {
            ejs.renderFile('./views/emailTemplate.ejs', { mailLogo, emailContent, productDetailData, storeRedirectUrl }, (err, data) => {
                if (err) {
                    throw err;
                } else {
                    this.nodeMailerFunction(null, Subject, email, data)
                }
            });
        })
    }

    public static passwordForgotMail(logo: any, emailContent: any, email: any, Subject: any, redirectUrl: any): Promise<any> {
        const productDetailData = undefined;
        const  storeRedirectUrl = env.storeRedirectUrl
        const mailLogo = mail.IMAGE_LINK
        return new Promise((resolve, reject) => {
            ejs.renderFile('./views/emailTemplate.ejs', { mailLogo, emailContent, productDetailData, storeRedirectUrl }, (err, data) => {
                if (err) {
                    throw err;
                } else {
                    this.nodeMailerFunction(null, Subject, email, data)
                }
            });
        });
    }

    public static contactMail(logo: any, emailContent: string, Subject: any, adminId: any, redirectUrl: any): Promise<any> {
        const productDetailData = undefined;
        const  storeRedirectUrl = env.storeRedirectUrl
        const mailLogo = mail.IMAGE_LINK
        return new Promise((resolve, reject) => {
            ejs.renderFile('./views/emailTemplate.ejs', { mailLogo, emailContent, productDetailData, storeRedirectUrl }, (err, data) => {
                if (err) {
                    throw err;
                } else {
                    this.nodeMailerFunction(null, Subject, adminId, data)
                }
            });
        });
    }

    
    public static adminOrderMail(logo: any, emailContent: any, orderData: any, Subject: any, productDetailData: any, today: any, adminId: any, redirectUrl: any): Promise<any> {
        const  storeRedirectUrl = env.storeRedirectUrl
        const mailLogo = mail.IMAGE_LINK
        return new Promise((resolve, reject) => {
            ejs.renderFile('./views/emailTemplate.ejs', { mailLogo, emailContent, orderData, productDetailData, today, storeRedirectUrl }, (err, data) => {
                if (err) {
                    throw err;
                } else {
                    this.nodeMailerFunction(null, Subject, adminId, data)
                }
            });
        });
    }

    // customer mail for check out
    public static customerOrderMail(logo: any, emailContent: any, orderData: any, Subject: any, productDetailData: any, today: any, redirectUrl: any): Promise<any> {
        const  storeRedirectUrl = env.storeRedirectUrl
        const mailLogo = mail.IMAGE_LINK
        return new Promise((resolve, reject) => {            
            ejs.renderFile('./views/emailTemplate.ejs', { mailLogo, emailContent, orderData, productDetailData, today, storeRedirectUrl }, (err, data) => {
                if (err) {
                    throw err;
                } else {
                    this.nodeMailerFunction(null, Subject, orderData.email, data)
                }
            });
        });
    }

    // for posting question API
    public static questionAndAnswerMail(logo: any, emailContent: any, email: any, Subject: any, adminId: any, redirectUrl: any): Promise<any> {
        const  storeRedirectUrl = env.storeRedirectUrl
        const mailLogo = mail.IMAGE_LINK
        const productDetailData = undefined;
        return new Promise((resolve, reject) => {
            ejs.renderFile('./views/emailTemplate.ejs', { mailLogo, emailContent, productDetailData, storeRedirectUrl }, (err, data) => {
                if (err) {
                    throw err;
                } else {
                    this.nodeMailerFunction(null, Subject, email, data)

                }
            });
        });
    }

    //  invoice mail
    public static invoiceMail(logo: any, emailContent: any, pdfBinary: any, email: any, orderData: any, Subject: any, redirectUrl: any): Promise<any> {
        const productDetailData = undefined;
        const  storeRedirectUrl = env.storeRedirectUrl
        const mailLogo = mail.IMAGE_LINK
        return new Promise((resolve, reject) => {
            ejs.renderFile('./views/emailTemplate.ejs', {mailLogo, emailContent , productDetailData, storeRedirectUrl}, (err, data) => {
                if (err) {
                } else {
                    this.nodeMailerFunction(null, Subject, email, data)
                }
            });
        });
    }

      // forgot password
      public static passwordForgotLink(logo: any, emailContent: any, email: any, Subject: any, redirectUrl: any): Promise<any> {
        const productDetailData = undefined;
        const  storeRedirectUrl = env.storeRedirectUrl
        const mailLogo = mail.IMAGE_LINK
        return new Promise((resolve, reject) => {
            ejs.renderFile('./views/emailTemplate.ejs', { mailLogo, emailContent, productDetailData, storeRedirectUrl }, (err, data) => {
                if (err) {
                    throw err;
                } else {
                    this.nodeMailerFunction(null, Subject, email, data)
                }
            });
        });
    }  

 //Notify customer
 public static notifyCustomer(logo:any, emailContent: any, email: any, Subject: any,redirectUrl: any): Promise<any> {
    const productDetailData = undefined;
    const  storeRedirectUrl = env.storeRedirectUrl
    const mailLogo = mail.IMAGE_LINK
    return new Promise((resolve, reject) => {
        ejs.renderFile('./views/emailTemplate.ejs', {mailLogo,  emailContent, productDetailData,storeRedirectUrl }, (err, data) => {
            if (err) {
                throw err;
            } else {
                
                this.nodeMailerFunction(null, Subject, email, data)
            }
        });
    });
}  


public static nodeMailerFunction(orderData:any, Subject:any, email:any, data:any):any{
    const mailOptions = {
        from: mail.FROM,
        to: mail.DEV=='ON'?mail.TEMP_ID:email,
        subject: Subject,
        html: data,
    };
    const transportOptions = {
        host: mail.HOST,
        port: mail.PORT,
        auth: { user: mail.AUTH.user, pass: mail.AUTH.pass },
        secureConnection: true,
        tls: { ciphers: 'SSLv3' }
    };
    const mailTransport = nodemailer.createTransport(transportOptions);
    const { EmailSchedulerController: es } = require('../api/controllers/Schedulers/EmailSchedulerController');
    let c = new es();
    mailTransport.sendMail(mailOptions, (error, info) => {
        if (error) {
            let status="Not_send"
             c._doEmailInsert(orderData, data,email,Subject,status, JSON.stringify(error));
        } else {
            let status="Sent"
             c._doEmailInsert(orderData, data,email,Subject,status, JSON.stringify(info));
        }
    });
}


}
