/*
* spurtcommerce
* http://www.spurtcommerce.com
*
* Copyright (c) 2022 Piccosoft Software Labs Pvt Ltd
* Author Piccosoft Software Labs Pvt Ltd <support@spurtcommerce.com>
* Licensed under the MIT license.
*/

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { Logger, LoggerInterface } from '../../decorators/Logger';
import { Like, getManager } from 'typeorm/index';
import { ProductImageRepository } from '../repositories/ProductImageRepository';
import { ProductImage } from '../models/ProductImage';

@Service()
export class ProductImageService {

    constructor(
        @OrmRepository() private productImageRepository: ProductImageRepository,
        @Logger(__filename) private log: LoggerInterface) {
    }

    // create product
    public async create(productImage: ProductImage): Promise<ProductImage> {
        this.log.info('Create a new productImage ');
        return this.productImageRepository.save(productImage);
    }
    // find one product image
    public findOne(productImage: any): Promise<ProductImage> {
        return this.productImageRepository.findOne(productImage);
    }

    // find all product images
    public findAll(productImage: any): Promise<any> {
        return this.productImageRepository.find(productImage);
    }

    // find all product images
    public find(): Promise<any> {
        return this.productImageRepository.find();
    }

    // update product images
    public update(id: any, productImage: ProductImage): Promise<ProductImage> {
        this.log.info('Update a productImage');
        productImage.productImageId = id;
        return this.productImageRepository.save(productImage);
    }
    // ProductImage List
    public list(limit: any, offset: any, select: any = [], search: any = [], whereConditions: any = [], count: number | boolean): Promise<any> {
        const condition: any = {};

        if (select && select.length > 0) {
            condition.select = select;
        }
        condition.where = {};

        if (whereConditions && whereConditions.length > 0) {
            whereConditions.forEach((item: any) => {
                condition.where[item.name] = item.value;
            });
        }

        if (search && search.length > 0) {
            search.forEach((table: any) => {
                const operator: string = table.op;
                if (operator === 'where' && table.value !== '') {
                    condition.where[table.name] = table.value;
                } else if (operator === 'like' && table.value !== '') {
                    condition.where[table.name] = Like('%' + table.value + '%');
                }
            });
        }

        if (limit && limit > 0) {
            condition.take = limit;
            condition.skip = offset;
        }
        if (count) {
            return this.productImageRepository.count(condition);
        } else {
            return this.productImageRepository.find(condition);
        }
    }
    // delete product image
    public async delete(id: any): Promise<any> {
        return await this.productImageRepository.delete(id);
    }

    // delete product
    public async deleteProduct(id: number): Promise<any> {
        return await this.productImageRepository.delete({ productId: id });
    }

    //image data from product image
     // pincode list
     public listProductImage(productId:any): Promise<any> {
        let imagedata= this.productImageRepository.createQueryBuilder()
        .select("product_id,image")
  .where("product_id= :product_id", { product_id:productId  }).execute()
  return imagedata;
}

public async findByIds(ids: any): Promise<any> {
   /* const condition: any = {};

    condition.where = {};
   // if (showon) {
        condition.where = {
            productId: ids,
        };
    return await this.productImageRepository.findByIds(condition);*/
    /*let imagedata= this.productImageRepository.createQueryBuilder()
      .select("product_id,image")
     .where("product_id= :product_id", { product_id:id  }).execute()
     return imagedata;*/
    // return this.productImageRepository.manager.query(`SELECT * FROM product  where id=${customerId}`);

     return this.productImageRepository.manager.query(`SELECT product_image.image as image,product.product_id as productId,product.product_selling_price as productSellingPrice, product.sku as sku,product.upc as upc,product.quantity as quantity,product.stock_status_id as stockStatusId,product.image_path as imagePath,product.manufacturer_id as manufacturerId,product.shipping as shipping,product.price as price,product.date_available as dateAvailable,product.sort_order as sortOrder,product.name as name,product.description as description,product.amount as amount,product.meta_tag_title as metaTagTitle,product.meta_tag_description as metaTagDescription,product.meta_tag_keyword as metaTagKeyword,product.product_size_color as productSizeColor,product.discount as discount,product.subtract_stock as subtractStock,product.minimum_quantity as minimumQuantity,product.location as location,product.wishlist_status as wishListStatus,product.delete_flag as deleteFlag,product.is_featured as isFeatured,product.rating as rating,'product.condition' as 'condition',product.today_deals as todayDeals,product.is_active as isActive,product.created_by as createdBy,product.modified_by as modifiedBy,product.created_date as createdDate,product.modified_date as modifiedDate,product.keywords as keywords,product.price_update_file_log_id as priceUpdateFileLogId,product.product_slug as productSlug,product.service_charges as serviceCharges,product.tax_type as taxType,tx.tax_percentage as taxValue,product.height as height,product.weight as weight,product.length as length,product.width as width,product.has_stock as hasStock,product.has_tire_price as hasTirePrice,product.out_of_stock_threshold as outOfStockThreshold,product.notify_min_quantity_below as notifyMinQuantity,product.min_quantity_allowed_cart as minQuantityAllowedCart,product.max_quantity_allowed_cart as maxQuantityAllowedCart,product.enable_back_orders as enableBackOrders,product.pincode_based_delivery as pincodeBasedDelivery,product.sku_id as skuId,product.is_simplified as isSimplified,product.hsn as hsn,product.attribute_keyword as attributeKeyword,product.quotation_available as quotationAvailable,product.promotion_id as promotionId,product.promotion_flag as promotionFlag,product.promotion_type as promotionType,product.promotion_product_y_id as promotionProductYid,product.promotion_product_y_slug as promotionProductYSlug, dt.price as pricerefer, product.promotion_free_product_price as promotionFreeProductPrice FROM product_image LEFT JOIN product ON product_image.product_id = product.product_id INNER JOIN tax as tx ON tx.tax_id=product.tax_value LEFT JOIN product_discount as dt ON dt.product_id=product.product_id WHERE product_image.default_image=1 and product_image.product_id IN (${ids}) GROUP BY productId, image, pricerefer ORDER BY product.product_id DESC`);


   

}


public async findDisocuntProduct(productIds:any){

     const result = await getManager().query(`SELECT p.product_id productId, p.name name, p.price price, p.product_slug productSlug, p.discount discount, p.created_date creadtedDate, p.quantity quantity, p.product_selling_price productSellingPrice, MAX(image.image) image,  MAX(image.container_name) containerName, p.tax_type taxType, tx.tax_percentage taxValue, MAX(pd.price) pricerefer FROM product p INNER JOIN product_image image ON p.product_id=image.product_id INNER JOIN tax tx ON p.tax_value=tx.tax_id LEFT JOIN  product_discount pd ON pd.product_id=p.product_id WHERE p.product_id IN (${productIds}) AND p.is_active=1  AND image.default_image=1 GROUP BY productId`)
    
     return result
}
}
