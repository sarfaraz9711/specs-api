import { Get, JsonController, Res } from "routing-controllers";
import { PaymentDoubleVerificationService } from "../../../services/Schedulers/Payment/PaymentDoubleVerificationService";

import { CommonService } from "../../../common/commonService";

import { env } from "../../../../env";
import { PaytmService } from "../../../services/payment/PaytmService";

@JsonController('/scheduler/double-verification/paytm-payment-verification')
export class PineLabsVerificationController {
    constructor(
        private _m: CommonService,
        private _payTm: PaymentDoubleVerificationService,
        private _paytmService: PaytmService
    ) { }

    // Payment Vetification
    /**
     * @api {get} /api/scheduler/double-verification/paytm-payment-verification/paytm-verification Paytm Double verification
     * @apiGroup Scheduler
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully updated",
     *      "status": "200",
     *      "data" : {}
     * }
     * @apiSampleRequest /api/scheduler/double-verification/paytm-payment-verification/paytm-verification
     * @apiErrorExample {json} Page error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/paytm-verification')
    public async _doPaytmDoubleVerifacation(@Res() res: any): Promise<any> {

        let _result = await this._payTm.findOrderDetails('paytm');
        if (_result.length > 0) {

            //const fs = require("fs");

            let ls = await this._payTm.getsavedPaymentMethod('paytm');
            let pluginData = JSON.parse(ls.pluginAdditionalInfo);
            
            for(let _jsD of _result){
                
                //return res.status(200).send(await this._m.getMessage(200,_jsD));
                
                let payDetails = _jsD.order_prefix_id;
                let r = await this.doPostRequest(payDetails, pluginData);
                //let _ds = JSON.stringify(r)+"\r\n"; 
                //fs.appendFileSync('loopedFile.txt',_ds);
                


                if (Object.keys(r).length > 0) {
                    await this._payTm._doPaymentPaytm(payDetails,r);
                } else {
                    await this._payTm._doPaymentPaytm(payDetails,r);
                }
            }

            return res.status(200).send(await this._m.getMessage(200));
        } else {
            return res.status(200).send(await this._m.getMessage(300));
        }
    }


    public doPostRequest = async (orderPrefixId: any, paymentConfig) => {
        let paytmMerchantid = paymentConfig.mId;
        let paytmParams = {
            body : {},
            head : {}
        };        
        paytmParams.body = {
            "mid": paytmMerchantid,
            "orderId": orderPrefixId,
        };
        
        const Paytm = require('paytmchecksum');
        let d = await Paytm.generateSignature(JSON.stringify(paytmParams.body), env.payment.paytmMerchantKey);

        paytmParams.head = {
            "signature": d

        };

       
        let postableData = JSON.stringify(paytmParams);
        let options = {
            //hostname: 'securegw-stage.paytm.in',
            //port: 443,
            //path: '/v3/order/status',
            url : env.payment.paytmPaytmentUrl+"/v3/order/status",
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': postableData.length
            },
            data : postableData
        };
        
        
        try{
            const axios = require('axios');
            let _result = await axios.request(options);
            return _result.data;
        }catch(e){

            return {};

        }        
    }

    @Get('/paytm-sync-refund-txns')
    public async syncRefundsTxns(@Res() response: any): Promise<any> {
        await this._paytmService.syncRefundTxns();
        return response.status(200).send({
            status: 1,
            message: 'Refunds sycn successfully',
            data:{}
        });
    }
}