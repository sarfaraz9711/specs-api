import 'reflect-metadata';
import {
    Post, Get, QueryParam,
    JsonController,
    Res,
    Req

} from 'routing-controllers';
//import { CreateFranchisee as CreateFranchiseeRequest } from './requests/CreateFranchiseeRequest';
import { FranchiseeService } from '../services/FranchiseeService';
import { Franchisee } from '../models/Franchisee';
import { classToPlain } from 'class-transformer';
import { CommonService } from "../common/commonService";
@JsonController('/franchisee')
export class FranchiseeController {
    constructor(private franchiseeService: FranchiseeService,
                private _m: CommonService) {
    }
    // Create Franchisee
    /**
     * @api {post} /api/franchisee/create-franchisee Add Franchisee API
     * @apiGroup Franchisee 
     * @apiParam (Request body) {String} Email Email
     * @apiParam (Request body) {String} Name Name
     * @apiParam (Request body) {String} Mobile_no Mobile_no
     * @apiParam (Request body) {String} Occupation Occupation
     * @apiParam (Request body) {String} Showroom_location Showroom_location
     * @apiParam (Request body) {String} Showroom_frontage Showroom_frontage
     * @apiParam (Request body) {String} Showroom_area Showroom_area
     * @apiParam (Request body) {String} State State
     * @apiParam (Request body) {String} City City
     * @apiParam (Request body) {String} Comment Comment
     * @apiParamExample {json} Input
     * {
     *      "Email" : "",
     *      "Name" : "",
     *      "Mobile_no" : "",
     *      "Occupation" : "",
     *      "Showroom_location" : "",
     *      "Showroom_frontage" : "",
     *      "Showroom_area" : "",
     *      "State" : "",
     *      "City" : "",
     *      "Comment" : ""
     *      
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully created new Franchisee.",
     *      "status": "1"
     *      "data" : {}
     * }
     * @apiSampleRequest /api/franchisee/create-franchisee
     * @apiErrorExample {json} addFranchisee error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/create-franchisee')
    // @Authorized()
    public async createUser(@Req() req: any, @Res() response: any): Promise<any> {
        //return response.status(200).send(createFeedbackParam);
       let CreateFranchiseeParam = req.body;
        const newFranchiseeParams = new Franchisee();
        newFranchiseeParams.Email = CreateFranchiseeParam.Email;
        newFranchiseeParams.Mobile_no = CreateFranchiseeParam.Mobile_no;
        newFranchiseeParams.Name = CreateFranchiseeParam.Name;
        newFranchiseeParams.Occupation = CreateFranchiseeParam.Occupation;
        newFranchiseeParams.Showroom_location = CreateFranchiseeParam.Showroom_location;
        newFranchiseeParams.Showroom_frontage = CreateFranchiseeParam.Showroom_frontage;
        newFranchiseeParams.Showroom_area = CreateFranchiseeParam.Showroom_area;
        newFranchiseeParams.State = CreateFranchiseeParam.State;
        newFranchiseeParams.City = CreateFranchiseeParam.City;
        newFranchiseeParams.Comment = CreateFranchiseeParam.Comment;
        const franchiseeSaveResponse = await this.franchiseeService.create(newFranchiseeParams);
        if (franchiseeSaveResponse) {
            return response.status(200).send(await this._m.getMessage(200, franchiseeSaveResponse, "Franchisee saved successfully"));
        } else {
            return response.status(400).send(await this._m.getMessage(400, "", ""));

        }

    }

    // Franchisee List API
    /**
     * @api {get} /api/franchisee/franchiseelist Franchisee List API
     * @apiGroup Franchisee
     * @apiParam (Request body) {Number} limit limit
     * @apiParam (Request body) {Number} offset offset
     * @apiParam (Request body) {String} keyword keyword
     * @apiParam (Request body) {Number} count 
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "successfully got the complete franchisee list.",
     *      "data":"{ }"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/franchisee/franchiseelist
     * @apiErrorExample {json} Franchisee error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/franchiseelist')
    // @Authorized()
    public async findAll(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('keyword') keyword: string, @QueryParam('count') count: number, @Res() response: any): Promise<any> {
        const franchisee = await this.franchiseeService.list(limit, offset, keyword, count);
        if (franchisee) {
            return response.status(200).send(await this._m.getMessage(200, classToPlain(franchisee), "Successfully get All List"));
        } else {
            return response.status(400).send(await this._m.getMessage(400, "", ""));
        }
    }
}
