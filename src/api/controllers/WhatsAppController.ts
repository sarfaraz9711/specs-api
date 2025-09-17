import 'reflect-metadata';
import {
    Post,
    JsonController,
    Body,
    Get,

} from 'routing-controllers';
import { getManager } from 'typeorm';
import { WhatsApp } from '../models/WhatsApp';
import {env} from '../../env'
import moment from 'moment';
@JsonController('/whatsapp')
export class WhatsAppController {
    constructor() {
    }
  

    @Post('/transaction')
    public async whatsAppTransaction(@Body() payloadRequest:any): Promise<any> {
        const _wt = getManager().getRepository(WhatsApp)
        const getSentStatus = await _wt.findOne({where: {orderId: payloadRequest.orderDetails.orderId, orderStatusId: payloadRequest.orderDetails.orderStatusId, status: "SENT" }})
        let templateId:any
        let mediaImage:any
        const imageB4Path:any=env.whatsApp.orderImagesLink+"/api/media/image-resize?path=whatsApp/&name="
        const imageEndPath:any="&width=460&height=460"
        if(payloadRequest.orderDetails.orderStatusId==4){
            mediaImage =env.whatsApp.orderShipImg
            templateId=env.whatsApp.orderShip
        }else if(payloadRequest.orderDetails.orderStatusId==12){
            mediaImage =env.whatsApp.orderOfdImg
            templateId=env.whatsApp.orderOfd
        }else if(payloadRequest.orderDetails.orderStatusId==3){
            mediaImage =env.whatsApp.orderDelayImg
            templateId=env.whatsApp.orderDelay
        }else if(payloadRequest.orderDetails.orderStatusId==5){
            mediaImage =env.whatsApp.orderDeliveredImg
            templateId=env.whatsApp.orderDelivered
        }else if(payloadRequest.orderDetails.orderStatusId==7){
            mediaImage =env.whatsApp.orderReturnImg
            templateId=env.whatsApp.orderReturn
        }else{
            mediaImage =env.whatsApp.orderConfImg
            templateId=env.whatsApp.orderConf
        }
if(!getSentStatus){
        const whatsappReq = {   
            "message": {
                "channel": "WABA",
                "content": {
                    "preview_url": false,
                    "shorten_url": false,
                    "type": "MEDIA_TEMPLATE",
                    "mediaTemplate": {
                        "templateId": 'order_confirmation',
                        "media": {
                            "type": "image",
                            "url": imageB4Path+mediaImage+imageEndPath
                        },
                        "bodyParameterValues": payloadRequest.values
                    }
                },
                "recipient": {
                    "to": "91"+(env.whatsApp.devMode=="ON"?env.whatsApp.receiverNo:payloadRequest.mobileNo),
                    "recipient_type": "individual"
                },
                "sender": {
                    "from": env.whatsApp.senderNumber
                },
                "preferences": {
                    "webHookDNId": "1001"
                }
            },
            "metaData": {
                "version": "v1.0.9"
            }
        }
        console.log("whatsappReqwhatsappReq",JSON.stringify(whatsappReq))
        const axios = require('axios')
        const config = {
            method: 'post',
            url: "https://rcmapi.instaalerts.zone/services/rcm/sendMessage",
            headers:  {
              "Authentication": "Bearer "+env.whatsApp.authKey,
              "Content-Type" : "application/json; charset=utf-8",
            },
            data: whatsappReq
          };
        
          const result = await axios(config).then( (res:any)=>{
            console.log("resssssssssss",res)
              return res.data
            }).catch((error:any)=>{
                console.log("errorerrorerrorerror",error)
                return error
            })
            const _wtJson:any = {
                orderId:payloadRequest.orderDetails.orderId,
                customerId:payloadRequest.orderDetails.customerId,
                templateId:templateId,
                orderStatusId:payloadRequest.orderDetails.orderStatusId,
                status:result && result.statusCode==200?"SENT":"FAILED",
                request:JSON.stringify(payloadRequest),
                response:JSON.stringify(result)
            }
           await _wt.save(_wtJson)
return result
        }else{
            return "Message already sent"
        }
    }

    @Get('/delete-whatsapp')
    public async deleteWhatsApp(): Promise<any> {
      const currentDate:any =  moment(new Date()).subtract(15, 'd').format('YYYY-MM-DD')
      const emailService = getManager().getRepository(WhatsApp)
      await emailService.createQueryBuilder().delete().where("DATE(created_date) < :date", {date:currentDate}).execute()
      return "Successfully deleted old whatsApp"
    }  

}
