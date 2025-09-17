//import moment from 'moment';
import 'reflect-metadata';
import {
    Post,
    Body,
    JsonController,
    Authorized,
    Req,
    Res,
    Get,
    QueryParam
} from 'routing-controllers';
import { CommonService } from '../../../common/commonService';
import { CartValueBasedPromotion } from '../../../models/Promotions/CartValueBasedPromotion/CartValueBasedPromotion';
import { CartValueBasedPromosService } from '../../../services/promotions/CartValueBasedPromotion/CartValueBasedPromotionService';
import { CartValueBasedPromotionRequest } from '../../requests/promotions/CartValueBasedPromotionRequest';
//import { ProductService } from '../../../services/ProductService';
//import { ProductImageService } from '../../../services/ProductImageService';
import { EmailPromotionCommonService } from '../../../services/promotions/EmailPromotionCommonService';
import { MAILService } from '../../../../auth/mail.services';
import {EmailTemplateService} from "../../../services/EmailTemplateService"
import { ProductService } from '../../../services/ProductService';



@JsonController('/promotions')
export class CouponBasedPromosController {
    constructor(
        private _commonService: CommonService,
        private _cartValueBasedPromosService: CartValueBasedPromosService,
       // private _productService: ProductService,
       // private _productImageService: ProductImageService,
        private _emailPromotionCommonService: EmailPromotionCommonService,
        private _emailTemplateService: EmailTemplateService,
        private _productService: ProductService

    ) { }

    @Post('/cart-value-based-promotion/add')
    @Authorized()
    public async createCouponBasedPromotion(@Body({ validate: true }) cartValueBasedPromotionParams: CartValueBasedPromotionRequest, @Req() request: any, @Res() response: any): Promise<any> {
        
        const createCartBasedPromotion = new CartValueBasedPromotion();
        createCartBasedPromotion.cartValue = cartValueBasedPromotionParams.cartValue;
        createCartBasedPromotion.maxCartValue = cartValueBasedPromotionParams.maxCartValue;
        createCartBasedPromotion.discountType = cartValueBasedPromotionParams.discountType;
        createCartBasedPromotion.discountValue = cartValueBasedPromotionParams.discountValue;
        createCartBasedPromotion.isActive = cartValueBasedPromotionParams.status;
        createCartBasedPromotion.startDate = cartValueBasedPromotionParams.startDate;
        createCartBasedPromotion.endDate = cartValueBasedPromotionParams.endDate;
        createCartBasedPromotion.startTime = cartValueBasedPromotionParams.startTime;
        createCartBasedPromotion.endTime = cartValueBasedPromotionParams.endTime;
        createCartBasedPromotion.startTimeStamp = cartValueBasedPromotionParams.startTimeStamp;
        createCartBasedPromotion.endTimeStamp = cartValueBasedPromotionParams.endTimeStamp;
        let productName:any
        let promotionMsg = "On the minimum cart value <strong>₹"+createCartBasedPromotion.cartValue+"</strong> and maximum cart value <strong>₹"+createCartBasedPromotion.maxCartValue+"</strong> you can get <strong>"+createCartBasedPromotion.discountValue+"%</strong> OFF on your cart."
        if(cartValueBasedPromotionParams.discountType === "Free Products"){
            createCartBasedPromotion.productId = cartValueBasedPromotionParams.productId[0];
            productName = await this._productService.findOne(createCartBasedPromotion.productId)
            promotionMsg = "On the minimum cart value <strong>₹"+createCartBasedPromotion.cartValue+"</strong> and maximum cart value <strong>₹"+createCartBasedPromotion.maxCartValue+"</strong>  you can get free <strong>"+productName.name+"</strong> product."
        }
        let rowCreated = await this._cartValueBasedPromosService.create(createCartBasedPromotion);
        let notifyCustomer = await this._emailPromotionCommonService.list();
        
        const emailTemp = await this._emailTemplateService.findOne(25)
        const message = emailTemp.content.replace('{promotion}', promotionMsg)
        for(let inc=0;inc<notifyCustomer.length;inc++){
         let email=notifyCustomer[inc].email;
          MAILService.notifyCustomer(null,message,email, emailTemp.subject,null);
        }

       // const sendMailRes = MAILService.notifyCustomer(logo, message, resultData.email, emailContent.subject, redirectUrl);



        return response.status(200).send(await this._commonService.getMessage(200, rowCreated, "Data saved successfully")).end();

    }


    @Post('/cart-value-based-promotion/update')
   // @Authorized()
    public async updatePromtion(@Body({ validate: true }) cartValueBasedPromotionParams: any, @Req() request: any, @Res() response: any): Promise<any> {
        const createCartBasedPromotion = new CartValueBasedPromotion();
        createCartBasedPromotion.cartValue = cartValueBasedPromotionParams.cartValue;
        createCartBasedPromotion.maxCartValue = cartValueBasedPromotionParams.maxCartValue;
        createCartBasedPromotion.discountType = cartValueBasedPromotionParams.discountType;
        createCartBasedPromotion.discountValue = cartValueBasedPromotionParams.discountValue;
        if(cartValueBasedPromotionParams.discountType === "Free Products"){
            createCartBasedPromotion.productId = cartValueBasedPromotionParams.productId[0];
        }
        
        createCartBasedPromotion.isActive = cartValueBasedPromotionParams.status;
        createCartBasedPromotion.startDate = cartValueBasedPromotionParams.startDate;
        createCartBasedPromotion.endDate = cartValueBasedPromotionParams.endDate;
        createCartBasedPromotion.startTime = cartValueBasedPromotionParams.startTime;
        createCartBasedPromotion.endTime = cartValueBasedPromotionParams.endTime;
        createCartBasedPromotion.startTimeStamp = cartValueBasedPromotionParams.startTimeStamp;
        createCartBasedPromotion.endTimeStamp = cartValueBasedPromotionParams.endTimeStamp;

        let updateId = cartValueBasedPromotionParams && cartValueBasedPromotionParams.cartValueId;
        let updatedRows = await this._cartValueBasedPromosService.updatePromotion(createCartBasedPromotion, updateId);
        
        if (updatedRows > 0) {
            return response.status(200).send(await this._commonService.getMessage(200, `${updatedRows} record updated successfully`, `${updatedRows} record updated successfully`));
        }
    }

    @Get('/cart-value-based/list')
    public async getAllCartValueBasedPromotions(@Res() response: any): Promise<void> {
        let output = await this._cartValueBasedPromosService.getAllpromotions();
        return response.status(200).send(await this._commonService.getMessage(200, output, "Get data successfully"));
    }

    @Get('/cart-value-based/get-promotion-by-id')
    public async getPromotionById(@QueryParam('id') id: number, @Res() response: any): Promise<void> {
        let output = await this._cartValueBasedPromosService.getPromotionById(id);
        return response.status(200).send(await this._commonService.getMessage(200, output, "Get data successfully"));
    }

    @Get('/cart-value-based/list/get-promotion-by-status')
    public async getPromotionByStatus( @Req() request: any,@Res() response: any): Promise<void> {
        let status=request.query.status;
        let output = await this._cartValueBasedPromosService.getPromotionByStatus(status);
       return response.status(200).send(await this._commonService.getMessage(200, output, "Get data successfully"));
    }

    @Get('/cart-value-based/list/get-promotion-by-value')
    public async getPromotionByValue( @Req() request: any,@Res() response: any): Promise<void> {
        let cartValue=request.query.cartValue;
        let promotionData = await this._cartValueBasedPromosService.getPromotionByValue(cartValue);
       
        if(promotionData.length>0){
        return response.status(200).send(await this._commonService.getMessage(200, promotionData, "Get data successfully"));
        }else{
            return response.status(200).send(await this._commonService.getMessage(403, '', "No records found"));
 
        }
    }

    @Post('/cart-value-based/remove')
    public async removeAllCartValueBasedPromotions(@Req() request: any,@Res() response: any): Promise<void> {
        let id=request.body.id;
          const deleteCartValueBasedPromotions = await this._cartValueBasedPromosService.remove(id);
          if (deleteCartValueBasedPromotions === 1) {
            const successResponse: any = {
                status: 1,
                message: 'Successfully deleted Cart Value Promotion',
            };
            return response.status(200).send(successResponse);
        } else {
            const errorResponse: any = {
                status: 0,
                message: 'Unable to delete the Cart Value Promotion. ',
            };
            return response.status(400).send(errorResponse);
        }
    }
    }

