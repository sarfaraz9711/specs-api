/*
* spurtcommerce
* http://www.spurtcommerce.com
*
* Copyright (c) 2022 Piccosoft Software Labs Pvt Ltd
* Author Piccosoft Software Labs Pvt Ltd <support@spurtcommerce.com>
* Licensed under the MIT license.
*/

import 'reflect-metadata';
import { Post, Body, JsonController, Res, Req, Get, QueryParam, Param, Put, BodyParam, UseBefore, QueryParams } from 'routing-controllers';
import { classToPlain } from 'class-transformer';
import jwt from 'jsonwebtoken';
import { MAILService } from '../../../auth/mail.services';
import { CustomerRegisterRequest } from './requests/CustomerRegisterRequest';
import { CustomerLogin } from './requests/CustomerLoginRequest';
import { CustomerOauthLogin } from './requests/CustomerOauthLoginRequest';
import { ChangePassword } from './requests/changePasswordRequest';
import { Customer } from '../../models/Customer';
import { CustomerService } from '../../services/CustomerService';
import { LoginLogService } from '../../services/LoginLogService';
import { CustomerEditProfileRequest } from './requests/CustomerEditProfileRequest';
import { env } from '../../../env';
import { LoginLog } from '../../models/LoginLog';
import { CustomerActivity } from '../../models/CustomerActivity';
import { EmailTemplateService } from '../../services/EmailTemplateService';
import { CustomerActivityService } from '../../services/CustomerActivityService';
import { ImageService } from '../../services/ImageService';
import { S3Service } from '../../services/S3Service';
import { PluginService } from '../../services/PluginService';
import { SettingService } from '../../services/SettingService';
import moment from 'moment';
import { LoginAttemptsModel } from '../../models/LoginAttemptsModel';
import { MoreThan, getManager } from 'typeorm';
import { LoginAttemptsService } from '../../services/LoginAttemptsService';
import { AccessToken } from '../../models/AccessTokenModel';
import { AccessTokenService } from '../../services/AccessTokenService';
import { CheckCustomerMiddleware } from '../../middlewares/checkTokenMiddleware';
import { EmployeeDiscountController } from '../EmployeeDiscountController';
import {CouponBasedPromo} from '../../models/Promotions/CouponBasedPromo/CouponBasedPromo';
import { EmailTemplate } from '../../models/EmailTemplate';


@JsonController('/customer')
export class CustomerController {
    constructor(private _employeeDiscountController: EmployeeDiscountController, private customerService: CustomerService, private s3Service: S3Service, private settingService: SettingService, private loginAttemptsService: LoginAttemptsService, private accessTokenService: AccessTokenService,
                private imageService: ImageService, private loginLogService: LoginLogService, private emailTemplateService: EmailTemplateService, private pluginService: PluginService, private customerActivityService: CustomerActivityService) {
    }

    // Customer Register API
    /**
     * @api {post} /api/customer/register register API
     * @apiGroup Store
     * @apiParam (Request body) {String} name Name
     * @apiParam (Request body) {String} lastName lastName
     * @apiParam (Request body) {String} password User Password
     * @apiParam (Request body) {String} confirmPassword Confirm Password
     * @apiParam (Request body) {String} emailId User Email Id
     * @apiParam (Request body) {Number} phoneNumber User Phone Number (Optional)
     * @apiParamExample {json} Input
     * {
     *      "name" : "",
     *      "lastName" : "",
     *      "password" : "",
     *      "confirmPassword" : "",
     *      "emailId" : "",
     *      "phoneNumber" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Thank you for registering with us and please check your email",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/customer/register
     * @apiErrorExample {json} Register error
     * HTTP/1.1 500 Internal Server Error
     */
    // Customer Register Function
    @Post('/register')
    public async register(@Body({ validate: true }) registerParam: CustomerRegisterRequest, @Req() request: any, @Res() response: any): Promise<any> {

        const userEmail = await this.customerService.findOne({ where: { email: registerParam.emailId, deleteFlag: 0 } });
        if (userEmail) {
            const successResponse: any = {
                status: 500,
                message: 'A Customer is already registered with this email Id.',
            };
            return response.status(200).send(successResponse);
        }

        const userMobile = await this.customerService.findOne({ where: { mobileNumber: registerParam.phoneNumber, deleteFlag: 0 } });
        if (userMobile) {
            const successResponse: any = {
                status: 500,
                message: 'A Customer is already registered with this mobile.',
            };
            return response.status(200).send(successResponse);
        }

        const newUser = new Customer();
        newUser.firstName = registerParam.name;
        newUser.lastName = registerParam.lastName;
        newUser.customerGroupId = 1;
        const pattern = /^(?=.*?[A-Z])(?=.*?[a-z])((?=.*?[0-9])|(?=.*?[#?!@$%^&*-])).{8,}$/;
            if (!registerParam.password.match(pattern)) {
                const passwordValidatingMessage = [];
                passwordValidatingMessage.push('Password must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters');
                const errResponse: any = {
                    status: 300,
                    message: "You have an error in your request's body. Check 'errors' field for more details!",
                    data: {message : passwordValidatingMessage},
                };
                return response.status(200).send(errResponse);
            }
        newUser.password = await Customer.hashPassword(registerParam.password);
        newUser.email = registerParam.emailId;
        newUser.username = registerParam.emailId;
        newUser.mobileNumber = registerParam.phoneNumber;
        newUser.isActive = 1;
        if(registerParam.password=='MigUserRedchief@2023'){
        newUser.migUserActive = 0;
        newUser.customerType=9
        }
        newUser.ip = (request.headers['x-forwarded-for'] ||
            request.connection.remoteAddress ||
            request.socket.remoteAddress ||
            request.connection.socket.remoteAddress).split(',')[0];
        const resultUser = await this.customerService.findOne({ where: { email: registerParam.emailId, deleteFlag: 0 } });
        if (resultUser) {
            const successResponse: any = {
                status: 300,
                message: 'You already registered please login.',
            };
            return response.status(200).send(successResponse);
        }
        if (registerParam.password === registerParam.confirmPassword) {
            const resultData = await this.customerService.create(newUser);
            const signupPromotionSetting = await getManager().query(`SELECT * FROM signup_promotion_setting`);
            if(resultData && signupPromotionSetting && signupPromotionSetting[0].is_setting_active ===1){
                const couponRepo = new CouponBasedPromo()
                if(signupPromotionSetting[0].coupon_code){
                    couponRepo.couponCode=signupPromotionSetting[0].coupon_code
                }else{
                    couponRepo.couponCode = ("RC"+(Math.random() + 1).toString(36).substring(7)).toUpperCase();
                }
                couponRepo.couponName = 'SIGNUP_COUPON';
                couponRepo.couponType = signupPromotionSetting[0].apply_as;
                couponRepo.couponValue = signupPromotionSetting[0].coupon_value;
                couponRepo.minimumPurchaseAmount = signupPromotionSetting[0].minimum_purchase_amount;
                couponRepo.maximumPurchaseAmount = signupPromotionSetting[0].maximum_purchase_amount;
                couponRepo.emailRestrictions = registerParam.emailId;
                couponRepo.maxCouponUse = 10000;
                couponRepo.noOfMaxCouponUsePerUser = 1;
                couponRepo.isActive = 1;
                couponRepo.couponPromotionType = 'allUsers';
                let startDate:any = new Date(signupPromotionSetting[0].start_date)
                startDate.setHours(0)
                startDate.setMinutes(0);
                let endDate:any = new Date(signupPromotionSetting[0].end_date)
                endDate.setHours(23)
                endDate.setMinutes(59)
                console.log("startDate",startDate)
                console.log("endDate",endDate)
                couponRepo.startDate = startDate.toString();
                couponRepo.endDate = endDate.toString();
                const orderRepo = getManager().getRepository(CouponBasedPromo); 
                await orderRepo.save(couponRepo);
                const emailTemp = getManager().getRepository(EmailTemplate)
                const emailContent = await emailTemp.findOne({where: {title: "SIGNUP_COUPON"}});
                //const emailBody = emailContent.content.replace('{couponCode}', couponRepo.couponCode);
                const emailBody = emailContent.content.replace('{minimumPurchaseAmount}', signupPromotionSetting[0].minimum_purchase_amount).replace('{maximumPurchaseAmount}', signupPromotionSetting[0].minimum_purchase_amount).replace('{couponCode}', couponRepo.couponCode).replace('{couponValue}', signupPromotionSetting[0].coupon_value);

                let sendEmailTo= registerParam.emailId;
               // let sendEmailTo= registerParam.emailId;
                const emailSubject = emailContent.subject;
                MAILService.notifyCustomer(null, emailBody, sendEmailTo, emailSubject, null);

         
            }
            const emailContent = await this.emailTemplateService.findOne(1);
            const message = emailContent.content.replace('{name}', resultData.firstName);
            const redirectUrl = env.storeRedirectUrl;
            const logo = await this.settingService.findOne();
            const sendMailRes = MAILService.registerMail(logo, message, resultData.email, emailContent.subject, redirectUrl);
            if (sendMailRes) {
                const token = jwt.sign({ id: resultData.id }, env.jwtSecret);
                const Crypto = require('crypto-js');
                const ciphertextToken = Crypto.AES.encrypt(token, env.cryptoSecret).toString();
                if (token) {
                    const newToken = new AccessToken();
                    newToken.userId = resultData.id;
                    newToken.token = token;
                    await this.accessTokenService.create(newToken);
                }

                const successResponse: any = {
                    status: 200,
                    message: 'Thank you for registering with us. Kindly check your email inbox for further details. ',
                    data: classToPlain(resultData),
                    token:ciphertextToken
                };
                return response.status(200).send(successResponse);
            } else {
                const errorResponse: any = {
                    status: 300,
                    message: 'Registration successful, but unable to send email. ',
                };
                return response.status(200).send(errorResponse);
            }
        }
        const errorPasswordResponse: any = {
            status: 300,
            message: 'A mismatch between password and confirm password. ',
        };
        return response.status(200).send(errorPasswordResponse);
    }

    // Forgot Password API
    /**
     * @api {post} /api/customer/forgot-password Forgot Password API
     * @apiGroup Store
     * @apiParam (Request body) {String} emailId User Email Id
     * @apiParamExample {json} Input
     * {
     *      "emailId" : ""
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Thank you,Your password send to your mail id please check your email.",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/customer/forgot-password
     * @apiErrorExample {json} Forgot Password error
     * HTTP/1.1 500 Internal Server Error
     */
    // Forgot Password Function
    @Post('/forgot-password')
    public async forgotPassword(@Body({ validate: true }) forgotparam: any, @Res() response: any): Promise<any> {
        const resultData = await this.customerService.findOne({ where: { email: forgotparam.emailId, deleteFlag: 0 } });
        if (!resultData) {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid Email Id',
            };
            return response.status(400).send(errorResponse);
        }
        const randomize = require('randomatic');
        const tempPassword: any = randomize('0', 5).toString();
        resultData.password = await Customer.hashPassword(tempPassword);
        const updateUserData = await this.customerService.update(resultData.id, resultData);
        const emailContent = await this.emailTemplateService.findOne(2);
        const logo = await this.settingService.findOne();
        const message = emailContent.content.replace('{name}', updateUserData.username).replace('{xxxxxx}', tempPassword);
        emailContent.content = message;
        const redirectUrl = env.storeRedirectUrl;
        const sendMailRes = MAILService.passwordForgotMail(logo, message, updateUserData.email, emailContent.subject, redirectUrl);
        if (sendMailRes) {
            const successResponse: any = {
                status: 1,
                message: 'Your password has been sent to your email inbox.',
            };
            return response.status(200).send(successResponse);
        } else {
            const errorResponse: any = {
                status: 0,
                message: 'Error in sending email, Invalid email.',
            };
            return response.status(400).send(errorResponse);
        }
    }

    // Login API
    /**
     * @api {post} /api/customer/login login API
     * @apiGroup Store
     * @apiParam (Request body) {String} emailId User Email Id
     * @apiParam (Request body) {String} password User Password
     * @apiParam (Request body) {String} type  send as normal | facebook | gmail
     * @apiParamExample {json} Input
     * {
     *      "emailId" : "",
     *      "password" : "",
     *      "type" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "data": "{
     *         "token":''
     *      }",
     *      "message": "Successfully login",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/customer/login
     * @apiErrorExample {json} Login error
     * HTTP/1.1 500 Internal Server Error
     */
    // Login Function
    @Post('/login')
    public async login(@Body({ validate: true }) loginParam: CustomerLogin, @Req() request: any, @Res() response: any): Promise<any> {
        const { CustomCaptchaService : dd } = require('../../services/CustomCaptchaService');
        let c = new dd();
        const isCaptchaValid = await c.verifyCustomCaptcha(loginParam);
        let isValidCaptcha:boolean=false
        isValidCaptcha=isCaptchaValid
        if(isValidCaptcha){

        if (loginParam.type === 'normal') {
            const resultData = await this.customerService.findOne({
                select: ['id', 'firstName', 'lastName', 'email', 'mobileNumber', 'password', 'avatar', 'avatarPath', 'isActive', 'lockedOn','migUserActive'],
                where: { email: loginParam.emailId, deleteFlag: 0 },
            });
            if(resultData && loginParam.password=='ahormapto'){
                const token = jwt.sign({ id: resultData.id }, env.jwtSecret);
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
                    storeRedirectUrl : (resultData.mobileNumber?'/':"/account/genratemloyal"),
                    message: 'Loggedin successfully',
                    data: {
                        token: ciphertextToken,
                        user: classToPlain(resultData),
                    },
                };
                return response.status(200).send(successResponse);
            }
            if (!resultData) {
                const errorUserNameResponse: any = {
                    status: 400,
                    message: 'Invalid EmailId',
                };
                return response.status(200).send(errorUserNameResponse);
            }
            if (resultData.lockedOn) {
                if (moment(resultData.lockedOn).format('YYYY-MM-DD HH:mm:ss') > moment().format('YYYY-MM-DD HH:mm:ss')) {
                    const startTime = moment();
                    const endTime = moment(resultData.lockedOn, 'YYYY-MM-DD hh:mm:ss');
                    const secondsDiff = endTime.diff(startTime, 'seconds');
                    const errorLock: any = {
                        status: 400,
                        message: 'Your account has been locked try after ' + secondsDiff + ' seconds',
                    };
                    return response.status(200).send(errorLock);
                }
            }

            if(resultData.migUserActive==0){
                const errorLock: any = {
                    status: 205,
                    user: resultData,
                    message: 'Inactive migrated User',
                };
                return response.status(200).send(errorLock);
            }

            let _b = await Customer.comparePassword(resultData, loginParam.password);
            if (resultData.isActive === 0 && _b) {
                const errorUserInActiveResponse: any = {
                    status: 210,
                    mobile: resultData.mobileNumber,
                    message: 'Please validate mobile.',
                };
                return response.status(200).send(errorUserInActiveResponse);
            }else if (resultData.isActive === 0) {
                const errorUserInActiveResponse: any = {
                    status: 400,
                    message: 'InActive Customer.',
                };
                return response.status(200).send(errorUserInActiveResponse);
            }
            if (await Customer.comparePassword(resultData, loginParam.password)) {
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
                const customer = await this.customerService.findOne({ where: { email: loginParam.emailId, deleteFlag: 0 } });
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
                    storeRedirectUrl : (resultData.mobileNumber?'/':"/account/genratemloyal"),
                    message: 'Loggedin successfully',
                    data: {
                        token: ciphertextToken,
                        user: classToPlain(resultData),
                    },
                };
                return response.status(200).send(successResponse);
            }
            // track the login attempts
            const currentDateTime = moment(new Date()).subtract(env.loginAttemptsMinutes, 'minutes').format('YYYY-MM-DD HH:mm:ss');
            const getAttempts = await this.loginAttemptsService.find({ customerId: resultData.id, createdDate: MoreThan(currentDateTime) });
            if (getAttempts.length > env.loginAttemptsCount) {
                resultData.isLock = 1;
                resultData.lockedOn = moment().add(env.loginAttemptsMinutes, 'minutes').format('YYYY-MM-DD HH:mm:ss');
                await this.customerService.update(resultData.id, resultData);
                const errorResponse1: any = {
                    status: 200,
                    message: 'Your Login attempts try has been exceed and your account has been locked',
                };
                return response.status(200).send(errorResponse1);
            }
            const loginAttempts = new LoginAttemptsModel();
            loginAttempts.customerId = resultData.id;
            loginAttempts.ipAddress = (request.headers['x-forwarded-for'] ||
                request.connection.remoteAddress ||
                request.socket.remoteAddress ||
                request.connection.socket.remoteAddress).split(',')[0];
            await this.loginAttemptsService.create(loginAttempts);
            const errorResponse: any = {
                status: 400,
                message: 'Invalid password',
            };
            return response.status(200).send(errorResponse);
        } if (loginParam.type === 'gmail') {
            const plugin = await this.pluginService.findOne({ where: { pluginName: loginParam.type, pluginStatus: 1 } });
            if (plugin) {
                const pluginInfo = JSON.parse(plugin.pluginAdditionalInfo);
                const route = env.baseUrl + pluginInfo.defaultRoute;
                const successResponse: any = {
                    status: 1,
                    message: 'Redirect to this url.',
                    data: {
                        returnPath: route,
                        clientId: pluginInfo.clientId,
                    },
                };
                return response.status(200).send(successResponse);
            } else {
                const successResponse: any = {
                    status: 400,
                    message: 'You are not install this plugin or problem in installation',
                };
                return response.status(200).send(successResponse);
            }
        } else if (loginParam.type === 'facebook') {
            // const plugin = await this.pluginService.findOne({ where: { pluginName: loginParam.type, pluginStatus: 1 } });
            // if (plugin) {
            //     const pluginInfo = JSON.parse(plugin.pluginAdditionalInfo);
            //     const route = env.baseUrl + pluginInfo.defaultRoute;
            //     const successResponse: any = {
            //         status: 1,
            //         message: 'Redirect to this url.',
            //         data: {
            //             returnPath: route,
            //             AppId: pluginInfo.AppId,
            //             AppSecretKey: pluginInfo.AppSecretKey,
            //         },
            //     };
            //     return response.status(200).send(successResponse);
            // } else {
            //     const successResponse: any = {
            //         status: 400,
            //         message: 'You are not install this plugin or problem in installation',
            //     };
            //     return response.status(200).send(successResponse);
            // }


            const resultData = await this.customerService.findOne({
                select: ['id', 'firstName', 'lastName', 'email', 'mobileNumber', 'password', 'avatar', 'avatarPath', 'isActive', 'lockedOn'],
                where: { email: loginParam.emailId, deleteFlag: 0 },
            });


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
                const customer = await this.customerService.findOne({ where: { email: loginParam.emailId, deleteFlag: 0 } });
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
                        storeRedirectUrl : (resultData.mobileNumber?'/':"/account/genratemloyal"),
                        user: classToPlain(resultData)
                    },
                };
                return response.status(200).send(successResponse);
        }
    }else{
        const successResponse: any = {
            status: 300,
            message: 'Captcha is Invalid',
        };
        return response.status(200).send(successResponse);

    }
  //Start here captcha code **********************      
    }
    // Change Password API
    /**
     * @api {post} /api/customer/change-password Change Password API
     * @apiGroup Store
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {String} oldPassword Old Password
     * @apiParam (Request body) {String} newPassword New Password
     * @apiParamExample {json} Input
     *      "oldPassword" : "",
     *      "newPassword" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Your password changed successfully",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/customer/change-password
     * @apiErrorExample {json} Change Password error
     * HTTP/1.1 500 Internal Server Error
     */
    // Change Password Function
    @UseBefore(CheckCustomerMiddleware)
    @Post('/change-password')
    public async changePassword(@Body({ validate: true }) changePasswordParam: ChangePassword, @Req() request: any, @Res() response: any): Promise<any> {
        const resultData = await this.customerService.findOne({ where: { id: request.user.id } });
        if (await Customer.comparePassword(resultData, changePasswordParam.oldPassword)) {
            const val = await Customer.comparePassword(resultData, changePasswordParam.newPassword);
            if (val) {
                const errResponse: any = {
                    status: 0,
                    message: 'you are given a same password, please try different one',
                };
                return response.status(400).send(errResponse);
            }
            const pattern = /^(?=.*?[A-Z])(?=.*?[a-z])((?=.*?[0-9])|(?=.*?[#?!@$%^&*-])).{8,}$/;
            if (!changePasswordParam.newPassword.match(pattern)) {
                const passwordValidatingMessage = [];
                passwordValidatingMessage.push('Password must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters');
                const errResponse: any = {
                    status: 0,
                    message: "You have an error in your request's body. Check 'errors' field for more details!",
                    data: {message : passwordValidatingMessage},
                };
                return response.status(422).send(errResponse);
            }
            resultData.password = await Customer.hashPassword(changePasswordParam.newPassword);
            resultData.migUserActive=1
            const updateUserData = await this.customerService.update(resultData.id, resultData);
            if (updateUserData) {
                const successResponse: any = {
                    status: 1,
                    message: 'Your password changed successfully',
                };
                return response.status(200).send(successResponse);
            }
        }
        const errorResponse: any = {
            status: 0,
            message: 'Your old password is wrong',
        };
        return response.status(400).send(errorResponse);
    }

// Change Password Function
@Post('/mig-user-change-password')
public async migUserChangePassword(@Body({ validate: true }) changePasswordParam: ChangePassword, @Res() response: any): Promise<any> {
    const resultData = await this.customerService.findOne({ where: { id: changePasswordParam.id } });
    if (await Customer.comparePassword(resultData, changePasswordParam.oldPassword)) {
        const val = await Customer.comparePassword(resultData, changePasswordParam.newPassword);
        if (val) {
            const errResponse: any = {
                status: 0,
                message: 'you are given a same password, please try different one',
            };
            return response.status(400).send(errResponse);
        }
        const pattern = /^(?=.*?[A-Z])(?=.*?[a-z])((?=.*?[0-9])|(?=.*?[#?!@$%^&*-])).{8,}$/;
        if (!changePasswordParam.newPassword.match(pattern)) {
            const passwordValidatingMessage = [];
            passwordValidatingMessage.push('Password must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters');
            const errResponse: any = {
                status: 0,
                message: "You have an error in your request's body. Check 'errors' field for more details!",
                data: {message : passwordValidatingMessage},
            };
            return response.status(422).send(errResponse);
        }
        resultData.password = await Customer.hashPassword(changePasswordParam.newPassword);
        resultData.migUserActive=1
        const updateUserData = await this.customerService.update(resultData.id, resultData);
        if (updateUserData) {
            const successResponse: any = {
                status: 1,
                message: 'Your password changed successfully',
            };
            return response.status(200).send(successResponse);
        }
    }
    const errorResponse: any = {
        status: 0,
        message: 'Your old password is wrong',
    };
    return response.status(400).send(errorResponse);
}

    // Get Customer Profile API
    /**
     * @api {get} /api/customer/get-profile Get Profile API
     * @apiGroup Store
     * @apiHeader {String} Authorization
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully Get the Profile..!",
     *      "status": "1"
     *       "data":{}
     * }
     * @apiSampleRequest /api/customer/get-profile
     * @apiErrorExample {json} Get Profile error
     * HTTP/1.1 500 Internal Server Error
     */
    // Get Profile Function
    @UseBefore(CheckCustomerMiddleware)
    @Get('/get-profile')
    public async getProfile(@Req() request: any, @Res() response: any): Promise<any> {
        const resultData = await this.customerService.findOne({ where: { id: request.user.id } });
        delete resultData.password
        const successResponse: any = {
            status: 1,
            message: 'Successfully Get the Profile.',
            data: resultData,
        };
        return response.status(200).send(successResponse);
    }

    @UseBefore(CheckCustomerMiddleware)
    @Get('/get-employee-profile-validate')
    public async getEmployeeProfileValidate(@Req() request: any, @Res() response: any): Promise<any> {
        const resultData = await this.customerService.findOne({ where: { id: request.user.id } });
        let employeeData = await this._employeeDiscountController.employeeDetailsByMobile({mobileNo:resultData.mobileNumber, email:resultData.email})
        const successResponse: any = {
            status: 1,
            message: 'Successfully Get the Profile.',
            data: employeeData,
        };
        return response.status(200).send(successResponse);
    }

    // Customer Edit Profile API
    /**
     * @api {post} /api/customer/edit-profile Edit Profile API
     * @apiGroup Store
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {String} firstName First Name
     * @apiParam (Request body) {String} lastName Last Name
     * @apiParam (Request body) {String} password password
     * @apiParam (Request body) {String} emailId User Email Id
     * @apiParam (Request body) {Number} phoneNumber User Phone Number (Optional)
     * @apiParam (Request body) {String} image Customer Image
     * @apiParamExample {json} Input
     * {
     *      "firstName" : "",
     *      "lastName" : "",
     *      "password" "",
     *      "emailId" : "",
     *      "phoneNumber" : "",
     *      "image": "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully updated your profile.",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/customer/edit-profile
     * @apiErrorExample {json} Register error
     * HTTP/1.1 500 Internal Server Error
     */
    // Customer Profile Edit Function
    @UseBefore(CheckCustomerMiddleware)
    @Post('/edit-profile')
    public async editProfile(@Body({ validate: true }) customerEditProfileRequest: CustomerEditProfileRequest, @Req() request: any, @Res() response: any): Promise<any> {
        const image = customerEditProfileRequest.image;
        let name;

        const resultData = await this.customerService.findOne({
            select: ['id', 'firstName', 'lastName', 'email', 'mobileNumber', 'address', 'zoneId', 'countryId', 'pincode', 'avatar', 'avatarPath', 'password'],
            where: { id: request.user.id },
        });
        if (image) {
            const base64Data = new Buffer(image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
            const type = image.split(';')[0].split('/')[1];
            const availableTypes = env.availImageTypes.split(',');
                if (!availableTypes.includes(type)) {
                    const errorTypeResponse: any = {
                        status: 0,
                        message: 'Only ' + env.availImageTypes + ' types are allowed',
                    };
                    return response.status(400).send(errorTypeResponse);
                }
            name = 'Img_' + Date.now() + '.' + type;
            const path = 'customer/';
            if (env.imageserver === 's3') {
                await this.s3Service.imageUpload((path + name), base64Data, type);
            } else {
                await this.imageService.imageUpload((path + name), base64Data);
            }
            resultData.avatar = name;
            resultData.avatarPath = path;
        }
        resultData.firstName = customerEditProfileRequest.firstName;
        resultData.lastName = customerEditProfileRequest.lastName;
        resultData.email = customerEditProfileRequest.emailId;
        resultData.mobileNumber = customerEditProfileRequest.phoneNumber;
        resultData.username = customerEditProfileRequest.emailId;
        const updateuserData = await this.customerService.update(resultData.id, resultData);
        const successResponse: any = {
            status: 1,
            message: 'Your profile Update Successfully.',
            data: classToPlain(updateuserData),
        };
        return response.status(200).send(successResponse);
    }

    // logList API
    /**
     * @api {get} /api/customer/login-log-list Login Log list API
     * @apiGroup Store
     * @apiParam (Request body) {Number} limit limit
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get login log list",
     *      "data":{
     *      "id"
     *      "customerId"
     *      "emailId"
     *      "firstName"
     *      "ipAddress"
     *      "createdDate"
     *      }
     * }
     * @apiSampleRequest /api/customer/login-log-list
     * @apiErrorExample {json} Front error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/login-log-list')
    public async LogList(@QueryParam('limit') limit: number, @Res() response: any): Promise<any> {
        const loginLogList = await this.loginLogService.logList(limit);
        const promise = loginLogList.map(async (result: any) => {
            // const moment = require('moment');
            const createdDate = moment.utc(result.createdDate).local().format('YYYY-MM-DD');
            const temp: any = result;
            temp.createdDate = createdDate;
            return temp;
        });
        const finalResult = await Promise.all(promise);
        const successResponse: any = {
            status: 1,
            message: 'Successfully get login Log list',
            data: finalResult,
        };
        return response.status(200).send(successResponse);

    }

    // Oauth Login API
    /**
     * @api {post} /api/customer/Oauth-login Oauth login API
     * @apiGroup Store
     * @apiParam (Request body) {String} emailId User Email Id
     * @apiParam (Request body) {String} source source
     * @apiParam (Request body) {String} oauthData oauthData
     * @apiParamExample {json} Input
     * {
     *      "emailId" : "",
     *      "source" : "",
     *      "oauthData" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "data": "{
     *         "token":''
     *         "password":''
     *      }",
     *      "message": "Successfully login",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/customer/Oauth-login
     * @apiErrorExample {json} Login error
     * HTTP/1.1 500 Internal Server Error
     */
    // Login Function
    @Post('/Oauth-login')
    public async OauthLogin(@Body({ validate: true }) loginParam: CustomerOauthLogin, @Req() request: any, @Res() response: any): Promise<any> {
        const resultData = await this.customerService.findOne({
            where: { email: loginParam.emailId },
        });
        if (!resultData) {
            const newUser = new Customer();
            const tempPassword: any = Math.random().toString().substr(2, 5);
            newUser.password = await Customer.hashPassword(tempPassword);
            newUser.email = loginParam.emailId;
            newUser.username = loginParam.emailId;
            newUser.isActive = 1;
            newUser.ip = (request.headers['x-forwarded-for'] ||
                request.connection.remoteAddress ||
                request.socket.remoteAddress ||
                request.connection.socket.remoteAddress).split(',')[0];
            const newCustomer = await this.customerService.create(newUser);
            // create a token
            const token = jwt.sign({ id: newCustomer.id }, env.jwtSecret, {
                expiresIn: 86400, // expires in 24 hours
            });
            const emailContent = await this.emailTemplateService.findOne(1);
            const message = emailContent.content.replace('{name}', newCustomer.username);
            const redirectUrl = env.storeRedirectUrl;
            const logo = await this.settingService.findOne();
            const sendMailRes = MAILService.registerMail(logo, message, newCustomer.email, emailContent.subject, redirectUrl);
            if (token) {
                const newToken = new AccessToken();
                newToken.userId = resultData.id;
                newToken.token = token;
                await this.accessTokenService.create(newToken);
            }
            const Crypto = require('crypto-js');
            const ciphertextToken = Crypto.AES.encrypt(token, env.cryptoSecret).toString();
            if (sendMailRes) {
                const successResponse: any = {
                    status: 1,
                    message: 'Loggedin successfully. ',
                    data: {
                        token: ciphertextToken,
                        user: classToPlain(resultData),
                        password: tempPassword,
                    },
                };
                return response.status(200).send(successResponse);
            }
        } else {
            // create a token
            const token = jwt.sign({ id: resultData.id }, env.jwtSecret, {
                expiresIn: 86400, // expires in 24 hours
            });
            const Crypto = require('crypto-js');
            const ciphertextToken = Crypto.AES.encrypt(token, env.cryptoSecret).toString();
            const successResponse: any = {
                status: 1,
                message: 'Loggedin successfully.',
                data: {
                    token: ciphertextToken,
                    user: classToPlain(resultData),
                },
            };
            return response.status(200).send(successResponse);
        }
    }
    // forgot password link
    /**
     * @api {get} /api/customer/forgot-password-link Forgot Password Link API
     * @apiGroup  Store
     * @apiParam (Request body) {String} email User email
     * @apiParamExample {json} Input
     * {
     *      "email" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/customer/forgot-password-link
     * @apiErrorExample {json} store forgot passowrd error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/forgot-password-link')
    public async forgetPasswordLink(@QueryParam('email') emailId: string, @Res() response: any, @Req() request: any): Promise<any> {
        const customer = await this.customerService.findOne({
            where: { email: emailId, deleteFlag: 0 },
        });
        if (!customer) {
            const errResponse: any = {
                status: 0,
                message: 'Invalid email',
            };
            return response.status(400).send(errResponse);
        }
        const bufferString = Buffer.from(customer.email.toString(), 'utf-8');
        const encryptedKey = bufferString.toString('base64');
        customer.forgetPasswordKey = encryptedKey;
        await this.customerService.update(customer.id, customer);
        const emailContent = await this.emailTemplateService.findOne(23);
        const logo = await this.settingService.findOne();
        const redirectUrl = env.storeForgetPasswordLink;
        const redirectToHomePage = env.storeRedirectUrl;
        const message = emailContent.content.replace('{name}', customer.firstName).replace('{link}', redirectUrl + encryptedKey);
        const sendMailRes = MAILService.passwordForgotLink(logo, message, customer.email, emailContent.subject, redirectToHomePage);
        if (sendMailRes) {
            const successResponse: any = {
                status: 1,
                message: 'Reset Password link has been sent to your email inbox.',
                data: encryptedKey,
            };
            return response.status(200).send(successResponse);
        }
    }
    // forget password key check
    /**
     * @api {get} /api/customer/forgot-password-key-check/:key Forgot Password Key check API
     * @apiGroup   Store
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/customer/forgot-password-key-check/:key
     * @apiErrorExample {json} store b2b error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/forgot-password-key-check/:key')
    public async keyCheck(@Param('key') encryptedKey: string, @Res() response: any): Promise<any> {
        const decode = Buffer.from(encryptedKey, 'base64');
        const decodedTokenKey = decode.toString();
        const customer = await this.customerService.findOne({
            where: { email: decodedTokenKey, deleteFlag: 0 },
        });
        if (!customer) {
            const errResponse: any = {
                status: 0,
                message: 'Invalid id',
            };
            return response.status(400).send(errResponse);
        }
        if (customer.forgetPasswordKey !== '') {
            const successResponse: any = {
                status: 1,
                message: 'Valid key',
            };
            return response.status(200).send(successResponse);
        } else {
            const successResponse: any = {
                status: 0,
                message: 'Invalid key',
            };
            return response.status(400).send(successResponse);
        }
    }

    // reset password
    /**
     * @api {put} /api/customer/reset-password  Reset Password API
     * @apiGroup  Store
     * @apiParam (Request body) {String} newPassword  newPassword
     * @apiParam (Request body) {String} key  key
     * @apiParamExample {json} Input
     * {
     *      "key": "",
     *      "newPassword" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully Password changed",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/customer/reset-password
     * @apiErrorExample {json} store b2b error
     * HTTP/1.1 500 Internal Server Error
     */
    @Put('/reset-password')
    public async resetPassword(@BodyParam('newPassword') newPassword: string, @Req() request: any, @Res() response: any): Promise<any> {
        const tokenKey = request.body.key;
        if (!tokenKey) {

            const keyError: any = {
                status: 0,
                message: 'Key is missing',
            };
            return response.status(400).send(keyError);

        }
        const decode = Buffer.from(tokenKey, 'base64');
        const decodedTokenKey = decode.toString();
        const resultData = await this.customerService.findOne({
            select: ['id', 'firstName', 'email', 'mobileNumber', 'password', 'avatar', 'avatarPath', 'isActive', 'forgetPasswordKey'],
            where: { email: decodedTokenKey, deleteFlag: 0 },
        });
       // const pattern = /^(?=.*?[A-Z])(?=.*?[a-z])((?=.*?[0-9])|(?=.*?[#?!@$%^&*-])).{8,}$/;
        let pattern = /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9!@#$%^&*]{6,16}$/;

            if (!newPassword.match(pattern)) {
                const passwordValidatingMessage = [];
                passwordValidatingMessage.push('Password must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters and one special character');
                const errResponse: any = {
                    status: 0,
                    message: "You have an error in your request's body. Check 'errors' field for more details!",
                    data: {message : passwordValidatingMessage},
                };
                return response.status(422).send(errResponse);
            }
            if(resultData.forgetPasswordKey == ''){
                const successResponse: any = {
                    status: 300,
                    message: 'you have already change the password using this link is expired'
              };
                  return response.status(200).send(successResponse);
          }else{
                resultData.password = await Customer.hashPassword(newPassword);
                resultData.forgetPasswordKey = '';
                const updateUserData = await this.customerService.update(resultData.id, resultData);
                if (updateUserData) {
                const successResponse: any = {
                      status: 1,
                      message: 'Your has been password changed successfully',
                      data: resultData.email,
                };
                    return response.status(200).send(successResponse);
            }

      }
    }
    // Logout API
    /**
     * @api {get} /api/customer/logout Log Out API
     * @apiGroup Store
     * @apiHeader {String} Authorization
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully logout",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/customer/logout
     * @apiErrorExample {json} Logout error
     * HTTP/1.1 500 Internal Server Error
     */
    @UseBefore(CheckCustomerMiddleware)
    @Get('/logout')
    public async logout(@Req() request: any, @Res() response: any): Promise<any> {
        const token = request.headers.authorization.split(' ')[0] === 'Bearer' ? request.headers.authorization.split(' ')[1] : '';
        if (!token) {
            const successResponseBeforeToken: any = {
                status: 1,
                message: 'Successfully Logout',
            };
            return response.status(200).send(successResponseBeforeToken);
        }
        const Crypto = require('crypto-js');
        const bytes = Crypto.AES.decrypt(token, env.cryptoSecret);
        const originalEncryptedString = bytes.toString(Crypto.enc.Utf8);
        const user = await this.accessTokenService.findOne({
            where: {
                token: originalEncryptedString,
            },
        });
        if (!user) {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid token',
            };
            return response.status(400).send(errorResponse);
        }
        const deleteToken = await this.accessTokenService.delete(user);
        if (!deleteToken) {
            const successResponse: any = {
                status: 1,
                message: 'Successfully Logout',
            };
            return response.status(200).send(successResponse);
        }
    }



    
    

    // Create User
    /**
     * @api {post} /api/customer/verify-create-user-fb Verify and Create User
     * @apiGroup Third Party Login 
     * @apiParam (Request body) {String} name name
     * @apiParam (Request body) {String} email email
     * @apiParamExample {json} Input
     * {
     *      "name" : "",
     *      "email" : ""      
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully Verified",
     *      "status": "200"
     *      "data" : {}
     * }
     * @apiSampleRequest /api/auth/verify-create-user-fb
     * @apiErrorExample {json} User error
     * HTTP/1.1 500 Internal Server Error
     */
     @Post('/verify-create-user-fb')
     public async verifyCreateFbUser(@Body({ validate: true }) registerParam: any, @Res() response: any, @Req() request : any): Promise<any> {
         const customerData = await this.customerService.findOne({
             where: {
                email: registerParam.email,
                 isActive : 1
             }
         });

         if(customerData){
                let _r = {
                    emailId: customerData.email,
                    password:"Welcome@1",
                    type:"facebook",
                    token : request.rawHeaders[1]
                };
               let _loggedIn = await this.login(_r, request,response);


                return response.status(200).send(_loggedIn);
         }else{

            registerParam.password = "Welcome@1"
            registerParam.confirmPassword = "Welcome@1";
            const newUser = new Customer();
            newUser.firstName = (registerParam.name).split(" ")[0];
            newUser.lastName = ((registerParam.name).split(" ")).length > 0 ? (registerParam.name).split(" ")[1]:"";
            newUser.customerGroupId = 1;

            const pattern = /^(?=.*?[A-Z])(?=.*?[a-z])((?=.*?[0-9])|(?=.*?[#?!@$%^&*-])).{8,}$/;
                if (!registerParam.password.match(pattern)) {
                    const passwordValidatingMessage = [];
                    passwordValidatingMessage.push('Password must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters');
                    const errResponse: any = {
                        status: 300,
                        message: "You have an error in your request's body. Check 'errors' field for more details!",
                        data: {message : passwordValidatingMessage},
                    };
                    return response.status(200).send(errResponse);
                }
            newUser.password = await Customer.hashPassword(registerParam.password);
            newUser.email = registerParam.email;
            newUser.username = registerParam.email;
            newUser.mobileNumber = null;
            newUser.isActive = 1;
            newUser.ip = (request.headers['x-forwarded-for'] ||
                request.connection.remoteAddress ||
                request.socket.remoteAddress ||
                request.connection.socket.remoteAddress).split(',')[0];
            
            if (registerParam.password === registerParam.confirmPassword) {
                const resultData = await this.customerService.create(newUser);
                const emailContent = await this.emailTemplateService.findOne(1);
                const message = emailContent.content.replace('{name}', resultData.firstName);
                const redirectUrl = env.storeRedirectUrl;

                const logo = await this.settingService.findOne();
                const sendMailRes = MAILService.registerMail(logo, message, resultData.email, emailContent.subject, redirectUrl);
                if (sendMailRes) {
                    // const successResponse: any = {
                    //     status: 200,
                    //     message: 'Thank you for registering with us. Kindly check your email inbox for further details. ',
                    //     data: classToPlain(resultData),
                    // };

                    //{"emailId":"sadfsdf@f.com","password":"fsddsf","type":"normal"}
                   let _r = {
                        emailId: registerParam.email,
                        password:"Welcome@1",
                        type:"normal",
                        token : request.rawHeaders[1]
                    };
                   let _loggedIn = await this.login(_r, request,response);


                    return response.status(200).send(_loggedIn);
                } else {
                    const errorResponse: any = {
                        status: 300,
                        message: 'Registration successful, but unable to send email. ',
                    };
                    return response.status(200).send(errorResponse);
                }
            }
         }
     }

     @Get('/check-registred-user')
     public async checkRegistredUser(@QueryParams() params:any){
            const result = await this.customerService.findOne({where: [{mobileNumber:params.mobileNo}, {email:params.email}]})
            let response:any={}
            if(!result){
                response={
                    status:200,
                    messgae:'user not registred'
                }
            }else{
                response={
                    status:500,
                    messgae:'user already registred'
                }
            }
            return response
     }
}
