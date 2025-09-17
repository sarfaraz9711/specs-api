import { Get, JsonController, Res } from "routing-controllers";
import { CommonService } from "../../../common/commonService";
import { PinelabsService } from "../../../services/payment/PinelabsService";
import { PaymentDoubleVerificationService } from "../../../services/Schedulers/Payment/PaymentDoubleVerificationService";


@JsonController('/scheduler/double-verification/pinelabs-payment-verification')
export class PineLabsVerificationController {
    constructor(
        private _paymentDouble: PaymentDoubleVerificationService,
        private _pinePay: PinelabsService,
        private _m: CommonService
    ) { }


    // Payment Vetification
    /**
     * @api {get} /api/scheduler/double-verification/pinelabs-payment-verification Pine Labs Double verification
     * @apiGroup Scheduler
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully updated",
     *      "status": "200",
     *      "data" : {}
     * }
     * @apiSampleRequest /api/scheduler/double-verification/pinelabs-payment-verification
     * @apiErrorExample {json} Page error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/payment-verify')
    public async doubleVerify(@Res() res: any): Promise<any> {

        let _result = await this._paymentDouble.findOrderDetails('PineLabsPluralSingleCart');
        if (_result.length > 0) {

            let ls = await this._pinePay.getsavedPaymentMethod('PineLabsPluralSingleCart');
            let pluginData = JSON.parse(ls.pluginAdditionalInfo);

            for (let _jsD of _result) {

                let pluralId = _jsD.payment_details;
                let r = await this.doPostRequest(_jsD.payment_details, pluginData.clientSecret);
                if (r.hasOwnProperty('payment_info_data')) {

                    let paymentId = r["payment_info_data"]["payment_id"];
                    let isUpdate = this._paymentDouble._doPaymentPineLabs(paymentId, pluralId, r);
                    console.log("update status >>>>>>", isUpdate);
                } else {
                    console.log("payment id not valid");
                    let isUpdate = this._paymentDouble._doPaymentPineLabs(null, pluralId, {});
                    console.log("not valid case >>>>>>", isUpdate);
                }
            }

            return res.status(200).send(await this._m.getMessage(200));
        } else {
            return res.status(200).send(await this._m.getMessage(300));
        }
    }

    public async pendingPayment(): Promise<any> {
        console.log("no block should empty");
    }

    public async _doFailPayment(): Promise<any> {
        console.log("no block should empty");

    }

    public doPostRequest = async (plId: any, secret:any) => {

        const axios = require('axios');
        let _url = process.env.PINELAB_DOUBLE_VERIFICATION;
        _url = _url.replace('{plural_order_id}', plId);

        let _b = Buffer.from(`${process.env.PINELABS_PAYMENT_EMAIL}:${secret}`).toString('base64');

        const options = {
            method: 'GET',
            url: _url,
            headers: {
                authorization: `Basic ${_b}`
            }
        };

        // console.log("encode",_b, JSON.stringify(options));

        try {
            let _res = await axios.request(options);
            console.log("res", _res.data);
            return _res.data;
        } catch (e) {
            console.log("error>>> ", e["data"]);
            return {};
        }
    }
}