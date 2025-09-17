import { Get, JsonController, Res } from 'routing-controllers';
import { Product } from '../../models/ProductModel';
import { getManager } from 'typeorm';
import { CartValueBasedPromosService } from '../../services/promotions/CartValueBasedPromotion/CartValueBasedPromotionService';
import { FreeProductPromotion } from '../promotions/freeProducts/freeProductsController';
@JsonController('/offers')
export class PaytmPaymentController {
    constructor(
        public _cartValueBasedPromosService: CartValueBasedPromosService,
        public _freeProductPromotion: FreeProductPromotion
    ) { }

    @Get('/active-list')
    public async getActiveOffers(@Res() response: any): Promise<any> {
        const _productModal = getManager().getRepository(Product)

        let activeOffers = await this._cartValueBasedPromosService.getActiveOffers();
        if (activeOffers && activeOffers.length > 0) {
            let percentageBased = [];
            let freeItemsBased = [];
            let arrayLength = activeOffers.length;
            for (let i = 0; i < arrayLength; i++) {

                if (activeOffers[i].discountType === "Percentage") {

                    percentageBased.push({
                        promoId: activeOffers[i].Id,
                        minCartTotalAmount: activeOffers[i].cartValue,
                        maxCartTotalAmount: activeOffers[i].maxCartValue,
                        discountValue: activeOffers[i].discountValue
                    });
                }
                if (activeOffers[i].discountType === "Free Products") {
                    const freeProdcutPrice = await _productModal.createQueryBuilder().select(['price', 'name', 'product_slug']).where("product_id=:prodcut_id", { prodcut_id: activeOffers[i].productId }).execute();
                    freeItemsBased.push({
                        promoId: activeOffers[i].Id,
                        minCartTotalAmount: activeOffers[i].cartValue,
                        maxCartTotalAmount: activeOffers[i].maxCartValue,
                        freeProducts: [{ productId: activeOffers[i].productId, productPrice: Number(freeProdcutPrice[0].price), productName: freeProdcutPrice[0].name, productSlug: freeProdcutPrice[0].product_slug }]
                    });
                }
            }
            let result = {
                cartValueBased: {
                    percentageBased, freeItemsBased
                }
            };
            return response.status(200).send(result);
        } else {
            return response.status(200).send("No record Found");
        }
        
    }

    @Get('/all-active-offers')
    public async getAllActiveOffers(@Res() response: any): Promise<any> {
        const _productModal = getManager().getRepository(Product)

        let activeOffers = await this._cartValueBasedPromosService.getActiveOffers();
        let percentageBased = [];
        let freeItemsBased = [];
        
        if (activeOffers && activeOffers.length > 0) {
            let arrayLength = activeOffers.length;
            for (let i = 0; i < arrayLength; i++) {

                if (activeOffers[i].discountType === "Percentage") {

                    percentageBased.push({
                        promoId: activeOffers[i].Id,
                        minCartTotalAmount: activeOffers[i].cartValue,
                        maxCartTotalAmount: activeOffers[i].maxCartValue,
                        discountValue: activeOffers[i].discountValue,
                        endDate: activeOffers[i].endDate,
                        endTime: activeOffers[i].endTime
                    });
                }
                if (activeOffers[i].discountType === "Free Products") {
                    const freeProdcutPrice = await _productModal.createQueryBuilder().select(['price', 'name', 'product_slug']).where("product_id=:prodcut_id", { prodcut_id: activeOffers[i].productId }).execute();
                    freeItemsBased.push({
                        promoId: activeOffers[i].Id,
                        minCartTotalAmount: activeOffers[i].cartValue,
                        maxCartTotalAmount: activeOffers[i].maxCartValue,
                        endDate: activeOffers[i].endDate,
                        endTime: activeOffers[i].endTime,
                        freeProducts: [{ productId: activeOffers[i].productId, productPrice: Number(freeProdcutPrice[0].price), productName: freeProdcutPrice[0].name, productSlug: freeProdcutPrice[0].product_slug }]
                    });
                }
            }
            
            
        }
        
        let FreeProductPromoResult = [];
        const activeFreePromoList = await this._freeProductPromotion.getActiveFreePromoList();
        if(activeFreePromoList && activeFreePromoList.length > 0){
            FreeProductPromoResult = activeFreePromoList;
        }

       const allActionOffersResult = {
            cartValueBased: {
                percentageBased, freeItemsBased
            },
            freeProductPromotions: FreeProductPromoResult
            
        };

        return response.status(200).send(allActionOffersResult);

    }

}