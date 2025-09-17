import { Get, JsonController, Res } from "routing-controllers";
import { PaymentDoubleVerificationService } from "../../../services/Schedulers/Payment/PaymentDoubleVerificationService";
import { CommonService } from "../../../common/commonService";
import { env } from "../../../../env";
import moment from "moment";
import { IngenicoService } from "../../../services/payment/IngenicoService";

@JsonController('/scheduler/double-verification/ebs-payment-verification')
export class PineLabsVerificationController {
    constructor(
        private _m: CommonService,
        private _ingenico: PaymentDoubleVerificationService,
        private ingenicoService: IngenicoService
    ) { }

    // Payment Vetification
    /**
     * @api {get} /api/scheduler/double-verification/ebs-payment-verification/ebs-verification Ingenico Double verification
     * @apiGroup Scheduler
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully updated",
     *      "status": "200",
     *      "data" : {}
     * }
     * @apiSampleRequest /api/scheduler/double-verification/ebs-payment-verification/ebs-verification
     * @apiErrorExample {json} Page error
     * HTTP/1.1 500 Internal Server Error
     */
     @Get('/ebs-verification')
     public async _doEbsDoubleVerifacation(@Res() res: any): Promise<any> {
        

        let _result = await this._ingenico.findOrderDetails('ingenico');
        if (_result.length > 0) {

            //const fs = require("fs");

            let ls = await this._ingenico.getsavedPaymentMethod('ingenico');
            let pluginData = JSON.parse(ls.pluginAdditionalInfo);
            
            for(let _jsD of _result){
                
                //return res.status(200).send(await this._m.getMessage(200,_jsD));
                try {
                    
                
                let payDetails = _jsD.order_prefix_id;
                let orderDate = moment(_jsD.created_date).format("DD-MM-YYYY");
                let r = await this.doPostRequest(payDetails, pluginData,orderDate);
                

                if (Object.keys(r).length > 0) {
                    await this._ingenico._doPaymentIngenico(payDetails,r,_jsD);
                } else {
                    await this._ingenico._doPaymentIngenico(payDetails,r,_jsD);
                }
            } catch (error) {
                    continue
            }
            }

            return res.status(200).send(await this._m.getMessage(200));
        } else {
            return res.status(200).send(await this._m.getMessage(300));
        }
    
     }

     //{"isTest":"1","merchantCode":"T519282","schemeCode":"FIRST","encrypKey":"9882493896MRPUBL","encrypIv":"9811369370VMRBXK","userId":"Leay@L519282","password":"Leay@L519282"}

     public doPostRequest = async (orderPrefixId: any, paymentConfig:any,orderDate:any) => {
     
        let paymentParams = {
            "merchant": {
              "identifier": paymentConfig.merchantCode
            },
            "transaction": {
              "deviceIdentifier": "S",
              "currency": "INR",
              "identifier": orderPrefixId,
              "dateTime": orderDate,
              "requestType": "O"
            }
          };        

        
       
        let options = {
            url : env.ingenicoPayment.dualVerificationUrl,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data : paymentParams
        };
        
        try{
            const axios = require('axios');
            let _result = await axios.request(options);
            return _result.data;
        }catch(e){
            return {};
        }        
    }

    @Get('/ingenico-sync-refund-txns')
    public async syncRefundsTxns(@Res() response: any): Promise<any> {
        let pgInfo = await this._ingenico.getsavedPaymentMethod('ingenico');
        const plugInfo = pgInfo.pluginAdditionalInfo;
        const parsedInfo = JSON.parse(plugInfo);
        await this.ingenicoService.syncRefundTxns(parsedInfo);
        return response.status(200).send({
            status: 1,
            message: 'Refunds sycn successfully',
            data:{}
        });
    }

}