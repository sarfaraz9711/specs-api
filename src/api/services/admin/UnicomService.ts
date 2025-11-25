import { createQueryBuilder, getManager, getRepository } from 'typeorm';
import { UnicommerceResponseModel } from '../../models/Unicommerce/UniCommerceModel';
import { Order } from '../../models/Order';
import { env } from '../../../env'
// import { Sku } from '../../models/SkuModel';
// import { OrderTrackingModel } from '../../models/OrderTrackingModel';
import { FacilitySkuModel } from '../../models/Master/FacilitySkuModel';
import { FacilityInventorySyncModel} from '../../models/Schedulers/FacilityInventorySyncModel';
import { OrderProduct } from '../../models/OrderProduct';
import { CustomerCart } from '../../models/CustomerCart';
import { OrderStatus } from '../../models/OrderStatus';
import { MAILService } from '../../../auth/mail.services';
import moment from 'moment';
import { EmailTemplate } from '../../models/EmailTemplate';
import { EmailModels } from '../../models/Schedulers/EmailModel';
import { Sku } from '../../models/SkuModel';
import { ProductVarientOption } from '../../models/ProductVarientOption';
import { Product } from '../../models/ProductModel';
import { RefundBalanceSummaryModel } from '../../models/RefundBalanceSummaryModel';
import { AssignedReversePickupModel } from '../../models/AssignedReversePickup';
import { AuditLog } from '../../models/AuditLog';
import { FacilityMap } from '../../models/FacilityMap';
export class UnicommeService {

   public axios = require('axios');
   public async getUniComToken(): Promise<any> {
      const uciToken = await this.axios.get(`${env.uniComm.apiUrl}/oauth/token?grant_type=password&client_id=my-trusted-client&username=${env.uniComm.userName}&password=${env.uniComm.password}`);
      return uciToken;
   }

   public async sendOrderToUC(orderData: any, saleOrderItems: any): Promise<any> {
      const orderProductRepository = getManager().getRepository(OrderProduct);
      const customerCartService = getManager().getRepository(CustomerCart);
      const refundSummaryRepo = getManager().getRepository(RefundBalanceSummaryModel);
      const productDetailData:any = await orderProductRepository.find({where: {orderId:orderData.orderId}})
      let productTotalDiscount:number=0
      for (let i = 0; i < productDetailData.length; i++) {
         productTotalDiscount += Math.round(((+productDetailData[i].discountAmount)+(productDetailData[i].discountAmount*productDetailData[i].taxValue/100))*productDetailData[i].quantity)
            const cart = await customerCartService.findOne({ where: { productId: productDetailData[i].productId, customerId: orderData.customerId } });
            if (cart !== undefined) {
                await customerCartService.delete(cart.id);
            }
         }
         let prepaidDiscount:number=0
         if(productTotalDiscount>Number(orderData.discountAmount)){
            prepaidDiscount=productTotalDiscount-Number(orderData.discountAmount)
         }else{
            prepaidDiscount=Number(orderData.discountAmount)-productTotalDiscount
         }
         const today = moment(new Date()).format('DD-MM-YYYY, HH:mm');
         const emailTemp = getManager().getRepository(EmailTemplate)
         const emailContent = await emailTemp.findOne(5);
         const customerName = orderData.shippingFirstname;
         const customerMessage = emailContent.content.replace('{name}', customerName).replace('{orderId}',orderData.orderPrefixId);
         MAILService.customerOrderMail(null, customerMessage, orderData, emailContent.subject, productDetailData, today, null);
      
         const unicommerceResponseModel = getManager().getRepository(UnicommerceResponseModel);
         const orderRepository = getManager().getRepository(Order);

      /*********************************/
      let uc_payload = new UnicommerceResponseModel();
      uc_payload.orderId = orderData.orderId;
      uc_payload.orderPrefixId = orderData.orderPrefixId;
      uc_payload.requestType = "CreateSaleOrder";
      let saleOrder:any = {};
      if(orderData.paymentMethod==2 && orderData.total!=0){
         saleOrder = {
            "saleOrder": {
               "code": orderData.orderPrefixId,
               "displayOrderCode": orderData.orderPrefixId,
               "channel": env.uniComm.channel,
               "cashOnDelivery": true,
               "taxExempted": true,
               "totalShippingCharges": orderData.shippingCharges,
               "addresses": [
                  {
                     "id": "19",
                     "name": `${orderData.shippingFirstname}`,
                     "addressLine1": orderData.shippingAddress1,
                     "addressLine2": orderData.shippingAddress2,
                     "city": orderData.shippingCity,
                      "state": orderData.shippingZone,
                     "country": "India",
                     "pincode": orderData.shippingPostcode,
                     "phone": orderData.telephone
                  }
                  
               ],
               "billingAddress": {
                  "referenceId": "19"
               },
               "shippingAddress": {
                  "referenceId": "19"
               },
               "saleOrderItems": saleOrderItems,
               "totalCashOnDeliveryCharges": 0,
               "totalStoreCredit":0,
               "totalPrepaidAmount":prepaidDiscount+Number(orderData.appliedCnAmount),
   
            }
         }
      }else{
       saleOrder = {
         "saleOrder": {
            "code": orderData.orderPrefixId,
            "displayOrderCode": orderData.orderPrefixId,
            "channel": env.uniComm.channel,
            "cashOnDelivery": false,
            "taxExempted": true,
            "totalShippingCharges": orderData.shippingCharges,
            "addresses": [
               {
                  "id": "19",
                  "name": `${orderData.shippingFirstname}`,
                  "addressLine1": orderData.shippingAddress1,
                  "addressLine2": orderData.shippingAddress2,
                  "city": orderData.shippingCity,
                   "state": orderData.shippingZone,
                  "country": "India",
                  "pincode": orderData.shippingPostcode,
                  "phone": orderData.telephone
               }
               
            ],
            "billingAddress": {
               "referenceId": "19"
            },
            "shippingAddress": {
               "referenceId": "19"
            },
            "saleOrderItems": saleOrderItems,
            "totalStoreCredit":0,
            "totalPrepaidAmount":prepaidDiscount+Number(orderData.appliedCnAmount),

         }
      }
      };

      uc_payload.uniRequest = JSON.stringify(saleOrder);
      let savedResponse = await unicommerceResponseModel.save(uc_payload);
      const  auditLog = getManager().getRepository(AuditLog);
      try {

         await this.getUniComToken().then(async resp => {
            if (resp && resp.data && resp.data.access_token) {




               const headers = {
                  'Content-Type': 'application/json',
                  'Authorization': `${resp.data.token_type} ${resp.data.access_token}`,
                  'facility': env.uniComm.facilityCode
               };

               this.axios.post(`${env.uniComm.apiUrl}/services/rest/v1/oms/saleOrder/create`, saleOrder, {
                  headers: headers
               })
                  .then(async (response: any) => {
                     
                     let uc_response={"response":response.data};
                 
                     
                      let auditLogData:any = new AuditLog();
                      auditLogData.object = JSON.stringify(uc_response);
                      auditLogData.description = "Saving Request and Response of Creating Sale order on UC";
                      auditLogData.requestUrl = `${env.uniComm.apiUrl}/services/rest/v1/oms/saleOrder/create`;
                      auditLogData.method = "POST";
                      auditLogData.logType = "REQUEST_RESPONSE"; 
                      auditLogData.params = JSON.stringify({"request_payload": saleOrder});
                      auditLogData.userName = orderData.orderPrefixId;
                      await auditLog.save(auditLogData);

                     const { CreditNoteService : cns } = require('../../services/admin/CreditNoteService');
                     if (response && response.data && response.data.successful && response.data.errors.length < 1) {
                        orderData.sentOnUc = true;
                        orderData.ucOrderStatus = response.data.saleOrderDetailDTO.status;
                        savedResponse.uniResponse = JSON.stringify(response.data.saleOrderDetailDTO);
                        const _cnsService = new cns();
                        const cnData = await _cnsService.getCnDetailByAppliredOrderId(orderData.orderId);
                       if(cnData && cnData.length>0){
                        orderData.appliedCnAmount = cnData[0].cn_amount;
                        orderData.appliedCnCode = cnData[0].cn_code;

                        const cnOrderData = await orderRepository.findOne({where: {orderId: cnData[0].cn_source_order_id}})
                        if(cnOrderData){
                        if(cnOrderData.oldCnSourceOrderIds){
                           orderData.oldCnSourceOrderIds = `${cnData[0].cn_source_order_id},${cnOrderData.oldCnSourceOrderIds}`;
                        }else{
                           orderData.oldCnSourceOrderIds = `${cnData[0].cn_source_order_id}`
                        }
                     }
                       }
                        await unicommerceResponseModel.save(uc_payload);
                        console.log("payment process upadte start")
                        await orderRepository.save(orderData);
                        console.log("payment process upadte end")
                        const statusJson ={
                           orderId:orderData.orderId,
                           updateOrderStatusId:1
                       }
                       const { OrderService : os } = require('../../services/OrderService');
                   const _orderService = new os();
                        await _orderService.updateOrderStatus(statusJson)
                        
                        let refundSummaryModel = new RefundBalanceSummaryModel();
                        refundSummaryModel.order_id = orderData.orderId;
                        refundSummaryModel.order_prefix_id = orderData.orderPrefixId;
                        refundSummaryModel.total_order_paid_amount = orderData.total;
                        refundSummaryModel.total_order_balance_amount = orderData.total;
                        await refundSummaryRepo.save(refundSummaryModel);
                        
                        const productLength:any = productDetailData.length

                        const { OrderStatusHistoryController : osh } = require('../../controllers/OrderStatusHistoryController');
                        const _orderStatusHistory = new osh();  
                        await  _orderStatusHistory.saveStatusHistory(orderData.orderId, orderData.orderPrefixId,productDetailData,productLength,1,1,1,1)
                        await  _orderStatusHistory.saveStatusHistory(orderData.orderId, orderData.orderPrefixId,productDetailData,productLength,20,1,0,0)
                        await  _orderStatusHistory.saveStatusHistory(orderData.orderId, orderData.orderPrefixId,productDetailData,productLength,4,1,0,0)
                        await  _orderStatusHistory.saveStatusHistory(orderData.orderId, orderData.orderPrefixId,productDetailData,productLength,12,1,0,0)
                        await  _orderStatusHistory.saveStatusHistory(orderData.orderId, orderData.orderPrefixId,productDetailData,productLength,19,1,0,0)
                        await  _orderStatusHistory.saveStatusHistory(orderData.orderId, orderData.orderPrefixId,productDetailData,productLength,5,0,0,0)
                       try{
                        await this.notification(orderData)
                     }catch{
                        console.log('catch')
                     }
                     } else {
                        if(uc_response && uc_response.response && uc_response.response.errors.length>0 && uc_response.response.errors[0].message=='DUPLICATE_SALE_ORDER'){
                           savedResponse.uniResponse = JSON.stringify(response.data.errors);
                           await unicommerceResponseModel.save(uc_payload);
                           orderData.sentOnUc=true
                           orderData.ucOrderStatus='CREATED'
                           await orderRepository.save(orderData);
                           try{
                              await this.notification(orderData)
                           }catch{
                              console.log('catch')
                           }
                        }else{
                           orderData.sentOnUc = false;
                           orderData.ucOrderStatus = "FAILED";
                           savedResponse.uniResponse = JSON.stringify(response.data.errors);
                           await unicommerceResponseModel.save(uc_payload);
                           await orderRepository.save(orderData);
                        }
                        
                        // const _cnsService = new cns();
                        // await _cnsService.markCnActiveByOrderId(orderData.orderId, 4);
                     }
                     
                  })
                  .catch(async(error: any) => {
                     console.log("Error:", error);
                     orderData.sentOnUc = false;
                        orderData.ucOrderStatus = "FAILED";
                        savedResponse.uniResponse = JSON.stringify(error);
                        await unicommerceResponseModel.save(uc_payload);
                        await orderRepository.save(orderData);
                  });

            }else{
               let auditLogData:any = new AuditLog();
               auditLogData.object = JSON.stringify(resp);
               auditLogData.description = "If Token not exist. Saving Request and Response of Creating Sale order on UC";
               auditLogData.requestUrl = `${env.uniComm.apiUrl}/services/rest/v1/oms/saleOrder/create`;
               auditLogData.method = "POST";
               auditLogData.logType = "REQUEST_RESPONSE"; 
               auditLogData.params = JSON.stringify({"request_payload": uc_payload});
               auditLogData.userName = orderData.orderPrefixId;
               auditLogData.browserInfo = "ERROR"
               await auditLog.save(auditLogData);
            }


         })
         .catch(async(error:any)=>{
            
            let auditLogData:any = new AuditLog();
            auditLogData.object = JSON.stringify(error);
            auditLogData.description = "In then catch block Saving Request and Response of Creating Sale order on UC";
            auditLogData.requestUrl = `${env.uniComm.apiUrl}/services/rest/v1/oms/saleOrder/create`;
            auditLogData.method = "POST";
            auditLogData.logType = "REQUEST_RESPONSE"; 
            auditLogData.params = JSON.stringify({"request_payload": uc_payload});
            auditLogData.userName = orderData.orderPrefixId;
            auditLogData.browserInfo = "ERROR"
            orderData.sentOnUc = true;
            orderData.ucOrderStatus = "CREATED";
            orderData.orderStatusId = 1
            await orderRepository.save(orderData);
            const orderProductRepo = getManager().getRepository(OrderProduct);
            const products = await orderProductRepo.find({ where: { orderId: orderData.orderId } });
            for (const p of products) {
               p.orderStatusId = 1;
               await orderProductRepo.save(p);
            }

            await auditLog.save(auditLogData);
         })
      } catch (error) {
         
         let auditLogData:any = new AuditLog();
            auditLogData.object = JSON.stringify(error);
            auditLogData.description = "In Try Catch Saving Request and Response of Creating Sale order on UC";
            auditLogData.requestUrl = `${env.uniComm.apiUrl}/services/rest/v1/oms/saleOrder/create`;
            auditLogData.method = "POST";
            auditLogData.logType = "REQUEST_RESPONSE"; 
            auditLogData.params = JSON.stringify({"request_payload": uc_payload});
            auditLogData.userName = orderData.orderPrefixId;
            auditLogData.browserInfo = "ERROR"
            await auditLog.save(auditLogData);
      }


      /***************************************/


   }


   public async notification(orderData:any){
      const whatsAppJson={
         "values": {
             "0": orderData.shippingCompany,
             "1": orderData.orderPrefixId
         },
         "mobileNo": orderData.telephone,
         "orderDetails": {
             "orderId": orderData.orderPrefixId,
             "customerId": orderData.customerId,
             "orderStatusId": orderData.orderStatusId
         }
     }
     
 const { WhatsAppController : dd } = require('../../controllers/WhatsAppController');
 const _whatsApp = new dd();
     await _whatsApp.whatsAppTransaction(whatsAppJson)
     const { SmsController : ss } = require('../../controllers/SmsController');
     const _sms = new ss();
     
       await _sms.smsTransaction(orderData)
   }

   public async syncMyOrders(saleOrderCode: string):Promise<any> {

      await this.getUniComToken().then(async resp => {

         const orderRepository = getManager().getRepository(Order);
         if (resp && resp.data && resp.data.access_token) {


            const payload = { "code": saleOrderCode }

            const headers = {
               'Content-Type': 'application/json',
               'Authorization': `${resp.data.token_type} ${resp.data.access_token}`
            };
            this.axios.post(`${env.uniComm.apiUrl}/services/rest/v1/oms/saleorder/get`, payload, {
               headers: headers
            }).then(async (response: any) => {
               if (response && response.data && response.data.successful && response.data.errors.length < 1) {
                  const orderData = await orderRepository.findOne({
                     where: {
                        orderPrefixId: saleOrderCode,
                     },
                  });
                  orderData.ucOrderStatus = response.data && response.data.saleOrderDTO.status;
                  await orderRepository.save(orderData);
               } else {
                  console.log("Error: " + saleOrderCode + ": ", response.data.errors)
               }

            })
         }
      })

   }

   public makeRandomString(length:any) {
      var result           = "";
      var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      var charactersLength = characters.length;
      for ( var i = 0; i < length; i++ ) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
      return result;
  }

  public groupBy = function (xs, key) {
   return xs.reduce(function (rv, x) {
     (rv[x[key]] = rv[x[key]] || []).push(x);
     return rv;
   }, {});
 };
 
   public async syncInventoryFromUC_Backup(): Promise<any> {
      const fs = require("fs");
      var logger = fs.createWriteStream('logs/inventory-schedular-logs.txt', {
         flags: 'a' // 'a' means appending (old data will be preserved)
      })

      var writeLine = (line) => logger.write(`\n${line}`);
      const currentDate = new Date();
      let timeString = currentDate.getDate() + "-" + (currentDate.getMonth() + 1) + "-" + currentDate.getFullYear() + "-" + currentDate.getHours() + ":" + currentDate.getMinutes();


      
      const getEnabledFacilities = await getRepository(FacilityInventorySyncModel).createQueryBuilder("fis")
      .select(["fis.facility_code"])
      .orderBy('fis.id', 'DESC')
      .getRawOne();


const enabledFcs = getEnabledFacilities.facility_code.split(",");

if(enabledFcs && enabledFcs.length > 0){
   for(let p=0; p<enabledFcs.length;p++){
      const facilitySkus = await getRepository(FacilitySkuModel).createQueryBuilder("fsm")
         .select(["fsm.facility_code", "group_concat(fsm.sku) as skus "])
         .where("fsm.status = :colStatus", { colStatus: "1" })
         .andWhere("fsm.facility_code = :fsCode", {fsCode:enabledFcs[p]})
         .groupBy("fsm.facility_code")
         .getRawMany();


      const fSLength = facilitySkus.length;
      
      if (fSLength > 0) {

         await this.getUniComToken().then(async resp => {
            if (resp && resp.data && resp.data.access_token) {
               for (let j = 0; j < fSLength; j++) {


                  const groupedSkus = facilitySkus[j].skus.split(",");
                  const fcCode = facilitySkus[j].facility_code;
                  
                  const totalSkuNumber = groupedSkus.length;
                 
                  if (totalSkuNumber > 0) {
                     const batchCount = 2000;

                     if (totalSkuNumber > batchCount) {
                        const quotient = Math.floor(totalSkuNumber / batchCount);
                        const remainder = totalSkuNumber % batchCount;
                        
                        let loopCount = 0;
                        if (remainder > 0) {
                           loopCount = quotient + 1;
                        } else {
                           loopCount = quotient;
                        }
                        for (let i = 0; i < loopCount; i++) {
                           let batch = []
                           batch = groupedSkus.splice(0, batchCount);
                          

                           const payload = { "itemTypeSKUs": batch };
                           const headers = {
                              'Content-Type': 'application/json',
                              'Authorization': `${resp.data.token_type} ${resp.data.access_token}`,
                              'facility': fcCode
                           };

                           await this.axios.post(`${env.uniComm.apiUrl}/services/rest/v1/inventory/inventorySnapshot/get`, payload, {
                              headers: headers
                           }).then(async (response: any) => {
                             
                              if (response && response.data && response.data.successful && response.data.errors.length < 1) {

                                 for (let r = 0; r < response.data.inventorySnapshots.length; r++) {


                                    // console.log(response.data.inventorySnapshots, "**************Inventory Snap SHot****************")
                                    await getRepository(FacilitySkuModel).createQueryBuilder()
                                       .update()
                                       .set({ Quantity: parseInt(response.data.inventorySnapshots[r].inventory) })
                                       .where("facility_code = :colStatus", { colStatus: fcCode })
                                       .andWhere("sku = :newSku", { newSku: response.data.inventorySnapshots[r].itemTypeSKU })
                                       .execute();

                                    await writeLine(`Facility: ${fcCode} with SKU: ${response.data.inventorySnapshots[r].itemTypeSKU} with inventory ${response.data.inventorySnapshots[r].inventory} sycnhed successfully [${timeString}]`);

                                 }
                              } else {
                                 
                                 for (let j = 0; j < response.data.errors.length; j++) {
                                    writeLine(`Error: Code-${response.data.errors[j].code}, Message-${response.data.errors[j].message}, Description- ${response.data.errors[j].description} [${timeString}]`);
                                 }
                              }
                              if (response.data.warnings.length > 0) {
                                 
                                 for (let j = 0; j < response.data.warnings.length; j++) {
                                    writeLine(`Warning: Code-${response.data.warnings[j].code}, Message-${response.data.warnings[j].message}, Description- ${response.data.warnings[j].description} [${timeString}]`);
                                 }
                              }
                           }).catch((err: any) => {
                              
                              writeLine(`Error: Facility Code-${fcCode}, UC response Status - ${err.response.status}, UC response Status Text - ${err.response.statusText}, Description- ${err.response.data} [${timeString}]`);
                           })


                        }

                     } else {


                        const payload = { "itemTypeSKUs": groupedSkus };
                        const headers = {
                           'Content-Type': 'application/json',
                           'Authorization': `${resp.data.token_type} ${resp.data.access_token}`,
                           'facility': fcCode
                        };

                        await this.axios.post(`${env.uniComm.apiUrl}/services/rest/v1/inventory/inventorySnapshot/get`, payload, {
                           headers: headers
                        }).then(async (response: any) => {

                           if (response && response.data && response.data.successful && response.data.errors.length < 1) {

                              for (let r = 0; r < response.data.inventorySnapshots.length; r++) {


                                 // console.log(response.data.inventorySnapshots, "**************Inventory Snap SHot****************")
                                 await getRepository(FacilitySkuModel).createQueryBuilder()
                                    .update()
                                    .set({ Quantity: parseInt(response.data.inventorySnapshots[r].inventory) })
                                    .where("facility_code = :colStatus", { colStatus: fcCode })
                                    .andWhere("sku = :newSku", { newSku: response.data.inventorySnapshots[r].itemTypeSKU })
                                    .execute();

                                 await writeLine(`Facility: ${fcCode} with SKU: ${response.data.inventorySnapshots[r].itemTypeSKU} with inventory ${response.data.inventorySnapshots[r].inventory} sycnhed successfully [${timeString}]`);

                              }
                           } else {
                              
                              for (let j = 0; j < response.data.errors.length; j++) {
                                 writeLine(`Error: Code-${response.data.errors[j].code}, Message-${response.data.errors[j].message}, Description- ${response.data.errors[j].description} [${timeString}]`);
                              }
                           }
                           if (response.data.warnings.length > 0) {
                              
                              for (let j = 0; j < response.data.warnings.length; j++) {
                                 writeLine(`Warning: Code-${response.data.warnings[j].code}, Message-${response.data.warnings[j].message}, Description- ${response.data.warnings[j].description} [${timeString}]`);
                              }
                           }
                        }).catch((err: any) => {
                           
                           writeLine(`Error: Facility Code-${fcCode}, UC response Status - ${err.response.status}, UC response Status Text - ${err.response.statusText}, Description- ${err.response.data} [${timeString}]`);
                        })

                     }
                  }
               }
            }
         })

      }
   }
   }

   }

   public async syncInventoryFromUC() {
      const fs = require("fs");
      var logger = fs.createWriteStream('logs/inventory-schedular-logs.txt', {
         flags: 'a' // 'a' means appending (old data will be preserved)
       })
       const skuModal = getManager().getRepository(Sku)
       var writeLine = (line) => logger.write(`\n${line}`);
       const currentDate = new Date();
       let timeString = currentDate.getDate()+"-"+(currentDate.getMonth()+1) +"-"+currentDate.getFullYear() +"-"+currentDate.getHours()+":"+currentDate.getMinutes();
         const count:any = await skuModal.count()
         // const queryCount = await getManager().query(`SELECT COUNT(p.product_id) AS qCount FROM product AS p JOIN product_varient_option AS pvo ON(p.product_id = pvo.product_id) JOIN sku AS s ON(pvo.sku_id = s.id) WHERE p.is_active=0`);
         // const count = queryCount && queryCount[0].qCount;
         writeLine(`SKU Count Sync ${count} [${timeString}]` );
         let skuRepository:any;
       for(let i=0; i<=(Math.round(count/1000)+1); i++){
      skuRepository = await createQueryBuilder(Sku, 'sku')
      .select('sku.sku_name as sku')
      // .innerJoin(ProductVarientOption, 'pvo', 'sku.id = pvo.sku_id')
      // .innerJoin(Product, 'prod', 'pvo.product_id = prod.product_id')
      // .where('prod.is_active = :prod_active', {prod_active: 0})
      .limit(1000)
      .offset(1000*i)
      .getRawMany();

      let allSku:any[]=[]
      // skuRepository.forEach((element:any) => {
      //    allSku.push(element.sku)
      // })
      for(let r=0;r<skuRepository.length;r++){
         allSku.push(skuRepository[r].sku)
      }
      
     
      const payload = { "itemTypeSKUs":  allSku}
   

      
      //const skuCount = await skuRepository.count()

      await this.getUniComToken().then(async resp => {


         if (resp && resp.data && resp.data.access_token) {
            const facilityCode:any = (env.uniComm.facilityCode2).split(",")
            for(let i=0; i<facilityCode.length; i++){
               const headers = {
                  'Content-Type': 'application/json',
                  'Authorization': `${resp.data.token_type} ${resp.data.access_token}`,
                  'facility': facilityCode[i]
               };
               await this.axios.post(`${env.uniComm.apiUrl}/services/rest/v1/inventory/inventorySnapshot/get`, payload, {
                  headers: headers
               }).then(async (response: any) => {
                  if (response && response.data && response.data.successful && response.data.errors.length < 1) {
                     for (let r = 0; r < response.data.inventorySnapshots.length; r++) {
                        try {
                        let skuSum:number=response.data.inventorySnapshots[r].inventory
                        if(i>0){
                          const skuData = await skuModal.findOne({skuName:response.data.inventorySnapshots[r].itemTypeSKU})
                          if(skuData){
                          skuSum+=skuData.quantity
                          }
                        }
                        await skuModal.createQueryBuilder().update().set({quantity:skuSum}).where("sku_name = :sku", { sku: response.data.inventorySnapshots[r].itemTypeSKU }).execute()
                        await this.productActiveOnQuantity(response.data.inventorySnapshots[r].itemTypeSKU)
                        writeLine(`SKU: ${response.data.inventorySnapshots[r].itemTypeSKU} with inventory ${skuSum} sycnhed successfully [${timeString}]` );
                     } catch (error) {
                        writeLine(`SKU carched: ${response.data.inventorySnapshots[r].itemTypeSKU} with inventory catched [${timeString}]` ); 
                     }
                     }
                  } else {
                     for(let j=0;j<response.data.errors.length;j++){
                        writeLine(`Error: Code-${response.data.errors[j].code}, Message-${response.data.errors[j].message}, Description- ${response.data.errors[j].description} [${timeString}]`);
                     }
                     
                  }
   
               })
            }
       
         }
      })
   }
   }


public async inventorySyncBySKU(payload:any){
   const fs = require("fs");
   var logger = fs.createWriteStream('logs/inventory-schedular-logs-by-SKU.txt', {
      flags: 'a' // 'a' means appending (old data will be preserved)
    })
    const skuModal = getManager().getRepository(Sku)
    var writeLine = (line) => logger.write(`\n${line}`);
    const currentDate = new Date();
    let timeString = currentDate.getDate()+"-"+(currentDate.getMonth()+1) +"-"+currentDate.getFullYear() +"-"+currentDate.getHours()+":"+currentDate.getMinutes();
   const sku = await this.getUniComToken().then(async resp => {


      if (resp && resp.data && resp.data.access_token) {
         const facilityCode:any = (env.uniComm.facilityCode2).split(",")
         console.log("facilityCode",facilityCode)
         let skuResult:any
         for(let i=0; i<facilityCode.length; i++){
            try {
         const headers = {
            'Content-Type': 'application/json',
            'Authorization': `${resp.data.token_type} ${resp.data.access_token}`,
            'facility': facilityCode[i]
         };
console.log("headers",headers)
console.log("payload",payload)
        skuResult =  await this.axios.post(`${env.uniComm.apiUrl}/services/rest/v1/inventory/inventorySnapshot/get`, payload, {
            headers: headers
         }).then(async (response: any) => {
let inventoryResult:any[]=[]
            if (response && response.data && response.data.successful && response.data.errors.length < 1) {
               
             
               for (let r = 0; r < response.data.inventorySnapshots.length; r++) {
                  let skuSum:number=response.data.inventorySnapshots[r].inventory
                  console.log("skuSum:number",skuSum)
                  console.log("iiiiiiiiiiiiiiiiiiiiiiiiiiiii",i)
                  if(i>0){
                     const skuData = await skuModal.findOne({skuName:response.data.inventorySnapshots[r].itemTypeSKU})
                     if(skuData){
                     skuSum+=skuData.quantity
                     }
                   }
                   console.log("skuSum",skuSum)
                  inventoryResult.push({sku:response.data.inventorySnapshots[r].itemTypeSKU, quantity:skuSum})
                  await skuModal.createQueryBuilder().update().set({quantity:skuSum}).where("sku_name = :sku", { sku: response.data.inventorySnapshots[r].itemTypeSKU }).execute()
                  await this.productActiveOnQuantity(response.data.inventorySnapshots[r].itemTypeSKU)
                  writeLine(`SKU: ${response.data.inventorySnapshots[r].itemTypeSKU} with inventory ${skuSum} sycnhed successfully [${timeString}]` );
               }
            } else {
               for(let j=0;j<response.data.errors.length;j++){
                  inventoryResult.push({'error':response.data.errors[j].message})
                  writeLine(`Error: Code-${response.data.errors[j].code}, Message-${response.data.errors[j].message}, Description- ${response.data.errors[j].description} [${timeString}]`);
               }
               
            }
return inventoryResult
         })
         console.log("skuResult",skuResult)
      } catch (error) {
         writeLine(`SKU catch: ${error} with inventory sycnhed catch [${timeString}]` );   
      }
      }
      return skuResult
      }
   })
   return sku
}

   public async cancelSaleOrderPartial(saleOrderObj: any):Promise<any> {
      const fs = require("fs");
      var logger = fs.createWriteStream('logs/cancelOrderLog.txt', {
         flags: 'a' // 'a' means appending (old data will be preserved)
       })
       var writeLine = (line) => logger.write(`\n${line}`);
       let timeString = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
      const saleOrderObjLength:number =  saleOrderObj.length
      let itemsCodeList:any=[]
      for(let i=0; i<saleOrderObjLength; i++){
         const itemSplit:any = saleOrderObj[i].itemCode.split(',')
         itemSplit.forEach(element => {
            itemsCodeList.push(element)
         });
      }
      console.log("itemsCodeListitemsCodeList",itemsCodeList)
      let payloadCooking:any;
          payloadCooking = {
            "saleOrderCode": saleOrderObj[0].orderPrefixId,
            "cancellationReason": saleOrderObj[0].cancelRequestReason,
            "cancelledBySeller": true,
            "cancelPartially": true,
            saleOrderItemCodes:itemsCodeList
         }
         let responseR:any
      await this.getUniComToken().then(async resp => {
         if (resp && resp.data && resp.data.access_token) {
            const headers = {
               'Content-Type': 'application/json',
               'Authorization': `${resp.data.token_type} ${resp.data.access_token}`
            };
            responseR =  this.axios.post(`${env.uniComm.apiUrl}/services/rest/v1/oms/saleOrder/cancel`, payloadCooking, {
               headers: headers
            }).then(async (response: any) => {
               writeLine(`Cencel Order:[Request: ${JSON.stringify(payloadCooking)}}, [Response: ${JSON.stringify(response.data)}] with inventory sycnhed catch [${timeString}]` );   
               if (response && response.data && response.data.successful) {
                  return {status:200, message: 'Get data successfully'}
               } else {
                  return {status:300, message: 'Something went wrong and Contact to Customer care 18001200141'}
               }
            })
            .catch((error) => {
               return {status:500, messgae:'Server Error and Contact to Customer care 18001200141'}
            })
         }
      })
      return responseR;
   }

   
   public async syncAllOrders(data:any, action:number):Promise<any> {
      if(action==1){
      await this.getOrderStatusByUc(data.orderId, data.orderPrefixId)
      }
   }

public async getOrderStatusByLogistics(data:any){
   console.log("dataaaaaaaaaaaaaaa",data)
   try{
         const awbStatus:any=data?.Shipment?.Status?.Status?data.Shipment.Status.Status:null
         const awbStatusType:any=data?.Shipment?.Status?.StatusType?data.Shipment.Status.StatusType:null
         const awbStatusDateTime:any = data?.Shipment?.Status?.StatusDateTime?data.Shipment.Status.StatusDateTime:data.creationDate
         const shipment:any=data?.Shipment?.AWB?data.Shipment.AWB:data.waybill
         const nslCode:any = data?.Shipment?.NSLCode?data.Shipment.NSLCode:null
         const prozoStatusCode:any = data?.orderStatusCode?data.orderStatusCode:0
         const prozoRvpCheck:boolean = data?.isRvp?data?.isRvp:false
         const orderProductResult:any = await getManager().query(`SELECT GROUP_CONCAT(order_product_id) orderProductId, ANY_VALUE(order_id) orderId FROM order_product WHERE tracking_no = '${shipment}'`)
         const resultOrderProduct:any=orderProductResult[0]
         console.log("orderProductResult",orderProductResult)
         const orderRepository = getManager().getRepository(Order);
         const orderData = await orderRepository.findOne({where: {orderId: resultOrderProduct.orderId}});
         const findReturn:any[] = await getManager().query(`SELECT * FROM tm_order_return WHERE order_id = ${orderData.orderId}`)
         const unDelivered:any=['ST-111','EOD-106','EOD-25','EOD-53','EOD-76','CL-102','EOD-11','EOD-32','EOD-47','EOD-69','EOD-74','EOD-6']
         let orderProductStatus:number=0
         let deliveredDateObj:any
         if((awbStatus=='Dispatched' && awbStatusType=='UD') || prozoStatusCode==6){
            // "Out for Delivery" 
            orderProductStatus=12
         }else if((awbStatus=='Pending' && awbStatusType=='UD' && unDelivered.includes(nslCode)) || prozoStatusCode==9){
            // "Order Undelivered" 
            orderProductStatus=32
         }else if((awbStatus=='Delivered' && awbStatusType=='DL') || (prozoStatusCode==8 && !prozoRvpCheck)){
            // "Order Delivered" 
            orderProductStatus=5
            deliveredDateObj=awbStatusDateTime
         }else if((awbStatus=='DTO' && awbStatusType=='DL') || (prozoStatusCode==14 || (prozoStatusCode==8 && prozoRvpCheck))){
            // "Return Delivered" 
            orderProductStatus=33
         }else if((awbStatusType=='PP' && shipment.DispatchCount==0) || prozoStatusCode==28){
            // "Return initiated" 
            orderProductStatus=23
         }else if((awbStatusType=='PU') ||  (prozoStatusCode==4 && findReturn.length>0)){
            // "Return Picked" 
            orderProductStatus=24
         }else if((awbStatusType=='PP' && shipment.DispatchCount>0) || (prozoStatusCode==2 && prozoRvpCheck)){
            // "Return re-scheduled" 
            orderProductStatus=25
         }else if((awbStatusType=='RT') || prozoStatusCode==21){
            // "Return In-Transit" 
            orderProductStatus=26
         }else if((awbStatus=='RTO' && awbStatusType=='DL') || prozoStatusCode==12){
            // "Undelivered/Returned" 
            orderProductStatus=34
         }else if((awbStatus=='Canceled' && awbStatusType=='CN') || prozoStatusCode==10){
            // "Return Cancelled" 
            orderProductStatus=22
         }else if(prozoStatusCode==3 &&  findReturn.length>0){
            // "QC Failed At Pickup" 27
            orderProductStatus=27

         }else if((awbStatus=='LOST') || prozoStatusCode==16){
            // "Shipment Lost" 
            orderProductStatus=35
         }

if(orderProductStatus==22 || orderProductStatus==27){
   try{
   await getManager().query(`UPDATE tm_order_return SET return_status = '3', modified_date=DATE_ADD(DATE_ADD(NOW(), INTERVAL 5 HOUR), INTERVAL 30 MINUTE) WHERE order_product_id in (${resultOrderProduct.orderProductId})`) 
   const orderProductData:any = await getManager().query(`select op.facility_code, tor.rp_code, op.order_id, op.order_product_id, tor.id from order_product op inner join tm_order_return tor on op.order_product_id =tor.order_product_id where op.order_product_id in (${resultOrderProduct.orderProductId})`) 
   let cancelJson:any[]=[]
   orderProductData.forEach((element:any) => {
      cancelJson.push({"facilityCode":element.facility_code,"rvpCode":element.rp_code,"orderId":element.order_id,"orderProductId":element.order_product_id,"returnId":element.id})
   });
   await this.cancelReversePickup(cancelJson)
   }catch{
      console.log("return catch")
   }
}

         if(orderProductStatus>0){
            let statusCodeRemark:any=null
            if(orderProductStatus==22 || orderProductStatus==32 || orderProductStatus==34){
         const remarkJson:any=
         {"EOD-6":"Consignee refused to accept/order cancelled",
"ST-111":"Reached maximum attempt count",
"EOD-106":"Reached Maximum attempt count",
"EOD-25":"Other",
"EOD-53":"Amount disputed by customer",
"EOD-76":"Consignee not available for extended duration",
"CL-102":"Canceled As Per Client'S Instructions",
"EOD-11":"Consignee Unavailable",
"EOD-32":"Consignee unavailable for extended duration",
"EOD-47":"Reattempt - As per NDR instructions",
"EOD-69":"Recipient wants open delivery",
"EOD-74":"Incomplete address & contact details",
"EOD-84":"Qc Failed At Pickup. Product Description Mismatch",
"EOD-108":"Qc Failed At Pickup. Product Count Mismatch",
"EOD-131":"Qc Failed At Pickup. Brand Mismatch",
"EOD-132":"Qc Failed At Pickup. Color Mismatch",
"EOD-777":"Rvp Qc Fail",
"EOD-95":"Qc Failed At Pickup, Damaged/Used Product",
"EOD-90":"Pickup Cancelled As There Was No Return Request From Customer Side ",
"EOD-21":"Pickup Request Cancelled By Customer",
"RD-RT":"Return Rejected",
"CL-107":"Closed Reverse Pickup ",
"CL-103":"Closed As Per Client'S Instructions",
"EOD-900":"Pickup Request Cancelled By Customer",
"RT-107":"Unsuccessful Ndr Reattempt",
"RT-111":"Dto Due To Poor Packaging",
"RT-120":"Returned - Due To Operational Constraint",
"RT-108":"No Client Instructions To Reattempt",
"RT-113":"Returned As Per Security Instructions",
"RT-114":"Address Details Invalid",
"RT-105":"Wrong Pin Code & Address Is Not Serviceable",
"RT-101":"Returned As Per Client Instructions",
"RT-109":"Returned Due To Poor Packaging"
      }
 statusCodeRemark=remarkJson[nslCode]?remarkJson[nslCode]:null
              }

         deliveredDateObj=awbStatusDateTime
         const json = {
            orderId:orderData.orderId,
            orderStatusId:orderProductStatus,
            orderProductIds:(resultOrderProduct.orderProductId).toString(),
            deliveredDate:orderProductStatus==5?deliveredDateObj:null,
            statusCode:nslCode
            }
            await this.orderDetailsUpdate(json,orderData,orderProductStatus,deliveredDateObj,statusCodeRemark)
            await this.notificationAction(orderData)
         }
         return true
   }catch{
      console.log("catch")
   }
      return true
}


public async getOrderStatusByUc(mainOrderId:any, saleOrderCode:any){
   const fs = require("fs");
   var logger = fs.createWriteStream('logs/orderSyncUC.txt', {
      flags: 'a' // 'a' means appending (old data will be preserved)
   })
   var writeLine = (line) => logger.write(`\n${line}`);
   const currentDate = new Date();
   const orderRepository = getManager().getRepository(Order);
   const orderData = await orderRepository.findOne({where: {orderId: mainOrderId}});
   const resp = await this.getUniComToken()
      if (resp && resp.data && resp.data.access_token) {
         const payload = { "code": saleOrderCode }
         const headers = {
            'Content-Type': 'application/json',
            'Authorization': `${resp.data.token_type} ${resp.data.access_token}`
         };
         await this.axios.post(`${env.uniComm.apiUrl}/services/rest/v1/oms/saleorder/get`, payload, {
            headers: headers
         }).then(async (response: any) => {
            if (response && response.data && response.data.successful && response.data.errors.length < 1) {
  
               const responseData:any[] = response.data.saleOrderDTO.shippingPackages
               const saleOrderItems:any[] = response.data.saleOrderDTO.saleOrderItems
               
               if(responseData && responseData.length > 0){
                  let statusChecked:boolean=true
                  if(statusChecked){            
               const orderProductRepository = getManager().getRepository(OrderProduct);

                  const orderProducts = await orderProductRepository.find({where: {orderId:orderData.orderId}})
                  const length:any=orderProducts.length
           
                  for(let i=0; i<length; i++){
                     try{
                     const filterItem:any = saleOrderItems.filter(item=>item.itemSku==orderProducts[i].skuName)[0]
                     if(filterItem.statusCode!='CANCELLED'){
                     const findItem:any = responseData.filter(item=>item.code==filterItem.shippingPackageCode)[0]
                     let orderProductStatus:number=0
                     let deliveredDateObj:any=moment(findItem.updated).format('YYYY-MM-DD HH:mm:ss')
                     console.log("findItem",findItem)
                    if(findItem.status=='READY_TO_SHIP'){
                        orderProductStatus=20
                     }else  if(findItem.status=='DISPATCHED' || findItem.status=='SHIPPED'){
                        orderProductStatus=4
                        if(findItem.trackingNumber){
                           await this.updateTrackingNumber({shippingProvider:findItem.shippingProvider, trackingNumber:findItem.trackingNumber,orderProductId:orderProducts[i].orderProductId})
                        }
                     }
                     if(orderProductStatus>0 && (orderProducts[i].orderStatusId==1 || orderProducts[i].orderStatusId==20)){
                     const json = {
                        orderId:orderData.orderId,
                        orderStatusId:orderProductStatus,
                        orderProductIds:orderProducts[i].orderProductId,
                        deliveredDate:orderProductStatus==5?deliveredDateObj:null
                        }
                        await this.orderDetailsUpdate(json,orderData,orderProductStatus,deliveredDateObj)
                        await this.notificationAction(orderData)
                        writeLine(`Success in synching of Sale Order: ${orderData.orderId} with Status ${orderProductStatus}. Date: ${moment(currentDate).format('YYYY-MM-DD HH:mm:ss')}`)
                     }}
                     }catch{
                        writeLine(`Error in synching of Sale Order: ${orderData.orderId}. Date: ${moment(currentDate).format('YYYY-MM-DD HH:mm:ss')}`)
                     }
                  }}}} 
            return true
         })
      }
      return true
}

public async updateTrackingNumber(val:any){
   const shippingProvider:any = val.shippingProvider=='Proship_Prozo'?'https://t.proship.in/':'https://www.delhivery.com/track/package/'
   await getManager().query(`update order_product set tracking_no='${val.trackingNumber}', tracking_url='${shippingProvider}' where order_product_id=${val.orderProductId}`)
}

public async orderDetailsUpdate(json:any,orderData:any,orderProductStatus:any,deliveredDateObj:any,statusCodeRemark?:any){
   const { OrderService : os } = require('../../services/OrderService');
   const _orderService = new os();
   await _orderService.updateOrderProductStatus(json)
   const { OrderStatusHistoryController : oh } = require('../../controllers/OrderStatusHistoryController');
   const _orderHistory = new oh();
  const productList:any=[{'orderProductId':json.orderProductIds}]
   await _orderHistory.saveStatusHistory(orderData.orderId, orderData.orderPrefixId,productList,1,orderProductStatus,1,1,deliveredDateObj,statusCodeRemark)
}
public async notificationAction(orderData:any){
   const orderProductRepository = getManager().getRepository(OrderProduct);
      const { WhatsAppController : wa } = require('../../controllers/WhatsAppController');
      const _whatsApp = new wa();

         const emailTemp = getManager().getRepository(EmailTemplate)
         const emailContent = await emailTemp.findOne(21);
         const emailService = getManager().getRepository(EmailModels);
         const getSentEmail  = await emailService.findOne({where: {
            subject:emailContent.subject, orderId:orderData.orderId, orderStatusId:orderData.orderStatusId, status:'Sent'
          }})
          if(!getSentEmail){
            const orderStatus = getManager().getRepository(OrderStatus);
            const orderStatusName:any = await orderStatus.findOne(orderData.orderStatusId)
            const productList:any = await orderProductRepository.find({where: {orderId: orderData.orderId}} )
            const customerName = orderData.shippingFirstname+" "+orderData.shippingLastname;
            const productName:any = productList.length>1?productList[0].name+" and Others...":productList[0].name
            const message = emailContent.content.replace('{name}', customerName).replace('{title}', productName).replace('{status}', orderStatusName.name).replace('{order}', orderData.orderPrefixId);   
            MAILService.customerLoginMail(orderData, message, orderData.email, emailContent.subject, null);
          }
      let values:any
      if(orderData.orderStatusId==4){
          values =  {
              "0": orderData.shippingCompany,
              "1": orderData.orderPrefixId,
              "2":"https://redchief.in/"
          }
      }else if(orderData.orderStatusId==12){
          values ={
              "0": orderData.shippingCompany
          }
      }else if(orderData.orderStatusId==5){
          values ={
              "0": orderData.shippingCompany,
              "1":"https://redchief.in/"
          }
      }else{
          values ={
              "0": orderData.shippingCompany,
              "1": orderData.orderPrefixId
          }
      }
        const whatsAppJson={
          "values": values,
          "mobileNo": orderData.telephone,
          "orderDetails": {
              "orderId": orderData.orderPrefixId,
              "customerId": orderData.customerId,
              "orderStatusId": orderData.orderStatusId
          }
      }

      await _whatsApp.whatsAppTransaction(whatsAppJson)
      const orderStatusArray:any[]=[3,4,5,7,9,12,13]
    if(orderStatusArray.includes(orderData.orderStatusId)){
      const { SmsController : ss } = require('../../controllers/SmsController');
    const _sms = new ss();
      await _sms.smsTransaction(orderData)
    }
      
   
}

   public async resendAllFailedOrders(saleOrderCodes: any):Promise<any> {
      const fs = require("fs");
      var logger = fs.createWriteStream('logs/resend-failed-orders-to-uc-logs.txt', {
         flags: 'a' // 'a' means appending (old data will be preserved)
      })
      var writeLine = (line) => logger.write(`\n${line}`);
      const currentDate = new Date();
      let timeString = currentDate.getDate() + "-" + (currentDate.getMonth() + 1) + "-" + currentDate.getFullYear() + "-" + currentDate.getHours() + ":" + currentDate.getMinutes();
      const unicommerceResponseModel = getManager().getRepository(UnicommerceResponseModel);
      const orderRepository = getManager().getRepository(Order);

      try {

         await this.getUniComToken().then(async resp => {
            
            if (resp && resp.data && resp.data.access_token) {

               const headers = {
                  'Content-Type': 'application/json',
                  'Authorization': `${resp.data.token_type} ${resp.data.access_token}`,
                  'facility': env.uniComm.facilityCode
               };

               const ordersLength = saleOrderCodes && saleOrderCodes.length;
               for(let i=0;i<ordersLength;i++){
                  const failedOrderInfo = await unicommerceResponseModel.findOne({
                     where: { orderPrefixId: saleOrderCodes[i].orderPrefixId}
                 });
                 if(failedOrderInfo){
                 let saleOrder =JSON.parse(failedOrderInfo.uniRequest);
                 
                 this.axios.post(`${env.uniComm.apiUrl}/services/rest/v1/oms/saleOrder/create`, saleOrder, {
                              headers: headers
                           })
                              .then(async (response: any) => {
                                 
                                 if (response && response.data && ((response.data.successful && response.data.errors.length < 1) || response.data.errors[0].message=='DUPLICATE_SALE_ORDER')) {
                                    let orderData = await orderRepository.findOne({
                                       where: { orderPrefixId:  saleOrderCodes[i].orderPrefixId}
                                   });
                                   
                                     orderData.sentOnUc = true;
                                     orderData.orderStatusId = 1;
                                     orderData.ucOrderStatus = response.data.errors[0].message=='DUPLICATE_SALE_ORDER'?'CREATED':response.data.saleOrderDetailDTO.status;
                                     failedOrderInfo.uniResponse = response.data.errors[0].message=='DUPLICATE_SALE_ORDER'?JSON.stringify(response.data.errors): JSON.stringify(response.data.saleOrderDetailDTO);
                                     await unicommerceResponseModel.save(failedOrderInfo);
                                     const statusJson ={
                                       orderId:orderData.orderId,
                                       updateOrderStatusId:1
                                   }
                                   const { OrderService : os } = require('../../services/OrderService');
                               const _orderService = new os();
                                    await _orderService.updateOrderStatus(statusJson)
                                   await orderRepository.update(orderData.orderId, orderData)
                                     const orderProductRepository = getManager().getRepository(OrderProduct);
                                     const productDetailData:any = await orderProductRepository.find({where: {orderId:orderData.orderId}})
                                     const productLength:any = productDetailData.length
                                     const { OrderStatusHistoryController : osh } = require('../../controllers/OrderStatusHistoryController');
                                     const _orderStatusHistory = new osh();  
                                     await  _orderStatusHistory.saveStatusHistory(orderData.orderId, orderData.orderPrefixId,productDetailData,productLength,1,1,1,1)
                                     await  _orderStatusHistory.saveStatusHistory(orderData.orderId, orderData.orderPrefixId,productDetailData,productLength,20,1,0,0)
                                     await  _orderStatusHistory.saveStatusHistory(orderData.orderId, orderData.orderPrefixId,productDetailData,productLength,4,1,0,0)
                                     await  _orderStatusHistory.saveStatusHistory(orderData.orderId, orderData.orderPrefixId,productDetailData,productLength,12,1,0,0)
                                     await  _orderStatusHistory.saveStatusHistory(orderData.orderId, orderData.orderPrefixId,productDetailData,productLength,19,1,0,0)
                                     await  _orderStatusHistory.saveStatusHistory(orderData.orderId, orderData.orderPrefixId,productDetailData,productLength,5,0,0,0)
                                     try{
                                       await this.notification(orderData)
                                    }catch{
                                       console.log('catch')
                                    }
                                     if(response?.data?.saleOrderDTO?.status){
                                     writeLine(`Sale Order: ${saleOrderCodes[i].orderPrefixId} with status ${response.data.saleOrderDTO.status} sycnhed successfully [${timeString}]`);
                                     }
                                 } else{
                                    failedOrderInfo.uniResponse = JSON.stringify(response.data.errors);
                        
                                    await unicommerceResponseModel.save(failedOrderInfo);
                                    for (let j = 0; j < response.data.errors.length; j++) {
                                       writeLine(`Error in synching of Sale Order: ${saleOrderCodes[i].orderPrefixId}. Error Code-${response.data.errors[j].code}, Message-${response.data.errors[j].message}, Description- ${response.data.errors[j].description} [${timeString}]`);
                                    }
                                 }
                                 
                              })
                              .catch((error: any) => {
                                 console.log("Error:", error);
                              });
            
                           }else{
                              writeLine(`Error in synching of Sale Order: ${saleOrderCodes[i].orderPrefixId}. Error Code Due to request not found on UC table`)
                           }
               

               }


            }
         })
      } catch (err) {
         console.log("Error:", err)
      }
   }

    
   public async syncInventoryDeltaFromUCByMultipleFacilty():Promise<any> {
      const fs = require("fs");
      var logger = fs.createWriteStream('logs/inventory-delta-schedular-logs.txt', {
         flags: 'a' // 'a' means appending (old data will be preserved)
      })

      var writeLine = (line) => logger.write(`\n${line}`);
      const currentDate = new Date();
      let timeString = currentDate.getDate() + "-" + (currentDate.getMonth() + 1) + "-" + currentDate.getFullYear() + "-" + currentDate.getHours() + ":" + currentDate.getMinutes();

      const getEnabledFacilities = await getRepository(FacilityInventorySyncModel).createQueryBuilder("fis")
      .select(["fis.facility_code"])
      .orderBy('fis.id', 'DESC')
      .getRawOne();


const enabledFcs = getEnabledFacilities.facility_code.split(",");

if(enabledFcs && enabledFcs.length > 0){
   for(let p=0; p<enabledFcs.length;p++){
      
      const facilitySkus = await getRepository(FacilitySkuModel).createQueryBuilder("fsm")
      .select(["DISTINCT(fsm.facility_code)"])
      .where("fsm.status = :colStatus", {colStatus: "1"})
      .andWhere("fsm.facility_code = :fsCode", {fsCode:enabledFcs[p]})
      .getRawMany();

    
      const fSLength = facilitySkus.length;
      if (fSLength > 0) {

         await this.getUniComToken().then(async resp => {
            if (resp && resp.data && resp.data.access_token) {
               for (let j = 0; j < fSLength; j++) {


                  
                  const fcCode = facilitySkus[j].facility_code;
                 
                     const payload = { "updatedSinceInMinutes": env.uniComm.inventoryDeltaDuration }
                     const headers = {
                        'Content-Type': 'application/json',
                        'Authorization': `${resp.data.token_type} ${resp.data.access_token}`,
                        'facility': fcCode
                     };
                     
                    await this.axios.post(`${env.uniComm.apiUrl}/services/rest/v1/inventory/inventorySnapshot/get`, payload, {
                        headers: headers
                     }).then(async (response: any) => {
                        
                        if (response && response.data && response.data.successful && response.data.errors.length < 1) {
                          
                           for (let r = 0; r < response.data.inventorySnapshots.length; r++) {
              

                             // console.log(response.data.inventorySnapshots, "**************Inventory Snap SHot****************")
                          
                           //   const isSkuExists = await getRepository(FacilitySkuModel).createQueryBuilder("fsm")
                           //   .select(["fsm.facility_code", "fsm.sku"])
                           //   .where("fsm.facility_code = :colStatus", {colStatus: fcCode})
                           //   .andWhere("sku = :newSku", {newSku: response.data.inventorySnapshots[r].itemTypeSKU})
                           //   .getRawMany();
                             
                           //   if(isSkuExists.length < 1){
                              
                           //   await getRepository(FacilitySkuModel).save({facilityCode: fcCode, sku:response.data.inventorySnapshots[r].itemTypeSKU, Quantity:response.data.inventorySnapshots[r].inventory})
                             

                           //   }else{
                             await getRepository(FacilitySkuModel).createQueryBuilder()
                           .update()
                              .set({Quantity: parseInt(response.data.inventorySnapshots[r].inventory)})
                              .where("facility_code = :colStatus", {colStatus: fcCode})
                              .andWhere("sku = :newSku", {newSku: response.data.inventorySnapshots[r].itemTypeSKU})
                              .execute();
                            // }
                             await writeLine(`Facility: ${fcCode} with SKU: ${response.data.inventorySnapshots[r].itemTypeSKU} with inventory ${response.data.inventorySnapshots[r].inventory} sycnhed successfully [${timeString}]`);
                              
                           }
                        } else {
                           for (let j = 0; j < response.data.errors.length; j++) {
                              writeLine(`Error: Code-${response.data.errors[j].code}, Message-${response.data.errors[j].message}, Description- ${response.data.errors[j].description} [${timeString}]`);
                           }
                        }
                        if (response.data.warnings.length > 0) {
                           
                           for (let j = 0; j < response.data.warnings.length; j++) {
                               writeLine(`Warning: Code-${response.data.warnings[j].code}, Message-${response.data.warnings[j].message}, Description- ${response.data.warnings[j].description} [${timeString}]`);
                           }
                        }
                     }).catch((err:any) => {
                        
                        writeLine(`Error: Facility Code-${fcCode}, UC response Status - ${err.response.status}, UC response Status Text - ${err.response.statusText}, Description- ${err.response.data} [${timeString}]`);
                     })


                  
               }
            }
         })

      }
   }
}
   
   }

   public async syncInventoryDeltaFromUC():Promise<any> {
         await this.getUniComToken().then(async resp => {
            if (resp && resp.data && resp.data.access_token) {


               const facilityCode:any = (env.uniComm.facilityCode2).split(",")
               console.log(facilityCode)
               for(let i=0; i<facilityCode.length; i++){
                  const payload = { "updatedSinceInMinutes": env.uniComm.inventoryDeltaDuration }
                  const headers = {
                     'Content-Type': 'application/json',
                     'Authorization': `${resp.data.token_type} ${resp.data.access_token}`,
                     'facility': facilityCode[i]
                  };
                  console.log("headersheadersheadersheaders",headers, payload)
                  await this.updateDeltaInventory(payload, headers)
               }
            }
         })


   
   }


public async updateDeltaInventory(payload:any, headers:any){
   const fs = require("fs");
   var logger = fs.createWriteStream('logs/inventory-delta-schedular-logs.txt', {
      flags: 'a' // 'a' means appending (old data will be preserved)
   })

   var writeLine = (line) => logger.write(`\n${line}`);
   const currentDate = new Date();
   let timeString = currentDate.getDate() + "-" + (currentDate.getMonth() + 1) + "-" + currentDate.getFullYear() + "-" + currentDate.getHours() + ":" + currentDate.getMinutes();
   await this.axios.post(`${env.uniComm.apiUrl}/services/rest/v1/inventory/inventorySnapshot/get`, payload, {
      headers: headers
   }).then(async (response: any) => {
      
      if (response && response.data && response.data.successful && response.data.errors.length < 1) {
         for (let r = 0; r<response.data.inventorySnapshots.length; r++) {
            try {
          await getRepository(Sku).createQueryBuilder().update().set({quantity:response.data.inventorySnapshots[r].inventory}).where("sku_name = :sku", { sku: response.data.inventorySnapshots[r].itemTypeSKU }).execute()
         
          await this.productActiveOnQuantity(response.data.inventorySnapshots[r].itemTypeSKU)
    
           await writeLine(`Facility: ${env.uniComm.facilityCode} with SKU: ${response.data.inventorySnapshots[r].itemTypeSKU} with inventory ${response.data.inventorySnapshots[r].inventory} sycnhed successfully [${timeString}]`);
         } catch (error) {
            await writeLine(`Error Catch: ${env.uniComm.facilityCode} with SKU: ${response.data.inventorySnapshots[r].itemTypeSKU} with inventory ${response.data.inventorySnapshots[r].inventory} catched [${timeString}]`);  
         }
         }
         
      } else {
         for (let j = 0; j < response.data.errors.length; j++) {
            writeLine(`Error: Code-${response.data.errors[j].code}, Message-${response.data.errors[j].message}, Description- ${response.data.errors[j].description} [${timeString}]`);
         }
      }
      if (response.data.warnings.length > 0) {
         
         for (let j = 0; j < response.data.warnings.length; j++) {
             writeLine(`Warning: Code-${response.data.warnings[j].code}, Message-${response.data.warnings[j].message}, Description- ${response.data.warnings[j].description} [${timeString}]`);
         }
      }
   }).catch((err:any) => {
      
      writeLine(`Error: Facility Code-${env.uniComm.facilityCode}, UC response Status - ${err.response.status}, UC response Status Text - ${err.response.statusText}, Description- ${err.response.data} [${timeString}]`);
   })
}

public async skuInventoryUpdate(sku:any, inventory:any){
   let modifiedDate= moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
   await getRepository(Sku).createQueryBuilder().update().set({quantity:inventory,modifiedDate:modifiedDate}).where("sku_name = :sku", {sku:sku}).execute()
}

public async productActiveOnQuantity(sku:any){
   const productData:any = await getManager().createQueryBuilder(ProductVarientOption, 'pvo')
   .select('pvo.product_id as productId, sku.is_active as isActive')
   .innerJoin(Sku, 'sku', 'sku.id=pvo.sku_id')
   .innerJoin(Product, 'p', 'p.product_id=pvo.product_id')
   .where('sku.sku_name=:sku',{sku:sku})
   .execute();
if(productData && productData.length>0 &&  productData[0].isActive!=0){
   // const skuCount = await getManager().query(`SELECT SUM(s.quantity) quantity FROM sku s WHERE s.id IN(SELECT sku_id FROM product_varient_option WHERE product_id=(SELECT pvo.product_id FROM product_varient_option AS pvo INNER JOIN sku AS sku ON sku.id=pvo.sku_id WHERE s.is_active=1 AND sku.sku_name='${sku}'))`)

   const skuCount = await getManager().query(`SELECT SUM(s.quantity) AS quantity FROM sku s INNER JOIN product_varient_option pvo ON s.id = pvo.sku_id INNER JOIN product_varient_option pvo2 ON pvo.product_id = pvo2.product_id INNER JOIN sku sku2 ON sku2.id = pvo2.sku_id WHERE sku2.is_active = 1 AND sku2.sku_name = '${sku}'`)
     const activeStatus = skuCount[0].quantity>0?1:0

let modifiedDate= moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

     await getManager().getRepository(Product).createQueryBuilder().update().set({isActive:activeStatus, quantity:skuCount[0].quantity,modifiedDate:modifiedDate}).where('product_id=:productId',{productId:productData[0].productId}).execute()
}
}

   public async getSaleOrder(saleOrderId: string):Promise<any> {
      let response = {};
      await this.getUniComToken().then(async resp => {
         //console.log(resp, "Token Response **************")
                  if (resp && resp.data && resp.data.access_token) {
                     const payload = {"code": saleOrderId};
         
         
                     const headers = {
                        'Content-Type': 'application/json',
                        'Authorization': `${resp.data.token_type} ${resp.data.access_token}`
                     };
         
                      response = await this.axios.post(`${env.uniComm.apiUrl}/services/rest/v1/oms/saleorder/get`, payload, {
                        headers: headers
                     }).then(async (response: any) => {
                        if (response && response.data && response.data.successful) {
                           
                           return {response: response.data.saleOrderDTO, msg: "sale order found"};
                        } else {
                           
                           return {response: "ORDER_NOT_FOUND_ON_UC", msg: "Sale order not found"}   
                        }
         
                     })
                     .catch((error:any) => {
                        console.log(error, "Errorsfsdsdsdf**********")
                        console.log(error.response.data.errors, "Error**********")
                     })
                  }
               }).catch(error=>{
                  console.log("errrrrrrrrrrrrrrrrrrr",error)
               })
         return response;
   }


   public async createReversePickup(payload: any, returnOrderId:any) {
      delete payload.returnType
      delete payload.orderProductPrefixId
      delete payload.orderId
      delete payload.orderProductId
      delete payload.returnOrderId

      const fs = require("fs");
      var logger = fs.createWriteStream('logs/reversePickupLog.txt', {
         flags: 'a' // 'a' means appending (old data will be preserved)
      })
      var writeLine = (line) => logger.write(`\n${line}`);
      const result:any = await this.getUniComToken().then(async resp => {
         if (resp && resp.data && resp.data.access_token) {
            let facilityCode = payload.facilityCode;
            delete payload.facilityCode
            payload.dimension = {
               "boxLength": 5,
               "boxWidth": 5,
               "boxHeight": 5
            }
console.log("facilityCode",facilityCode)
            const headers = {
               'Content-Type': 'application/json',
               'Authorization': `${resp.data.token_type} ${resp.data.access_token}`,
               'facility': facilityCode
            };
            console.log("payloadpayloadpayloadpayload",payload)
           return  this.axios.post(`${env.uniComm.apiUrl}/services/rest/v1/oms/reversePickup/create`, payload, {
               headers: headers
            }).then(async (response: any) => {
               console.log('Request:',payload)
               console.log('Response:',response.data)
               await writeLine(`Request: ${JSON.stringify(payload)}----- Response: ${JSON.stringify(response.data)}`);  

               if (response && response.data && response.data.successful) {
                  await getManager().query(`UPDATE tm_order_return SET rp_code = '${response.data.reversePickupCode}', modified_date=now() WHERE id=${returnOrderId}`)
                  const result = await this.assignReversePickup(headers, response.data.reversePickupCode);
                  return {response_msg: "Reverse Pickup create successfully", response_code: "SUCCESS", status: 200, rpCode:response.data.reversePickupCode, data: result }
                  
               } else {
                  return { response_msg: "Reverse Pickup not created", response_code: "ERROR", status: 500, data: result}
               }
            })
               .catch((error) => {
                  return { response_msg: "Reverse Pickup not created", response_code: "ERROR", status: 500, data: result }
               })
         }
      })
      return result
   }

   public async returnSaleOrder(saleOrderObj: any, cancelFlag:any, orderProductData:any):Promise<any> {
      //let facilityCode = "0";
      // const ucSaleOrder = await this.getSaleOrder(saleOrderObj.saleOrderCode);
      // if(ucSaleOrder.response && ucSaleOrder.response.saleOrderItems){
      //    for(let r=0;r<ucSaleOrder.response.saleOrderItems.length;r++){
      //       if(ucSaleOrder.response.saleOrderItems[r].code == saleOrderObj.saleOrderItemCodes){
      //          facilityCode = ucSaleOrder.response.saleOrderItems[r].facilityCode
      //       }
      //    }
      // }

      let facilityCode = env.uniComm.facilityCode;
      let responseR :any ;
      if(facilityCode != "0"){
      const unicommerceResponseModel = getManager().getRepository(UnicommerceResponseModel);
     // const orderProductRepository = getManager().getRepository(OrderProduct);
      let uc_payload = new UnicommerceResponseModel();
      uc_payload.orderId = saleOrderObj.orderId;
      uc_payload.orderPrefixId = saleOrderObj.saleOrderCode;
      uc_payload.orderProductId = saleOrderObj.orderProductPreFixId;
      uc_payload.requestType = "ReturnSaleOrder";
      let payloadCooking:any;
      
         payloadCooking = {
            "saleOrderCode": saleOrderObj.saleOrderCode,
            "saleOrderItems": saleOrderObj.skuCodes,
            "returnReason": saleOrderObj.cancelRequestReason
         }
      

      uc_payload.uniRequest = JSON.stringify(payloadCooking);
      
      
      let savedResponse = await unicommerceResponseModel.save(uc_payload);


      await this.getUniComToken().then(async resp => {
        // const orderRepository = getManager().getRepository(Order);
         if (resp && resp.data && resp.data.access_token) {
            const payload = payloadCooking;

            const headers = {
               'Content-Type': 'application/json',
               'Authorization': `${resp.data.token_type} ${resp.data.access_token}`,
               'facility': facilityCode
            };

            responseR = this.axios.post(`${env.uniComm.apiUrl}/services/rest/v1/saleOrder/markReturned`, payload, {
               headers: headers
            }).then(async (response: any) => {

               if (response && response.data && response.data.successful) {


                  // const orderData = await orderRepository.findOne({
                  //    where: {
                  //       orderPrefixId: saleOrderObj.saleOrderCode,
                  //    },
                  // });
                  // orderData.ucOrderStatus = "CANCELLED";
                  // orderData.orderStatusId = 6;
                 // await orderRepository.save(orderData);
                 // await orderProductRepository.update(orderProductData.orderProductId, orderProductData);
                  savedResponse.uniResponse = JSON.stringify(response.data);
                  await unicommerceResponseModel.save(uc_payload);
                  return {response_msg: "Sale Order Item Cancelled successfully", response_code: "SUCCESS", error:0}
               } else {
                  savedResponse.uniResponse = JSON.stringify(response.data.errors);
                  await unicommerceResponseModel.save(uc_payload);
                  return {sendOrderToUCresponse_msg: response.data.errors[0].description, response_code: response.data.errors[0].message, error: 1}
               }

            })
            .catch((error) => {
               console.log("Error:", error.response.data.errors)
            })
         }
      })
   } else{
      responseR =  {response_msg: "Sale Order Item not Found ", response_code: "SALE_ORDER_ITEM_NOT_FOUND", error:1}
   }

      return responseR;
   }

   public async downloadInvoiceFromUC(saleOrderCode: string): Promise<any> {

      const resp = await this.getUniComToken();


      if (resp && resp.data && resp.data.access_token) {


         const payload = { "code": saleOrderCode }

         const headers = {
            'Content-Type': 'application/json',
            'Authorization': `${resp.data.token_type} ${resp.data.access_token}`
         };
         const response = await this.axios.post(`${env.uniComm.apiUrl}/services/rest/v1/oms/saleorder/get`, payload, {
            headers: headers
         })
         if (response && response.data && response.data.successful && response.data.errors.length < 1) {

            try {
               
               const code = response.data.saleOrderDTO.shippingPackages[0].code;
               const fCode =response.data.saleOrderDTO.saleOrderItems[0].facilityCode;
               const invHeaders = {
                  'Content-Type': 'application/json',
                  'Authorization': `${resp.data.token_type} ${resp.data.access_token}`,
                  'facility': fCode
               };
               const invResp = await this.axios.post(`${env.uniComm.apiUrl}/services/rest/v1/invoice/details/get`, {
                  "shippingPackageCode": code
               },{
                  headers: invHeaders
               })
               


              const {Base64} = require('js-base64');
              
              var bin = Base64.atob(invResp.data.invoice.encodedInvoice);
              
               const { S3Service : os } = require('../../services/S3Service');
                const _S3Service = new os();
               const binaryToBufferData = new Buffer(bin, "binary");
               const randomNo = Math.floor(100000 + Math.random() * 900000);
                let _res = await _S3Service.fileUpload(`Invoices/invoice_${code}_${randomNo}.pdf`,binaryToBufferData,'application/pdf',"yes");
                if(_res){
                  return _res;
                  
              }else{
               return {key: "SOMETHING_WENT_WRONG"}
              }
   
            } catch (error) {
               console.log("Error:", error);
            }
            
         } else {
            console.log("Error: " + saleOrderCode + ": ", response.data.errors)
         }


      }


   }

 public async checkAvailableInventory(skuData:any){
   
   const fs = require("fs");
   var logger = fs.createWriteStream('logs/inventory-schedular-logs.txt', {
      flags: 'a' // 'a' means appending (old data will be preserved)
    })
    const skuModal = getManager().getRepository(Sku)
    var writeLine = (line) => logger.write(`\n${line}`);
    const currentDate = new Date();
    let timeString = currentDate.getDate()+"-"+(currentDate.getMonth()+1) +"-"+currentDate.getFullYear() +"-"+currentDate.getHours()+":"+currentDate.getMinutes();



   let allSku:any[]=skuData

   const payload = { "itemTypeSKUs":  allSku}


   
   //const skuCount = await skuRepository.count()

   const uniResult = await this.getUniComToken().then(async resp => {


      if (resp && resp.data && resp.data.access_token) {
  
         const headers = {
            'Content-Type': 'application/json',
            'Authorization': `${resp.data.token_type} ${resp.data.access_token}`,
            'facility': env.uniComm.facilityCode
         };

       return await this.axios.post(`${env.uniComm.apiUrl}/services/rest/v1/inventory/inventorySnapshot/get`, payload, {
            headers: headers
         }).then(async (response: any) => {

            if (response && response.data && response.data.successful && response.data.errors.length < 1) {
               
             let checkInventry:any[]=[]
               for (let r = 0; r < response.data.inventorySnapshots.length; r++) {
       
                  await skuModal.createQueryBuilder().update().set({quantity:response.data.inventorySnapshots[r].inventory}).where("sku_name = :sku", { sku: response.data.inventorySnapshots[r].itemTypeSKU }).execute()
                  await this.productActiveOnQuantity(response.data.inventorySnapshots[r].itemTypeSKU)
                  writeLine(`SKU: ${response.data.inventorySnapshots[r].itemTypeSKU} with inventory ${response.data.inventorySnapshots[r].inventory} sycnhed successfully [${timeString}]` );
                  if(response.data.inventorySnapshots[r].inventory==0){
                     checkInventry.push({
                     sku:response.data.inventorySnapshots[r].itemTypeSKU,
                     quantity:response.data.inventorySnapshots[r].inventory
                     })
                  }

               }

if(checkInventry.length>0){
   return checkInventry
}else{
   return true
}

            } else {
               for(let j=0;j<response.data.errors.length;j++){
                  writeLine(`Error: Code-${response.data.errors[j].code}, Message-${response.data.errors[j].message}, Description- ${response.data.errors[j].description} [${timeString}]`);
               }
               return false
            }

         })
      }
      
   })
return uniResult
 }  
   

  public async assignReversePickup(headers: any, reversePickup: any) {
  // public async assignReversePickup(reversePickup: any) {
      let rpQuery = getManager().getRepository(AssignedReversePickupModel).createQueryBuilder();
      const payload = {
         "reversePickupCodes": [
            reversePickup
         ]
      }
      // const headers = {
      //    'Content-Type': 'application/json',
      //    'Authorization': `bearer dd0a0c7b-17a9-4129-8939-dfc9c7e51165`,
      //    'facility': "NSTS"
      // };
      const result = await this.axios.post(`${env.uniComm.apiUrl}/services/rest/v1/oms/reversePickup/assignReverseProvider`, payload, {
         headers: headers
      }).then(async (response: any) => {
         if(response && response.data && response.data.successful){
            await rpQuery.insert().values({rpCode: reversePickup, reqPayload: JSON.stringify(payload), resPayload: JSON.stringify(response.data.assignedRVP)}).execute();
            return response.data.assignedRVP
         }else{
            await rpQuery.insert().values({rpCode: reversePickup, reqPayload: JSON.stringify(payload), resPayload: JSON.stringify(response.data.errors)}).execute();
            return response.data.errors
         }
      })

      return result
   }

   public async holdUnholdOrderItem(data:any, action:number){
      let responseR:any;
      console.log("datadatadatadatadatadata",data)
      const saleOrderObjLength:number =  data.length
      let itemsCodeList:any=[]
      for(let i=0; i<saleOrderObjLength; i++){
         console.log("data[i]",data[i])
         const itemSplit:any = data[i].itemCode.split(',')
         itemSplit.forEach(element => {
            itemsCodeList.push(element)
         });
      }
      let payload:any={
         "saleOrderCode": data[0].orderPrefixId,
         "saleOrderItemCodes": itemsCodeList
      }
      console.log("payloadpayload",payload)
      let requestUrl:any=""
      if(action==1){
         requestUrl='/services/rest/v1/oms/saleOrder/unholdSaleOrderItems'
      }else{
         requestUrl='/services/rest/v1/oms/saleOrder/holdSaleOrderItems'
      }
      await this.getUniComToken().then(async resp => {
         if (resp && resp.data && resp.data.access_token) {
            const headers = {
               'Content-Type': 'application/json',
               'Authorization': `${resp.data.token_type} ${resp.data.access_token}`
            };
            responseR =  this.axios.post(`${env.uniComm.apiUrl}${requestUrl}`, payload, {
               headers: headers
            }).then(async (response: any) => {
               console.log("response.dataresponse.data",response.data)
               if (response && response.data && response.data.successful) {
                  return {status:200, message: 'Get data successfully'}
               } else {
                  return {status:300, message: 'Order can not hold'}
               }
            })
            .catch((error) => {
               return {status:500, messgae:'Order can not hold'}
            })
         }
      })    
      return responseR
   }

   public async updateFacilityCode(){
      const orderTable: string = "`order`"
      const orders:any[] = await getManager().query(`SELECT o.order_prefix_id opId, o.order_id orderId FROM order_product op INNER JOIN ${orderTable} o ON o.order_id=op.order_id WHERE (op.facility_code IS NULL or op.facility_code='null')  AND DATE(o.created_date)>DATE('2024-07-01') and op.order_status_id=1 and o.sent_on_uc=1 GROUP BY orderId`)
      const ordersLength=orders.length
      for(let i=0;i<ordersLength;i++){
          const productDetailData:any[] = await getManager().query(`select order_product_id orderProductId, sku_name skuName from order_product where order_id=${orders[i].orderId} and order_status_id=1;`)
          try{
            const  getSaleOrder:any = await this.getSaleOrder(orders[i].opId);
            const saleOrderData:any = getSaleOrder.response.saleOrderItems
            const saleOrderDataLength:number = getSaleOrder.response.saleOrderItems.length
            if(productDetailData.length>0){
            for(let i=0; i<saleOrderDataLength; i++){
               const findItem:any = (productDetailData.filter(item=>item.skuName==saleOrderData[i].itemSku))[0]
               try{
               let pincode:number=0
               const facilityRepository:any = getManager().getRepository(FacilityMap)
               const getFacilityCode:any = await facilityRepository.findOne({where: {facilityCode:saleOrderData[i].facilityCode}})
               pincode = getFacilityCode.pincode
               const destinationPincode:any = getSaleOrder.response.billingAddress.pincode
               let config:any={}
               const { OrderTrackingController : otc } = require('../../controllers/Delivery/OrderTrackingController');
               const _otc = new otc();  
               const response:any = await _otc.getPincodeServicebilityDelhivery(destinationPincode)
               if(response.status==200){
                  config = {
                      method: 'get',
                      url: `https://track.delhivery.com/api/dc/expected_tat?origin_pin=${pincode}&destination_pin=${destinationPincode}&mot=S&pdt=B2C`,
                      headers:  {
                        "Authorization": "Token 54ffccec2d1097166572ee64c061d4b9cfa13f7c",
                        "Content-Type" : "application/json",
                      }
                    }
               }else{
                  const payload:any={
                     "queryStringParam": {
                         "pickup_pincode": pincode,
                         "drop_pincode": destinationPincode,
                         "merchantid": "6729c5dc84a8cc151926ef50"
                     }
                 }
                  config = {
                     method: 'post',
                     url: `https://rqkp8eydpl.execute-api.ap-south-1.amazonaws.com/prod/proship-tat`,
                     headers:  {
                       "Content-Type" : "application/json",
                     },
                     data:payload
                   }
               }
                    const result = await this.axios(config).then( (res:any)=>{
                     let expectedDeliveryTat:any
                     if(res.data.overallMaxTAT){
                        expectedDeliveryTat = res.data.overallMaxTAT
                     }else{
                        expectedDeliveryTat=res.data.data.tat
                     }
                        return expectedDeliveryTat
                      }).catch((error:any)=>{
                          return error
                      })
               const deliveryDate = moment(new Date()).add(result, 'days') 
               const updateDate = moment(deliveryDate).format('YYYY-MM-DD 19:00:00');
               const requestJson:any = {
                  orderProductId:findItem.orderProductId,
                  active:1,
                  completed:0,
                  actionDate:updateDate,
                  orderStatusId:19
               }
               const { OrderStatusHistoryController : osh } = require('../../controllers/OrderStatusHistoryController');
               const _orderStatusHistory = new osh();  
               await _orderStatusHistory.updateOrderHistory(requestJson)

                     }catch{
                        console.log("catch")
                     }
            await getManager().query(`UPDATE order_product SET facility_code = '${saleOrderData[i].facilityCode}', facility_name='${saleOrderData[i].facilityName}' WHERE order_product_id = ${findItem.orderProductId}`)
            }
         }
          }catch{
            console.log("testtttttttttttttttttt")
          }
          
      }
  return `Successfull updated facility code orders count ${ordersLength}`
   }

   public async cancelReversePickup(payload:any){
      let responseR:any
      await this.getUniComToken().then(async resp => {
         if (resp && resp.data && resp.data.access_token) {
            const length:any = payload.length
            for(let i=0; i<length; i++){
               const requestPayload:any={reversePickupCode:payload[i].rvpCode}
            const headers = {
               'Content-Type': 'application/json',
               'Authorization': `${resp.data.token_type} ${resp.data.access_token}`,
               'Facility':payload[i].facilityCode
            };
 
            responseR =  this.axios.post(`${env.uniComm.apiUrl}/services/rest/v1/oms/reversePickup/cancel`, requestPayload, {
               headers: headers
            }).then(async (response: any) => {
               console.log("responseresponseresponse",response)
               if (response && response.data && response.data.successful) {
                  await getManager().query(`UPDATE tm_order_return SET rp_code = NULL WHERE id = ${payload[i].returnId}`)
                  return {status:200, message: 'Reverse Pickup cancelled'}
               } else {
                  return {status:300, message: 'Reverse Pickup can not cancelled'}
               }
            })
            .catch((error) => {
               return {status:500, messgae:'Reverse Pickup can not cancelled'}
            })
         }
   }
})
return responseR

   }
}


