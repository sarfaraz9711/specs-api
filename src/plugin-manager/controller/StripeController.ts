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
import {Order} from '../../api/models/Order';
import {OrderProduct} from '../../api/models/OrderProduct';
import {Product} from '../../api/models/ProductModel';
import {StripeOrder} from '../models/StripeOrder';
import {StripeOrderTransaction} from '../models/StripeOrderTransaction';
import {ProductImage} from '../../api/models/ProductImage';
import {Settings} from '../../api/models/Setting';
import {Currency} from '../../api/models/Currency';
import {env} from '../../env';
import {Payment as Payments} from '../../api/models/Payment';
import {PaymentItems} from '../../api/models/PaymentItems';
import moment = require('moment');
export class StripeController {

    constructor() {
        // ---
    }

    public async index(req: express.Request | any, res: express.Response): Promise<any> {
        const pluginRepository = getManager().getRepository(Plugins);
        const pluginDetail = await pluginRepository.findOne({
            where : {
                pluginName: 'stripe',
            },
        });
        if (!pluginDetail) {
            req.flash('errors', ['You not install this plugin. or problem in installation']);
            return res.redirect('home');
        }
        const paypalAdditionalInfo = pluginDetail.pluginAdditionalInfo ? JSON.parse(pluginDetail.pluginAdditionalInfo) : {};
        res.render('pages/stripe/form', {
            title: 'Stripe',
            path: '../stripe/form',
            clientId: paypalAdditionalInfo.clientId ? paypalAdditionalInfo.clientId : '',
            clientSecret: paypalAdditionalInfo.clientSecret ? paypalAdditionalInfo.clientSecret : '',
            isTest: paypalAdditionalInfo.isTest,
        });
    }

    public async updateSettings(req: express.Request | any, res: express.Response): Promise<any> {
        req.assert('clientId', 'Client Id cannot be blank').notEmpty();
        req.assert('clientSecret', 'Client Secret cannot be blank').notEmpty();
        const errors = req.validationErrors();
        if (errors) {
            req.flash('errors', errors);
            return res.redirect('paypal');
        }

        const pluginRepository = getManager().getRepository(Plugins);
        const pluginDetail = await pluginRepository.findOne({
            where : {
                pluginName: 'stripe',
            },
        });
        if (!pluginDetail) {
            req.flash('errors', ['You not install this plugin. or problem in installation']);
            return res.redirect('home');
        }
        const paypalAdditionalInfo = pluginDetail.pluginAdditionalInfo ? JSON.parse(pluginDetail.pluginAdditionalInfo) : {};
        paypalAdditionalInfo.clientId = req.body.clientId;
        paypalAdditionalInfo.clientSecret = req.body.clientSecret;
        paypalAdditionalInfo.isTest = req.body.isTest;
        pluginDetail.pluginAdditionalInfo = JSON.stringify(paypalAdditionalInfo);
        const saveResponse = await pluginRepository.save(pluginDetail);
        if (saveResponse) {
            req.flash('success', ['Stripe settings updated successfully']);
            return res.redirect('home');
        }
        req.flash('errors', ['Unable to update the stripe settings']);
        return res.redirect('home');
    }

    public async process(req: express.Request | any, res: express.Response): Promise<any> {
        const orderPrefixId = req.params.orderPrefixId;
        const orderRepository = getManager().getRepository(Order);
        const orderProductRepository = getManager().getRepository(OrderProduct);
        const productRepository = getManager().getRepository(Product);
        const stripeOrderRepository = getManager().getRepository(StripeOrder);
        const order = await orderRepository.findOne({where: {orderPrefixId}, select: ['orderId']});
        const orderId = order.orderId;
        const orderDetail = await orderRepository.findOne(orderId);
        if (!orderDetail) {
            req.flash('errors', ['Invalid Order Id']);
            return res.redirect('error');
        }
       const pluginRepository = getManager().getRepository(Plugins);
        const pluginDetail = await pluginRepository.findOne({
            where : {
                pluginName: 'stripe',
            },
        });
        if (!pluginDetail) {
            req.flash('errors', ['You not install this plugin. or problem in installation']);
            return res.redirect('home');
        }
        const stripeAdditionalInfo = pluginDetail.pluginAdditionalInfo ? JSON.parse(pluginDetail.pluginAdditionalInfo) : {};

        const product = await orderProductRepository.find({where: {orderId: orderDetail.orderId}, select: ['orderProductId', 'orderId', 'productId', 'name', 'model', 'quantity', 'total', 'productPrice', 'discountedAmount', 'discountAmount']});

        const productVal = product.map(async (value: any) => {
            const productDetail = await productRepository.findOne({
                where: {productId: value.productId},
                select: ['name', 'quantity', 'minimumQuantity', 'image',
                    'imagePath', 'shipping', 'price', 'dateAvailable', 'amount', 'rating', 'discount', 'isActive']});
            const tempVal: any = value;
            tempVal.productDetail = productDetail;
            return tempVal;
        });
        const results = await Promise.all(productVal);
        const items = [];
        results.forEach((element) => {
            const price = (Math.round(element.total * 100) / +element.quantity);
            items.push({
                name: element.name,
                amount: price.toString(),
                currency: orderDetail.currencyCode,
                quantity: element.quantity,
            });
        });
        const orderAmount = Math.round(orderDetail.total * 100);
        const create_payment_json = {
            payment_method_types: ['card'],
            line_items: items,
            // ?session_id={CHECKOUT_SESSION_ID} means the redirect will have the session ID set as a query param
            success_url: env.baseUrl + stripeAdditionalInfo.successRoute + '?session_id={CHECKOUT_SESSION_ID}',
            cancel_url:  env.baseUrl  + stripeAdditionalInfo.cancelRoute,
        };
        const stripe = require('stripe')(stripeAdditionalInfo.clientSecret);
        const session = await stripe.checkout.sessions.create(create_payment_json);
        if (session) {
            const stripeParams = new StripeOrder();
            stripeParams.orderId = orderDetail.orderId;
            stripeParams.stripeRefId = session.id;
            stripeParams.total = orderAmount.toString();
            stripeParams.status = 0;
            await stripeOrderRepository.save(stripeParams);
            res.render('pages/stripe/process', {
                title: 'stripe',
                sessionId: session.id,
                publishKey: stripeAdditionalInfo.clientId,
                layout: 'pages/layouts/auth',
            });
        }
    }

    public async cancel(req: express.Request | any, res: express.Response): Promise<any> {
        res.render('pages/razorpay/cancel', {
            title: 'Razorpay',
            layout: 'pages/layouts/auth',
            storeUrl: env.cancelUrl,
        });
    }

    public async success(req: express.Request | any, res: express.Response): Promise<any> {
        const queryParams = req.query;
        const pluginRepository = getManager().getRepository(Plugins);
        const orderProductRepository = getManager().getRepository(OrderProduct);
        const productImageRepository = getManager().getRepository(ProductImage);
        const productRepository = getManager().getRepository(Product);
        const settingRepository = getManager().getRepository(Settings);
        const currencyRepository = getManager().getRepository(Currency);
        const stripeOrderRepository = getManager().getRepository(StripeOrder);
        const stripeOrderTransactionRepository = getManager().getRepository(StripeOrderTransaction);
        const paymentRepository = getManager().getRepository(Payments);
        const paymentItemsRepository = getManager().getRepository(PaymentItems);
        const pluginDetail = await pluginRepository.findOne({
            where : {
                pluginName: 'stripe',
            },
        });
        if (!pluginDetail) {
            req.flash('errors', ['You not install this plugin. or problem in installation']);
            return res.redirect('home');
        }
        const stripeAdditionalInfo = pluginDetail.pluginAdditionalInfo ? JSON.parse(pluginDetail.pluginAdditionalInfo) : {};
        const stripe = require('stripe')(stripeAdditionalInfo.clientSecret);
        const session = await stripe.checkout.sessions.retrieve(queryParams.session_id);
        if (session) {
            const paymentDetails = await stripe.paymentIntents.retrieve(session.payment_intent);
            const stripeDetail = await stripeOrderRepository.findOne({
                where : {
                    stripeRefId : queryParams.session_id,
                },
            });
            if (!stripeDetail) {
                req.flash('errors', ['Invalid Payment Details']);
                return res.redirect('error');
            }
            const orderRepository = getManager().getRepository(Order);
            const orderData: any = await orderRepository.findOne(stripeDetail.orderId);
            if (!orderData) {
                req.flash('errors', ['Invalid Order Id']);
                return res.redirect('error');
            }
            const setting = await settingRepository.findOne();
            const currencySymbol = await currencyRepository.findOne(setting.storeCurrencyId);
            orderData.currencyRight = currencySymbol.symbolRight;
            orderData.currencyLeft = currencySymbol.symbolLeft;
            const orderStatus = await orderRepository.findOne({where: {orderId: stripeDetail.orderId, paymentFlag: 1}});
            if (orderStatus) {
                req.flash('errors', ['Already Paid for this Order']);
                return res.redirect('error');
            }
            const intvalue = Math.round(paymentDetails.amount_received);
            if (paymentDetails.status === 'succeeded' && intvalue === +stripeDetail.total) {
                const transactionsParams = new StripeOrderTransaction();
                transactionsParams.paymentType = paymentDetails.method;
                transactionsParams.stripeOrderId = stripeDetail.id;
                transactionsParams.paymentData = JSON.stringify(paymentDetails);
                transactionsParams.paymentStatus = 1;
                await stripeOrderTransactionRepository.save(transactionsParams);
                stripeDetail.status = 1;
                await stripeOrderRepository.save(stripeDetail);
                orderData.paymentFlag = 1;
                orderData.paymentStatus = 1;
                orderData.paymentProcess = 1;
                orderData.paymentType = 'stripe';
                orderData.paymentDetails = paymentDetails.id;
                await orderRepository.save(orderData);
                const paymentParams = new Payments();
                paymentParams.orderId = stripeDetail.orderId;
                const date = new Date();
                paymentParams.paidDate = moment(date).format('YYYY-MM-DD HH:mm:ss');
                paymentParams.paymentNumber = paymentDetails.id;
                paymentParams.paymentAmount = orderData.total;
                paymentParams.paymentInformation = JSON.stringify(paymentDetails);
                const payments = await paymentRepository.save(paymentParams);
                const productDetailData = [];
                let i;
                const orderProduct = await orderProductRepository.find({where: {orderId: orderData.orderId}, select: ['orderProductId', 'orderId', 'productId', 'name', 'model', 'quantity', 'total', 'productPrice', 'discountedAmount', 'discountAmount', 'couponDiscountAmount', 'basePrice']});
                for (i = 0; i < orderProduct.length; i++) {
                const paymentItems = new PaymentItems();
                paymentItems.paymentId = payments.paymentId;
                paymentItems.orderProductId = orderProduct[i].orderProductId;
                paymentItems.totalAmount = orderProduct[i].total;
                paymentItems.productName = orderProduct[i].name;
                paymentItems.productQuantity = orderProduct[i].quantity;
                paymentItems.productPrice = orderProduct[i].productPrice;
                await paymentItemsRepository.save(paymentItems);
                const productInformation = await orderProductRepository.findOne({where: {orderProductId: orderProduct[i].orderProductId}, select: ['orderProductId', 'orderId', 'productId', 'name', 'model', 'quantity', 'total', 'productPrice', 'discountedAmount', 'discountAmount', 'basePrice', 'varientName', 'skuName', 'taxValue', 'taxType', 'productVarientOptionId', 'orderProductPrefixId', 'couponDiscountAmount', 'basePrice']});
                const productImageData: any = await productRepository.findOne(productInformation.productId);
                const productImageDetail = await productImageRepository.findOne({where: {productId: productInformation.productId}});
                productImageData.productInformationData = productInformation;
                productImageData.productImage = productImageDetail;
                productDetailData.push(productImageData);
                }

                res.render('pages/ingenico/success', {
                    title: 'Stripe',
                    storeUrl: env.storeUrl,
                    layout: 'pages/layouts/auth',
                });
            } else {
                const transactionsParams = new StripeOrderTransaction();
                transactionsParams.paymentType = 'FAILURE';
                transactionsParams.stripeOrderId = stripeDetail.id;
                transactionsParams.paymentData = JSON.stringify(paymentDetails);
                transactionsParams.paymentStatus = 2;
                await stripeOrderTransactionRepository.save(transactionsParams);
                stripeDetail.status = 2;
                await stripeOrderRepository.save(stripeDetail);
                orderData.paymentFlag = 2;
                orderData.paymentStatus = 2;
                await orderRepository.save(orderData);
                const statusJson ={
                    orderId:orderData.orderId,
                    updateOrderStatusId:11
                }
                const { OrderService : os } = require('../../api/services/OrderService');
                let _os = new os();
                await _os.updateOrderStatus(statusJson)
                res.render('pages/ingenico/failure', {
                    title: 'Stripe',
                    storeUrl: env.storeUrl,
                    layout: 'pages/layouts/auth',
                });
            }

        }
    }
}
