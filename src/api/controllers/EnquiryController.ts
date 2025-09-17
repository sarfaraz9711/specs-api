import 'reflect-metadata';
import {
    Post, Body, Get, QueryParam,
    JsonController,
    Res,
    UseBefore

} from 'routing-controllers';
import { CreateEnquiry as CreateEnquiryRequest } from './requests/CreateEnquiryRequest';
import { EnquiryService } from '../services/EnquiryService';
import { Enquiry } from '../models/Enquiry';
import { classToPlain } from 'class-transformer';
import { CommonService } from "../common/commonService";
import { apiLimiter } from '../middlewares/rateLimiters';
@JsonController('/enquiry')
export class EnquiryController {
    constructor(private enquiryService: EnquiryService,
                private _m: CommonService) {
    }
    // Create Enquiry
    /**
     * @api {post} /api/enquiry/create-enquiry Add Enquiry API
     * @apiGroup Enquiry 
     * @apiParam (Request body) {String} Email Email
     * @apiParam (Request body) {String} Name Name
     * @apiParam (Request body) {String} Mobile_no Mobile_no
     * @apiParam (Request body) {String} Company_name Company_name
     * @apiParam (Request body) {String} City City
     * @apiParam (Request body) {String} Product_quantity Product_quantity
     * @apiParam (Request body) {String} Requirement Requirement
     * @apiParamExample {json} Input
     * {
     *      "Email" : "",
     *      "Name" : "",
     *      "Mobile_no" : "",
     *      "Company_name" : "",
     *      "City" : "",
     *      "Product_quantity" : "",
     *      "Requirement" : ""
     *      
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully created new Enquiry.",
     *      "status": "1"
     *      "data" : {}
     * }
     * @apiSampleRequest /api/enquiry/create-enquiry
     * @apiErrorExample {json} addEnquiry error
     * HTTP/1.1 500 Internal Server Error
     */
@UseBefore(apiLimiter)
    @Post('/create-enquiry')
    // @Authorized()
    public async createUser(@Body() CreateEnquiryParam: CreateEnquiryRequest, @Res() response: any): Promise<any> {
        //return response.status(200).send(createFeedbackParam);
        const newEnquiryParams = new Enquiry();
        newEnquiryParams.Email = CreateEnquiryParam.Email;
        newEnquiryParams.Mobile_no = CreateEnquiryParam.Mobile_no;
        newEnquiryParams.Name = CreateEnquiryParam.Name;
        newEnquiryParams.Company_name = CreateEnquiryParam.Company_name;
        newEnquiryParams.City = CreateEnquiryParam.City;
        newEnquiryParams.Product_quantity = CreateEnquiryParam.Product_quantity;
        newEnquiryParams.Requirement = CreateEnquiryParam.Requirement;
        const enquirySaveResponse = await this.enquiryService.create(newEnquiryParams);
        if (enquirySaveResponse) {
            return response.status(200).send(await this._m.getMessage(200, enquirySaveResponse, "Enquiry saved successfully"));
        } else {
            return response.status(400).send(await this._m.getMessage(400, "", ""));

        }

    }


    // Enquiry List API
    /**
     * @api {get} /api/enquiry/enquirylist Enquiry List API
     * @apiGroup Enquiry
     * @apiParam (Request body) {Number} limit limit
     * @apiParam (Request body) {Number} offset offset
     * @apiParam (Request body) {String} keyword keyword
     * @apiParam (Request body) {Number} count 
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "successfully got the complete enquiry list.",
     *      "data":"{ }"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/enquiry/enquirylist
     * @apiErrorExample {json} Enquiry error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/enquirylist')
    // @Authorized()
    public async findAll(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('keyword') keyword: string, @QueryParam('count') count: number, @Res() response: any): Promise<any> {
        const enquiry = await this.enquiryService.list(limit, offset, keyword, count);
        if (enquiry) {
            return response.status(200).send(await this._m.getMessage(200, classToPlain(enquiry), "Successfully get All List"));
        } else {
            return response.status(400).send(await this._m.getMessage(400, "", ""));
        }
    }
}
