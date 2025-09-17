/*
* spurtcommerce
* http://www.spurtcommerce.com
*
* Copyright (c) 2022 Piccosoft Software Labs Pvt Ltd
* Author Piccosoft Software Labs Pvt Ltd <support@spurtcommerce.com>
* Licensed under the MIT license.
*/

import 'reflect-metadata';
import {
    Post,
    Body,
    JsonController,
    Authorized,
    Req,
    Res,
    Get,
    QueryParam,
    Param,
    Put,
    Delete,
    BodyParam,
} from 'routing-controllers';
import { Not } from 'typeorm';
import { VendorCouponService } from '../services/VendorCouponService';
import { VendorCoupon } from '../models/VendorCoupon';
import { VendorCouponProductCategoryService } from '../services/VendorCouponProductCategoryService';
import { VendorCouponProductCategory } from '../models/VendorCouponProductCategory';
import { CreateCouponRequest } from './requests/CreateCouponRequest';
import { ProductService } from '../services/ProductService';
import { CouponUsageProductService } from '../services/CouponUsageProductService';
import { UpdateCouponRequest } from './requests/UpdateCouponRequest';
import { CouponUsageService } from '../services/CouponUsageService';
import { ProductImageService } from '../services/ProductImageService';
import { ProductSpecialService } from '../services/ProductSpecialService';
import { ProductDiscountService } from '../services/ProductDiscountService';
import * as fs from 'fs';
import moment from 'moment';

@JsonController('/admin-coupon')
export class CouponController {
    constructor(private vendorCouponService: VendorCouponService,
                private vendorCouponProductCategoryService: VendorCouponProductCategoryService,
                private couponUsageProductService: CouponUsageProductService,
                private productService: ProductService,
                private couponUsageService: CouponUsageService,
                private productSpecialService: ProductSpecialService,
                private productDiscountService: ProductDiscountService,
                private productImageService: ProductImageService
    ) {
    }
    // Create Coupon
    /**
     * @api {post} /api/admin-coupon/add-coupon Add Vendor Coupon API
     * @apiGroup Admin Coupon
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {String} couponName couponName
     * @apiParam (Request body) {String} couponCode couponCode
     * @apiParam (Request body) {String} couponType couponType 1-> percentage 2 -> amount
     * @apiParam (Request body) {Number} discount discount
     * @apiParam (Request body) {Number} minimumPurchaseAmount minimumPurchaseAmount
     * @apiParam (Request body) {Number} maximumPurchaseAmount maximumPurchaseAmount
     * @apiParam (Request body) {Number} couponConjunction couponConjunction 1->yes 0->no
     * @apiParam (Request body) {Number} couponAppliesSales couponAppliesSales 1->yes 0->no
     * @apiParam (Request body) {String} emailRestrictions emailRestrictions
     * @apiParam (Request body) {Number} applicableFor applicableFor 1-> loginUser
     * @apiParam (Request body) {Number} freeShipping freeShipping 1-> yes 0 -> no
     * @apiParam (Request body) {String} startDate startDate
     * @apiParam (Request body) {String} endDate endDate
     * @apiParam (Request body) {Number} maxUserPerCoupon maximumUserPerCoupon
     * @apiParam (Request body) {Number} noOfTimeCouponValidPerUser noOfTimeCouponValidPerUser
     * @apiParam (Request body) {Number} allQualifyingItemsApply allQualifyingItemsApply
     * @apiParam (Request body) {Number} appliedCartItemsCount appliedCartItemsCount
     * @apiParam (Request body) {Number} productType productType
     * @apiParam (Request body) {Number} status status
     * @apiParamExample {json} Input
     * {
     *      "couponName" : "",
     *      "couponCode" : "",
     *      "couponType" : "",
     *      "discount" : "",
     *      "minimumPurchaseAmount" : "",
     *      "maximumPurchaseAmount" : "",
     *      "couponConjunction" : "",
     *      "couponAppliesSales" : "",
     *      "emailRestrictions" : "",
     *      "applicableFor" : "",
     *      "freeShipping" : "",
     *      "startDate" : "",
     *      "endDate" : "",
     *      "maxUserPerCoupon" : "",
     *      "noOfTimeCouponValidPerUser" : "",
     *      "allQualifyingItemsApply" : "",
     *      "appliedCartItemsCount" : "",
     *      "productType" : [
     *                {"type": "","referenceId":["",""]},
     *                {"type": "","referenceId":["",""]},
     *                {"type": "","referenceId":["",""]},
     *              ],
     *      "status" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Coupon created successfully",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/admin-coupon/add-coupon
     * @apiErrorExample {json} Coupon error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/add-coupon')
    @Authorized(['admin', 'create-coupon'])
    public async createCoupon(@Body({ validate: true }) couponParam: CreateCouponRequest, @Req() request: any, @Res() response: any): Promise<any> {
        const error: any = [];
        const orderProducts: any = couponParam.productType;
        if (+couponParam.couponType === 1 && +couponParam.discount > 100) {
            return response.status(400).send({
                status: 0,
                message: 'Coupon Discount percentage must be less than or equal to 100',
            });
        }
        for (const val of orderProducts) {
            const product: any = val.referenceId;
            for (const productId of product) {
                const value = await this.productService.findOne({ where: { productId } });
                if (couponParam.couponType === 2) {
                    if (+value.price < couponParam.discount) {
                        error.push(1);
                    }
                }
            }
        }
        if (error.length > 0) {
            const errResponse: any = {
                status: 0,
                message: 'Invalid product as the product price is less than the discount amount. ',
            };
            return response.status(400).send(errResponse);
        }
        const vendorCouponCode = await this.vendorCouponService.findOne({ where: { couponCode: couponParam.couponCode } });
        if (vendorCouponCode) {
            const errorResponse: any = {
                status: 1,
                message: 'Already there is a coupon with this code.',
            };
            return response.status(400).send(errorResponse);
        }
        const vendorCoupon: any = new VendorCoupon();
        vendorCoupon.vendorId = 0;
        vendorCoupon.couponName = couponParam.couponName;
        vendorCoupon.couponCode = couponParam.couponCode;
        vendorCoupon.couponType = couponParam.couponType ? couponParam.couponType : 1;
        vendorCoupon.discount = couponParam.discount;
        vendorCoupon.minimumPurchaseAmount = couponParam.minimumPurchaseAmount;
        vendorCoupon.maximumPurchaseAmount = couponParam.maximumPurchaseAmount;
        vendorCoupon.couponConjunction = couponParam.couponConjunction;
        vendorCoupon.couponAppliesSales = couponParam.couponAppliesSales;
        vendorCoupon.isActive = couponParam.status;
        vendorCoupon.emailRestrictions = couponParam.emailRestrictions;
        vendorCoupon.freeShipping = couponParam.freeShipping ? couponParam.freeShipping : 0;
        const startDate = moment(couponParam.startDate).format('YYYY-MM-DD HH:mm:ss');
        vendorCoupon.startDate = startDate;
        const endDate = moment(couponParam.endDate).format('YYYY-MM-DD HH:mm:ss');
        vendorCoupon.endDate = endDate;
        vendorCoupon.maxUserPerCoupon = couponParam.maxUserPerCoupon;
        vendorCoupon.noOfTimeCouponValidUser = couponParam.noOfTimeCouponValidPerUser;
        vendorCoupon.allQualifyingItemsApply = couponParam.allQualifyingItemsApply ? couponParam.appliedCartItemsCount : 0;
        vendorCoupon.appliedCartItemsCount = couponParam.appliedCartItemsCount ? couponParam.appliedCartItemsCount : 0;
        const createVendorCoupon = await this.vendorCouponService.create(vendorCoupon);
        let reference: any = [];
        reference = couponParam.productType;
        for (const record of reference) {
            let productId = [];
            productId = record.referenceId;
            for (const rec of productId) {
                const vendorCouponProductCategory: any = new VendorCouponProductCategory();
                vendorCouponProductCategory.type = record.type;
                vendorCouponProductCategory.vendorCouponId = createVendorCoupon.vendorCouponId;
                vendorCouponProductCategory.referenceId = rec;
                await this.vendorCouponProductCategoryService.create(vendorCouponProductCategory);
            }
        }
        const successResponse: any = {
            status: 1,
            message: 'Coupon Created Successfully.',
        };
        return response.status(200).send(successResponse);
    }
    // Vendor Coupon List API
    /**
     * @api {get} /api/admin-coupon/admin-coupon-list Admin Vendor Coupon List API
     * @apiGroup Admin Coupon
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} limit Limit
     * @apiParam (Request body) {Number} offset Offset
     * @apiParam (Request body) {String} keyword Enter Coupon Name
     * @apiParam (Request body) {String} status status
     * @apiParam (Request body) {Number} count Count should be number or boolean
     * @apiParamExample {json} Input
     * {
     *      "limit" : "",
     *      "offset" : "",
     *      "keyword" : "",
     *      "status" : "",
     *      "count" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "status": "1",
     *      "message": "Vendor Coupon List Successfully"
     *      "data" : "{ }"
     * }
     * @apiSampleRequest /api/admin-coupon/admin-coupon-list
     * @apiErrorExample {json}  Coupon List API error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/admin-coupon-list')
    @Authorized(['admin', 'list-coupon'])
    public async listVendorCoupon(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('keyword') keyword: string, @QueryParam('status') status: string, @QueryParam('count') count: number | boolean, @Req() request: any, @Res() response: any): Promise<any> {
        const select = ['vendorCouponId', 'vendorId', 'couponName', 'couponCode', 'couponType', 'discount', 'startDate', 'endDate', 'isActive', 'createdDate'];
        const WhereConditions = [
            {
                name: 'vendorId',
                op: 'where',
                value: 0,
            },
        ];

        if (status === '0' || status === '1') {
            WhereConditions.push(
                {
                    name: 'isActive',
                    op: 'where',
                    value: +status,
                }
            );
        }

        const search = [
            {
                name: 'couponName',
                op: 'like',
                value: keyword,
            },
        ];
        const listVendorCoupon: any = await this.vendorCouponService.list(limit, offset, select, search, WhereConditions, count);
        if (listVendorCoupon.length >= 0) {
            const list = listVendorCoupon.map(async (value: any) => {
                const temp: any = value;
                const couponUsage = await this.couponUsageService.findAll({
                    select: ['couponUsageId'],
                    where: {
                        couponId: value.vendorCouponId,
                    },
                });
                temp.orders = couponUsage.length;
                const date2 = new Date(temp.endDate);
                const nowDate = new Date();
                const days = date2.getTime() - nowDate.getTime();
                const daysDifference = days / (1000 * 3600 * 24);
                if ((Math.round(daysDifference) >= 0)) {
                    temp.leftDays = Math.round(daysDifference);
                } else {
                    temp.leftDays = 'Expired';
                }
                return temp;
            });
            const results = await Promise.all(list);
            const successResponse: any = {
                status: 1,
                message: 'Successfully got vendor Coupon list',
                data: results,
            };
            return response.status(200).send(successResponse);
        } else {
            const successResponse: any = {
                status: 1,
                message: 'Successfully got vendor Coupon list',
                data: listVendorCoupon,
            };
            return response.status(200).send(successResponse);
        }
    }

    // Coupon Usage List API
    /**
     * @api {get} /api/admin-coupon/coupon-usage-list Coupon Usage list API
     * @apiGroup Admin Coupon
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} limit Limit
     * @apiParam (Request body) {Number} offset Offset
     * @apiParam (Request body) {Number} couponId couponId
     * @apiParam (Request body) {Number} count Count should be number or boolean
     * @apiParamExample {json} Input
     * {
     *      "limit" : "",
     *      "offset" : "",
     *      "couponId" : "",
     *      "count" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "status": "1",
     *      "message": "coupon usage List Successfully"
     *      "data" : "{ }"
     * }
     * @apiSampleRequest /api/admin-coupon/coupon-usage-list
     * @apiErrorExample {json} Vendor Coupon List API error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/coupon-usage-list')
    @Authorized('')
    public async CouponUsageList(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('couponId') couponId: number, @QueryParam('count') count: number | boolean, @Req() request: any, @Res() response: any): Promise<any> {
        const select = [
            'CouponUsageProduct.couponUsageId as couponUsageId',
            'CouponUsageProduct.orderId as orderId',
            'CouponUsageProduct.customerId as customerId',
            'CouponUsageProduct.orderProductId as orderProductId',
            'CouponUsageProduct.quantity as quantity',
            'CouponUsageProduct.amount as amount',
            'CouponUsageProduct.discountAmount as discountAmount',
            'orderProduct.name as productName',
            'orderProduct.orderProductId as orderProductId',
            'orderProduct.orderProductPrefixId as orderProductPrefixId',
            'order.orderId as orderId',
            'order.shippingFirstname as shippingFirstName',
        ];

        const relations = [
            {
                tableName: 'CouponUsageProduct.orderProduct',
                aliasName: 'orderProduct',
            },
            {
                tableName: 'CouponUsageProduct.couponUsage',
                aliasName: 'couponUsage',
            },
            {
                tableName: 'CouponUsageProduct.order',
                aliasName: 'order',
            },
        ];
        const groupBy = [];

        const whereConditions = [];

        whereConditions.push({
            name: 'couponUsage.couponId',
            op: 'and',
            value: couponId,
        });

        const searchConditions = [];
        const sort = [];
        sort.push({
            name: 'CouponUsageProduct.createdDate',
            order: 'DESC',
        });
        if (count) {
            const listCouponCount: any = await this.couponUsageProductService.listByQueryBuilder(limit, offset, select, whereConditions, searchConditions, relations, groupBy, sort, true, true);
            const countResponse: any = {
                status: 1,
                message: 'Successfully got Coupon Usage count',
                data: listCouponCount,
            };
            return response.status(200).send(countResponse);
        }

        const listVendorCoupon: any = await this.couponUsageProductService.listByQueryBuilder(limit, offset, select, whereConditions, searchConditions, relations, groupBy, sort, false, true);
        const list = listVendorCoupon.map(async (value: any) => {
            const temp: any = value;
            temp.discountedPrice = value.amount - (+value.discountAmount);
            return temp;
        });
        const results = await Promise.all(list);
        const successResponse: any = {
            status: 1,
            message: 'Successfully got coupon Usage list',
            data: results,
        };
        return response.status(200).send(successResponse);
    }
    // Vendor Coupon Detail API
    /**
     * @api {get} /api/admin-coupon/coupon-detail Coupon Detail API
     * @apiGroup Admin Coupon
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} vendorCouponId VendorCouponId
     * @apiParamExample {json} Input
     * {
     *      "vendorCouponId" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "status": "1",
     *      "message": "Successfully got vendor coupon detail",
     *      "data" : "{ }"
     * }
     * @apiSampleRequest /api/admin-coupon/coupon-detail
     * @apiErrorExample {json} Vendor Coupon Detail API error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/coupon-detail')
    @Authorized(' ')
    public async couponDetail(@QueryParam('vendorCouponId') vendorCouponId: number, @Req() request: any, @Res() response: any): Promise<any> {
        const coupon = await this.vendorCouponService.findOne({
            where: {
                vendorCouponId,
            },
        });
        if (!coupon) {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid VendorCouponId',
            };
            return response.status(400).send(errorResponse);
        }
        const couponProduct = await this.vendorCouponProductCategoryService.findAll({
            where: {
                vendorCouponId,
            },
        });
        const applicableProduct: any = [];
        // type 1 applicable product
        for (const data of couponProduct) {
            const obj: any = {};
            if (data.type === 1) {
                const product = await this.productService.findOne({
                    select: ['productId', 'sku', 'name', 'quantity', 'price', 'image', 'imagePath', 'isFeatured', 'todayDeals', 'productSlug', 'isActive'],
                    where: {
                        productId: data.referenceId,
                    },
                });
                if (product) {
                    obj.productId = product.productId;
                    obj.sku = product.sku;
                    obj.name = product.name;
                    obj.quantity = product.quantity;
                    obj.price = product.price;
                    obj.image = product.image;
                    obj.imagePath = product.imagePath;
                    obj.isFeatured = product.isFeatured;
                    obj.todayDeals = product.todayDeals;
                    obj.productSlug = product.productSlug;
                    obj.isActive = product.isActive;
                    const defaultValue = await this.productImageService.findOne({
                        where: {
                            productId: product.productId,
                            defaultImage: 1,
                        },
                    });
                    obj.productImage = defaultValue;
                    const nowDate = new Date();
                    const todaydate = nowDate.getFullYear() + '-' + (nowDate.getMonth() + 1) + '-' + nowDate.getDate();
                    const productSpecial = await this.productSpecialService.findSpecialPrice(product.productId, todaydate);
                    const productDiscount = await this.productDiscountService.findDiscountPrice(product.productId, todaydate);
                    if (productSpecial !== undefined) {
                        obj.pricerefer = productSpecial.price;
                        obj.flag = 1;
                    } else if (productDiscount !== undefined) {
                        obj.pricerefer = productDiscount.price;
                        obj.flag = 0;
                    }
                    applicableProduct.push(obj);
                }
            }
        }
        coupon.applicableProduct = applicableProduct;
        const successResponse: any = {
            status: 1,
            message: 'successfully got Vendor Coupon Detail. ',
            data: coupon,
        };
        return response.status(200).send(successResponse);
    }
    // Update Vendor Coupon
    /**
     * @api {put} /api/admin-coupon/update-coupon/:vendorCouponId Edit Vendor Coupon API
     * @apiGroup Admin Coupon
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {String} couponName couponName
     * @apiParam (Request body) {String} couponCode couponCode
     * @apiParam (Request body) {String} couponType couponType 1-> percentage 2 -> amount
     * @apiParam (Request body) {Number} discount discount
     * @apiParam (Request body) {Number} minimumPurchaseAmount minimumPurchaseAmount
     * @apiParam (Request body) {Number} maximumPurchaseAmount maximumPurchaseAmount
     * @apiParam (Request body) {Number} couponConjunction couponConjunction 1->yes 0->no
     * @apiParam (Request body) {Number} couponAppliesSales couponAppliesSales 1->yes 0->no
     * @apiParam (Request body) {String} emailRestrictions emailRestrictions
     * @apiParam (Request body) {Number} applicableFor applicableFor 1-> loginUser
     * @apiParam (Request body) {Number} freeShipping freeShipping 1-> yes 0 -> no
     * @apiParam (Request body) {String} startDate startDate
     * @apiParam (Request body) {String} endDate endDate
     * @apiParam (Request body) {Number} maxUserPerCoupon maximumUserPerCoupon
     * @apiParam (Request body) {Number} noOfTimeCouponValidPerUser noOfTimeCouponValidPerUser
     * @apiParam (Request body) {Number} allQualifyingItemsApply allQualifyingItemsApply
     * @apiParam (Request body) {Number} appliedCartItemsCount appliedCartItemsCount
     * @apiParam (Request body) {Number} productType productType
     * @apiParam (Request body) {Number} status status
     * @apiParamExample {json} Input
     * {
     *      "couponName" : "",
     *      "couponCode" : "",
     *      "couponType" : "",
     *      "discount" : "",
     *      "minimumPurchaseAmount" : "",
     *      "maximumPurchaseAmount" : "",
     *      "couponConjunction" : "",
     *      "couponAppliesSales" : "",
     *      "emailRestrictions" : "",
     *      "applicableFor" : "",
     *      "freeShipping" : "",
     *      "startDate" : "",
     *      "endDate" : "",
     *      "maxUserPerCoupon" : "",
     *      "noOfTimeCouponValidPerUser" : "",
     *      "allQualifyingItemsApply" : "",
     *      "appliedCartItemsCount" : "",
     *      "productType" : [
     *                {"type": "","referenceId":["",""]},
     *                {"type": "","referenceId":["",""]},
     *                {"type": "","referenceId":["",""]},
     *              ],
     *      "status" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Coupon updated successfully",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/admin-coupon/update-coupon/:vendorCouponId
     * @apiErrorExample {json} Coupon error
     * HTTP/1.1 500 Internal Server Error
     */
    @Put('/update-coupon/:vendorCouponId')
    @Authorized(['admin', 'edit-coupon'])
    public async updateCoupon(@Body({ validate: true }) couponParam: UpdateCouponRequest, @Param('vendorCouponId') vendorCouponId: number, @Req() request: any, @Res() response: any): Promise<any> {
        const error: any = [];
        const orderProducts: any = couponParam.productType;
        if (+couponParam.couponType === 1 && +couponParam.discount > 100) {
            return response.status(400).send({
                status: 0,
                message: 'Coupon Discount percentage must be less than or equal to 100',
            });
        }
        for (const val of orderProducts) {
            const product: any = val.referenceId;
            for (const productId of product) {
                const value = await this.productService.findOne({ where: { productId } });
                if (couponParam.couponType === 2) {
                    if (+value.price < couponParam.discount) {
                        error.push(1);
                    }
                }
            }
        }
        if (error.length > 0) {
            const errResponse: any = {
                status: 0,
                message: 'Invalid product as the product price is less than the discount amount.',
            };
            return response.status(400).send(errResponse);
        }
        const vendorCoupon = await this.vendorCouponService.findOne({ where: { vendorCouponId } });
        if (!vendorCoupon) {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid Vendor Coupon Id',
            };
            return response.status(400).send(errorResponse);
        }
        vendorCoupon.vendorId = 0;
        vendorCoupon.couponName = couponParam.couponName;
        vendorCoupon.couponCode = couponParam.couponCode;
        vendorCoupon.couponType = couponParam.couponType ? couponParam.couponType : 1;
        vendorCoupon.discount = couponParam.discount;
        vendorCoupon.minimumPurchaseAmount = couponParam.minimumPurchaseAmount;
        vendorCoupon.maximumPurchaseAmount = couponParam.maximumPurchaseAmount;
        vendorCoupon.couponConjunction = couponParam.couponConjunction;
        vendorCoupon.couponAppliesSales = couponParam.couponAppliesSales;
        vendorCoupon.isActive = couponParam.status;
        vendorCoupon.emailRestrictions = couponParam.emailRestrictions;
        vendorCoupon.freeShipping = couponParam.freeShipping ? couponParam.freeShipping : 0;
        const startDate = moment(couponParam.startDate).format('YYYY-MM-DD HH:mm:ss');
        vendorCoupon.startDate = startDate;
        const endDate = moment(couponParam.endDate).format('YYYY-MM-DD HH:mm:ss');
        vendorCoupon.endDate = endDate;
        vendorCoupon.maxUserPerCoupon = couponParam.maxUserPerCoupon;
        if (+couponParam.allQualifyingItemsApply || +couponParam.appliedCartItemsCount > 0) {
            vendorCoupon.allQualifyingItemsApply = couponParam.allQualifyingItemsApply ? couponParam.allQualifyingItemsApply : 0;
            vendorCoupon.appliedCartItemsCount = couponParam.appliedCartItemsCount ? couponParam.appliedCartItemsCount : 0;
        } else {
            return response.status(400).send({
                status: 0,
                message: 'validation error',
            });
        }
        vendorCoupon.noOfTimeCouponValidUser = couponParam.noOfTimeCouponValidPerUser;
        const vendorCouponCode = await this.vendorCouponService.findOne({
            where: {
                couponCode: couponParam.couponCode,
                vendorCouponId: Not(vendorCouponId),
            },
        });
        if (vendorCouponCode) {
            const errorResponse: any = {
                status: 1,
                message: 'Already there is a coupon with this code.',
            };
            return response.status(400).send(errorResponse);
        }
        const createVendorCoupon = await this.vendorCouponService.update(vendorCoupon.vendorCouponId, vendorCoupon);
        const couponProduct = await this.vendorCouponProductCategoryService.findAll({
            where: {
                vendorCouponId,
            },
        });
        if (couponProduct.length > 0) {
            await this.vendorCouponProductCategoryService.delete(couponProduct);
        }
        let reference: any = [];
        reference = couponParam.productType;
        for (const record of reference) {
            let productId = [];
            productId = record.referenceId;
            for (const rec of productId) {
                const vendorCouponProductCategory: any = new VendorCouponProductCategory();
                vendorCouponProductCategory.type = record.type;
                vendorCouponProductCategory.vendorCouponId = createVendorCoupon.vendorCouponId;
                vendorCouponProductCategory.referenceId = rec;
                await this.vendorCouponProductCategoryService.create(vendorCouponProductCategory);
            }
        }
        const successResponse: any = {
            status: 1,
            message: 'Coupon Updated Successfully.',
        };
        return response.status(200).send(successResponse);
    }
    // Delete Vendor Coupon API
    /**
     * @api {delete} /api/admin-coupon/delete-coupon/:vendorCouponId Delete Vendor Coupon API
     * @apiGroup Admin Coupon
     * @apiHeader {String} Authorization
     * @apiParamExample {json} Input
     * {
     *      "vendorCouponId" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully deleted vendor coupon.",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/admin-coupon/delete-coupon/:vendorCouponId
     * @apiErrorExample {json} Delete Vendor Coupon API error
     * HTTP/1.1 500 Internal Server Error
     */
    @Delete('/delete-coupon/:vendorCouponId')
    @Authorized(['admin', 'delete-coupon'])
    public async deleteVendorCoupon(@Param('vendorCouponId') vendorCouponId: number, @Res() response: any): Promise<any> {
        const vendorCoupon = await this.vendorCouponService.findOne({
            where: {
                vendorCouponId,
            },
        });
        if (!vendorCoupon) {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid Vendor Coupon Id.',
            };
            return response.status(400).send(errorResponse);
        }
        const deleteVendorCoupon = await this.vendorCouponService.delete(vendorCoupon);
        if (deleteVendorCoupon) {
            const successResponse: any = {
                status: 1,
                message: 'Successfully deleted Coupon',
            };
            return response.status(200).send(successResponse);
        } else {
            const errorResponse: any = {
                status: 0,
                message: 'unable to delete the Coupon',
            };
            return response.status(400).send(errorResponse);
        }
    }

    // Delete Vendor Coupon API
    /**
     * @api {post} /api/admin-coupon/delete-bulk-coupon Delete Bulk Vendor Coupon API
     * @apiGroup Admin Coupon
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {String} vendorCouponId vendorCouponId
     * @apiParamExample {json} Input
     * {
     *      "vendorCouponId" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully deleted vendor coupon.",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/admin-coupon/delete-bulk-coupon
     * @apiErrorExample {json} Delete Vendor Coupon API error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/delete-bulk-coupon')
    @Authorized()
    public async deleteBulkVendorCoupon(@BodyParam('vendorCouponId') vendorCouponId: string, @Res() response: any): Promise<any> {
        const customers = vendorCouponId.toString();
        const customer: any = customers.split(',');
        const data: any = customer.map(async (id: any) => {
            const vendorCoupon = await this.vendorCouponService.findOne({
                where: {
                    vendorCouponId: id,
                },
            });
            if (!vendorCoupon) {
                const errorResponse: any = {
                    status: 0,
                    message: 'Invalid Vendor Coupon Id.',
                };
                return response.status(400).send(errorResponse);
            }
            await this.vendorCouponService.delete(vendorCoupon);
        });
        const deleteVendorCoupon = await Promise.all(data);
        if (deleteVendorCoupon) {
            const successResponse: any = {
                status: 1,
                message: 'Successfully deleted Coupon',
            };
            return response.status(200).send(successResponse);
        } else {
            const errorResponse: any = {
                status: 0,
                message: 'unable to delete the Coupon',
            };
            return response.status(400).send(errorResponse);
        }
    }

    // Vendor Coupon List Bulk Export API
    /**
     * @api {get} /api/admin-coupon/bulk-export-admin-coupon-list Bulk Export of Admin Coupon List API
     * @apiGroup Admin Coupon
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} limit Limit
     * @apiParam (Request body) {Number} offset Offset
     * @apiParam (Request body) {String} keyword Enter Coupon Name
     * @apiParam (Request body) {Number} count Count should be number or boolean
     * @apiParamExample {json} Input
     * {
     *      "limit" : "",
     *      "offset" : "",
     *      "keyword" : "",
     *      "count" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "status": "1",
     *      "message": "Vendor Coupon List Successfully"
     *      "data" : "{ }"
     * }
     * @apiSampleRequest /api/admin-coupon/bulk-export-admin-coupon-list
     * @apiErrorExample {json}  Coupon List API error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/bulk-export-admin-coupon-list')
    @Authorized('admin')
    public async bulkExport(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('keyword') keyword: string, @QueryParam('count') count: number | boolean, @Req() request: any, @Res() response: any): Promise<any> {
        const excel = require('exceljs');
        const workbook = new excel.Workbook();
        const worksheet = workbook.addWorksheet('Bulk Coupon Export');
        const rows = [];
        const select = [
            'VendorCoupon.vendorCouponId as vendorCouponId',
            'VendorCoupon.vendorId as vendorId',
            'VendorCoupon.couponCode as couponCode',
            'VendorCoupon.couponName as couponName',
            'VendorCoupon.discount as discount',
            'VendorCoupon.startDate as startDate',
            'VendorCoupon.endDate as endDate',
            'VendorCoupon.isActive as isActive',
            '(SELECT COUNT(cu.coupon_usage_id) FROM `coupon_usage` `cu` WHERE cu.coupon_id = VendorCoupon.vendorCouponId) AS orders',
        ];

        const relations = [];
        const groupBy = [];
        const whereConditions = [];
        const searchConditions = [];
        if (keyword && keyword !== '') {
            searchConditions.push({
                name: ['VendorCoupon.couponName', 'VendorCoupon.couponCode'],
                value: keyword.toLowerCase(),
            });

        }
        const sort = [];
        sort.push({
            name: 'VendorCoupon.createdDate',
            order: 'DESC',
        });
        const couponList: any = await this.vendorCouponService.listByQueryBuilder(limit, offset, select, whereConditions, searchConditions, relations, groupBy, sort, false, true);
        // Excel sheet column define
        worksheet.columns = [
            { header: 'Coupon Name', key: 'couponName', size: 16, width: 15 },
            { header: 'Coupon Code', key: 'CouponCode', size: 16, width: 15 },
            { header: 'Discount Value', key: 'discountValue', size: 16, width: 24 },
            { header: 'Start Date', key: 'startDate', size: 16, width: 15 },
            { header: 'End Date', key: 'mobileNumber', size: 16, width: 15 },
            { header: 'Date Left', key: 'dateLeft', size: 16, width: 15 },
            { header: 'Orders', key: 'orders', size: 16, width: 15 },
        ];
        worksheet.getCell('A1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('B1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('C1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('D1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('E1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('F1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('G1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        for (const coupon of couponList) {
            const date2 = new Date(coupon.endDate);
            const nowDate = new Date();
            const days = date2.getTime() - nowDate.getTime();
            const daysDifference = days / (1000 * 3600 * 24);
            let leftDays;
            if ((Math.round(daysDifference) >= 0)) {
                leftDays = Math.round(daysDifference);
            } else {
                leftDays = 'Expired';
            }
            rows.push([coupon.couponName, coupon.couponCode , coupon.discount, coupon.startDate, coupon.endDate, leftDays, coupon.orders]);
        }
        // Add all rows data in sheet
        worksheet.addRows(rows);
        const fileName = './CouponBulkExcel_' + Date.now() + '.xlsx';
        await workbook.xlsx.writeFile(fileName);
        return new Promise((resolve, reject) => {
            response.download(fileName, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    fs.unlinkSync(fileName);
                    return response.end();
                }
            });
        });
    }

    // Vendor Coupon List Excel Export API
    /**
     * @api {get} /api/admin-coupon/export-excel-admin-coupon-list Single Export of Admin Coupon List API
     * @apiGroup Admin Coupon
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} vendorCouponId vendorCouponId
     * @apiParamExample {json} Input
     * {
     *      "vendorCouponId" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "status": "1",
     *      "message": "Vendor Coupon List Successfully"
     *      "data" : "{ }"
     * }
     * @apiSampleRequest /api/admin-coupon/bulk-export-admin-coupon-list
     * @apiErrorExample {json}  Coupon List API error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/export-excel-admin-coupon-list')
    @Authorized('admin')
    public async singlebulkExport(@QueryParam('vendorCouponId') vendorCouponId: string, @Req() request: any, @Res() response: any): Promise<any> {
        const excel = require('exceljs');
        const workbook = new excel.Workbook();
        const worksheet = workbook.addWorksheet('Coupon Export Excel');
        const rows = [];
        const select = [
            'VendorCoupon.vendorCouponId as vendorCouponId',
            'VendorCoupon.vendorId as vendorId',
            'VendorCoupon.couponCode as couponCode',
            'VendorCoupon.couponName as couponName',
            'VendorCoupon.discount as discount',
            'VendorCoupon.startDate as startDate',
            'VendorCoupon.endDate as endDate',
            'VendorCoupon.isActive as isActive',
            '(SELECT COUNT(cu.coupon_usage_id) FROM `coupon_usage` `cu` WHERE cu.coupon_id = VendorCoupon.vendorCouponId) AS orders',
        ];

        const relations = [];
        const groupBy = [];
        const whereConditions = [];
        const searchConditions = [];
        whereConditions.push({
            name: 'VendorCoupon.vendorCouponId',
            op: 'IN',
            value: vendorCouponId,
        });

        const sort = [];
        sort.push({
            name: 'VendorCoupon.createdDate',
            order: 'DESC',
        });
        const couponList: any = await this.vendorCouponService.listByQueryBuilder(0, 0, select, whereConditions, searchConditions, relations, groupBy, sort, false, true);
        // Excel sheet column define
        worksheet.columns = [
            { header: 'Coupon Name', key: 'couponName', size: 16, width: 15 },
            { header: 'Coupon Code', key: 'CouponCode', size: 16, width: 15 },
            { header: 'Discount Value', key: 'discountValue', size: 16, width: 24 },
            { header: 'Start Date', key: 'startDate', size: 16, width: 15 },
            { header: 'End Date', key: 'mobileNumber', size: 16, width: 15 },
            { header: 'Date Left', key: 'dateLeft', size: 16, width: 15 },
            { header: 'Orders', key: 'orders', size: 16, width: 15 },
        ];
        worksheet.getCell('A1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('B1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('C1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('D1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('E1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('F1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('G1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        for (const coupon of couponList) {
            const date2 = new Date(coupon.endDate);
            const nowDate = new Date();
            const days = date2.getTime() - nowDate.getTime();
            const daysDifference = days / (1000 * 3600 * 24);
            let leftDays;
            if ((Math.round(daysDifference) >= 0)) {
                leftDays = Math.round(daysDifference);
            } else {
                leftDays = 'Expired';
            }
            rows.push([coupon.couponName, coupon.couponCode , coupon.discount, coupon.startDate, coupon.endDate, leftDays, coupon.orders]);
        }
        // Add all rows data in sheet
        worksheet.addRows(rows);
        const fileName = './CouponBulkExcel_' + Date.now() + '.xlsx';
        await workbook.xlsx.writeFile(fileName);
        return new Promise((resolve, reject) => {
            response.download(fileName, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    fs.unlinkSync(fileName);
                    return response.end();
                }
            });
        });
    }
}
