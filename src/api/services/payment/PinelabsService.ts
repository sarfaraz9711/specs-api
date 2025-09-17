import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { PluginRepository } from '../../repositories/PluginRepository';
import { PinelabsRepository } from "../../repositories/payment/PinelabsRepository";

import { Pinlabs } from '../../models/PineLabs/Pinelabs';
import jsSHA from 'jssha';
import { getManager } from 'typeorm';
import { Order } from '../../models/Order';
//import { OrderProduct } from 'src/api/models/OrderProduct';
//import { Product } from 'src/api/models/ProductModel';
//import { StripeOrder } from 'src/plugin-manager/models/StripeOrder';
//import { Plugins } from 'src/plugin-manager/models/Plugin';
import { PineOrder } from '../../models/PineLabs/PineOrder';
//import { env } from '../../../../src/env';


@Service()

export class PinelabsService {
    constructor(@OrmRepository() private _plugin: PluginRepository, @OrmRepository() private _pineR: PinelabsRepository
        //, @OrmRepository() private _pineorderR : PinelabsordersRepository
    ) { }

    public async getsavedPaymentMethod(pluginName: any): Promise<any> {
        const condition: any = {};
        condition.where = {};
        condition.where = { 'pluginName': pluginName };
        //condition.take = 1;
        return this._plugin.findOne(condition);
    }


    public async saveOrderDetails(OrdersDetails: Pinlabs): Promise<Pinlabs> {
        const m = this._pineR.save(OrdersDetails);
        console.log(m);
        return m;
    }
    public async createPayment(mapData:any, orderId:any): Promise<any> {

        let ls = await this.getsavedPaymentMethod('PineLabsPluralSingleCart');

        if (Object.keys(ls).length > 0) {
            let jData = JSON.parse(ls.pluginAdditionalInfo);
            let merchantData = {
                "merchant_id": jData.mId,
                "merchant_access_code": jData.merchantPassword,
                //"merchant_return_url": "http://10.200.146.139:9020/chargingrespnew.aspx",
                "merchant_return_url": process.env.PINELAB_RETURN_URL,
                //"merchant_order_id": "API-DEMO-DOC-" + await this.makeid(6);
                merchant_order_id: orderId
            };
            let secureSeret = jData.clientSecret;

            let _cookedData = await this._PineLabsRequest(mapData);

            //let saveInModel: any = {};
            //saveInModel = await this.modelSaveCook(mapData);

            let collectionMap = Object.assign({}, { merchant_data: merchantData }, _cookedData);
            //console.log("collectionMap", collectionMap);


            let r = Buffer.from(JSON.stringify(collectionMap)).toString('base64');
            let v = this;
            let _token = await this.getEncryptedData(r, secureSeret);
            let d = await v.doPostRequest(r, _token);
            if (d) {
                //saveInModel.tokenId = d.token;
                //saveInModel.pluralOrderId = d.plural_order_id;
                //let c = await this.saveOrderDetails(saveInModel);
                //console.log("saving record", c);
                await this.saveProcess(orderId,d.plural_order_id);
            }
            return Promise.resolve(d);
        } else {
            return Promise.resolve({});
        }
    }




    public getEncryptedData = (request: string, secureSeret) => {
        let shaGenerated: string = "";
        let shaObj = new jsSHA("SHA-256", "TEXT");
        shaObj.setHMACKey(secureSeret, "HEX");
        shaObj.update(request);
        shaGenerated = shaObj.getHMAC("HEX");
        return Promise.resolve(shaGenerated);
        // return shaGenerated;
    }

    public doPostRequest = async (_r, _token) => {
        const axios = require('axios');
        //console.log(_r,_token);
        var options = { request: _r };

        let res = await axios.post(process.env.PINELAB_PAYMENT_URL, options, {
            headers: {
                'x-verify': _token,
                'cache-control': 'no-cache',
                'content-type': 'application/json',
                accept: 'application/json'
            }
        });
        return Promise.resolve(res.data);
    }
    public makeid = async (length: any) => {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return Promise.resolve(result);
    }


    public _PineLabsRequest = async (rawData: any) => {
        let j = 0;
        console.log(rawData);
        
        if (rawData.productDetails) {
            let d = rawData.productDetails;
            console.log(124, d);
            
            let jk = (d.map(x => (Math.round(x.taxValue>0?(+x.price+((+x.price*x.taxValue)/100)):(+x.price))*x.quantity)));
            console.log(jk);
            
            j = jk.reduce((x, y) => (parseInt(x) + parseInt(y)));
        }


        let prDetails = [];
        let _tempData = rawData.productDetails;
        _tempData.forEach((i) => {
            let it = {
                product_code: i.productId,
                product_amount: (Math.round(i.taxValue>0?(+i.price+((+i.price*i.taxValue)/100)):(+i.price))*i.quantity)*100
            };

            prDetails.push(it);
        });
console.log(prDetails);
console.log(140, j);


        let _d = {
            "payment_info_data": {
                "amount": j*100,
                "currency_code": "INR",
                "order_desc": ""
            },


            "customer_data": {
                "country_code": "91",
                "mobile_number": rawData.phoneNumber,
                "email_id": rawData.emailId
            },
            "billing_address_data": {
                "first_name": rawData.paymentFirstName,
                "last_name": rawData.paymentLastName,
                "address1": rawData.paymentAddress_1,
                "address2": rawData.paymentAddress_2,
                "address3": "",
                "pin_code": rawData.paymentPostCode,
                "city": rawData.paymentCity,
                "state": rawData.paymentZone,
                "country": rawData.paymentCountryId
            },
            "shipping_address_data": {
                "first_name": rawData.shippingFirstName,
                "last_name": rawData.shippingLastName,
                "address1": rawData.shippingAddress_1,
                "address2": rawData.shippingAddress_2,
                "address3": "",
                "pin_code": rawData.shippingPostCode,
                "city": rawData.shippingCity,
                "state": rawData.shippingZone,
                "country": rawData.shippingCountryId
            },
            "product_info_data": {
                "product_details": prDetails
            },
            "additional_info_data": {
                "rfu1": "123"
            }
        };
        console.log("_d", _d);

        return Promise.resolve(_d);
    }


    public modelSaveCook = (rawData: any) => {
        let j = 0;
        if (rawData.productDetails) {
            let d = rawData.productDetails;
            let jk = (d.map(x => x.price));
            j = jk.reduce((x, y) => (parseInt(x) + parseInt(y)));
        }


        let prDetails = [];
        let _tempData = rawData.productDetails;
        _tempData.forEach((i) => {
            let it = {
                productCode: i.productId,
                productAmount: i.price
            };

            prDetails.push(it);
        });


        let _dataCooking = {
            amount: j,
            pineLabsFkOrder: prDetails,
            currencyCode: "INR",
            orderDesc: "",
            countryCode: rawData.paymentCountryId,
            mobileNumber: rawData.phoneNumber,
            emailId: rawData.emailId,

            billingFirstName: rawData.paymentFirstName,
            billingLastName: rawData.paymentLastName,
            billingAddress1: rawData.paymentAddress_1,
            billingAddress2: rawData.paymentAddress_2,
            billingAddress3: "",
            billingPinCode: rawData.paymentPostCode,
            billingCity: rawData.paymentCity,
            billingState: rawData.paymentZone,
            billingCountry: rawData.paymentCountryId,

            shippingFirstName: rawData.shippingFirstName,
            shippingLastName: rawData.shippingLastName,
            shippingAddress1: rawData.shippingAddress_1,
            shippingAddress2: rawData.shippingAddress_2,
            shippingAddress3: "",
            shippingPinCode: rawData.shippingPostCode,
            shippingCity: rawData.shippingCity,
            shippingState: rawData.shippingZone,
            shippingCountry: rawData.shippingCountryId,

            additionalInfoData: "123",

            tokenId: null,
            pluralOrderId: null,
            paymentStatus: null,
            createdDate: null,
            modifiedDate: null,
            createdBy: 1,
            //modifiedByOrder : null,
        };


        console.log("_dataCooking", _dataCooking);

        return Promise.resolve(_dataCooking);
    }

    

    public saveProcess = async (orderPrefixId,plural_id) => {
        
        const orderRepository = getManager().getRepository(Order);
        
        const pineOrderRepository = getManager().getRepository(PineOrder);
        const order = await orderRepository.findOne({where: {orderPrefixId}, select: ['orderId']});
        const orderId = order.orderId;
        const orderDetail = await orderRepository.findOne(orderId);
        const orderAmount = Math.round(orderDetail.total * 100);
        
            const pineParams = new PineOrder();
            pineParams.orderId = orderDetail.orderId;
            pineParams.pineRefId = plural_id;
            pineParams.total = orderAmount.toString();
            pineParams.status = 0;
            await pineOrderRepository.save(pineParams);
    
    }
}
