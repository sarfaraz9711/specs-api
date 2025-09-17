import 'reflect-metadata';
import {
    Post,
    JsonController,
    Res,
    Body,
    Req
} from 'routing-controllers';
import { CommonService } from "../../common/commonService";
import jsSHA from "jssha";
import { PinelabsService } from '../../services/payment/PinelabsService';
import { getManager } from 'typeorm';
//import { Plugins } from '../../plugin-manager/models/Plugin';
import { OrderProduct } from '../../models/OrderProduct';
import { ProductImage } from '../../models/ProductImage';
import { Product } from '../../models/ProductModel';
import { Settings } from '../../models/Setting';
import { Currency } from '../../models/Currency';
// import { User } from '../models/User';
import { Payment as Payments } from '../../models/Payment';
import { PaymentItems } from '../../models/PaymentItems';
import { Order } from '../../models/Order';
import moment from 'moment';
import { env } from '../../../env';



import { PineOrder } from '../../models/PineLabs/PineOrder';
import { PineLabsTransaction } from '../../models/PineLabs/PineLabsTransaction';
import { Plugins } from '../../../plugin-manager/models/Plugin';


@JsonController('/payment-pine')
export class PinelabsController {
    constructor(private _m: CommonService, private _pn: PinelabsService) { }

    // Create Payment data
    /**
     * @api {post} /api/payment-pine/secure/create-pay-request Create Payment Data API
     * @apiGroup Pine Labs Payment 
     * @apiParam (Request body) {String} shippingLastName shippingLastName
     * @apiParam (Request body) {Number} shippingCity shippingCity
     * @apiParam (Request body) {String} shippingPostCode shippingPostCode
     * @apiParam (Request body) {String} shippingCompany shippingCompany
     * @apiParam (Request body) {String} shippingFirstName shippingFirstName
     * @apiParam (Request body) {String} shippingZone shippingZone
     * @apiParam (Request body) {String} gstNo gstNo
     * @apiParam (Request body) {String} phoneNumber phoneNumber
     * @apiParam (Request body) {String} shippingAddressFormat shippingAddressFormat
     * @apiParam (Request body) {String} shippingAddress_1 shippingAddress_1
     * @apiParam (Request body) {String} shippingAddress_2 shippingAddress_2
     * @apiParam (Request body) {String} emailId emailId
     * @apiParam (Request body) {String} shippingCountryId shippingCountryId
     * @apiParam (Request body) {String} productDetails productDetails
     * @apiParam (Request body) {String} paymentMethod paymentMethod
     * @apiParam (Request body) {String} paymentAddress_1 paymentAddress_1
     * @apiParam (Request body) {String} paymentAddress_2 paymentAddress_2
     * @apiParam (Request body) {String} paymentCity paymentCity
     * @apiParam (Request body) {String} paymentCompany paymentCompany
     * @apiParam (Request body) {String} paymentCountryId paymentCountryId
     * @apiParam (Request body) {String} paymentFirstName paymentFirstName
     * @apiParam (Request body) {String} paymentLastName paymentLastName
     * @apiParam (Request body) {String} paymentPostCode paymentPostCode
     * @apiParam (Request body) {String} paymentZone paymentZone
     * @apiParam (Request body) {String} couponCode couponCode
     * @apiParam (Request body) {String} couponData couponData
     * @apiParam (Request body) {String} couponDiscountAmount couponDiscountAmount
     * @apiParam (Request body) {String} password password
     * @apiParamExample {json} Input
     * {
     *   "shippingLastName": "",
     *  "shippingCity": "",
     *  "shippingPostCode": "",
     *  "shippingCompany": "",
     *  "shippingFirstName": "",
     *  "shippingZone": "",
     *  "gstNo": "",
     *  "phoneNumber": "",
     *  "shippingAddressFormat": "",
     *  "shippingAddress_1": "",
     *  "shippingAddress_2": "",
     *  "emailId": "",
     *  "shippingCountryId": "",
     *  "productDetails": [
     *      {
     *      "productId": "",
     *      "quantity": "",
     *      "price": "",
     *      "basePrice": "",
     *      "model": "",
     *      "name": "",
     *      "productVarientOptionId": "",
     *      "taxType": null,
     *      "taxValue": null,
     *      "varientName": "",
     *      "skuName": "",
     *      "vendorId": 0
     *      }
     *  ],
     *  "paymentMethod": null,
     *  "paymentAddress_1": "",
     *  "paymentAddress_2": "",
     *  "paymentCity": "",
     *  "paymentCompany": "",
     *  "paymentCountryId": null,
     *  "paymentFirstName": "",
     *  "paymentLastName": "",
     *  "paymentPostCode": "",
     *  "paymentZone": "",
     *  "couponCode": "",
     *  "couponData": "",
     *  "couponDiscountAmount": "",
     *  "password": ""
     *  }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "payment created successfully",
     *      "status": "200"
     *      "data" : {}
     * }
     * @apiSampleRequest /api/payment-pine/secure/create-pay-request
     * @apiErrorExample {json} get payment error
     * HTTP/1.1 500 Internal Server Error, Or error code can be dynamic
     */
    @Post('/secure/create-pay-request')
    public async createPayment(@Body() mapData: any = {}, @Res() response: any): Promise<any> {

        let ls = await this._pn.getsavedPaymentMethod('PineLabsPluralSingleCart');

        if (Object.keys(ls).length > 0) {
            let jData = JSON.parse(ls.pluginAdditionalInfo);
            let merchantData = {
                "merchant_id": jData.mId,
                "merchant_access_code": jData.merchantPassword,
                //"merchant_return_url": "http://10.200.146.139:9020/chargingrespnew.aspx",
                "merchant_return_url": "http://localhost:9000/PineLabsPluralSingleCart/pl-success",
                "merchant_order_id": "API-DEMO-DOC-" + await this.makeid(6)
            };
            let secureSeret = jData.clientSecret;

            let _cookedData = await this._PineLabsRequest(mapData);

            let saveInModel: any = {};
            saveInModel = await this.modelSaveCook(mapData);

            let collectionMap = Object.assign({}, { merchant_data: merchantData }, _cookedData);


            let r = Buffer.from(JSON.stringify(collectionMap)).toString('base64');
            let v = this;
            let _token = await this.getEncryptedData(r, secureSeret);
            let d = await v.doPostRequest(r, _token);
            if (d) {
                saveInModel.tokenId = d.token;
                saveInModel.pluralOrderId = d.plural_order_id;
                await this._pn.saveOrderDetails(saveInModel);
            }
            return response.status(200).send(await this._m.getMessage(200, d, "")).end();
        } else {
            return response.status(400).send(await this._m.getMessage(401)).end();
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
        var options = { request: _r };

        let res = await axios.post(process.env.PINELABS_API_URL+'/api/v1/order/create', options, {
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
        if (rawData.productDetails) {
            let d = rawData.productDetails;
            let jk = (d.map(x => x.price));
            j = jk.reduce((x, y) => (parseInt(x) + parseInt(y)));
        }


        let prDetails = [];
        let _tempData = rawData.productDetails;
        _tempData.forEach((i) => {
            let it = {
                product_code: i.productId,
                product_amount: parseInt(i.price)
            };

            prDetails.push(it);
        });


        let _d = {
            "payment_info_data": {

                "amount": typeof (j) == "string" ? parseInt(j) : j,

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



        return Promise.resolve(_dataCooking);
    }

    // Create Payment data
    /**
     * @api {post} /api/payment-pine/secure/modify-payment Payment Data API
     * @apiGroup Pine Labs Payment 
     * @apiParam (Request body) {String} payment_id payment_id
     * @apiParam (Request body) {Number} plural_order_id plural_order_id
     * @apiParamExample {json} Input
     * {
     *   "payment_id": "",
     *  "plural_order_id": ""
     *  }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "payment created successfully",
     *      "status": "200"
     *      "data" : {}
     * }
     * @apiSampleRequest /api/payment-pine/secure/modify-payment Payment
     * @apiErrorExample {json} get payment error
     * HTTP/1.1 500 Internal Server Error, Or error code can be dynamic
     */
    @Post('/secure/modify-payment')
    public async updatePayment(@Body() orderDetails: any = {}, @Res() res: any, @Req() req: any): Promise<any> {

        //const pluginRepository = getManager().getRepository(Plugins);
        const orderProductRepository = getManager().getRepository(OrderProduct);
        const productImageRepository = getManager().getRepository(ProductImage);
        const productRepository = getManager().getRepository(Product);
        const settingRepository = getManager().getRepository(Settings);
        const currencyRepository = getManager().getRepository(Currency);
        //const userRepository = getManager().getRepository(User);

        const pineOrderRepository = getManager().getRepository(PineOrder);
        const pineOrderTransactionRepository = getManager().getRepository(PineLabsTransaction);

        const paymentRepository = getManager().getRepository(Payments);
        const paymentItemsRepository = getManager().getRepository(PaymentItems);


        //const stripeAdditionalInfo = pluginDetail.pluginAdditionalInfo ? JSON.parse(pluginDetail.pluginAdditionalInfo) : {};


        if (orderDetails.payment_id && orderDetails.plural_order_id) {


            let _j = await this.doGetRequest(orderDetails.payment_id, orderDetails.plural_order_id);

            //const stripe = require('stripe')(stripeAdditionalInfo.clientSecret);
            //const session = await stripe.checkout.sessions.retrieve(queryParams.session_id);





            if (_j && Object.keys(_j).length > 0) {
                //const paymentDetails = await stripe.paymentIntents.retrieve(session.payment_intent);
                const pineDetail = await pineOrderRepository.findOne({
                    where: {
                        pineRefId: orderDetails.plural_order_id,
                    },
                });
                // if (!pineDetail) {
                //     req.flash('errors', ['Invalid Payment Details']);
                //     return res.redirect('error');
                // }
                const orderRepository = getManager().getRepository(Order);
                const orderData: any = await orderRepository.findOne(pineDetail.orderId);
                // if (!orderData) {
                //     req.flash('errors', ['Invalid Order Id']);
                //     return res.redirect('error');
                // }
                const setting = await settingRepository.findOne();
                const currencySymbol = await currencyRepository.findOne(setting.storeCurrencyId);
                orderData.currencyRight = currencySymbol.symbolRight;
                orderData.currencyLeft = currencySymbol.symbolLeft;
                //const orderStatus = await orderRepository.findOne({where: {orderId: pineDetail.orderId, paymentFlag: 1}});
                // if (orderStatus) {
                //     req.flash('errors', ['Already Paid for this Order']);
                //     return res.redirect('error');
                // }
                //const intvalue = Math.round(_j.order_data.amount);



                // if (_j.payment_info_data.payment_status === 'CAPTURED' && _j.merchant_data.order_id === pineDetail.pineRefId) {

                if (_j.payment_info_data.payment_status === 'CAPTURED' && orderData.orderPrefixId === _j.merchant_data.order_id) {
                    const transactionsParams = new PineLabsTransaction();
                    transactionsParams.paymentType = _j.payment_info_data.payment_mode;
                    transactionsParams.pineOrderId = pineDetail.id;
                    transactionsParams.paymentData = JSON.stringify(_j);
                    transactionsParams.paymentStatus = 1;
                    await pineOrderTransactionRepository.save(transactionsParams);
                    pineDetail.status = 1;
                    await pineOrderRepository.save(pineDetail);
                    orderData.paymentFlag = 1;
                    orderData.paymentStatus = 1;
                    orderData.paymentProcess = 1;
                    orderData.paymentType = 'PineLabsPluralSingleCart';
                    orderData.paymentDetails = _j.payment_info_data.payment_id;
                    orderData.discountAmount = Number(orderData.discountAmount);
                    await orderRepository.save(orderData);
                    const paymentParams = new Payments();
                    paymentParams.orderId = pineDetail.orderId;
                    const date = new Date();
                    paymentParams.paidDate = moment(date).format('YYYY-MM-DD HH:mm:ss');
                    paymentParams.paymentNumber = _j.payment_info_data.payment_id;
                    paymentParams.paymentAmount = orderData.total;
                    paymentParams.paymentInformation = JSON.stringify(_j);
                    const payments = await paymentRepository.save(paymentParams);
                    const productDetailData = [];
                    let i;
                    let saleOrderItems = [];
                    const orderProduct = await orderProductRepository.find({ where: { orderId: orderData.orderId }, select: ['orderProductId', 'orderId', 'productId', 'name', 'model', 'quantity', 'total', 'productPrice', 'discountedAmount', 'discountAmount', 'couponDiscountAmount', 'basePrice', 'skuName'] });
                    for (i = 0; i < orderProduct.length; i++) {
                        const paymentItems = new PaymentItems();
                        paymentItems.paymentId = payments.paymentId;
                        paymentItems.orderProductId = orderProduct[i].orderProductId;
                        paymentItems.totalAmount = orderProduct[i].total;
                        paymentItems.productName = orderProduct[i].name;
                        paymentItems.productQuantity = orderProduct[i].quantity;
                        paymentItems.productPrice = orderProduct[i].productPrice;
                        await paymentItemsRepository.save(paymentItems);
                        const productInformation = await orderProductRepository.findOne({ where: { orderProductId: orderProduct[i].orderProductId }, select: ['orderProductId', 'orderId', 'productId', 'name', 'model', 'quantity', 'total', 'productPrice', 'discountedAmount', 'discountAmount', 'basePrice', 'varientName', 'skuName', 'taxValue', 'taxType', 'productVarientOptionId', 'orderProductPrefixId', 'couponDiscountAmount', 'basePrice'] });
                        const productImageData: any = await productRepository.findOne(productInformation.productId);
                        const productImageDetail = await productImageRepository.findOne({ where: { productId: productInformation.productId } });
                        productImageData.productInformationData = productInformation;
                        productImageData.productImage = productImageDetail;
                        productDetailData.push(productImageData);
                        const quantity = +orderProduct[i].quantity
                        const skuName = orderProduct[i].skuName
                        for(let i=0; i<quantity; i++){
                            saleOrderItems.push({
                                "itemSku": env.uniComm.testMode == "ON" ? "10532336" : skuName,
                                "code": env.uniComm.testMode == "ON" ? "10532336" : skuName+"-"+i,
                                "shippingMethodCode": "STD",
                                "totalPrice": Math.round(productInformation.productPrice),
                                "sellingPrice": Math.round(productInformation.productPrice),
                                'discount':Math.round(+productInformation.discountAmount+(productInformation.discountAmount*productInformation.taxValue/100)),
                                // "sellingPrice": Math.round(+productInformation.basePrice+(productInformation.basePrice*productInformation.taxValue/100)),
                                'packetNumber':0,
                                'prepaidAmount':0,
                                'giftWrap':false
                            });
                        }
                    }

                    const { UnicommeService: dd } = require('../../services/admin/UnicomService');
                    let c = new dd();
                    await c.sendOrderToUC(orderData, saleOrderItems);

                    return res.status(200).send(await this._m.getMessage(405)).end();
                } else {
                    const transactionsParams = new PineLabsTransaction();
                    transactionsParams.paymentType = 'FAILURE';
                    transactionsParams.pineOrderId = pineDetail.id;
                    transactionsParams.paymentData = JSON.stringify(_j);
                    transactionsParams.paymentStatus = 2;
                    orderData.orderStatusId = 11;
                    await pineOrderTransactionRepository.save(transactionsParams);
                    pineDetail.status = 2;
                    await pineOrderRepository.save(pineDetail);
                    orderData.paymentFlag = 2;
                    orderData.paymentStatus = 2;
                    await orderRepository.save(orderData);


                    return res.status(200).send(await this._m.getMessage(406)).end();
                }
                // res.render('pages/stripe/success', {
                //     title: 'Stripe',
                //     storeUrl: env.storeUrl,
                //     layout: 'pages/layouts/auth',
                // });
            }

        } else {
            const pineDetail = await pineOrderRepository.findOne({
                where: {
                    pineRefId: orderDetails.plural_order_id,
                },
            });

            const orderRepository = getManager().getRepository(Order);
            const orderData: any = await orderRepository.findOne(pineDetail.orderId);

            const transactionsParams = new PineLabsTransaction();
            transactionsParams.paymentType = 'FAILURE';
            transactionsParams.pineOrderId = pineDetail.id;
            transactionsParams.paymentData = null;
            transactionsParams.paymentStatus = 2;
            await pineOrderTransactionRepository.save(transactionsParams);
            pineDetail.status = 2;
            await pineOrderRepository.save(pineDetail);
            orderData.paymentFlag = 2;
            orderData.paymentStatus = 2;
            orderData.orderStatusId = 11;
            await orderRepository.save(orderData);

            const statusJson ={
                orderId:orderData.orderId,
                updateOrderStatusId:11
            }
            const { OrderService : os } = require('../../services/OrderService');
            let _os = new os();
            await _os.updateOrderStatus(statusJson)
            
            return res.status(200).send(await this._m.getMessage(406)).end();
        }

    }


    public doGetRequest = async (paymentId:any, pluralId:any) => {
        const axios = require('axios');
        let ls = await getManager().getRepository(Plugins).findOne({
            where : {
                pluginName : 'PineLabsPluralSingleCart'
            }
        })
        
        let pluginData = JSON.parse(ls.pluginAdditionalInfo);
        //let loginCredentials = "Basic "+Buffer.from(env.payment.PINELABS_PAYMENT_EMAIL+":"+pluginData.clientSecret).toString('base64')
        let loginCredentials = "Basic "+Buffer.from(pluginData.mId+":"+pluginData.merchantPassword).toString('base64')
        try{
            let res = await axios.get(process.env.PINELABS_API_URL+'/api/v1/inquiry/order/' + pluralId + '/payment/' + paymentId,{headers: {
                authorization: loginCredentials
        }});
            return Promise.resolve(res.data);
        }catch(e){
            
            return Promise.resolve({});
        }
       
    }

}
