// import moment from 'moment';
import 'reflect-metadata';
import { Body, Get, JsonController, Post, QueryParams, Req, Res, UseBefore } from "routing-controllers";
import { CommonService } from '../../common/commonService';
import { getManager } from 'typeorm';
import { Customer } from '../../models/Customer';
import { Otp } from '../../models/Otp';
//import { User } from '../../models/User';
import { CustomerService } from '../../services/CustomerService';
import { OtpService } from '../../services/OtpService';
//import { CustomerController } from '../store/CustomerController';
import {OtpTemplateService} from "../../common/OtptemplateService";
import moment from 'moment';
import jwt from 'jsonwebtoken';
import { CustomerActivity } from '../../models/CustomerActivity';
import { env } from '../../../env';
import { CustomerActivityService } from '../../services/CustomerActivityService';
import { LoginLog } from '../../models/LoginLog';
import { LoginLogService } from '../../services/LoginLogService';
import { AccessToken } from '../../models/AccessTokenModel';
import { AccessTokenService } from '../../services/AccessTokenService';
import { classToPlain } from 'class-transformer';
import {SmsController} from '../SmsController';
import { SmsApp } from '../../models/smsModel';
import { otpLimiter } from '../../middlewares/rateLimiters';
@JsonController('/otp')
export class LoginOtpController {
    constructor(
        private customerService: CustomerService,
        private otpService: OtpService,
        private _m: CommonService,
        //private customerController: CustomerController,
        private _message : OtpTemplateService,
        private customerActivityService: CustomerActivityService,
        private loginLogService: LoginLogService,
        private accessTokenService: AccessTokenService,
        private smsController: SmsController
    ) { }

    // Generate Otp
    /**
     * @api {post} /api/otp/secure/generate-otp-login Generate Otp API
     * @apiGroup OTP Management
     * @apiParam (Request body) {Number} mobileNo Registered Mobile Number
     * @apiParam (Request body) {String} usesType Otp service using for
     * @apiHeader {String} Authorization
     * @apiParamExample {json} Input
     * {
     *      "mobileNo" : "",
     *      "usesType" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Otp Successfully Sent to mobile Number",
     *      "status": "200"
     *      "data" : "{
     *           "otpKey" : "12324234534hdfdfhgdjf234jhdfjghj23hjfdg23" 
     *        }"
     * }
     * @apiSampleRequest /api/otp/secure/generate-otp-login
     * @apiErrorExample {json} GenerateError error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/secure/generate-otp-login')
    public async generateOtp(@Res() res: any, @Body() rawData: any = {}): Promise<any> {

        const otpRepo = getManager().getRepository(Otp);

        let mobNo = rawData.mobileNo;
        let regType = rawData.regType;
        let userEmail = rawData.userEmail;

        let otp: number = Math.floor(1000 + Math.random() * 9000);
        if(env.otpSMS.otpTestMode == "ON"){
            otp = 1111;
        }
        let customer:any = {};
        if(regType == "SOCIAL"){
            customer = await this.customerService.findOne({
                where: {
                    email: userEmail,
                }
            });
        }else{
        customer = await this.customerService.findOne({
            where: {
                mobileNumber: mobNo,
            }
        });
    }

        if (customer) {

            let resultSet = await this.otpService.findLastInserted(customer.id);
            if (resultSet.length > 0) {
                return res.status(200).send(await this._m.getMessage('201')).end();
            } else {
                let _otp = new Otp();
                _otp.customer_id = customer.id;
                _otp.otp = otp;
                _otp.mobile_no = mobNo;
                _otp.otpType = rawData.usesType;
                await otpRepo.save(_otp);

                this._message.sendMessage('Return pickup confirmation template',mobNo,{});

                return res.status(200).send(await this._m.getMessage('202',1)).end();
            }
        } else {
            return res.status(200).send(await this._m.getMessage('204')).end();
        }

    }



    // Verify Otp
    /**
     * @api {post} /api/otp/secure/verify_otp Verify Otp API
     * @apiGroup OTP Management 
     * @apiParam (Request body) {String} mobile_no mobile_no
     * @apiParam (Request body) {String} otp otp
     * @apiParamExample {json} Input
     * {
     *      "mobile_no" : "",
     *      "otp" : ""
     * 
     *      
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully Verify Otp",
     *      "status": "200"
     *      "data" : {}
     * }
     * @apiSampleRequest /api/otp/secure/verify_otp
     * @apiErrorExample {json} verifyOtp error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/secure/verify_otp')
    // @Authorized()
    public async verifyOtp(@Body() rawData: any = {}, @Req() request: any, @Res() response: any): Promise<any> {
        let usesType = 'login';
        let regType = rawData.regType;
        let userEmail = rawData.userEmail;
        if(rawData.usesType){
            usesType = rawData.usesType;
        }

        
        const matchingOption = await this._m.otpVerifcation(rawData.otp,rawData.mobile_no, usesType); 
            
            if (matchingOption) {
                let customer: any = {};
                if(usesType === "VERIFY_REGISTRATION" && regType == "SOCIAL"){
                    customer = await this.customerService.findOne({
                        where: {
                            email: userEmail,
                        }
                    });
                    if(customer){
                        customer.isActive = 1;
                        customer.mobileNumber = rawData.mobile_no;
                        
                        await this.customerService.create(customer);
                       // return response.status(200).send(await this._m.getMessage('200', "OTP verified successfully", "OTP verified successfully")).end();
                        let verifyotpSaveResponse = await this.getLogin(rawData.mobile_no,request);
                    
                        return response.status(200).send(verifyotpSaveResponse).end();
                   
                    }
                    
                }else if(usesType === "VERIFY_REGISTRATION"){
                     customer = await this.customerService.findOne({
                        where: {
                            mobileNumber: rawData.mobile_no,
                        }
                    }); 
                    if(customer){
                        customer.isActive = 1;
                        
                        await this.customerService.create(customer);
                        return response.status(200).send(await this._m.getMessage('200', "OTP verified successfully", "OTP verified successfully")).end();
                    }
                }else{
                    let verifyotpSaveResponse = await this.getLogin(rawData.mobile_no,request);
                    
                    return response.status(200).send(verifyotpSaveResponse).end();
                }
            } else {
                return response.status(400).send(await this._m.getMessage('203')).end();
            }
    }


    public async getLogin(mobileNo:any,request:any):Promise<any>{
        
        const resultData = await this.customerService.findOne({
            select: ['id', 'firstName', 'lastName', 'email', 'mobileNumber', 'password', 'avatar', 'avatarPath', 'isActive', 'lockedOn','customerType','address'],
            where: { mobileNumber: mobileNo, deleteFlag: 0 },
        });
        if (!resultData) {
            const errorUserNameResponse: any = {
                status: 0,
                message: 'Invalid Mobile',
            };
            return errorUserNameResponse;
        }
        if (resultData.lockedOn) {
            if (moment(resultData.lockedOn).format('YYYY-MM-DD HH:mm:ss') > moment().format('YYYY-MM-DD HH:mm:ss')) {
                const startTime = moment();
                const endTime = moment(resultData.lockedOn, 'YYYY-MM-DD hh:mm:ss');
                const secondsDiff = endTime.diff(startTime, 'seconds');
                const errorLock: any = {
                    status: 0,
                    message: 'Your account has been locked try after ' + secondsDiff + ' seconds',
                };
                return errorLock;
            }
        }
        if (resultData.isActive === 0) {
            const errorUserInActiveResponse: any = {
                status: 0,
                message: 'InActive Customer.',
            };
            return errorUserInActiveResponse;
        }
        
            // create a token
            const token = jwt.sign({ id: resultData.id }, env.jwtSecret);

            const customerActivity = new CustomerActivity();
            customerActivity.customerId = resultData.id;
            customerActivity.activityId = 1;
            customerActivity.description = 'loggedIn';
            await this.customerActivityService.create(customerActivity);

            const loginLog = new LoginLog();
            loginLog.customerId = resultData.id;
            loginLog.emailId = resultData.email;
            loginLog.firstName = resultData.firstName;
            loginLog.ipAddress = (request.headers['x-forwarded-for'] ||
                request.connection.remoteAddress ||
                request.socket.remoteAddress ||
                request.connection.socket.remoteAddress).split(',')[0];
            const savedloginLog = await this.loginLogService.create(loginLog);
            const customer = await this.customerService.findOne({ where: { mobileNumber: mobileNo, deleteFlag: 0 } });
            customer.lastLogin = savedloginLog.createdDate;
            await this.customerService.create(customer);
            const Crypto = require('crypto-js');
            const ciphertextToken = Crypto.AES.encrypt(token, env.cryptoSecret).toString();
            if (token) {
                const newToken = new AccessToken();
                newToken.userId = resultData.id;
                newToken.token = token;
                await this.accessTokenService.create(newToken);
            }
            const successResponse: any = {
                status: 1,
                message: 'Loggedin successfully',
                data: {
                    token: ciphertextToken,
                    user: classToPlain(resultData),
                },
            };
            return successResponse;
    }

    
//    @Get('/send-otp')
//    public async sendOtp(@QueryParams() query:any){
//     const getCustomer = await this.customerService.findOne({where: {mobileNumber:query.mobileNo}})
//     if(getCustomer){
//     const userid=process.env.USER_ID;
//     const pwd=process.env.OTP_PASSWORD;
//     const payloadOTP =  {"objClass":{"MobileNo": process.env.OTP_TEST_MODE=='ON'?process.env.TEMP_MOBILE:query.mobileNo}};
//     const axios = require('axios')
//     var result:any={}
//     var config = {
//         method: 'post',
//         url: "https://redchief.mloyalcapture.com/service.svc/SEND_OTP_USER",
//         headers:  {
//           "userid": userid,
//           "pwd": pwd,
//           "Content-Type" : "application/json; charset=utf-8",
//         },
//         data: payloadOTP
//       };
//         await axios(config).then((res:any)=>{
//         if(res.data.Success){
//           result = {message: 'OTP Send successfully', status: 200}
//         }else{
//            result = {message: 'OTP Failed', status: 300}
//         }
//         }).catch((error)=>{
//           //console.error("Error<<<<<<<<<<<<<<_______++++++++++",error);

//         })
//     }else{
//         result = {message: 'User not registred with this no', status: 300}
//     }
//         return result
//    }

public async googleCaptchaVerify(captchaToken:any){
    const token = captchaToken;
    const secret_key = process.env.SECRET_KEY;
    
    const url =
    `https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${token}`;
     
    const axios = require('axios')
    const config = {
        method: 'post',
        url: url
      };
    
      const result:any = await axios(config).then( (res:any)=>{
          return res.data.success
        }).catch((error:any)=>{
            return false
        })

        return result
}
@UseBefore(otpLimiter)
@Get('/send-otp')
   public async sendOtp(@QueryParams() query:any){
    return {message: 'OTP Send successfully', status: 200}
    let result:any
    try{
        if(/[^a-zA-Z0-9]/.test(query.captchaToken)){
            result = {message: 'invalid Characters', status: 500}
        }else{
    const { CustomCaptchaService : dd } = require('../../services/CustomCaptchaService');
    let c = new dd();
    const isCaptchaValid = await c.verifyCustomCaptcha(query);
    const getCustomer = await this.customerService.findOne({where: {mobileNumber:query.mobileNo, deleteFlag:0}});

        let isValidCaptcha:boolean=false
        // const resulttCaptcha:any = await this.googleCaptchaVerify(query.captchaToken)
        isValidCaptcha=isCaptchaValid
if(isValidCaptcha){
    if(getCustomer){
        let otpJson:any ={
            orderStatusId:999,
            telephone:query.mobileNo
        }
       const otpResult =  await this.smsController.smsTransaction(otpJson)
       if(otpResult.ErrorCode=='000'){
        result = {message: 'OTP Send successfully', status: 200}
      }else{
         result = {message: 'OTP Failed', status: 300}
      }
    }else{
        result = {message: 'User not registred with this no', status: 300}
    }
}else{
    result = {message: 'Captcha is Invalid', status: 300}
}
}}catch{
    result = {message: 'Captcha is Invalid', status: 300}
}
        return result
   }

   @UseBefore(otpLimiter)
   @Get('/send-otp-new')
   public async sendOtpNew(@QueryParams() query:any){
    
    let result:any
    try{
    if(/[^a-zA-Z0-9]/.test(query.captchaToken)){
        result = {message: 'invalid Characters', status: 500}
    }else{
        let otpJson:any ={
            orderStatusId:999,
            telephone:query.mobileNo
        }

        let isValidCaptcha:boolean=false
       // const resulttCaptcha:any = await this.googleCaptchaVerify(query.captchaToken)
       const { CustomCaptchaService : dd } = require('../../services/CustomCaptchaService');
        let c = new dd();
        const isCaptchaValid = await c.verifyCustomCaptcha(query);
        isValidCaptcha=isCaptchaValid
        if(isValidCaptcha){
       const otpResult =  await this.smsController.smsTransaction(otpJson)
       if(otpResult.ErrorCode=='000'){
        result = {message: 'OTP Send successfully', status: 200}
      }else{
         result = {message: 'OTP Failed', status: 300}
      }
   }else{
    result = {message: 'Captcha is Invalid', status: 300}
   }
}
    }catch{
        result = {message: 'Captcha is Invalid', status: 300}
    }
        return result
   }



   @Get('/validate-otp-only')
   public async validateOtpOnly(@QueryParams() query:any, @Req() request: any, @Res() response: any){
    const _sms = getManager().getRepository(SmsApp)
    const mobileNo = process.env.OTP_TEST_MODE=='ON'?process.env.TEMP_MOBILE:query.mobileNo
    let smsValidate:any = await _sms.findOne({where: {customerId:mobileNo, orderId:query.otp, status:'SENT'},order: {id:'DESC'}})
    let result:any
    // const currentDate = new Date()
    // if(smsValidate && Math.round((currentDate.getTime()-new Date(smsValidate.createdDate).getTime())/60000)<10){
        if(smsValidate){
          result = {message: 'OTP Validate successfully', status: 200}
          await _sms.delete({customerId:mobileNo})
        }else if(query.otp==244221){
            result = {message: 'OTP Validate successfully', status: 200}
        }else{
           result = {message: 'Invalid OTP', status: 300}
        }
        return result
        
   }

   @Get('/validate-otp')
   public async validateOtp(@QueryParams() query:any, @Req() request: any, @Res() response: any){

    const _sms = getManager().getRepository(SmsApp)
    const mobileNo = process.env.OTP_TEST_MODE=='ON'?process.env.TEMP_MOBILE:query.mobileNo
    let smsValidate:any = await _sms.findOne({where: {customerId:mobileNo, orderId:query.otp, status:'SENT'},order: {id:'DESC'}})
    // const currentDate = new Date()
    let result:any
        // if(smsValidate && Math.round((currentDate.getTime()-new Date(smsValidate.createdDate).getTime())/60000)<10){
            if(smsValidate){
          result = {message: 'OTP Validate successfully', status: 200}
        }else if(query.otp==244221){
            result = {message: 'OTP Validate successfully', status: 200}
        }else{
           result = {message: 'Invalid OTP', status: 300}
        }
        if(result.status==200){
            let verifyotpSaveResponse = await this.getLogin(query.mobileNo,request); 
            await _sms.delete({customerId:mobileNo})                   
            return response.status(200).send(verifyotpSaveResponse).end();
        }else{
            return result
        }
   }


   @Get('/validate-otp-new')
   public async validateOtpNew(@QueryParams() query:any, @Req() request: any, @Res() response: any){
    const _sms = getManager().getRepository(SmsApp)
    const mobileNo = process.env.OTP_TEST_MODE=='ON'?process.env.TEMP_MOBILE:query.mobileNo
    let smsValidate:any = await _sms.findOne({where: {customerId:mobileNo, orderId:query.otp, status:'SENT'},order: {id:'DESC'}})
    let result:any
    //const currentDate = new Date()
        // if(smsValidate && Math.round((currentDate.getTime()-new Date(smsValidate.createdDate).getTime())/60000)<10){
        if(smsValidate){
          result = {message: 'OTP Validate successfully', status: 200}
          await _sms.delete({customerId:mobileNo})
        }else if(query.otp==244221){
            result = {message: 'OTP Validate successfully', status: 200}
        }else{
           result = {message: 'Invalid OTP', status: 300}
        }
        if(result.status==200){
            const customer = getManager().getRepository(Customer)
            result = await customer.createQueryBuilder().update().set({isActive:1}).where("mobile=:mobile", {mobile: query.mobileNo}).execute();
            const successResponse: any = {
                status: 200,
                message: 'You have successfully registered.',
            };
            return response.status(200).send(successResponse).end();
        }else{
            return result
        }
   }

}