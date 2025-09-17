import { Get, Authorized, JsonController, Post, QueryParams, Req, Res, UseBefore, Param } from "routing-controllers";
import { CreditNoteService } from "../services/admin/CreditNoteService";
import { Order } from "../models/Order";
import { getManager } from "typeorm";
import { CheckCustomerMiddleware } from "../middlewares/checkTokenMiddleware";
import { OrderStatusHistoryController } from "./OrderStatusHistoryController";
import moment from "moment";
import { CustomerService } from "../services/CustomerService";
import { EmailTemplate } from "../models/EmailTemplate";
import { MAILService } from "../../auth/mail.services";
@JsonController('/credit-note')
export class CreditNoteController {
    constructor(public _creditNoteService: CreditNoteService, private _customer: CustomerService, public _orderStatusHistoryController:OrderStatusHistoryController, ) {

    }

    @Post('/create')
    @Authorized()
    public async createCreditNote(@Req() request: any, @Res() res: any) {
        const requestPayload = request.body;
        let successResponse: any;
        if (requestPayload && requestPayload.order_id) {
            const orderId = requestPayload.order_id;
            const orderProductId = requestPayload.order_product_id||null;
            let orderProductIdList:any[]=[]
            const creditNoteAmount = requestPayload.creditNoteAmount
            const orderRepo = getManager().getRepository(Order);
            const orderRecord = await orderRepo.findOne({where: {orderId: orderId}})
            const isAvailable = await this._creditNoteService.findOne({cn_source_order_id:requestPayload.order_id})
                const isAvailableOrderProductId:any= isAvailable && isAvailable.order_product_id &&isAvailable.order_product_id.split(',')
                const orderProductsIds:any = requestPayload.order_product_id.split(',')
                const length:any = orderProductsIds.length
                let orderProducts:any[]=[]
                orderProductsIds.forEach((element:any) => {
                        orderProductIdList.push({'orderProductId':element})
                    if(isAvailableOrderProductId && !isAvailableOrderProductId.includes(element)){
                    orderProducts.push({orderProductId:element})
                    }
                });
            
            if(!isAvailable || orderProducts.length>0){
            const getUser = await this._customer.findOne(orderRecord.customerId)
                try {
                    await this._creditNoteService.createCreditNote(orderRecord, orderProductId, creditNoteAmount, getUser);
                    successResponse = {
                        status: 1,
                        message: 'credit note created successfully.',
                        data: `Credit note created successfully`,
                    };
                    try{
                        await  this._orderStatusHistoryController.saveStatusHistory(orderRecord.orderId, orderRecord.orderPrefixId,orderProductIdList,length,17,1,1,1)
                        await getManager().query(`UPDATE tm_order_cancel_requests SET cancel_request_status = 'Approved', modified_date=now() WHERE order_product_id in (${requestPayload.order_product_id})`)
                        await getManager().query(`UPDATE tm_order_return SET return_status = '2', modified_date=now() WHERE order_product_id in (${requestPayload.order_product_id})`)
                    }catch{
                        console.log("Catch")
                    }
                } catch (error) {
                    successResponse = {
                        status: 0,
                        message: "Something went wrong",
                        data: `Error: ${error}`,
                    };
                }
            
            }else{
                successResponse = {
                    status: 0,
                    message: 'Invalid Order Id',
                    data: `Invalid Order Id`,
                };  
            }
            return res.status(200).send(successResponse);
        } else {
            successResponse = {
                status: 0,
                message: 'Provide Order Id',
                data: `Prodivide Order Id`,
            };
        }
        return res.status(200).send(successResponse);
        
    }

    @Post('/create-claim-credit-note')
    @Authorized()
    public async createCreditNoteClaimbased(@Req() request: any, @Res() res: any) {
        const requestPayload = request.body;
        requestPayload.status=requestPayload.status==1?true:false
        let successResponse: any;
                try {
                    const currentDateWithTime = moment(request.cn_expiry_date).set({hour: 23,minute: 59,second: 59}).format('YYYY-MM-DD HH:mm:ss');
        requestPayload.cn_expiry_date = currentDateWithTime;
                    await this._creditNoteService.create(requestPayload);
                    successResponse = {
                        status: 1,
                        message: 'credit note created successfully.',
                        data: `Credit note created successfully`,
                    };
                    /*Send Credit Note Created Email to Customer, Starts Here*/
            const emailTemp = getManager().getRepository(EmailTemplate)
            const emailContent = await emailTemp.findOne({where: {title: "CREDIT_NOTE_CREATED"}});
            let emailBody = emailContent.content.replace('{creditNoteAmount}', requestPayload.cn_amount.toString()).replace('{cnCode}',requestPayload.cn_code);
            emailBody = emailBody.replace('{creditNote}', requestPayload.cn_code);
            
            
            const sendEmailTo = requestPayload.emailId;
            const emailSubject = emailContent.subject;
            MAILService.notifyCustomer(null, emailBody, sendEmailTo, emailSubject, null);
            /*Send Credit Note Created to Customer, Ends Here*/
                } catch (error) {
                    successResponse = {
                        status: 0,
                        message: "Something went wrong",
                        data: `Error: ${error}`,
                    };
                }

            return res.status(200).send(successResponse);
        } 
        
    @Post('/update-claim-credit-note')
    @Authorized()
    public async updateCreditNoteClaimbased(@Req() request: any, @Res() res: any) {
        const requestPayload = request.body;
        
        const currentDateWithTime = moment(requestPayload.cn_expiry_date).set({hour: 23,minute: 59,second: 59}).format('YYYY-MM-DD HH:mm:ss');
        
        const fnindCn:any = await this._creditNoteService.findOne(requestPayload.id) 
        // requestPayload.modifiedDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
        fnindCn.channelName=requestPayload.channelName
        fnindCn.cn_amount=requestPayload.cn_amount
        fnindCn.cn_created_date=requestPayload.cn_created_date
        fnindCn.cn_expiry_date = currentDateWithTime;
        fnindCn.emailId=requestPayload.emailId
        fnindCn.mobile=requestPayload.mobile
        fnindCn.status=requestPayload.status==1?true:false
        let successResponse: any;
                try {
                    await this._creditNoteService.update(fnindCn);
                    successResponse = {
                        status: 1,
                        message: 'credit note update successfully.',
                        data: `Credit note update successfully`,
                    };
                } catch (error) {
                    successResponse = {
                        status: 0,
                        message: "Something went wrong",
                        data: `Error: ${error}`,
                    };
                }

            return res.status(200).send(successResponse);
        } 
        
        
    



    @UseBefore(CheckCustomerMiddleware)
    @Get('/apply')
    public async applyCreditNote(@Req() request: any, @Res() res: any){
        
        const creditNote = request.query.creditNote;
        let cnAmount = request.query.cnAmount;
        cnAmount = parseFloat(cnAmount);
        const userId = request.user.id;
        let successResponse: any;
        if(creditNote){
            try {
               const response =  await this._creditNoteService.applyCreditNote(creditNote, userId, cnAmount)
               
               if(response && response.length > 0){
                successResponse = {
                    status: 1,
                    message: "coupon is valid",
                    data: response,
                };
            }else{
                successResponse = {
                    status: 0,
                    message: "Invalid credit note(CN has expired/used OR credit note amount is greater than cart amount)",
                    data: response,
                };
            }
            } catch (error) {
                successResponse = {
                    status: 0,
                    message: "Something went wrong",
                    data: `Error: ${error}`,
                };
            }
            
            
        }else{
            successResponse = {
                status: 0,
                message: 'Invalid Credit Note',
                data: `Invalid Credit Note`,
            }; 
        }

        return res.status(200).send(successResponse);
    }
    

    @UseBefore(CheckCustomerMiddleware)
    @Get('/validate')
    public async validateCreditNote(@Req() request: any, @Res() res: any){
        
        const creditNote = request.query.creditNote;
        let cnAmount = request.query.cnAmount;
        cnAmount = parseFloat(cnAmount);
        const userId = request.user.id;
        const getUser = await this._customer.findOne(userId)
        let successResponse: any;
        if(creditNote){
            try {
               const response =  await this._creditNoteService.validateCreditNote(creditNote, userId, cnAmount, getUser)
               
               if(response){
                successResponse = {
                    status: 1,
                    message: "coupon is valid",
                    data: response,
                };
            }else{
                successResponse = {
                    status: 0,
                    message: "Invalid credit note(CN has expired/used OR credit note amount is greater than cart amount)",
                    data: response,
                };
            }
            } catch (error) {
                successResponse = {
                    status: 0,
                    message: "Something went wrong",
                    data: `Error: ${error}`,
                };
            }
            
            
        }else{
            successResponse = {
                status: 0,
                message: 'Invalid Credit Note',
                data: `Invalid Credit Note`,
            }; 
        }

        return res.status(200).send(successResponse);
    }

    @UseBefore(CheckCustomerMiddleware)
    @Get('/user/creditnotes')
    public async getUserCreditNotes(@Req() request: any, @Res() res: any){
        
        
        const userId = request.user.id;
        let successResponse: any;
        if(userId){
            try {
               const response =  await this._creditNoteService.getCreditNotesOfUser(userId)
                successResponse = {
                    status: 1,
                    message: "User credit notes found successfully",
                    data: response,
                };
            } catch (error) {
                successResponse = {
                    status: 0,
                    message: "Something wend wrong",
                    data: `Error: ${error}`,
                };
            }
            
            
        }else{
            successResponse = {
                status: 0,
                message: 'Invalid user id',
                data: `Invalid user id`,
            }; 
        }

        return res.status(200).send(successResponse);
    }
    @Get('/active-by-order-id')
    @UseBefore(CheckCustomerMiddleware)
    public async cnActiveByOrderId(@QueryParams() query:any ){
        const orderRepo = getManager().getRepository(Order);
        const orderRecord = await orderRepo.findOne({where: {orderId: query.orderId}})
        if(orderRecord && (orderRecord.orderStatusId==11 || orderRecord.orderStatusId==13)){
            await this._creditNoteService.markCnActiveByOrderId(query.orderId)
            return "CN Status Updated"
        }else{
            return "CN status can't update"
        }
    }

    @Get('/admin/cnlist')
    @Authorized()
    public async getCnList(@Req() request:any, @Res() response:any){
        let successResponse: any;
        try {
            let response =  await this._creditNoteService.getCnList(request.query)
            response = response.map(item=> ({
                    ...item,
                    cnStatus: item.cnStatus==='0'?0:1
            }))
             successResponse = {
                 status: 1,
                 message: "records found successfully",
                 data: response,
             };
         } catch (error) {
             successResponse = {
                 status: 0,
                 message: "Something wend wrong",
                 data: `Error: ${error}`,
             };
         }
         return response.status(200).send(successResponse);
    }

    @Post('/admin/cnUpdate')
    @Authorized()
    public async updateCn(@Req() request:any, @Res() response:any){
        console.log("request",request.user.userId)
        let successResponse: any;
        try {
            const response =  await this._creditNoteService.updateCN(request.body, request.user.userId)
            if(response){
             successResponse = {
                 status: 1,
                 message: "CN updated successfully",
                 data: response
             };
            }else{
                successResponse = {
                    status: 1,
                    message: "CN not updated. Try again"
                };
            }
         } catch (error) {
             successResponse = {
                 status: 0,
                 message: "Something wend wrong",
                 data: `Error: ${error}`,
             };
         }
         return response.status(200).send(successResponse);
    }
    
@Get('/cn-status-update-by-order_id')
public async cnStatusUpdateByOrderId(@QueryParams() data:any){
    console.log("data",data)
    if(data.status==1){
    await getManager().query(`UPDATE tt_credit_notes c INNER JOIN tt_promotions_usage_orders p ON p.coupon_code=c.cn_code SET c.status = ${data.status}, c.modified_date=DATE_ADD(DATE_ADD(NOW(), INTERVAL 5 HOUR), INTERVAL 30 MINUTE), p.modified_date=DATE_ADD(DATE_ADD(NOW(), INTERVAL 5 HOUR), INTERVAL 30 MINUTE), p.coupon_code=CONCAT(p.coupon_code, '_CANCELLED')  WHERE cn_applied_order_id = ${data.orderId};`)
    }else{
    await getManager().query(`UPDATE tt_credit_notes c SET c.status = ${data.status}, c.modified_date=DATE_ADD(DATE_ADD(NOW(), INTERVAL 5 HOUR), INTERVAL 30 MINUTE) WHERE c.cn_applied_order_id = ${data.orderId}`)
    }
    return data
}


    @UseBefore(CheckCustomerMiddleware)
    @Get('/cn-details-by-id/:id')
    public async cnDetailsById(@Param('id') id:any){
        const res:any = await getManager().query(`SELECT created_date createdDate, modified_date modifiedDate, id,  cn_code,  cn_amount,  cn_source_order_id,  order_product_id,  cn_created_date,  cn_expiry_date, status,  cn_applied_order_id,  email_id emailId,  mobile,  channel_name channelName FROM tt_credit_notes WHERE id=${id}`)
        let result:any={}
        console.log("resresresresresres",res)
        if(res){
            result.status=200
            result.message='get data successfully'
            result.data=res[0]
        }else{
            result.status=300
            result.message='no data found'
            result.data=null
        }
        return result
    }    

@Get('/get-order-prefix-id/:orderId')
public async getOrderPrefixId(@Param('orderId') orderId:any){
    const result:any={}
    try{
    const orderTable:any = '`order`'
const res:any = await getManager().query(`select order_prefix_id orderPrefixId from ${orderTable} where order_id=${orderId}`)
console.log("resultresultresult",res)
if(res.length>0){
        result.status=200
        result.message='Data found'
        result.data=res[0]
}else{
    result.status=300
    result.message='No Data found'
    result.data=null
}
    }catch{
        result.status=500
        result.message='Error catch'
        result.data=null
    }

    return result

}

}
