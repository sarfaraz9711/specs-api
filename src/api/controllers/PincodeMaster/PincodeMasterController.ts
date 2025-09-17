import 'reflect-metadata';
import {
     Get,
    JsonController,
    Res,
    Req,
    QueryParam

} from 'routing-controllers';
import { PincodeService } from '../../services/PincodeMaster/PincodeMasterService';

//import { Pincode } from '../../../models/Business/PincodeMaster/Pincode';
import { CommonService } from "../../common/commonService";
@JsonController('/pincode-master')
export class PincodeController {
    constructor(
                private pincodeService: PincodeService,
                private _m: CommonService
                ) {
    }

   // Pincode list
    /**
     * @api {get} /api/pincode/pincodelist pincode List API
     * @apiGroup Pincode
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "successfully got the complete enquiry list.",
     *      "data":"{ }"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/pincode/pincodelist
     * @apiErrorExample {json} Enquiry error
     * HTTP/1.1 500 Internal Server Error
     */
     @Get('/pincodelist')
     public async findAll(@QueryParam('pincode') pincode: number,@Req() request:any, @Res() response: any): Promise<any> {
         const pincodedata = await this.pincodeService.list(pincode);

         if (pincodedata.length>0) {
         let statecode=pincodedata[0].state_code;
         let districtcode=pincodedata[0].district_code
         const districtdata = await this.pincodeService.districtdata(statecode);
         const subdistrictdata = await this.pincodeService.subdistrictdata(districtcode);
        
            const successResponse: any = {
                status: 1,
                data: {"pincodedata":pincodedata[0],
                       "districtdata":districtdata,
                       "subdistrictdata":subdistrictdata
                     },
            };
             return response.status(200).send(await this._m.getMessage(200,successResponse, 'Successfully get data'));
         } else {
             return response.status(200).send(await this._m.getMessage(400, "", "invalid pincode"));
         }
     }
     
      // state list
    /**
     * @api {get} /api/pincode/state-list state List API
     * @apiGroup Pincode
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "successfully got the complete enquiry list.",
     *      "data":"{ }"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/pincode/state-list
     * @apiErrorExample {json} state error
     * HTTP/1.1 500 Internal Server Error
     */
     @Get('/state-list')
     public async AllState(@Req() request:any, @Res() response: any): Promise<any> {
      const statedata = await this.pincodeService.findAllState();
      if (statedata.length>0) {
         return response.status(200).send(await this._m.getMessage(200, statedata,'Successfully get data',))
     } else {
         return response.status(200).send(await this._m.getMessage(400, "", "data not found"));
     }
         

     }

      // district list
    /**
     * @api {get} /api/pincode/district-list district List API
     * @apiGroup Pincode
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "successfully got the complete enquiry list.",
     *      "data":"{ }"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/pincode/district-list
     * @apiErrorExample {json} district error
     * HTTP/1.1 500 Internal Server Error
     */

     @Get('/district-list')
     public async DistrictList(@QueryParam('statecode') statecode: string,@Req() request:any, @Res() response: any): Promise<any> {
      const districtdata = await this.pincodeService.districtdata(statecode);
      if (districtdata.length>0) {
         return response.status(200).send(await this._m.getMessage(200, districtdata,'Successfully get data'));
     } else {
         return response.status(200).send(await this._m.getMessage(400, "", "invalid state code"));
     }
         

     }

      // district list
    /**
     * @api {get} /api/pincode/sub-district-list sub district List API
     * @apiGroup Pincode
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "successfully got the complete enquiry list.",
     *      "data":"{ }"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/pincode/sub-district-list
     * @apiErrorExample {json} sub district error
     * HTTP/1.1 500 Internal Server Error
     */

     @Get('/sub-district-list')
     public async SubDistrictList(@QueryParam('districtcode') districtcode: string,@Req() request:any, @Res() response: any): Promise<any> {
      const subdistrictdata = await this.pincodeService.subdistrictdata(districtcode);
      if (subdistrictdata.length>0) {
         return response.status(200).send(await this._m.getMessage(200,subdistrictdata, 'Successfully get data'));
     } else {
         return response.status(200).send(await this._m.getMessage(400, "", "invalid district code"));
     }
         

     }



}
