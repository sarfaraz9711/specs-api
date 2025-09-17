import 'reflect-metadata';
import {
    Post,
    JsonController,
    Body,
    Get,

} from 'routing-controllers';
import { getManager } from 'typeorm';
import { SmsApp } from '../models/smsModel';
import {env} from '../../env'
import moment from 'moment';
import { SmsTemplate } from '../models/SmsTemplate';
@JsonController('/sms')
export class SmsController {
    constructor() {
    }
  

    @Post('/transaction')
    public async smsTransaction(@Body() payloadRequest:any): Promise<any> {
        
        const _wt = getManager().getRepository(SmsApp)
        const _sms = getManager().getRepository(SmsTemplate)
        let getSentStatus:any
        if(payloadRequest.orderStatusId!=999){
            getSentStatus = await _wt.findOne({where: {orderId: payloadRequest.orderId, orderStatusId: payloadRequest.orderStatusId, status: "SENT" }})
        }
        let mobileNo:any= env.sms.devMode=="ON"?env.sms.receiverNo:payloadRequest.telephone
        let smsAction:any;
        let smsMessage:any;
        let smsResult:any;
        let otp:any = ''; 
        if(payloadRequest.orderStatusId==13 || payloadRequest.orderStatusId==1){
            smsAction='ORDER_PLACED'
        }else if(payloadRequest.orderStatusId==4){
            smsAction='ORDER_DISPATCH'
        }else if(payloadRequest.orderStatusId==12){
            smsAction='OUT_FOR_DELIVERY'
        }else if(payloadRequest.orderStatusId==5){
            smsAction='ORDER_DELIVERED'
        }else if(payloadRequest.orderStatusId==7 || payloadRequest.orderStatusId==15){
            smsAction='ORDER_RETURN'
        }else if(payloadRequest.orderStatusId==8){
            smsAction='RETURN_ACCEPT'
        }else if(payloadRequest.orderStatusId==14){
            smsAction='RETURN_REFUND'
        }else if(payloadRequest.orderStatusId==9){
            smsAction='ORDER_CANCEL'
        }else if(payloadRequest.orderStatusId==999){
            smsAction='OTP'
        }
        
        smsResult = await _sms.findOne({where: {templateCode:smsAction, isActive:1}})
        if(payloadRequest.orderStatusId==13 || payloadRequest.orderStatusId==1 || payloadRequest.orderStatusId==12 || payloadRequest.orderStatusId==5 || payloadRequest.orderStatusId==7 || payloadRequest.orderStatusId==15 || payloadRequest.orderStatusId==8 || payloadRequest.orderStatusId==14){
            smsMessage = smsResult.message.replace('{message1}', payloadRequest.orderPrefixId).replace('{message2}', 'https://redchief.in');
        }else if(payloadRequest.orderStatusId==9){
            smsMessage = smsResult.message.replace('{message1}', `${payloadRequest.shippingFirstname} ${payloadRequest.shippingLastname}`).replace('{message2}', payloadRequest.orderPrefixId);
        }else if(payloadRequest.orderStatusId==4){
            smsMessage = smsResult.message
        }else if(payloadRequest.orderStatusId==999){

                const digits:any = '0123456789'; 
                for (let i = 0; i < 6; i++ ) { 
                    otp += digits[Math.floor(Math.random() * 10)]; 
                } 
                smsMessage = smsResult.message.replace('{message1}', otp);
        }

        const urlPath=`${env.sms.newSmsUrl1}${mobileNo}&text=${smsMessage}${env.sms.newSmsUrl2}${smsResult.dltId}`
        
if(!getSentStatus){
    
        const axios = require('axios')
        const config = {
            method: 'get',
            url: urlPath
          };
        
          const result = await axios(config).then( (res:any)=>{
              return res
            }).catch((error:any)=>{
                return error
            })
            const _wtJson:any = {
                orderId:payloadRequest.orderStatusId==999?otp:payloadRequest.orderId,
                customerId:payloadRequest.orderStatusId==999?mobileNo:payloadRequest.customerId,
                templateId:smsAction,
                orderStatusId:payloadRequest.orderStatusId,
                status:result && result.data && result.data.ErrorCode=='000'?"SENT":"FAILED",
            }
           await _wt.save(_wtJson)
return result.data
        }else{
            return "Message already sent"
        }
    }

    @Get('/delete-sms')
    public async deleteWhatsApp(): Promise<any> {
      const currentDate:any =  moment(new Date()).subtract(15, 'd').format('YYYY-MM-DD')
      const emailService = getManager().getRepository(SmsApp)
      await emailService.createQueryBuilder().delete().where("DATE(created_date) < :date", {date:currentDate}).execute()
      return "Successfully deleted old sms"
    }    

}
