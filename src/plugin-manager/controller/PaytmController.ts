/*
* spurtcommerce
* http://www.spurtcommerce.com
*
* Copyright (c) 2022 Piccosoft Software Labs Pvt Ltd
* Author Piccosoft Software Labs Pvt Ltd <support@spurtcommerce.com>
* Licensed under the MIT license.
*/

import 'reflect-metadata';
import * as express from 'express';
import {getManager} from 'typeorm';
import {Plugins} from '../models/Plugin';
import { OrderProduct } from '../../api/models/OrderProduct';
import { Settings } from '../../api/models/Setting';
import { Currency } from '../../api/models/Currency';
import { PaytmOrder } from '../../api/models/Paytm/PaytmOrder';
import { PaytmTransaction } from '../../api/models/Paytm/PaytmTransaction';
import { Payment as Payments } from '../../api/models/Payment';
import { PaymentItems } from '../../api/models/PaymentItems';
import { Order } from '../../api/models/Order';
import moment from 'moment';
import { env } from '../../env';

import {Product} from '../../api/models/ProductModel';

 import {ProductImage} from '../../api/models/ProductImage';


// import {Currency} from '../../api/models/Currency';
// import {User} from '../../api/models/User';



export class PaytmController {

    constructor() {
        // ---
    }

    public async index(req: express.Request | any, res: express.Response): Promise<any> {
        const pluginRepository = getManager().getRepository(Plugins);
        const pluginDetail = await pluginRepository.findOne({
            where : {
                pluginName: 'paytm',
            },
        });
        if (!pluginDetail) {
            req.flash('errors', ['You not install this plugin. or problem in installation']);
            return res.redirect('home');
        }
        const paytmAdditionalInfo = pluginDetail.pluginAdditionalInfo ? JSON.parse(pluginDetail.pluginAdditionalInfo) : {};
        res.render('pages/paytm/form', {
            title: 'Paytm',
            path: '../paytm/form',
            mId: paytmAdditionalInfo.mId ? paytmAdditionalInfo.mId : '',
            merchantKey: paytmAdditionalInfo.merchantKey ? paytmAdditionalInfo.merchantKey : '',
            websiteName: paytmAdditionalInfo.websiteName ? paytmAdditionalInfo.websiteName : '',
            industryType: paytmAdditionalInfo.industryType ? paytmAdditionalInfo.industryType : '',
            channelId: paytmAdditionalInfo.channelId ? paytmAdditionalInfo.channelId : '',
            isTest: paytmAdditionalInfo.isTest,
        });
    }

    public async updateSettings(req: express.Request | any, res: express.Response): Promise<any> {
     
        req.assert('mId', 'MId cannot be blank').notEmpty();
        req.assert('merchantKey', 'Merchant key cannot be blank').notEmpty();
        
        const errors = req.validationErrors();
        if (errors) {
            req.flash('errors', errors);
            return res.redirect('paytm');
        }

        const pluginRepository = getManager().getRepository(Plugins);
        const pluginDetail = await pluginRepository.findOne({
            where : {
                pluginName: 'paytm',
            },
        });
        if (!pluginDetail) {
            req.flash('errors', ['You not install this plugin. or problem in installation']);
            return res.redirect('home');
        }


        const paypalAdditionalInfo = pluginDetail.pluginAdditionalInfo ? JSON.parse(pluginDetail.pluginAdditionalInfo) : {};
        paypalAdditionalInfo.mId = req.body.mId;
        paypalAdditionalInfo.merchantKey = req.body.merchantKey;
        paypalAdditionalInfo.websiteName = req.body.websiteName;
        paypalAdditionalInfo.industryType = req.body.industryType;
        paypalAdditionalInfo.channelId = req.body.channelId;
        paypalAdditionalInfo.isTest = req.body.isTest;
        pluginDetail.pluginAdditionalInfo = JSON.stringify(paypalAdditionalInfo);

        const saveResponse = await pluginRepository.save(pluginDetail);
        
        if (saveResponse) {
            req.flash('success', ['Paytm settings updated successfully']);
            return res.redirect('home');
        }
        req.flash('errors', ['Unable to update the Paytm settings']);
        return res.redirect('home');
    }


    public successFailure = async (req: express.Request | any, res: express.Response): Promise<any> => {
        //return res.status(200).send(req.body).end();
        try{

        //const pluginRepository = getManager().getRepository(Plugins);
        const orderProductRepository = getManager().getRepository(OrderProduct);
        const productImageRepository = getManager().getRepository(ProductImage);
        const productRepository = getManager().getRepository(Product);
        const settingRepository = getManager().getRepository(Settings);
        const currencyRepository = getManager().getRepository(Currency);
        //const userRepository = getManager().getRepository(User);

        const paytmOrderRepository = getManager().getRepository(PaytmOrder);
        const paytmOrderTransactionRepository = getManager().getRepository(PaytmTransaction);

        const paymentRepository = getManager().getRepository(Payments);
        const paymentItemsRepository = getManager().getRepository(PaymentItems);
        const PaytmChecksum = require('paytmchecksum');

        //const stripeAdditionalInfo = pluginDetail.pluginAdditionalInfo ? JSON.parse(pluginDetail.pluginAdditionalInfo) : {};

        let _j = {...req.body};
            const isVerifySignature = PaytmChecksum.verifySignature(req.body, process.env.PAYTM_MERCHANT_KEY, _j.CHECKSUMHASH)
            console.log("isVerifySignature",isVerifySignature)
        if (_j) {
            //const paymentDetails = await stripe.paymentIntents.retrieve(session.payment_intent);
            const paytmDetail = await paytmOrderRepository.findOne({
                where: {
                    paytmRefId: _j.ORDERID,
                },
            });
            try{
            paytmDetail.responsePayload = JSON.stringify(_j);
            }catch{
                console.log("catch")
            }
            const orderRepository = getManager().getRepository(Order);
            const orderData: any = await orderRepository.findOne(paytmDetail.orderId);
            // if (!orderData) {
            //     req.flash('errors', ['Invalid Order Id']);
            //     return res.redirect('error');
            // }
            const setting = await settingRepository.findOne();
            const currencySymbol = await currencyRepository.findOne(setting.storeCurrencyId);
            orderData.currencyRight = currencySymbol.symbolRight;
            orderData.currencyLeft = currencySymbol.symbolLeft;

            if (_j.STATUS === 'TXN_SUCCESS' && orderData.orderPrefixId === _j.ORDERID && isVerifySignature) {
                const transactionsParams = new PaytmTransaction();
                transactionsParams.paymentType = _j.PAYMENTMODE;
                transactionsParams.paytmOrderId = paytmDetail.id;
                transactionsParams.paymentData = JSON.stringify(_j);
                transactionsParams.paymentStatus = 1;
                await paytmOrderTransactionRepository.save(transactionsParams);
                paytmDetail.status = 1;
                paytmDetail.paytmRefId = _j.TXNID;
                await paytmOrderRepository.save(paytmDetail);
                // orderData.paymentFlag = 1;
                // orderData.paymentStatus = 1;
                // orderData.paymentProcess = 1;
                // orderData.ucOrderStatus = 'Pending';
                // orderData.paymentType = 'paytm';
                orderData.orderStatusId = 1;
                orderData.paymentDetails = _j.TXNID;
                await orderRepository.save(orderData);
                await getManager().query(`update order_product set order_status_id=1 where order_id=${paytmDetail.orderId}`)
                const paymentParams = new Payments();
                paymentParams.orderId = paytmDetail.orderId;
                const date = new Date();
                paymentParams.paidDate = moment(date).format('YYYY-MM-DD HH:mm:ss');
                paymentParams.paymentNumber = _j.TXNID;
                paymentParams.paymentAmount = _j.TXNAMOUNT;
                paymentParams.paymentInformation = JSON.stringify(_j);
                const payments = await paymentRepository.save(paymentParams);
                const productDetailData = [];
                let i;
                // let saleOrderItems = [];
                let saleOrderItemsForThankuPage = [];
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
                    const productName = orderProduct[i].name;
                    for(let i=0; i<quantity; i++){
                        // saleOrderItems.push({
                        //     "itemSku": env.uniComm.testMode == "ON" ? "10532336" : skuName,
                        //     "code": env.uniComm.testMode == "ON" ? "10532336" : skuName+"-"+i,
                        //     "shippingMethodCode": "STD",
                        //     "totalPrice": Math.round(productInformation.productPrice),
                        //     "sellingPrice": Math.round(productInformation.productPrice),
                        //     'discount':Math.round(+productInformation.discountAmount+(productInformation.discountAmount*productInformation.taxValue/100)),
                        //     // "sellingPrice": Math.round(+productInformation.basePrice+(productInformation.basePrice*productInformation.taxValue/100)),
                        //     'packetNumber':0,
                        //     'prepaidAmount':0,
                        //     'giftWrap':false
                        // });
                        saleOrderItemsForThankuPage.push({
                            "itemSku": env.uniComm.testMode == "ON" ? "10532336" : skuName,
                            "code": env.uniComm.testMode == "ON" ? "10532336" : skuName+"-"+i,
                            "shippingMethodCode": "STD",
                            "totalPrice": 0,
                            "sellingPrice": Math.round(+productInformation.basePrice+(productInformation.basePrice*productInformation.taxValue/100)),
                            'packetNumber':0,
                            'prepaidAmount':0,
                            'giftWrap':false,
                            'name': productName,
                            'skuName': skuName
                        });
                    }
                }



            /*********************************/
            // const { UnicommeService : dd } = require('../../api/services/admin/UnicomService');
            // let c = new dd();
           // const Json = {orderId:orderData.orderId, orderPrefixId:orderData.orderPrefixId, orderAmount:orderData.total}
           
            orderData.productDetail = saleOrderItemsForThankuPage;
            const Json = {orderData: orderData};
            const queryParam:any = Buffer.from(JSON.stringify(Json)).toString('base64')
            // await c.sendOrderToUC(orderData, saleOrderItems);
                res.render('pages/ingenico/success', {
                    title: 'Paytm',
                    storeUrl: `${env.thankuPageUrl}?queryData=${queryParam}`,
                    layout: 'pages/layouts/auth',
                });
            } else {
                const transactionsParams = new PaytmTransaction();
                const resultStatus:any=_j?.resultInfo?.resultStatus
                transactionsParams.paymentType = resultStatus;
                transactionsParams.paytmOrderId = paytmDetail.id;
                transactionsParams.paymentData = JSON.stringify(_j);
                transactionsParams.paymentStatus = resultStatus=='PENDING'?0:2;
                await paytmOrderTransactionRepository.save(transactionsParams);
                paytmDetail.status = resultStatus=='PENDING'?0:2;
                await paytmOrderRepository.save(paytmDetail);
                orderData.paymentFlag = 2;
                orderData.paymentStatus = resultStatus=='PENDING'?0:2;

                orderData.paymentProcess = 0;
                await orderRepository.save(orderData);


                // return res.status(404).send({
                //     status : "failed"
                // }).end();

                const statusJson ={
                    orderId:orderData.orderId,
                    updateOrderStatusId:resultStatus=='PENDING'?13:11
                }
                const { OrderService : os } = require('../../api/services/OrderService');
                let _os = new os();
                await _os.updateOrderStatus(statusJson)
                const { CreditNoteService : cn } = require('../../api/services/admin/CreditNoteService');
                const cnService = new cn();
                await cnService.markCnActiveByOrderId(orderData.orderId);
                await cnService.markCouponActiveByOrderId(orderData.orderId);
                res.render('pages/ingenico/failure', {
                    title: 'Paytm',
                    storeUrl: env.storeUrl,
                    layout: 'pages/layouts/auth',
                });
            }
            
        }else{
            const { CreditNoteService : cn } = require('../../api/services/admin/CreditNoteService');
            const cnService = new cn();
                await cnService.markCnActiveByOrderId(_j.ORDERID);
                await cnService.markCouponActiveByOrderId(_j.ORDERID);
            res.render('pages/ingenico/failure', {
                title: 'Paytm',
                storeUrl: env.storeUrl,
                layout: 'pages/layouts/auth',
            });
        }

    
    }catch{
        console.log("catch")
    }
}

}
