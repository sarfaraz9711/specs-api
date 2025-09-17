import { Service } from 'typedi';
import { getManager } from 'typeorm';
import { IngenicoOrderData } from '../../../api/models/Ingenico/IngenicoOrderData';
import { IngenicoRefunds } from '../../models/Ingenico/IngenicoRefunds';
@Service()
export class IngenicoService {


    public async savePaymentRequest(orderData: any, generatedToken:string) : Promise<boolean> {
       let _ingenicoRepo =  getManager().getRepository(IngenicoOrderData);

       let ingenicoData = new IngenicoOrderData();
       ingenicoData.orderId = orderData.orderId;
       ingenicoData.payRef = orderData.orderPrefixId;
       ingenicoData.payStatus = "0";
       ingenicoData.totalAmount = orderData.total;
       ingenicoData.customerId = orderData.customerId;
       ingenicoData.generatedToken = generatedToken;
       ingenicoData.requestPayload = JSON.stringify(ingenicoData);
      await _ingenicoRepo.save(ingenicoData);
      return true;
    }

    public async createToken(inputData: any, orderData: any, pluginInfo:any): Promise<string> {
      try {
        const crypto = require('crypto')
        let pluginAdditionalInfo = pluginInfo && pluginInfo.pluginAdditionalInfo;
        pluginAdditionalInfo = JSON.parse(pluginAdditionalInfo);
        let ingenicoMid = pluginAdditionalInfo.merchantCode;
        let encryptionKey = pluginAdditionalInfo.encrypKey;
        // let isTestMode = pluginAdditionalInfo.isTest;
        
        //merchantid|txnId|totalamount|accountNo|consumerId|consumerMobileNo|consumerEmailId |debitStartDate|debitEndDate|maxAmount|amountType|frequency|cardNumber| expMonth|expYear|cvvCode|SALT
        
        let orderTotalAmount = orderData.total;
       // let orderTotalAmount = 8.5;
        const dataToHash:any = `${ingenicoMid}|${orderData.orderPrefixId}|${orderTotalAmount}|||${orderData.telephone}|${orderData.email}||||||||||${encryptionKey}`;

        const hash = crypto.createHash('sha256').update(dataToHash).digest('hex');
        await this.savePaymentRequest(orderData, hash);
        return Promise.resolve(hash);
      } catch (error) {
        return Promise.reject();
      }
        
    }

    public initiateRefund = async(orderId:any, prefixOrderId:any, refundAmount:any, pluginInfo:any) => {
           
        const condition: any = {};
        condition.where = {};
        condition.where = { 'orderId': orderId };
        const ingenicoTxnInfo = await getManager().getRepository(IngenicoOrderData).findOne(condition);
        const tokenOrder = ingenicoTxnInfo.tpslTxnId;
        const axios = require('axios');
        const currentDate = new Date();
        const currD = ('0' + currentDate.getDate()).slice(-2) + '-'
             + ('0' + (currentDate.getMonth()+1)).slice(-2) + '-'
             + currentDate.getFullYear();
        let hostname = "https://www.paynimo.com/api/paynimoV2.req";
        let payload = {
            "merchant": {
              "identifier": pluginInfo.merchantCode
            },
            "cart": {
            },
            "transaction": {
              "deviceIdentifier": "S",
              "amount": refundAmount,
              "currency": "INR",
              "dateTime": currD,
              "token": tokenOrder,
              "requestType": "R"
            }
          }
          let apiRes = await axios.post(hostname, payload, {});
          const res = apiRes.data;
          const objForSaving = {
            refundAmount: refundAmount,
            merchantCode: res.merchantCode,
            merchantTransactionIdentifier: res.merchantTransactionIdentifier,
            merchantTransactionRequestType: res.merchantTransactionRequestType,
            responseType: res.responseType,
            transactionState: res.transactionState,
            token: res.paymentMethod.token,
            bankSelectionCode: res.paymentMethod.bankSelectionCode,
            amount: res.paymentMethod.paymentTransaction.amount,
            balanceAmount: res.paymentMethod.paymentTransaction.balanceAmount,
            bankReferenceIdentifier: res.paymentMethod.paymentTransaction.bankReferenceIdentifier,
            dateTime: res.paymentMethod.paymentTransaction.dateTime,
            errorMessage: res.paymentMethod.paymentTransaction.errorMessage,
            identifier: res.paymentMethod.paymentTransaction.identifier,
            refundIdentifier: res.paymentMethod.paymentTransaction.refundIdentifier,
            statusCode: res.paymentMethod.paymentTransaction.statusCode,
            statusMessage: res.paymentMethod.paymentTransaction.statusMessage,
            refundInitiateResponse: JSON.stringify(res),
            refundInitiateRequest: JSON.stringify(payload)
          }
          if(objForSaving.statusCode === "0400"){
            await getManager().getRepository(IngenicoRefunds).save(objForSaving);
            return {success: true, message: "Refund initiated successfully"};  
          }else{
            await getManager().getRepository(IngenicoRefunds).save(objForSaving);
            return {success: false, message: objForSaving.statusMessage+". "+objForSaving.errorMessage};
          }
          
    }

    public syncRefundTxns = async(pgInfo) => {
             
      const condition: any = {};
        condition.where = {};
        condition.where = { 'statusCode': "0400" };
        const RefundTxnInfo:any = await getManager().getRepository(IngenicoRefunds).find(condition);
      

      const refundsCount = RefundTxnInfo.length;
      if (RefundTxnInfo && refundsCount > 0) {
        const axios = require('axios');
        const currentDate = new Date();
        const currD = ('0' + currentDate.getDate()).slice(-2) + '-'
          + ('0' + (currentDate.getMonth() + 1)).slice(-2) + '-'
          + currentDate.getFullYear();
        for (let i = 0; i < refundsCount; i++) {
          let hostname = "https://www.paynimo.com/api/paynimoV2.req";
          const payload = {
            "merchant": {
              "identifier": pgInfo.merchantCode
            },
            "transaction": {
              "deviceIdentifier": "S",
              "currency": "INR",
              "dateTime": currD,
              "token": RefundTxnInfo[i].identifier,
              "requestType": "O"
            }
          }

          let apiRes = await axios.post(hostname, payload, {});
          //   const res = apiRes.data;
          if(apiRes.data){
            const _ingen = getManager().getRepository(IngenicoRefunds);
            const balanceAmount = apiRes.data.paymentMethod.paymentTransaction.balanceAmount;
            const bankReferenceIdentifier = apiRes.data.paymentMethod.paymentTransaction.bankReferenceIdentifier;
            const dateTime = apiRes.data.paymentMethod.paymentTransaction.dateTime;
            const statusCode = apiRes.data.paymentMethod.paymentTransaction.statusCode;
            const statusMessage = apiRes.data.paymentMethod.paymentTransaction.statusMessage;
            const errorMessage = apiRes.data.paymentMethod.paymentTransaction.errorMessage;
            const schedulerResponse = JSON.stringify(apiRes.data);
            if(statusCode=='0400' && statusMessage=='REFUND'){
              const orderTable:any = '`order`'
              const orderData:any = await getManager().query(`select op.order_id orderId, op.order_product_id orderProductId, GROUP_CONCAT(op.order_product_id) orderProductIds from ${orderTable} o INNER JOIN order_product op ON op.order_id=o.order_id  where o.order_prefix_id='${RefundTxnInfo[i].merchantTransactionIdentifier}' AND op.order_status_id=30`)
              const { OrderStatusHistoryController : osh } = require('../../controllers/OrderStatusHistoryController');
              const _orderStatusHistory = new osh(); 
              await  _orderStatusHistory.saveStatusHistory(orderData[0].orderId, RefundTxnInfo[i].merchantTransactionIdentifier,orderData, orderData.length,31,1,1,1)
              const { OrderService : os } = require('../../services/OrderService');
              const _orderService = new os();
              const orderJson:any = {
                  orderProductIds:orderData[0].orderProductIds, 
                  orderStatusId:31,
                  orderId:orderData[0].orderId
              }
              await _orderService.updateOrderProductStatus(orderJson)
            }
            await _ingen.createQueryBuilder().update().set({
            balanceAmount,
            bankReferenceIdentifier,
            dateTime,
            statusCode,
            statusMessage,
            errorMessage,
            schedulerResponse
            }).where("merchantTransactionIdentifier=:id AND identifier = :refId", { id: RefundTxnInfo[i].merchantTransactionIdentifier, refId: RefundTxnInfo[i].identifier }).execute();
          }

        }
      }
      
        
  }

  public getTotalPaidRefundAmount = async() => {
    const query = getManager().getRepository(IngenicoRefunds).createQueryBuilder();
    query.select(['ROUND(SUM(refundAmount), 2) as refundTotal']);
        
    query.where('statusCode = 0300');
    const resultquery = await query.execute();
    return resultquery[0].refundTotal?resultquery[0].refundTotal:0;
    
  }




}