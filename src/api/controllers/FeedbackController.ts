import 'reflect-metadata';
import {
    Post, Body, Get, QueryParam,
    JsonController,
    Res,Req,
    UseBefore

} from 'routing-controllers';
import { CreateFeedback as CreateFeedbackRequest } from './requests/CreateFeedbackRequest';
import { FeedbackService } from '../services/FeedbackService';
import { Feedback } from '../models/Feedback';
import { classToPlain } from 'class-transformer';
import { CommonService } from "../common/commonService";
import { OtpTemplateService } from "../common/OtptemplateService";
import {apiLimiter} from '../middlewares/rateLimiters'
//import { EmailService } from "../common/emailService";
//import nodemailer from "nodemailer";
//import Mail from "nodemailer/lib/mailer";
@JsonController('/feedback')
export class FeedbackController {
    constructor(private feedbackService: FeedbackService,
                private _m: CommonService,
                private _otptemp: OtpTemplateService,
                //private _e: EmailService
                ) {
    }
    // Create Feedback
    /**
     * @api {post} /api/feedback/create-feedback Add Feedback API
     * @apiGroup Feedback 
     * @apiParam (Request body) {String} email email
     * @apiParam (Request body) {String} feedMsg feedMsg
     * @apiParam (Request body) {String} type type
     * @apiParamExample {json} Input
     * {
     *      "email" : "",
     *      "feedMsg" : "",
     *      "type" : ""
     *      
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully created new Feedback.",
     *      "status": "1"
     *      "data" : {}
     * }
     * @apiSampleRequest /api/feedback/create-feedback
     * @apiErrorExample {json} addFeedback error
     * HTTP/1.1 500 Internal Server Error
     */
@UseBefore(apiLimiter)
    @Post('/create-feedback')
    // @Authorized()
    public async createUser(@Body() createFeedbackParam: CreateFeedbackRequest, @Res() response: any): Promise<any> {
        //return response.status(200).send(createFeedbackParam);
        const newFeedbackParams = new Feedback();
        newFeedbackParams.email = createFeedbackParam.email;
        newFeedbackParams.feedMsg = createFeedbackParam.feedMsg;
        newFeedbackParams.type = createFeedbackParam.type;
        const feedbackSaveResponse = await this.feedbackService.create(newFeedbackParams);
        if (feedbackSaveResponse) {
            return response.status(200).send(await this._m.getMessage(200, feedbackSaveResponse, "Feedback saved successfully"));
        } else {
            return response.status(400).send(await this._m.getMessage(400, "", ""));

        }

    }
    // Feedback List API
    /**
     * @api {get} /api/feedback/feedbacklistdata Feedback List API
     * @apiGroup Feedback
     * @apiParam (Request body) {Number} limit limit
     * @apiParam (Request body) {Number} offset offset
     * @apiParam (Request body) {String} keyword keyword
     * @apiParam (Request body) {Number} count 
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "successfully got the complete feedback list.",
     *      "data":"{ }"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/feedback/feedbacklistdata
     * @apiErrorExample {json} Feedback error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/feedbacklistdata')
    // @Authorized()
    public async findAll(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('count') count: number, @Res() response: any): Promise<any> {
        const feedback = await this.feedbackService.list(limit, offset, count);
        if (feedback) {
            return response.status(200).send(await this._m.getMessage(200, classToPlain(feedback), "Successfully get All List"));
        } else {
            return response.status(400).send(await this._m.getMessage(400, "", ""));
        }
    }
	// Feedback count
    /**
     * @api {post} /api/feedback/feedback-count Feedback Count API
     * @apiGroup Feedback 
     * @apiParam (Request body) {String} date_value date_value
     * @apiParamExample {json} Input
     * {
     *      "date_value" : ""
     *      
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get Feedback Count.",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/feedback/feedback-count
     * @apiErrorExample {json} countFeedback error
     * HTTP/1.1 500 Internal Server Error
     */

	  @Post('/feedback-count')
    // @Authorized()
    public async findCount(@Req() req: any, @Res() response: any ): Promise<any> {
        const feedback = await this.feedbackService.count();
        const today = req.body.date_value;
		
         var todaycount=0;
		for(let i=0;i<feedback.length;i++){
		const feedbackdate=(feedback[i].createdDate.getFullYear().toString().concat('-')).concat(((feedback[i].createdDate.getMonth()+1).toString().concat('-'))).concat(feedback[i].createdDate.getDate().toString());

			if(today==feedbackdate){
				 todaycount=todaycount+1;
			}
		}
		const totalFeddbackCount=feedback.length;
        if (feedback) {
			const successResponse: any = {
                status: 1,
                message: 'Successfully get Feedback Count',
                TotalCount: totalFeddbackCount,
				TodayCount: todaycount,
            };
            return response.status(200).send(successResponse);
        } else {
            const errorResponse: any = {
                status: 1,
                message: 'Unable to get the feedback Count. ',
            };
            return response.status(400).send(errorResponse);
        }
    }

    //SMTP test
    @Post('/checkemail')
    // @Authorized()
    public async checkSmtp(@Req() req: any, @Res() response: any): Promise<any> { 
    /* let sender=req.body.subject;
    let recipient=req.body.recipient;
    let subject=req.body.subject;
    let text=req.body.text;
    this._e.getEmail(sender,recipient,subject,text);
    return response.status(200).send(await this._m.getMessage(200, '', "Successfully send mail you"));*/
    var orderData={
        customerId: 4,
        email: 'neeraj.knit06@gmail.com',
        telephone: '8178230514',
        shippingFirstname: 'Neeraj',
        shippingLastname: '',
        shippingAddress1: '405 ',
        shippingAddress2: 'Laxmi hegiht',
        shippingCompany: 'Neeraj',
        shippingCity: 'Saharanpur',
        shippingZone: 'up',
        shippingCountryId: 99,
        shippingCountry: 'India',
        shippingPostcode: '247001',
        shippingAddressFormat: '',
        paymentFirstname: 'Neeraj',
        paymentLastname: '',
        paymentAddress1: '405 ',
        paymentAddress2: 'Laxmi hegiht',
        paymentCompany: 'Neeraj',
        paymentCountry: 'India',
        paymentCity: 'Saharanpur',
        paymentZone: 'up',
        paymentPostcode: '247001',
        paymentMethod: 7,
        customerGstNo: '',
        isActive: 1,
        orderStatusId: 1,
        invoicePrefix: 'SPU',
        currencyCode: 'INR',
        currencyValue: undefined,
        currencySymbolLeft: '₹',
        currencySymbolRight: null,
        paymentAddressFormat: '',
        createdDate: '2022-11-07 12:56:01',
        orderId: 105,
        orderLogId: 106,
        currencyRight: null,
        currencyLeft: '₹',
        amount: 25200,
        total: 25200,
        invoiceNo: 'INV00105',
        orderPrefixId: 'SPU-20221107105',
        oderId: 105,
        modifiedDate: '2022-11-07 12:56:01'
      };
      let tempId="1234";
      this._otptemp._templateEmailMessage(tempId,orderData);
      this._otptemp._emailService(orderData,tempId);
    return response.status(200).send("Successfully send mail to you");
    }
}
