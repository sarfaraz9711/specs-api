
import 'reflect-metadata';
import {
    Get,
    Req,
    JsonController,
    Body,
    Res,
    Post,
    QueryParam,
    UseBefore,
    Authorized
} from 'routing-controllers';
import { getManager, In, getRepository } from 'typeorm';
import { Order } from '../models/Order';
import { CheckCommonMiddleware, CheckCustomerMiddleware } from '../middlewares/checkTokenMiddleware';
import { OrderService } from '../services/OrderService';
import { FacilitySkuModel } from '../models/Master/FacilitySkuModel';
import { Sku } from '../models/SkuModel';
import { OrderCancelRequests } from '../models/OrderCancelRequests';
import { MAILService } from '../../auth/mail.services';
import { EmailTemplate } from '../models/EmailTemplate';
import { OrderReturn } from '../models/OrderReturn';
import {OrderStatusHistoryController} from '../controllers/OrderStatusHistoryController'
const appLogger =  require('../services/admin/AppLoggerService')

@JsonController('/unicommerce')
export class UnicommerceController {

constructor(private _orderStatusHistoryController:OrderStatusHistoryController, private _orderService: OrderService){

}

    @UseBefore(CheckCustomerMiddleware)
    @Get('/sync-user-orders')
    public async syncUserOrders(@QueryParam('uid') uid: string, @Res() response: any): Promise<void> {

       const orders =  await getManager().getRepository(Order).find({
        select: ['orderPrefixId'],
        where: {customerId: uid, ucOrderStatus: In(["CREATED", "PROCESSING"])}
       });
       const { UnicommeService : dd } = require('../services/admin/UnicomService');
        let c = new dd();
        const orderLength = orders.length;
        let orderSyncedCount = 0;
        if(orderLength > 0){
            for(let i=0;i<orderLength;i++){
                await c.syncMyOrders(orders[i].orderPrefixId);
                orderSyncedCount++;
            }
        }
        
        const successResponse: any = {
            status: 1,
            message: 'User Orders synched successfully.',
            data: `${orderSyncedCount} orders synched successfully`,
        };
        return response.status(200).send(successResponse);

    }

    @Get('/sync-inventory')
    public async syncInventoryUc(@Res() response: any): Promise<void> {

        const { UnicommeService : dd } = require('../services/admin/UnicomService');
        let c = new dd();
        await c.syncInventoryFromUC();
        const successResponse: any = {
            status: 1,
            message: 'inventory synched successfully.',
            data: `inventory synched successfully`,
        };
        return response.status(200).send(successResponse);

    }

    
    @Post('/sync-inventory-by-sku')
    public async syncInventoryBySku(@Body() request: any): Promise<void> {

        const { UnicommeService : dd } = require('../services/admin/UnicomService');
        let c = new dd();
        const result = await c.inventorySyncBySKU(request);
        const successResponse: any = {
            status: 1,
            message: 'inventory synched successfully.',
            data: result,
        };
        return successResponse

    }

    // @UseBefore(CheckCommonMiddleware)
    // @Post('/cancel-sale-order')
    // public async cancelSaleOrder(@Body({ validate: true }) saleOrderObj: any, @Res() response: any, @Req() request: any): Promise<void> {
    //     const { UnicommeService : dd } = require('../services/admin/UnicomService');
    //     let c = new dd();
    //     const getSaleOrder = await c.getSaleOrder(saleOrderObj.orderPrefixId)
    //     //let payload =  saleOrderObj;
    //     if(getSaleOrder.response=='ORDER_NOT_FOUND_ON_UC' || (getSaleOrder.response && getSaleOrder.response.shippingPackages && getSaleOrder.response.shippingPackages.length==0 || getSaleOrder.response.shippingPackages[0].status=="CREATED" || getSaleOrder.response.shippingPackages[0].status=="PACKED" || getSaleOrder.response.shippingPackages[0].status=="PICKED"  || getSaleOrder.response.shippingPackages[0].status=="PICKING" || getSaleOrder.response.shippingPackages[0].status=="RETURNED" || saleOrderObj.cancellationRemark=="Rejected")){
    //     const orderCancelRequestRepo = getManager().getRepository(OrderCancelRequests);
    //     const creditNoteRepo = getManager().getRepository(CreditNoteModel);
    //     let returnValue:any
    //     let response_msg:any
    //     let response_code:any
    //     let orderDetails = await this._orderService.findOne(saleOrderObj.orderId);
    //     const orderProducts:any = await this._OrderProductService.find({where: {orderId:orderDetails.orderId}})
    //     const length = orderProducts.length
    //     if(orderDetails && orderDetails.paymentMethod == 2){
    //         await this.cancelCODOrder(orderDetails);
    //         try{
    //             await  this._orderStatusHistoryController.saveStatusHistory(orderDetails.orderId, orderDetails.orderPrefixId,orderProducts,length,9,1,1,1)
    //         }catch{
    //             console.log("Catch")
    //         }
    //         const successResponse: any = {
    //             status: 1,
    //             message: "Order Cancelled Successfully",
    //             data: "Order Cancelled Successfully",
    //         };
    //         return response.status(200).send(successResponse);

    //     }
    //     if(saleOrderObj.cancellationReason=="APPROVED_BY_BACKEND"){
    //         if(saleOrderObj.cancellationRemark=="Approved" || saleOrderObj.cancellationRemark=="CancelledCODOrder"){
    //             orderDetails.orderStatusId=9;
    //             returnValue="Cancelled Approved Successfully"
    //             try{
    //                 await  this._orderStatusHistoryController.saveStatusHistory(orderDetails.orderId, orderDetails.orderPrefixId,orderProducts,length,9,1,1,1)
    //             }catch{
    //                 console.log("Catch")
    //             }
    //         }else{
    //             orderDetails.orderStatusId=1;
    //             returnValue="Cancelled Rejected Successfully"
    //             try{
    //                 await  this._orderStatusHistoryController.saveStatusHistory(orderDetails.orderId, orderDetails.orderPrefixId,orderProducts,length,10,1,1,1)
    //             }catch{
    //                 console.log("catch")
    //             }
    //         }

            
    //         await orderCancelRequestRepo.createQueryBuilder().update().set({cancelRequestStatus:saleOrderObj.cancellationRemark}).where("id=:pid", {pid: saleOrderObj.cancelOrderRequestId}).execute();
    //     }else{
    //         try{
    //             await  this._orderStatusHistoryController.saveStatusHistory(orderDetails.orderId, orderDetails.orderPrefixId,orderProducts,length,6,1,1,1)
    //         }catch{
    //             console.log("catch")
    //         }
    //         returnValue="Cancelled Applied Successfully"
    //         orderDetails.orderStatusId=6;
    //         orderDetails.orderCancelReson=saleOrderObj.cancellationReason;
    //         orderDetails.orderCancelRemark=saleOrderObj.cancellationRemark;
    //         const orderRequestObj = {
    //             orderId: orderDetails.orderId,
    //             customerId: orderDetails.customerId,
    //             orderPrefixId: orderDetails.orderPrefixId,
    //             cancelRequestReason: saleOrderObj.cancellationReason,
    //             cancelRequestRemark: saleOrderObj.cancellationRemark,
    //             cancelRequestStatus: "Pending"
    //         }
    //         await orderCancelRequestRepo.save(orderRequestObj);
    //     }
    //     await this._orderService.update(saleOrderObj.orderId, orderDetails);
        
    //     let orderProductDetails:any = await this._OrderProductService.find({
    //         where: {orderId:saleOrderObj.orderId}});
    //     const oLength= orderProductDetails.length
    //     let updateData: any;
    //     for(let i=0; i<oLength; i++){
    //         updateData =orderProductDetails[i] 
    //         if(saleOrderObj.cancellationReason=="APPROVED_BY_BACKEND"){
    //             if(saleOrderObj.cancellationRemark=="Approved" || saleOrderObj.cancellationRemark=="CancelledCODOrder"){
    //                 updateData.orderStatusId=9;
    //             }else{
    //                 updateData.orderStatusId=1;
    //             }
    //         }else{
    //             updateData.orderStatusId=6;
    //             updateData.cancelRequest=1;
    //         }
    //         await this._OrderProductService.update(updateData.orderProductId, updateData);

    //         if(saleOrderObj.cancellationRemark=="CancelledCODOrder"){
                
    //             await creditNoteRepo.createQueryBuilder().update().set({cn_applied_order_id: null, status: true}).where("cn_applied_order_id=:pid", {pid: saleOrderObj.orderId}).execute(); 
    //         }
    //     }

    //    let apiStatus = 1;
    //     if(saleOrderObj.cancellationReason=="APPROVED_BY_BACKEND" && (saleOrderObj.cancellationRemark=="Approved" || saleOrderObj.cancellationRemark=="CancelledCODOrder")){
    //         if(getSaleOrder.response=='ORDER_NOT_FOUND_ON_UC' || (getSaleOrder.response && getSaleOrder.response.shippingPackages && getSaleOrder.response.shippingPackages.length>0 && getSaleOrder.response.shippingPackages[0].status!="RETURNED")){
    //     returnValue =  await c.cancelSaleOrder(orderDetails, "cancelAllOrder", updateData);
    //     apiStatus = returnValue.error==1?0:1
    //     response_msg = returnValue.response_msg
    //     response_code = returnValue.response_code
    //         }else{
    //             apiStatus=1
    //             response_msg='Order status is returned'
    //             response_code='SUCCESS'
    //         }
       
        
        
    //     if(returnValue.error == 0 && saleOrderObj.cancellationRemark=="CancelledCODOrder"){
    //         const emailTemp = getManager().getRepository(EmailTemplate)

    //         const emailContent = await emailTemp.findOne({where: {title: "ORDER_CANCELLED"}});
            
    //         const emailBody = emailContent.content.replace('{orderId}', orderDetails.orderPrefixId);
            
    //         const sendEmailTo = orderDetails.email;
    //         const emailSubject = emailContent.subject;
    //         MAILService.notifyCustomer(null, emailBody, sendEmailTo, emailSubject, null);

    //         const { SmsController : ss } = require('../controllers/SmsController');
    //         const _sms = new ss();
    //         await _sms.smsTransaction(orderDetails)
            
    //     }
    //     }
    //     const successResponse: any = {
    //         status: apiStatus,
    //         message: response_msg,
    //         data: response_code,
    //     };
    //     return response.status(200).send(successResponse);
    // }else{
    //     const successResponse: any = {
    //         status: 500,
    //         message: 'Order Can not cancel at this stage',
    //         data: null,
    //     };
    //     return response.status(200).send(successResponse);
    // }
    // }


    @UseBefore(CheckCommonMiddleware)
    @Post('/partial-cancel-sale-order')
    public async partialCancelSaleOrder(@Body({ validate: true }) saleOrderObj: any): Promise<void> {
       console.log("request",saleOrderObj)
       const { UnicommeService : dd } = require('../services/admin/UnicomService');
        let c = new dd();
       const saleLength:any = saleOrderObj.length
       let result:any={}
       let orderCancelList:any[]=[] 
       for(let i=0; i<saleLength; i++){
        const getSaleOrder = await c.getSaleOrder(saleOrderObj[i].orderPrefixId)
        if(getSaleOrder.response=='ORDER_NOT_FOUND_ON_UC' || (getSaleOrder.response && getSaleOrder.response.shippingPackages && getSaleOrder.response.shippingPackages.length==0 || getSaleOrder.response.shippingPackages[0].status=="CREATED" || getSaleOrder.response.shippingPackages[0].status=="PACKED" || getSaleOrder.response.shippingPackages[0].status=="PICKED"  || getSaleOrder.response.shippingPackages[0].status=="PICKING" || getSaleOrder.response.shippingPackages[0].status=="RETURNED" || saleOrderObj[0].cancellationRemark=="Rejected" || getSaleOrder.response.shippingPackages[0].status=="CANCELLED" || getSaleOrder.response.shippingPackages[0].status=="SHIPPED" || getSaleOrder.response.shippingPackages[0].status=="DISPATCHED")){
            orderCancelList.push(getSaleOrder.response)
        }else{
            result.status=500
            result.data=null
            result.message=`Order Can not cancel at this stage status ${getSaleOrder.response.shippingPackages[0].status}`
            return result
        }
       }
if(orderCancelList.length==saleLength){
    let orderStatusId:number=0
               if(saleOrderObj.length>0 && saleOrderObj[0].paymentMethod == 2){
                   const resultUc = await this.partialCancelCODOrder(saleOrderObj);
                   if(resultUc.status==200){
                    orderStatusId=9
                    result.status=200
                   result.data="Order Cancelled Successfully"
                   result.message="Order Cancelled Successfully"
                   }else{
                    result.status=300
                    result.data=null
                    result.message=resultUc.message
                   }   
               }else{
                const orderCancelRequestRepo = getManager().getRepository(OrderCancelRequests);
                if(saleOrderObj[0].cancelRequestStatus=='Rejected'){
                    orderStatusId=10
                    for(let i=0; i<saleLength; i++){
                        await getManager().query(`UPDATE tm_order_cancel_requests SET cancel_request_status='${saleOrderObj[i].cancelRequestStatus}', modified_date=now() WHERE id=${saleOrderObj[i].id}`)
                    }
                    await c.holdUnholdOrderItem(saleOrderObj,1)
                }else{
                await orderCancelRequestRepo.save(saleOrderObj);
                orderStatusId=6
                 await c.holdUnholdOrderItem(saleOrderObj,2)
                }

                console.log("saleOrderObj[i]",saleOrderObj)
                for(let i=0; i<saleLength; i++){     
                    const orderJson:any = {orderProductIds:saleOrderObj[i].orderProductId, orderStatusId:orderStatusId==10?1:orderStatusId, orderId:saleOrderObj[0].orderId}
                    await this._orderService.updateOrderProductStatus(orderJson)
                }
                result.status=200
                result.data="Order Cancelled Successfully"
                result.message="Order Cancelled Successfully"
               }
               if(orderStatusId!=0){
               try{
                await  this._orderStatusHistoryController.saveStatusHistory(saleOrderObj[0].orderId, saleOrderObj[0].orderPrefixId,saleOrderObj,saleLength,orderStatusId,1,1,1)
            }catch{
                console.log("Catch")
            }
        }
    }else{
        result.status=500
        result.data=null
        result.message="Order Items not matched on UC"
    }
    return result
    }

    @UseBefore(CheckCommonMiddleware)
    @Post('/order-product-reverse-pickup')
    public async cancelSaleProductOrder(@Body({ validate: true }) saleOrderObj: any, @Res() response: any, @Req() request: any): Promise<void> {
        const { UnicommeService : dd } = require('../services/admin/UnicomService');
        let c = new dd();
        let length:any=saleOrderObj.length
        let result:any=''
        for(let i=0; i<length; i++){
            const orderProductId:any= saleOrderObj[i].orderProductId
            const itemCode:any = saleOrderObj[i].reversePickItems.map((item:any) => item.saleOrderItemCode).join(", ");
            try{
            const returnValue:any =  await c.createReversePickup(saleOrderObj[i], saleOrderObj[i].returnOrderId);
            console.log("returnValue",returnValue)
            if(returnValue.status == 200){
                const trackingNo:any=returnValue.data[0].trackingNumber
            await getManager().query(`update order_product set tracking_no='${trackingNo}' where order_product_id=${orderProductId}`)
            result+=`Sale order Code: ${itemCode} and Reverse Pickup Code Generated: <strong>${returnValue.rpCode}</strong> ${trackingNo?`with assign tracking no ${trackingNo}`:`and no courier assign contact to UC`}<br/>`
            }else{
                result+=`Sale order Code: ${itemCode} (UC is giving error and reverse pickup code is not being generated)<br/>`
            }}catch{
            result+=`Sale order Code: ${itemCode} (UC is giving error and reverse pickup code is not being generated.)<br/>`
            }
        }
        
       const successResponse: any = {
        status: 200,
        message: "RVP Code message",
        data: result.toString(),
    };
    return successResponse
    }
    
    @Get('/sync-inventory-delta')
    public async syncInventoryDelta(@Res() response: any): Promise<void> {

        const { UnicommeService : dd } = require('../services/admin/UnicomService');
        let c = new dd();
        await c.syncInventoryDeltaFromUC();
        const successResponse: any = {
            status: 1,
            message: 'inventory delta synched successfully.',
            data: `inventory delta synched successfully`,
        };
        return response.status(200).send(successResponse);

    }

    @Get('/get-sale-order')
    public async getSaleOrderData(@QueryParam('saleOrderId') saleOrderId: string, @Res() response: any): Promise<void> {

        const { UnicommeService : dd } = require('../services/admin/UnicomService');
        let c = new dd();
        const result = await c.getSaleOrder(saleOrderId);
        const successResponse: any = {
            status: 1,
            message: result.msg,
            data: result.response,
        };
        return response.status(200).send(successResponse);

    }

    @Get('/sync-inventory-internal-scheduler')
    public async syncInvertoryInternally(@Res() response: any): Promise<void> {

        const facilitySkus = await getRepository(FacilitySkuModel).createQueryBuilder("fsm")
        .select(["fsm.facility_code fsCode", "fsm.sku as sku, quantity as qty "])
        .where("fsm.status = :colStatus", { colStatus: "1" })
        
        .getRawMany();

        const fSLength = facilitySkus.length;
      
        if (fSLength > 0) {
            for (let j = 0; j < fSLength; j++) {
                const skuRepository = getManager().getRepository(Sku);
                const groupedSkus = facilitySkus[j];

                const skuData = await skuRepository.findOne({
                    where: {
                       skuName: groupedSkus.sku
                    }
                 });
                 if (skuData) {

                    skuData.quantity = groupedSkus.qty;
                    await skuRepository.save(skuData);
                    
                 }

            }
        }



        const successResponse: any = {
            status: 1,
            message: "Inventory updated successfully",
            data: "Inventory updated successfully",
        };
        return response.status(200).send(successResponse);

    }

    @Get('/get-uc-invoice')
    public async getInvoiceFromUC(@Req() req:any, @Res() res: any): Promise<any> {

        const saleOrder = req.query.saleOrder;
        const { UnicommeService : dd } = require('../services/admin/UnicomService');
            let c = new dd();
            let result:any
            result = await c.downloadInvoiceFromUC(saleOrder);
            if(!result){
                const saleOrderFix = saleOrder.split('-')
                result = await c.downloadInvoiceFromUC(saleOrderFix[1]);
            }
            return res.status(200).send({s3FileKey: result.key}); 
        
    }

    @Get('/migration/update-order-data')
    public async updateMigrationOrderData(@Res() res: any): Promise<any> {

        const orderRepo = getManager().getRepository(Order);
        const ordersQuery: any = orderRepo.createQueryBuilder('order');
        ordersQuery.select(['order.order_prefix_id']);
        ordersQuery.andWhere('MONTH(order.created_date) = 6 AND YEAR(order.created_date) = 2023');
        
        const orders = await ordersQuery.getRawMany();
        
        for (let i = 0; i < orders.length; i++) {

            const saleOrder = orders[i].order_prefix_id.split("-")[1]+"-1";
           // const saleOrder = "1125011";
            const { UnicommeService: dd } = require('../services/admin/UnicomService');
            let c = new dd();
            let result: any
            result = await c.getSaleOrder(saleOrder);
            const orderData = await orderRepo.findOne({
                where: {
                    orderPrefixId: orders[i].order_prefix_id,
                },
            });
            if(result){
            if (result.response == "ORDER_NOT_FOUND_ON_UC") {
                orderData.ucOrderStatus = "ORDER_NOT_FOUND_ON_UC";
                //await orderRepo.save(orderData);
                
            } else {
                orderData.ucOrderStatus = result.response.status;
                //await getManager().query(`INSERT INTO mig_order_status_temp(order_prefix_id, uc_status) VALUES('${saleOrder}', '${result.response.status}') `);
            }
        }

            await orderRepo.save(orderData);
        }

        return res.status(200).send({ response: "order status updated successfully" });

    }

    @Get('/send/return/notifications')
    public async sendReturnNotifications(@Res() res: any): Promise<any> {
        const returnRepo = getManager().getRepository(OrderReturn);
        const activeReturns = await returnRepo.createQueryBuilder().select().where("return_status = :status", { status: 1 }).getMany();
        const totalReturns = activeReturns.length;
        if (activeReturns && totalReturns > 0) {
            const emailTemp = getManager().getRepository(EmailTemplate);
            const orderRepo = getManager().getRepository(Order);
            for (let r = 0; r < totalReturns; r++) {
                const { UnicommeService: dd } = require('../services/admin/UnicomService');
                let c = new dd();
                const saleOrder = await c.getSaleOrder(activeReturns[r].orderPrefixId);

                const returns = saleOrder.response.returns;
                if (returns && returns.length > 0) {
                    const orderPrefixId = activeReturns[r].orderPrefixId;
                    if (activeReturns[r].returnType == "FULL_ORDER_RETURN") {
                        const returnStatus = returns && returns[0].statusCode;
                        
                        if (activeReturns[r].mailSentStatus != returns[0].statusCode) {
                            await returnRepo.createQueryBuilder().update().set({ mailSentStatus: returns[0].statusCode }).where("id=:Id", { Id: activeReturns[r].id }).execute();
                            const orderDetails = await orderRepo.createQueryBuilder().select().where("order_prefix_id = :prefixId", { prefixId: orderPrefixId }).getOne();


                            const emailContent = await emailTemp.findOne({ where: { title: "ORDER_RETURN_NOTIFY" } });

                            let emailBody = emailContent.content.replace('{return_status}', returnStatus);
                            emailBody = emailBody.replace('{order_id}', orderPrefixId);

                            const sendEmailTo = orderDetails.email;
                            const emailSubject = emailContent.subject;
                            MAILService.notifyCustomer(null, emailBody, sendEmailTo, emailSubject, null);
                        }


                    } else {
                        for (let i = 0; i < returns.length; i++) {

                            if (returns[i].code == activeReturns[r].rpCode) {
                                const returnStatus = returns && returns[i].statusCode;
                                if (activeReturns[r].mailSentStatus != returns[i].statusCode) {
                                    await returnRepo.createQueryBuilder().update().set({ mailSentStatus: returns[i].statusCode }).where("id=:Id", { Id: activeReturns[r].id }).execute();
                                    const orderDetails = await orderRepo.createQueryBuilder().select().where("order_prefix_id = :prefixId", { prefixId: orderPrefixId }).getOne();
        
        
                                    const emailContent = await emailTemp.findOne({ where: { title: "ORDER_RETURN_NOTIFY" } });
        
                                    let emailBody = emailContent.content.replace('{return_status}', returnStatus);
                                    emailBody = emailBody.replace('{order_id}', orderPrefixId);
        
                                    const sendEmailTo = orderDetails.email;
                                    const emailSubject = emailContent.subject;
                                    MAILService.notifyCustomer(null, emailBody, sendEmailTo, emailSubject, null);
                                }

                            }
                        }
                    }

                }
            }
        }
        return res.status(200).send({ response: "All return notifications sent successfully" });

    }

@Post('/partial-order-cancel-item')
@Authorized()
public async partialCancelOrder(@Body() request:any){
    console.log("request",request)
    const { UnicommeService : dd } = require('../services/admin/UnicomService');
    let c = new dd();
    const ucResult = await c.cancelSaleOrderPartial(request);
    let result:any={}
    if(ucResult.status==200){
        result.status=200
        result.message='Cancelled successfully'
        result.data=null
    }else{
        result.status=300
        result.message=ucResult.message
        result.data=null
    }
    return result
}

    public async partialCancelCODOrder(orderDetails:any){
console.log("orderDetailsorderDetailsorderDetails11",orderDetails)
        const { UnicommeService : dd } = require('../services/admin/UnicomService');
        let c = new dd();
        const orderLength = orderDetails.length
        const ucResult = await c.cancelSaleOrderPartial(orderDetails);
            const orderData:any = await this._orderService.findOrder(orderDetails[0].orderId)
            const orderProduct:any = await getManager().query(`select order_status_id orderStatusId from order_product where order_id=${orderDetails[0].orderId}`)
            const opLength:any = orderProduct.length
            const orderProductStatus:any[]=[]
            if(opLength>0){
                for(let i=0; i<opLength; i++){
                    orderProductStatus.push(orderProduct[i].orderStatusId)
                }
            }
            console.log("orderProductStatusorderProductStatusorderProductStatus",orderProductStatus)
            if(ucResult.status==200 || orderProductStatus.includes(16) || orderProductStatus.includes(33) || orderProductStatus.includes(34) || orderProductStatus.includes(35)){
                console.log("orderDetails[0].orderId",orderDetails[0].orderId)
                
                console.log("orderDataorderDataorderData343434",orderData)
        for(let i=0; i<orderLength; i++){      
            
            const orderJson:any = {orderProductIds:orderDetails[i].orderProductId, orderStatusId:9, orderId:orderDetails[0].orderId}
            await this._orderService.updateOrderProductStatus(orderJson)
        }

            const orderCancelRequestRepo = getManager().getRepository(OrderCancelRequests);
            await orderCancelRequestRepo.save(orderDetails);

   
            
            const { CreditNoteService : cn } = require('../services/admin/CreditNoteService');
            const cnService = new cn();
            console.log("orderDataorderDataorderData",orderData)
            await cnService.markCnActiveByOrderId(orderData.orderId);


            const emailTemp = getManager().getRepository(EmailTemplate)

            const emailContent = await emailTemp.findOne({where: {title: "ORDER_CANCELLED"}});
            let orderItems:any[]=[]
            orderDetails.forEach((element:any) => {
                orderItems.push(element.itemCode.slice(0,-2))
            });
            const emailBody = emailContent.content.replace('{orderId}', orderData.orderPrefixId).replace('{orderItem}', orderItems.join());
            
            const sendEmailTo = orderData.email;
            const emailSubject = emailContent.subject;
            MAILService.notifyCustomer(null, emailBody, sendEmailTo, emailSubject, null);

            orderData.orderStatusId=9
            const { SmsController : ss } = require('../controllers/SmsController');
            const _sms = new ss();
            await _sms.smsTransaction(orderData)
            return {
                status:200,
                message:ucResult.message,
                data:null
            }
    }else{
        return {
            status:ucResult.status,
            message:ucResult.message,
            data:null
        }
    }
        }


    @Get('/assign-reverse-pickup')
    public async assignReversePickup(@Res() res: any): Promise<any> {
        const { UnicommeService : dd } = require('../services/admin/UnicomService');
        let c = new dd();
        await c.assignReversePickup("RP0138");
        return {
            data: "reverse pickup assigned successfully"
        }
    }

    @Post("/webhook/sync-inventory")
    public async syncInventoryFromUC(@Req() req: any, @Res() res: any){
        if(req.headers.authorization=="bearer 3ff0ffe8-1431-433a-ab13-104090ab131a"){
            appLogger.info(`${JSON.stringify(req.body)}`);
            const { UnicommeService : dd } = require('../services/admin/UnicomService');
            let c = new dd();
            const skuList:any[]= req.body.inventoryList
            const skuListLength= skuList.length
            for (let i=0; i< skuListLength; i++) {
                await c.skuInventoryUpdate(skuList[i].variantId, skuList[i].inventory)
                await c.productActiveOnQuantity(skuList[i].variantId)
            }
            return res.status(200).send({"status": "SUCCESS","failedProductList": []});
        }else{
            return res.status(200).send({ response: "Authorization Failed"});
        }
    }


    @Post('/cancel-reverse-pickup')
    @Authorized()
    public async cancelReversePickup(@Body() req:any){
        console.log("req",req)
        const { UnicommeService : dd } = require('../services/admin/UnicomService');
            let c = new dd();
            const result = await c.cancelReversePickup(req)
            return result
    }


    @Get('/update-tracking-number')
    public async updateTrackingNo(){
        const orderTable: string = "`order`"
        const orderProduct:any = await getManager().query(`select o.order_prefix_id orderPrefixId, op.order_product_id orderProductId, op.sku_name skuName from ${orderTable} o inner join order_product op on op.order_id=o.order_id where op.tracking_no is null and o.created_date>('2024-11-01') and op.order_status_id in (1,4,5)`) 
        console.log("orderProduct",orderProduct)
        const length:any = orderProduct.length
        const { UnicommeService : dd } = require('../services/admin/UnicomService');
        let c = new dd();
        for(let i=0; i<length; i++){
            try{
            const getSaleOrder = await c.getSaleOrder(orderProduct[i].orderPrefixId)            
            const responseData:any[] = getSaleOrder.response.shippingPackages
            const saleOrderItems:any[] = getSaleOrder.response.saleOrderItems
            const filterItem:any = saleOrderItems.filter(item=>item.itemSku==orderProduct[i].skuName)[0]
            const findItem:any = responseData.filter(item=>item.code==filterItem.shippingPackageCode)[0]
            console.log("getSaleOrder",getSaleOrder)
            
        await getManager().query(`update order_product set tracking_no='${findItem.trackingNumber}' where order_product_id=${orderProduct[i].orderProductId}`)
            }catch{
                console.log("true")
            }
        }
        return true
    }
}
