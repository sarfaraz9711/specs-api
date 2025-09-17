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
import { Order } from '../../api/models/Order';
import { Plugins } from '../models/Plugin';
import { RazorpayOrder } from '../models/RazorpayOrder';
import { RazorpayOrderTransaction } from '../models/RazorpayOrderTransaction';
import { OrderProduct } from '../../api/models/OrderProduct';
import { Product } from '../../api/models/ProductModel';
import { ProductImage } from '../../api/models/ProductImage';
import { Settings } from '../../api/models/Setting';
import { Currency } from '../../api/models/Currency';
import { env } from '../../env';
import { Payment as Payments } from '../../api/models/Payment';
import { PaymentItems } from '../../api/models/PaymentItems';
import moment = require('moment');
import { ProductVarientOptionImage } from '../../api/models/ProductVarientOptionImage';

export class RazorPayController {

    public static async razorPaySuccess(instance: any, paymentId: any): Promise<any> {
        return new Promise((resolve, reject) => {
            instance.payments.fetch(paymentId).then((response) => {
                return resolve(response);
            }).catch((error) => {
                return reject(error);
            });
        });
    }

    constructor() {
        // ---
    }

    public async index(req: express.Request | any, res: express.Response): Promise<any> {
        const pluginRepository = getManager().getRepository(Plugins);
        const pluginDetail = await pluginRepository.findOne({
            where: {
                pluginName: 'razorpay',
            },
        });
        if (!pluginDetail) {
            req.flash('errors', ['You not install this plugin. or problem in installation']);
            return res.redirect('home');
        }
        const paypalAdditionalInfo = pluginDetail.pluginAdditionalInfo ? JSON.parse(pluginDetail.pluginAdditionalInfo) : {};
        res.render('pages/razorpay/form', {
            title: 'Razorpay',
            path: '../razorpay/form',
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
            where: {
                pluginName: 'razorpay',
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
            req.flash('success', ['Razorpay settings updated successfully']);
            return res.redirect('home');
        }
        req.flash('errors', ['Unable to update the razorpay settings']);
        return res.redirect('home');
    }

    public async process(req: express.Request | any, res: express.Response): Promise<any> {
        const orderPrefixId = req.params.orderPrefixId;
        const orderRepository = getManager().getRepository(Order);
        const razorpayOrderRepository = getManager().getRepository(RazorpayOrder);
        const order = await orderRepository.findOne({ where: { orderPrefixId }, select: ['orderId'] });
        const orderId = order.orderId;
        const orderDetail = await orderRepository.findOne(orderId);
        if (!orderDetail) {
            req.flash('errors', ['Invalid Order Id']);
            return res.redirect('error');
        }
        const pluginRepository = getManager().getRepository(Plugins);
        const pluginDetail = await pluginRepository.findOne({
            where: {
                pluginName: 'razorpay',
            },
        });
        if (!pluginDetail) {
            req.flash('errors', ['You not install this plugin. or problem in installation']);
            return res.redirect('home');
        }
        const paypalAdditionalInfo = pluginDetail.pluginAdditionalInfo ? JSON.parse(pluginDetail.pluginAdditionalInfo) : {};
        const razorPay = require('razorpay');
        const instance = new razorPay({
            key_id: paypalAdditionalInfo.clientId,
            key_secret: paypalAdditionalInfo.clientSecret,
        });
        const total = orderDetail.total;
        const params: any = {
            amount: +total * 100,
            receipt: orderDetail.orderPrefixId,
            currency: 'INR',
            payment_capture: true,
        };

        instance.orders.create(params).then((response: any) => {
            // ---
            const paypalParams = new RazorpayOrder();
            paypalParams.orderId = orderDetail.orderId;
            paypalParams.razorpayRefId = response.id;
            paypalParams.total = total.toString();
            paypalParams.status = 0;
            razorpayOrderRepository.save(paypalParams).then((val) => {
                // ---
                res.render('pages/razorpay/process', {
                    title: 'Razorpay',
                    orderRefId: response.id,
                    key: paypalAdditionalInfo.clientId,
                    amount: total,
                    orderId: orderDetail.orderPrefixId,
                    orderIncrementId: orderDetail.orderId,
                    description: val.id,
                    username: orderDetail.paymentFirstname + ' ' + orderDetail.paymentLastname,
                    email: orderDetail.email,
                    contact: orderDetail.telephone,
                    layout: 'pages/layouts/auth',
                });
            }).catch((err) => {
                throw err;
            });
        }).catch((error) => {
            // ---
            throw error;
        });
    }

    public async success(req: express.Request | any, res: express.Response): Promise<any> {
        const pluginRepository = getManager().getRepository(Plugins);
        const orderProductRepository = getManager().getRepository(OrderProduct);
        const productImageRepository = getManager().getRepository(ProductImage);
        const productRepository = getManager().getRepository(Product);
        const settingRepository = getManager().getRepository(Settings);
        const currencyRepository = getManager().getRepository(Currency);
        const razorpayOrderRepository = getManager().getRepository(RazorpayOrder);
        const razorpayOrderTransactionRepository = getManager().getRepository(RazorpayOrderTransaction);
        const paymentRepository = getManager().getRepository(Payments);
        const paymentItemsRepository = getManager().getRepository(PaymentItems);
        const productVarientOptionImageRepository = getManager().getRepository(ProductVarientOptionImage);
        const queryParams = req.query;
        const pluginDetail = await pluginRepository.findOne({
            where: {
                pluginName: 'razorpay',
            },
        });
        if (!pluginDetail) {
            req.flash('errors', ['You not install this plugin. or problem in installation']);
            return res.redirect('home');
        }
        const paypalAdditionalInfo = pluginDetail.pluginAdditionalInfo ? JSON.parse(pluginDetail.pluginAdditionalInfo) : {};
        const razorPay = require('razorpay');
        const instance = new razorPay({
            key_id: paypalAdditionalInfo.clientId,
            key_secret: paypalAdditionalInfo.clientSecret,
        });
        const paymentDetails = await RazorPayController.razorPaySuccess(instance, queryParams.razorpay_payment_id);
        const razorpayDetail = await razorpayOrderRepository.findOne({
            where: {
                razorpayRefId: paymentDetails.order_id,
            },
        });
        if (!razorpayDetail) {
            req.flash('errors', ['Invalid Payment Details']);
            return res.redirect('error');
        }

        const orderRepository = getManager().getRepository(Order);
        const orderData: any = await orderRepository.findOne(razorpayDetail.orderId);
        if (!orderData) {
            req.flash('errors', ['Invalid Order Id']);
            return res.redirect('error');
        }
        const setting = await settingRepository.findOne();
        const currencySymbol = await currencyRepository.findOne(setting.storeCurrencyId);
        orderData.currencyRight = currencySymbol.symbolRight;
        orderData.currencyLeft = currencySymbol.symbolLeft;

        const orderStatus = await orderRepository.findOne({ where: { orderId: razorpayDetail.orderId, paymentFlag: 1 } });
        if (orderStatus) {
            req.flash('errors', ['Already Paid for this Order']);
            return res.redirect('error');
        }

        const intvalue = Math.round(paymentDetails.amount);
        const intVal = intvalue / 100;
        if (paymentDetails.status === 'captured' && intVal === +razorpayDetail.total) {
            const transactionsParams = new RazorpayOrderTransaction();
            transactionsParams.paymentType = paymentDetails.method;
            transactionsParams.razorpayOrderId = razorpayDetail.id;
            transactionsParams.paymentData = JSON.stringify(paymentDetails);
            transactionsParams.paymentStatus = 1;
            await razorpayOrderTransactionRepository.save(transactionsParams);
            razorpayDetail.status = 1;
            await razorpayOrderRepository.save(razorpayDetail);
            orderData.paymentFlag = 1;
            orderData.paymentStatus = 1;
            orderData.paymentProcess = 1;
            orderData.paymentType = 'razorpay';
            orderData.paymentDetails = paymentDetails.id;
            await orderRepository.save(orderData);
            const paymentParams = new Payments();
            paymentParams.orderId = razorpayDetail.orderId;
            const date = new Date();
            paymentParams.paidDate = moment(date).format('YYYY-MM-DD HH:mm:ss');
            paymentParams.paymentNumber = paymentDetails.id;
            paymentParams.paymentAmount = orderData.total;
            paymentParams.paymentInformation = JSON.stringify(paymentDetails);
            const payments = await paymentRepository.save(paymentParams);
            const productDetailData = [];
            let i;
            const orderProduct = await orderProductRepository.find({ where: { orderId: orderData.orderId }, select: ['orderProductId', 'orderId', 'productId', 'name', 'model', 'quantity', 'total', 'productPrice', 'discountAmount', 'discountedAmount'] });
            for (i = 0; i < orderProduct.length; i++) {
                const paymentItems = new PaymentItems();
                paymentItems.paymentId = payments.paymentId;
                paymentItems.orderProductId = orderProduct[i].orderProductId;
                paymentItems.totalAmount = orderProduct[i].total;
                paymentItems.productName = orderProduct[i].name;
                paymentItems.productQuantity = orderProduct[i].quantity;
                paymentItems.productPrice = orderProduct[i].productPrice;
                await paymentItemsRepository.save(paymentItems);
                const productInformation = await orderProductRepository.findOne({ where: { orderProductId: orderProduct[i].orderProductId }, select: ['orderProductId', 'orderId', 'productId', 'name', 'model', 'quantity', 'total', 'productPrice', 'discountedAmount', 'discountAmount', 'couponDiscountAmount', 'basePrice', 'varientName', 'skuName', 'taxValue', 'taxType', 'productVarientOptionId', 'orderProductPrefixId'] });
                const productImageData: any = await productRepository.findOne(productInformation.productId);
                let productImageDetail;
                if (productInformation.productVarientOptionId) {
                    const image = await productVarientOptionImageRepository.findOne({ where: { productVarientOptionId: productInformation.productVarientOptionId } });
                    if (image) {
                        productImageDetail = image;
                    } else {
                        productImageDetail = await productImageRepository.findOne({ where: { productId: productInformation.productId, defaultImage: 1 } });
                    }
                } else {
                    productImageDetail = await productImageRepository.findOne({ where: { productId: productInformation.productId, defaultImage: 1 } });
                }
                productImageData.productInformationData = productInformation;
                productImageData.productImage = productImageDetail;
                productDetailData.push(productImageData);
            }
        } else {
            const transactionsParams = new RazorpayOrderTransaction();
            transactionsParams.paymentType = 'FAILURE';
            transactionsParams.razorpayOrderId = razorpayDetail.id;
            transactionsParams.paymentData = JSON.stringify(paymentDetails);
            transactionsParams.paymentStatus = 2;
            await razorpayOrderTransactionRepository.save(transactionsParams);
            razorpayDetail.status = 2;
            await razorpayOrderRepository.save(razorpayDetail);
            orderData.paymentFlag = 2;
            orderData.paymentStatus = 2;
            await orderRepository.save(orderData);
        }
        res.render('pages/paypal/success', {
            title: 'Paypal',
            storeUrl: env.storeUrl,
            layout: 'pages/layouts/auth',
        });
    }

    public async cancel(req: express.Request | any, res: express.Response): Promise<any> {
        res.render('pages/razorpay/cancel', {
            title: 'Razorpay',
            layout: 'pages/layouts/auth',
            storeUrl: env.cancelUrl,
        });
    }

    public async proceed(req: express.Request | any, res: express.Response): Promise<any> {
        const orderId = req.params.orderId;
        const orderRepository = getManager().getRepository(Order);
        const razorpayOrderRepository = getManager().getRepository(RazorpayOrder);
        const orderDetail = await orderRepository.findOne(orderId);
        if (!orderDetail) {
            req.flash('errors', ['Invalid Order Id']);
            return res.redirect('error');
        }

        const pluginRepository = getManager().getRepository(Plugins);
        const pluginDetail = await pluginRepository.findOne({
            where: {
                pluginName: 'razorpay',
            },
        });
        if (!pluginDetail) {
            req.flash('errors', ['You not install this plugin. or problem in installation']);
            return res.redirect('home');
        }
        const paypalAdditionalInfo = pluginDetail.pluginAdditionalInfo ? JSON.parse(pluginDetail.pluginAdditionalInfo) : {};
        const razorPay = require('razorpay');
        const instance = new razorPay({
            key_id: paypalAdditionalInfo.clientId,
            key_secret: paypalAdditionalInfo.clientSecret,
        });
        const params: any = {
            amount: +orderDetail.total,
            receipt: orderDetail.orderPrefixId,
            currency: 'INR',
            payment_capture: true,
        };

        instance.orders.create(params).then((response: any) => {
            // ---
            const paypalParams = new RazorpayOrder();
            paypalParams.orderId = orderDetail.orderId;
            paypalParams.razorpayRefId = response.id;
            paypalParams.total = params.amount.toString();
            paypalParams.status = 0;
            razorpayOrderRepository.save(paypalParams).then((val) => {
                // ---
                res.render('pages/razorpay/proceed', {
                    title: 'Razorpay',
                    orderRefId: response.id,
                    key: paypalAdditionalInfo.clientId,
                    amount: orderDetail.total,
                    orderId: orderDetail.orderPrefixId,
                    orderIncrementId: orderDetail.orderId,
                    description: val.id,
                    username: orderDetail.paymentFirstname + ' ' + orderDetail.paymentLastname,
                    email: orderDetail.email,
                    contact: orderDetail.telephone,
                    layout: 'pages/layouts/auth',
                });
            }).catch((err) => {
                throw err;
            });
        }).catch((error) => {
            // ---
            throw error;
        });
    }

    public async processAPI(req: express.Request | any, res: express.Response): Promise<any> {
        const orderId = req.params.orderPrefixId;
        const orderRepository = getManager().getRepository(Order);
        const razorpayOrderRepository = getManager().getRepository(RazorpayOrder);
        const orderDetail = await orderRepository.findOne({ where: { orderPrefixId: orderId } });
        if (!orderDetail) {
            return res.status(400).send({
                status: 0,
                message: 'Invalid Order Id',
            });
        }

        const pluginRepository = getManager().getRepository(Plugins);
        const pluginDetail = await pluginRepository.findOne({
            where: {
                pluginName: 'razorpay',
            },
        });
        if (!pluginDetail) {
            return res.status(400).send({
                status: 0,
                message: 'You not install this plugin. or problem in installation',
            });
        }
        const paypalAdditionalInfo = pluginDetail.pluginAdditionalInfo ? JSON.parse(pluginDetail.pluginAdditionalInfo) : {};
        const razorPay = require('razorpay');
        const instance = new razorPay({
            key_id: paypalAdditionalInfo.clientId,
            key_secret: paypalAdditionalInfo.clientSecret,
        });
        const params: any = {
            amount: +orderDetail.total * 100,
            receipt: orderDetail.orderPrefixId,
            currency: 'INR',
            payment_capture: true,
        };

        instance.orders.create(params).then((response: any) => {
            // ---
            const paypalParams = new RazorpayOrder();
            paypalParams.orderId = orderDetail.orderId;
            paypalParams.razorpayRefId = response.id;
            paypalParams.total = params.amount.toString();
            paypalParams.status = 0;
            razorpayOrderRepository.save(paypalParams).then((val) => {
                // ---
                const successResponse: any = {
                    status: 1,
                    message: 'payment made successful',
                    data: {
                        title: 'Razorpay',
                        orderRefId: response.id,
                        key: paypalAdditionalInfo.clientId,
                        amount: +orderDetail.total * 100,
                        orderId: orderDetail.orderPrefixId,
                        orderIncrementId: orderDetail.orderId,
                        description: val.id,
                        username: orderDetail.paymentFirstname + ' ' + orderDetail.paymentLastname,
                        email: orderDetail.email,
                        contact: orderDetail.telephone,
                        successURL: env.baseUrl + paypalAdditionalInfo.successAPIRoute,
                        cancelURL: env.baseUrl + paypalAdditionalInfo.cancelAPIRoute,
                        failureURL: env.baseUrl + paypalAdditionalInfo.failureAPIRoute,
                        layout: 'pages/layouts/auth',
                    },
                };
                return res.status(200).send(successResponse);
            }).catch((err) => {
                return res.status(400).send({
                    status: 0,
                    message: 'You not install this plugin. or problem in installation',
                });
            });
        }).catch((error) => {
            // ---
            return res.status(400).send({
                status: 0,
                message: 'You not install this plugin. or problem in installation',
            });
        });
    }

    public async successAPI(req: express.Request | any, res: express.Response): Promise<any> {
        const pluginRepository = getManager().getRepository(Plugins);
        const orderProductRepository = getManager().getRepository(OrderProduct);
        const productImageRepository = getManager().getRepository(ProductImage);
        const productRepository = getManager().getRepository(Product);
        const settingRepository = getManager().getRepository(Settings);
        const currencyRepository = getManager().getRepository(Currency);
        const razorpayOrderRepository = getManager().getRepository(RazorpayOrder);
        const razorpayOrderTransactionRepository = getManager().getRepository(RazorpayOrderTransaction);
        const paymentRepository = getManager().getRepository(Payments);
        const paymentItemsRepository = getManager().getRepository(PaymentItems);
        const queryParams = req.query;
        const pluginDetail = await pluginRepository.findOne({
            where: {
                pluginName: 'razorpay',
            },
        });
        if (!pluginDetail) {
            return res.status(400).send({
                status: 0,
                message: 'You not install this plugin. or problem in installation',
            });
        }
        const paypalAdditionalInfo = pluginDetail.pluginAdditionalInfo ? JSON.parse(pluginDetail.pluginAdditionalInfo) : {};
        const razorPay = require('razorpay');
        const instance = new razorPay({
            key_id: paypalAdditionalInfo.clientId,
            key_secret: paypalAdditionalInfo.clientSecret,
        });
        const paymentDetails = await RazorPayController.razorPaySuccess(instance, queryParams.razorpay_payment_id);
        const razorpayDetail = await razorpayOrderRepository.findOne({
            where: {
                razorpayRefId: paymentDetails.order_id,
            },
        });
        if (!razorpayDetail) {
            return res.status(400).send({
                status: 0,
                message: 'Invalid Payment Details',
            });
        }

        const orderRepository = getManager().getRepository(Order);
        const orderData: any = await orderRepository.findOne(razorpayDetail.orderId);
        if (!orderData) {
            return res.status(400).send({
                status: 0,
                message: 'Invalid Order Id',
            });
        }
        const setting = await settingRepository.findOne();
        const currencySymbol = await currencyRepository.findOne(setting.storeCurrencyId);
        orderData.currencyRight = currencySymbol.symbolRight;
        orderData.currencyLeft = currencySymbol.symbolLeft;

        const orderStatus = await orderRepository.findOne({ where: { orderId: razorpayDetail.orderId, paymentFlag: 1 } });
        if (orderStatus) {
            return res.status(400).send({
                status: 0,
                message: 'Already Paid for this Order',
            });
        }

        const intvalue = Math.round(paymentDetails.amount);
        if (paymentDetails.status === 'captured' && intvalue === +razorpayDetail.total) {
            const transactionsParams = new RazorpayOrderTransaction();
            transactionsParams.paymentType = paymentDetails.method;
            transactionsParams.razorpayOrderId = razorpayDetail.id;
            transactionsParams.paymentData = JSON.stringify(paymentDetails);
            transactionsParams.paymentStatus = 1;
            await razorpayOrderTransactionRepository.save(transactionsParams);
            razorpayDetail.status = 1;
            await razorpayOrderRepository.save(razorpayDetail);
            orderData.paymentFlag = 1;
            orderData.paymentStatus = 1;
            orderData.paymentProcess = 1;
            orderData.paymentType = 'razorpay';
            orderData.paymentDetails = paymentDetails.id;
            await orderRepository.save(orderData);
            const paymentParams = new Payments();
            paymentParams.orderId = razorpayDetail.orderId;
            const date = new Date();
            paymentParams.paidDate = moment(date).format('YYYY-MM-DD HH:mm:ss');
            paymentParams.paymentNumber = paymentDetails.id;
            paymentParams.paymentAmount = orderData.total;
            paymentParams.paymentInformation = JSON.stringify(paymentDetails);
            const payments = await paymentRepository.save(paymentParams);
            const productDetailData = [];
            let i;
            const orderProduct = await orderProductRepository.find({ where: { orderId: orderData.orderId }, select: ['orderProductId', 'orderId', 'productId', 'name', 'model', 'quantity', 'total', 'productPrice', 'discountAmount', 'discountedAmount'] });
            for (i = 0; i < orderProduct.length; i++) {
                const paymentItems = new PaymentItems();
                paymentItems.paymentId = payments.paymentId;
                paymentItems.orderProductId = orderProduct[i].orderProductId;
                paymentItems.totalAmount = orderProduct[i].discountedAmount ? orderProduct[i].discountedAmount : orderProduct[i].total;
                paymentItems.productName = orderProduct[i].name;
                paymentItems.productQuantity = orderProduct[i].quantity;
                paymentItems.productPrice = orderProduct[i].productPrice;
                await paymentItemsRepository.save(paymentItems);
                const productInformation = await orderProductRepository.findOne({ where: { orderProductId: orderProduct[i].orderProductId }, select: ['orderProductId', 'orderId', 'productId', 'name', 'model', 'quantity', 'total', 'productPrice', 'discountAmount', 'discountedAmount'] });
                const productImageData: any = await productRepository.findOne(productInformation.productId);
                const productImageDetail = await productImageRepository.findOne({ where: { productId: productInformation.productId } });
                productImageData.productInformationData = productInformation;
                productImageData.productImage = productImageDetail;
                productDetailData.push(productImageData);
            }
            
        } else {
            const transactionsParams = new RazorpayOrderTransaction();
            transactionsParams.paymentType = 'FAILURE';
            transactionsParams.razorpayOrderId = razorpayDetail.id;
            transactionsParams.paymentData = JSON.stringify(paymentDetails);
            transactionsParams.paymentStatus = 2;
            await razorpayOrderTransactionRepository.save(transactionsParams);
            razorpayDetail.status = 2;
            await razorpayOrderRepository.save(razorpayDetail);
            orderData.paymentFlag = 2;
            await orderRepository.save(orderData);
        }
        const successResponse: any = {
            status: 1,
            message: 'payment made successful',
        };
        return res.status(200).send(successResponse);
    }
}
