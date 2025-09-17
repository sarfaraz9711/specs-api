import 'reflect-metadata';
import {
    Post, Body, Get, QueryParam,
    JsonController,
    Res

} from 'routing-controllers';
import { CreateCareer as CareerCareerRequest } from './requests/CreateCareerRequest';
import { CareerService } from '../services/CareerService';
import { Career } from '../models/Career';
import { classToPlain } from 'class-transformer';
import { CommonService } from "../common/commonService";
@JsonController('/career')
export class CareerController {
    constructor(private careerService: CareerService,
                private _m: CommonService) {
    }

    // Create Career
    /**
     * @api {post} /api/career/create-career Add Career API
     * @apiGroup Career 
     * @apiParam (Request body) {String} Email Email
     * @apiParam (Request body) {String} Name Name
     * @apiParam (Request body) {String} Mobile_no Mobile_no
     * @apiParam (Request body) {String} Address Address
     * @apiParam (Request body) {String} Functional_area Functional_area
     * @apiParam (Request body) {String} External_link_1 External_link_1
     * @apiParam (Request body) {String} External_link_2 External_link_2
     * @apiParamExample {json} Input
     * {
     *      "Email" : "",
     *      "Name" : "",
     *      "Mobile_no" : "",
     *      "Address" : "",
     *      "Functional_area" : "",
     *      "External_link_1" : "",
     *      "External_link_2" : ""
     *      
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully created new Career.",
     *      "status": "1"
     *      "data" : {}
     * }
     * @apiSampleRequest /api/career/create-career
     * @apiErrorExample {json} addCareer error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/create-career')
    // @Authorized()
    public async createUser(@Body() CreateCareerParam: CareerCareerRequest, @Res() response: any): Promise<any> {
        //return response.status(200).send(createFeedbackParam);
        const newCareerParams = new Career();
        newCareerParams.Email = CreateCareerParam.Email;
        newCareerParams.Mobile_no = CreateCareerParam.Mobile_no;
        newCareerParams.Name = CreateCareerParam.Name;
        newCareerParams.Address = CreateCareerParam.Address;
        newCareerParams.Functional_area = CreateCareerParam.Functional_area;
        newCareerParams.External_link_1 = CreateCareerParam.External_link_1;
        newCareerParams.External_link_2 = CreateCareerParam.External_link_2;
        const careerSaveResponse = await this.careerService.create(newCareerParams);
        if (careerSaveResponse) {
            return response.status(200).send(await this._m.getMessage(200, careerSaveResponse, "Career saved successfully"));
        } else {
            return response.status(400).send(await this._m.getMessage(400, "", ""));
        }
    }

    // Career List API
    /**
     * @api {get} /api/career/careerlist Career List API
     * @apiGroup Career
     * @apiParam (Request body) {Number} limit limit
     * @apiParam (Request body) {Number} offset offset
     * @apiParam (Request body) {String} keyword keyword
     * @apiParam (Request body) {Number} count 
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "successfully got the complete career list.",
     *      "data":"{ }"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/career/careerlist
     * @apiErrorExample {json} Career error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/careerlist')
    // @Authorized()
    public async findAll(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('keyword') keyword: string, @QueryParam('count') count: number, @Res() response: any): Promise<any> {
        const career = await this.careerService.list(limit, offset, keyword, count);
        if (career) {
            return response.status(200).send(await this._m.getMessage(200, classToPlain(career), "Successfully get All List"));
        } else {
            return response.status(400).send(await this._m.getMessage(400, "", ""));
        }
    }
}
