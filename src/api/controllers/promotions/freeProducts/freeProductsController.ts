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

} from 'routing-controllers';
//import { FreeProductsPromtions } from '../../models/FreeProductsPromotions';
//import { FreeProductsPromotionsCategory } from '../../models/FreeProductPromotionsCategory';
//import { request, response } from 'express';
import { CommonService } from '../../../common/commonService';
import { FreeProductsPromtions } from '../../../models/Promotions/FreeProducts/FreeProductsPromotions';
import { FreeProductPromotionService } from '../../../services/promotions/freeProducts/freeProductsPromotionService';
import { FreeProductsPromotionsCategory } from '../../../models/Promotions/FreeProducts/FreeProductPromotionsCategory';
import { FreeProductPromotionCategoryService } from '../../../services/promotions/freeProducts/freeProductsPromotionCategoryService';
import { CreateFreeProductPromoRequest } from '../../requests/promotions/CreateFreeProductPromoRequest';
import {ProductService} from "../../../services/ProductService";
import { EmailPromotionCommonService } from '../../../services/promotions/EmailPromotionCommonService';
import { MAILService } from '../../../../auth/mail.services';
import { EmailTemplateService } from '../../../services/EmailTemplateService';


@JsonController('/promotions')
export class FreeProductPromotion {
    constructor(
        private commonService: CommonService,
        private _freeProductPromotionService: FreeProductPromotionService,
        private _freeProductPromotionCategoryService: FreeProductPromotionCategoryService,
        private _productService: ProductService,
        private _emailPromotionCommonService: EmailPromotionCommonService,
        private _emailTemplateService: EmailTemplateService

    ) { }

    @Post('/add-free-product')
    @Authorized()
    public async createFreeProductPromotion(@Body({ validate: true }) freeProductPromotionParams: CreateFreeProductPromoRequest, @Req() request: any, @Res() response: any): Promise<any> {

        const collectPromoDataToSave: any = new FreeProductsPromtions();
        collectPromoDataToSave.freePromotioType = freeProductPromotionParams.promoName;
        collectPromoDataToSave.isActive = freeProductPromotionParams.status;
        const startDate = new Date(freeProductPromotionParams.startDate);
        collectPromoDataToSave.startDate = startDate;
        const endDate = new Date(freeProductPromotionParams.endDate);
        collectPromoDataToSave.endDate = endDate;
        collectPromoDataToSave.percentageDiscount = freeProductPromotionParams.percentageDiscount;
        collectPromoDataToSave.discouctAmount = freeProductPromotionParams.discouctAmount;
        const buyProducts = freeProductPromotionParams.selectedBuyProducts;
        const freeProducts = freeProductPromotionParams.selectedOfferProducts;

        const promtionCreated = await this._freeProductPromotionService.create(collectPromoDataToSave);

        if (freeProductPromotionParams.promoName && (freeProductPromotionParams.promoName == "buy_x_and_get_x_free" || freeProductPromotionParams.promoName == "buy_x_and_get_x_percent" || freeProductPromotionParams.promoName == "buy_x_and_get_y_percent" || freeProductPromotionParams.promoName && freeProductPromotionParams.promoName == "buy_x_and_get_y_free")) {
            if (buyProducts && buyProducts.length > 0 && freeProducts && freeProducts.length > 0) {

                const saveFreeproducts: any = new FreeProductsPromotionsCategory();
                saveFreeproducts.buyProductId = buyProducts[0];
                saveFreeproducts.getProductId = freeProducts[0];
                saveFreeproducts.promtionId = promtionCreated.promtionId;
                await this._freeProductPromotionCategoryService.create(saveFreeproducts);

            }
        } else if (freeProductPromotionParams.promoName && freeProductPromotionParams.promoName == "buy_2x_and_get_x_free" || freeProductPromotionParams.promoName && freeProductPromotionParams.promoName == "buy_2x_and_get_y_free" || freeProductPromotionParams.promoName == "buy_2x_and_get_x_percent" || freeProductPromotionParams.promoName && freeProductPromotionParams.promoName == "buy_2x_and_get_y_percent") {
            if (buyProducts && buyProducts.length > 0 && freeProducts && freeProducts.length > 0) {
                for (const rec of buyProducts) {
                    const saveFreeproducts: any = new FreeProductsPromotionsCategory();
                    saveFreeproducts.buyProductId = rec;
                    saveFreeproducts.getProductId = freeProducts[0];
                    saveFreeproducts.promtionId = promtionCreated.promtionId;
                    await this._freeProductPromotionCategoryService.create(saveFreeproducts);
                }
            }
        } else if (freeProductPromotionParams.promoName && (freeProductPromotionParams.promoName == "buy_2x_and_get_2x_free" || freeProductPromotionParams.promoName == "buy_2x_and_get_2y_free" || freeProductPromotionParams.promoName == "buy_4x_and_get_x_percent" || freeProductPromotionParams.promoName == "buy_4x_and_get_x_amount" || freeProductPromotionParams.promoName == "buy_4_any_and_get_x_percent" || freeProductPromotionParams.promoName == "buy_4_any_and_get_x_amount")){    
            if (buyProducts && buyProducts.length > 0) {
                for (let i = 0; i < buyProducts.length; i++) {
                    const saveFreeproducts: any = new FreeProductsPromotionsCategory();
                    saveFreeproducts.buyProductId = buyProducts[i];
                    saveFreeproducts.getProductId = freeProducts[i];
                    saveFreeproducts.promtionId = promtionCreated.promtionId;
                    await this._freeProductPromotionCategoryService.create(saveFreeproducts);
                }
            }
        }
        let getProductData:any;
        if(freeProductPromotionParams.promoName == "buy_4_any_and_get_x_percent" || freeProductPromotionParams.promoName == "buy_4_any_and_get_x_amount"){
            getProductData = await this._productService.findByIds(freeProductPromotionParams.selectedBuyProducts);
            getProductData.forEach(element => {
            element.promotionFlag = freeProductPromotionParams.status;
            element.promotionType = freeProductPromotionParams.promoName;
            element.promotionProductYid = element.productId;
            element.promotionProductYSlug = freeProductPromotionParams.selectedBuyProducts.toString();
            element.promotionFreeProductPrice = freeProductPromotionParams.discouctAmount;
            element.promotionId = promtionCreated.promtionId;
            this._productService.update(element.productId, element);
            });
         }else{
            let percentOffer = ["buy_x_and_get_x_percent", "buy_x_and_get_y_percent", "buy_2x_and_get_x_percent", "buy_2x_and_get_y_percent", "buy_4x_and_get_x_percent", 'buy_4x_and_get_x_amount'];
            getProductData = await this._productService.findOne({
                where :{productId: freeProductPromotionParams.selectedBuyProducts[0]}
            });
            const getProductDataYdata = await this._productService.findOne({
                where :{productId: freeProductPromotionParams.selectedOfferProducts[0]}
            });
            getProductData.promotionFlag = freeProductPromotionParams.status;
            getProductData.promotionType = freeProductPromotionParams.promoName;
            getProductData.promotionProductYid = freeProductPromotionParams.selectedOfferProducts[0];
            getProductData.promotionProductYSlug = getProductDataYdata.productSlug;
            getProductData.promotionId = promtionCreated.promtionId;
            if(freeProductPromotionParams.promoName=="buy_2x_and_get_2y_free" || freeProductPromotionParams.promoName=="buy_2x_and_get_2x_free"){
                getProductData.promotionFreeProductPrice = parseInt(getProductDataYdata.productSellingPrice)*2;
            }else if(percentOffer.includes(freeProductPromotionParams.promoName)){
                getProductData.promotionFreeProductPrice = freeProductPromotionParams.discouctAmount;
            }else{
                getProductData.promotionFreeProductPrice = parseInt(getProductDataYdata.productSellingPrice);
            }
             await this._productService.update(freeProductPromotionParams.selectedBuyProducts[0], getProductData);
        }
       
        let notifyCustomer = await this._emailPromotionCommonService.list();
        
        const emailTemp = await this._emailTemplateService.findOne(25)
        const promoTypeJson =  {
            "buy_x_and_get_x_free":'Buy one get one free',
            "buy_x_and_get_y_free":'Buy one get one free', 
            "buy_2x_and_get_x_free":'Buy two get one free', 
            "buy_2x_and_get_y_free":'Buy two get one free', 
            "buy_2x_and_get_2x_free":'Buy two get two free', 
            "buy_2x_and_get_2y_free":'Buy two get two free', 
            "buy_x_and_get_x_percent":'Buy two get discount on cart', 
            "buy_x_and_get_y_percent":'Buy two get discount on cart', 
            "buy_2x_and_get_x_percent":'Buy three get discount on cart', 
            "buy_2x_and_get_y_percent":'Buy three get discount on cart', 
            "buy_4x_and_get_x_percent":'Buy four get discount on cart', 
            "buy_4x_and_get_x_amount":'Buy four get discount on cart', 
            "buy_4_any_and_get_x_percent":'Buy four get discount on cart', 
            "buy_4_any_and_get_x_amount":'Buy four get discount on cart'
        }
        let promotionMsg = "<strong">+promoTypeJson[freeProductPromotionParams.promoName]+"</strong> offer available. Kindly visit the redchief.in site."
        const message = emailTemp.content.replace('{promotion}', promotionMsg)
        for(let inc=0;inc<notifyCustomer.length;inc++){
         let email=notifyCustomer[inc].email;
          MAILService.notifyCustomer(null,message,email, emailTemp.subject,null);
        }
        return response.status(200).send(await this.commonService.getMessage(200, freeProductPromotionParams, "Data saved successfully")).end();
    }

    @Get('/free-products-promo-list')
    //@Authorized()
    public async getProductsPromoList(@Res() response: any): Promise<void> {
        let output = await this._freeProductPromotionService.getAllFreeProductPromotions();
        if(output.length>0){
            return response.status(200).send(await this.commonService.getMessage(200, output, "Get data successfully"));
        }else{
            return response.status(200).send(await this.commonService.getMessage(200, null, "Not found any active promotion"));
        }
    }

    @Get('/get-active-free-product-promo-list')
    public async getActiveList(@Res() response: any): Promise<void> {
       const queryData = await this.getActiveFreePromoList();
        return response.status(200).send(await this.commonService.getMessage(200, queryData, "Get data successfully"));
    }

    public async getActiveFreePromoList(){
        let queryData = await this._freeProductPromotionService.getAllActivePromotions();
        return queryData;
    }
    @Get('/get-free-product-promo-list-by-product-id')
    public async getByProductId(@QueryParam('productId') productId:any, @Res() response: any): Promise<void> {
        let queryData = await this._freeProductPromotionService.getByProductId(productId);
        return response.status(200).send(await this.commonService.getMessage(200, queryData, "Get data successfully"));
    }

    @Get('/get-promotion-by-id')
    public async getPromotionById(@QueryParam('id') id: number, @Res() response: any): Promise<void> {
        let queryData = await this._freeProductPromotionService.getPromotionById(id);
        return response.status(200).send(await this.commonService.getMessage(200, queryData, "Get data successfully"));
    }

    @Post('/update-free-product')
    @Authorized()
    public async updateFreeProductPromotion(@Body({ validate: true }) freeProductPromotionParams: any, @Req() request: any, @Res() response: any): Promise<any> {
        const collectPromoDataToSave: any = new FreeProductsPromtions();
        collectPromoDataToSave.freePromotioType = freeProductPromotionParams.promoName;
        collectPromoDataToSave.isActive = freeProductPromotionParams.status;
        const startDate = new Date(freeProductPromotionParams.startDate);
        collectPromoDataToSave.startDate = startDate;
        const endDate = new Date(freeProductPromotionParams.endDate);
        collectPromoDataToSave.endDate = endDate;

        let updatedRows = await this._freeProductPromotionService.updatePromotion(collectPromoDataToSave, freeProductPromotionParams.id);
       
        if (updatedRows > 0) {
            
            const buyProducts = freeProductPromotionParams.selectedBuyProducts;
            const freeProducts = freeProductPromotionParams.selectedOfferProducts;
            const saveFreeproducts: any = new FreeProductsPromotionsCategory();
                    saveFreeproducts.buyProductId = buyProducts[0];
                    saveFreeproducts.getProductId = freeProducts[0];
            const childTablePKId = freeProductPromotionParams.childTablePKId;
            let updateRows = await this._freeProductPromotionCategoryService.updatePromotionCategoryTable(saveFreeproducts, childTablePKId);
            const getProductData = await this._productService.findByIds(freeProductPromotionParams.selectedBuyProducts);
            getProductData.forEach(element => {
            element.promotionFlag = null;
            element.promotionType = null;
            element.promotionProductYid = null;
            element.promotionProductYSlug = null;
            element.promotionFreeProductPrice = null;
            element.promotionId = null;
            this._productService.update(element.productId, element);
            });
            return response.status(200).send(await this.commonService.getMessage(200, `${updateRows} record updated successfully`, `${updateRows} record updated successfully`));
        }
        
    }

}