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
    QueryParam,
    UseBefore,

} from 'routing-controllers';
import { CommonService } from '../../../common/commonService';
import { CouponBasedPromo } from '../../../models/Promotions/CouponBasedPromo/CouponBasedPromo';
import { CouponBasedPromosService } from '../../../services/promotions/CouponBasedPromos/CouponBasedPromoService';
import { VerifyCoupanRequest } from '../../requests/promotions/verifyCoupanRequest';
import { MAILService } from '../../../../auth/mail.services';
import {  getManager} from 'typeorm';
import { PromotionsUsageOrdersService } from '../../../services/promotions/PromotionUsageOrdersService';
import { EmailTemplateService } from '../../../services/EmailTemplateService';
import { EmployeeDiscountClaim } from '../../../models/EmployeeDiscountClaim';
import { CheckCustomerMiddleware } from '../../../middlewares/checkTokenMiddleware';
import { SignupPromotionsSetting } from '../../../models/Promotions/CouponBasedPromo/SignupPromotionSetting';
import {couponLimiter} from '../../../middlewares/rateLimiters';

@JsonController('/promotions')
export class CouponBasedPromosController {
    constructor(
        private _commonService: CommonService,
        private _couponBasedPromosService: CouponBasedPromosService,
        
        private _promotionsUsageOrdersService: PromotionsUsageOrdersService,
        private _emailTemplateService: EmailTemplateService,
    ) { }


@UseBefore(couponLimiter)
    @Post('/coupon-based/add')
    @Authorized()
    public async createCouponBasedPromotion(@Body({ validate: true }) couponBasedPromotionParams: any, @Req() request: any, @Res() response: any): Promise<any> {
        let rowCreated:any
        let generateCoupon:any=couponBasedPromotionParams.couponCode
        const createCoupon = new CouponBasedPromo();
        for(let i=0; i<couponBasedPromotionParams.noOfCoupon;i++){
            if(i>0){
                generateCoupon = ("RC"+(Math.random() + 1).toString(36).substring(7)).toUpperCase()
            }
 
        createCoupon.couponPromotionType = couponBasedPromotionParams && couponBasedPromotionParams.couponPromotionType;
        createCoupon.couponName = couponBasedPromotionParams && couponBasedPromotionParams.couponName;
        createCoupon.couponCode = generateCoupon;
        createCoupon.couponType = couponBasedPromotionParams && couponBasedPromotionParams.couponType;
        createCoupon.couponValue = couponBasedPromotionParams && couponBasedPromotionParams.couponValue;
        createCoupon.startDate = couponBasedPromotionParams && couponBasedPromotionParams.startDate;
        createCoupon.endDate = couponBasedPromotionParams && couponBasedPromotionParams.endDate;
        createCoupon.minimumPurchaseAmount = couponBasedPromotionParams && couponBasedPromotionParams.minimumPurchaseAmount;
        createCoupon.maximumPurchaseAmount = couponBasedPromotionParams && couponBasedPromotionParams.maximumPurchaseAmount;
        createCoupon.emailRestrictions = couponBasedPromotionParams && couponBasedPromotionParams.emailRestrictions;
        createCoupon.maxCouponUse = couponBasedPromotionParams && couponBasedPromotionParams.maxCouponUse;
        createCoupon.noOfMaxCouponUsePerUser = couponBasedPromotionParams && couponBasedPromotionParams.noOfMaxCouponUsePerUser;
        createCoupon.isActive = couponBasedPromotionParams && couponBasedPromotionParams.status;
        createCoupon.orderId = couponBasedPromotionParams && couponBasedPromotionParams.orderId;
        createCoupon.couponId=null
        rowCreated = await this._couponBasedPromosService.create(createCoupon);
    }
    if(couponBasedPromotionParams && couponBasedPromotionParams.couponPromotionType=='allUsers'){
        const emailTemp = await this._emailTemplateService.findOne(25)
        let type:any= couponBasedPromotionParams.couponType==1?"%":""        
        let promotionMsg = "On the minimum cart value <strong>₹"+createCoupon.minimumPurchaseAmount+"</strong> and maximum cart value <strong>₹"+createCoupon.maximumPurchaseAmount+"</strong> you can use <strong>"+createCoupon.couponCode+"</strong> coupon code for get flat <strong>₹"+createCoupon.couponValue+"</strong> "+type+" discount on your cart"
          MAILService.notifyCustomer(null,promotionMsg,createCoupon.emailRestrictions, emailTemp.subject,null);
    }
    
        return response.status(200).send(await this._commonService.getMessage(200, rowCreated, "Data saved successfully")).end();

    }

   @UseBefore(couponLimiter)
    @Get('/coupon-based/list')
    public async getAllCouponBasedPromotions(@QueryParam('limit') limit: number, @QueryParam('couponName') couponName: string,@QueryParam('couponCode') couponCode: string, @QueryParam('couponPromotionType') couponPromotionType: string, @QueryParam('couponValue') couponValue: number, @QueryParam('isActive') isActive: string,@QueryParam('startDate') startDate: string,@QueryParam('endDate') endDate: string,@QueryParam('couponType') couponType: string,@Res() response: any): Promise<void> {
        await this.disabledExpiredCoupon();
        const select = [
            'CouponBasedPromo.couponId as couponId',
            'CouponBasedPromo.couponName as couponName',
            'CouponBasedPromo.couponCode as couponCode',
            'CouponBasedPromo.couponType as couponType',
            'CouponBasedPromo.couponPromotionType as couponPromotionType',
            'CouponBasedPromo.couponValue as couponValue',
            'CouponBasedPromo.minimumPurchaseAmount as minimumPurchaseAmount',
            'CouponBasedPromo.maximumPurchaseAmount as maximumPurchaseAmount',
            'CouponBasedPromo.emailRestrictions as emailRestrictions',
            'CouponBasedPromo.startDate as startDate',
            'CouponBasedPromo.endDate as endDate',
            'CouponBasedPromo.maxCouponUse as maxCouponUse',
            'CouponBasedPromo.noOfMaxCouponUsePerUser as noOfMaxCouponUsePerUser',
            'CouponBasedPromo.isActive as isActive',
            'CouponBasedPromo.orderId as orderId',
        ];
        const whereConditions = [];
        // whereConditions.push( {
        //     name: 'CouponBasedPromo.couponName',
        //     op: 'not',
        //     value:  `'SIGNUP_COUPON'`,
        // })
        if(isActive){
        whereConditions.push({
            name: 'CouponBasedPromo.isActive',
            op: 'IN',
            value: isActive,
        },{
            name: 'CouponBasedPromo.couponName',
            op: 'not',
            value:  `'SIGNUP_COUPON'`,
        })
       }else{
        whereConditions.push({
            name: 'CouponBasedPromo.isActive',
            op: 'where',
            value: 1,
        },{
            name: 'CouponBasedPromo.couponName',
            op: 'not',
            value:  `'SIGNUP_COUPON'`,
        })
       };
        if(couponCode){
            whereConditions.push( {
                name: 'CouponBasedPromo.couponCode',
                op: 'and',
                value:  `'${couponCode}'`,
            })
        }

        if(couponPromotionType){
            if(couponPromotionType=="allUsers"){
            whereConditions.push( {
                name: 'CouponBasedPromo.couponPromotionType',
                op: 'and',
                value:  `'${couponPromotionType}'`,
            })
        }else{
            whereConditions.push( {
                name: 'CouponBasedPromo.couponPromotionType',
                op: 'and',
                value:  `'${couponPromotionType}'`,
            })

        }
        }
        if(couponValue){
            whereConditions.push( {
                name: 'CouponBasedPromo.couponValue',
                op: 'and',
                value:  couponValue,
            })
        }
        if (startDate && endDate) {
            whereConditions.push({
                name1: ['CouponBasedPromo.startDate'],
                name2: ['CouponBasedPromo.endDate'],
                value1: startDate,
                value2: endDate,
                op:"rangeDateOp"
            // 
        }
            );
        }
        else if (startDate) {
            whereConditions.push({
                name: ['CouponBasedPromo.startDate'],
                value: startDate,
                op:"startDateOp"
            // 
        }
            );
        }else if (endDate) {
            whereConditions.push({
                name: ['CouponBasedPromo.endDate'],
                value: endDate,
                op:"endDateOp"
            // 
        }
            );
        }
        console.log("where condition>>>",whereConditions);
        let output = await this._couponBasedPromosService.getAllpromotions(limit,select,whereConditions);
        return response.status(200).send(await this._commonService.getMessage(200, output, "Get data successfully"));
    }

    @Get('/coupon-based/detail')
    public async getCouponBasedDetail(@QueryParam('couponCode') couponCode: string,@Res() response: any): Promise<void> {
        let couponDetail=  await getManager().query(`select * from tt_promotions_usage_orders where coupon_code='${couponCode}'`);
        if(couponDetail){
        let result=couponDetail
        return response.status(200).send(await this._commonService.getMessage(200,result, "Successfully get the coupon detail"));
        }

    }
    

    @Get('/coupon-based/disabled-expired-coupon')
    public async disabledExpiredCoupon(): Promise<boolean> {
        await getManager().query(`UPDATE tm_coupon_based_promotion SET is_active=0 WHERE STR_TO_DATE(SUBSTRING(end_date,1,24), '%a %b %d %Y %H:%i:%s') < NOW()`);
        return true;
    }

    @Get('/coupon-based/get-promotion-by-id')
    public async getPromotionById(@QueryParam('id') id: number, @Res() response: any): Promise<void> {
        let output = await this._couponBasedPromosService.getPromotionById(id);
        return response.status(200).send(await this._commonService.getMessage(200, output, "Get data successfully"));
    }

    @Post('/coupon-based/update')
    @Authorized()
    public async updatePromtion(@Body({ validate: true }) couponBasedPromotionParams: any, @Req() request: any, @Res() response: any): Promise<any> {
        const createCoupon = new CouponBasedPromo();
        createCoupon.couponPromotionType = couponBasedPromotionParams && couponBasedPromotionParams.couponPromotionType;
        createCoupon.couponName = couponBasedPromotionParams && couponBasedPromotionParams.couponName;
        createCoupon.couponCode = couponBasedPromotionParams && couponBasedPromotionParams.couponCode;
        createCoupon.couponType = couponBasedPromotionParams && couponBasedPromotionParams.couponType;
        createCoupon.couponValue = couponBasedPromotionParams && couponBasedPromotionParams.couponValue;
        createCoupon.startDate = couponBasedPromotionParams && couponBasedPromotionParams.startDate;
        createCoupon.endDate = couponBasedPromotionParams && couponBasedPromotionParams.endDate;
        createCoupon.minimumPurchaseAmount = couponBasedPromotionParams && couponBasedPromotionParams.minimumPurchaseAmount;
        createCoupon.maximumPurchaseAmount = couponBasedPromotionParams && couponBasedPromotionParams.maximumPurchaseAmount;
        createCoupon.emailRestrictions = couponBasedPromotionParams && couponBasedPromotionParams.emailRestrictions;
        createCoupon.maxCouponUse = couponBasedPromotionParams && couponBasedPromotionParams.maxCouponUse;
        createCoupon.noOfMaxCouponUsePerUser = couponBasedPromotionParams && couponBasedPromotionParams.noOfMaxCouponUsePerUser;
        createCoupon.isActive = couponBasedPromotionParams && couponBasedPromotionParams.status;

        let updateId = couponBasedPromotionParams && couponBasedPromotionParams.coupon_id;
        let updatedRows = await this._couponBasedPromosService.updatePromotion(createCoupon, updateId);
        
        if (updatedRows > 0) {
            return response.status(200).send(this._commonService.getMessage(200, `${updatedRows} record updated successfully`, `${updatedRows} record updated successfully`));
        }
    }

    @UseBefore(CheckCustomerMiddleware)
    @Post('/coupon-based/verify-coupan')
    public async VerifyCoupanPromotion(@Body({ validate: true }) verifyCoupanPromotion: VerifyCoupanRequest, @Req() request: any, @Res() response: any): Promise<any> {
        let message:any="Invalid Coupon"
        let coupanData:any
        coupanData = await this._couponBasedPromosService.verifyCoupanData({"couponCode":verifyCoupanPromotion.couponCode, "isActive":1});
        let emailValidate:any=true
        let minimumPurchaseAmount:any=0
        let maximumPurchaseAmount:any=99999
        console.log("coupanData",coupanData)
        if(coupanData && coupanData.couponName=='SIGNUP_COUPON'){
            coupanData=null
            coupanData = await this._couponBasedPromosService.verifyCoupanData({"couponCode":verifyCoupanPromotion.couponCode, emailRestrictions:verifyCoupanPromotion.emailRestrictions});
        }
        if(coupanData){
        if(coupanData.couponPromotionType=='employeesOnly'){
            if(verifyCoupanPromotion.couponValue>5000){
                return response.status(200).send(await this._commonService.getMessage(500, null, "Coupon is applicable below 5000 order value")).end();
            }
            const result:any = await getManager().getRepository(EmployeeDiscountClaim).find({customerId:request.user.id})
            if(result.length>0){
                const orderTotalAmount = result.reduce((n, {orderAmount}) => n + orderAmount, 0)
                if((+verifyCoupanPromotion.couponValue+orderTotalAmount)>10000){
                    return response.status(200).send(await this._commonService.getMessage(500, null, "Your yearly purchase limit exceed for this coupon")).end();
                }
                const todayDate = new Date()
                const lastOrderDate = new Date(result[(result.length-1)].createdDate)
                const dateCompare = await this.monthDiff(todayDate, lastOrderDate)
                if(dateCompare>-3){
                    return response.status(200).send(await this._commonService.getMessage(500, null, "You can use this coupon one time in three months")).end();
                }

            }



        }else{


 const couponUsage:any[] = await this._promotionsUsageOrdersService.find({"couponCode":verifyCoupanPromotion.couponCode, promotionIdentifier:verifyCoupanPromotion.emailRestrictions});
        
        // const filterUsage:any = couponUsage.filter((item:any)=>(item.promotionIdentifier).toUpperCase()==(verifyCoupanPromotion.emailRestrictions).toUpperCase())
        console.log("couponUsage.length",couponUsage.length)
        console.log("coupanData.maxCouponUse",coupanData.maxCouponUse)
        if(couponUsage && couponUsage.length==coupanData.maxCouponUse){
            message="Coupon already used"
            coupanData.isActive=0
        }
            if(couponUsage && couponUsage.length==coupanData.noOfMaxCouponUsePerUser){
                message="Coupon limit exceed"
                coupanData.isActive=0
            }

            let emailIds:any[]=[]
            if(coupanData.emailRestrictions!=null){
                const allEmailIds = (coupanData.emailRestrictions).toUpperCase()
        emailIds = allEmailIds.split(",");
        emailIds = emailIds.map((item:any) => item.trim());
            }
           emailValidate =  (emailIds.includes((verifyCoupanPromotion.emailRestrictions).toUpperCase()) || coupanData.emailRestrictions=='ALL')
           minimumPurchaseAmount = parseInt(coupanData.minimumPurchaseAmount)
           maximumPurchaseAmount = parseInt(coupanData.maximumPurchaseAmount)
        }
        if(coupanData.isActive==1){
            const todayDate = new Date();
            const startDate = new Date(coupanData.startDate);
            const endDate = new Date(coupanData.endDate);
            if(emailValidate && verifyCoupanPromotion.couponValue>=minimumPurchaseAmount && verifyCoupanPromotion.couponValue<=maximumPurchaseAmount && startDate.getTime()<=todayDate.getTime() && endDate.getTime()>=todayDate.getTime() && (+verifyCoupanPromotion.couponValue)>=coupanData.couponValue){
                return response.status(200).send(await this._commonService.getMessage(200, coupanData, "Coupon Applied Successfully")).end();
            }else{
                return response.status(200).send(await this._commonService.getMessage(500, null, "Coupon is not valid")).end();
            }
        }else{
            return response.status(200).send(await this._commonService.getMessage(500, null, message)).end();
        }
    }else{
        return response.status(200).send(await this._commonService.getMessage(500, null, "Coupon is not valid")).end();
    }
    
    }

     monthDiff(d1, d2) {
        var months;
        months = (d2.getFullYear() - d1.getFullYear()) * 12;
        months -= d1.getMonth();
        months += d2.getMonth();
        return months;
    }

    @Post('/coupon-based/get-coupon-by-email')
    public async getCouponByEmail(@Req() email:any): Promise<any> {
        let sendResponse:any;
        try{
        const req = email.body
//         const coupanData = await createQueryBuilder(CouponBasedPromo, 'cb')
//         .select(['od.customer_id as customerId', 'ANY_VALUE(od.email) as customerEmail', 'ANY_VALUE(cb.email_restrictions) as subscribeEmail', 'cb.coupon_code as coupanCode', 'ANY_VALUE(cb.coupon_type) as coupanType', 'cb.discount as discount', 'MAX(cb.start_date) as startDate', 'MAX(cb.end_date) as endDate', 'MAX(cb.minimum_purchase_amount) as minAmount', 'MAX(cb.maximum_purchase_amount) as maxAmount'])
// .leftJoin(PromotionsUsageOrders, 'pu', 'pu.promotion_identifier=cb.email_restrictions and pu.coupon_code=cb.coupon_code')
//         .leftJoin(Order, 'od','od.order_id=pu.order_id')
//         .where("cb.email_restrictions like :email",{email:`%${req.email}%`})
//         .andWhere(`(od.email='${req.email}' OR od.email is null)`)
//         .andWhere(`STR_TO_DATE(cb.end_date, '%a %b %d %Y %H:%i:%s') > NOW()`)
//         .orWhere(`cb.email_restrictions='ALL'`)
// 	.groupBy("cb.coupon_code")
// 	.addGroupBy("cb.discount")
//     .addGroupBy('od.customer_id')
//         .getRawMany()
const orderTable:any = '`order`'
const coupanData = await getManager().query(`SELECT od.customer_id as customerId, ANY_VALUE(od.email) as customerEmail, ANY_VALUE(cb.email_restrictions) as subscribeEmail, cb.coupon_code as coupanCode, ANY_VALUE(cb.coupon_type) as coupanType, ANY_VALUE(cb.is_active) as active, cb.discount as discount, MAX(cb.start_date) as startDate, MAX(cb.end_date) as endDate, MAX(cb.minimum_purchase_amount) as minAmount, MAX(cb.maximum_purchase_amount) as maxAmount FROM tm_coupon_based_promotion cb LEFT JOIN tt_promotions_usage_orders pu ON pu.promotion_identifier=cb.email_restrictions and pu.coupon_code=cb.coupon_code  LEFT JOIN ${orderTable} od ON od.order_id=pu.order_id WHERE STR_TO_DATE(cb.end_date, '%a %b %d %Y %H:%i:%s') > NOW() and  (cb.email_restrictions like '%${req.email}%' or cb.email_restrictions='ALL') and (od.email='${req.email}' OR od.email is null) GROUP BY cb.coupon_code, cb.discount, od.customer_id`)
        if(coupanData.length>0){
          sendResponse= {
             status: 200,
             message: 'Successfully get the Data',
             data: coupanData,
         };
       }else{
         sendResponse = {
             status: 500,
             message: 'Data not available',
             data: "",
         };
       }
    }catch{
        sendResponse = {
            status: 500,
            message: 'Data not available',
            data: "",
        };
    }
       return sendResponse
    }

    @Get('/get_signup_promotion_setting')
    // @Authorized()
    public async getSignupPromotionSetting(@Req() request: any, @Res() response: any): Promise<any> {
        const settingRepo = getManager().getRepository(SignupPromotionsSetting)
        const existingSetting = await settingRepo.findOne();
        response.cookie('globalSession', new Date().getTime(), {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 60 * 60 * 1000, // 1 hour
            path: '/', // cookie available site-wide
          });
        return response.status(200).send({status: 1, message: "Record found successfully.", data: existingSetting});
    }

    @Post('/signup_promotion_setting_update')
    @Authorized()
    public async updateSignupPromotionSetting(@Req() request: any, @Res() response: any): Promise<any> {
        const settingsFeed = request.body;
        const settingRepo = getManager().getRepository(SignupPromotionsSetting)
        const existingSetting:any = await settingRepo.findOne(settingsFeed.Id);
        if(existingSetting){
            existingSetting.couponValue = settingsFeed.couponValue;
            existingSetting.isSettingActive = settingsFeed.isSettingActive;
            existingSetting.couponCode =  settingsFeed.couponCode;
            existingSetting.startDate = settingsFeed.startDate;
            existingSetting.endDate = settingsFeed.endDate;
            existingSetting.minimumPurchaseAmount = settingsFeed.minimumPurchaseAmount;
            existingSetting.maximumPurchaseAmount = settingsFeed.maximumPurchaseAmount;
            existingSetting.discountTypeAmountIn = settingsFeed.discountTypeAmountIn;
            existingSetting.maxCouponUse = settingsFeed.maxCouponUse;
            existingSetting.noOfMaxCouponUsePerUser = settingsFeed.noOfMaxCouponUsePerUser;
            existingSetting.bannerImage = settingsFeed.bannerImage;
            existingSetting.signUpPopUp = settingsFeed.signUpPopUp;
            existingSetting.signupPopupImage = settingsFeed.signupPopupImage;


            await settingRepo.save(existingSetting);
        }
        return response.status(200).send({status: 1, message: "settings updated successfully."});
    }

    @Get('/get_signup_promotion_list')
    @Authorized()
    public async getSignupPromotionList(@Req() request: any, @Res() response: any): Promise<any> {

        const redeemed = request.query.redeemed;
        const code = request.query.code;
        const email = request.query.email;
        let redeemedQuery = "left join";
        let noRedeemed = '';
        let codeWhere = ''
        let emailWhere = '';
        if(redeemed == "YES"){
            redeemedQuery = "join";
        }
        if(redeemed == "NO"){
            noRedeemed = "and tto.coupon_code is null";
        }
        
        if(code){
            codeWhere = "AND tcbp.coupon_code = '"+code+"'"
        }

        if(email){
            emailWhere = "AND tcbp.email_restrictions LIKE '%"+email+"%'"
        }
        console.log(emailWhere);
        const output = await getManager().query(`select tcbp.coupon_code as couponCode , tcbp.start_date as startDate, tcbp.end_date as endDate, tcbp.discount as couponValue, case when tto.coupon_code is not null then "YES" else "NO" end as couponReedemed, CASE WHEN tcbp.coupon_type = 2 THEN "FLAT" ELSE "PERCENT" END as couponType, tcbp.email_restrictions as customer
        from tm_coupon_based_promotion tcbp 
        ${redeemedQuery} tt_promotions_usage_orders tto ON(tcbp.email_restrictions = tto.promotion_identifier)
        where tcbp.coupon_name = "SIGNUP_COUPON" ${codeWhere} ${noRedeemed} ${emailWhere}`)

        return response.status(200).send(await this._commonService.getMessage(200, output, "Get data successfully"));
    }

}
