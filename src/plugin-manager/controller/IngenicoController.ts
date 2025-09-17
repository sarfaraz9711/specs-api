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
import { getManager } from 'typeorm';
import { Plugins } from '../models/Plugin';

import { OrderProduct } from '../../api/models/OrderProduct';
import { Product } from '../../api/models/ProductModel';

import { ProductImage } from '../../api/models/ProductImage';

// import {Currency} from '../../api/models/Currency';
// import {User} from '../../api/models/User';


import { Payment as Payments } from '../../api/models/Payment';
import { PaymentItems } from '../../api/models/PaymentItems';
import moment = require('moment');
import { env } from '../../env';
import { IngenicoTransactions } from '../../api/models/Ingenico/ingenicoTransactions';
import { Order } from '../../api/models/Order';
import { IngenicoOrderData } from '../../api/models/Ingenico/IngenicoOrderData';
//import { UnicommerceResponseModel } from '../../api/models/Unicommerce/UniCommerceModel';
export class IngenicoController {

    constructor(
        ) {

    }

    public async index(req: express.Request | any, res: express.Response): Promise<any> {
        const pluginRepository = getManager().getRepository(Plugins);
        const pluginDetail = await pluginRepository.findOne({
            where: {
                pluginName: 'ingenico',
            },
        });
        if (!pluginDetail) {
            req.flash('errors', ['You not install this plugin. or problem in installation']);
            return res.redirect('home');
        }
        const ingenicoAdditionalInfo = pluginDetail.pluginAdditionalInfo ? JSON.parse(pluginDetail.pluginAdditionalInfo) : {};
        res.render('pages/ingenico/form', {
            title: 'Ingenico',
            path: '../ingenico/form',
            merchantCode: ingenicoAdditionalInfo.merchantCode ? ingenicoAdditionalInfo.merchantCode : '',
            schemeCode: ingenicoAdditionalInfo.schemeCode ? ingenicoAdditionalInfo.schemeCode : '',
            encrypKey: ingenicoAdditionalInfo.encrypKey ? ingenicoAdditionalInfo.encrypKey : '',
            encrypIv: ingenicoAdditionalInfo.encrypIv ? ingenicoAdditionalInfo.encrypIv : '',
            userId: ingenicoAdditionalInfo.userId ? ingenicoAdditionalInfo.userId : '',
            password: ingenicoAdditionalInfo.password ? ingenicoAdditionalInfo.password : '',
            isTest: ingenicoAdditionalInfo.isTest,
        });
    }



    public async updateSettings(req: express.Request | any, res: express.Response): Promise<any> {

        req.assert('merchantCode', 'merchantCode cannot be blank').notEmpty();
        req.assert('schemeCode', 'schemeCode key cannot be blank').notEmpty();
        req.assert('encrypKey', 'encrypKey cannot be blank').notEmpty();
        req.assert('encrypIv', 'encrypIv key cannot be blank').notEmpty();
        req.assert('userId', 'userId cannot be blank').notEmpty();
        req.assert('password', 'password key cannot be blank').notEmpty();

        const errors = req.validationErrors();
        if (errors) {
            req.flash('errors', errors);
            return res.redirect('ingenico');
        }

        const pluginRepository = getManager().getRepository(Plugins);
        const pluginDetail = await pluginRepository.findOne({
            where: {
                pluginName: 'ingenico',
            },
        });
        if (!pluginDetail) {
            req.flash('errors', ['You not install this plugin. or problem in installation']);
            return res.redirect('home');
        }
        const paypalAdditionalInfo = pluginDetail.pluginAdditionalInfo ? JSON.parse(pluginDetail.pluginAdditionalInfo) : {};
        paypalAdditionalInfo.merchantCode = req.body.merchantCode;
        paypalAdditionalInfo.schemeCode = req.body.schemeCode;
        paypalAdditionalInfo.encrypKey = req.body.encrypKey;
        paypalAdditionalInfo.encrypIv = req.body.encrypIv;
        paypalAdditionalInfo.userId = req.body.userId;
        paypalAdditionalInfo.password = req.body.password;
        paypalAdditionalInfo.isTest = req.body.isTest;
        pluginDetail.pluginAdditionalInfo = JSON.stringify(paypalAdditionalInfo);
        const saveResponse = await pluginRepository.save(pluginDetail);
        if (saveResponse) {
            req.flash('success', ['Ingenico settings updated successfully']);
            return res.redirect('home');
        }
        req.flash('errors', ['Unable to update the Ingenico settings']);
        return res.redirect('home');
    }

    public successFailure = async (req: express.Request | any, res: express.Response): Promise<any> => {


        if (req && req.body && req.body.msg) {
            let ingenicoResponse:any = req.body.msg.split("|");
            const receivedMsg:any = req.body.msg
            const crypto = require('crypto')
            const reseivedHash:any=ingenicoResponse[15]
            const encryptionKey= process.env.INGENICO_ENCRYPT_KEY
            let updatedText = receivedMsg.replace(`|${reseivedHash}`, `|${encryptionKey}`);
            let generatedHash:any = crypto.createHash('sha256').update(updatedText).digest('hex');
            let txn_status = ingenicoResponse[0];
            let ingenicResponseData = new IngenicoTransactions();
            ingenicResponseData.txnStatus = ingenicoResponse[0];
            ingenicResponseData.txnMsg = ingenicoResponse[1];
            ingenicResponseData.txnErrMsg = ingenicoResponse[2];
            ingenicResponseData.clntTxnRef = ingenicoResponse[3];
            ingenicResponseData.tpslBankCd = ingenicoResponse[4];
            ingenicResponseData.tpslTxnId = ingenicoResponse[5];
            ingenicResponseData.txnAmt = ingenicoResponse[6];
            ingenicResponseData.clntRqstMeta = ingenicoResponse[7];
            ingenicResponseData.tpslTxnTime = ingenicoResponse[8];
            ingenicResponseData.balAmt = ingenicoResponse[9];
            ingenicResponseData.cardId = ingenicoResponse[10];
            ingenicResponseData.aliasName = ingenicoResponse[11];
            ingenicResponseData.BankTransactionID = ingenicoResponse[12];
            ingenicResponseData.manDateRegNo = ingenicoResponse[13];
            ingenicResponseData.token = ingenicoResponse[14];
            ingenicResponseData.hash = ingenicoResponse[15];
            const IngenicoTransactionsRepository = getManager().getRepository(IngenicoTransactions);
            const paymentRepository = getManager().getRepository(Payments);
            const orderProductRepository = getManager().getRepository(OrderProduct);
            const orderRepository = getManager().getRepository(Order);
            const paymentItemsRepository = getManager().getRepository(PaymentItems);
            const productRepository = getManager().getRepository(Product);
            const productImageRepository = getManager().getRepository(ProductImage);
           // const unicommerceResponseModel = getManager().getRepository(UnicommerceResponseModel);



            let ingenicoPayment = getManager().getRepository(IngenicoOrderData);
            
            let currentPay = await ingenicoPayment.findOne({
                where : {
                    payRef : ingenicoResponse[3]
                }
            });

            if(currentPay){
                ingenicResponseData.payOrderId = currentPay.id
            }
            currentPay.responsePayload = JSON.stringify(ingenicoResponse);
            if (txn_status === '0300' && generatedHash==reseivedHash) { //Success
                await IngenicoTransactionsRepository.save(ingenicResponseData);

                if(currentPay){
                    currentPay.payStatus = "1";
                    currentPay.tpslTxnId = ingenicResponseData.tpslTxnId
                    ingenicoPayment.save(currentPay);
                }
                


                const orderData:any = await orderRepository.findOne({
                    where: {
                        orderPrefixId: ingenicoResponse[3],
                    },
                });

                orderData.paymentFlag = 1;
                orderData.paymentStatus = 1;
                orderData.paymentProcess = 1;
                orderData.paymentType = 'ingenico';
                orderData.paymentDetails = ingenicResponseData.tpslTxnId;
                orderData.discountAmount = Number(orderData.discountAmount);
                
                await orderRepository.save(orderData);

                const paymentParams = new Payments();
                paymentParams.orderId = orderData.orderId;
                const date = new Date();
                paymentParams.paidDate = moment(date).format('YYYY-MM-DD HH:mm:ss');
                paymentParams.paymentNumber = ingenicResponseData.tpslTxnId;
                paymentParams.paymentAmount = Number(ingenicResponseData.txnAmt);
                paymentParams.paymentInformation = JSON.stringify(ingenicResponseData);
                const payments = await paymentRepository.save(paymentParams);


                




                const productDetailData = [];
                let i;
                let saleOrderItems = [];
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
                const { UnicommeService : dd } = require('../../api/services/admin/UnicomService');
                let c = new dd();
               // const Json = {orderId:orderData.orderId, orderPrefixId:orderData.orderPrefixId, orderAmount:orderData.total}
               orderData.productDetail = saleOrderItemsForThankuPage;
               const Json = {orderData: orderData};
            const queryParam:any = Buffer.from(JSON.stringify(Json)).toString('base64')
            
                await c.sendOrderToUC(orderData, saleOrderItems)
                
                res.render('pages/ingenico/success', {
                    title: 'Ingenico',
                    storeUrl: `${env.thankuPageUrl}?queryData=${queryParam}`,
                    layout: 'pages/layouts/auth',
                });
            } else { //Other Status
                await IngenicoTransactionsRepository.save(ingenicResponseData);
                if(currentPay){
                    currentPay.payStatus = "0";
                    currentPay.tpslTxnId = ingenicResponseData.tpslTxnId
                    await ingenicoPayment.save(currentPay);
                }

                const orderData:any = await orderRepository.findOne({
                    where: {
                        orderPrefixId: ingenicoResponse[3],
                    },
                });

                orderData.paymentFlag = 2;
                orderData.paymentStatus = txn_status=='0396'?0:2;
                orderData.paymentProcess = 0;
                orderData.paymentRemark=ingenicResponseData.txnErrMsg
                await orderRepository.save(orderData);

                const statusJson ={
                    orderId:currentPay.orderId,
                    updateOrderStatusId:txn_status=='0396'?13:11
                }
                const { OrderService : os } = require('../../api/services/OrderService');
                let _os = new os();
                await _os.updateOrderStatus(statusJson)
                const { CreditNoteService : cn } = require('../../api/services/admin/CreditNoteService');
                const cnService = new cn();
                await cnService.markCnActiveByOrderId(currentPay.orderId);
                await cnService.markCouponActiveByOrderId(currentPay.orderId);
                res.render('pages/ingenico/failure', {
                    title: 'Ingenico',
                    storeUrl: env.storeUrl,
                    layout: 'pages/layouts/auth',
                });
            }
        }
        

    }

}
