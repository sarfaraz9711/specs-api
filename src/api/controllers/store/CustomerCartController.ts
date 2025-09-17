/*
* spurtcommerce
* http://www.spurtcommerce.com
*
* Copyright (c) 2022 Piccosoft Software Labs Pvt Ltd
* Author Piccosoft Software Labs Pvt Ltd <support@spurtcommerce.com>
* Licensed under the MIT license.
*/

import 'reflect-metadata';
import { Post, JsonController, Res, Req, Get, QueryParam, Body, BodyParam, UseBefore } from 'routing-controllers';
import { ProductService } from '../../services/ProductService';
import { CustomerCartService } from '../../services/CustomerCartService';
import { ProductImageService } from '../../services/ProductImageService';
import { ProductTirePriceService } from '../../services/ProductTirePriceService';
import { CustomerCart } from '../../models/CustomerCart';
import { CreateCartRequest } from './requests/CreateCartRequest';
import { SkuService } from '../../services/SkuService';
import { VarientsValueService } from '../../services/VarientsValueService';
import { ProductVarientOptionDetailService } from '../../services/ProductVarientOptionDetailService';
import { ProductVarientOptionImageService } from '../../services/ProductVarientOptionImageService';
import {ProductVarientOptionService} from "../../services/ProductVarientOptionService"
import { CheckCustomerMiddleware } from '../../middlewares/checkTokenMiddleware';
import { getManager } from 'typeorm';
import { CustomerActivity } from '../../models/CustomerActivity';
import { CustomerActivityService } from '../../services/CustomerActivityService';
@UseBefore(CheckCustomerMiddleware)
@JsonController('/customer-cart')
export class CustomerController {
    constructor(private productService: ProductService, private skuService: SkuService,
                private customerCartService: CustomerCartService, private productImageService: ProductImageService, private productTirePriceService: ProductTirePriceService, private varientsValueService: VarientsValueService,
                private productVarientOptionDetailService: ProductVarientOptionDetailService,
                private productVarientOptionImageService: ProductVarientOptionImageService, 
                private productVarientOptionService: ProductVarientOptionService,
                private customerActivityService: CustomerActivityService
                ) {
    }

    // create and update customer cart API
    /**
     * @api {post} /api/customer-cart/add-cart Add to cart API
     * @apiGroup Customer Cart
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} productId productId
     * @apiParam (Request body) {Number} productPrice productPrice
     * @apiParam (Request body) {Number} tirePrice tirePrice
     * @apiParam (Request body) {Number} quantity quantity
     * @apiParam (Request body) {String} optionName optionName
     * @apiParam (Request body) {String} optionValueName optionValueName
     * @apiParam (Request body) {String} varientName VarientName
     * @apiParam (Request body) {String} productVarientOptionId productVarientOptionId
     * @apiParam (Request body) {String} skuName skuName
     * @apiParam (Request body) {string} type type
     * @apiParamExample {json} Input
     * {
     *      "productId" : "",
     *      "productPrice" : "",
     *      "tirePrice" : "",
     *      "quantity" : "",
     *      "optionName" : "",
     *      "optionValueName" : "",
     *      "varientName" : "",
     *      "productVarientOptionId" : "",
     *      "skuName" : "",
     *      "type" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully added product to cart",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/customer-cart/add-cart
     * @apiErrorExample {json} vendor category  error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/add-cart')
    public async addCustomerCart(@Body({ validate: true }) cartParam: CreateCartRequest, @Req() request: any, @Res() response: any): Promise<any> {
        const product = await this.productService.findOne({
            where: {
                productId: cartParam.productId,
            },
        });
        if (!product) {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid ProductId',
            };
            return response.status(400).send(errorResponse);
        }
        const customerCart = await this.customerCartService.findOne({
            where: {
                productId: cartParam.productId, customerId: request.user.id,
            },
        });
        const sku = await this.skuService.findOne({ where: { skuName: cartParam.skuName } });
        if (!sku) {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid sku',
            };
            return response.status(400).send(errorResponse);
        }
        if (customerCart) {
            const findOption = await this.customerCartService.findOne({
                where: {
                    productId: cartParam.productId, customerId: request.user.id, productVarientOptionId: cartParam.productVarientOptionId,
                },
            });
            if (findOption) {
                if (cartParam.type && cartParam.type === 'new') {
                    if (cartParam.quantity === 0) {
                        await this.customerCartService.delete(findOption.id);
                        await this.saveRemovedProductFromCart(request.user.id, cartParam.productId);
                        const deleteCart: any = {
                            status: 1,
                            message: 'Successfully removed from Cart',
                        };
                        return response.status(200).send(deleteCart);
                    }
                    const qty = Number(findOption.quantity) + +cartParam.quantity;
                    if (product.hasStock === 1) {
                        if (!(sku.minQuantityAllowedCart <= qty)) {
                            const minCart: any = {
                                status: 0,
                                message: 'Quantity should greater than min Quantity.',
                            };
                            return response.status(400).send(minCart);
                        } else if (!(sku.maxQuantityAllowedCart >= qty)) {
                            const maxCart: any = {
                                status: 0,
                                message: 'Quantity should lesser than max Quantity.',
                            };
                            return response.status(400).send(maxCart);
                        }
                    }
                    findOption.quantity = qty;
                } else {
                    findOption.quantity = cartParam.quantity;
                }
                findOption.productPrice = cartParam.productPrice;
                findOption.total = +cartParam.quantity * +cartParam.productPrice;
                findOption.optionName = cartParam.optionName;
                findOption.optionValueName = cartParam.optionValueName;
                findOption.tirePrice = cartParam.tirePrice  ? cartParam.tirePrice : 0;
                findOption.productVarientOptionId = cartParam.productVarientOptionId ?  cartParam.productVarientOptionId : 0;
                findOption.skuName = cartParam.skuName;
                findOption.varientName = cartParam.varientName;
                await this.customerCartService.createData(findOption);
                const successResponse: any = {
                    status: 1,
                    message: 'Successfully updated cart.',
                    data: findOption,
                };
                return response.status(200).send(successResponse);
            } else {
                if (cartParam.quantity === 0) {
                    await this.customerCartService.delete(customerCart.id);
                    await this.saveRemovedProductFromCart(request.user.id, cartParam.productId);
                    const deleteCart: any = {
                        status: 1,
                        message: 'Successfully removed from Cart',
                    };
                    return response.status(200).send(deleteCart);
                }
                if (product.hasStock === 1) {
                    if (!(sku.minQuantityAllowedCart <= +cartParam.quantity)) {
                        const minCart: any = {
                            status: 0,
                            message: 'Quantity should greater than min Quantity.',
                        };
                        return response.status(400).send(minCart);
                    } else if (!(sku.maxQuantityAllowedCart >= +cartParam.quantity)) {
                        const maxCart: any = {
                            status: 0,
                            message: 'Quantity should lesser than max Quantity.',
                        };
                        return response.status(400).send(maxCart);
                    }
                }
                const addCustomerCart: any = new CustomerCart();
                addCustomerCart.productId = cartParam.productId,
                addCustomerCart.name = product.name,
                addCustomerCart.customerId = request.user.id,
                addCustomerCart.quantity = cartParam.quantity,
                addCustomerCart.productPrice = cartParam.productPrice,
                addCustomerCart.tirePrice = cartParam.tirePrice ? cartParam.tirePrice : 0,
                addCustomerCart.total = +cartParam.quantity * +cartParam.productPrice,
                addCustomerCart.optionName = cartParam.optionName;
                addCustomerCart.optionValueName = cartParam.optionValueName;
                addCustomerCart.productVarientOptionId = cartParam.productVarientOptionId ? cartParam.productVarientOptionId : 0;
                addCustomerCart.skuName = cartParam.skuName;
                addCustomerCart.varientName = cartParam.varientName;
                const val = await this.customerCartService.createData(addCustomerCart);
                const cart: any = {
                    status: 1,
                    message: 'Successfully added cart.',
                    data: val,
                };
                return response.status(200).send(cart);
            }
        } else {
            if (product.hasStock === 1) {
                if (!(sku.minQuantityAllowedCart <= +cartParam.quantity)) {
                    const minCart: any = {
                        status: 0,
                        message: 'Quantity should greater than min Quantity.',
                    };
                    return response.status(400).send(minCart);
                } else if (!(sku.maxQuantityAllowedCart >= +cartParam.quantity)) {
                    const maxCart: any = {
                        status: 0,
                        message: 'Quantity should lesser than max Quantity.',
                    };
                    return response.status(400).send(maxCart);
                }
            }
            const addCustomerCart: any = new CustomerCart();
            addCustomerCart.productId = cartParam.productId,
            addCustomerCart.name = product.name,
            addCustomerCart.customerId = request.user.id,
            addCustomerCart.quantity = cartParam.quantity,
            addCustomerCart.productPrice = cartParam.productPrice,
            addCustomerCart.tirePrice = cartParam.tirePrice ? cartParam.tirePrice : 0 ,
            addCustomerCart.total = +cartParam.quantity * +cartParam.productPrice,
            addCustomerCart.optionName = cartParam.optionName;
            addCustomerCart.optionValueName = cartParam.optionValueName;
            addCustomerCart.productVarientOptionId = cartParam.productVarientOptionId ?  cartParam.productVarientOptionId : 0;
            addCustomerCart.skuName = cartParam.skuName;
            addCustomerCart.varientName = cartParam.varientName;
            const val = await this.customerCartService.createData(addCustomerCart);
            const cart: any = {
                status: 1,
                message: 'Successfully added to cart.',
                data: val,
            };
            return response.status(200).send(cart);

        }
    }

    // Customer Cart List API
    /**
     * @api {get} /api/customer-cart/customer-cart-list  Customer Cart List API
     * @apiGroup Customer Cart
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} limit limit
     * @apiParam (Request body) {Number} offset offset
     * @apiParam (Request body) {Boolean} count count should be number or boolean
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get Customer Cart List",
     *      "data":{
     *       "productId" : "",
     *       "name" : "",
     *       "quantity" : "",
     *       "productPrice" : "",
     *       "total" : "",
     *       "image" : "",
     *       "containerName" : "",
     *       "optionName" : "",
     *       "optionValueName" : "",
     *      }
     *      "status": "1"
     * }
     * @apiSampleRequest /api/customer-cart/customer-cart-list
     * @apiErrorExample {json} Customer Cart error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/customer-cart-list')
    public async customerCartList(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('count') count: number | boolean, @Req() request: any, @Res() response: any): Promise<any> {
        const selects = ['CustomerCart.id as id',
            'CustomerCart.productPrice as productPrice',
            'CustomerCart.tirePrice as tirePrice',
            'CustomerCart.total as total',
            'CustomerCart.optionName as optionName',
            'CustomerCart.optionValueName as optionValueName',
            'CustomerCart.varientName as varientName',
            'CustomerCart.skuName as skuName',
            'CustomerCart.productVarientOptionId as productVarientOptionId',
            'product.productId as productId',
            'product.taxType as taxType',
            'product.taxValue as taxValue',
            'product.name as name',
            'product.price as price',
            'product.taxType as taxType',
            'CustomerCart.quantity as quantity',
            'CustomerCart.categoryName as categoryName',
            'product.description as description',
            'product.discount as discount',
            'product.manufacturerId as manufacturerId',
            'product.dateAvailable as dateAvailable',
            'product.sku as sku',
            'product.skuId as skuId',
            'product.sortOrder as sortOrder',
            'product.isSimplified as isSimplified',
            'product.upc as upc',
            'product.rating as rating',
            'product.isActive as isActive',
            'product.productSlug as productSlug',
            'product.metaTagTitle as metaTagTitle',
            'product.hasStock as hasStock',
            'product.outOfStockThreshold as outOfStockThreshold',
            'product.stockStatusId as stockStatusId',
            'product.createdDate as createdDate',
            'product.keywords as keywords',
            'product.promotionId as promotionId',
            'product.promotionFlag as promotionFlag',
            'product.promotionType as promotionType',
            'product.productSellingPrice as productSellingPrice',
            'product.promotionProductYid as promotionProductYid',
            'product.promotionProductYSlug as promotionProductYSlug',
            'product.promotionFreeProductPrice as promotionFreeProductPrice',
            'IF(product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `product`.`tax_value` LIMIT 1), product.taxValue)  as taxValue',
            'IF(product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = product.productId AND pvo.is_active = 1 LIMIT 1) ) AS skuId',
            '(SELECT sku.sku_name as skuName FROM sku WHERE sku.id = skuId) as skuName',
            '(SELECT sku.price as price FROM sku WHERE sku.id = skuId) as skuPrice',
            '(SELECT sku.out_of_stock_threshold as outOfStockThreshold FROM sku WHERE sku.id = skuId) as outOfStockThreshold',
            '(SELECT sku.notify_min_quantity_below as notifyMinQuantity FROM sku WHERE sku.id = skuId) as notifyMinQuantity',
            '(SELECT sku.min_quantity_allowed_cart as minQuantityAllowedCart FROM sku WHERE sku.id = skuId) as minQuantityAllowedCart',
            '(SELECT sku.max_quantity_allowed_cart as maxQuantityAllowedCart FROM sku WHERE sku.id = skuId) as maxQuantityAllowedCart',
            '(SELECT sku.enable_back_orders as enableBackOrders FROM sku WHERE sku.id = skuId) as enableBackOrders',
            '(SELECT price FROM product_discount pd2 WHERE pd2.product_id = product.product_id AND pd2.sku_id = skuId AND ((pd2.date_start <= CURDATE() AND  pd2.date_end >= CURDATE())) ' +
            ' ORDER BY pd2.priority ASC, pd2.price ASC LIMIT 1) AS productDiscount',
            '(SELECT price FROM product_special ps WHERE ps.product_id = product.product_id AND ps.sku_id = skuId AND ((ps.date_start <= CURDATE() AND ps.date_end >= CURDATE()))' + ' ' + 'ORDER BY ps.priority ASC, ps.price ASC LIMIT 1) AS productSpecial',
        ];
        const whereCondition = [];
        const relations = [];
        const groupBy = [];
        const sort = [];
        relations.push({
            tableName: 'CustomerCart.product',
            aliasName: 'product',
        });
        whereCondition.push({
            name: 'CustomerCart.customerId',
            op: 'where',
            value: request.user.id,
        },
        {
            name: 'CustomerCart.quantity',
            op: 'and',
            value: 0,
            sign: ">"
        },
        );
        // sort.push({
        //     name: 'CustomerCart.createdDate',
        //     order: 'DESC',
        // });
        if (count) {
            const cartCount: any = await this.customerCartService.listByQueryBuilder(limit, offset, selects, whereCondition, [], relations, groupBy, sort, true, true);
            const successResponse: any = {
                status: 1,
                message: 'Successfully got the cart count.',
                data: cartCount,
            };
            return response.status(200).send(successResponse);
        }
        const selectVarientIds:any[]=[]
        const cartList: any = await this.customerCartService.listByQueryBuilder(limit, offset, selects, whereCondition, [], relations, groupBy, sort, false, true);
        let grandTotal = 0;
        const findImage = cartList.map(async (value: any) => {
            const temp: any = value;
            temp.taxValue = +value.taxValue;
            temp.optionName = value.optionName;
            temp.quantity = value.quantity;
            temp.tirePrice = value.tirePrice;
            temp.productImage = await this.productImageService.findAll({
                select: ['productId', 'image', 'containerName', 'defaultImage'],
                where: {
                    productId: temp.productId,
                },
            });
            temp.productOriginalImage = temp.productImage.slice();
            grandTotal = 0;
            if (value.productSpecial !== null) {
                temp.pricerefer = value.productSpecial;
                temp.flag = 1;
            } else if (value.productDiscount !== null) {
                temp.pricerefer = value.productDiscount;
                temp.flag = 0;
            } else {
                temp.pricerefer = '';
                temp.flag = '';
            }
            temp.productTirePrices = await this.productTirePriceService.findAll({
                select: ['id', 'quantity', 'price'],
                where: { productId: value.productId, skuId: value.skuId },
            });
            temp.variantName = '';
            temp.variantId = '';
            if (value.productVarientOptionId) {
                temp.variantId = value.productVarientOptionId;
                temp.variantName = value.varientName;
                const image = await this.productVarientOptionImageService.findAll({
                    select: ['id', 'image', 'containerName', 'defaultImage', 'productVarientOptionId'],
                    where: { productVarientOptionId: value.productVarientOptionId },
                });
                if (image && image.length > 0) {
                    const tempImage = temp.productImage.map(element => {
                        return Object.assign({}, element, {
                            defaultImage: 0,
                        });
                    });
                    image[0].defaultImage = 1;
                    tempImage.unshift(image[0]);
                    temp.productImage = tempImage;
                }
                const selectedVariant: any = {};
                const productVarientOption = await this.productVarientOptionDetailService.findAll({
                    select: ['id', 'productVarientOptionId', 'varientsValueId'],
                    where: { productVarientOptionId: value.productVarientOptionId },
                }).then((varientValue) => {
                    const varientValueList = varientValue.map(async (vv: any) => {
                        const tempValue: any = vv;
                        const varientValueData = await this.varientsValueService.findOneData({
                            select: ['id', 'valueName', 'varientsId'],
                            where: { id: vv.varientsValueId },
                        });
                        if (varientValueData !== undefined) {
                            selectedVariant[varientValueData.varientsId] = vv.varientsValueId;
                        }
                        tempValue.valueName = (varientValueData !== undefined) ? varientValueData.valueName : '';
                        return tempValue;
                    });
                    const rslt = Promise.all(varientValueList);
                    return rslt;
                });
                const productvarientList = await this.productVarientOptionService.findAll({
                    select: ['id', 'productId', 'skuId', 'varientName', 'isActive', 'createdDate'],
                    where: { productId: value.productId, isActive: 1 },
                }).then((val) => {
                    const productVarList = val.map(async (value: any) => {
                        const temp: any = value;
                        const sku = await this.skuService.findOne({
                            where: { id: value.skuId },
                        });
                        const image = await this.productVarientOptionImageService.findAll({
                            select: ['id', 'image', 'containerName', 'defaultImage', 'productVarientOptionId'],
                            where: { productVarientOptionId: value.id },
                        });
                        const productVarientOption = await this.productVarientOptionDetailService.findAll({
                            select: ['id', 'productVarientOptionId', 'varientsValueId'],
                            where: { productVarientOptionId: value.id },
                        }).then((varientValue) => {
                            const varientValueList = varientValue.map(async (vv: any) => {
                                return vv.varientsValueId;
                            });
                            const rslt = Promise.all(varientValueList);
                            return rslt;
                        });
                        temp.skuName = sku.skuName;
                        temp.skuId = sku.id;
                        temp.price = sku.price;
                        temp.quantity = sku.quantity;
                        temp.optionImage = image;
                        temp.productVarientOption = productVarientOption;
                        productVarientOption.forEach(element => {
                            selectVarientIds.push(element) 
                        });
                        temp.outOfStockThreshold = sku.outOfStockThreshold;
                        temp.hasStock = sku.hasStock;
                        temp.notifyMinQuantity = sku.notifyMinQuantity;
                        temp.minQuantityAllowedCart = sku.minQuantityAllowedCart;
                        temp.maxQuantityAllowedCart = sku.maxQuantityAllowedCart;
                        temp.enableBackOrders = sku.enableBackOrders;
                        if (value.hasStock === 1) {
                            if (sku.quantity <= sku.outOfStockThreshold) {
                                temp.stockStatus = 'outOfStock';
                            } else {
                                temp.stockStatus = 'inStock';
                            }
                        } else {
                            temp.stockStatus = 'inStock';
                        }
                      
                        return temp;
                    });
                    const resultData = Promise.all(productVarList);
                    return resultData;
                });
                temp.productVarientOption = productVarientOption;
                temp.selectedVariant = selectedVariant;
                temp.productvarientList = productvarientList
            }
            if (value.hasStock === 1) {
                if (value.quantity <= value.outOfStockThreshold) {
                    temp.stockStatus = 'outOfStock';
                } else {
                    temp.stockStatus = 'inStock';
                }
            } else {
                temp.stockStatus = 'inStock';
            }
            return temp;
        });
        const finalResult = await Promise.all(findImage);
        response.cookie('globalSession', new Date().getTime(), {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 60 * 60 * 1000, // 1 hour
            path: '/', // cookie available site-wide
          });

        if (cartList) {
            const successResponse: any = {
                status: 1,
                message: 'Successfully got the cart list.',
                data: { cartList: finalResult, grandTotal },
            };
            return response.status(200).send(successResponse);
        } else {
            const errorResponse: any = {
                status: 0,
                message: 'unable to list cart list',
            };
            return response.status(400).send(errorResponse);
        }
    }
    // Delete cart items API

    /**
     * @api {post} /api/customer-cart/delete-cart-item Delete Cart items API
     * @apiGroup Customer Cart
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {number} cartId cartId
     * @apiParamExample {json} Input
     * {
     * "cartId" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     * "message": "Successfully deleted items.",
     * "status": "1"
     * }
     * @apiSampleRequest /api/customer-cart/delete-cart-item
     * @apiErrorExample {json} cartDelete error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/delete-cart-item')
    public async deleteCartItem(@BodyParam('cartId') cartId: string, @Res() response: any, @Req() request: any): Promise<CustomerCart> {
        const productId = cartId.split(',');
        if (cartId === '') {
            const customerCart = await this.customerCartService.find({
                where: {
                    customerId: request.user.id,
                },
            });
            for (const cart of customerCart) {
                const itemId = parseInt(cart.id, 10);
                await this.customerCartService.delete(itemId);
            }
            const Response: any = {
                status: 1,
                message: 'Successfully cleared your cart',
            };
            return response.status(200).send(Response);
        }
        const err: any = [];
        for (const id of productId) {
            const itemId = parseInt(id, 10);
            const val = await this.customerCartService.findOne(itemId);
            if (!val) {
                err.push(1);
            }
        }
        if (err.length > 0) {
            const errorResponse: any = {
                status: 0,
                message: 'invalid cart Item',
            };
            return response.status(400).send(errorResponse);
        }
        for (const id of productId) {
            const itemId = parseInt(id, 10);
            await this.customerCartService.delete(itemId);
        }
        const successResponse: any = {
            status: 1,
            message: 'Successfully removed item',
        };
        return response.status(200).send(successResponse);
    }

    public async saveRemovedProductFromCart(customerId:any, productId: any) {
        await getManager().query(`DELETE FROM customer_activity WHERE customer_id = ${customerId} AND description = 'productRemovedFromCart' AND product_id = ${productId}`)
            
            const customerProductViewsCountRes =  await getManager().query(`SELECT COUNT(*) AS count FROM customer_activity WHERE customer_id = ${customerId} AND description = 'productviewed'`);
            
            const cCount = customerProductViewsCountRes[0].count;
            
            if(cCount <= 5){
                

                const customerActivity = new CustomerActivity();
                customerActivity.customerId = customerId;
                customerActivity.activityId = 3;
                customerActivity.description = 'productRemovedFromCart';
                customerActivity.productId = productId;
                await this.customerActivityService.create(customerActivity);
            }else{

               const querySelect =  await getManager().query(`SELECT MIN(customer_activity_id) cai FROM customer_activity WHERE customer_id = ${customerId} AND description = 'productviewed'`)
               await getManager().query(`DELETE FROM customer_activity WHERE customer_activity_id = ${querySelect[0].cai}`)

               const customerActivity = new CustomerActivity();
                customerActivity.customerId = customerId;
                customerActivity.activityId = 3;
                customerActivity.description = 'productRemovedFromCart';
                customerActivity.productId = productId;
                await this.customerActivityService.create(customerActivity);
           
            }
    }
}
