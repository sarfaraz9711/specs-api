import { Service } from "typedi";
import { CreditNoteModel } from "../../models/CreditNoteModel";
import { getManager } from "typeorm";
import { Order } from "../../models/Order";
import { OrderProduct } from "../../models/OrderProduct";
import {} from '../../controllers/OrderController'
import { EmailTemplate } from "../../models/EmailTemplate";
import { MAILService } from '../../../auth/mail.services';
import { PromotionsUsageOrders } from "../../models/Promotions/PromotionsUsageOrders";
import moment from "moment";
const appLogger =  require('../../services/admin/AppLoggerService')
@Service()
export class CreditNoteService {
    public creditNoteRepo = getManager().getRepository(CreditNoteModel);
    
    public async findOne(data:any){
        return await this.creditNoteRepo.findOne(data)
    }
    
    public async create(data:any): Promise<any>{
        return this.creditNoteRepo.save(data)
    }
    
    public async update(data:any): Promise<any>{
        return this.creditNoteRepo.update(data.id, data)
    }

    public async createCreditNote(orderRecord:any, orderProductId:any, creditNoteAmount, getUser:any):Promise<any>{
      const creditNoteRepo = getManager().getRepository(CreditNoteModel);
        const orderRepo = getManager().getRepository(Order);
        const orderProductRepo = getManager().getRepository(OrderProduct);
        
        var currentdate = new Date();
        var dd=("0"+currentdate.getDate()).slice(-2)
        var mm=("0"+(currentdate.getMonth()+1)).slice(-2)
        var yyyy=currentdate.getFullYear()
        var today=yyyy+'-'+mm+'-'+dd

        const expirrDate=currentdate.setMonth(currentdate.getMonth() + 3);  
        const currentDateWithTime = moment(expirrDate).set({hour: 23,minute: 59,second: 59}).format('YYYY-MM-DD HH:mm:ss');
        
        console.log(currentDateWithTime);
        const expiryDate = currentDateWithTime;
        // let orderProductTotal;
        // if(orderProductId){
        //     const orderProductRecord = await orderProductRepo.findOne({where: {orderProductId: orderProductId}});
        //     orderProductTotal = orderProductRecord.total;
        // }

        const createObj = new CreditNoteModel()
        const creditNote = ("CN"+(Math.random() + 1).toString(36).substring(7)).toUpperCase();
        createObj.cn_code =  creditNote
        //createObj.cn_amount = orderProductId? Number(orderProductTotal): Number(orderRecord.total);
        createObj.cn_amount = creditNoteAmount;
        createObj.cn_applied_order_id = "";
        createObj.status = true;
        if(orderProductId){
            createObj.order_product_id = orderProductId;
        }
        createObj.cn_created_date = today;
        createObj.cn_expiry_date = expiryDate;
        createObj.cn_source_order_id = orderRecord.orderId;
        createObj.emailId = getUser.email;
        createObj.mobile = getUser.mobileNumber;
        createObj.channelName = "Admin";
        const savedRecord = await creditNoteRepo.save(createObj);


        if(savedRecord){
            appLogger.info(`CN CREATE : ${JSON.stringify(savedRecord)}`,  {fileName: "creditNotes"});
            if(orderProductId){
                const { OrderService : os } = require('../../services/OrderService');
                const _orderService = new os();
                const orderProductSplit:any = orderProductId.split(",")
                console.log("orderProductSplit",orderProductSplit)
                const length = orderProductSplit.length
                for(let i=0; i<length; i++){
                    const json = {
                        orderStatusId:17,
                        orderProductIds:orderProductSplit[i],
                        deliveredDate:null,
                        orderId:orderRecord.orderId
                        }
                    await _orderService.updateOrderProductStatus(json)
                }

            }else{
            const updateOrderProduct = orderProductRepo.createQueryBuilder();
            await updateOrderProduct.update().set({orderStatusId:9, givenReturnCancelledType: "CREDIT_NOTE"}).where("order_id=:id", {id: orderRecord.orderId}).execute();
            
            const orderRepoQuery = orderRepo.createQueryBuilder();
            await orderRepoQuery.update().set({orderStatusId:9, givenReturnCancelledType: "CREDIT_NOTE"}).where("order_id=:id", {id: orderRecord.orderId}).execute();

            
            }
            
            /*Send Credit Note Created Email to Customer, Starts Here*/
            const emailTemp = getManager().getRepository(EmailTemplate)
            const orderRepoQuery1 = orderRepo.createQueryBuilder();
            const emailContent = await emailTemp.findOne({where: {title: "CREDIT_NOTE_CREATED"}});
            const orderDetails = await orderRepoQuery1.select().where("order_id = :oId",  {oId: orderRecord.orderId}).getOne();
            let emailBody = emailContent.content.replace('{creditNoteAmount}', creditNoteAmount.toString());
            emailBody = emailBody.replace('{creditNote}', creditNote);
            
            
            const sendEmailTo = orderDetails.email;
            const emailSubject = emailContent.subject;
            MAILService.notifyCustomer(null, emailBody, sendEmailTo, emailSubject, null);
            /*Send Credit Note Created to Customer, Ends Here*/

        }


    }

    public async applyCreditNote(cnCode:any, getUser:any, cnAmount:any=null){
        const cnRepo = getManager().getRepository(CreditNoteModel);
        const cnQuery = cnRepo.createQueryBuilder("cn")
        cnQuery.select(["cn.cn_code AS cn_code", "cn.cn_amount AS cn_amount", "cn.status AS cn_status"])
        cnQuery.where("cn.status = :st", {st: 1})
        cnQuery.andWhere("cn.cn_code = :code", {code: cnCode})
        cnQuery.andWhere("cn.emailId = :email", {email:getUser.email})
        cnQuery.andWhere("cn.mobile = :mobile", {mobile:getUser.mobileNumber})
        cnQuery.andWhere("cn.cn_expiry_date > now()")
        if(cnAmount){
            cnQuery.andWhere("cn.cn_amount = :cnAmt", {cnAmt: cnAmount})
        }
       const recordFound = await cnQuery.execute();
       
       if(recordFound && recordFound.length > 0 ){
            return recordFound;
       }else{
            return []
       }
    }

    public async validateCreditNote(cnCode:any, userId:any, cnAmount:any=null, getUser:any){
        const cnRepo = getManager().getRepository(CreditNoteModel);
        const cnQuery = cnRepo.createQueryBuilder("cn")
        cnQuery.select(["cn.cn_code cnCode", "cn.cn_amount AS cnAmount", "cn.status AS status"])
        cnQuery.leftJoin(PromotionsUsageOrders, 'pu','pu.coupon_code=cn.cn_code')
        cnQuery.where("cn.status = :st", {st: 1})
        cnQuery.andWhere("cn.cn_code = :code", {code: cnCode})
        cnQuery.andWhere("cn.emailId = :email", {email:getUser.email})
        cnQuery.andWhere("cn.mobile = :mobile", {mobile:getUser.mobileNumber})
        cnQuery.andWhere("cn.cn_expiry_date >= CURDATE()")
        cnQuery.andWhere("cn.cn_amount <= :cnAmt", {cnAmt: cnAmount})
        cnQuery.andWhere("pu.coupon_code is null")
       const recordFound = await cnQuery.getRawOne();
       
       if(recordFound){
            return recordFound;
       }else{
            return false
       }
    }

    public async markCnInactive(cnCode:any){
        const cnRepo = getManager().getRepository(CreditNoteModel);
        const cnRepoQuery = cnRepo.createQueryBuilder();
        await cnRepoQuery.update().set({status:false}).where("cn_code=:code", {code: cnCode}).execute();
    }

    public async markCnActiveByOrderId(orderId:any){
        await getManager().query(`UPDATE tt_credit_notes SET status = '1', modified_date=DATE_ADD(DATE_ADD(NOW(), INTERVAL 5 HOUR), INTERVAL 30 MINUTE) WHERE cn_applied_order_id =${orderId}`); 

        await getManager().query(`update tt_promotions_usage_orders uo set uo.coupon_code = CONCAT(uo.coupon_code,'_CANCELLED'), modified_date=DATE_ADD(DATE_ADD(NOW(), INTERVAL 5 HOUR), INTERVAL 30 MINUTE) where uo.order_id = ${orderId} AND uo.promotion_type in ("CreditNote")`)
    }

    public async markCouponActiveByOrderId(orderId:any){
        await getManager().query(`update tt_promotions_usage_orders uo set uo.coupon_code = CONCAT(uo.coupon_code,'_CANCELLED'), modified_date=DATE_ADD(DATE_ADD(NOW(), INTERVAL 5 HOUR), INTERVAL 30 MINUTE) where uo.order_id = ${orderId} AND uo.promotion_type in ("CouponBased")`)
    }

    public async updateOrderIdInCN(orderId:any, cnCode: any){
        const cnRepo = getManager().getRepository(CreditNoteModel);
        const cnRepoQuery = cnRepo.createQueryBuilder();
        await cnRepoQuery.update().set({cn_applied_order_id:orderId}).where("cn_code=:code", {code: cnCode}).execute();
    }

    public async getCnDetailByOrderId(orderId:any, order_product_id:any = null){
        const record = await this.creditNoteRepo.find({where:{cn_source_order_id: orderId}})
        return record;
    }

    public async getCnDetailByAppliredOrderId(orderId:any, order_product_id:any = null){
        const record = await this.creditNoteRepo.find({where:{cn_applied_order_id: orderId}})
        return record;
    }


public async getCreditNotesOfUser(userId:any){
    const cnRepo:any = await getManager().query(`SELECT (CASE WHEN (status=1 AND DATE(cn.cn_expiry_date) >= CURRENT_DATE()) THEN 'Active' WHEN t.coupon_code IS NOT NULL THEN 'Redeem'  WHEN DATE(cn.cn_expiry_date) < CURRENT_DATE() THEN 'Expired' ELSE 'In Active' END) actStatus, cn.* FROM customer c INNER JOIN tt_credit_notes cn ON cn.mobile=c.mobile COLLATE utf8mb4_unicode_ci LEFT JOIN tt_promotions_usage_orders t ON t.coupon_code=cn.cn_code WHERE c.id=${userId}`)
    console.log("cnRepocnRepocnRepocnRepocnRepo",cnRepo)
   return cnRepo
}

public async creditNoteAmount(orderId:any){
    const record = await this.creditNoteRepo.findOne({where:{cn_applied_order_id: orderId}})
    return record;
}
public async getCnList(searchItems:any){
    const cnRepo = getManager().getRepository(CreditNoteModel);
    const cnQuery = cnRepo.createQueryBuilder("cn")
    cnQuery.select(["cn.id as Id", "cn.cn_code AS cnCode", "cn.cn_amount AS cnAmount", "cn.status AS cnStatus", "cn.cn_expiry_date AS expiredDate", "cn.cn_created_date AS cnCreatedDate", "cn.cn_source_order_id AS sourceOrderId", "o.order_prefix_id AS sourceOrderPrefixId", "od.order_prefix_id AS appliedOrderId", "cn.email_id AS emailId","cn.mobile AS mobile", "cn.channel_name AS channelName", "cn.modified_date AS modifiedDate", "cn.created_date AS createdDate"])
    cnQuery.leftJoin(Order, 'o', "cn.cn_source_order_id = o.order_id")
    cnQuery.leftJoin(Order, 'od', "cn.cn_applied_order_id = od.order_id")
    if(searchItems.cn_source_order_id){
        cnQuery.where("o.order_prefix_id = :opId", {opId: searchItems.cn_source_order_id})
    }
    if(searchItems.cn_code){
        cnQuery.andWhere("cn.cn_code = :cCode", {cCode: searchItems.cn_code})
    }
    if(searchItems.status){
        cnQuery.andWhere("cn.status = :cnStatus", {cnStatus: searchItems.status})
        cnQuery.andWhere("cn.cn_expiry_date>now()")
    }
    if(searchItems.channelName){
        cnQuery.andWhere("cn.channel_name = :channelName", {channelName: searchItems.channelName})
    }
    if(searchItems.amount){
        cnQuery.andWhere("cn.cn_amount = :amount", {amount: searchItems.amount})
    }
    if(searchItems.email){
        cnQuery.andWhere("cn.email_id = :email", {email: searchItems.email})
    }
    if(searchItems.mobile){
        cnQuery.andWhere("cn.mobile = :mobile", {mobile: searchItems.mobile})
    }
    if(searchItems.type){
        if(searchItems.type=='Admin' || searchItems.type=='Service and Repair'){
            cnQuery.andWhere("cn.channel_name = :type", {type: searchItems.type})
        }else{
            cnQuery.andWhere("cn.channel_name != 'Admin'")
            cnQuery.andWhere("cn.channel_name != 'Service and Repair'")
        }
    }
    if(searchItems.fromDate && searchItems.toDate){
        cnQuery.andWhere(`Date(cn.createdDate) BETWEEN Date('${searchItems.fromDate}') AND Date('${searchItems.toDate}')`);
    }
    
    // else if(searchItems.fromDate){
    //     cnQuery.andWhere(`Date(cn.cn_created_date)=Date('${searchItems.fromDate}')`);
    // }else if(searchItems.toDate){
    //     cnQuery.andWhere(`Date(cn.cn_expiry_date)=Date('${searchItems.toDate}')`);
    // }
    cnQuery.orderBy('cn.id', 'DESC')
    if(searchItems.limit){
    cnQuery.limit(searchItems.limit)
    }
   const recordFound = await cnQuery.execute();
   if(recordFound){
        return recordFound;
   }else{
        return "record not found"
   }
}

    public async updateCN(updateObj: any, userId:any) {
        const cnId = updateObj.cnId;
        const cnRepo = getManager().getRepository(CreditNoteModel);
        if (cnId) {
            let cnEntity = await cnRepo.findOne(cnId);
            console.log("cnEntitycnEntitycnEntity",cnEntity)
            if (cnEntity) {

                if (updateObj.status === 0 || updateObj.status === 1) {
                    cnEntity.status = updateObj.status == 0 ? false : true
                }
                if (updateObj.amount) {
                    cnEntity.cn_amount = updateObj.amount;
                }
                // cnEntity.modifiedDate=new Date().toDateString()
                cnEntity.modifiedBy=userId
                
                try {
                    console.log("newObjnewObj",cnEntity)
                    await cnRepo.update(cnEntity.id,cnEntity)
                    const cnEntityAfterUpdate = await cnRepo.findOne(cnId);
                    appLogger.info(`CN UPDATE : ${JSON.stringify(cnEntityAfterUpdate)}`,  {fileName: "creditNotes"});
                    return true;
                } catch (error) {
                    console.log(error, "Error while updating CN")
                    return false;
                }

            } else {
                return false;
            }
        } else {
            return false;
        }
    }
}