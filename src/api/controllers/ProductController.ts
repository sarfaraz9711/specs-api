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
    Get,
    JsonController,
    Authorized,
    QueryParam,
    Res,
    Body,
    Req,
    Post,
    Param,
    Put, Delete, UploadedFile, BodyParam, QueryParams
} from 'routing-controllers';
import { ProductService } from '../services/ProductService';
import { ProductToCategoryService } from '../services/ProductToCategoryService';
import { ProductImageService } from '../services/ProductImageService';
import { Product } from '../models/ProductModel';
import { ProductDiscount } from '../models/ProductDiscount';
import { ProductSpecial } from '../models/ProductSpecial';
import { classToPlain } from 'class-transformer';
import { DeleteProductRequest } from './requests/DeleteProductRequest';
// import { UpdateProductRequest } from './requests/UpdateProductRequest';
import { ProductToCategory } from '../models/ProductToCategory';
import { ProductImage } from '../models/ProductImage';
import { CategoryService } from '../services/CategoryService';
import { OrderProductService } from '../services/OrderProductService';
import { OrderService } from '../services/OrderService';
import { ProductRelated } from '../models/ProductRelated';
import { ProductTirePrice } from '../models/ProductTirePrice';
import { ProductRelatedService } from '../services/ProductRelatedService';
import { UpdateTodayDealsParam } from './requests/UpdateTodayDealsParam';
import { UpdateRatingStatusRequest } from './requests/UpdateRatingStatusRequest';
import { UpdateStockRequest } from './requests/UpdateStockRequest';
import { CreateTirePriceRequest } from './requests/CreateTirePriceRequest';
import { ProductViewLogService } from '../services/ProductViewLogService';
import { ProductDiscountService } from '../services/ProductDiscountService';
import { ProductSpecialService } from '../services/ProductSpecialService';
import moment = require('moment');
import { CustomerService } from '../services/CustomerService';
import { ProductRatingService } from '../services/RatingService';
import fs = require('fs');
import { TaxService } from '../services/TaxService';
import { PaymentService } from '../services/PaymentService';
import { ProductQuestionService } from '../services/ProductQuestionService';
import { UserService } from '../services/UserService';
import * as path from 'path';
import { ImageService } from '../services/ImageService';
import { CategoryPathService } from '../services/CategoryPathService';
import { ProductTirePriceService } from '../services/ProductTirePriceService';
import { SkuService } from '../services/SkuService';
import { Sku } from '../models/SkuModel';
import { ProductVarientService } from '../services/ProductVarientService';
import { ProductVarient } from '../models/ProductVarient';
import { ProductVarientOptionService } from '../services/ProductVarientOptionService';
import { ProductVarientOption } from '../models/ProductVarientOption';
import { ProductVarientOptionDetailService } from '../services/ProductVarientOptionDetailService';
import { ProductVarientOptionDetail } from '../models/ProductVarientOptionDetail';
import { ProductVarientOptionImage } from '../models/ProductVarientOptionImage';
import { ProductVarientOptionImageService } from '../services/ProductVarientOptionImageService';
import { VarientsValueService } from '../services/VarientsValueService';
import { env } from '../../env';
import { S3Service } from '../services/S3Service';
import { VendorCouponProductCategoryService } from '../services/VendorCouponProductCategoryService';
import { ProductVideoService } from '../services/ProductVideoService';
import { ProductVideo } from '../models/ProductVideo';
import { UpdateFeatureProduct } from './requests/UpdateFeatureProductRequest';
import { CommonService } from '../common/commonService';
import { VarientsController } from './VarientsController';
import { Order } from '../models/Order';
import { getManager } from 'typeorm';
import { PaytmRefunds } from '../models/Paytm/PaytmRefunds';
import { IngenicoRefunds } from '../models/Ingenico/IngenicoRefunds';
import { ProductReviewImages } from '../models/ProductReviewImages';
import { DiscountOffer } from '../models/DiscountOffer';
//const http = require('http');


@JsonController('/product')
export class ProductController {
    constructor(
        private productService: ProductService,
        private productToCategoryService: ProductToCategoryService,
        private productImageService: ProductImageService,
        private categoryService: CategoryService,
        private orderProductService: OrderProductService,
        private orderService: OrderService,
        private productRelatedService: ProductRelatedService,
        private productViewLogService: ProductViewLogService,
        private productDiscountService: ProductDiscountService,
        private productSpecialService: ProductSpecialService,
        private productRatingService: ProductRatingService,
        private customerService: CustomerService,
        private taxService: TaxService,
        private paymentService: PaymentService,
        private productQuestionService: ProductQuestionService,
        private userService: UserService,
        private categoryPathService: CategoryPathService,
        private productTirePriceService: ProductTirePriceService,
        private skuService: SkuService,
        private productVarientService: ProductVarientService,
        private productVarientOptionService: ProductVarientOptionService,
        private productVarientOptionDetailService: ProductVarientOptionDetailService,
        private productVarientOptionImageService: ProductVarientOptionImageService,
        private varientsValueService: VarientsValueService,
        private s3Service: S3Service,
        private vendorCouponProductCategoryService: VendorCouponProductCategoryService,
        private productVideoService: ProductVideoService,
        private imageService: ImageService,
        private _commonService: CommonService,
        private _varientController: VarientsController
    ) {
    }

    // Product List API
    /**
     * @api {get} /api/product/productlist Product List API
     * @apiGroup Product
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} limit limit
     * @apiParam (Request body) {Number} offset offset
     * @apiParam (Request body) {String} keyword keyword
     * @apiParam (Request body) {String} sku sku
     * @apiParam (Request body) {String} status status
     * @apiParam (Request body) {Number} price=1/2 if 1->asc 2->desc
     * @apiParam (Request body) {Number} count count in number or boolean
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "status": "1"
     *      "message": "Successfully get product list",
     *      "data":"{}"
     * }
     * @apiSampleRequest /api/product/productlist
     * @apiErrorExample {json} productList error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/productlist')
    @Authorized(['admin', 'list-product'])
    public async productList(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('keyword') keyword: string,@QueryParam('upc') upc: string,@QueryParam('sku') sku: string, @QueryParam('status') status: string, @QueryParam('price') price: number, @QueryParam('count') count: number | boolean, @Res() response: any): Promise<Product> {
        const select = [
            'Product.productId as productId',
            'Product.upc as upc',
            'Product.name as name',
            'Product.quantity as quantity',
            'Product.price as price',
            'Product.isFeatured as isFeatured',
            'Product.todayDeals as todayDeals',
            'Product.productSlug as productSlug',
            'Product.isActive as isActive',
            'Product.productSellingPrice as productSellingPrice',
            '(SELECT pi.image as image FROM product_image pi WHERE pi.product_id = Product.productId AND pi.default_image = 1 LIMIT 1) as image',
            '(SELECT pi.container_name as containerName FROM product_image pi WHERE pi.product_id = Product.productId AND pi.default_image = 1 LIMIT 1) as containerName',
            '(SELECT pi.default_image as defaultImage FROM product_image pi WHERE pi.product_id = Product.productId AND pi.default_image = 1 LIMIT 1) as defaultImage',
            'IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ) AS skuId',
            '(SELECT sku.sku_name as sku FROM sku WHERE sku.id = skuId) as sku',
            '(SELECT sku.price as price FROM sku WHERE sku.id = skuId) as price',
            '(SELECT sku.price as price FROM sku WHERE sku.id = skuId) as modifiedPrice',
            '(SELECT price FROM product_discount pd2 WHERE pd2.product_id = Product.product_id AND pd2.sku_id = skuId AND ((pd2.date_start <= CURDATE() AND  pd2.date_end >= CURDATE())) ' +
            ' ORDER BY pd2.priority ASC, pd2.price ASC LIMIT 1) AS productDiscount',
            '(SELECT price FROM product_special ps WHERE ps.product_id = Product.product_id AND ps.sku_id = skuId AND ((ps.date_start <= CURDATE() AND ps.date_end >= CURDATE()))' + ' ' + 'ORDER BY ps.priority ASC, ps.price ASC LIMIT 1) AS productSpecial',
        ];
        const relations = [];
        const WhereConditions = [];
        if (sku) {
            WhereConditions.push({
                name: 'Product.sku',
                op: 'like',
                value: sku,
            });
        }
        if (upc) {
            WhereConditions.push({
                name: 'Product.upc',
                op: 'like',
                value: upc,
            });
        }
        if (status) {
            WhereConditions.push({
                name: 'Product.isActive',
                op: 'and',
                value: status,
            });
        }
        const searchConditions = [];
        if (keyword !== '') {
            searchConditions.push(
                {
                    name: ['Product.name'],
                    value: keyword,
                });
        }
        const sort = [];
        if (+price && price === 1) {
            sort.push({
                name: 'Product.price',
                order: 'ASC',
            });
        } else if (+price && price === 2) {
            sort.push({
                name: 'Product.price',
                order: 'DESC',
            });
        } else {
            sort.push({
                name: 'Product.createdDate',
                order: 'DESC',
            });
        }
        const productLists: any = await this.productService.listByQueryBuilder(limit, offset, select, WhereConditions, searchConditions, relations, [], sort, false, true);
        if (count) {
            const productListCount: any = await this.productService.listByQueryBuilder(limit, offset, select, WhereConditions, [], relations, [], sort, true, true);
            return response.status(200).send({
                status: 1,
                message: 'Successfully got product lists count.',
                data: productListCount,
            });
        }
        const productList = productLists.map(async (value: any) => {
            const temp: any = value;
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
            return temp;
        });
        const results = await Promise.all(productList);

        const successResponse: any = {
            status: 1,
            message: 'Successfully got the complete product list. ',
            data: classToPlain(results),
        };
        return response.status(200).send(successResponse);
    }

    // Create Product API
    /**
     * @api {post} /api/product/add-product Add Product API
     * @apiGroup Product
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {String} productName productName
     * @apiParam (Request body) {String} productDescription productDescription
     * @apiParam (Request body) {String} sku stock keeping unit
     * @apiParam (Request body) {String} upc upc
     * @apiParam (Request body) {String} hsn hsn
     * @apiParam (Request body) {String} image product Image
     * @apiParam (Request body) {String} productSlug productSlug
     * @apiParam (Request body) {String} quantity quantity
     * @apiParam (Request body) {String} metaTagTitle metaTagTitle
     * @apiParam (Request body) {String} metaTagDescription metaTagDescription
     * @apiParam (Request body) {String} metaTagKeyword metaTagKeyword
     * @apiParam (Request body) {Number} packingCost packingCost
     * @apiParam (Request body) {Number} shippingCost shippingCost
     * @apiParam (Request body) {Number} tax tax
     * @apiParam (Request body) {Number} taxType taxType
     * @apiParam (Request body) {Number} others others
     * @apiParam (Request body) {String} categoryId CategoryId
     * @apiParam (Request body) {String} relatedProductId relatedProductId
     * @apiParam (Request body) {Number} price price
     * @apiParam (Request body) {Number} outOfStockStatus outOfStockStatus
     * @apiParam (Request body) {Number} requiredShipping requiredShipping
     * @apiParam (Request body) {String} dateAvailable dateAvailable
     * @apiParam (Request body) {Number} status status
     * @apiParam (Request body) {Number} sortOrder sortOrder
     * @apiParam (Request body) {Number} quotationAvailable quotationAvailable
     * @apiParam (Request body) {Number} hasTirePrice hasTirePrice
     * @apiParam (Request body) {String} productSpecial productSpecial
     * @apiParam (Request body) {String} productDiscount productDiscount
     * @apiParam (Request body) {String} tirePrices tirePrices
     * @apiParam (Request body) {String} height height
     * @apiParam (Request body) {String} weight weight
     * @apiParam (Request body) {String} length length
     * @apiParam (Request body) {String} width width
     * @apiParam (Request body) {Number} manufacturerId manufacturerId
     * @apiParam (Request body) {Number} pincodeBasedDelivery pincodeBasedDelivery
     * @apiParam (Request body) {String} productVarient productVarient
     * @apiParam (Request body) {String} productVarientOption productVarientOption
     * @apiParam (Request body) {Object} productVideo video
     * @apiParam (Request body) {String} productVideo.name video name
     * @apiParam (Request body) {String} productVideo.path for embedded have to pass path only
     * @apiParam (Request body) {Number} productVideo.type 1 -> video 2 -> embedded
     * @apiParamExample {json} Input
     * {
     *      "productName" : "",
     *      "productDescription" : "",
     *      "sku" : "",
     *      "image" : "",
     *      "metaTagTitle" : "",
     *      "metaTagDescription" : "",
     *      "metaTagKeyword" : "",
     *      "categoryId" : "",
     *      "productSlug" : "",
     *      "upc" : "",
     *      "hsn" : "",
     *      "price" : "",
     *      "packingCost" : "",
     *      "shippingCost" : "",
     *      "tax" : "",
     *      "taxType" : "",
     *      "others" : "",
     *      "outOfStockStatus" : "",
     *      "requiredShipping" : "",
     *      "dateAvailable" : "",
     *      "status" : "",
     *      "outOfStockStatus" : "",
     *      "sortOrder" : "",
     *      "quotationAvailable" : "",
     *      "hasTirePrice" : "",
     *      "manufacturerId" : "",
     *      "productVarient" : [],
     *      "productVarientOption" : [{
     *      "varientName":""
     *      "price":"",
     *      "sku":"",
     *      "quantity":,
     *      "isActive":,
     *      "optionValue":[],
     *      "optionImage":[{
     *      "image":"",
     *      "containerName": "",
     *      "defaultImage": "",
     *       }]
     *       }],
     *      "image":[
     *      {
     *      "image":""
     *      "containerName":""
     *      "defaultImage":""
     *      }
     *      ]
     *      "tirePrices":[
     *      {
     *      "quantity":""
     *      "price":""
     *      }
     *      ]
     *     "relatedProductId":[ ]
     *     "productSpecial":[
     *      {
     *     "customerGroupId":""
     *     "specialPriority":""
     *     "specialPrice":""
     *     "specialDateStart":""
     *     "specialDateEnd":""
     *      }],
     *     "productDiscount":[
     *      {
     *         "discountQuantity":""
     *         "discountPriority":""
     *         "discountPrice":""
     *         "discountDateStart":""
     *         "discountDateEnd"""
     *      }],
     *      "productVideo":{
     *               "name": "",
     *               "path": "",
     *               "type": ""
     *      }
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully created new product.",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/product/add-product
     * @apiErrorExample {json} AddProduct error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/add-product')
    @Authorized(['admin', 'create-product'])
    public async addProduct(@Body({ validate: true }) product: any, @Res() response: any, flag: any): Promise<any> {
        const newProduct: any = new Product();
        if (+newProduct.price === 0) {
            return response.status(400).send({
                status: 0,
                message: 'It is mandatory to mention price for the product.',
            });
        }
        const productImage: any = product.image;
        if (productImage.length === 0) {
            return response.status(400).send({
                status: 0,
                message: 'You need to upload at least one image for the product.',
            });
        }
        newProduct.name = product.productName;
        newProduct.description = product.productDescription;
        const metaTagTitle = product.productSlug ? product.productSlug : product.productName;
        const data = metaTagTitle.replace(/\s+/g, '-').replace(/[&\/\\@#,+()$~%.'":*?<>{}]/g, '').toLowerCase();
        newProduct.productSlug = await this.validate_slug(data);
        newProduct.sku = product.sku;
        newProduct.upc = product.upc;
        newProduct.hsn = product.hsn;
        newProduct.quantity = product.quantity ? product.quantity : 1;
        newProduct.quotationAvailable = product.quotationAvailable ? product.quotationAvailable : 0;

        ///// different charges//////
        const serviceCharge: any = {};
        serviceCharge.productCost = product.price;
        serviceCharge.packingCost = product.packingCost ? product.packingCost : 0;
        serviceCharge.shippingCost = product.shippingCost ? product.shippingCost : 0;
        serviceCharge.tax = 0;
        serviceCharge.others = product.others ? product.others : 0;
        newProduct.serviceCharges = JSON.stringify(serviceCharge);
        newProduct.price = serviceCharge.productCost + serviceCharge.packingCost + serviceCharge.shippingCost + serviceCharge.others;
        newProduct.taxType = product.taxType ? product.taxType : 0;
        newProduct.taxValue = product.tax ? product.tax : 0;
        newProduct.stockStatusId = product.outOfStockStatus ? product.outOfStockStatus : 0;


        newProduct.searchKeywords = await this.updateProductSearchItems(product);
        // saving sku //
        const findSku = await this.skuService.findOne({ where: { skuName: product.sku } });
        if (findSku) {
            const errorResponse: any = {
                status: 0,
                message: 'Duplicate sku name, give some other name.',
            };
            return response.status(400).send(errorResponse);
        }
        const newSku: any = new Sku();
        newSku.skuName = product.sku;
        newSku.price = newProduct.price;
        newSku.quantity = product.quantity ? product.quantity : 1;
        newSku.isActive = product.status;
        const saveSku = await this.skuService.create(newSku);
        // ending sku //
        newProduct.skuId = saveSku.id;
        newProduct.shipping = product.requiredShipping;
        newProduct.dateAvailable = moment(product.dateAvailable).toISOString();
        newProduct.metaTagTitle = product.metaTagTitle ? product.metaTagTitle : product.productName;
        newProduct.metaTagDescription = product.metaTagDescription;
        newProduct.metaTagKeyword = product.metaTagKeyword;
        newProduct.isActive = product.status;
        newProduct.isFeatured = 0;
        newProduct.todayDeals = 0;
        newProduct.sortOrder = product.sortOrder ? product.sortOrder : 1;
        newProduct.manufacturerId = product.manufacturerId ? product.manufacturerId : 0;
        newProduct.height = (product && product.height) ? product.height : 0;
        newProduct.weight = (product && product.weight) ? product.weight : 0;
        newProduct.length = (product && product.length) ? product.length : 0;
        newProduct.width = (product && product.width) ? product.width : 0;
        newProduct.hasTirePrice = product.hasTirePrice ? product.hasTirePrice : 0;
        newProduct.pincodeBasedDelivery = (product && product.pincodeBasedDelivery) ? product.pincodeBasedDelivery : 0;
        newProduct.productSizeColor = product.productSizeColor;
        newProduct.promotionId = product.promotionId;
        newProduct.promotionFlag = product.promotionFlag;
        newProduct.promotionType = product.promotionType;
        newProduct.promotionProductYid = product.promotionProductYid;
        newProduct.promotionProductYSlug = product.promotionProductYSlug;
        newProduct.promotionFreeProductPrice = product.promotionFreeProductPrice;
        newProduct.productSellingPrice = product.productSellingPrice
        const taxValue:any = await this.taxService.findOne({where: {taxId:product.tax}})
        const productMrp:any = (Math.round(product.price+((product.price*taxValue.taxPercentage)/100)))

        if(productMrp==product.productSellingPrice){
            newProduct.discount = 0
        }else{
            newProduct.discount = ((productMrp-product.productSellingPrice)*100)/productMrp
        }
        // adding category name and product name in keyword field for keyword search
        const row: any = [];
        if (product.categoryId) {
            const category = product.categoryId;
            for (const categoryId of category) {
                const categoryNames: any = await this.categoryService.findOne({
                    where: {
                        categoryId,
                    },
                });
                if(!categoryNames){
                    const errorResponse: any = {
                        status: 0,
                        message: 'Invalid Category',
                    };  
                    return response.status(400).send(errorResponse);
                }
                const name = '~' + categoryNames.name + '~';
                row.push(name);
            }
            row.push('~' + product.productName + '~');
        }
        const value = row.toString();
        newProduct.keywords = value;
        newProduct.inventorySync = product.inventorySync;

        const saveProduct = await this.productService.create(newProduct);
        // Add related product
        if (product.relatedProductId) {
            const relatedProduct: any = product.relatedProductId;
            for (const relatedproduct of relatedProduct) {
                const newRelatedProduct: any = new ProductRelated();
                newRelatedProduct.productId = saveProduct.productId;
                newRelatedProduct.relatedProductId = relatedproduct;
                await this.productRelatedService.create(newRelatedProduct);
            }
        }

        // save category
        if (product.categoryId) {
            const category = product.categoryId;
            for (const categoryId of category) {
                const newProductToCategory: any = new ProductToCategory();
                newProductToCategory.productId = saveProduct.productId;
                newProductToCategory.categoryId = categoryId;
                newProductToCategory.isActive = 1;
                await this.productToCategoryService.create(newProductToCategory);
            }
        }

        // Save products Image
        for (const imageRow of productImage) {
            const imageData = JSON.stringify(imageRow);
            const imageResult = JSON.parse(imageData);
            const newProductImage = new ProductImage();
            newProductImage.productId = saveProduct.productId;
            newProductImage.image = imageResult.image;
            newProductImage.containerName = imageResult.containerName;
            newProductImage.defaultImage = imageResult.defaultImage;
            await this.productImageService.create(newProductImage);
        }



        // Product Special
        if (product.productSpecial) {
            const productSpecial: any[] = product.productSpecial;
            for (const special of productSpecial) {
                const specialPriceData: any = new ProductSpecial();
                specialPriceData.productId = saveProduct.productId;
                specialPriceData.priority = special.specialPriority;
                specialPriceData.price = special.specialPrice;
                specialPriceData.dateStart = moment(special.specialDateStart).toISOString();
                specialPriceData.dateEnd = moment(special.specialDateEnd).toISOString();
                await this.productSpecialService.create(specialPriceData);
            }
        }

        // Product tire price
        if (product.tirePrices) {
            const tirePrice: any = product.tirePrices;
            for (const tire of tirePrice) {
                const productTirePrice: any = new ProductTirePrice();
                productTirePrice.productId = saveProduct.productId;
                productTirePrice.quantity = tire.quantity;
                productTirePrice.price = tire.price;
                await this.productTirePriceService.create(productTirePrice);
            }
        }
        // save product Video
        if (product.productVideo) {
            const video = product.productVideo;
            const productVideo: any = new ProductVideo();
            productVideo.productId = saveProduct.productId;
            productVideo.name = video.name;
            productVideo.path = video.path;
            productVideo.type = video.type;
            await this.productVideoService.create(productVideo);
        }

        // save product Varient
        if (product.productVarient) {
            const varients = product.productVarient;
            const productVarient: any = [];
            for (const varient of varients) {
                const newProductVarient: any = new ProductVarient();
                newProductVarient.productId = saveProduct.productId;
                newProductVarient.varientsId = varient;
                newProductVarient.isActive = 1;
                productVarient.push(newProductVarient);
            }
            await this.productVarientService.create(productVarient);
        }

        // save product Varient
        let totalQty = 0;
        if (product.productVarientOption) {
            const varientOptions = product.productVarientOption;
            for (const varientOption of varientOptions) {
                const newSkus: any = new Sku();
                const find = await this.skuService.findOne({ where: { skuName: varientOption.sku } });
                if (find) {
                    const prod = await this.productService.findOne({ where: { productId: saveProduct.productId } });
                    await this.skuService.delete({ id: prod.skuId });
                    await this.productService.delete(saveProduct.productId);
                    // await this.skuService.delete({ skuName: varientOption.sku });
                    const errorResponse: any = {
                        status: 0,
                        message: 'Duplicate sku name, give some other name for varient.',
                    };
                    return response.status(400).send(errorResponse);
                }
                newSkus.skuName = varientOption.sku;
                newSkus.price = varientOption.price;
                newSkus.quantity = varientOption.quantity ? varientOption.quantity : 1;
                totalQty += +newSkus.quantity;
                newSkus.isActive = varientOption.isActive;
                const saveSkus = await this.skuService.create(newSkus);
                const newProductVarientOption: any = new ProductVarientOption();
                newProductVarientOption.productId = saveProduct.productId;
                newProductVarientOption.skuId = saveSkus.id;
                newProductVarientOption.varientName = varientOption.varientName;
                newProductVarientOption.isActive = varientOption.isActive;
                const val = await this.productVarientOptionService.create(newProductVarientOption);
                const varientOptionsValues = varientOption.optionValue;
                const optionValues: any = [];
                for (const varientOptionsValue of varientOptionsValues) {
                    const newProductVarientOptionDetail: any = new ProductVarientOptionDetail();
                    newProductVarientOptionDetail.productVarientOptionId = val.id;
                    newProductVarientOptionDetail.varientsValueId = varientOptionsValue;
                    optionValues.push(newProductVarientOptionDetail);
                }
                await this.productVarientOptionDetailService.create(optionValues);
                const varientOptionsImages = varientOption.optionImage;
                const image: any = [];
                for (const varientOptionsImage of varientOptionsImages) {
                    const newProductVarientOptionImage: any = new ProductVarientOptionImage();
                    newProductVarientOptionImage.productVarientOptionId = val.id;
                    newProductVarientOptionImage.image = varientOptionsImage.image;
                    newProductVarientOptionImage.containerName = varientOptionsImage.containerName;
                    newProductVarientOptionImage.defaultImage = varientOptionsImage.defaultImage;
                    image.push(newProductVarientOptionImage);
                }
                await this.productVarientOptionImageService.create(image);
            }

            // newProduct.discount = Math.round(((Math.round(saveProduct.price+(saveProduct.price*taxVal/100))-saveProduct.productSellingPrice)*100)/Math.round(saveProduct.price+(saveProduct.price*taxVal/100)))
        }

        const varientSimplified = product.productVarient;
        if (varientSimplified.length > 0) {
            saveProduct.isSimplified = 0;
            saveProduct.quantity = totalQty;
            const sku = await this.skuService.findOne({ where: { id: saveProduct.skuId } });
            sku.quantity = totalQty;
            await this.skuService.create(sku);
        } else {
            saveProduct.isSimplified = 1;
        }
        const result = await this.productService.create(saveProduct);
        await this.productVarientOptionService.findAll({
            where: { productId: result.productId }
        })
        

        // Product Discount
        if (product.productDiscount) {
            const productDiscount: any = product.productDiscount;
            const distArr: any[] = []
            for (const discount of productDiscount) {
                const discountData: any = new ProductDiscount();
                //
                const skuValue: any = await this.skuService.findOne({
                    where: {
                        skuName: discount.skuName,
                    },
                });
                if (skuValue) {
                    const value: any = await this.productService.findOne({
                        where: {
                            skuId: skuValue.id,
                            productId: saveProduct.productId,
                        },
                    });
                    const varientSku: any = await this.productVarientOptionService.findOne({
                        where: {
                            skuId: skuValue.id,
                            productId: saveProduct.productId,
                        },
                    });
                    if (value) {
                        discountData.skuId = skuValue.id;
                    } else if (varientSku) {
                        discountData.skuId = skuValue.id;
                    } else {
                        const errorResponse: any = {
                            status: 0,
                            message: 'Invalid sku for this product.',
                        };
                        return response.status(400).send(errorResponse);
                    }
                }
                //
                discountData.productId = saveProduct.productId;
                discountData.quantity = 1;
                discountData.priority = discount.discountPriority;
                discountData.price = discount.discountPrice;
                discountData.dateStart = moment(discount.discountDateStart).toISOString();
                discountData.dateEnd = moment(discount.discountDateEnd).toISOString();
                distArr.push(discountData)
            }
            await this.productDiscountService.create(distArr);
        }
        if (!flag) {
            if (saveProduct) {
                const successResponse: any = {
                    status: 1,
                    message: 'Successfully created Product.',
                    data: saveProduct,
                };
                return response.status(200).send(successResponse);
            } else {
                const errorResponse: any = {
                    status: 0,
                    message: 'Unable to create the Product.',
                };
                return response.status(400).send(errorResponse);
            }
        }
    }


    private async updateProductSearchItems(product: any) {
        let categoryData = await getManager().query(`SELECT GROUP_CONCAT(CONCAT(name)) AS categoryName FROM category WHERE category_id IN (${product.categoryId.toString()})`);
        const searchKeywords = categoryData[0].categoryName + "," + product.productName + "," + product.upc;
        return searchKeywords;
    }

    // update Product API
    /**
     * @api {post} /api/product/update-product/:id Update Product API
     * @apiGroup Product
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} productId productId
     * @apiParam (Request body) {String} productName productName
     * @apiParam (Request body) {String} productDescription productDescription
     * @apiParam (Request body) {String} sku stock keeping unit
     * @apiParam (Request body) {String} upc upc
     * @apiParam (Request body) {String} hsn hsn
     * @apiParam (Request body) {String} image product Image
     * @apiParam (Request body) {String} quantity quantity
     * @apiParam (Request body) {String} productSlug productSlug
     * @apiParam (Request body) {String} metaTagTitle metaTagTitle
     * @apiParam (Request body) {String} metaTagDescription metaTagDescription
     * @apiParam (Request body) {String} metaTagKeyword metaTagKeyword
     * @apiParam (Request body) {String} categoryId CategoryId
     * @apiParam (Request body) {String} relatedProductId relatedProductId
     * @apiParam (Request body) {Number} price price
     * @apiParam (Request body) {Number} packingCost packingCost
     * @apiParam (Request body) {Number} shippingCost shippingCost
     * @apiParam (Request body) {Number} tax tax
     * @apiParam (Request body) {Number} taxType taxType
     * @apiParam (Request body) {Number} others others
     * @apiParam (Request body) {Number} outOfStockStatus outOfStockStatus
     * @apiParam (Request body) {Number} requiredShipping requiredShipping
     * @apiParam (Request body) {String} dateAvailable dateAvailable
     * @apiParam (Request body) {Number} status status
     * @apiParam (Request body) {Number} sortOrder sortOrder
     * @apiParam (Request body) {Number} quotationAvailable quotationAvailable
     * @apiParam (Request body) {Number} hasTirePrice
     * @apiParam (Request body) {String} productSpecial productSpecial
     * @apiParam (Request body) {String} productDiscount productDiscount
     * @apiParam (Request body) {String} height height
     * @apiParam (Request body) {String} weight weight
     * @apiParam (Request body) {String} length length
     * @apiParam (Request body) {String} width width
     * @apiParam (Request body) {String} tirePrices tirePrices
     * @apiParam (Request body) {String} pincodeBasedDelivery pincodeBasedDelivery
     * @apiParam (Request body) {String} productVarient productVarient
     * @apiParam (Request body) {String} productVarientOption productVarientOption
     * @apiParam (Request body) {Object} productVideo video
     * @apiParam (Request body) {String} productVideo.name video name
     * @apiParam (Request body) {String} productVideo.path for embedded have to pass path only
     * @apiParam (Request body) {Number} productVideo.type 1 -> video 2 -> embedded
     * @apiParamExample {json} Input
     * {
     *      "productName" : "",
     *      "productDescription" : "",
     *      "sku" : "",
     *      "image" : "",
     *      "metaTagTitle" : "",
     *      "metaTag" : "",
     *      "metaTagKeyword" : "",
     *      "categoryId" : "",
     *      "upc" : "",
     *      "hsn" : "",
     *      "price" : "",
     *      "packingCost" : "",
     *      "shippingCost" : "",
     *      "tax" : "",
     *      "taxType" : "",
     *      "others" : "",
     *      "outOfStockStatus" : "",
     *      "requiredShipping" : "",
     *      "dateAvailable" : "",
     *      "status" : "",
     *      "hasTirePrice" : "",
     *      "outOfStockStatus" : "",
     *      "sortOrder" : "",
     *      "quotationAvailable" : "",
     *      "pincodeBasedDelivery" : "",
     *      "productVarient" : [],
     *      "productVarientOption" : [{
     *      "id":""
     *      "varientName":""
     *      "price":"",
     *      "sku":"",
     *      "quantity":""
     *      "optionValue":[],
     *      "optionImage":[{
     *      "image":"",
     *      "containerName": "",
     *      "defaultImage": "",
     *       }]
     *       }],
     *      "tirePrices":[
     *      {
     *      "quantity":""
     *      "price":"",
     *      "skuName":""
     *      }
     *      ]
     *      "image":[
     *      {
     *      "image":""
     *      "containerName":""
     *      "defaultImage":""
     *      }
     *      ],
     *       "relatedProductId":[ "", ""],
     *      "productSpecial":[
     *      {
     *     "customerGroupId":""
     *     "specialPriority":""
     *     "skuName":""
     *     "specialPrice":""
     *     "specialDateStart":""
     *     "specialDateEnd":""
     *      }],
     *       "productDiscount":[
     *      {
     *         "discountPriority":""
     *         "discountPrice":""
     *         "skuName":""
     *         "discountDateStart":""
     *         "discountDateEnd"""
     *      }],
     *        "productAttribute":[{
     *            "attributeId":""
     *            "text":""
     *        }],
     *       "productVideo":{
     *               "name": "",
     *               "path": "",
     *               "type": ""
     *      }
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully updated product.",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/product/update-product/:id
     * @apiErrorExample {json} updateProduct error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/update-product/:id')
    @Authorized(['admin', 'edit-product'])
    public async updateProduct(@Body({ validate: true }) product: any, @Res() response: any): Promise<any> {

        const updateProduct: any = await this.productService.findOne({
            where: {
                productId: product.productId,
            },
        });
        if (!updateProduct) {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid product Id.',
            };
            return response.status(400).send(errorResponse);
        }
        const metaTagTitle = product.productSlug ? product.productSlug : product.productName;
        const data = metaTagTitle.replace(/\s+/g, '-').replace(/[&\/\\@#,+()$~%.'":*?<>{}]/g, '').toLowerCase();
        updateProduct.productSlug = await this.validate_slug(data, product.productId);
        updateProduct.name = product.productName;
        updateProduct.description = product.productDescription;
        updateProduct.sku = product.sku;
        updateProduct.upc = product.upc;
        updateProduct.hsn = product.hsn;
        updateProduct.quantity = product.quantity ? product.quantity : 1;
        updateProduct.quotationAvailable = product.quotationAvailable ? product.quotationAvailable : 0;

        //// special charges//////
        const serviceCharge: any = {};
        serviceCharge.productCost = product.price;
        serviceCharge.packingCost = product.packingCost ? product.packingCost : 0;
        serviceCharge.shippingCost = product.shippingCost ? product.shippingCost : 0;
        serviceCharge.tax = 0;
        serviceCharge.others = product.others ? product.others : 0;
        updateProduct.serviceCharges = JSON.stringify(serviceCharge);
        updateProduct.price = serviceCharge.productCost + serviceCharge.packingCost + serviceCharge.shippingCost + serviceCharge.others;
        updateProduct.taxType = product.taxType ? product.taxType : 0;
        updateProduct.taxValue = product.tax ? product.tax : 0;

        updateProduct.searchKeywords = await this.updateProductSearchItems(product);
        // saving sku //
        let saveSku;
        const findSku = await this.skuService.findOne({ where: { skuName: updateProduct.sku } });
        if (findSku) {
            const finddSku = await this.productService.findSkuName(product.productId, product.sku, 0);
            if (finddSku) {
                const errorResponse: any = {
                    status: 0,
                    message: 'Duplicate sku name.',
                };
                return response.status(400).send(errorResponse);
            } else {
                findSku.skuName = updateProduct.sku;
                findSku.price = updateProduct.price;
                findSku.quantity = product.quantity;
                findSku.isActive = product.status;
                saveSku = await this.skuService.create(findSku);
            }
        } else {
            const newSku: any = new Sku();
            newSku.skuName = updateProduct.sku;
            newSku.price = updateProduct.price;
            newSku.quantity = product.quantity;
            newSku.isActive = product.status;
            saveSku = await this.skuService.create(newSku);
        }
        // ending sku //
        updateProduct.skuId = saveSku.id;
        updateProduct.stockStatusId = product.outOfStockStatus ? product.outOfStockStatus : 0;
        updateProduct.shipping = product.requiredShipping;
        updateProduct.dateAvailable = moment(product.dateAvailable).toISOString();
        updateProduct.metaTagTitle = product.metaTagTitle ? product.metaTagTitle : product.productName;
        updateProduct.metaTagDescription = product.metaTagDescription;
        updateProduct.metaTagKeyword = product.metaTagKeyword;
        updateProduct.isActive = product.status;
        updateProduct.sortOrder = product.sortOrder ? product.sortOrder : 1;
        updateProduct.manufacturerId = product.manufacturerId ? product.manufacturerId : updateProduct.manufacturerId;
        updateProduct.height = product.height;
        updateProduct.weight = product.weight;
        updateProduct.length = product.length;
        updateProduct.width = product.width;
        updateProduct.hasTirePrice = product.hasTirePrice;
        updateProduct.pincodeBasedDelivery = product.pincodeBasedDelivery;
        updateProduct.productSizeColor = product.productSizeColor;
        updateProduct.colorsValueFilter = product.colorsValueFilter;
        updateProduct.promotionId = product.promotionId;
        updateProduct.promotionFlag = product.promotionFlag;
        updateProduct.promotionType = product.promotionType;
        updateProduct.promotionProductYid = product.promotionProductYid;
        updateProduct.promotionProductYSlug = product.promotionProductYSlug;
        updateProduct.promotionFreeProductPrice = product.promotionFreeProductPrice;
        updateProduct.productSellingPrice = product.productSellingPrice
        const taxValue:any = await this.taxService.findOne({where: {taxId:product.tax}})
            const productMrp:any = (Math.round(product.price+((product.price*taxValue.taxPercentage)/100)))
        if(productMrp==product.productSellingPrice){
            updateProduct.discount = 0
        }else{
            updateProduct.discount = Number(((productMrp-product.productSellingPrice)*100)/productMrp)
        }
        // adding category name and product name in keyword field for keyword search
        const rows: any = [];
        if (product.categoryId) {
            const category = product.categoryId;
            for (const categoryId of category) {
                const categoryNames: any = await this.categoryService.findOne({
                    where: {
                        categoryId,
                    },
                });
                const name = '~' + categoryNames.name + '~';
                rows.push(name);
            }
            rows.push('~' + product.productName + '~');
        }
        const values = rows.toString();
        updateProduct.keywords = values;
        updateProduct.inventorySync = product.inventorySync;
        const saveProduct = await this.productService.create(updateProduct);

        // delete previous category
        this.productToCategoryService.delete({ productId: saveProduct.productId });

        // save category
        if (product.categoryId) {
            const category = product.categoryId;
            for (const categoryId of category) {
                const newProductToCategory: any = new ProductToCategory();
                newProductToCategory.productId = saveProduct.productId;
                newProductToCategory.categoryId = categoryId;
                newProductToCategory.isActive = 1;
                this.productToCategoryService.create(newProductToCategory);
            }
        }

        const findProduct: any = await this.productRelatedService.findOne({
            where: {
                productId: saveProduct.productId,
            },
        });

        if (findProduct) {

            // delete previous related product
            this.productRelatedService.delete({ productId: saveProduct.productId });

            // update related product
            if (product.relatedProductId) {
                const relatedProduct: any = product.relatedProductId;
                for (const relatedproduct of relatedProduct) {
                    const newRelatedProduct: any = new ProductRelated();
                    newRelatedProduct.productId = saveProduct.productId;
                    newRelatedProduct.relatedProductId = relatedproduct;
                    await this.productRelatedService.create(newRelatedProduct);
                }
            }
        } else {

            // update related product
            if (product.relatedProductId) {
                const relatedProduct: any = product.relatedProductId;
                for (const relatedproduct of relatedProduct) {
                    const newRelatedProduct: any = new ProductRelated();
                    newRelatedProduct.productId = saveProduct.productId;
                    newRelatedProduct.relatedProductId = relatedproduct;
                    await this.productRelatedService.create(newRelatedProduct);
                }
            }

        }

        // Delete previous images
        this.productImageService.delete({ productId: saveProduct.productId });
        // Save products Image
        if (product.image) {
            const productImage: any = product.image;
            for (const imageRow of productImage) {
                const imageData = JSON.stringify(imageRow);
                const imageResult = JSON.parse(imageData);
                const newProductImage = new ProductImage();
                newProductImage.productId = saveProduct.productId;
                newProductImage.image = imageResult.image;
                newProductImage.containerName = imageResult.containerName;
                newProductImage.defaultImage = imageResult.defaultImage;
                await this.productImageService.create(newProductImage);
            }
        }

        // update product Varient
        const varients = product.productVarient;
        if (varients.length > 0) {
            await this.productVarientService.delete({ productId: saveProduct.productId });
            const productVarient: any = [];
            for (const varient of varients) {
                const newProductVarient: any = new ProductVarient();
                newProductVarient.productId = saveProduct.productId;
                newProductVarient.varientsId = varient;
                newProductVarient.isActive = 1;
                productVarient.push(newProductVarient);
            }
            await this.productVarientService.create(productVarient);
        }

        // update product Varient option
        const varientOptions = product.productVarientOption;
        let totalQty = 0;
        if (varientOptions.length > 0) {
            for (const varientOption of varientOptions) {
                if (varientOption.id) {
                    const pdtVarientOption = await this.productVarientOptionService.findOne({ where: { id: varientOption.id } });
                    if (pdtVarientOption) {
                        const sku = await this.skuService.findOne({ where: { id: pdtVarientOption.skuId } });
                        if (sku) {
                            sku.skuName = varientOption.sku;
                            sku.price = varientOption.price;
                            sku.quantity = varientOption.quantity ? varientOption.quantity : 1;
                            totalQty += +sku.quantity;
                            sku.isActive = varientOption.isActive;
                            await this.skuService.create(sku);
                        }
                        pdtVarientOption.isActive = varientOption.isActive;
                        await this.productVarientOptionService.create(pdtVarientOption);
                        if (varientOption.optionImage) {
                            await this.productVarientOptionImageService.delete({ productVarientOptionId: varientOption.id });
                            const varientOptionsImages = varientOption.optionImage;
                            const image: any = [];
                            for (const varientOptionsImage of varientOptionsImages) {
                                const newProductVarientOptionImage: any = new ProductVarientOptionImage();
                                newProductVarientOptionImage.productVarientOptionId = varientOption.id;
                                newProductVarientOptionImage.image = varientOptionsImage.image;
                                newProductVarientOptionImage.containerName = varientOptionsImage.containerName;
                                newProductVarientOptionImage.defaultImage = varientOptionsImage.defaultImage;
                                image.push(newProductVarientOptionImage);
                            }
                            await this.productVarientOptionImageService.create(image);
                        }

                    } else {
                        const errorResponse: any = {
                            status: 0,
                            message: 'Invalid product Varient Option Id.',
                        };
                        return response.status(400).send(errorResponse);
                    }
                } else {
                    const newSkus: any = new Sku();
                    const find = await this.skuService.findOne({ where: { skuName: varientOption.sku } });
                    if (find) {
                        const errorResponse: any = {
                            status: 0,
                            message: 'Duplicate sku name, give some other name for varient',
                        };
                        return response.status(400).send(errorResponse);
                    }
                    newSkus.skuName = varientOption.sku;
                    newSkus.price = varientOption.price;
                    newSkus.quantity = varientOption.quantity ? varientOption.quantity : 1;
                    totalQty += +newSkus.quantity;
                    newSkus.isActive = varientOption.isActive;
                    const saveSkus = await this.skuService.create(newSkus);
                    const newProductVarientOption: any = new ProductVarientOption();
                    newProductVarientOption.productId = saveProduct.productId;
                    newProductVarientOption.skuId = saveSkus.id;
                    newProductVarientOption.varientName = varientOption.varientName;
                    newProductVarientOption.isActive = varientOption.isActive;
                    const val = await this.productVarientOptionService.create(newProductVarientOption);
                    const varientOptionsValues = varientOption.optionValue;
                    const varientValue: any = [];
                    for (const varientOptionsValue of varientOptionsValues) {
                        const newProductVarientOptionDetail: any = new ProductVarientOptionDetail();
                        newProductVarientOptionDetail.productVarientOptionId = val.id;
                        newProductVarientOptionDetail.varientsValueId = varientOptionsValue;
                        varientValue.push(newProductVarientOptionDetail);
                    }
                    await this.productVarientOptionDetailService.create(varientValue);
                    const varientOptionsImages = varientOption.optionImage;
                    const image: any = [];
                    for (const varientOptionsImage of varientOptionsImages) {
                        const newProductVarientOptionImage: any = new ProductVarientOptionImage();
                        newProductVarientOptionImage.productVarientOptionId = val.id;
                        newProductVarientOptionImage.image = varientOptionsImage.image;
                        newProductVarientOptionImage.containerName = varientOptionsImage.containerName;
                        newProductVarientOptionImage.defaultImage = varientOptionsImage.defaultImage;
                        image.push(newProductVarientOptionImage);
                    }
                    await this.productVarientOptionImageService.create(image);
                }
            }
        }

        // Product Discount
        if (product.productDiscount) {
            // Delete the product discount
            this.productDiscountService.delete({ productId: saveProduct.productId });
            const productDiscount: any = product.productDiscount;
            const distArr: any = [];
            for (const discount of productDiscount) {
                const discountData: any = new ProductDiscount();
                discountData.productId = saveProduct.productId;
                discountData.quantity = 1;
                if (saveProduct.price <= discount.discountPrice) {
                    const errorResponse: any = {
                        status: 0,
                        message: 'discount price should be less than original price.',
                    };
                    return response.status(400).send(errorResponse);
                }
                const skuValue: any = await this.skuService.findOne({
                    where: {
                        skuName: discount.skuName,
                    },
                });
                if (skuValue) {
                    const value: any = await this.productService.findOne({
                        where: {
                            skuId: skuValue.id,
                            productId: saveProduct.productId,
                        },
                    });
                    const varientSku: any = await this.productVarientOptionService.findOne({
                        where: {
                            skuId: skuValue.id,
                            productId: saveProduct.productId,
                        },
                    });
                    if (value) {
                        discountData.skuId = skuValue.id;
                    } else if (varientSku) {
                        discountData.skuId = skuValue.id;
                    } else {
                        const errorResponse: any = {
                            status: 0,
                            message: 'Invalid sku for this product.',
                        };
                        return response.status(400).send(errorResponse);
                    }
                } else {
                    const errorResponse: any = {
                        status: 0,
                        message: 'Sku does not exist in discount price.',
                    };
                    return response.status(400).send(errorResponse);
                }
                discountData.priority = discount.discountPriority;
                discountData.price = discount.discountPrice;
                discountData.dateStart = moment(discount.discountDateStart).toISOString();
                discountData.dateEnd = moment(discount.discountDateEnd).toISOString();
                distArr.push(discountData);
            }
            await this.productDiscountService.create(distArr);
        }

        // Product Special
        if (product.productSpecial) {
            this.productSpecialService.delete({ productId: saveProduct.productId });
            const productSpecial: any = product.productSpecial;
            const splArr: any = [];
            for (const special of productSpecial) {
                const specialPriceData: any = new ProductSpecial();
                specialPriceData.productId = saveProduct.productId;
                if (saveProduct.price <= special.specialPrice) {
                    const errorResponse: any = {
                        status: 0,
                        message: 'special price should be less than original price.',
                    };
                    return response.status(400).send(errorResponse);
                }
                specialPriceData.customerGroupId = special.customerGroupId;
                const specialSkuValue: any = await this.skuService.findOne({
                    where: {
                        skuName: special.skuName,
                    },
                });
                if (specialSkuValue) {
                    const value: any = await this.productService.findOne({
                        where: {
                            skuId: specialSkuValue.id,
                            productId: saveProduct.productId,
                        },
                    });
                    const varientSku: any = await this.productVarientOptionService.findOne({
                        where: {
                            skuId: specialSkuValue.id,
                            productId: saveProduct.productId,
                        },
                    });
                    if (value) {
                        specialPriceData.skuId = specialSkuValue.id;
                    } else if (varientSku) {
                        specialPriceData.skuId = specialSkuValue.id;
                    } else {
                        const errorResponse: any = {
                            status: 0,
                            message: 'Invalid sku for this product',
                        };
                        return response.status(400).send(errorResponse);
                    }
                } else {
                    const errorResponse: any = {
                        status: 0,
                        message: 'Sku does not exist in special price',
                    };
                    return response.status(400).send(errorResponse);
                }
                specialPriceData.priority = special.specialPriority;
                specialPriceData.price = special.specialPrice;
                specialPriceData.dateStart = moment(special.specialDateStart).toISOString();
                specialPriceData.dateEnd = moment(special.specialDateEnd).toISOString();
                splArr.push(specialPriceData);
            }
            await this.productSpecialService.create(splArr);
        }

        // Product tire price
        if (product.tirePrices) {
            await this.productTirePriceService.delete({ productId: saveProduct.productId });
            const tirePrice: any = product.tirePrices;
            const tireArr: any = [];
            for (const tire of tirePrice) {
                const productTirePrice: any = new ProductTirePrice();
                productTirePrice.productId = saveProduct.productId;
                const tireSkuValue: any = await this.skuService.findOne({
                    where: {
                        skuName: tire.skuName,
                    },
                });
                if (tireSkuValue) {
                    const value: any = await this.productService.findOne({
                        where: {
                            skuId: tireSkuValue.id,
                            productId: saveProduct.productId,
                        },
                    });
                    const varientSku: any = await this.productVarientOptionService.findOne({
                        where: {
                            skuId: tireSkuValue.id,
                            productId: saveProduct.productId,
                        },
                    });
                    if (value) {
                        productTirePrice.skuId = tireSkuValue.id;
                    } else if (varientSku) {
                        productTirePrice.skuId = tireSkuValue.id;
                    } else {
                        const errorResponse: any = {
                            status: 0,
                            message: 'Invalid sku for this product',
                        };
                        return response.status(400).send(errorResponse);
                    }
                } else {
                    const errorResponse: any = {
                        status: 0,
                        message: 'Sku does not exist tire price',
                    };
                    return response.status(400).send(errorResponse);
                }
                productTirePrice.quantity = tire.quantity;
                productTirePrice.price = tire.price;
                tireArr.push(productTirePrice);
            }
            await this.productTirePriceService.create(tireArr);
        }

        // update product Video
        const video = product.productVideo;
        if (video) {
            await this.productVideoService.delete({ productId: saveProduct.productId });
            const newProductVideo: any = new ProductVideo();
            newProductVideo.productId = saveProduct.productId;
            newProductVideo.name = video.name;
            newProductVideo.type = video.type;
            newProductVideo.path = video.path;
            await this.productVideoService.create(newProductVideo);
        }

        const varientSimplified = product.productVarient;
        if (varientSimplified.length > 0) {
            saveProduct.isSimplified = 0;
            saveProduct.quantity = totalQty;
            const sku = await this.skuService.findOne({ where: { id: saveProduct.skuId } });
            sku.quantity = totalQty;
            await this.skuService.create(sku);
        } else {
            saveProduct.isSimplified = 1;
        }
        await this.productService.create(saveProduct);

        if (saveProduct) {
            const successResponse: any = {
                status: 1,
                message: 'Successfully updated the Product.',
            };
            
            return response.status(200).send(successResponse);
        } else {
            const errorResponse: any = {
                status: 0,
                message: 'Unable to update the Product.',
            };
            return response.status(400).send(errorResponse);
        }
    }

    // Product Detail API
    /**
     * @api {get} /api/product/product-detail/:id Product Detail API
     * @apiGroup Product
     * @apiHeader {String} Authorization
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "status": "1"
     *      "message": "Successfully get product Detail",
     *      "data":"{}"
     * }
     * @apiSampleRequest /api/product/product-detail/:id
     * @apiErrorExample {json} productDetail error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/product-detail/:id')
    // @Authorized(['admin', 'view-product'])
    public async productDetail(@Param('id') id: number, @Res() response: any): Promise<any> {
        const productDetail: any = await this.productService.findOne({
            where: { productId: id },
        });
        const productDetails: any = classToPlain(productDetail);
        productDetails.quotationAvailable = productDetail.quotationAvailable;
        const serviceCharges = productDetails.serviceCharges;
        if (serviceCharges) {
            const specialCharge = JSON.parse(productDetails.serviceCharges);
            productDetails.productCost = specialCharge.productCost;
            productDetails.packingCost = specialCharge.packingCost;
            productDetails.shippingCost = specialCharge.shippingCost;
            productDetails.others = specialCharge.others;
        }
        if (productDetails.taxType === 2) {
            const tax = await this.taxService.findOne({ taxId: productDetails.taxValue });
            let percentToAmount;
            if (tax) {
                percentToAmount = productDetails.price * (tax.taxPercentage / 100);
            } else {
                percentToAmount = 0;
            }
            const val = +productDetails.price + percentToAmount;
            productDetails.priceWithTax = val;
        } else {
            const taxValue = (productDetails.taxValue && productDetails.taxValue > 0) ? productDetails.taxValue : 0;
            const val = +productDetails.price + taxValue;
            productDetails.priceWithTax = val;
        }
        const productSku = await this.skuService.findOne({ id: productDetails.skuId });
        productDetails.quantity = productSku ? productSku.quantity : productDetails.quantity;
        productDetails.productImage = await this.productImageService.findAll({
            select: ['productId', 'image', 'containerName', 'defaultImage'],
            where: {
                productId: productDetail.productId,
            },
        });
        productDetails.Category = await this.productToCategoryService.findAll({
            select: ['categoryId', 'productId'],
            where: { productId: productDetail.productId },
        }).then((val) => {
            const category = val.map(async (value: any) => {
                const categoryValue = await this.categoryService.findOne({ where: { categoryId: value.categoryId } });
                if (categoryValue) {

                    const categoryLevel = await this.categoryPathService.findCategoryLevel(categoryValue.categorySlug);
                    categoryValue.levels = categoryLevel.levels;
                    const temp: any = categoryValue;
                    return temp;
                } else {
                    return null;
                }
            });
            const results = Promise.all(category);
            return results;
        });
        productDetails.relatedProductDetail = await this.productRelatedService.findAll({
            where: { productId: productDetail.productId }, order: {
                id: 'ASC',
            },
        }).then((val) => {
            const relatedProduct = val.map(async (value: any) => {
                const productId = value.relatedProductId;
                const product = await this.productService.findOne({
                    select: ['productId', 'name', 'sku'],
                    where: { productId },
                    relations: ['productImage'],
                });
                return classToPlain(product);
            });
            const resultData = Promise.all(relatedProduct);
            return resultData;
        });
        productDetails.productSpecialPrice = await this.productSpecialService.findAll({
            select: ['productSpecialId', 'priority', 'price', 'dateStart', 'dateEnd', 'skuId'],
            where: { productId: productDetail.productId },
        }).then((val) => {
            const special = val.map(async (value: any) => {
                const skuNames = await this.skuService.findOne({ id: value.skuId });
                const temp: any = value;
                if (skuNames !== undefined) {
                    temp.skuName = skuNames.skuName;
                } else {
                    temp.skuName = '';
                }
                return temp;
            });
            const results = Promise.all(special);
            return results;
        });
        productDetails.productDiscountData = await this.productDiscountService.findAll({
            select: ['productDiscountId', 'quantity', 'priority', 'price', 'dateStart', 'dateEnd', 'skuId'],
            where: { productId: productDetail.productId },
        }).then((val) => {
            const discount = val.map(async (value: any) => {
                const discountSkuNames = await this.skuService.findOne({ id: value.skuId });
                const temp: any = value;
                if (discountSkuNames !== undefined) {
                    temp.skuName = discountSkuNames.skuName;
                } else {
                    temp.skuName = '';
                }
                return temp;
            });
            const results = Promise.all(discount);
            return results;
        });
        productDetails.productTirePrices = await this.productTirePriceService.findAll({
            select: ['id', 'quantity', 'price', 'skuId'],
            where: { productId: productDetail.productId },
        }).then((val) => {
            const tirePrice = val.map(async (value: any) => {
                const tireSkuNames = await this.skuService.findOne({ id: value.skuId });
                const temp: any = value;
                if (tireSkuNames !== undefined) {
                    temp.skuName = tireSkuNames.skuName;
                } else {
                    temp.skuName = '';
                }
                return temp;
            });
            const results = Promise.all(tirePrice);
            return results;
        });
        productDetails.productVideo = await this.productVideoService.findOne({
            select: ['id', 'name', 'path', 'type', 'productId'],
            where: { productId: productDetail.productId },
        });

        productDetails.questionList = await this.productQuestionService.findAll({
            select: ['questionId', 'productId', 'question', 'type', 'referenceId', 'createdDate'],
            where: { productId: productDetail.productId },
        }).then((val) => {
            const user = val.map(async (value: any) => {
                const referenceId = value.referenceId;
                const type = value.type;
                const temp: any = value;
                if (type && type === 2) {
                    const customer = await this.customerService.findOne({
                        select: ['id', 'firstName', 'avatar', 'avatarPath', 'city'],
                        where: { id: referenceId },
                    });
                    if (customer !== undefined) {
                        temp.customerDetail = customer;
                    }
                } else {
                    const adminUser = await this.userService.findOne({
                        select: ['userId', 'firstName', 'avatar', 'avatarPath'],
                        where: { userId: referenceId },
                    });
                    if (adminUser !== undefined) {
                        temp.adminuserDetail = adminUser;
                    }
                }
                return temp;
            });
            const resultData = Promise.all(user);
            return resultData;
        });
        productDetails.productVarient = await this.productVarientService.findAll({
            select: ['id', 'varientsId', 'productId'],
            where: { productId: productDetail.productId },
        });
        productDetails.productvarientList = await this.productVarientOptionService.findAll({
            select: ['id', 'productId', 'skuId', 'varientName', 'isActive', 'createdDate'],
            where: { productId: productDetail.productId },
        }).then((val) => {
            const productVarList = val.map(async (value: any) => {
                const temp: any = value;
                const sku = await this.skuService.findOne({
                    select: ['id', 'skuName', 'price', 'isActive', 'quantity'],
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
                        const tempValue: any = vv;
                        const varientValueData = await this.varientsValueService.findOneData({
                            select: ['id', 'valueName'],
                            where: { id: vv.varientsValueId },
                        });
                        tempValue.valueName = (varientValueData !== undefined) ? varientValueData.valueName : '';
                        return tempValue;
                    });
                    const rslt = Promise.all(varientValueList);
                    return rslt;
                });
                temp.skuName = sku.skuName;
                temp.price = sku.price;
                temp.quantity = sku.quantity;
                temp.optionImage = image;
                temp.productVarientOption = productVarientOption;
                return temp;
            });
            const resultData = Promise.all(productVarList);
            return resultData;
        });
        var imageoutput = await this.productImageService.listProductImage(id);
        if(imageoutput && imageoutput.length>0){
        productDetails.image = imageoutput[0].image;
        }
        
        const successResponse: any = {
            status: 1,
            message: 'Successfully get productDetail',
            data: productDetails,
        };
        return response.status(200).send(successResponse);
    }

    //  Top Selling Product List API
    /**
     * @api {get} /api/product/top-selling-productlist  Top selling ProductList API
     * @apiGroup Product
     * @apiHeader {String} Authorization
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get top selling product..!!",
     *      "status": "1",
     *      "data": {},
     * }
     * @apiSampleRequest /api/product/top-selling-productlist
     * @apiErrorExample {json} top selling product error
     * HTTP/1.1 500 Internal Server Error
     */
    // Order Detail Function
    @Get('/top-selling-productlist')
    @Authorized()
    public async topSellingProductList(@Req() request: any, @Res() response: any): Promise<any> {
        const select = [
            'COUNT(OrderProduct.orderId) as ordercount',
            'OrderProduct.skuName as skuName',
            'OrderProduct.varientName as varientName',
            'productInformationDetail.productId as productId',
            'productInformationDetail.price as price',
            'productInformationDetail.name as name',
            'productInformationDetail.description as description',
            'productInformationDetail.productSlug as productSlug',
            '(SELECT pi.image as image FROM product_image pi WHERE pi.product_id = productInformationDetail.productId AND pi.default_image = 1 LIMIT 1) as image',
            '(SELECT pi.container_name as containerName FROM product_image pi WHERE pi.product_id = productInformationDetail.productId AND pi.default_image = 1 LIMIT 1) as containerName',
            '(SELECT pi.default_image as defaultImage FROM product_image pi WHERE pi.product_id = productInformationDetail.productId AND pi.default_image = 1 LIMIT 1) as defaultImage',
            '(SELECT COUNT(pr.rating) as ratingCount FROM product_rating pr WHERE pr.product_id = productInformationDetail.productId) as ratingCount',
            '(SELECT COUNT(pr.review) as reviewCount FROM product_rating pr WHERE pr.product_id = productInformationDetail.productId AND pr.review IS NOT NULL) as reviewCount',
        ];
        const relations = [
            {
                tableName: 'OrderProduct.productInformationDetail',
                aliasName: 'productInformationDetail',
            },
            {
                tableName: 'OrderProduct.product',
                aliasName: 'product',
            },
        ];
        const sort = [
            {
                name: 'ordercount',
                order: 'DESC',
            },
        ];
        const groupBy = [
            {
                name: 'productInformationDetail.productId',
            },
        ];
        const productTopsellingList = await this.orderProductService.listByQueryBuilder(4, 0, select, [], [], relations, groupBy, sort, false, true);
        const successResponse: any = {
            status: 1,
            message: 'Successfully get Top Selling Product..!',
            data: productTopsellingList,
        };
        return response.status(200).send(successResponse);
    }
    //  Top Five Repeatedly Purchased Customer List API
    /**
     * @api {get} /api/product/top-five-repeatedly-purchased-customers  Top Five Repeatedly Purchased Customer List API
     * @apiGroup Product
     * @apiHeader {String} Authorization
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get top 5 repeatedly purchased customer list!!",
     *      "status": "1",
     *      "data": {},
     * }
     * @apiSampleRequest /api/product/top-five-repeatedly-purchased-customers
     * @apiErrorExample {json} top five repeatedly purchased customer list error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/top-five-repeatedly-purchased-customers')
    @Authorized()
    public async topFiveRepeatedlyPurchasedCustomers(@Req() request: any, @Res() response: any): Promise<any> {
        const limit = 5;
        const select = [
            'MAX(Order.customerId) as customerId',
            'customer.firstName as firstName',
            'customer.lastName as lastName',
            'customer.avatar as avatar',
            'customer.avatarPath as avatarPath',
            '(SELECT ca.city as paymentCity FROM address ca WHERE ca.customer_id = MAX(Order.customerId) LIMIT 1) as paymentCity',
            'COUNT(Order.orderId) as orderCount',
        ];
        const relations = [{
            tableName: 'Order.customer',
            aliasName: 'customer',
        }];
        const whereConditions = [{
            name: 'Order.paymentFlag',
            op: 'and',
            value: 1,
        },
        {
            name: 'Order.paymentStatus',
            op: 'and',
            value: 1,
        },
        {
            name: 'customer.deleteFlag',
            op: 'and',
            value: 0,
        }];
        const sort = [{
            name: 'orderCount',
            order: 'DESC',
        }];
        const groupBy = [{
            name: 'Order.customerId',
        }];
        const topFiveRepeatedlyPurchasedCustomer = await this.orderService.listByQueryBuilder(limit, 0, select, whereConditions, [], relations, groupBy, sort, false, true);
        if (topFiveRepeatedlyPurchasedCustomer) {
            return response.status(200).send({
                status: 1,
                message: 'Successfully got the top 5 repeatedly purchased customer..!',
                data: topFiveRepeatedlyPurchasedCustomer,
            });
        }
    }

    //  Top Performing Product List API
    /**
     * @api {get} /api/product/top-performing-products  Top Performing Product List API
     * @apiGroup Product
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} limit limit
     * @apiParam (Request body) {Number} offset offset
     * @apiParam (Request body) {Number} count count in number or boolean
     * @apiParam (Request body) {Number} duration 1-> today 2-> this week 3-> this month 4-> this year
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get top performing product list!!",
     *      "status": "1",
     *      "data": {},
     * }
     * @apiSampleRequest /api/product/top-performing-products
     * @apiErrorExample {json} top performing product list error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/top-performing-products')
    @Authorized()
    public async topPerformingProucts(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('count') count: number | boolean, @QueryParam('duration') duration: number, @Req() request: any, @Res() response: any): Promise<any> {
        const topPerformingProducts = await this.orderProductService.topPerformingProducts(limit, offset, count, duration);
        if (topPerformingProducts !== '' && topPerformingProducts !== undefined) {
            return response.status(200).send({
                status: 1,
                message: 'Successfully got the top performing product list',
                data: topPerformingProducts,
            });
        } else {
            return response.status(400).send({
                status: 0,
                message: 'Cannot get top performing product list',
            });
        }
    }
    // Dashboard Customer Count API
    /**
     * @api {get} /api/product/dashboard/admin-customers-count Dashboard Customer Count API
     * @apiGroup Product
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} duration 1-> today 2-> this week 3-> this month 4-> this year
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get dashboard customers count",
     *      "status": "1",
     *      "data": {},
     * }
     * @apiSampleRequest /api/product/dashboard/admin-customers-count
     * @apiErrorExample {json} dashboard customers count list error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/dashboard/admin-customers-count')
    @Authorized()
    public async dashboardCustomerCount(@QueryParam('duration') duration: number, @Req() request: any, @Res() response: any): Promise<any> {
        const customerCount = await this.customerService.dashboardCustomerCount(duration);
        if (customerCount !== '' && customerCount !== undefined) {
            return response.status(200).send({
                status: 1,
                message: 'Successfully got dashboard customers count',
                data: customerCount,
            });
        }
    }
    // Dashboard Orders Count API
    /**
     * @api {get} /api/product/dashboard-admin/orders-count Dashboard Orders Count API
     * @apiGroup Product
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} duration 1-> today 2-> this week 3-> this month 4-> this year
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get dashboard orders and vendor count based on orders",
     *      "status": "1",
     *      "data": {},
     * }
     * @apiSampleRequest /api/product/dashboard-admin/orders-count
     * @apiErrorExample {json} dashboard orders count list error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/dashboard-admin/orders-count')
    @Authorized()
    public async dashboardOrderCount(@QueryParam('duration') duration: number, @Req() request: any, @Res() response: any): Promise<any> {
        const countOfOrdersAndVendors = await this.orderService.dashboardOrdersCount(duration);
        const count: any = {};
        count.ordersCount = countOfOrdersAndVendors.ordersCount ? countOfOrdersAndVendors.ordersCount : 0;
        return response.status(200).send({
            status: 1,
            message: 'Successfully got dashboard orders and vendors count based on orders',
            data: count,
        });
    }
    // Dashboard Average Order Value API
    /**
     * @api {get} /api/product/dashboard-average-order-value Dashboard Average Order Value API
     * @apiGroup Product
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} duration 1-> today 2-> this week 3-> this month 4-> this year
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get average order value",
     *      "status": "1",
     *      "data": {},
     * }
     * @apiSampleRequest /api/product/dashboard-average-order-value
     * @apiErrorExample {json} average order value error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/dashboard-average-order-value')
    @Authorized()
    public async averageOrderValue(@QueryParam('duration') duration: number, @Req() request: any, @Res() response: any): Promise<any> {
        const orderproductstotal = await this.orderProductService.dashboardOrderProductsTotal(duration);
        const orderProductsTotal = orderproductstotal.orderProductsTotal ? orderproductstotal.orderProductsTotal : 0;
        const totalCount = +orderproductstotal.ordersCount;
        const averageOrderValue = totalCount !== 0 ? (+orderProductsTotal) / +totalCount : 0;
        return response.status(200).send({
            status: 0,
            message: 'Successfully got the average order value',
            data: averageOrderValue.toFixed(2),
        });
    }
    // Dashboard Get Total Revenue API
    /**
     * @api {get} /api/product/dashboard-total-revenue Dashboard Get Total Revenue API
     * @apiGroup Product
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} duration 1-> today 2-> this week 3-> this month 4-> this year
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get total revenue amount",
     *      "status": "1",
     *      "data": {},
     * }
     * @apiSampleRequest /api/product/dashboard-total-revenue
     * @apiErrorExample {json} total revenue error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/dashboard-total-revenue-bk')
    @Authorized()
    public async dashboardTotalRevenue_bk(@QueryParam('duration') duration: number, @Req() request: any, @Res() response: any): Promise<any> {
        const orderProductsTotal = await this.orderProductService.dashboardOrderProductsTotal(duration);
        const orderproductsTotal = orderProductsTotal.orderProductsTotal ? orderProductsTotal.orderProductsTotal : 0;
        const totalRevenue = +orderproductsTotal;
        return response.status(200).send({
            status: 0,
            message: 'Successfully got the total revenue amount',
            data: totalRevenue,
        });
    }

    @Get('/dashboard-total-revenue')
    @Authorized()
    public async dashboardTotalRevenue(@QueryParam('duration') duration: number, @Req() request: any, @Res() response: any): Promise<any> {


        const paytmquery: any = getManager().getRepository(Order).createQueryBuilder('order');
        paytmquery.select(['ROUND(SUM(pr.totalRefundAmount), 2) as refundTotal']);
        paytmquery.innerJoin(PaytmRefunds, "pr", "order.order_prefix_id = pr.orderPrefixId")
        paytmquery.where('order.payment_process = :process', { process: 1 })
        paytmquery.andWhere('order.payment_type = :pg', { pg: "paytm" })
        paytmquery.andWhere('pr.resultCode = :code', { code: "10" })
        if (duration === 1 && duration) {
            paytmquery.andWhere('DATE(order.created_date) = DATE(NOW())');
        } else if (duration === 2 && duration) {
            paytmquery.andWhere('WEEK(order.created_date) = WEEK(NOW()) AND MONTH(order.created_date) = MONTH(NOW()) AND YEAR(order.created_date) = YEAR(NOW())');
        } else if (duration === 3 && duration) {
            paytmquery.andWhere('MONTH(order.created_date) = MONTH(NOW()) AND YEAR(order.created_date) = YEAR(NOW())');
        } else if (duration === 4 && duration) {
            paytmquery.andWhere('YEAR(order.created_date) = YEAR(NOW())');
        }
        const paytmResult = await paytmquery.getRawOne();
        let paytmRefundTotal = paytmResult.refundTotal;


        paytmRefundTotal = paytmRefundTotal ? paytmRefundTotal : 0
        const ingenicoquery: any = getManager().getRepository(Order).createQueryBuilder('order');
        ingenicoquery.select(['ROUND(SUM(pr.refundAmount), 2) as refundTotal']);
        ingenicoquery.innerJoin(IngenicoRefunds, "pr", "order.order_prefix_id = pr.merchantTransactionIdentifier")
        ingenicoquery.where('order.payment_process = :process', { process: 1 })
        ingenicoquery.andWhere('order.payment_type = :pg', { pg: "ingenico" })
        ingenicoquery.andWhere('pr.statusCode = :code', { code: "0300" })
        if (duration === 1 && duration) {
            ingenicoquery.andWhere('DATE(order.created_date) = DATE(NOW())');
        } else if (duration === 2 && duration) {
            ingenicoquery.andWhere('WEEK(order.created_date) = WEEK(NOW()) AND MONTH(order.created_date) = MONTH(NOW()) AND YEAR(order.created_date) = YEAR(NOW())');
        } else if (duration === 3 && duration) {
            ingenicoquery.andWhere('MONTH(order.created_date) = MONTH(NOW()) AND YEAR(order.created_date) = YEAR(NOW())');
        } else if (duration === 4 && duration) {
            ingenicoquery.andWhere('YEAR(order.created_date) = YEAR(NOW())');
        }
        const ingenicoResult = await ingenicoquery.getRawOne();
        let ingenicoRefundTotal = ingenicoResult.refundTotal;


        ingenicoRefundTotal = ingenicoRefundTotal ? ingenicoRefundTotal : 0
        const query: any = getManager().getRepository(Order).createQueryBuilder();
        query.select(['ROUND((SUM(total)), 2) as totalRevenue']);
        query.where('payment_process = :process', { process: 1 });
        if (duration === 1 && duration) {
            query.andWhere('DATE(created_date) = DATE(NOW())');
        } else if (duration === 2 && duration) {
            query.andWhere('WEEK(created_date) = WEEK(NOW()) AND MONTH(created_date) = MONTH(NOW()) AND YEAR(created_date) = YEAR(NOW())');
        } else if (duration === 3 && duration) {
            query.andWhere('MONTH(created_date) = MONTH(NOW()) AND YEAR(created_date) = YEAR(NOW())');
        } else if (duration === 4 && duration) {
            query.andWhere('YEAR(created_date) = YEAR(NOW())');
        }
        const ordersTotal = await query.getRawOne();

        const totalRevenue = ordersTotal.totalRevenue ? ordersTotal.totalRevenue : 0

        const finalCalc = totalRevenue - (paytmRefundTotal + ingenicoRefundTotal);
        return response.status(200).send({
            status: 0,
            message: 'Successfully got the total revenue amount',
            data: finalCalc,
        });
    }
    // Dashboard Average Conversion Ratio API
    /**
     * @api {get} /api/product/dashboard-average-conversion-ratio Dashboard Average Conversion Ratio API
     * @apiGroup Product
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} duration 1-> today 2-> this week 3-> this month 4-> this year
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get average conversion ratio",
     *      "status": "1",
     *      "data": {},
     * }
     * @apiSampleRequest /api/product/dashboard-average-conversion-ratio
     * @apiErrorExample {json} average conversion ratio error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/dashboard-average-conversion-ratio')
    @Authorized()
    public async averageConversionRatio(@QueryParam('duration') duration: number, @Req() request: any, @Res() response: any): Promise<any> {
        const orderscount = await this.orderService.ordersCount(duration);
        const customerscount = await this.customerService.dashboardCustomerCount(duration);
        const averageConversionRatio = +customerscount !== 0 ? (+orderscount / +customerscount * 100) : 0;
        return response.status(200).send({
            status: 1,
            message: 'Successfully got average conversion ratio',
            data: averageConversionRatio.toFixed(2),
        });
    }
    // Dashboard Graph Weekly Sales List API
    /**
     * @api {get} /api/product/dashboard/graph-weekly-saleslist Dashboard Graph Weekly Sales List API
     * @apiGroup Product
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} productId
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get top ten weekly sales list",
     *      "status": "1",
     *      "data": {},
     * }
     * @apiSampleRequest /api/product/dashboard/graph-weekly-saleslist
     * @apiErrorExample {json} dashboard graph weekly sales list error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/dashboard/graph-weekly-saleslist')
    @Authorized()
    public async topTenWeeklySales(@QueryParam('productId') productId: string, @Req() request: any, @Res() response: any): Promise<any> {
        const productids = productId.split(',');
        if (!(productids.length <= 3)) {
            return response.status(400).send({
                status: 0,
                message: 'length of productId should be less than or equal to three',
            });
        }
        const orderProductData = await this.productService.findProducts(productids);
        const list = orderProductData.map(async (result: any) => {
            const data: any = await this.orderProductService.topTenWeeklySalesList(result.productId);
            const temp: any = result;
            const weekOfdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const finaldata = [];
            for (const day of weekOfdays) {
                const salesFilter = data.filter((val) => {
                    return val.days === day;
                });
                if (salesFilter.length === 0) {
                    finaldata.push({ value: 0, days: day });
                } else {
                    finaldata.push(salesFilter[0]);
                }
            }
            temp.value = finaldata;
            return temp;
        });
        const weeklysaleslist = await Promise.all(list);
        return response.status(200).send({
            status: 1,
            message: 'Successfully got the top ten weekly sales list',
            data: weeklysaleslist,
        });
    }
    // Recent Selling Product List
    /**
     * @api {get} /api/product/recent-selling-product  Recent Selling Product List API
     * @apiGroup Product
     * @apiHeader {String} Authorization
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "successfully listed recent product selling!",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/product/recent-selling-product
     * @apiErrorExample {json} Selling Product List error
     * HTTP/1.1 500 Internal Server Errorproduct
     */
    // Recent selling product function
    @Get('/recent-selling-product')
    @Authorized()
    public async sellingProduct(@Req() request: any, @Res() response: any): Promise<any> {
        const limit = 3;
        const select = [
            'DISTINCT(OrderProduct.productId) as productId',
            'OrderProduct.orderId as orderId',
            'OrderProduct.name as ProductName',
            'OrderProduct.quantity as Quantity',
            'OrderProduct.total as Total',
            'OrderProduct.createdDate as CreatedDate',
            'OrderProduct.skuName as skuName',
            'OrderProduct.varientName as varientName',
            'product.invoiceNo as invoiceNo',
            'product.invoicePrefix as invoicePrefix',
            'product.orderStatusId as orderStatusId',
            'product.orderPrefixId as orderPrefixId',
            '(SELECT pi.image as image FROM product_image pi WHERE pi.product_id = OrderProduct.productId AND pi.default_image = 1 LIMIT 1) as image',
            '(SELECT pi.container_name as containerName FROM product_image pi WHERE pi.product_id = OrderProduct.productId AND pi.default_image = 1 LIMIT 1) as containerName',
            '(SELECT pi.default_image as defaultImage FROM product_image pi WHERE pi.product_id = OrderProduct.productId AND pi.default_image = 1 LIMIT 1) as defaultImage',
        ];
        const relations = [
            {
                tableName: 'OrderProduct.productInformationDetail',
                aliasName: 'productInformationDetail',
            },
            {
                tableName: 'OrderProduct.product',
                aliasName: 'product',
            },
        ];
        const whereConditions = [];
        const sort = [
            {
                name: 'OrderProduct.createdDate',
                order: 'DESC',
            },
        ];
        const recentSellingProductList = await this.orderProductService.listByQueryBuilder(limit, 0, select, whereConditions, [], relations, [], sort, false, true);
        const successResponse: any = {
            status: 1,
            message: 'successfully listed recently selling products..!',
            data: recentSellingProductList,
        };
        return response.status(200).send(successResponse);
    }

    // update product to Today Deals API
    /**
     * @api {put} /api/product/update-todayDeals/:id Update Today Deals API
     * @apiGroup Product
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {number} todayDeals TodayDeals should be 0 or 1
     * @apiParamExample {json} Input
     * {
     *      "todayDeals" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully updated product to today Deals.",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/product/update-todayDeals/:id
     * @apiErrorExample {json} todayDeals error
     * HTTP/1.1 500 Internal Server Error
     */
    @Put('/update-todayDeals/:id')
    @Authorized(['admin', 'make-today-deal'])
    public async updateTodayDeals(@Param('id') id: number, @Body({ validate: true }) updateTodayDealsParam: UpdateTodayDealsParam, @Res() response: any): Promise<any> {

        const product = await this.productService.findOne({
            where: {
                productId: id,
            },
        });
        if (!product) {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid product Id.',
            };
            return response.status(400).send(errorResponse);
        }

        product.todayDeals = updateTodayDealsParam.todayDeals;
        const productSave = await this.productService.create(product);
        if (productSave) {
            const successResponse: any = {
                status: 1,
                message: 'Product updated successfully .',
                data: productSave,
            };
            return response.status(200).send(successResponse);
        } else {
            const errorResponse: any = {
                status: 0,
                message: 'Unable to update the product.',
            };
            return response.status(400).send(errorResponse);
        }
    }

    // Recent viewLog list API
    /**
     * @api {get} /api/product/viewLog-list Product View Log List
     * @apiGroup Product
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} limit limit
     * @apiParam (Request body) {Number} offset offset
     * @apiParam (Request body) {Number} count count in number or boolean
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully got Product view Log List..!!",
     *      "status": "1",
     *      "data": {},
     * }
     * @apiSampleRequest /api/product/viewLog-list
     * @apiErrorExample {json} ViewLog List error
     * HTTP/1.1 500 Internal Server Error
     */

    @Get('/viewLog-list')
    @Authorized()
    public async productViewLogList(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('count') count: number | boolean, @Req() request: any, @Res() response: any): Promise<any> {
        const select = [];
        const whereConditions = [];
        const search = [];
        const viewLogs = await this.productViewLogService.list(limit, offset, select, search, whereConditions, 0, count);
        if (count) {
            const successresponse: any = {
                status: 1,
                message: 'Successfully got view log count',
                data: viewLogs,
            };
            return response.status(200).send(successresponse);
        } else {
            const successResponse: any = {
                status: 1,
                message: 'Successfully got view log List',
                data: viewLogs,
            };
            return response.status(200).send(successResponse);
        }
    }

    // Customer product view list API
    /**
     * @api {get} /api/product/customerProductView-list/:id Customer product View List
     * @apiGroup Product
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} limit limit
     * @apiParam (Request body) {Number} offset offset
     * @apiParam (Request body) {Number} count count in number or boolean
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully got Product view Log List..!!",
     *      "status": "1",
     *      "data": {},
     * }
     * @apiSampleRequest /api/product/customerProductView-list/:id
     * @apiErrorExample {json} customerProductView List error
     * HTTP/1.1 500 Internal Server Error
     */

    @Get('/customerProductView-list/:id')
    @Authorized()
    public async customerProductView(@Param('id') id: number, @QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('count') count: number | boolean, @Req() request: any, @Res() response: any): Promise<any> {
        const select = [];
        const whereConditions = [{
            name: 'customerId',
            value: id,
        }];
        const search = [];
        const customerProductview = await this.productViewLogService.list(limit, offset, select, search, whereConditions, 0, count);
        if (count) {
            const successresponse: any = {
                status: 1,
                message: 'Successfully got view log count',
                data: customerProductview,
            };
            return response.status(200).send(successresponse);
        } else {
            const successResponse: any = {
                status: 1,
                message: 'Successfully got view log List',
                data: customerProductview,
            };
            return response.status(200).send(successResponse);
        }
    }

    // Get product rating/review API
    /**
     * @api {get} /api/product/Get-Product-rating Get product Rating API
     * @apiGroup Product
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} productId productId
     * @apiParam (Request body) {Number} limit limit
     * @apiParam (Request body) {Number} offset offset
     * @apiParam (Request body) {Number} count count in number
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "successfully got the product rating and review.",
     *      "data":"{ }"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/product/Get-Product-rating
     * @apiErrorExample {json} Product error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/Get-Product-rating')
    @Authorized()
    public async getProductRating(@QueryParam('productId') productId: number, @QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('count') count: number | boolean, @Res() response: any): Promise<any> {
        const select = ['ratingId', 'review', 'rating', 'createdDate', 'firstName', 'lastName', 'productId', 'customerId', 'orderProductId', 'isActive'];
        const relation = [];
        const WhereConditions = [
            {
                name: 'productId',
                op: 'where',
                value: productId,
            },
        ];
        const rating: any = await this.productRatingService.list(limit, offset, select, relation, WhereConditions, count);
        const promise = rating.map(async (result: any) => {
            const temp: any = result;
            const customer: any = await this.customerService.findOne({
                select: ['avatar', 'avatarPath'],
                where: { id: result.customerId },
            });
            const val = Object.assign({}, temp, customer);
            return val;
        });
        const value = await Promise.all(promise);
        if (value) {
            const successResponse: any = {
                status: 1,
                message: 'successfully got the product Rating. ',
                data: value,
            };
            return response.status(200).send(successResponse);
        } else {
            const errorResponse: any = {
                status: 1,
                message: 'unable to get product Rating.',
            };
            return response.status(400).send(errorResponse);
        }
    }
    // Change Status rating/review API
    /**
     * @api {put} /api/product/Product-rating-status/:id Product Rating Status API
     * @apiGroup Product
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} status status should be 0-> In-Active or 1-> Active
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "successfully updated review status.",
     *      "data":"{ }"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/product/Product-rating-status/:id
     * @apiErrorExample {json} Product error
     * HTTP/1.1 500 Internal Server Error
     */
    @Put('/Product-rating-status/:id')
    @Authorized(['admin', 'edit-rating-review'])
    public async productRatingStatus(@Param('id') id: number, @Body({ validate: true }) updateRatingStatus: UpdateRatingStatusRequest, @Res() response: any, @Req() request: any): Promise<any> {
        const Rating = await this.productRatingService.findOne({ where: { ratingId: id } });
        Rating.isActive = updateRatingStatus.status;
        Rating.isCommentApproved = updateRatingStatus.isCommentApproved;
        const updateRating = await this.productRatingService.create(Rating);
        const RatingValue: any = await this.productRatingService.consolidateRating(Rating.productId);
        const ProductData = await this.productService.findOne({ where: { productId: Rating.productId } });
        ProductData.rating = RatingValue !== undefined ? RatingValue.RatingCount : 0;
        await this.productService.create(ProductData);
        if (updateRating) {
            const successResponse: any = {
                status: 1,
                message: 'Successfully Updated the Rating Status. ',
                data: updateRating,
            };
            return response.status(200).send(successResponse);
        } else {
            const errorResponse: any = {
                status: 1,
                message: 'Unable to update the product Rating.',
            };
            return response.status(400).send(errorResponse);
        }
    }

    // Product Details Excel Document download
    /**
     * @api {get} /api/product/product-excel-list Product Excel
     * @apiGroup Product
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {String} productId productId
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully download the Product Excel List..!!",
     *      "status": "1",
     *      "data": {},
     * }
     * @apiSampleRequest /api/product/product-excel-list
     * @apiErrorExample {json} product Excel List error
     * HTTP/1.1 500 Internal Server Error
     */

    @Get('/product-excel-list')
    @Authorized(['admin', 'export-product'])
    public async excelProductView(@QueryParam('productId') productId: string, @Req() request: any, @Res() response: any): Promise<any> {
        const excel = require('exceljs');
        const workbook = new excel.Workbook();
        const worksheet = workbook.addWorksheet('Product Detail Sheet');
        const rows = [];
        const productid = productId.split(',');
        for (const id of productid) {
            const dataId = await this.productService.findOne(id);
            if (dataId === undefined) {
                const errorResponse: any = {
                    status: 0,
                    message: 'Invalid productId',
                };
                return response.status(400).send(errorResponse);
            }
        }
        // Excel sheet column define
        worksheet.columns = [
            { header: 'Product Id', key: 'productId', size: 16, width: 15 },
            { header: 'Product Name', key: 'name', size: 16, width: 15 },
            { header: 'Description', key: 'description', size: 16, width: 30 },
            { header: 'Price', key: 'price', size: 16, width: 15 },
            { header: 'SKU', key: 'sku', size: 16, width: 15 },
            { header: 'UPC', key: 'upc', size: 16, width: 15 },
            { header: 'Quantity', key: 'quantity', size: 16, width: 15 },
            { header: 'Minimum Quantity', key: 'minimumQuantity', size: 16, width: 19 },
            { header: 'Subtract Stock', key: 'subtractstock', size: 16, width: 15 },
            { header: 'Manufacture Id', key: 'manufactureId', size: 16, width: 15 },
            { header: 'Meta Tag Title', key: 'metaTagTitle', size: 16, width: 15 },
        ];
        worksheet.getCell('A1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('B1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('C1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('D1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('E1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('F1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('G1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('H1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('I1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('J1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('K1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        for (const id of productid) {
            const dataId = await this.productService.findOne(id);
            const productDescription = dataId.description;
            const dataDescription = productDescription.replace(/(&nbsp;|(<([^>]+)>))/ig, '');
            rows.push([dataId.productId, dataId.name, dataDescription.trim(), dataId.productSellingPrice, dataId.sku, dataId.upc, dataId.quantity, dataId.minimumQuantity, dataId.subtractStock, dataId.manufacturerId, dataId.metaTagTitle]);
        }
        // Add all rows data in sheet
        worksheet.addRows(rows);
        const fileName = './ProductExcel_' + Date.now() + '.xlsx';
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

    @Get('/all-product-download')
    @Authorized(['admin', 'export-product'])
    public async AllProductsDownload(@QueryParams() quertData: any): Promise<any> {
        //old code------------------
        // const allData = await getManager().query(`SELECT MAX(p.upc) upc, s.sku_name skuName, (SELECT MAX(cc.name) FROM category cc WHERE cc.category_id=MAX(c.parent_int)) AS 'parentCategory', MAX(c.name) categoryName, MAX(s.quantity) skuQuantity, MAX(p.name) productName, MAX(p.description) description, MAX(p.meta_tag_description) metaDescription, MAX(SUBSTR(pvo.varient_name, 1, LOCATE(',', pvo.varient_name) - 1)) Size, MAX(SUBSTR(pvo.varient_name, LOCATE(',', pvo.varient_name) + 1)) Color, CONCAT('https://redchief.in/product/',MAX(p.product_slug)) link, 
        // CONCAT('https://d2lo0tepqt73yr.cloudfront.net/', MAX(im.container_name), MAX(im.image)) image, MAX(p.product_selling_price) sellingPrice, MAX(ROUND(p.price+(p.price*t.tax_percentage/100))) price, CONCAT(MAX(p.discount),'%') discount FROM product p INNER JOIN product_varient_option pvo ON pvo.product_id=p.product_id INNER JOIN sku s ON s.id=pvo.sku_id INNER JOIN product_to_category ptc ON p.product_id=ptc.product_id INNER JOIN category c ON c.category_id=ptc.category_id INNER JOIN tax t ON p.tax_value=t.tax_id INNER JOIN product_image im ON im.product_id=p.product_id WHERE default_image=1 AND p.is_active IN (${quertData.status}) AND c.parent_int!=0 GROUP BY skuName`)
      //new code---------------------
        const allData = await getManager().query(`SELECT MAX(p.upc) upc, s.sku_name skuName, (SELECT MAX(cc.name) FROM category cc WHERE cc.category_id=MAX(c.parent_int)) AS 'parentCategory', MAX(c.name) categoryName, MAX(s.quantity) skuQuantity, MAX(p.name) productName, MAX(p.created_date) DateAvailable, MAX(p.description) description, MAX(p.meta_tag_title) metaTagTitle, MAX(p.meta_tag_description) metaDescription, MAX(SUBSTR(pvo.varient_name, 1, LOCATE(',', pvo.varient_name) - 1)) Size, MAX(SUBSTR(pvo.varient_name, LOCATE(',', pvo.varient_name) + 1)) Color, CONCAT('https://redchief.in/product/',MAX(p.product_slug)) link, CONCAT('https://d2lo0tepqt73yr.cloudfront.net/', MAX(im.container_name), MAX(im.image)) image, MAX(p.product_selling_price) sellingPrice, MAX(ROUND(p.price+(p.price*t.tax_percentage/100))) price, CONCAT(MAX(t.tax_percentage),'%') taxValue, CONCAT(MAX(p.discount),'%') discount FROM product p INNER JOIN product_varient_option pvo ON pvo.product_id=p.product_id INNER JOIN sku s ON s.id=pvo.sku_id INNER JOIN product_to_category ptc ON p.product_id=ptc.product_id INNER JOIN category c ON c.category_id=ptc.category_id INNER JOIN tax t ON p.tax_value=t.tax_id INNER JOIN product_image im ON im.product_id=p.product_id WHERE default_image=1 AND p.is_active IN (${quertData.status}) AND c.parent_int!=0 GROUP BY skuName`)
        return allData;
    }


    @Get('/all-product-download-list')
    @Authorized(['admin', 'export-product'])
    public async AllProductsDownloadList(@QueryParams() quertData: any): Promise<any> {
        const allData = await getManager().query(`SELECT p.upc upc, s.sku_name skuName,
        s.quantity skuQuantity, p.name productName, p.description description,
        p.meta_tag_description metaDescription, SUBSTR(pvo.varient_name, 1,
        LOCATE(',', pvo.varient_name) - 1) Size, SUBSTR(pvo.varient_name, LOCATE(',', pvo.varient_name) + 1) Color,
        CONCAT('https://redchief.in/product/',p.product_slug) link, p.product_selling_price sellingPrice,
        ROUND(p.price+(p.price*t.tax_percentage/100)) price, CONCAT(p.discount,'%')
        discount FROM product p LEFT JOIN product_varient_option pvo ON pvo.product_id=p.product_id
        LEFT JOIN sku s ON s.id=pvo.sku_id LEFT JOIN tax t ON p.tax_value=t.tax_id;`)
        return allData;
    }

    // ExportAllProducts
    /**
     * @api {get} /api/product/allproduct-excel-list AllProduct Excel sheet
     * @apiGroup Product
     * @apiHeader {String} Authorization
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully download the All Product Excel List..!!",
     *      "status": "1",
     *      "data": {},
     * }
     * @apiSampleRequest /api/product/allproduct-excel-list
     * @apiErrorExample {json} Allproduct Excel List error
     * HTTP/1.1 500 Internal Server Error
     */

    @Get('/allproduct-excel-list')
    @Authorized(['admin', 'export-product'])
    public async ExportAllProducts(@Req() request: any, @Res() response: any): Promise<any> {
        const excel = require('exceljs');
        const workbook = new excel.Workbook();
        const worksheet = workbook.addWorksheet('All Product Excel');
        const rows = [];
        const dataId = await this.productService.findAll();
        if (dataId === undefined) {
            const errorResponse: any = {
                status: 0,
                message: 'Products are empty',
            };
            return response.status(400).send(errorResponse);
        }
        // Excel sheet column define
        worksheet.columns = [
            { header: 'Product Id', key: 'productId', size: 16, width: 15 },
            { header: 'Product Name', key: 'name', size: 16, width: 15 },
            { header: 'Description', key: 'description', size: 16, width: 30 },
            { header: 'Price', key: 'price', size: 16, width: 15 },
            { header: 'SKU', key: 'sku', size: 16, width: 15 },
            { header: 'UPC', key: 'upc', size: 16, width: 15 },
            { header: 'Quantity', key: 'quantity', size: 16, width: 15 },
            { header: 'Minimum Quantity', key: 'minimumQuantity', size: 16, width: 19 },
            { header: 'Subtract Stock', key: 'subtractstock', size: 16, width: 15 },
            { header: 'Manufacture Id', key: 'manufactureId', size: 16, width: 15 },
            { header: 'Meta Tag Title', key: 'metaTagTitle', size: 16, width: 15 },
            { header: 'is featured', key: 'isFeatured', size: 16, width: 15 },
            { header: 'Total deals', key: 'todayDeals', size: 16, width: 15 },
            { header: 'Condition', key: 'condition', size: 16, width: 15 },
            { header: 'Rating', key: 'Rating', size: 16, width: 15 },
            { header: 'Related Products', key: 'relatedProducts', size: 16, width: 15 },
            { header: 'IsActive', key: 'isActive', size: 16, width: 15 },
        ];
        worksheet.getCell('A1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('B1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('C1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('D1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('E1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('F1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('G1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('H1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('I1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('J1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('K1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('L1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('M1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('N1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('O1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('P1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('Q1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        const product = await this.productService.findAll();
        for (const products of product) {
            const productDescription = products.description;
            const dataDescription = productDescription.replace(/(&nbsp;|(<([^>]+)>))/ig, '');
            const related = [];
            const relatedProducts = await this.productRelatedService.findAll({ where: { productId: products.productId } });
            for (const relatedProduct of relatedProducts) {
                const productName = await this.productService.findOne({ where: { productId: relatedProduct.relatedProductId } });
                related.push(productName.name);
            }
            const relProduct = related.toString();
            rows.push([products.productId, products.name, dataDescription.trim(), products.price, products.sku, products.upc, products.quantity, products.minimumQuantity, products.subtractStock, products.manufacturerId, products.metaTagTitle, products.isFeatured, products.todaysDeals, products.condition, products.rating, relProduct, products.isActive]);
        }
        // Add all rows data in sheet
        worksheet.addRows(rows);
        const worksheet1 = workbook.addWorksheet('special price');
        worksheet1.columns = [
            { header: 'product Special Id', key: 'productSpecialId', size: 16, width: 30 },
            { header: 'product Id', key: 'productId', size: 16, width: 15 },
            { header: 'product Name', key: 'productName', size: 16, width: 15 },
            { header: 'priority', key: 'priority', size: 16, width: 15 },
            { header: 'price', key: 'price', size: 16, width: 30 },
            { header: 'start date', key: 'startDate', size: 16, width: 15 },
            { header: 'end date', key: 'endDate', size: 16, width: 15 },
        ];
        worksheet1.getCell('A1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet1.getCell('B1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet1.getCell('C1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet1.getCell('D1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet1.getCell('E1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet1.getCell('F1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet1.getCell('G1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        const special = [];
        const specialPrices = await this.productSpecialService.find();
        for (const specialPrice of specialPrices) {
            const productName = await this.productService.findOne({ where: { productId: specialPrice.productId } });
            special.push([specialPrice.productSpecialId, specialPrice.productId, productName.name, specialPrice.priority, specialPrice.price, specialPrice.dateStart, specialPrice.dateEnd]);
        }
        // Add all rows data in sheet
        worksheet1.addRows(special);
        const worksheet2 = workbook.addWorksheet('discount price');
        worksheet2.columns = [
            { header: 'product dicount Id', key: 'productDiscountId', size: 16, width: 30 },
            { header: 'product Id', key: 'productId', size: 16, width: 15 },
            { header: 'product name', key: 'productName', size: 16, width: 30 },
            { header: 'priority', key: 'priority', size: 16, width: 15 },
            { header: 'price', key: 'price', size: 16, width: 30 },
            { header: 'start date', key: 'startDate', size: 16, width: 15 },
            { header: 'end date', key: 'endDate', size: 16, width: 15 },
        ];
        worksheet2.getCell('A1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet2.getCell('B1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet2.getCell('C1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet2.getCell('D1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet2.getCell('E1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet2.getCell('F1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet2.getCell('F1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        const discount = [];
        const discountPrices = await this.productDiscountService.find();
        for (const discountPrice of discountPrices) {
            const productName = await this.productService.findOne({ where: { productId: discountPrice.productId } });
            discount.push([discountPrice.productDiscountId, discountPrice.productId, productName.name, discountPrice.priority, discountPrice.price, discountPrice.dateStart, discountPrice.dateEnd]);
        }
        // Add all rows data in sheet
        worksheet2.addRows(discount);
        const worksheet3 = workbook.addWorksheet('Images');
        worksheet3.columns = [
            { header: 'product Id', key: 'productId', size: 16, width: 15 },
            { header: 'product Name', key: 'productName', size: 16, width: 15 },
            { header: 'Image Path', key: 'imagePath', size: 16, width: 15 },
            { header: 'Image', key: 'image', size: 16, width: 30 },
            { header: 'Default Image', key: 'defaultImage', size: 16, width: 30 },
        ];
        worksheet3.getCell('A1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet3.getCell('B1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet3.getCell('C1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet3.getCell('D1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet3.getCell('E1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        const productimage = [];
        const images = await this.productImageService.find();
        for (const image of images) {
            const productName = await this.productService.findOne({ where: { productId: image.productId } });
            productimage.push([image.productId, productName.name, image.containerName, image.image, image.defaultImage]);
        }
        // Add all rows data in sheet
        worksheet3.addRows(productimage);
        const worksheet6 = workbook.addWorksheet('Related Category');
        worksheet6.columns = [
            { header: 'product Id', key: 'productId', size: 16, width: 15 },
            { header: 'Category Id', key: 'categoryId', size: 16, width: 15 },
            { header: 'Category Name', key: 'CategoryName', size: 16, width: 30 },
        ];
        worksheet6.getCell('A1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet6.getCell('B1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet6.getCell('C1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        const relatedCategory = [];
        const categories = await this.productToCategoryService.find();
        for (const category of categories) {
            const categoryName = await this.categoryService.findOne({ where: { categoryId: category.categoryId } });
            relatedCategory.push([category.productId, category.categoryId, categoryName.name]);
        }
        // Add all rows data in sheet
        worksheet6.addRows(relatedCategory);

        const fileName = './ProductExcel_' + Date.now() + '.xlsx';
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

    // Delete Product API
    /**
     * @api {delete} /api/product/delete-product/:id Delete Single Product API
     * @apiGroup Product
     * @apiHeader {String} Authorization
     * @apiParamExample {json} Input
     * {
     *      "id" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     * "message": "Successfully deleted Product.",
     * "status": "1"
     * }
     * @apiSampleRequest /api/product/delete-product/:id
     * @apiErrorExample {json} productDelete error
     * HTTP/1.1 500 Internal Server Error
     */
    @Delete('/delete-product/:id')
    @Authorized(['admin', 'delete-product'])
    public async deleteProduct(@Param('id') productid: number, @Res() response: any, @Req() request: any): Promise<Product> {
        const product = await this.productService.findOne(productid);
        if (product === undefined) {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid product Id.',
            };
            return response.status(400).send(errorResponse);
        }
        const orderProductId = await this.orderProductService.productPaymentProcess(productid);
        if (orderProductId) {
            const errorResponse: any = {
                status: 0,
                message: 'Product is already ordered so you cannot delete the product ',
            };
            return response.status(400).send(errorResponse);
        }
        const findProductVarient = await this.productVarientOptionService.findAll({ where: { productId: product.productId } });
        for (const productVarient of findProductVarient) {
            await this.skuService.delete({ id: productVarient.skuId });
        }
        await this.skuService.delete({ id: product.skuId });
        const deleteProduct = await this.productService.delete(productid);
        const relatedProduct = await this.productRelatedService.findAll({ where: { productId: productid } });
        for (const relatedproduct of relatedProduct) {
            await this.productRelatedService.delete(relatedproduct.id);
        }
        const relatedProductId = await this.productRelatedService.findAll({ where: { relatedProductId: productid } });
        for (const relatedproducts of relatedProductId) {
            await this.productRelatedService.delete(relatedproducts.id);
        }
        const couponProducts = await this.vendorCouponProductCategoryService.findAll({
            where: {
                referenceId: productid, type: 1,
            },
        });
        for (const couponProduct of couponProducts) {
            await this.vendorCouponProductCategoryService.delete(couponProduct.id);
        }

        if (deleteProduct) {
            const successResponse: any = {
                status: 1,
                message: 'Successfully deleted the Product.',
            };
            return response.status(200).send(successResponse);
        } else {
            const errorResponse: any = {
                status: 0,
                message: 'Unable to delete the product.',
            };
            return response.status(400).send(errorResponse);
        }
    }

    // Delete Multiple Product API

    /**
     * @api {post} /api/product/delete-product Delete Product API
     * @apiGroup Product
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {number} productId productId
     * @apiParamExample {json} Input
     * {
     * "productId" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     * "message": "Successfully deleted Product.",
     * "status": "1"
     * }
     * @apiSampleRequest /api/product/delete-product
     * @apiErrorExample {json} productDelete error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/delete-product')
    @Authorized()
    public async deleteMultipleProduct(@Body({ validate: true }) productDelete: DeleteProductRequest, @Res() response: any, @Req() request: any): Promise<Product> {
        const productIdNo = productDelete.productId.toString();
        const productid = productIdNo.split(',');
        for (const id of productid) {
            const dataId = await this.productService.findOne(id);
            if (dataId === undefined) {
                const errorResponse: any = {
                    status: 0,
                    message: 'Please choose a product that you want to delete.',
                };
                return response.status(400).send(errorResponse);
            }
        }
        for (const id of productid) {
            const orderProductId = await this.orderProductService.productPaymentProcess(+id);
            if (orderProductId) {
                const errorResponse: any = {
                    status: 0,
                    message: 'You cannot delete this product as it has been already ordered.',
                };
                return response.status(400).send(errorResponse);
            }
        }
        for (const id of productid) {
            const deleteProductId = parseInt(id, 10);
            const product = await this.productService.findOne(id);
            const findProductVarient = await this.productVarientOptionService.findAll({ where: { productId: product.productId } });
            for (const productVarient of findProductVarient) {
                await this.skuService.delete({ id: productVarient.skuId });
            }
            await this.skuService.delete({ id: product.skuId });
            const couponProducts = await this.vendorCouponProductCategoryService.findAll({
                where: {
                    referenceId: deleteProductId, type: 1,
                },
            });
            for (const couponProduct of couponProducts) {
                await this.vendorCouponProductCategoryService.delete(couponProduct.id);
            }
            await this.productService.delete(deleteProductId);
            const relatedProduct = await this.productRelatedService.findAll({ where: { productId: deleteProductId } });
            for (const relatedproduct of relatedProduct) {
                await this.productRelatedService.delete(relatedproduct.id);
            }
            const relatedProductId = await this.productRelatedService.findAll({ where: { relatedProductId: deleteProductId } });
            for (const relatedproducts of relatedProductId) {
                await this.productRelatedService.delete(relatedproducts.id);
            }
        }
        const successResponse: any = {
            status: 1,
            message: 'Successfully deleted the Product',
        };
        return response.status(200).send(successResponse);
    }

    // Product Rating List API
    /**
     * @api {get} /api/product/product-rating-list Product Rating and review List API
     * @apiGroup Product
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} limit limits
     * @apiParam (Request body) {Number} offset offset
     * @apiParam (Request body) {String} productName productName
     * @apiParam (Request body) {Number} count count in number or boolean
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *       "status": "1"
     *      "message": "Successfully get product rating list",
     *      "data":"{}"
     * }
     * @apiSampleRequest /api/product/product-rating-list
     * @apiErrorExample {json} productRatingList error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/product-rating-list')
    @Authorized(['admin', 'list-rating-review'])
    public async productRatinglist(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('productName') productName: string, @QueryParam('count') count: number | boolean, @Res() response: any): Promise<any> {
        const select = [
            'ProductRating.ratingId as ratingId',
            'product.productId as productId',
            'ProductRating.orderProductId as orderProductId',
            'customer.id as customerId',
            'ProductRating.firstName as firstName',
            'ProductRating.lastName as lastName',
            'ProductRating.rating as rating',
            'ProductRating.review as review',
            'ProductRating.email as email',
            'ProductRating.isActive as isActive',
            'ProductRating.createdDate as createdDate',
            'ProductRating.isCommentApproved as isCommentApproved',
            '(SELECT p.name as name from product p where p.product_id = product.productId LIMIT 1) as productName',
            '(SELECT pi.image as image FROM product_image pi WHERE pi.product_id = product.productId AND pi.default_image = 1 LIMIT 1) as image',
            '(SELECT pi.container_name as containerName FROM product_image pi WHERE pi.product_id = product.productId AND pi.default_image = 1 LIMIT 1) as imagePath',
        ];
        const relations = [
            {
                tableName: 'ProductRating.product',
                aliasName: 'product',
            },
            {
                tableName: 'ProductRating.customer',
                aliasName: 'customer',
            },
        ];
        const WhereConditions = [];
        const searchConditions = [];
        if (productName !== '') {
            searchConditions.push({
                name: ['product.name'],
                value: productName,
            });
        }
        const sort = [
            {
                name: 'ProductRating.createdDate',
                order: 'DESC',
            },
        ];
        const productLists: any = await this.productRatingService.listByQueryBuilder(limit, offset, select, WhereConditions, searchConditions, relations, [], sort, false, true);
        if (count) {
            const productListCount = await this.productRatingService.listByQueryBuilder(limit, offset, select, WhereConditions, searchConditions, relations, [], sort, true, true);
            
            const successRes: any = {
                status: 1,
                message: 'Successfully got count ',
                data: productListCount,
            };
            return response.status(200).send(successRes);
        }

        
        if(productLists && productLists.length > 0){
            const productReviewRepo = getManager().getRepository(ProductReviewImages);
            
            for(let r=0;r<productLists.length;r++){
                const recs = await productReviewRepo.createQueryBuilder().select(["image", "container_name AS containerName"])
                .where("review_fk_id = :id", {id: productLists[r].ratingId}).getRawMany()
                productLists[r].reviewImages = recs 
            }
        }
        
        const successResponse: any = {
            status: 1,
            message: 'Successfully got the complete product rating and review.',
            data: productLists,
        };
        return response.status(200).send(successResponse);
    }

    // Update Product Slug API
    /**
     * @api {put} /api/product/update-product-slug Update Product Slug API
     * @apiGroup Product
     * @apiHeader {String} Authorization
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully updated Product Slug.",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/product/update-product-slug
     * @apiErrorExample {json} Product error
     * HTTP/1.1 500 Internal Server Error
     */
    @Put('/update-product-slug')
    public async updateSlug(@Res() response: any): Promise<Product> {
        const arr: any = [];
        const product = await this.productService.findAll();
        for (const val of product) {
            const metaTagTitle = val.metaTagTitle;
            if (metaTagTitle) {
                const dat = metaTagTitle.replace(/\s+/g, '-').replace(/[&\/\\#@,+()$~%.'":*?<>{}]/g, '').toLowerCase();
                const data = dat.replace(/--/gi, '-');
                const getProductSlug = await this.productService.slug(metaTagTitle);
                if (getProductSlug.length === 0 || getProductSlug === '' || getProductSlug === undefined) {
                    val.productSlug = data;
                } else if (getProductSlug.length === 1 && (metaTagTitle !== getProductSlug[getProductSlug.length - 1].metaTagTitle)) {
                    val.productSlug = data + '-' + 1;
                } else if (getProductSlug.length > 1 && getProductSlug !== undefined && getProductSlug !== '') {
                    const slugVal = getProductSlug[getProductSlug.length - 1];
                    const value = slugVal.productSlug;
                    const getSlugInt = value.substring(value.lastIndexOf('-') + 1, value.length);
                    const slugNumber = parseInt(getSlugInt, 0);
                    val.productSlug = data + '-' + (slugNumber + 1);
                }
            } else {
                const title = val.name;
                const dat = title.replace(/\s+/g, '-').replace(/[&\/\\@#,+()$~%.'":*?<>{}]/g, '').toLowerCase();
                const data = dat.replace(/--/gi, '-');
                const getProductSlug = await this.productService.slug(title);
                if (getProductSlug === '' || getProductSlug === undefined || getProductSlug.length === 0) {
                    val.productSlug = data;
                } else if (getProductSlug.length === 1 && (title !== getProductSlug[getProductSlug.length - 1].title)) {
                    val.productSlug = data + '-' + 1;
                } else if (getProductSlug.length > 1 && getProductSlug !== undefined && getProductSlug !== '') {
                    const slugVal = getProductSlug[getProductSlug.length - 1];
                    const value = slugVal.productSlug;
                    const getSlugInt = value.substring(value.lastIndexOf('-') + 1, value.length);
                    const slugNumber = parseInt(getSlugInt, 0);
                    val.productSlug = data + '-' + (slugNumber + 1);
                }
            }
            arr.push(val);
        }
        await this.productService.create(arr);
        const successResponse: any = {
            status: 1,
            message: 'Successfully updated the product slug.',
        };
        return response.status(200).send(successResponse);
    }

    // Dashboard Count API
    /**
     * @api {get} /api/product/dashboard-count Dashboard Count API
     * @apiGroup Product
     * @apiHeader {String} Authorization
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "status": "1"
     *      "message": "Successfully get dashboard count",
     *      "data":"{}"
     * }
     * @apiSampleRequest /api/product/dashboard-count
     * @apiErrorExample {json} product error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/dashboard-count')
    @Authorized()
    public async dashboardCount(@Res() response: any): Promise<any> {
        const dashboard: any = {};
        const select = [];
        const searchOrder = [{
            name: 'paymentProcess',
            op: 'where',
            value: 1,
        }];
        const relation = [];
        const WhereConditions = [];
        const search = [];
        const ordersCount = await this.orderService.list(0, 0, select, searchOrder, WhereConditions, relation, 1);
        const paymentsCount = await this.paymentService.list(0, 0, select, search, WhereConditions, 1);
        const productsCount = await this.productService.list(0, 0, select, relation, WhereConditions, search, 0, 1);
        const customerWhereConditions = [{
            name: 'deleteFlag',
            op: 'where',
            value: 0,
        }];
        const customersCount = await this.customerService.list(0, 0, search, customerWhereConditions, 0, 1);
        dashboard.orders = ordersCount;
        dashboard.payments = paymentsCount;
        dashboard.products = productsCount;
        dashboard.customers = customersCount;
        const successResponse: any = {
            status: 1,
            message: 'successfully got the dashboard count.',
            data: dashboard,
        };
        return response.status(200).send(successResponse);
    }

    // Dashboard Admin Total Vendor and Total Product Count API
    /**
     * @api {get} /api/product/dashboard-admin-totalvendor-totalproduct-count Dashboard Admin Total Vendor and Total Product Count API
     * @apiGroup Product
     * @apiHeader {String} Authorization
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "status": "1"
     *      "message": "Successfully get total vendor and total product count",
     *      "data":"{}"
     * }
     * @apiSampleRequest /api/product/dashboard-admin-totalvendor-totalproduct-count
     * @apiErrorExample {json} dashboard admin total vendor and total product count error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/dashboard-admin-totalvendor-totalproduct-count')
    @Authorized()
    public async dashboardAdminCount(@Res() response: any): Promise<any> {
        const dashboardAdmin: any = {};
        const select = [];
        const whereConditionsForCustomers = [{
            name: 'deleteFlag',
            value: 0,
        }];
        const search = [];
        const totalCustomerCount = await this.customerService.list(0, 0, search, whereConditionsForCustomers, 0, true);
        const totalProductCount = await this.productService.list(0, 0, select, [], [], search, 0, true);
        dashboardAdmin.customers = totalCustomerCount;
        dashboardAdmin.products = totalProductCount;
        const successResponse: any = {
            status: 1,
            message: 'successfully got the dashboard total vendor and total product count.',
            data: dashboardAdmin,
        };
        return response.status(200).send(successResponse);
    }
    // Product Count API
    /**
     * @api {get} /api/product/product-count Product Count API
     * @apiGroup Product
     * @apiHeader {String} Authorization
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "status": "1"
     *      "message": "Successfully get product count",
     *      "data":"{}"
     * }
     * @apiSampleRequest /api/product/product-count
     * @apiErrorExample {json} productCount error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/product-count')
    @Authorized()
    public async productCount(@Res() response: any): Promise<any> {
        const product: any = {};
        const select = [];
        const search = [];
        const relation = [];
        const WhereConditions = [];
        const allProductCount: any = await this.productService.list(0, 0, select, relation, WhereConditions, search, 0, 1);
        const whereConditionsActive = [
            {
                name: 'isActive',
                op: 'where',
                value: 1,
            },
        ];
        const activeProductCount = await this.productService.list(0, 0, select, relation, whereConditionsActive, search, 0, 1);
        const whereConditionsInActive = [
            {
                name: 'isActive',
                op: 'where',
                value: 0,
            },
        ];
        const inActiveProductCount = await this.productService.list(0, 0, select, relation, whereConditionsInActive, search, 0, 1);
        const whereConditionsFeatured = [
            {
                name: 'isFeatured',
                op: 'where',
                value: 1,
            },
        ];
        const featuredProductCount = await this.productService.list(0, 0, select, relation, whereConditionsFeatured, search, 0, 1);
        const allCategoryCount = await this.categoryService.list(0, 0, select, search, WhereConditions, 0, 1);
        product.totalProduct = allProductCount;
        product.activeProduct = activeProductCount;
        product.inActiveProduct = inActiveProductCount;
        product.totalCategory = allCategoryCount;
        product.featuredProduct = featuredProductCount;
        const successResponse: any = {
            status: 1,
            message: 'successfully got the product count.',
            data: product,
        };
        return response.status(200).send(successResponse);
    }

    // Import Product data
    /**
     * @api {post} /api/product/import-product-data Import product Data
     * @apiGroup Product
     * @apiParam (Request body) {String} file File
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully saved imported data..!!",
     *      "status": "1",
     *      "data": {},
     * }
     * @apiSampleRequest /api/product/import-data
     * @apiErrorExample {json} Import product Data
     * HTTP/1.1 500 Internal Server Error
     */

    @Post('/import-product-data')
    @Authorized(['admin', 'import-product'])
    public async ImportProductPrice(@UploadedFile('file') files: any, @Req() request: any, @Res() response: any): Promise<any> {
        const StreamZip = require('node-stream-zip');
        const random = Math.floor((Math.random() * 100) + 1);
        const name = files.originalname;
        const type = name.split('.')[1];
        const mainFileName = './product_' + random + '.' + type;
        await this.imageService.writeFile(mainFileName, files.buffer);
        // check zip contains invalid file
        const zip = new StreamZip({ file: path.join(process.cwd(), mainFileName) });
        const AcceptedFiles = ['xlsx', 'zip'];
        const zipRead: any = await new Promise((resolved, reject) => {
            zip.on('ready', () => {
                const errExtension = [];
                for (const entry of Object.values(zip.entries())) {
                    const fileNameEntries = (Object.values(entry)[16]).split('.')[1];
                    if (AcceptedFiles.includes(fileNameEntries) === false) {
                        errExtension.push(fileNameEntries);
                    }
                }
                resolved(errExtension);
                // Do not forget to close the file once you're done
                zip.close();
            });
        });
        if (zipRead.length > 0) {
            fs.unlinkSync(path.join(process.cwd(), mainFileName));
            return response.status(400).send({
                status: 0,
                message: 'The file you uploaded contains some invalid extensions',
            });

        }
        const resolve = require('path').resolve;
        const distPath = resolve('product_' + random);
        await this.imageService.extractZip(mainFileName, distPath);
        const directoryPath = path.join(process.cwd(), 'product_' + random);
        const mainFiles = await this.readDir(directoryPath);
        const rimraf = require('rimraf');
        // check the image zip contains invalid data
        for (const fileExtNames of mainFiles) {
            const fileType = fileExtNames.split('.')[1];
            if (fileType === 'zip') {
                const czip = new StreamZip({ file: path.join(process.cwd(), 'product_' + random + '/' + fileExtNames) });
                const cAcceptedFiles = ['png', 'jpg', 'jpeg', 'PNG', 'JPG', 'JPEG', 'db', 'DB'];
                const czipRead: any = await new Promise((resolved, reject) => {
                    czip.on('ready', () => {
                        const cerrExtension = [];
                        for (const entry of Object.values(czip.entries())) {
                            const cfileNameEntries = (Object.values(entry)[16]).split('.')[1];
                            if (cfileNameEntries) {
                                if (cAcceptedFiles.includes(cfileNameEntries) === false) {
                                    cerrExtension.push(cfileNameEntries);
                                }
                            }
                        }

                        resolved(cerrExtension);
                        czip.close();
                    });
                });
                if (czipRead.length > 0) {
                    fs.unlinkSync(path.join(process.cwd(), mainFileName));
                    return response.status(400).send({
                        status: 0,
                        message: 'The file you uploaded contains some invalid extensions',
                    });

                }
            }
        }

        let checkUPC: any[] = []
        const getVarients: any = await this._varientController.varientslistData();

        for (const fileName of mainFiles) {
            const fileType = fileName.split('.')[1];
            if (fileType == 'xlsx') {
                if (fileName === 'productData.xlsx') {
                    const directoryPathh = path.join(process.cwd(), 'product_' + random + '/' + fileName);
                    const result: any = await this.imageService.convertXlToJson(directoryPathh);


                    for (const data of result) {
                        if (data.Price === '' || data.Name === '') {
                            rimraf(path.join(process.cwd(), 'product_' + random), ((err: any) => {
                                if (err) { throw err; }
                            }));
                            fs.unlinkSync(mainFileName);
                            return response.status(400).send({
                                status: 0,
                                message: 'Product Price or Product Name should not empty',
                            });
                        }



                        if (!checkUPC.includes(data.UPC)) {
                            checkUPC.push(data.UPC)
                            let productVarientOption: any[] = []
                            let productVarient: any[] = []
                            let totalQuantity: number = 0
                            let productSizeColor: any[] = []
                            let productDiscount: any[] = []
                            let productImages: any[] = []
                            let productSellingPrice: number = 0
                            const productFilter = result.filter((item: any) => item.UPC == data.UPC)
                            
                            const sizeFilterResult: any = (getVarients.filter((item: any) => {
                                return ((item.category).toUpperCase() == (data.vareintCategory).toUpperCase() && item.name == 'Size')
                            }))
                            const colorFilterResult: any = (getVarients.filter((item: any) => {
                                return ((item.category).toUpperCase() == (data.vareintCategory).toUpperCase() && item.name == 'Color')
                            }))
                            const colorFilter: any = colorFilterResult[0]
                            const sizeFilter: any = sizeFilterResult[0]
                            
                            let taxValueInt: number
                            productFilter.forEach((data: any, i: any) => {
                                totalQuantity += Number(data.Quantity)
                                const optionValue = []
                                if (data.Size && !productVarient.some(item => item == sizeFilter.id)) {
                                    productVarient.push(sizeFilter.id)
                                }
                                if (data.Color && !productVarient.some(item => item == colorFilter.id)) {
                                    productVarient.push(colorFilter.id)
                                }
                                

                                let sizeFilterValue:any = sizeFilter.varientsValue.filter((item: any) => (item.valueName).toUpperCase() == (data.Size).toUpperCase())
                                if(sizeFilterValue.length>0){
                                    sizeFilterValue = sizeFilterValue[0].id
                                }
                                optionValue.push(sizeFilterValue)
                                let colorFilterValue:any = colorFilter.varientsValue.filter((item: any) => (item.valueName).toUpperCase() == (data.Color).toUpperCase())[0].id
                                if(colorFilterValue.length>0){
                                    colorFilterValue=colorFilterValue[0].id
                                }
                                optionValue.push(colorFilterValue)


                                const varientName = data.Size + "," + data.Color
                                const getTaxLength: number = (data.TaxValue).length > 2 ? 2 : 1
                                const getTaxStr: any = (data.TaxValue).substring(0, getTaxLength)
                                taxValueInt = +getTaxStr + 100

                                productSizeColor.push(varientName)
                                productVarientOption.push({
                                    "varientName": varientName,
                                    "optionValue": optionValue,
                                    "optionImage": [],
                                    "price": (data.Price * 100) / taxValueInt,
                                    "sku": data.SKU,
                                    "isActive": 1,
                                    "quantity": data.Quantity
                                })
                                if (data.Price != data.DiscountPrice) {
                                    productSellingPrice = parseInt(data.DiscountPrice)
                                    productDiscount.push({
                                        "disCustomerGroup": "",
                                        "skuName": data.SKU,
                                        "discountDateEnd": "2033-12-31",
                                        "discountDateStart": "2023-10-29",
                                        "discountPrice": (data.DiscountPrice * 100) / taxValueInt,
                                        "discountPriority": i + 1
                                    })
                                }
                                if(data.Images!="NULL"){
                                    const allImages:any[]=data.Images.split(",")
                                    allImages.forEach((item:any, ind:any)=>{
                                        productImages.push({
                                            "containerName": "",
                                            "image": item,
                                            "defaultImage": ind == 0 ? 1 : 0
                                        })
                                    })
                            }
                            });
                            const ankle: boolean = productFilter[0].ANKLE=='NULL' ? false : true
                            const closing: boolean = productFilter[0].CLOSING=='NULL' ? false : true
                            const relevance: boolean = productFilter[0].RELEVANCE=='NULL' ? false : true
                            const material: boolean = productFilter[0].MATERIAL=='NULL' ? false : true
                            const soleType: boolean = productFilter[0].SOLE_TYPE=='NULL' ? false : true
                            const fit: boolean = productFilter[0].FIT=='NULL' ? false : true
                            const neck: boolean = productFilter[0].NECK=='NULL' ? false : true
                            const washCare: boolean = productFilter[0].WASH_CARE=='NULL' ? false : true
                            const style: boolean = productFilter[0].STYLE=='NULL' ? false : true
                            const washType: boolean = productFilter[0].WASH_TYPE=='NULL' ? false : true
                            const gender: boolean = productFilter[0].GENDER=='NULL' ? false : true

                            const ankleText: any = ankle ? "<td><strong>ANKLE:</strong><br>" + productFilter[0].ANKLE + "</td>" : ""
                            const closingText: any = closing ? "<td><strong>CLOSING:</strong><br>" + productFilter[0].CLOSING + "</td>" : ""
                            const relevanceText: any = relevance ? "<td><strong>RELEVANCE:</strong><br>" + productFilter[0].RELEVANCE + "</td>" : ""
                            const materialText: any = material ? "<td><strong>MATERIAL:</strong><br>" + productFilter[0].MATERIAL + "</td>" : ""
                            const soleTypeText: any = soleType ? "<td><strong>SOLE TYPE:</strong><br>" + productFilter[0].SOLE_TYPE + "</td>" : ""
                            const fitText: any = fit ? "<td><strong>FIT:</strong><br>" + productFilter[0].FIT + "</td>" : ""
                            const neckText: any = neck ? "<td><strong>NECK:</strong><br>" + productFilter[0].NECK + "</td>" : ""
                            const washCareText: any = washCare ? "<td><strong>WASH CARE:</strong><br>" + productFilter[0].WASH_CARE + "</td>" : ""
                            const styleText: any = style ? "<td><strong>STYLE:</strong><br>" + productFilter[0].STYLE + "</td>" : ""
                            const washTypeText: any = washType ? "<td><strong>WASH TYPE:</strong><br>" + productFilter[0].WASH_TYPE + "</td>" : ""
                            const genderText: any = gender ? "<td><strong>GENDER:</strong><br>" + productFilter[0].GENDER + "</td>" : ""

                            const description: any = "<p>" + productFilter[0].Description + "</p><table><tbody><tr>" + ankleText + closingText + relevanceText + materialText + soleTypeText + fitText + neckText + washCareText + styleText + washTypeText + genderText + "</tr></tbody></table>"
                            const productJson = {
                                "productName": productFilter[0].Name,
                                "productDescription": description,
                                "upc": productFilter[0].UPC,
                                "sku": productFilter[0].SKU + 1,
                                "hsn": productFilter[0].UPC,
                                "image": productImages,
                                "metaTagTitle": productFilter[0].MetaTagTitle,
                                "categoryId": (productFilter[0].CategoryId).split(','),
                                "model": "",
                                "location": "",
                                "price": (productFilter[0].Price * 100) / taxValueInt,
                                "quantity": totalQuantity,
                                "outOfStockStatus": "",
                                "requiredShipping": "0",
                                "dateAvailable": "2023-10-29",
                                "status": 1,
                                "sortOrder": 0,
                                "condition": "",
                                "relatedProductId": [],
                                "productOptions": [],
                                "productDiscount": productDiscount,
                                "productSpecial": [],
                                "metaTagKeyword": productFilter[0].MetaTagKeyword,
                                "metaTagDescription": productFilter[0].MetaTagDescription,
                                "packingCost": 0,
                                "shippingCost": 0,
                                "tax": productFilter[0].TaxValue=="18%"?3:productFilter[0].TaxValue=="12%"?2:1,
                                "taxType": 2,
                                "others": 0,
                                "productSlug": "",
                                "weight": 0,
                                "height": 0,
                                "length": 0,
                                "width": 0,
                                "manufacturerId": 1,
                                "tirePrices": [],
                                "hasTirePrice": 0,
                                "pincodeBasedDelivery": 0,
                                "quotationAvailable": 0,
                                "productAttribute": [],
                                "productVarientOption": productVarientOption,
                                "productSizeColor": productSizeColor.toString(),
                                "productVarient": productVarient,
                                "productVideo": {
                                    "name": "",
                                    "type": 2
                                },
                                "productSellingPrice": productSellingPrice != 0 ? productSellingPrice : productFilter[0].Price
                            }
                            await this.addProduct(productJson, response, true)
                        }
                    }
                }
            }
            else if (fileType == 'zip') {
                const directPath = path.join(process.cwd(), 'product_' + random + '/' + fileName);
                await this.imageService.extractZip(directPath, distPath);
                const directoryPat = path.join(process.cwd(), 'product_' + random + '/' + 'image');
                const filesss = await this.readDir(directoryPat);
                for (const fileNme of filesss) {
                    const image2base64 = require('image-to-base64');
                    const imagePath = directoryPat + '/' + fileNme;
                    const imageType = fileNme.split('.')[1];
                    image2base64(imagePath)
                        .then(async (responsee) => {
                            const base64Data = new Buffer(responsee, 'base64');
                            if (env.imageserver === 's3') {
                                await this.s3Service.imageUpload((fileNme), base64Data, imageType);
                            } else {
                                await this.imageService.imageUpload((fileNme), base64Data);
                            }
                        }
                        )
                        .catch(
                            (error) => {
                                throw error;
                            }
                        );
                }
            }
            else {

                rimraf(path.join(process.cwd(), 'product_' + random), ((err: any) => {
                    if (err) {
                        throw err;
                    }
                }));
                fs.unlinkSync(mainFileName);
                return response.status(400).send({
                    status: 0,
                    message: 'Only xlsx and zip file are accepted',
                });
            }
        }
        rimraf(path.join(process.cwd(), 'product_' + random), ((err: any) => {
            if (err) {
                throw err;
            }
        }));
        fs.unlinkSync(mainFileName);
        
        const successResponse: any = {
            status: 1,
            message: 'Product Imported Successfully',
        };
        return response.status(200).send(successResponse);
    }


    @Post('/import-product-update')
    @Authorized(['admin', 'import-product'])
    public async ImportProductUpdate(@UploadedFile('file') files: any, @Res() response: any): Promise<any> {
        const currentDate = new Date();
        let timeString = currentDate.getDate() + "-" + (currentDate.getMonth() + 1) + "-" + currentDate.getFullYear() + "-" + currentDate.getHours() + ":" + currentDate.getMinutes();
        var logger = fs.createWriteStream('logs/update-product-logs.txt')
        var writeLine = (line) => logger.write(`\n${line}`);
        const csv = require("csvtojson");
        let b = files.originalname;
        let successCount:number=0
        let errorCount:number=0
        if (files.mimetype == "text/csv" && b.substring(b.lastIndexOf("."), b.length) == ".csv") {
            let mainFiles = await csv().fromString((files.buffer).toString());
        for (const data of mainFiles) {
            let productData = await this.productService.findOne({upc:data.UPC})
if(productData){

                            const ankle: boolean = data.ANKLE=='NULL' ? false : true
                            const closing: boolean = data.CLOSING=='NULL' ? false : true
                            const relevance: boolean = data.RELEVANCE=='NULL' ? false : true
                            const material: boolean = data.MATERIAL=='NULL' ? false : true
                            const soleType: boolean = data.SOLE_TYPE=='NULL' ? false : true
                            const fit: boolean = data.FIT=='NULL' ? false : true
                            const neck: boolean = data.NECK=='NULL' ? false : true
                            const washCare: boolean = data.WASH_CARE=='NULL' ? false : true
                            const style: boolean = data.STYLE=='NULL' ? false : true
                            const washType: boolean = data.WASH_TYPE=='NULL' ? false : true
                            const gender: boolean = data.GENDER=='NULL' ? false : true

                            const ankleText: any = ankle ? "<td><strong>ANKLE:</strong><br>" + data.ANKLE + "</td>" : ""
                            const closingText: any = closing ? "<td><strong>CLOSING:</strong><br>" + data.CLOSING + "</td>" : ""
                            const relevanceText: any = relevance ? "<td><strong>RELEVANCE:</strong><br>" + data.RELEVANCE + "</td>" : ""
                            const materialText: any = material ? "<td><strong>MATERIAL:</strong><br>" + data.MATERIAL + "</td>" : ""
                            const soleTypeText: any = soleType ? "<td><strong>SOLE TYPE:</strong><br>" + data.SOLE_TYPE + "</td>" : ""
                            const fitText: any = fit ? "<td><strong>FIT:</strong><br>" + data.FIT + "</td>" : ""
                            const neckText: any = neck ? "<td><strong>NECK:</strong><br>" + data.NECK + "</td>" : ""
                            const washCareText: any = washCare ? "<td><strong>WASH CARE:</strong><br>" + data.WASH_CARE + "</td>" : ""
                            const styleText: any = style ? "<td><strong>STYLE:</strong><br>" + data.STYLE + "</td>" : ""
                            const washTypeText: any = washType ? "<td><strong>WASH TYPE:</strong><br>" + data.WASH_TYPE + "</td>" : ""
                            const genderText: any = gender ? "<td><strong>GENDER:</strong><br>" + data.GENDER + "</td>" : ""
                            const description: any = data.Description!='NULL'?`<p> ${data.Description}</p><table><tbody><tr>${ankleText}${closingText}${relevanceText}${materialText}${soleTypeText}${fitText}${neckText}${washCareText}${styleText}${washTypeText}${genderText}</tr></tbody></table>`:productData.description
                            console.log("datadatadatadatadatadatadatadatadata",data)
                            console.log("data.MetaTagKeyword",data.MetaTagKeyword)
                            
                            let productColorAction:boolean=true
                            if(data.Color!='NULL' && data.colorCategory!='NULL'){

                                const getColorVareint:any = await getManager().query(`SELECT vv.value_name FROM product_varient_option_details pvod INNER JOIN product_varient_option pvo ON pvo.id=pvod.product_varient_option_id INNER JOIN varients_value vv ON vv.id=pvod.varients_value_id INNER JOIN varients v ON v.id=vv.varients_id WHERE pvo.product_id='${productData.productId}' AND v.category='${data.colorCategory}' AND v.name='color' LIMIT 1`)    

                                console.log("getColorVareint",getColorVareint)
                                if(getColorVareint.length==0){
                                    productColorAction=false
                                }else{

                                await getManager().query(`UPDATE product_varient_option_details pvod INNER JOIN product_varient_option pvo ON pvo.id=pvod.product_varient_option_id INNER JOIN varients_value vv ON vv.id=pvod.varients_value_id SET pvod.varients_value_id=(SELECT vv.id FROM varients v  INNER JOIN varients_value vv ON vv.varients_id=v.id WHERE v.category='${data.colorCategory}' AND v.name='color' AND vv.value_name='${data.Color}') WHERE pvo.product_id='${productData.productId}' AND vv.value_name='${getColorVareint[0].value_name}'`)

                                await getManager().query(`UPDATE product_varient_option SET varient_name=(REPLACE(varient_name,UPPER('${getColorVareint[0].value_name}'),UPPER('${data.Color}'))) WHERE product_id=${productData.productId}`)

                                 await getManager().query(`UPDATE product AS p1, (SELECT GROUP_CONCAT(pvo.varient_name) AS sizeColor, pvo.product_id AS productId FROM product AS p INNER JOIN product_varient_option AS pvo ON pvo.product_id=p.product_id INNER JOIN sku AS s ON s.id=pvo.sku_id WHERE s.quantity>0 GROUP BY pvo.product_id) AS p2 SET p1.product_size_color=p2.sizeColor WHERE p1.product_id=${productData.productId}`);
                                }
                            }

                            const productJson = {
                                "productName": data.Name!='NULL'?data.Name:productData.name,
                                "productDescription": description,
                                "metaTagTitle": data.MetaTagTitle!='NULL'?data.MetaTagTitle:productData.metaTagTitle,
                                "metaTagKeyword": data.MetaTagKeyword!='NULL'?data.MetaTagKeyword:productData.metaTagKeyword,
                                "metaTagDescription": data.MetaTagDescription!='NULL'?data.MetaTagDescription:productData.metaTagDescription,
                                "productSlug": data.productSlug!='NULL'?data.productSlug:productData.productSlug
                            }


                            console.log("productJson",productJson)
                            let productPriceCalAction:boolean=true
                            if(data.Price!='NULL' && data.DiscountPrice!='NULL' && data.TaxValue!='NULL'){
                                const productPriceCal = await this.updateDiscountPrice(productData.productId, data.Price, data.DiscountPrice, data.TaxValue)
                                if(productPriceCal){
                                productData.price = productPriceCal.price
                                productData.discount = productPriceCal.discount
                                productData.taxValue = productPriceCal.taxValue
                                productData.productSellingPrice = productPriceCal.productSellingPrice
                                }else{
                                    productPriceCalAction=false
                                }
                                
                                }
                            productData.name=productJson.productName
                            productData.description=productJson.productDescription
                            productData.metaTagTitle=productJson.metaTagTitle
                            productData.metaTagKeyword=productJson.metaTagKeyword
                            productData.metaTagDescription=productJson.metaTagDescription
                            productData.productSlug=productJson.productSlug
                            productData.modifiedDate = new Date()
                            productData.dateAvailable = new Date()

                            let searchKeywordsAction:boolean=true
                            if(data.CategoryId!="NULL"){
                                try {
                            const category:any = await getManager().query(`SELECT GROUP_CONCAT(name) categoryName FROM category WHERE category_id IN (${data.CategoryId})`)
                            if(category[0].categoryName){
                                productData.searchKeywords = `${category[0].categoryName},${productData.name},${data.UPC}`
                            }else{
                                searchKeywordsAction=false
                            }
                        } catch (error) {
                            searchKeywordsAction=false
                        }
                            }

                            let categoryUpdateAction:boolean=true
                            if (data.CategoryId!="NULL" && productPriceCalAction && searchKeywordsAction) {
                                try {
                                const category = data.CategoryId.split(",");
                                await this.productToCategoryService.delete({productId:productData.productId})
                                for (const categoryId of category) {
           
                                    const newProductToCategory: any = new ProductToCategory();
                                    newProductToCategory.productId = productData.productId;
                                    newProductToCategory.categoryId = categoryId;
                                    newProductToCategory.isActive = 1;
                                    await this.productToCategoryService.create(newProductToCategory);
                                }
                            } catch (error) {
                                categoryUpdateAction=false
                            }
                            }
                            let relatedProductAction:boolean=true
                            if(data.relatedProduct && data.relatedProduct!="NULL"){
                                try {
                                const relatedData = data.relatedProduct.split(",")
                                    await getManager().query(`DELETE FROM product_related WHERE product_id=${productData.productId}`)
                                for(const rel of relatedData){
                                    const productId = await this.productService.findOne({upc:rel})
                                    const newRelatedProduct: any = new ProductRelated();
                                    newRelatedProduct.productId = productData.productId;
                                    newRelatedProduct.relatedProductId = productId.productId;
                                    await this.productRelatedService.create(newRelatedProduct); 
                                }
                            } catch (error) {
                                relatedProductAction=false
                            }
                            }
                            console.log("productDataproductDataproductData",productData)
                            if(relatedProductAction && categoryUpdateAction && searchKeywordsAction && productPriceCalAction && productColorAction){
                                try {
if(data.Price!='NULL' && data.DiscountPrice!='NULL' && data.TaxValue!='NULL'){
                                        const skuId:any = await getManager().query(`SELECT group_concat(s.id) id FROM product p INNER JOIN product_varient_option po ON po.product_id=p.product_id INNER JOIN sku s ON s.id=po.sku_id INNER JOIN tax t ON t.tax_id=p.tax_value WHERE p.product_id=${productData.productId}`)
                                        console.log(skuId[0].id)
                                        await getManager().query(`UPDATE sku SET price=${productData.price} WHERE id IN (${skuId[0].id})`)
                                    }
                                    await this.productService.update(productData.productId, productData)    
                                    writeLine(`SUCCESS - UPC: ${data.UPC} Message: Product successfully updated [${timeString}]`);
                                    successCount++
                                } catch (error) {
                                    errorCount++
                                    writeLine(`ERROR - UPC: ${data.UPC} Message: Product data not updated "categoryUpdateAction":${categoryUpdateAction}, "searchKeywordsAction":${searchKeywordsAction}, "productPriceCalAction":${productPriceCalAction}, "productColorAction":${productColorAction}, relatedProductAction: ${relatedProductAction} [${timeString}]`);
                                }
                            }   else{
                                errorCount++
                                writeLine(`ERROR - UPC: ${data.UPC} Message: Product data not updated "categoryUpdateAction":${categoryUpdateAction}, "searchKeywordsAction":${searchKeywordsAction}, "productColorAction":${productColorAction}, "productPriceCalAction":${productPriceCalAction}, relatedProductAction: ${relatedProductAction} [${timeString}]`);
                            }


                        }else{
                            errorCount++
                            writeLine(`ERROR - UPC: ${data.UPC} Message: Product data not found [${timeString}]`);
                        }    
                    }
   
                }
        const successResponse: any = {
            status: 1,
            success: successCount,
            error: errorCount,
            message: 'Product Updated Successfully, Please download logs file and check',
        };
        return response.status(200).send(successResponse);
    }

    @Get('/download-file')
    public async downloadFile(@QueryParams() query:any, @Res() res:any): Promise<any>{
       const fileName = query.fileName;
       const folderPath = query.folderPath;
       const file = path.basename(fileName);
       const fullPath = path.join(folderPath, file);
       console.log(fullPath, "Nero full Path")
       return new Promise(() => {
           res.download(fullPath, fileName);
       });
    }

public async updateDiscountPrice(productId:any, price:any, discountPrice:any, taxValue:any){
        let checkNoDiscount:boolean=true
        const productPrice:any = Math.round(price)
        const productDiscountPrice:any = Math.round(discountPrice)
        const productDiscountWithoutTax:any = ((+discountPrice*100)/((+taxValue.substring(2,0))+100)).toFixed(2)
        let productPriceData:any={}
        if (productPrice == productDiscountPrice) {
            checkNoDiscount=false
        }
        if (productPrice >= productDiscountPrice) {
            const getTaxLength: number = (taxValue).length > 2 ? 2 : 1
            const getTaxStr: any = (taxValue).substring(0, getTaxLength)
            const taxValueInt = +getTaxStr + 100;

            productPriceData.price = (productPrice * 100) / taxValueInt;
            productPriceData.productSellingPrice = productDiscountPrice;
            productPriceData.taxValue = taxValue == "18%" ? 3 : taxValue == "12%" ? 2 : 1;
                if(checkNoDiscount){
                    productPriceData.discount = ((productPrice-productDiscountPrice) * 100) / productPrice;
                }else{
                    productPriceData.discount = 0;
                }
                const varientSkuArray: any = await this.productVarientOptionService.find({
                    where: {
                        productId: productId,
                    },
                });
                if (varientSkuArray) {
                    for (let v in varientSkuArray) {
                        const productDiscountData: any = await this.productDiscountService.findOne({
                            where: {
                                skuId: varientSkuArray[v].skuId
                            }
                        });
                        const _sku = getManager().getRepository(Sku)
                        await _sku.createQueryBuilder().update().set({ price: ((productPrice * 100) / taxValueInt).toString() }).where("id=:id", { id: varientSkuArray[v].skuId }).execute();
                        const _discount = getManager().getRepository(ProductDiscount)
                        if(checkNoDiscount){
                        if (productDiscountData) {
                            
                            await _discount.createQueryBuilder().update().set({ price: (productDiscountWithoutTax) }).where("sku_id=:sku_id", { sku_id: varientSkuArray[v].skuId }).execute();
                        } else {
                            const newDiscount: any = new ProductDiscount();
                            newDiscount.productId = productId;
                            newDiscount.quantity = 1;
                            newDiscount.skuId = varientSkuArray[v].skuId;
                            newDiscount.priority = 1;
                            newDiscount.price = productDiscountWithoutTax;
                            newDiscount.dateStart = new Date();
                            newDiscount.dateEnd = new Date("2033-12-31");
                            await this.productDiscountService.create(newDiscount);
                        }
                    }else{
                        const isDiscount = await _discount.find({where: {productId: productId} })
                        if(isDiscount.length>0){
                            await _discount.createQueryBuilder().delete().where("product_id=:productId", { productId: productId }).execute();
                        }
                    }
                    }
                }
                return productPriceData
            }else{
                return false
            }
            
}

    // Download sample zip for product import
    /**
     * @api {get} /api/product/download-product-sample Download Product Import Sample Zip
     * @apiGroup Product
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully download the file..!!",
     *      "status": "1",
     * }
     * @apiSampleRequest /api/product/download-product-sample
     * @apiErrorExample {json} Download Data
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/download-product-sample')
    public async downloadSample(@Res() response: any): Promise<any> {
        const excel = require('exceljs');
        // product list excel
        const productWorkbook = new excel.Workbook();
        const productWorksheet = productWorkbook.addWorksheet('product List');
        const products = [];
        // Excel sheet column define
        productWorksheet.columns = [
            { header: 'productId', key: 'id', size: 16, width: 15 },
            { header: 'ProductName', key: 'first_name', size: 16, width: 15 },
        ];
        productWorksheet.getCell('A1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        productWorksheet.getCell('B1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        const product = await this.productService.find({ select: ['productId', 'name'] });
        for (const prod of product) {
            products.push([prod.productId, prod.name]);
        }
        products.push(['If you want to map multiple related Product to product,you have to give relatedProductId splitted with commas (,) ']);
        productWorksheet.addRows(products);
        const productFileName = './demo/Productlist.xlsx';
        await productWorkbook.xlsx.writeFile(productFileName);
        // for category excel
        const workbook = new excel.Workbook();
        const worksheet = workbook.addWorksheet('Category List');
        const rows = [];
        // Excel sheet column define
        worksheet.columns = [
            { header: 'CategoryId', key: 'id', size: 16, width: 15 },
            { header: 'Levels', key: 'first_name', size: 16, width: 15 },
        ];
        worksheet.getCell('A1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('B1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        const select = [
            'CategoryPath.categoryId as categoryId',
            'category.name as name',
            'GROUP_CONCAT' + '(' + 'path.name' + ' ' + 'ORDER BY' + ' ' + 'CategoryPath.level' + ' ' + 'SEPARATOR' + " ' " + '>' + " ' " + ')' + ' ' + 'as' + ' ' + 'levels',
        ];
        const relations = [
            {
                tableName: 'CategoryPath.category',
                aliasName: 'category',
            },
            {
                tableName: 'CategoryPath.path',
                aliasName: 'path',
            },
        ];
        const groupBy = [
            {
                name: 'CategoryPath.category_id',
            },
        ];
        const whereConditions = [];
        const searchConditions = [];
        const sort = [];
        const vendorCategoryList: any = await this.categoryPathService.listByQueryBuilder(0, 0, select, whereConditions, searchConditions, relations, groupBy, sort, false, true);
        for (const id of vendorCategoryList) {
            rows.push([id.categoryId, id.levels]);
        }
        rows.push(['If you want to map multiple category to product,you have to give categoryId splitted with commas (,) ']);
        // Add all rows data in sheet
        worksheet.addRows(rows);
        const fileName = './demo/Category.xlsx';
        await workbook.xlsx.writeFile(fileName);
        const zipfolder = require('zip-a-folder');
        await zipfolder.zip(path.join(process.cwd(), 'demo'), path.join(process.cwd(), 'demo.zip'));
        const file = path.basename('/demo.zip');
        return new Promise(() => {
            response.download(file, 'demo.zip');
        });
    }

    public async readDir(pathfile: string): Promise<any> {
        return new Promise<any>((subresolve, subreject) => {
            fs.readdir(pathfile, (error, files) => {
                if (error) {
                    subreject(error);
                }
                subresolve(files);
            });
        });
    }

    // update stock  API
    /**
     * @api {post} /api/product/update-stock Update Stock API
     * @apiGroup Product
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {number} productId productId
     * @apiParam (Request body) {number} hasStock send 0 or 1
     * @apiParam (Request body) {object} productStock
     * @apiParam (Request body) {number} productStock.skuId skuId
     * @apiParam (Request body) {number} productStock.outOfStockThreshold for setting out of stock threshold
     * @apiParam (Request body) {number} productStock.notifyMinQuantity notifyMinQuantity
     * @apiParam (Request body) {number} productStock.minQuantityAllowedCart  minQuantityAllowedCart
     * @apiParam (Request body) {number} productStock.maxQuantityAllowedCart maxQuantityAllowedCart
     * @apiParam (Request body) {number} productStock.enableBackOrders enableBackOrders
     * @apiParamExample {json} Input
     * {
     *      "hasStock" : "",
     *      "productId" : "",
     *      "productStock": [{
     *      "skuId" : "",
     *      "outOfStockThreshold" : "",
     *      "notifyMinQuantity" : "",
     *      "minQuantityAllowedCart" : "",
     *      "maxQuantityAllowedCart" : "",
     *      "enableBackOrders" : "",
     *      }]
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully updated product stock.",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/product/update-stock
     * @apiErrorExample {json} stock error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/update-stock')
    @Authorized()
    public async manageStock(@Body({ validate: true }) updateStock: UpdateStockRequest, @Res() response: any): Promise<any> {

        const product = await this.productService.findOne({
            where: {
                productId: updateStock.productId,
            },
        });
        if (!product) {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid product Id.',
            };
            return response.status(400).send(errorResponse);
        }

        product.hasStock = updateStock.hasStock;
        const productStock = updateStock.productStock;
        const valArr: any = [];
        for (const value of productStock) {
            const sku = await this.skuService.findOne({
                where: {
                    id: value.skuId,
                },
            });
            if (!sku) {
                const errorResponse: any = {
                    status: 0,
                    message: 'Invalid sku Id.',
                };
                return response.status(400).send(errorResponse);
            }
            if (sku.quantity < value.outOfStockThreshold) {
                const errorResponse: any = {
                    status: 0,
                    message: 'outOfStockThreshold should be less than original quantity.',
                };
                return response.status(400).send(errorResponse);
            }
            sku.outOfStockThreshold = value.outOfStockThreshold ? value.outOfStockThreshold : sku.outOfStockThreshold;
            sku.notifyMinQuantity = value.notifyMinQuantity ? value.notifyMinQuantity : sku.notifyMinQuantity;
            sku.minQuantityAllowedCart = value.minQuantityAllowedCart ? value.minQuantityAllowedCart : sku.minQuantityAllowedCart;
            sku.maxQuantityAllowedCart = value.maxQuantityAllowedCart ? value.maxQuantityAllowedCart : sku.maxQuantityAllowedCart;
            sku.enableBackOrders = value.enableBackOrders ? value.enableBackOrders : sku.enableBackOrders;
            valArr.push(sku);
        }
        await this.skuService.create(valArr);
        const productValue = await this.productService.create(product);
        if (productValue) {
            const successResponse: any = {
                status: 1,
                message: 'successfully updated stock .',
                data: productValue,
            };
            return response.status(200).send(successResponse);
        } else {
            const errorResponse: any = {
                status: 0,
                message: 'unable to update',
            };
            return response.status(400).send(errorResponse);
        }
    }

    // add tire price  API
    /**
     * @api {post} /api/product/add-tire-price Add tire price API
     * @apiGroup Product
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {number} hasTirePrice send 0 or 1
     * @apiParam (Request body) {number} productId productId
     * @apiParam (Request body) {number} quantity
     * @apiParam (Request body) {number} price price
     * @apiParamExample {json} Input
     * {
     *      "hasTirePrice" : "",
     *      "productId" : "",
     *      "price" : "",
     *      "quantity" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully added tire price.",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/product/add-tire-price
     * @apiErrorExample {json} tire price error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/add-tire-price')
    @Authorized()
    public async addTirePrice(@Body({ validate: true }) tirePrice: CreateTirePriceRequest, @Res() response: any): Promise<any> {

        const product = await this.productService.findOne({
            where: {
                productId: tirePrice.productId,
            },
        });
        if (!product) {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid product Id.',
            };
            return response.status(400).send(errorResponse);
        }
        if (tirePrice.hasTirePrice) {
            product.hasTirePrice = tirePrice.hasTirePrice;
            await this.productService.create(product);
        }
        const tirePrices = new ProductTirePrice();
        tirePrices.productId = tirePrice.productId;
        tirePrices.quantity = tirePrice.quantity;
        tirePrices.price = tirePrice.price;
        const productSave = await this.productTirePriceService.create(tirePrices);
        if (productSave) {
            const successResponse: any = {
                status: 1,
                message: 'Successfully added tire price for this product.',
                data: productSave,
            };
            return response.status(200).send(successResponse);
        } else {
            const errorResponse: any = {
                status: 0,
                message: 'Unable to add tire price.',
            };
            return response.status(400).send(errorResponse);
        }
    }

    // Delete tire price API
    /**
     * @api {delete} /api/product/delete-tire-price/:id Delete Product Tire Price API
     * @apiGroup Product
     * @apiHeader {String} Authorization
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully deleted.",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/product/delete-tire-price/:id
     * @apiErrorExample {json} Product error
     * HTTP/1.1 500 Internal Server Error
     */
    @Delete('/delete-tire-price/:id')
    @Authorized()
    public async delete(@Param('id') id: number, @Res() response: any, @Req() request: any): Promise<any> {

        const tire = await this.productTirePriceService.findOne({
            where: {
                id,
            },
        });
        if (!tire) {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid Id.',
            };
            return response.status(400).send(errorResponse);
        }
        const deleteTirePrice = await this.productTirePriceService.delete(id);
        if (deleteTirePrice) {
            const successResponse: any = {
                status: 1,
                message: 'Successfully deleted.',
            };
            return response.status(200).send(successResponse);
        } else {
            const errorResponse: any = {
                status: 0,
                message: 'Unable to delete',
            };
            return response.status(400).send(errorResponse);
        }
    }

    //   Get Product Price List API
    /**
     * @api {get} /api/product/get-product-tire-price-list Get product tire price list API
     * @apiGroup Product
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} productId productId
     * @apiParam (Request body) {Number} limit limit
     * @apiParam (Request body) {Number} offset offset
     * @apiParam (Request body) {String} count count
     * @apiParamExample {json} Input
     * {
     *      "productId" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get tire price list",
     *      "data":"{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/product/get-product-tire-price-list
     * @apiErrorExample {json} product error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/get-product-tire-price-list')
    @Authorized('')
    public async getCustomerAddress(@QueryParam('productId') productId: number, @QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('count') count: number | boolean, @Req() request: any, @Res() response: any): Promise<any> {
        const WhereConditions = [
            {
                name: 'productId',
                value: productId,
            },
        ];
        const tire = await this.productTirePriceService.list(limit, offset, WhereConditions, count);
        const successResponse: any = {
            status: 1,
            message: 'Successfully Get product tire price',
            data: tire,
        };
        return response.status(200).send(successResponse);
    }

    // Inventory Product List API
    /**
     * @api {get} /api/product/inventory-product-list Invendory Product List API
     * @apiGroup Product
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} limit limit
     * @apiParam (Request body) {Number} offset offset
     * @apiParam (Request body) {String} keyword keyword
     * @apiParam (Request body) {String} sku sku
     * @apiParam (Request body) {String} status status
     * @apiParam (Request body) {Number} price=1/2 if 1->asc 2->desc
     * @apiParam (Request body) {Number} count count in number or boolean
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "status": "1"
     *      "message": "Successfully get product list",
     *      "data":"{}"
     * }
     * @apiSampleRequest /api/product/inventory-product-list
     * @apiErrorExample {json} productList error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/inventory-product-list')
    @Authorized(['admin', 'inventory-list'])
    public async inventoryProductList(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('keyword') keyword: string, @QueryParam('sku') sku: string, @QueryParam('status') status: string, @QueryParam('price') price: number, @QueryParam('count') count: number | boolean, @Res() response: any): Promise<Product> {
        const select = ['productId', 'sku', 'name', 'quantity', 'price', 'productSlug', 'isActive', 'hasStock', 'hasTirePrice', 'outOfStockThreshold', 'notifyMinQuantity', 'minQuantityAllowedCart', 'maxQuantityAllowedCart', 'maxQuantityAllowedCart', 'enableBackOrders', 'modifiedDate', 'isSimplified', 'skuId'];

        const relation = [];

        const WhereConditions = [
            {
                name: 'name',
                op: 'like',
                value: keyword,
            }, {
                name: 'sku',
                op: 'like',
                value: sku,
            }, {
                name: 'isActive',
                op: 'like',
                value: status,
            },
        ];
        const productLists: any = await this.productService.list(limit, offset, select, relation, WhereConditions, 0, price, count);
        if (count) {
            const successRes: any = {
                status: 1,
                message: 'Successfully got count ',
                data: productLists,
            };
            return response.status(200).send(successRes);
        }
        const promise = productLists.map(async (result: any) => {
            let skuValue = undefined;
            if (result.isSimplified === 0) {
                skuValue = await this.productService.findSkuForProductVarient(result.productId);
            } else {
                skuValue = await this.skuService.findAll({ where: { id: result.skuId } });
            }
            const temp: any = result;
            temp.skuValue = skuValue;
            return temp;
        });
        const value = await Promise.all(promise);
        const successResponse: any = {
            status: 1,
            message: 'Successfully got the complete product list. ',
            data: value,
        };
        return response.status(200).send(successResponse);
    }

    //  Update sku for product API
    /**
     * @api {post} /api/product/update-sku   update sku API
     * @apiGroup Product
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} limit limit
     * @apiParam (Request body) {Number} offset offset
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully updated sku.",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/product/update-sku
     * @apiErrorExample {json} product error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/update-sku')
    @Authorized()
    public async updateOrderProductShippingInformation(@BodyParam('limit') limit: number, @BodyParam('offset') offset: number, @Res() response: any): Promise<any> {
        const products = await this.productService.find({
            take: limit,
            skip: offset,
        });
        for (const product of products) {
            const updateProduct = await this.productService.findOne({ where: { productId: product.productId } });
            let saveSku;
            const findSku = await this.skuService.findOne({ where: { skuName: product.sku } });
            if (findSku) {
                const finddSku = await this.productService.findSkuName(updateProduct.productId, updateProduct.sku, 0);
                if (finddSku) {
                    const errorResponse: any = {
                        status: 0,
                        message: 'Duplicate sku name, give some other name',
                    };
                    return response.status(400).send(errorResponse);
                } else {
                    findSku.skuName = updateProduct.sku;
                    findSku.price = updateProduct.price;
                    findSku.quantity = updateProduct.quantity;
                    findSku.isActive = updateProduct.isActive;
                    saveSku = await this.skuService.create(findSku);
                }
            } else {
                const newSku: any = new Sku();
                newSku.skuName = updateProduct.sku;
                newSku.price = updateProduct.price;
                newSku.quantity = updateProduct.quantity;
                newSku.isActive = updateProduct.isActive;
                saveSku = await this.skuService.create(newSku);
            }
            // ending sku //
            updateProduct.skuId = saveSku.id;
            updateProduct.isSimplified = 1;
            await this.productService.create(updateProduct);
        }
        const successResponse: any = {
            status: 1,
            message: 'Successfully updated Sku',
        };
        return response.status(200).send(successResponse);
    }

    // Delete Product Varient Option API
    /**
     * @api {delete} /api/product/delete-product-varient-option/:id Delete Product Varient Option API
     * @apiGroup Product
     * @apiHeader {String} Authorization
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully deleted.",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/product/delete-product-varient-option/:id
     * @apiErrorExample {json} Product error
     * HTTP/1.1 500 Internal Server Error
     */
    @Delete('/delete-product-varient-option/:id')
    @Authorized()
    public async deleteProductVarientOption(@Param('id') id: number, @Res() response: any, @Req() request: any): Promise<any> {

        const productVarientOptionId = await this.productVarientOptionService.findOne({
            where: {
                id,
            },
        });
        if (!productVarientOptionId) {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid Id.',
            };
            return response.status(400).send(errorResponse);
        }
        const orderProductId = await this.orderProductService.productVarientPaymentProcess(id);
        if (orderProductId) {
            const errorResponse: any = {
                status: 0,
                message: 'You cannot delete this variant as this particular variant under product is already ordered.',
            };
            return response.status(400).send(errorResponse);
        }
        await this.skuService.delete({ id: productVarientOptionId.skuId });
        const productVarientOption = await this.productVarientOptionService.delete(id);
        if (productVarientOption) {
            const successResponse: any = {
                status: 1,
                message: 'Successfully deleted.',
            };
            return response.status(200).send(successResponse);
        } else {
            const errorResponse: any = {
                status: 0,
                message: 'unable to delete',
            };
            return response.status(400).send(errorResponse);
        }
    }

    // update Feature Product API
    /**
     * @api {put} /api/product/update-featureproduct/:id Update Feature Product API
     * @apiGroup Product
     * @apiParam (Request body) {number} isFeature product isFeature should be 0 or 1
     * @apiParamExample {json} Input
     * {
     *      "isFeature" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully updated feature Product.",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/product/update-featureproduct/:id
     * @apiErrorExample {json} isFeature error
     * HTTP/1.1 500 Internal Server Error
     */
    @Put('/update-featureproduct/:id')
    @Authorized()
    public async updateFeatureProduct(@Param('id') id: number, @Body({ validate: true }) updateFeatureProductParam: UpdateFeatureProduct, @Res() response: any): Promise<any> {

        const product = await this.productService.findOne({
            where: {
                productId: id,
            },
        });
        if (!product) {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid productId',
            };
            return response.status(400).send(errorResponse);
        }
        product.isFeatured = updateFeatureProductParam.isFeature;
        const productSave = await this.productService.create(product);
        if (productSave) {
            const successResponse: any = {
                status: 1,
                message: 'product updated successfully.',
                data: productSave,
            };
            return response.status(200).send(successResponse);
        } else {
            const errorResponse: any = {
                status: 0,
                message: 'unable to updated product',
            };
            return response.status(400).send(errorResponse);
        }
    }

    public async validate_slug($slug: string, $id: number = 0, $count: number = 0): Promise<string> {
        const slugCount = await this.productService.checkSlug($slug, $id, $count);
        if (slugCount) {
            if (!$count) {
                $count = 1;
            } else {
                $count++;
            }
            return await this.validate_slug($slug, $id, $count);
        } else {
            if ($count > 0) {
                $slug = $slug + $count;
            }
            return $slug;
        }
    }


    @Get("/get-products-by-ids")
    public async getProductsWithIds(@QueryParam('ids') ids: string, @Res() response: any): Promise<void> {
        let decrptedData = await this._commonService.decrptData(ids);
        let idsArray = decrptedData.split(",");
        var imageoutput = await this.productImageService.findByIds(idsArray);
        // let result = await this.productService.findByIds(idsArray);

        const successResponse: any = {
            status: 1,
            message: 'records found successfully.',
            data: imageoutput
        };
        return response.status(200).send(successResponse);
    }

    
    @Get("/get-discount-products/:productId")
    public async getDiscountProductsWithIds(@Param('productId') productId: any, @Res() response: any){
        const _discount = getManager().getRepository(DiscountOffer)
        const disocuntResult = await _discount.findOne(productId)
        let idsArray = disocuntResult.productIds.split(",");
        const imageoutput:any = await this.productImageService.findDisocuntProduct(idsArray);
        let result = imageoutput.map((item:any)=>{
            return Object.assign(item, {flag:0})
        })
        const successResponse: any = {
            status: 1,
            message: 'records found successfully.',
            data: result
        };
        return response.status(200).send(successResponse);
    }

    @Get("/get-products-list-by-ids")
    public async getProductsListWithIds(@QueryParam('ids') ids: string, @Res() response: any): Promise<void> {
        let result = await this.productService.findByIds(ids);
        const successResponse: any = {
            status: 200,
            message: 'records found successfully.',
            data: result
        };
        return response.status(200).send(successResponse);
    }

    @Get('/all-active-products')

    public async getAllActiveProducts(@Req() request: any, @Res() response: any): Promise<any> {

        const data = await this.productService.getAllActiveProducts();
        const successResponse: any = {
            status: 200,
            message: 'records found successfully.',
            data: data
        };
        return response.status(200).send(successResponse);

    }

    @Post('/update-price-and-discount-old')
    public async updatePriceAndDiscountOld(@UploadedFile('file') files: any, @Res() response: any): Promise<any> {
        const currentDate = new Date();
        let timeString = currentDate.getDate() + "-" + (currentDate.getMonth() + 1) + "-" + currentDate.getFullYear() + "-" + currentDate.getHours() + ":" + currentDate.getMinutes();
        try {
            const csv = require("csvtojson");
            let b = files.originalname;
            if (files.mimetype == "text/csv" && b.substring(b.lastIndexOf("."), b.length) == ".csv") {
                let _j = await csv().fromString((files.buffer).toString());
                for (let s in _j) {
                    
                    if (parseFloat(_j[s].Price) > parseFloat(_j[s].DiscountPrice)) {
                        const getTaxLength: number = (_j[s].TaxValue).length > 2 ? 2 : 1
                        const getTaxStr: any = (_j[s].TaxValue).substring(0, getTaxLength)
                        const taxValueInt = +getTaxStr + 100
                        const SkuId = await this.skuService.findOne({ where: { skuName: _j[s].SKU } });

                        if (SkuId) {
                            const varientSku: any = await this.productVarientOptionService.findOne({
                                where: {
                                    skuId: SkuId.id,
                                },
                            });

                            const _sku = getManager().getRepository(Sku)
                            await _sku.createQueryBuilder().update().set({ price: ((_j[s].Price * 100) / taxValueInt).toString() }).where("sku_name=:sku_name", { sku_name: _j[s].SKU }).execute();
                            if (varientSku) {
                                let product = new Product();
                                product.price = (_j[s].Price * 100) / taxValueInt;
                                product.productSellingPrice = _j[s].Price;
                                product.taxValue = _j[s].TaxValue == "18%" ? 3 : _j[s].TaxValue == "12%" ? 2 : 1;
                                product.discount = (_j[s].DiscountPrice * 100) / taxValueInt;
                                var productId = varientSku.productId
                                await this.productService.update(productId, product)
                                const _discount = getManager().getRepository(ProductDiscount)

                                const productDiscountData: any = await this.productDiscountService.findOne({
                                    where: {
                                        productId: productId
                                    }
                                });
                                if (!productDiscountData) {
                                    const newDiscount: any = new ProductDiscount();
                                    newDiscount.productId = productId;
                                    newDiscount.quantity = 1;
                                    newDiscount.skuId = SkuId.id;
                                    newDiscount.priority = 1;
                                    newDiscount.price = _j[s].DiscountPrice;
                                    newDiscount.dateStart = new Date("2023-05-15");
                                    newDiscount.dateEnd = new Date("2033-12-31");
                                    await this.productDiscountService.create(newDiscount);

                                } else {
                                     await _discount.createQueryBuilder().update().set({ price: (_j[s].DiscountPrice) }).where("sku_id=:sku_id", { sku_id: SkuId.id }).execute();
                                }
                            } else {  
                                var logger = fs.createWriteStream('logs/update-product-price.txt', {
                                    flags: 'a' // 'a' means appending (old data will be preserved)
                                    })
    
                                    var writeLine = (line) => logger.write(`\n${line}`);
                                    writeLine(`SKU: ${_j[s].SKU} Error Message:Please enter valid sku [${timeString}]`);
                                var Response: any = {
                                    status: 0,
                                    message: 'Please enter valid sku',
                                };
                                // return response.status(400).send(Response);

                            }
                        } else {
                            var logger = fs.createWriteStream('logs/update-product-price.txt', {
                                flags: 'a' // 'a' means appending (old data will be preserved)
                                })

                                var writeLine = (line) => logger.write(`\n${line}`);
                                writeLine(`SKU: ${_j[s].SKU} Error Message:Please enter valid sku [${timeString}]`);
                                 



                            var Response: any = {
                                status: 0,
                                message: 'Please enter valid sku',
                            };
                            // return response.status(400).send(Response);

                        }


                        var Response: any = {
                            status: 1,
                            message: 'Product updated successfully',
                        };
                        // return response.status(200).send(Response);
                    } else {
                        var logger = fs.createWriteStream('logs/update-product-price.txt', {
                            flags: 'a' // 'a' means appending (old data will be preserved)
                            })

                            var writeLine = (line) => logger.write(`\n${line}`);
                            writeLine(`SKU: ${_j[s].SKU} Error Message:Price should be greater then Discount price [${timeString}]`);
                        
                         var Response: any = {
                            status: 0,
                            message: 'Price should be greater then Discount price',
                        };
                        //return response.status(400).send(Response);

                    }
                }
                if (Response.status == 1) {
                    return response.status(200).send(Response);

                } else {
                    return response.status(400).send(Response);

                }
            }

        } catch (e) {
            const ErrorResponse: any = {
                status: 0,
                message: 'Something went wrong',
            };
            return response.status(200).send(ErrorResponse);

        }
    }

    @Get('/download-custom-file')
    public async download(@Req() request: any, @Res() response: any): Promise<any> {
        let file_name=request.query.filename;
       const directoryPath = path.join(process.cwd(), 'logs' + '/'+file_name);
      let data = fs.readFileSync(directoryPath);
       let base64=data.toString('base64')
       let Response:any={
        status: 1,
        data:base64,
        message: 'successfully base64 generated for this file',
       }
        return response.status(200).send(Response);
    }

    @Post('/update-price-and-discount')
    public async updatePriceAndDiscount(@UploadedFile('file') files: any, @Res() response: any): Promise<any> {
        const currentDate = new Date();
        let timeString = currentDate.getDate() + "-" + (currentDate.getMonth() + 1) + "-" + currentDate.getFullYear() + "-" + currentDate.getHours() + ":" + currentDate.getMinutes();
        const csv = require("csvtojson");
        let b = files.originalname;
        if (files.mimetype == "text/csv" && b.substring(b.lastIndexOf("."), b.length) == ".csv") {
            let _j = await csv().fromString((files.buffer).toString());
            for (let s in _j) {
                let checkNoDiscount:boolean=true
                const productPrice:any = Math.round(_j[s].Price)
                const productDiscountPrice:any = Math.round(_j[s].DiscountPrice)
                const productDiscountWithoutTax:any = ((+_j[s].DiscountPrice*100)/((+_j[s].TaxValue.substring(2,0))+100)).toFixed(2)
                
                if (productPrice == productDiscountPrice) {
                    checkNoDiscount=false
                }
                if (productPrice >= productDiscountPrice) {
                    const getTaxLength: number = (_j[s].TaxValue).length > 2 ? 2 : 1
                    const getTaxStr: any = (_j[s].TaxValue).substring(0, getTaxLength)
                    const taxValueInt = +getTaxStr + 100;
                    let productResult = await this.productService.findOne({
                        where: {
                            upc: _j[s].Upc,
                        },
                    });
                    if (productResult) {
                        let productId = productResult.productId;
                        let product = new Product();
                        product.price = (productPrice * 100) / taxValueInt;
                        product.productSellingPrice = productDiscountPrice;
                        product.taxValue = _j[s].TaxValue == "18%" ? 3 : _j[s].TaxValue == "12%" ? 2 : 1;
                        if(checkNoDiscount){
                            product.discount = ((productPrice-productDiscountPrice) * 100) / productPrice;
                        }else{
                            product.discount = 0;
                        }
                        // var productId = varientSku.productId
                        await this.productService.update(productId, product)
                        const varientSkuArray: any = await this.productVarientOptionService.find({
                            where: {
                                productId: productId,
                            },
                        });
                        if (varientSkuArray) {
                            for (let v in varientSkuArray) {

                                const productDiscountData: any = await this.productDiscountService.findOne({
                                    where: {
                                        skuId: varientSkuArray[v].skuId
                                    }
                                });
                                const _sku = getManager().getRepository(Sku)
                                await _sku.createQueryBuilder().update().set({ price: ((productPrice * 100) / taxValueInt).toString() }).where("id=:id", { id: varientSkuArray[v].skuId }).execute();
                                const _discount = getManager().getRepository(ProductDiscount)
                                if(checkNoDiscount){
                                if (productDiscountData) {
                                    
                                    await _discount.createQueryBuilder().update().set({ price: (productDiscountWithoutTax) }).where("sku_id=:sku_id", { sku_id: varientSkuArray[v].skuId }).execute();
                                } else {
                                    const newDiscount: any = new ProductDiscount();
                                    newDiscount.productId = productId;
                                    newDiscount.quantity = 1;
                                    newDiscount.skuId = varientSkuArray[v].skuId;
                                    newDiscount.priority = 1;
                                    newDiscount.price = productDiscountWithoutTax;
                                    newDiscount.dateStart = new Date("2023-05-15");
                                    newDiscount.dateEnd = new Date("2033-12-31");
                                    await this.productDiscountService.create(newDiscount);
                                }
                            }else{
                                const isDiscount = await _discount.find({where: {productId: productResult.productId} })
                                if(isDiscount.length>0){
                                    await _discount.createQueryBuilder().delete().where("product_id=:productId", { productId: productResult.productId }).execute();
                                }
                            }
                            }

                        }
                        var logger = fs.createWriteStream('logs/update-product-price.txt', {
                            flags: 'a' // 'a' means appending (old data will be preserved)
                            })
    
                            var writeLine = (line) => logger.write(`\n${line}`);
                            writeLine(`Status:Success, Message:Product updated successfully,UPC: ${_j[s].Upc},Date:[${timeString}]`);
                             var Response: any = {
                            status: 1,
                            message: 'Product updated successfully',
                        };

                    } else {
                        var logger = fs.createWriteStream('logs/update-product-price.txt', {
                            flags: 'a' // 'a' means appending (old data will be preserved)
                            })

                            var writeLine = (line) => logger.write(`\n${line}`);
                            writeLine(`Status:failed, Message:Please provide valid UPC ,UPC: ${_j[s].Upc},Date:[${timeString}]`);
                        var Response: any = {
                            status: 0,
                            message: 'Please provide valid UPC',
                        };
                    }
               
                }else{
                    var logger = fs.createWriteStream('logs/update-product-price.txt', {
                        flags: 'a' // 'a' means appending (old data will be preserved)
                        })

                        var writeLine = (line) => logger.write(`\n${line}`);
                        writeLine(`Status:failed, Message:Price should be greater then Discount price,UPC: ${_j[s].Upc},Date:[${timeString}]`);
                    var Response: any = {
                        status: 0,
                        message: 'Price should be greater then Discount price',
                    };

                }

            }
            if(Response.status==1){
               return response.status(200).send(Response);
            }else{
             return response.status(400).send(Response);
 
            }


        }
    }

    @Get('/get-replacement-product-option/:productId')
    
    public async getReplacementProductOption(@Param('productId') productId:number, @Res() response: any): Promise<any> {
            const availableProduct = await getManager().getRepository(ProductVarientOption).createQueryBuilder('pvo')
            .select(['pvo.varient_name varientName', 'pvo.id vareintId', 'sku.sku_name skuName', 'sku.quantity quantity'])
            .innerJoin(Sku, 'sku', 'pvo.sku_id=sku.id')
            .where('pvo.product_id = :productId', { productId: productId })
            .andWhere('sku.quantity>0')
            .execute()
        
        let successResponse: any 
        if(availableProduct.length>0){
successResponse = {
    status: 200,
    message: 'records found successfully.',
    data: availableProduct
}
        }else{
            successResponse = {
                status: 500,
                message: 'No record Found',
                data: []
            }
        }



        return response.status(200).send(successResponse);
    }

    @Get('/get-product-by-sku/:skuName')
    
    public async getProductBySku(@Param('skuName') skuName:any, @Res() response: any): Promise<any> {
            const availableProduct = await getManager().getRepository(ProductVarientOption).createQueryBuilder('pvo')
            .select(['p.upc upc', 'p.name productName', 'p.product_selling_price price', 'pvo.varient_name varientName', 'sku.sku_name skuName', 'pvo.product_id productId'])
            .innerJoin(Sku, 'sku', 'pvo.sku_id=sku.id')
            .innerJoin(Product, 'p', 'pvo.product_id=p.product_id')
            .where('sku.sku_name = :skuName', { skuName: skuName })
            .andWhere('sku.quantity>0')
            .andWhere('sku.is_active=1')
            .getRawOne()
        
        let successResponse: any 
        if(availableProduct){
successResponse = {
    status: 200,
    message: 'records found successfully.',
    data: availableProduct
}
        }else{
            successResponse = {
                status: 500,
                message: 'No record Found',
                data: null
            }
        }



        return response.status(200).send(successResponse);
    }

    @Get('/dashboard-admin/get-total-orders-count')
    @Authorized()
    public async getTotalOrdersCount(@QueryParam('duration') duration: number, @Req() request: any, @Res() response: any): Promise<any> {
        
        let queryCount = '';
        if (duration === 1 && duration) {
            
             queryCount = await getManager().query('SELECT COUNT(order_id) ordersCount FROM `order` WHERE order_status_id NOT IN (11, 13) AND DATE(created_date) = DATE(NOW())');
        } else if (duration === 2 && duration) {
            
             queryCount = await getManager().query('SELECT COUNT(order_id) ordersCount FROM `order` WHERE order_status_id NOT IN (11, 13) AND WEEK(created_date) = WEEK(NOW()) AND MONTH(created_date) = MONTH(NOW()) AND YEAR(created_date) = YEAR(NOW())');
        } else if (duration === 3 && duration) {
            
             queryCount = await getManager().query('SELECT COUNT(order_id) ordersCount FROM `order` WHERE order_status_id NOT IN (11, 13) AND MONTH(created_date) = MONTH(NOW()) AND YEAR(created_date) = YEAR(NOW())');
        } else if (duration === 4 && duration) {
            
             queryCount = await getManager().query('SELECT COUNT(order_id) ordersCount FROM `order` WHERE order_status_id NOT IN (11, 13) AND YEAR(created_date) = YEAR(NOW())');
        }

        return response.status(200).send({
            status: 1,
            message: 'Successfully got dashboard orders and vendors count based on orders',
            data: queryCount[0],
        });
    }
@Get('/product-varient-filter-sync')
public async productVarientFilterSync(){
    await getManager().query(`UPDATE product_varient_option SET varient_name=CONCAT(1000,varient_name) WHERE varient_name LIKE "S,%" OR varient_name LIKE "M,%" OR varient_name LIKE "L,%" OR varient_name LIKE "XL,%" OR varient_name LIKE "XXL,%" OR varient_name LIKE "XS,%"`)
    await getManager().query(`UPDATE product AS p1, (SELECT GROUP_CONCAT(pvo.varient_name) AS sizeColor, pvo.product_id AS productId FROM product AS p INNER JOIN product_varient_option AS pvo ON pvo.product_id=p.product_id INNER JOIN sku AS s ON s.id=pvo.sku_id WHERE s.quantity>0 GROUP BY pvo.product_id) AS p2 SET p1.product_size_color=p2.sizeColor WHERE p1.product_id=p2.productId`);
    await getManager().query(`UPDATE product_varient_option SET varient_name=REPLACE(varient_name,1000,'') WHERE varient_name LIKE "1000S,%" OR varient_name LIKE "1000M,%" OR varient_name LIKE "1000L,%" OR varient_name LIKE "1000XL,%" OR varient_name LIKE "1000XXL,%" OR varient_name LIKE "1000XS,%"`)
     return "Successfull update the products"
}

//Download product Detail 
     @Get('/product-detail-list-download')
     public async orderDetailExcelData(@Req() req: any,@QueryParam('limit') limit: number, @QueryParam('offset') offset: number,@QueryParam('status') status: string,@QueryParam('dateFilter') dateFilter: string, @Res() response: any): Promise<any> {
       if(req.headers.authorization=="bearer 3ff0ffe8-1431-433a-ab13-104090ab131a"){
            if(limit>100){
                return {
                    status: 500,
                    message: "The maximum data limit should not exceed 100",
                    data: false,
                } 
            }
        const excel = require('exceljs');
         const workbook = new excel.Workbook();
         const worksheet = workbook.addWorksheet('Product Detail Sheet');
         const rows = [];
    //     var d = new Date(),
    //     month = '' + (d.getMonth() + 1),
    //     day = '' + d.getDate(),
    //     year = d.getFullYear();
      
    // if (month.length < 2) 
    //     month = '0' + month;
    // if (day.length < 2) 
    //     day = '0' + day;
        //let todayDate= [year, month, day].join('-')
    let modified_Date= dateFilter?`and date(p.modified_date)=date('${dateFilter}')`:'' ;
    let limitCond=limit && offset?`limit ${limit} OFFSET ${offset}`:limit?`limit ${limit}`:''
        const productLists = await getManager().query(`SELECT MAX(p.upc) upc, s.sku_name skuName, (SELECT MAX(cc.name) FROM category cc WHERE cc.category_id=MAX(c.parent_int)) AS 'parentCategory', MAX(c.name) categoryName, MAX(s.quantity) skuQuantity, MAX(p.name) productName, MAX(p.description) description, MAX(p.meta_tag_description) metaDescription, MAX(SUBSTR(pvo.varient_name, 1, LOCATE(',', pvo.varient_name) - 1)) Size, MAX(SUBSTR(pvo.varient_name, LOCATE(',', pvo.varient_name) + 1)) Color, CONCAT('https://redchief.in/product/',MAX(p.product_slug)) link, 
        CONCAT('https://d2lo0tepqt73yr.cloudfront.net/', MAX(im.container_name), MAX(im.image)) image, MAX(p.product_selling_price) sellingPrice, MAX(ROUND(p.price+(p.price*t.tax_percentage/100))) price, CONCAT(MAX(p.discount),'%') discount FROM product p INNER JOIN product_varient_option pvo ON pvo.product_id=p.product_id INNER JOIN sku s ON s.id=pvo.sku_id INNER JOIN product_to_category ptc ON p.product_id=ptc.product_id INNER JOIN category c ON c.category_id=ptc.category_id INNER JOIN tax t ON p.tax_value=t.tax_id INNER JOIN product_image im ON im.product_id=p.product_id WHERE default_image=1 ${modified_Date} AND p.is_active IN (1) AND c.parent_int!=0 GROUP BY skuName ${limitCond}`)
        worksheet.columns = [
                           { header: 'id', key: 'image', size: 16, width: 30 },
                           { header: 'title', key: 'name', size: 16, width: 30 },
                           { header: 'description', key: 'description', size: 16, width: 60 },
                           { header: 'availability', key: 'availability', size: 16, width: 15 },
                           { header: 'condition', key: 'condition', size: 16, width: 15 },
                           { header: 'price', key: 'price', size: 16, width: 30 },
                           { header: 'link', key: 'link', size: 16, width: 30 },
                           { header: 'image_link', key: 'image_link', size: 16, width: 60 },
                           { header: 'google_product_category', key: 'google_product_category', size: 16, width: 60 },
                           { header: 'brand', key: 'brand', size: 16, width: 60 },
                           { header: 'color', key: 'color', size: 16, width: 30 },
                           { header: 'sale_price', key: 'sale_price', size: 16, width: 60 },
                           { header: 'size', key: 'size', size: 16, width: 30 },
                           { header: 'item_group_id', key: 'item_group_id', size: 16, width: 30 },

                       ];

                       worksheet.getCell('A1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                       worksheet.getCell('B1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                       worksheet.getCell('C1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                       worksheet.getCell('D1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

                       worksheet.getCell('E1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                       worksheet.getCell('F1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                       worksheet.getCell('G1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                       worksheet.getCell('H1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

                       worksheet.getCell('I1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                       worksheet.getCell('J1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                       worksheet.getCell('K1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                       worksheet.getCell('L1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

                       worksheet.getCell('M1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                       worksheet.getCell('N1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                       worksheet.getCell('O1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                       worksheet.getCell('P1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

       for (const data of productLists) {
                    rows.push([data.skuName, data.productName, data.description,data.skuQuantity>0?"YES":"NO", "New",data.price,data.link,data.image,data.parentCategory+">"+data.categoryName,'Redchief',data.Color,data.sellingPrice,data.Size,data.upc]);                   }
                 // Add all rows data in sheet
                 worksheet.addRows(rows);
                 const fileName = './ProductExcel' + Date.now() + '.csv';
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
}

