import 'reflect-metadata';
import {
    Post, Body,
    JsonController,
    Res, Req, Get

} from 'routing-controllers';
import { StateService } from '../services/admin/StateService';
import { State } from '../models/State';
import { CityService } from '../services/admin/CityService';
import { City } from '../models/City';
import { MapService } from '../services/admin/MapService';
import { classToPlain } from 'class-transformer';
import { CommonService } from "../common/commonService";
@JsonController('/state')
export class StateCityController {
    constructor(private stateService: StateService,
                private cityService: CityService,
                private _map: MapService,
                private _m: CommonService) {
    }
    /**
     * @api {post} /api/state/create-state Add State API
     * @apiGroup State City Master 
     * @apiParam (Request body) {String} state state
     * @apiParam (Request body) {String} stateCode stateCode
     * @apiParamExample {json} Input
     * {
     *      "state" : "",
     *      "stateCode" : ""
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "New State is created successfully",
     *      "status": "1"
     *      "data" : {}
     * }
     * @apiSampleRequest /api/state/create-state
     * @apiErrorExample {json} addState error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/create-state')
    // @Authorized()
    public async createState(@Body() @Res() response: any, @Req() request: any): Promise<any> {
        const newStateParams = new State();
        newStateParams.state = request.state;
        newStateParams.stateCode = request.stateCode;
        const stateSaveResponse = await this.stateService.create(newStateParams);
        if (stateSaveResponse) {
            return response.status(200).send(await this._m.getMessage(200, stateSaveResponse, "State saved successfully"));
        } else {
            return response.status(200).send(await this._m.getMessage(400));

        }

    }

    /**
     * @api {post} /api/state/create-city Add City API
     * @apiGroup State City Master 
     * @apiParam (Request body) {String} stateId stateId
     * @apiParam (Request body) {String} city city
     * @apiParam (Request body) {String} cityCode cityCode
     * @apiParamExample {json} Input
     * {
     *      "stateId" : "",
     *      "city" : "",
     *      "cityCode" : ""
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "New City is created successfully",
     *      "status": "1"
     *      "data" : {}
     * }
     * @apiSampleRequest /api/state/create-city
     * @apiErrorExample {json} addCity error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/create-city')
    // @Authorized()
    public async createCity(@Body() @Res() response: any, @Req() request: any): Promise<any> {
        const newCityParams = new City();
        newCityParams.state_id = request.stateId;
        newCityParams.city = request.city;
        newCityParams.city_code = request.cityCode;
        const citySaveResponse = await this.cityService.create(newCityParams);
        if (citySaveResponse) {
            return response.status(200).send(await this._m.getMessage(200, citySaveResponse, "City saved successfully"));
        } else {
            return response.status(200).send(await this._m.getMessage(500));

        }

    }
    // State list
    /**
     * @api {get} /api/state/get-state-list Get State List
     * @apiGroup State City Master
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully Get All State List.",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/state/get-state-list
     * @apiErrorExample {json} state error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/get-state-list')
    public async getAllStateList(@Req() req: any, @Res() response: any): Promise<any> {
        const state = await this.stateService.list();
        if (state) {
            return response.status(200).send(await this._m.getMessage(200, classToPlain(state), "Successfully get All List"));
        } else {
            return response.status(200).send(await this._m.getMessage(500));

        }
    }

    // City list based On state
    /**
     * @api {get} /api/state/get-city-list/:stateid Get City List
     * @apiGroup State City Master
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully Get All City List.",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/state/get-city-list/:stateid
     * @apiErrorExample {json} city error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/get-city-list/:stateid')
    public async getAllCityList(@Req() req: any, @Res() response: any): Promise<any> {
        const city = await this.cityService.findOne({
            where: {
                state_id: req.params.stateid,
            },
        });
        if (city) {
            return response.status(200).send(await this._m.getMessage(200, classToPlain(city), "Successfully get City List"));
        } else {
            return response.status(200).send(await this._m.getMessage(500));

        }
    }

    //Store-Location  based On city and pincode
    /**
     * @api {get} /api/state/get-store-location Get Store Location
     * @apiGroup State City Master
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully Get Store Location.",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/state/get-store-location
     * @apiErrorExample {json} Store location error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/get-store-location')
    public async getStoreLocation(@Req() req: any, @Res() response: any): Promise<any> {
        if (req.body.cityId && req.body.pincode) {

            const storeBasedOnCityPincode = await this._map.findLocation({
                where: {
                    cityId: req.body.cityId,
                    pincode: req.body.pincode
                },
            });
            if (storeBasedOnCityPincode.length>0) {
                return response.status(200).send(await this._m.getMessage(200, classToPlain(storeBasedOnCityPincode), "Successfully get store List"));
            } else {
                return response.status(200).send(await this._m.getMessage(500));

            }
        } else {
            const storeBasedOnCity = await this._map.findLocation({
                where: {
                    cityId: req.body.cityId,
                },
            });
            if (storeBasedOnCity) {
                return response.status(200).send(await this._m.getMessage(200, classToPlain(storeBasedOnCity), "Successfully get store List"));
            } else {
                return response.status(200).send(await this._m.getMessage(500));

            }
        }
    }
}
