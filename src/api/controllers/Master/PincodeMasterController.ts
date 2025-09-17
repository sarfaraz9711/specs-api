import 'reflect-metadata';
import { Post, JsonController, Res, Req, Get} from 'routing-controllers';
import { PincodeService } from '../../services/Master/pincodeService';
import { CommonService } from "../../common/commonService";

@JsonController('/master')
export class CareerController {
    constructor(
        private pincodeService: PincodeService,
        private _m: CommonService
    ) { }


    // Create Pincode Master
    /**
     * @api {post} /api/master/secure/pincode/create-master-pincode Pincode Master
     * @apiGroup Pincode Master
     * @apiParamExample {json} Input
     * {
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully updated",
     *      "status": "200",
     *      "data" : {}
     * }
     * @apiSampleRequest /api/master/secure/pincode/create-master-pincode
     * @apiErrorExample {json} Page error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/secure/pincode/create-master-pincode')
    // @Authorized()
    public async createMasterPincode(@Req() request: any, @Res() response: any): Promise<any> {

        const axios = require('axios');

        let resp = await axios.get('https://api.data.gov.in/resource/5c2f62fe-5afa-4119-a499-fec9d604d5bd?api-key=579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b&format=json&offset=0&limit=20');


        if (resp.data.records.length > 0) {
            let _d = resp.data.records;
            let jsonP = [];
            let inc = 0;
            for (let sub of _d) {
                jsonP.push(sub);
                if (jsonP.length == 1000 || inc == (_d.length - 1)) {
                    await this.pincodeService.create(jsonP);
                    jsonP = [];
                    inc += 1;
                    continue;
                } else {
                    inc += 1;
                    continue;
                }
            }

            return response.status(200).send(await this._m.getMessage(200));
        }
    }


    // Get All Master Pin code
    /**
     * @api {get} /api/master/pincode/alllist
     * @apiGroup Pincode Master
     * @apiParamExample {json} Input
     * {
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get list!",
     *      "status": "200"
     * }
     * @apiSampleRequest /api/master/pincode/alllist
     * @apiErrorExample {json} media error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/pincode/alllist')
    // @Authorized()
    public async alllistPincode(@Res() response: any): Promise<any> {
        const pincodeList = await this.pincodeService.alllist();
        console.log(pincodeList);
        if (pincodeList) {
            return response.status(200).send(await this._m.getMessage(200, pincodeList));
        } else {
            return response.status(200).send(await this._m.getMessage(300));
        }
    }
}
