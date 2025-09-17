import 'reflect-metadata';
import {  Get, JsonController, Res } from 'routing-controllers';
import { S3Service } from '../../services/S3Service';
import { CommonService } from '../../common/commonService';
import { FileUrlSaveService } from '../../services/Schedulers/FileUrlSaveService';
import { FacilitySkuService } from '../../services/Master/FacilitySkuService';

@JsonController('/scheduler/master')
export class FacilitySkuMappingController {
    constructor(
        private _m : CommonService,
        private _fileSave : FileUrlSaveService,
        private _s3Service : S3Service,
        private _saveFacilitySku : FacilitySkuService
    ){}

    // To get last uploaded file from master and import in mapping
    /**
     * @api {post} /api/scheduler/master/import-facility-sku import sku and facility mapping
     * @apiGroup Scheduler
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Imported Successfully",
     *      "status": "200",
     *      "data" : {}
     * }
     * @apiSampleRequest /api/scheduler/master/import-facility-sku
     * @apiErrorExample {json} error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/import-facility-sku')
    public async importFacilitySku(@Res() res : any):Promise<any>{
        let rawData = await this._fileSave.findOneLatest('facility_sku_mapping');
        if(rawData){
            let _file = await this._s3Service.readFileS3(rawData.secondKey);
            const csv = require("csvtojson");
            let _fullArray =  await csv().fromString((_file.Body).toString());

            if(_fullArray.length > 0){

                let newArr = [];
                for(let i=0; i < _fullArray.length; i++){
                    newArr.push({
                        facilityCode : _fullArray[i]['Facility Code'],
                        sku : _fullArray[i]['SKU'],
                        Quantity : parseInt(_fullArray[i]['Quantity']),
                        status : 1
                    });

                    if((((_fullArray.length -1) == i) || (i == 200))){
                        this._saveFacilitySku.saveFacilitySkuData(newArr);
                    }else{
                        continue;
                    }
                }
            }
        }
        return res.status(200).send(await this._m.getMessage(200));
    }

    /**
     * @api {post} /api/scheduler/master/update-quantity-by-scheduler To update inventory in the product and sku by Stored Procedure
     * @apiGroup Scheduler
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Imported Successfully",
     *      "status": "200",
     *      "data" : {}
     * }
     * @apiSampleRequest /api/scheduler/master/update-quantity-by-scheduler
     * @apiErrorExample {json} error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/update-quantity-by-scheduler')
    public async updateQuantityInProducts(@Res() res:any):Promise<any>{
        try{
            let _r = await this._fileSave.callProcedureForUpdate();
            return res.status(200).send(await this._m.getMessage(200,_r));
        }catch(e){
            return res.status(200).send(await this._m.getMessage(500));
        }
        
        
    }
}