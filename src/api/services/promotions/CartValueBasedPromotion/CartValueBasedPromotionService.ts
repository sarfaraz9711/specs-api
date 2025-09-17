import { Service } from 'typedi';
//import { getManager } from 'typeorm';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { CartValueBasedPromotionRepository } from '../../../repositories/Promotions/CartValueBasedPromotion/CartValueBasedPromotionRepository';
import { getManager } from 'typeorm';
import { CartValueBasedPromotion } from '../../../models/Promotions/CartValueBasedPromotion/CartValueBasedPromotion';

@Service()
export class CartValueBasedPromosService {
    constructor(@OrmRepository() private cartValueBasedPromtionsRepository: CartValueBasedPromotionRepository) { }

    //create 
    public async create(data: any): Promise<any> {
        return this.cartValueBasedPromtionsRepository.save(data);
    }

    public async updatePromotion(data: any, updateId: any): Promise<any> {
        const result = await this.cartValueBasedPromtionsRepository.createQueryBuilder()
        .update(data)
        .where({ Id: updateId })
        .execute();
        return result.affected;
    }


      //Get All promotions
      public async getAllpromotions(): Promise<any> {
        //return this.cartValueBasedPromtionsRepository.find();
        return this.cartValueBasedPromtionsRepository.manager.query(`SELECT tm_cart_value_based_promotion.id as Id,tm_cart_value_based_promotion.product_id AS productId, tm_cart_value_based_promotion.cart_value AS cartValue,tm_cart_value_based_promotion.max_cart_value AS maxCartValue, tm_cart_value_based_promotion.discount_type AS discountType, tm_cart_value_based_promotion.discount_value AS discountValue, tm_cart_value_based_promotion.is_active AS isActive, tm_cart_value_based_promotion.start_date AS startDate, tm_cart_value_based_promotion.end_date AS endDate, tm_cart_value_based_promotion.start_time AS startTime, tm_cart_value_based_promotion.end_time AS endTime, tm_cart_value_based_promotion.starttimestamp,tm_cart_value_based_promotion.endtimestamp,tm_cart_value_based_promotion.created_date,tm_cart_value_based_promotion.modified_date,tm_cart_value_based_promotion.created_by,tm_cart_value_based_promotion.modified_by,product.name AS freeProduct FROM tm_cart_value_based_promotion LEFT JOIN product ON tm_cart_value_based_promotion.product_id = product.product_id where tm_cart_value_based_promotion.is_active = 1 ORDER BY tm_cart_value_based_promotion.created_date DESC`);
    }
    

     //Get individual Promotion detail
     public async getPromotionById(id: number): Promise<any> {
        return this.cartValueBasedPromtionsRepository.findByIds([id]);
    }

    //Get Active Promotion detail
    public async getActiveOffers(): Promise<any> {
        // const condition: any = {};
        const todayDate= new Date()
        // condition.where = { isActive: 1, endTimeStamp: todayDate.getTime()};
        // condition.select = ["Id", "productId", "discountType", "cartValue", "maxCartValue", "discountValue", "endDate", "endTime"];

       return  await getManager().createQueryBuilder(CartValueBasedPromotion, 'cp')
        .select('id as Id, product_id as productId, discount_type as discountType, cart_value as cartValue, max_cart_value as maxCartValue, discount_value as discountValue, end_date as endDate, end_time as endTime')
        .where({isActive: 1})
        .andWhere('cp.endtimestamp > :time', {time:todayDate.getTime()})
        .execute()

        //return await this.cartValueBasedPromtionsRepository.find(condition);
    }


    //Get Active Promotion detail
    public async getPromotionByStatus(isActive: number): Promise<any> {
        const condition: any = {};
        condition.where = {};

        if (isActive) {
            condition.where = {
                isActive: isActive,
            };
        }
        return this.cartValueBasedPromtionsRepository.find(condition);
    }

    //Get list by Value 
    public async getPromotionByValue(cartValue: number): Promise<any> {

        //return this.cartValueBasedPromtionsRepository.manager.query(`select * from tm_cart_value_based_promotion where ${cartValue} between cart_value and max_cart_value and discount_type="Free Products" and is_active=1`);


        return this.cartValueBasedPromtionsRepository.manager.query(`SELECT distinct product.product_id as productId,product.sku as sku,product.upc as upc,product.quantity as quantity,product.stock_status_id as stockStatusId,product.image_path as imagePath,product.manufacturer_id as manufacturerId,product.shipping as shipping,product.price as price,product.date_available as dateAvailable,product.sort_order as sortOrder,product.name as name,product.description as description,product.amount as amount,product.meta_tag_title as metaTagTitle,product.meta_tag_description as metaTagDescription,product.meta_tag_keyword as metaTagKeyword,product.product_size_color as productSizeColor,product.discount as discount,product.subtract_stock as subtractStock,product.minimum_quantity as minimumQuantity,product.location as location,product.wishlist_status as wishListStatus,product.delete_flag as deleteFlag,product.is_featured as isFeatured,product.rating as rating,'product.condition' as 'condition',product.today_deals as todayDeals,product.is_active as isActive,product.created_by as createdBy,product.modified_by as modifiedBy,product.created_date as createdDate,product.modified_date as modifiedDate,product.keywords as keywords,product.price_update_file_log_id as priceUpdateFileLogId,product.product_slug as productSlug,product.service_charges as serviceCharges,product.tax_type as taxType, tx.tax_percentage as taxValue,product.height as height,product.weight as weight,product.length as length,product.width as width,product.has_stock as hasStock,product.has_tire_price as hasTirePrice,product.out_of_stock_threshold as outOfStockThreshold,product.notify_min_quantity_below as notifyMinQuantity,product.min_quantity_allowed_cart as minQuantityAllowedCart,product.max_quantity_allowed_cart as maxQuantityAllowedCart,product.enable_back_orders as enableBackOrders,product.pincode_based_delivery as pincodeBasedDelivery,product.sku_id as skuId,product.is_simplified as isSimplified,product.hsn as hsn,product.attribute_keyword as attributeKeyword,product.quotation_available as quotationAvailable,product.promotion_id as promotionId,product.promotion_flag as promotionFlag,product.promotion_type as promotionType,product.promotion_product_y_id as promotionProductYid,product.promotion_product_y_slug as promotionProductYSlug,product.promotion_free_product_price as promotionFreeProductPrice FROM tm_cart_value_based_promotion INNER JOIN product ON tm_cart_value_based_promotion.product_id = product.product_id INNER JOIN product_image ON product_image.product_id = product.product_id INNER JOIN tax as tx ON tx.tax_id=product.tax_value where ${cartValue} between tm_cart_value_based_promotion.cart_value and tm_cart_value_based_promotion.max_cart_value and tm_cart_value_based_promotion.discount_type="Free Products" and tm_cart_value_based_promotion.is_active=1 group by productId;`);



    }

    // delete address
    public async remove(id: number): Promise<any> {
        await this.cartValueBasedPromtionsRepository .createQueryBuilder()
       .update()
       .set({ isActive: 0 })
       .where("id = :id", { id: id })
       .execute()
       return 1;
    }


} 