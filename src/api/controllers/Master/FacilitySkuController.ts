import 'reflect-metadata';
import { JsonController, Post,Req, Res, UploadedFile,Get } from 'routing-controllers';
import { FileUrlSaveService } from '../../services/Schedulers/FileUrlSaveService';
import { CommonService } from '../../common/commonService';
import { S3Service } from '../../services/S3Service';
import { FacilitySkuModel } from '../../models/Master/FacilitySkuModel';


@JsonController('/master')
export class FacilitySkuController {
    constructor(
        private _m: CommonService,
        private _s3Service : S3Service,
        private _saveFileUrl : FileUrlSaveService
    ) { }

    // Create Pincode Master
    /**
     * @api {post} /api/master/secure/inventory-mapping/import-inventory Pincode Master
     * @apiGroup Pincode Master
     * @apiParam (Request body) {File} file Mapping file(.CSV) to be imported
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully imported",
     *      "status": "200",
     *      "data" : {}
     * }
     * @apiSampleRequest /api/master/secure/inventory-mapping/import-inventory
     * @apiErrorExample {json} Page error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/secure/inventory-mapping/import-inventory')
    public async importFacilitySku(@UploadedFile('file') files :any ,@Res() res: any): Promise<any> {
         return false;
        if(Object.keys(files).length == 0){
            return res.status(200).send(await this._m.getMessage('300'));
        }
        
        const csv = require("csvtojson");
        let b = files.originalname;

        if (files.mimetype == "text/csv" && b.substring(b.lastIndexOf("."), b.length) == ".csv") {
            let _j = await csv().fromString((files.buffer).toString());
            if (_j.length > 0) {
                const path = 'uploads/facility-sku-mapping/';
                try{
                    let pathNew = await this._s3Service.fileUpload((path + b), files.buffer, 'csv',"yes");
                    let _save =  {
                        fileUrl : pathNew.Location,
                        moduleType : "facility_sku_mapping",
                        eTag : pathNew.ETag,
                        versionId : pathNew.VersionId,
                        key : pathNew.key,
                        secondKey : pathNew.Key
                    };
                    let _s = await this._saveFileUrl.saveSchedulerFile(_save);
                    return res.status(200).send(await this._m.getMessage('200',_s));
                }catch(e){
                    return res.status(200).send(await this._m.getMessage('300','unable to uplaod file'));
                }
            }
        } else {
            return res.status(200).send(await this._m.getMessage('300'));
        }
    
    }

    // facility list
    /**
     * @api {post} /secure/facility-code-based-sku-list Facility code Based Sku list
     * @apiGroup Facility
     * @apiParam (Request body) {String} facilityCode facilityCode
     * @apiParamExample {json} Input
     * {
     *      "facilityCode" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get facility list.",
     *      "status": "1"
     * }
     * @apiSampleRequest /secure/facility-code-based-sku-list
     * @apiErrorExample {json} facility error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/secure/facility-code-based-sku-list')
    public async importFacilityCodeSku(@Req() req: any,@Res() res: any): Promise<any> {
        let facilityCode=req.body.facilityCode;
        if(facilityCode){
            
            let _d = await this._saveFileUrl.findSkuBasedOnfacilitycode(facilityCode);
            return res.status(200).send(await this._m.getMessage('200',_d,"Successfully get sku list"));

        }else{
        let _d = await this._saveFileUrl.findfacilitycodeAll();
        return res.status(200).send(await this._m.getMessage('200',_d,"Successfully get facility list"));
        }
       

    }

    // Facility All Data list
    /**
     * @api {get} /secure/all-facility-code-data Facility All list
     * @apiGroup Facility
     * @apiParam (Request body) {String} facilityCode facilityCode
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get facility all list",
     *      "status": "1"
     * }
     * @apiSampleRequest /secure/all-facility-code-data
     * @apiErrorExample {json} facility error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/secure/all-facility-code-data')
    public async importAllFacilityCode(@Req() req: any,@Res() res: any): Promise<any> {
        let _d = await this._saveFileUrl.findAllFacilitycode();
        return res.status(200).send(await this._m.getMessage('200',_d,"Successfully get facility all list"));
        
       

    }
   // facility data update
    /**
     * @api {post} /secure/update-facility-code-status Facility code update status
     * @apiGroup Facility
     * @apiParam (Request body) {String} id id
     * @apiParamExample {json} Input
     * {
     *      "id" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "facility status updated successfully",
     *      "status": "1"
     * }
     * @apiSampleRequest /secure/update-facility-code-status
     * @apiErrorExample {json} facility error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/secure/update-facility-code-status')
    public async updateFacilityCodeStatus(@Req() req: any,@Res() res: any): Promise<any> {
        let id=req.body.id;
        let _d = await this._saveFileUrl.updatefacilitycodestatus(id);
        return res.status(200).send(await this._m.getMessage('200',_d,"facility delete successfully"));

    }
   
     // facility data
    /**
     * @api {post} /secure/add-facility-code Add Facility
     * @apiGroup Facility
     * @apiParam (Request body) {String} facilityCode facilityCode
     * @apiParam (Request body) {String} sku sku
     * @apiParam (Request body) {String} quantity quantity
     * @apiParamExample {json} Input
     * {
     *      "facilityCode" : "",
     *      "sku" : "",
     *      "quantity" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully added facility.",
     *      "status": "1"
     * }
     * @apiSampleRequest /secure/add-facility-code
     * @apiErrorExample {json} facility error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/secure/add-facility-code')
    public async addFacilityCode(@Req() req: any,@Res() res: any): Promise<any> {
        let facilityCode=req.body.facilityCode;
        let sku=req.body.sku;
        let facilitydata = await this._saveFileUrl.addSkuBasedOnfacilitycode(facilityCode,sku);
       if(facilitydata.length==0){
        let facilityCodeParams=new FacilitySkuModel;
        facilityCodeParams.facilityCode=req.body.facilityCode;
        facilityCodeParams.sku=req.body.sku;
        facilityCodeParams.Quantity=req.body.quantity;
        facilityCodeParams.status="1";

        let _d = await this._saveFileUrl.addfacilitycode(facilityCodeParams);
        return res.status(200).send(await this._m.getMessage('200',_d,"facility added successfully"));
       }else{
        return res.status(200).send(await this._m.getMessage('300',"facility already exist"));

       }
       

    }
    
    
    // facility export
    /**
     * @api {get} /secure/export-facility-sku-mapping export Facility
     * @apiGroup Facility
     * @apiParamExample {json} Input
     * {
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully added facility.",
     *      "status": "1"
     * }
     * @apiSampleRequest /secure/export-facility-sku-mapping
     * @apiErrorExample {json} facility export error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/secure/export-facility-sku-mapping')
    public async exportFacilitySkumapping(@Req() req: any,@Res() res: any): Promise<any> {
        const fastcsv = require("fast-csv");
        const fs = require("fs");
        const ws = fs.createWriteStream(Math.random()+"facility-sku-mapping.csv");
        let _d = await this._saveFileUrl.exportFacilitySku();
        const jsonData = JSON.parse(JSON.stringify(_d));

       fastcsv
      .write(jsonData, { headers: true })
      .on("finish", function() {
      })
      .pipe(ws);
        return res.status(200).send(await this._m.getMessage('200',"facility-sku-mapping export successfully"));

       
       

    }



}