import 'reflect-metadata';
import { Get, JsonController, Req, Res, Post, UploadedFile, Body } from 'routing-controllers';
import { CommonService } from '../../common/commonService';
import { delivery_ecom } from "../../../env";
import { S3Service } from '../../services/S3Service';
import { ImageService } from '../../services/ImageService';
import { env } from '../../../env';
import * as path from 'path';
//var path = require('path');
import { DeliveryPartenerModel } from '../../models/delivery/DeliveryTrackingModel';
import { DeliveryService } from '../../services/delivery/DeliveryService';
import { FacilityInventorySyncModel } from '../../models/Schedulers/FacilityInventorySyncModel';
import { FacilityInventorySyncService } from '../../services/Schedulers/FacilityInventorySyncService';
import { DeliveryPartenerEcomModel } from '../../models/delivery/DeliveryTrackingEcomModel';
//import { aws_setup } from '../../../env';




//import * as AWS from 'aws-sdk';



@JsonController('/scheduler')
export class DeliverySchedulerController {

  constructor(
    private _m: CommonService,
    private s3Service: S3Service,
    private imageService: ImageService,
    private deliveryService: DeliveryService,
    private facilityInventorySyncService: FacilityInventorySyncService,
  ) { }
  // Insert ecom serviceability
  /**
   * @api {Get} /api/scheduler/insert-ecom-serviceability Insert ECOM Pin code in master
   * @apiGroup Scheduler
   * @apiSuccessExample {json} Success
   * HTTP/1.1 200 OK
   * {
   *      "message": "Successfully insert pincode master",
   *      "status": "200",
   *      "data" : {}
   * }
   * @apiSampleRequest /api/scheduler/insert-ecom-serviceability
   * @apiErrorExample {json} Page error
   * HTTP/1.1 500 Internal Server Error
   */
  @Get('/insert-ecom-serviceability')
  public async insertPinCodeMasterECOM(@Req() req: any, @Res() res: any): Promise<any> {
    

    var axios = require('axios');
    var FormData = require('form-data');
    var data = new FormData();
    data.append('username', delivery_ecom.ECOM_USERNAME);
    data.append('password', delivery_ecom.ECOM_PASSWORD);
    //data.append('pincode', "201017");

    var config = {
      method: 'post',
      url: delivery_ecom.ECOM_URL,
      headers: {
        ...data.getHeaders()
      },
      data: data
    };



    try {
      let _b = await axios(config);
      let newArray = [];
      let inc = 0;
      if (_b.data.length > 0) {
        await this.deliveryService.truncateEcom();
        for (let subData of _b.data) {
          newArray.push(subData);
          if (newArray.length == 1000 || inc == (_b.data.length - 1)) {
            await this.deliveryService.saveEcom(newArray);
            newArray = [];
            inc += 1;
            continue;
          } else {
            inc += 1;
            continue;
  
          }
        }
        return res.status(200).send(await this._m.getMessage(200, _b.data));
      }
    }catch(e){
      return res.status(200).send(await this._m.getMessage(500, e));
    }

    
  }

// Import Delhivery Tat-Metrix
  /**
   * @api {post} /api/scheduler/secure/import-delhivery-tat-metrix Import delhivery Tat metrix
   * @apiGroup Scheduler
   * @apiSuccessExample {json} Success
   * HTTP/1.1 200 OK
   * {
   *      "message": "Successfully import delhivery tat-Metrix",
   *      "status": "200",
   *      "data" : {}
   * }
   * @apiSampleRequest /api/scheduler/secure/import-delhivery-tat-metrix
   * @apiErrorExample {json} Page error
   * HTTP/1.1 500 Internal Server Error
   */

  @Post('/secure/import-delhivery-tat-metrix')
  public async importTatMetrics(@UploadedFile('file') files: any, @Res() res: any, @Req() req: any): Promise<any> {
    let filename = files.originalname;
    let b = files.buffer;
    const type = filename.split('.')[1];
    const name = 'Csv_' + Date.now() + '.' + type;
    const path_file = 'E_Tat_Metrix/DELHIVERY/';
    const filepath = path_file + name;
    let base64Data = new Buffer(b).toString('base64');

    let th = this;

    if (env.imageserver != 's3') {
      await th.s3Service.imageUpload((filepath), base64Data, type);
      await this._importTatMatrixS3Service(name);

    } else {
      this.imageService.fileUpload((filepath), base64Data);
      await this._importTatMatrixImageService(name);
      return res.status(200).send(await this._m.getMessage('200', "Delhivery Tat Matrix save successfully"));

    }
  }


  public async _importTatMatrixS3Service(name: any): Promise<any> {
    let file_name = name;
    const fs = require('fs');
    //let th=this;
    const directoryPath = path.join('E_Tat_Metrix/Scheduler/' + '/' + 'E_Tat_Matrix.txt');
    fs.appendFileSync(directoryPath, file_name + "\n");

  }



  public async _importTatMatrixImageService(name: any): Promise<any> {

    let file_name = name;
    const fs = require('fs');
    let th = this;
    const directoryPath = path.join(process.cwd(), 'uploads' + '/' + 'E_Tat_Metrix/Scheduler/' + '/' + 'E_Tat_Matrix.txt');
    fs.appendFileSync(directoryPath, file_name + "\n");
    fs.readFile(directoryPath, 'utf8', (err: any, data: any) => {
      file_name = data.split(/\r?\n/);
      return file_name;
    });
    const csvFilePath = path.join(process.cwd(), 'uploads' + '/' + 'E_Tat_Metrix/DELHIVERY/' + '/' + file_name);

    const { parse } = require("csv-parse");

    await fs.createReadStream(csvFilePath).pipe(parse({ delimiter: ",", from_line: 2 })).on("data", (row:any)=> {
        if (row[0] == "Kanpur") {
         

          for (let inc = 0; inc < row.length; inc++) {
            const newDeliveryPartenerModel = new DeliveryPartenerModel();
            newDeliveryPartenerModel.origin = row[0];
            newDeliveryPartenerModel.destination = row[1];
            newDeliveryPartenerModel.forwardSurfaceCutoff = row[2];
            newDeliveryPartenerModel.forwardSurfaceTat = row[3];
            newDeliveryPartenerModel.forwardExpressCutoff = row[4];
            newDeliveryPartenerModel.forwardExpressTat = row[5];
            newDeliveryPartenerModel.heavyCutoff = row[6];
            newDeliveryPartenerModel.heavyTat = row[7];
            newDeliveryPartenerModel.deliveryPartener = "DELHIVERY";


            var saveTatmatrixResponse = th.deliveryService.importDeliveryTatMetrics(newDeliveryPartenerModel);
            //return saveTatmatrixResponse;
          }

        }
        return saveTatmatrixResponse;

      })
      .on("end",()=> {
      })
      .on("error",(error:any)=> {
      });
    // });
  }
// Tm-facility-Inventory-sync
  /**
   * @api {post} /api/scheduler/secure/tm-facility-inventory-sync Facility Inventory sync
   * @apiGroup Scheduler
   * @apiSuccessExample {json} Success
   * HTTP/1.1 200 OK
   * {
   *      "message": "Successfully sync facility inventory",
   *      "status": "200",
   *      "data" : {}
   * }
   * @apiSampleRequest /api/scheduler/secure/tm-facility-inventory-sync 
   * @apiErrorExample {json} Page error
   * HTTP/1.1 500 Internal Server Error
   */

  @Post("/secure/tm-facility-inventory-sync")
  public async syncTmFacilityInventory(@Body() rawData: any, @Res() res: any): Promise<any> {
    const newfacilityInventorySyncModel = new FacilityInventorySyncModel();
    newfacilityInventorySyncModel.facilityCode = rawData.facilityCode;
    const facilityInventoryList = await this.facilityInventorySyncService.findFacilityInventory();
    const _facilitydata = [];
    for (let inc = 0; inc < facilityInventoryList.length; inc++) {
      _facilitydata.push(facilityInventoryList[inc].facilityCode);
    }

    if (_facilitydata.includes(rawData.facilityCode)) {
      return res.status(200).send(await this._m.getMessage('403', "Already exist"));

    } else {
      var savefacilityInventorySync = await this.facilityInventorySyncService.create(newfacilityInventorySyncModel);
      if (savefacilityInventorySync) {
        return res.status(200).send(await this._m.getMessage('200', "Facility inventory sync successfully"));
      } else {
        return res.status(200).send(await this._m.getMessage('300', "Error"));

      }
    }


  }

  // Tm-facility-Inventory-list
  /**
   * @api {Get} /api/scheduler/secure/tm-facility-inventory-list Facility Inventory list
   * @apiGroup Scheduler
   * @apiSuccessExample {json} Success
   * HTTP/1.1 200 OK
   * {
   *      "message": "Successfully sync facility inventory",
   *      "status": "200",
   *      "data" : {}
   * }
   * @apiSampleRequest /api/scheduler/secure/tm-facility-inventory-list 
   * @apiErrorExample {json} Page error
   * HTTP/1.1 500 Internal Server Error
   */

  @Get("/secure/tm-facility-inventory-list")
  public async syncTmFacilityInventoryList(@Body() rawData: any, @Res() res: any): Promise<any> {
    const resultUser = await this.facilityInventorySyncService.findFacilityInventory();
    if (resultUser) {
      return res.status(200).send(await this._m.getMessage('200', resultUser));

    } else {
      return res.status(200).send(await this._m.getMessage('300', "error"));


    }


  }

    // Import tat matrix
  /**
   * @api {Get} /api/scheduler/secure/tat-matrix-import Import tat matrix
   * @apiGroup Scheduler
   * @apiSuccessExample {json} Success
   * HTTP/1.1 200 OK
   * {
   *      "message": "Successfully Import tat matrix",
   *      "status": "200",
   *      "data" : {}
   * }
   * @apiSampleRequest /api/scheduler/secure/tat-matrix-import 
   * @apiErrorExample {json} Page error
   * HTTP/1.1 500 Internal Server Error
   */
  @Post("/secure/tat-matrix-import")
  public async importTatMatrix(@Body() rawData: any, @Res() res: any): Promise<any> {
    const resultTatMatrix = await this.deliveryService.findTatMatrix();
    let csvFilePath=resultTatMatrix[0].filePath;
      if(resultTatMatrix[0].fileType=="ECOM TAT"){
                 let _file = await this.s3Service.readFileS3(csvFilePath);
                 const csv = require("csvtojson");
                 let _fullArray =  await csv().fromString((_file.Body).toString());
                 if(_fullArray.length > 0){
                 this.deliveryService.emptyEcomTatMetricsTable();

            for(let inc=1; inc<_fullArray.length; inc++){
                const DeliveryPartenerEcomParams = new DeliveryPartenerEcomModel();
                DeliveryPartenerEcomParams.pincode = _fullArray[inc].PINCODE;
                DeliveryPartenerEcomParams.cityName = _fullArray[inc]['CITY NAME'];
                DeliveryPartenerEcomParams.dcCode = _fullArray[inc]['DC Code'];
                DeliveryPartenerEcomParams.state = _fullArray[inc]['Forward Surface Tat'];
                DeliveryPartenerEcomParams.region = _fullArray[inc].STATE;
                DeliveryPartenerEcomParams.regularUpRos = _fullArray[inc].REGION;
                DeliveryPartenerEcomParams.preCutoff = _fullArray[inc]['Regular / UP / ROS'];
                DeliveryPartenerEcomParams.noCutoff = _fullArray[inc].field8;
                DeliveryPartenerEcomParams.deliveryPartener = "ECOM";
                await this.deliveryService.importEcomTatMetrics(DeliveryPartenerEcomParams); 
                let id=resultTatMatrix[0].id;
                await this.deliveryService.updateTatMatrixStatus(id); 
    
          }
          return res.status(200).send(await this._m.getMessage('200', "Successfully import tat matrix"));

        }
     }else{
                let _file = await this.s3Service.readFileS3(csvFilePath);
                const csv = require("csvtojson");
                let _fullArray =  await csv().fromString((_file.Body).toString());
            if(_fullArray.length > 0){
              this.deliveryService.emptyDeliveryTatMetricsTable();
              for(let inc=0;inc<_fullArray.length;inc++){
            if(_fullArray[inc].Origin=="kanpur"){
                 const newDeliveryPartenerModel = new DeliveryPartenerModel();
                 newDeliveryPartenerModel.origin = _fullArray[inc].Origin;
                 newDeliveryPartenerModel.destination = _fullArray[inc].Destination;
                 newDeliveryPartenerModel.forwardSurfaceCutoff = _fullArray[inc]['Forward Surface Cutoff'];
                 newDeliveryPartenerModel.forwardSurfaceTat = _fullArray[inc]['Forward Surface Tat'];
                 newDeliveryPartenerModel.forwardExpressCutoff = _fullArray[inc]['Forward Express Cutoff'];
                 newDeliveryPartenerModel.forwardExpressTat = _fullArray[inc]['Forward Express Tat'];
                 newDeliveryPartenerModel.heavyCutoff = _fullArray[inc]['Heavy Cutoff'];
                 newDeliveryPartenerModel.heavyTat = _fullArray[inc]['Heavy TAT'];
                 newDeliveryPartenerModel.deliveryPartener = "DELHIVERY";
                 await this.deliveryService.importDeliveryTatMetrics(newDeliveryPartenerModel);
                 let id=resultTatMatrix[0].id;
                 await this.deliveryService.updateTatMatrixStatus(id); 

               }
            }
            return res.status(200).send(await this._m.getMessage('200', "Successfully import tat matrix"));

          }
     }
}
}