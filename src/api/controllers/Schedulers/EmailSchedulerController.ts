import 'reflect-metadata';
import {  JsonController, Req, Res,Post, Get } from 'routing-controllers';
import { EmailModels } from '../../models/Schedulers/EmailModel';
import nodemailer from 'nodemailer';
import smtpTransport from 'nodemailer-smtp-transport';
import {mail} from '../../../env'
import { getManager } from 'typeorm';
import moment from 'moment';

@JsonController('/emailscheduler')
export class EmailSchedulerController {

   // Sync email
    /**
     * @api {post} /api/emailscheduler/secure/sync-all-email Sync email
     * @apiGroup Scheduler
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "mail send successfully",
     *      "status": "200",
     *      "data" : {}
     * }
     * @apiSampleRequest /api/emailscheduler/secure/sync-all-email
     * @apiErrorExample {json} Email sync error
     * HTTP/1.1 500 Internal Server Error
     */
  @Post('/secure/sync-all-email')
  public async sendAllEmail(@Req() req: any, @Res() res: any): Promise<any> {
    const { EmailSyncService: es } = require('../../services/Schedulers/EmailSyncService');
    let emailService = new es();
    const { CommonService :cs } = require("../../common/commonService");
    let _m = new cs();
    
    var emailResponse=await emailService.syncAllEmail();
   const transporter = nodemailer.createTransport(smtpTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: process.env.MAIL_SECURE,
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
    },
 }));
    for(var inc=0;inc<emailResponse.length;inc++){
          const mailOptions = {
          from: emailResponse[inc].fromAddress,
          to: emailResponse[inc].sendTO,
          subject: emailResponse[inc].subject,
          html: emailResponse[inc].bodyContent,
   };
    transporter.sendMail(mailOptions, async (error, info) => {
    if (error) {
        //reject(error);
    } else {
    
    }
  }); 
    await this._updateEmailStatus(emailResponse[inc].id);
    } 
    return res.status(200).send(await _m.getMessage(200, "mail send successfully"));
   

  }


  public async _updateEmailStatus(id:any): Promise<any> {
    const { EmailSyncService: es } = require('../../services/Schedulers/EmailSyncService');
    let emailService = new es();
    await emailService.updateEmail(id);


  }

  

  public async _doEmailInsert( orderData:any, emailContent: string, email: any, Subject:string,status:string, email_resp:any): Promise<any> {
    const { EmailSyncService: es } = require('../../services/Schedulers/EmailSyncService');
    let emailService = new es();
    const newEmail = new EmailModels();
    newEmail.sendTO = email;
    newEmail.sender = mail.FROM;
    newEmail.subject = Subject;
    newEmail.status = status;
    newEmail.mailResp = email_resp;
    if(orderData){
    newEmail.orderId = orderData.orderId
    newEmail.orderStatusId = orderData.orderStatusId
    }
    // newEmail.bodyContent = emailContent;
    newEmail.bodyContent = null;
    newEmail.fromAddress = mail.FROM;
    var saveEmailResponse=await emailService.create(newEmail);

    return saveEmailResponse;

  }

  public async getEmailStatus(data:any){
    const emailService = getManager().getRepository(EmailModels)
    const result = await emailService.findOne({where: {
      sendTO:data.sendTO, subject:data.subject, orderId:data.orderId, orderStatusId:data.orderStatusId
    }})
    return result
  }

  @Get('/secure/delete-email')
  public async deleteEmail(): Promise<any> {
    const currentDate:any =  moment(new Date()).subtract(15, 'd').format('YYYY-MM-DD')
    const emailService = getManager().getRepository(EmailModels)
    await emailService.createQueryBuilder().delete().where("DATE(created_date) < :date", {date:currentDate}).execute()
    return "Successfully deleted old mail"

  }


}