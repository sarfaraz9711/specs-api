import 'reflect-metadata';
import { Get, JsonController, Post, Req, Res } from 'routing-controllers';
import { CommonSchedulerService } from '../../services/Schedulers/CommonSchedulerService';
import { getManager, LessThan } from 'typeorm';
import { Order } from '../../models/Order';
import { CommonService } from '../../common/commonService';
import { CreditNoteService } from '../../services/admin/CreditNoteService';
import moment from 'moment';
import { AuditLogService } from '../../services/AuditLogService';
import { EmailModels } from '../../models/Schedulers/EmailModel';
import { PaytmTransaction } from '../../models/Paytm/PaytmTransaction';

@JsonController('/orderscheduler')
export class DeliverySchedulerController {

    constructor(
        private _commonScheduler : CommonSchedulerService,
        private _m : CommonService,
        public _creditNoteService: CreditNoteService,
        public _auditLogService:AuditLogService
        ){}
        @Get('/sync-all-orders-data-uc')
        public async syncOrderDeliveryDataUc(@Req() req: any, @Res() res: any): Promise<any> {
          //   const ordersWithCreatedStatus =  await getManager().getRepository(Order).find({
          //       select: ['orderId', 'orderPrefixId'],
          //       where: {orderStatusId: In(["1", "20"]), sentOnUc: 1}
          //      });
               const orderTable: string = "`order`"
               const ordersSyncData:any=await getManager().query(`SELECT o.order_id orderId, o.order_prefix_id orderPrefixId, op.order_product_id orderProductId, op.order_status_id orderStatusId, op.tracking_no trackingNo FROM order_product op INNER JOIN ${orderTable} o ON o.order_id=op.order_id WHERE op.order_status_id IN (1,20) AND o.sent_on_uc=1 and o.created_date>DATE_SUB(now(), INTERVAL 1 MONTH) and o.created_date < DATE_ADD(DATE_ADD(NOW(), INTERVAL 5 HOUR), INTERVAL 30 MINUTE)`)
               
               const ordersLength = ordersSyncData.length;
               let orderSyncedCount = 0;
               if(ordersSyncData && ordersLength>0){
      
                for(let i=0;i<ordersLength;i++){
                    const { UnicommeService : dd } = require('../../services/admin/UnicomService');
                    let c = new dd();
                    await c.syncAllOrders(ordersSyncData[i], 1);
                    orderSyncedCount++;
                
                }
               }
      
               const successResponse: any = {
                status: 1,
                message: 'Orders synched successfully.',
                data: `${orderSyncedCount} orders synched successfully`,
            };
            return res.status(200).send(successResponse);
        }

  @Get('/sync-all-orders-data-dehlivery')
  public async syncOrderDeliveryDataDehlivery(@Req() req: any, @Res() res: any): Promise<any> {
    //   const ordersWithCreatedStatus =  await getManager().getRepository(Order).find({
    //       select: ['orderId', 'orderPrefixId'],
    //       where: {orderStatusId: In(["1", "20"]), sentOnUc: 1}
    //      });
         const orderTable: string = "`order`"
         const ordersSyncData:any=await getManager().query(`SELECT o.order_id orderId, o.order_prefix_id orderPrefixId, op.order_product_id orderProductId, op.order_status_id orderStatusId, op.tracking_no trackingNo FROM order_product op INNER JOIN ${orderTable} o ON o.order_id=op.order_id WHERE op.order_status_id IN (4,12,32,21,23,25,24,26) AND o.sent_on_uc=1 and o.created_date>Date('2024-11-01')`)
         
         const ordersLength = ordersSyncData.length;
         let orderSyncedCount = 0;
         if(ordersSyncData && ordersLength>0){
         


          for(let i=0;i<ordersLength;i++){
              const { UnicommeService : dd } = require('../../services/admin/UnicomService');
              let c = new dd();
              await c.syncAllOrders(ordersSyncData[i], 2);
              orderSyncedCount++;
          
          }
         }

         const successResponse: any = {
          status: 1,
          message: 'Orders synched successfully.',
          data: `${orderSyncedCount} orders synched successfully`,
      };
      return res.status(200).send(successResponse);
  }


  @Get('/update-facility-code')
  public async updateFacilityCode(@Req() req: any, @Res() res: any): Promise<any> {

    const { UnicommeService : dd } = require('../../services/admin/UnicomService');
    let c = new dd();
    const result = await c.updateFacilityCode();
    return result

  }

  // Resend All Failed Orders to UC
    /**
     * @api {post} /api/orderscheduler/resend-all-failed-orders-to-uc Insert ECOM Pin code in master
     * @apiGroup Scheduler
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Orders posted successfully.",
     *      "status": "200",
     *      "data" : "5 orders posted successfully"
     * }
     * @apiSampleRequest /api/orderscheduler/resend-all-failed-orders-to-uc
     * @apiErrorExample {json} Page error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/resend-all-failed-orders-to-uc')
    public async resendAllFailedOrders(@Req() req: any, @Res() res: any): Promise<any> {
        // const failedOrders = await getManager().getRepository(Order).find({
        //     select: ['orderId', 'orderPrefixId'],
        //     where: { ucOrderStatus: "FAILED", sentOnUc: 0 }
        // });
        const orderTable:any='`order`'
        const failedOrders = await getManager().query(`SELECT o.order_id orderId, o.order_prefix_id orderPrefixId from ${orderTable} o inner join unicommerce_response ur on ur.order_id =o.order_id where o.sent_on_uc =0 and o.created_date > '2025-03-10' and o.order_status_id in (13) and (o.payment_status =1 or o.payment_method=2);`)


        const ordersLength = failedOrders.length;
        
        if (failedOrders && ordersLength > 0) {

            const { UnicommeService: dd } = require('../../services/admin/UnicomService');
            let c = new dd();


            await c.resendAllFailedOrders(failedOrders);
           
        }

        const successResponse: any = {
            status: 1,
            message: 'Orders posted successfully.',
            data: `orders posted successfully`,
        };
        return res.status(200).send(successResponse);
    }




    // Fail Order
    /**
     * @api {get} /api/orderscheduler/failed-order-data Fail Order
     * @apiGroup Scheduler
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Orders failed.",
     *      "status": "200",
     *      "data" : "5 record updated"
     * }
     * @apiSampleRequest /api/orderscheduler/failed-order-data
     * @apiErrorExample {json} Page error
     * HTTP/1.1 500 Internal Server Error
     */
     @Get('/failed-order-data')
     public async checkFailOrder(@Req() req: any, @Res() res: any): Promise<any> {
        
         let _c = getManager().getRepository(Order).createQueryBuilder('o');
         _c.select(["o.order_id","o.order_prefix_id"]);
         _c.where("(UNIX_TIMESTAMP(o.created_date)) < UNIX_TIMESTAMP(DATE_SUB(created_date, INTERVAL 30 MINUTE))");
         let _raw = await _c.getRawMany();
         
 
        //  const ordersLength = failedOrders.length;
        //  if (failedOrders && ordersLength > 0) {
        //      const { UnicommeService: dd } = require('../../services/admin/UnicomService');
        //      let c = new dd();
        //      await c.resendAllFailedOrders(failedOrders);
        //  }
 
         const successResponse: any = {
             status: 200,
             message: 'Orders posted successfully.',
             data: `orders posted successfully`,
             dataSubject : _raw
         };
         return res.status(200).send(successResponse);
     }





     // Expire Promotion delete
    /**
     * @api {get} /api/orderscheduler/remove-expired-promotion-product Remove expired promotion
     * @apiGroup Scheduler
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Product Updated.",
     *      "status": "200",
     *      "data" : "5 record updated"
     * }
     * @apiSampleRequest /api/orderscheduler/remove-expired-promotion-product
     * @apiErrorExample {json} Page error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/remove-expired-promotion-product')
    public async removeExpiredPromotions(@Req() req: any, @Res() res: any): Promise<any> {
       
        let _r = await this._commonScheduler.updateProductForExpiredPromotion();
        return res.status(200).send(this._m.getMessage(200,_r));
    }

    @Get('/active-cn-of-failed-orders')
    public async activeCnsOfFailedOrders(@Req() req: any, @Res() res: any): Promise<any> {
        const failedOrdersCn = await getManager().query('SELECT o.order_id from `order` AS o JOIN tt_credit_notes AS tcn ON(o.order_id = tcn.cn_applied_order_id) WHERE o.order_status_id IN (11,13,9) AND o.sent_on_uc = 0 AND o.invoice_prefix <> "OR" AND tcn.status = 0 AND o.credit_note_order IS NULL')
        
        const failedOrdersCoupon =  await getManager().query('SELECT o.order_id FROM `order` o INNER JOIN tt_promotions_usage_orders c ON o.order_id=c.order_id WHERE o.order_status_id IN (11,13,9) AND o.sent_on_uc=0 AND o.invoice_prefix!="OR" AND c.promotion_type="CouponBased" AND c.coupon_code NOT LIKE "%_CANCELLED%" AND DATE(c.created_date)> DATE("2024-04-21") ORDER BY o.order_id DESC')
        const mergeArray:any=failedOrdersCn.concat(failedOrdersCoupon)
        const orderLength = mergeArray.length
        for(let i=0; i<orderLength; i++){
            await this._creditNoteService.markCnActiveByOrderId(mergeArray[i].order_id)
        }
        
    //     const queryResults = await getManager().query(`SELECT cn.id FROM tt_credit_notes cn LEFT JOIN tt_promotions_usage_orders pu ON pu.coupon_code=cn.cn_code WHERE pu.coupon_code IS NULL AND cn_applied_order_id='' AND cn.status=0 AND cn.modified_by IS NULL`);

    //    let inActiveIds=[];
    //     for(let i=0; i<queryResults.length; i++){
    //         inActiveIds.push(queryResults[i].id)
    //     }
        //await getManager().query(`UPDATE tt_credit_notes SET status = 1 WHERE id IN (${inActiveIds})`)

        const successResponse: any = {
            status: 1,
            message: 'CN reverted successfully.',
        };
        return res.status(200).send(successResponse);
    }

    // @Get('/active-cn-of-failed-orders')
    // public async activeCnsOfFailedOrders(@Req() req: any, @Res() res: any): Promise<any> {
    //     const failedOrders = await getManager().query('SELECT o.order_id, o.order_prefix_id from `order` AS o JOIN tt_credit_notes AS tcn ON(o.order_id = tcn.cn_applied_order_id) WHERE o.order_status_id IN (11, 13) AND o.sent_on_uc = 0 AND o.invoice_prefix <> "OR" AND tcn.status = 0 AND o.credit_note_order IS NULL')
        
        
    //      const ordersLength = failedOrders.length;
    //      const creditNoteRepo = getManager().getRepository(CreditNoteModel);
    //      if (failedOrders && ordersLength > 0) {
    //         const orderRepo = getManager().getRepository(Order);
            
    //         for(let r=0;r<ordersLength;r++){
    //             const checkUcRecord = await getManager().query(`SELECT COUNT(id) AS rowCount FROM unicommerce_response WHERE order_prefix_id = "${failedOrders[r].order_prefix_id}"`);
               
    //             if(checkUcRecord[0].rowCount < 1){
                    
    //             await creditNoteRepo.createQueryBuilder().update().set({status: true}).where("cn_applied_order_id = :opId", {opId: failedOrders[r].order_id}).execute();
    //             const currentDate = new Date();
                
    //             let cnStatus = `REVERT_${currentDate.getDate()}-${currentDate.getMonth()+1}-${currentDate.getFullYear()}-${currentDate.getHours()}:${currentDate.getMinutes()}`;
    //             await orderRepo.createQueryBuilder().update().set({creditNoteForOrder: cnStatus}).where("order_id= :opId", {opId: failedOrders[r].order_id}).execute();
    //             }
    //         }
           
    //      }


    //      // Case 2: If user clicks on Place order and then closes the Payment popup
    //     const dbQuery =  await getManager().query(`select id from tt_credit_notes tcn where status = 0 and cn_applied_order_id = ''`)
    //     const dbQueryLength = dbQuery.length;
    //     if(dbQueryLength && dbQueryLength>0){
    //     console.log(dbQuery, "Nero sssss++++++++++++++++++++++++++++++++++++++")
    //     for(let i=0;i<dbQueryLength;i++){
               
    //         await creditNoteRepo.createQueryBuilder().update().set({status: true}).where("id = :Id", {Id: dbQuery[i].id}).execute();
    //     }
            
    //     }

        

    //     const successResponse: any = {
    //         status: 1,
    //         message: 'CN reverted successfully.',
    //         data: `${ordersLength} CN reverted successfully`,
    //     };
    //     return res.status(200).send(successResponse);
    // }

    @Get('/delete-old-captcha-data')
    public async deleteOldCaptchaData(@Req() req: any, @Res() res: any): Promise<any> {
    
        const queryResults = await getManager().query(`SELECT id from custom_captcha cc WHERE Date(created_date) < DATE_SUB(NOW(), INTERVAL 2 DAY)`)
        
        const arrayOfStrings = queryResults.map(obj => obj.id);

        if(arrayOfStrings && arrayOfStrings.length > 0){
            const IdsInString = arrayOfStrings.toString();
            await getManager().query(`DELETE FROM custom_captcha WHERE id IN (${IdsInString})`);
            return {message: "old captcha Data delete successfully"};
        }else {
            return {message: "No old data found. Deleted nothing"};
        }

    
    }

    @Post('/order-status-sync-prozo')
    public async orderStatusSyncByWebhookProzo(@Req() req:any, @Res() res:any){
        if(req.body){
            try{
            if(req.headers.authorization=="bearer 3ff0ffe8-1431-433a-ab13-104090ab131a"){
                const { UnicommeService : dd } = require('../../services/admin/UnicomService');
                const result:any=req.body
                        let c = new dd();
                        c.getOrderStatusByLogistics(result);
                return res.status(200).send({ response: "Order Status synched successfully"});
            }else{
                return res.status(200).send({ response: "Authorization Failed"});
            }
        }catch{
            return res.status(200).send({ response: "Something went wrong"});
        }
    }else{
        return res.status(200).send({ response: "No Data Found"});
    }
    }

    @Post('/order-status-sync-delhivery')
    public async orderStatusSyncByWebhookDehlivery(@Req() req:any, @Res() res:any){
        if(req.body){
        try{
        if(req.headers.authorization=="bearer 3ff0ffe8-1431-433a-ab13-104090ab131a"){
            const { UnicommeService : dd } = require('../../services/admin/UnicomService');
            const result:any=req.body
                    let c = new dd();
                    c.getOrderStatusByLogistics(result);
            return res.status(200).send({ response: "Order Status synched successfully"});
        }else{
            return res.status(200).send({ response: "Authorization Failed"});
        }
    }catch{
        return res.status(200).send({ response: "Something went wrong"});
    }
}else{
    return res.status(200).send({ response: "No Data Found"});
}
    }


@Get('/failed_cn_coupon_active')
public async failedCnCouponActive(){
    const fs = require("fs");
    var logger = fs.createWriteStream('logs/failedCnCouponActive.txt', {
       flags: 'a' // 'a' means appending (old data will be preserved)
    })
    var writeLine = (line) => logger.write(`\n${line}`);
    const currentDate = new Date();
    const orderTable:any ='`order`'
    const creditNoteResult:any = await getManager().query(`SELECT o.order_id, tcn.cn_code from ${orderTable} o inner join tt_credit_notes tcn on tcn.cn_applied_order_id =o.order_id inner join tt_promotions_usage_orders tpuo on tpuo.coupon_code =tcn.cn_code where order_status_id in (11,13) and tcn.status=0 and tcn.cn_expiry_date >now() and tpuo.coupon_code not like '%_CANCELLED' and o.sent_on_uc=0 and o.payment_status=2`)
    
    if(creditNoteResult.length>0){
    await getManager().query(`update ${orderTable} o inner join tt_credit_notes tcn on tcn.cn_applied_order_id =o.order_id inner join tt_promotions_usage_orders tpuo on tpuo.coupon_code =tcn.cn_code set tcn.status=1, tpuo.coupon_code = CONCAT(tpuo.coupon_code,'_CANCELLED') where o.order_status_id in (11,13) and tcn.status=0 and tcn.cn_expiry_date >now() and tpuo.coupon_code not like '%_CANCELLED' and o.sent_on_uc=0 and o.payment_status=2 and tpuo.promotion_type='CreditNote'`)
    writeLine(`${JSON.stringify(creditNoteResult)} Date: ${moment(currentDate).format('YYYY-MM-DD HH:mm:ss')}`)
    }

    const couponResult:any = await getManager().query(`select o.order_id, tpuo.coupon_code from ${orderTable} o inner join tt_promotions_usage_orders tpuo on tpuo.order_id =o.order_id where tpuo.promotion_type='CouponBased' and o.order_status_id in (11,13) and o.created_date >='2024-12-12' and tpuo.coupon_code not like '%_CANCELLED%' and o.sent_on_uc=0 and o.payment_status=2`) 

    if(couponResult.length>0){            
    await getManager().query(`update ${orderTable} o inner join tt_promotions_usage_orders tpuo on tpuo.order_id =o.order_id set tpuo.coupon_code = CONCAT(tpuo.coupon_code,'_CANCELLED') where tpuo.promotion_type='CouponBased' and o.order_status_id in (11,13) and o.created_date >='2024-12-12' and tpuo.coupon_code not like '%_CANCELLED%' and o.sent_on_uc=0 and o.payment_status=2`) 
    writeLine(`${JSON.stringify(couponResult)} Date: ${moment(currentDate).format('YYYY-MM-DD HH:mm:ss')}`)
    }

    const loyaltyResult:any = await getManager().query(`SELECT o.order_id, tpuo.promotion_identifier, o.created_date from ${orderTable} o inner join redchief_prod_db.tt_promotions_usage_orders tpuo on tpuo.order_id =o.order_id  where tpuo.promotion_type='loyaltyPoint' and o.order_status_id in (11,13) and o.created_date >'2024-12-12' and o.sent_on_uc=0 and o.payment_status=2;`)

    if(loyaltyResult.length>0){
        for(let i=0; i<loyaltyResult.length; i++){

        }
    }


    return 'Data updated successfully'
}

@Get('/delete-activity-log')
public async deleteActivityLog(){
    const auditMonth = moment().subtract(1, 'months').format('YYYY-MM-DD');
    const exceptOneMonthRcrd = await this._auditLogService.find({
      where: {
        createdDate: LessThan(auditMonth),
      },
    });
    if (exceptOneMonthRcrd.length) {
      await this._auditLogService.delete(exceptOneMonthRcrd);
    }
    return true
}

@Get('/delete-paytm-pending-transaction')
public async deletePaytmPendingTransaction(){
    const smsDate = moment().subtract(1, 'days').format('YYYY-MM-DD');
    const _paytm:any = getManager().getRepository(PaytmTransaction)
    const exceptRcrd = await _paytm.find({
      where: {
        createdDate: LessThan(smsDate),
        paymentType:'PENDING'
      },
    });
    if (exceptRcrd.length) {
      await _paytm.delete(exceptRcrd);
    }
    return true
}
@Get('/delete-email')
public async deleteEmail(){
    const emailDate = moment().subtract(7, 'days').format('YYYY-MM-DD');
    const _email:any = getManager().getRepository(EmailModels)
    const exceptRcrd = await _email.find({
      where: {
        createdDate: LessThan(emailDate),
      },
    });
    if (exceptRcrd.length) {
      await _email.delete(exceptRcrd);
    }
    return true
}


}