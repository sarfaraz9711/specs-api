import { Plugins } from '../../../plugin-manager/models/Plugin';
import { Service } from 'typedi';
import { getManager, MoreThan } from 'typeorm';
import { Order } from '../../models/Order';
import { PaytmOrder } from '../../models/Paytm/PaytmOrder';
//import { PinelabsService } from './PinelabsService';
import {env} from '../../../env';
import { PaytmRefunds } from '../../models/Paytm/PaytmRefunds';


@Service()

export class PaytmService {
    // constructor(
    //     private _pnLabs: PinelabsService
    // ) {}

    public async getsavedPaymentMethod(pluginName: any): Promise<any> {
        const condition: any = {};
        condition.where = {};
        condition.where = { 'pluginName': pluginName };
        return getManager().getRepository(Plugins).findOne(condition);
    }

    public initiateRefund = async(orderId:any, prefixOrderId:any, refundAmount:any, pluginInfo:any, orderProductIds:any) => {
        const condition: any = {};
        condition.where = {};
        condition.where = { 'orderId': orderId };
        const paytmTxnInfo = await getManager().getRepository(PaytmOrder).findOne(condition);
        
        const paytmRefId = paytmTxnInfo.paytmRefId;
        let pluginAdditionalInfo = pluginInfo && pluginInfo.pluginAdditionalInfo;
        pluginAdditionalInfo = JSON.parse(pluginAdditionalInfo);
         let paytmMerchantid = pluginAdditionalInfo.mId;
         let paytmWebSitename = pluginAdditionalInfo.websiteName;
        
        let paytmParams = {
            body: {},
            head: {}
        };

        let paytmSetting = {
            "hostUrl": env.payment.paytmPaytmentUrl,
            "merchantId": paytmMerchantid,
            "merchantKey": env.payment.paytmMerchantKey,
            "callbackUrl": env.payment.paytmReturnUrl,
            "webSiteName": paytmWebSitename
        };
        paytmParams.body = {
            
            "mid"           : paytmSetting.merchantId,
            "txnType"       : "REFUND",
            "orderId"       : prefixOrderId,
            "txnId"         : paytmRefId,
            "refId"         : "REFUNDID_"+orderProductIds,
            "refundAmount"  : refundAmount,
            
        };


        const Paytm = require('paytmchecksum');
        let d = await Paytm.generateSignature(JSON.stringify(paytmParams.body), paytmSetting.merchantKey);
        paytmParams.head = {
            "signature": d
        };

        let postData = JSON.stringify(paytmParams);

        let _d = await this._doRequestToInitiateRefund(postData);
        
        var refundResponse:any;
        if(_d){
            const paytmOrderRepository = getManager().getRepository(PaytmRefunds);
            const refundDetails = {
                txnTimestamp: _d.body.txnTimestamp,
                orderPrefixId: prefixOrderId,
                mid: _d.body.mid,
                localRefundId: "REFUNDID_"+orderProductIds,
                resultStatus: _d.body.resultInfo.resultStatus,
                resultCode: _d.body.resultInfo.resultCode,
                resultMessage: _d.body.resultInfo.resultMsg,
                refundId: _d.body.refundId,
                txnId: _d.body.txnId,
                refundAmount: refundAmount,
                refundInitiateResponse: JSON.stringify(_d),
                refundInitiateRequest: JSON.stringify(paytmParams.body)
            }
            if(refundDetails.resultCode == "601"){
                await paytmOrderRepository.save(refundDetails);
                refundResponse = {success: true, message: refundDetails.resultMessage};  
            }else{
                await paytmOrderRepository.save(refundDetails);
                refundResponse = {success: false, message: refundDetails.resultMessage};
            }

        }

        return refundResponse;

    }

    public _doRequestToInitiateRefund = async (postData: any) => {

        var options = {
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': postData.length
            }
        };

        // for Staging 
        let hostname = env.payment.paytmPaytmentUrl + '/refund/apply';

       console.log("hostname",hostname)
       console.log("postData",postData)
       console.log("options",options)
        const axios = require('axios');
        let res = await axios.post(hostname, postData, options);
       return res.data;
    }

    public createToken = async (mapData: any, prefixOrderId: any, orderTotal: any, pluginInfo) => {
        //let ls = await this._pnLabs.getsavedPaymentMethod("paytm");

        let pluginAdditionalInfo = pluginInfo && pluginInfo.pluginAdditionalInfo;
        pluginAdditionalInfo = JSON.parse(pluginAdditionalInfo);
         let paytmMerchantid = pluginAdditionalInfo.mId;
         let paytmWebSitename = pluginAdditionalInfo.websiteName;
        
        let paytmParams = {
            body: {},
            head: {}
        };

        let paytmSetting = {
            "hostUrl": env.payment.paytmPaytmentUrl,
            "merchantId": paytmMerchantid,
            "merchantKey": env.payment.paytmMerchantKey,
            //"callbackUrl": "http://localhost:3000/api/paytm/callback-process",
            "callbackUrl": env.payment.paytmReturnUrl,
            "webSiteName": paytmWebSitename
        };

        //let orderId = 'PAYTM_ORDERID_' + Math.random().toString(36).substring(2, 7);
        let orderId = prefixOrderId;


        // let j = 0;
        // if (mapData.productDetails) {
        //     let dm = mapData.productDetails;
        //     let jk = (dm.map(x => x.price));
        //     j = jk.reduce((x, y) => (parseInt(x) + parseInt(y)));
        // }

       // let am = typeof(j) == "string" ? (parseInt(j)) : (j);


        paytmParams.body = {
            "requestType": "Payment",
            "mid": paytmSetting.merchantId,
            "websiteName": paytmSetting.webSiteName,
            "orderId": orderId,
            "callbackUrl": paytmSetting.callbackUrl,
            "txnAmount": {
                "value": parseFloat(orderTotal).toFixed(2),
                "currency": "INR",
            },
            "userInfo": {
                "custId": "CUST_001",
            },
        };

        const Paytm = require('paytmchecksum');
        let d = await Paytm.generateSignature(JSON.stringify(paytmParams.body), paytmSetting.merchantKey);
        paytmParams.head = {
            "signature": d
        };
        let postData = JSON.stringify(paytmParams);

        let _d = await this._doRequest(postData, orderId, paytmSetting);
        if (_d) {
            let _dData = {
                "txnToken": _d.body.txnToken,
                "orderId": orderId,
                "signature": _d.head.signature,
                "orderAmount": parseFloat(orderTotal).toFixed(2)
            };
            let _finalTrx = await this._doPostForPaymentMetaData(_dData, paytmSetting);
            await this.saveProcess(prefixOrderId,_d.body.txnToken,_d.head.signature);
            return _finalTrx;
        } else {
            return { "status": false,"txnToken" : null };
        }
    }

    public _doRequest = async (postData: any, orderId: any, paytmSetting: any) => {

        var options = {
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': postData.length
            }
        };

 
        let hostname = env.payment.paytmPaytmentUrl + '/theia/api/v1/initiateTransaction?mid=' + paytmSetting.merchantId + '&orderId=' + orderId;

        const axios = require('axios');
        let res;
        try {
             res = await axios.post(hostname, postData, options);    
        } catch (error) {
        }
        
       return res.data;
    }

    public _doPostForPaymentMetaData = async (paytmTxData: any, paytmSetting: any) => {
        try {
            
        
        const axios = require('axios');
        const paymentOptions = await axios.post(`${env.payment.paytmPaytmentUrl}/fetchPaymentOptions`, {
            "head": {
                "txnToken": paytmTxData.txnToken
            }
        }, {
            params: {
                mid: paytmSetting.merchantId,
                orderId: paytmTxData.orderId
            },
            headers: {
                tokenType: "TXN_TOKEN",
                token: paytmTxData.txnToken
            }
        });
        let metaData = {};
        let _rs = paymentOptions.data;
        

        if (_rs.body.resultInfo.resultStatus == 'S') {
            
            let filteredModes = _rs.body.merchantPayOption && _rs.body.merchantPayOption.paymentModes.filter( (item) => {
               return ['DEBIT_CARD', 'CREDIT_CARD', 'NET_BANKING'].includes(item.paymentMode); 
              
            });
            metaData = {
                "status": true,
                "txnInitiationData": JSON.stringify(paytmTxData),
                "paymentResources": filteredModes,
                "txnToken": paytmTxData.txnToken,
                "signature": paytmTxData.signature,
                "_token": paytmTxData.orderId
            };
            return metaData;
        } else {
            return { "status": false,"txnToken" : null };
        }
    } catch (error) {
        return { "status": false,"txnToken" : null };
    }
    }


    public saveProcess = async (orderPrefixId,trxId:any,signature:any) => {
        
        const orderRepository = getManager().getRepository(Order);
        
        const paytmOrderRepository = getManager().getRepository(PaytmOrder);
        const order = await orderRepository.findOne({where: {orderPrefixId}, select: ['orderId','orderPrefixId']});
        if(order){
            const orderId = order.orderId;
            const orderDetail = await orderRepository.findOne(orderId);
            const orderAmount = Math.round(orderDetail.total);
            
                // const paytmParams = new PaytmOrder();
                // paytmParams.orderId = orderDetail.orderId;
                // paytmParams.paytmRefId = order.orderPrefixId;
                // paytmParams.total = orderAmount.toString();
                // paytmParams.status = 0;

                let _paytmTrx = {
                    orderId : orderDetail.orderId,
                    paytmRefId : order.orderPrefixId,
                    total : orderAmount.toString(),
                    status : 0,
                    trxNo : trxId,
                    paytmSig : signature

                };


                await paytmOrderRepository.save(_paytmTrx);
        }else{
            throw Error("Unable to save data");
        }
        
    
    }

    /*
    *
    * To sync all the Refund txns that have PENDING status
    * 
    * */
    public syncRefundTxns = async () => {

        const pluginInfo = await this.getsavedPaymentMethod('paytm');
        let pluginAdditionalInfo = pluginInfo && pluginInfo.pluginAdditionalInfo;
        pluginAdditionalInfo = JSON.parse(pluginAdditionalInfo);
        let paytmMerchantid = pluginAdditionalInfo.mId;

        const condition: any = {};
        condition.where = {};
        condition.where = { 'resultStatus': "PENDING", 'createdDate': MoreThan('2024-12-01') };
        const paytmRefundTxnInfo = await getManager().getRepository(PaytmRefunds).find(condition);

        
        const refundsCount = paytmRefundTxnInfo.length;
        if (paytmRefundTxnInfo && refundsCount > 0) {
            for (let i = 0; i < refundsCount; i++) {

                let paytmParams = {
                    body: {},
                    head: {}
                };

                let paytmSetting = {

                    "merchantId": paytmMerchantid,
                    "merchantKey": env.payment.paytmMerchantKey


                };
                paytmParams.body = {

                    "mid": paytmSetting.merchantId,

                    "orderId": paytmRefundTxnInfo[i].orderPrefixId,

                    "refId": paytmRefundTxnInfo[i].localRefundId,


                };


                const Paytm = require('paytmchecksum');
                let d = await Paytm.generateSignature(JSON.stringify(paytmParams.body), paytmSetting.merchantKey);
                paytmParams.head = {
                    "signature": d
                };

                let postData = JSON.stringify(paytmParams);

                
                var options = {
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': postData.length
                    }
                };

                // for Staging 
                let hostname = env.payment.paytmPaytmentUrl + '/v2/refund/status';


                const axios = require('axios');
                let res = await axios.post(hostname, postData, options);
                console.log("res.data.body",res.data.body)
                const orderProductIds:any=(paytmRefundTxnInfo[i].localRefundId).substring(9).split(',').map(id => `'${id}'`).join(", ");
                    const orderData:any = await getManager().query(`SELECT op.order_id orderId, op.order_product_id orderProductId FROM order_product op where op.order_product_id in (${orderProductIds})`)
                if (res.data && res.data.body && res.data.body.resultInfo && res.data.body.resultInfo.resultStatus=='TXN_SUCCESS') {
                    const resultStatus = res.data.body.resultInfo.resultStatus;
                    const resultCode = res.data.body.resultInfo.resultCode;
                    const resultMessage = res.data.body.resultInfo.resultMsg;
                    const acceptRefundStatus = res.data.body.acceptRefundStatus;
                    const acceptRefundTimestamp = res.data.body.acceptRefundTimestamp;
                    const userCreditInitiateStatus = res.data.body.userCreditInitiateStatus;
                    const merchantRefundRequestTimestamp = res.data.body.merchantRefundRequestTimestamp;
                    const txnAmount = res.data.body.txnAmount;
                    const totalRefundAmount = res.data.body.totalRefundAmount;
                    const source = res.data.body.source;
                    const refundDetailInfoList = JSON.stringify(res.data.body.refundDetailInfoList);
                    const schedulerResponse = JSON.stringify(res.data.body);

                    const paytmOrderRepository = getManager().getRepository(PaytmRefunds);
                    await paytmOrderRepository.createQueryBuilder().update().set({
                        resultStatus,
                        resultCode,
                        resultMessage,
                        acceptRefundStatus,
                        acceptRefundTimestamp,
                        userCreditInitiateStatus,
                        merchantRefundRequestTimestamp,
                        txnAmount,
                        totalRefundAmount,
                        source,
                        refundDetailInfoList,
                        schedulerResponse
                    }).where("orderPrefixId=:id AND localRefundId = :refId", { id: paytmRefundTxnInfo[i].orderPrefixId, refId: paytmRefundTxnInfo[i].localRefundId }).execute();

                    
                    const { OrderStatusHistoryController : osh } = require('../../controllers/OrderStatusHistoryController');
                    const _orderStatusHistory = new osh(); 
                    await  _orderStatusHistory.saveStatusHistory(orderData[0].orderId, paytmRefundTxnInfo[i].orderPrefixId,orderData, orderData.length,31,1,1,1)
                    const { OrderService : os } = require('../../services/OrderService');
                    const _orderService = new os();
                    const orderJson:any = {
                        orderProductIds:orderProductIds, 
                        orderStatusId:31,
                        orderId:orderData[0].orderId
                    }
                    await _orderService.updateOrderProductStatus(orderJson)
                }
            }

            return true;
        }

        return true;

    }

    public getTotalPaidRefundAmount = async(orderPrefixIdsArray) => {
        const query = getManager().getRepository(PaytmRefunds).createQueryBuilder();
        query.select(['ROUND(SUM(totalRefundAmount), 2) as refundTotal']);
            
        query.where('resultCode = "10" AND resultStatus = "TXN_SUCCESS"');
        query.andWhere('orderPrefixId IN(:...ids)', {ids: orderPrefixIdsArray})
        const resultquery = await query.execute();
        return resultquery[0].refundTotal?resultquery[0].refundTotal:0;
        
      }

    
}