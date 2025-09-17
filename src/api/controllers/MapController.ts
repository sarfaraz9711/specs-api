import 'reflect-metadata';
import {
    Post,
    JsonController,
    Res,
    Body,
    Req,
    Get,
    Put,UploadedFile, QueryParam, QueryParams
    //UseBefore
} from 'routing-controllers';
import { MapService } from '../services/admin/MapService';
import { CommonService } from "../common/commonService";
import { classToPlain } from 'class-transformer';
import { MigrationService } from "../common/MigrationService";
import { PincodeService } from '../services/PincodeMaster/PincodeMasterService';
import { getManager } from 'typeorm';

//import { TmStoreInventory } from '../models/TmStoreInventry';
//import { StoreInventoryService } from '../services/admin/StoreInventoryService';
import { Maps } from "../models/Maps";



//import { secureTokenChecks } from '../middlewares/SecureHandlerMiddleware';

@JsonController('/maps')
export class MapController {
    constructor(private _map: MapService,
                private _m: CommonService,
                private _migration: MigrationService,
                private pincodeService: PincodeService,

	//private _storeInventory: StoreInventoryService
	) { }

    // Create Location Stores
    /**
     * @api {post} /api/maps/secure/save-locations Add Stores Address API
     * @apiGroup Location Stores 
     * @apiParam (Request body) {String} pincode pincode
     * @apiParam (Request body) {String} latitude latitude
     * @apiParam (Request body) {String} longitude longitude
     * @apiParam (Request body) {String} shopName shopName
     * @apiParam (Request body) {String} address address
     * @apiParam (Request body) {Number} createdBy createdBy
     * @apiParam (Request body) {Number} createdDate createdDate
     * @apiParam (Request body) {Number} modifiedBy modifiedBy
     * @apiParam (Request body) {Number} modifiedDate modifiedDate
     * @apiParam (Request body) {Number} storeOpeningTime storeOpeningTime
     * @apiParam (Request body) {Number} storeClosingTime storeClosingTime
     * @apiParam (Request body) {Number} contactNo contactNo
     * @apiParam (Request body) {Number} quantity quantity
     * @apiParam (Request body) {Number} cityId cityId
     * @apiParam (Request body) {Number} refNum refNum
     * @apiParam (Request body) {Number} firstName firstName
     * @apiParam (Request body) {Number} storeLegalName storeLegalName
     * @apiParam (Request body) {Number} shopNo shopNo
     * @apiParam (Request body) {Number} businessName businessName
     * @apiParam (Request body) {Number} percentageCommision percentageCommision
     * @apiParam (Request body) {Number} staffStrength staffStrength
     * @apiParam (Request body) {Number} annualTurnover annualTurnover
     * @apiParam (Request body) {Number} yearOfCompanyFoundation yearOfCompanyFoundation
     * @apiParam (Request body) {Number} salesExperience salesExperience
     * @apiParam (Request body) {Number} clientName clientName
     * @apiParam (Request body) {Number} active active
     * @apiParam (Request body) {Number} isOrderMail isOrderMail
     * @apiParam (Request body) {Number} emailId emailId
     * @apiParam (Request body) {Number} shipperName shipperName
     * @apiParam (Request body) {Number} storeTypeVendor storeTypeVendor
     * @apiParam (Request body) {Number} storeType storeType
     * @apiParam (Request body) {Number} address2 address2
     * @apiParam (Request body) {Number} storeCountry storeCountry
     * @apiParam (Request body) {Number} mobileNo mobileNo
     * @apiParam (Request body) {Number} isStoreShipper isStoreShipper
     * @apiParam (Request body) {Number} isWarehouse isWarehouse
     * @apiParam (Request body) {Number} isAsp isAsp
     * @apiParam (Request body) {Number} isWebOnline isWebOnline
     * @apiParam (Request body) {Number} isStore isStore
     * @apiParam (Request body) {Number} isDeliverStore isDeliverStore
     * @apiParam (Request body) {Number} isOrderStore isOrderStore
     * @apiParamExample {json} Input
     * {
     *      "pincode" : "",
     *      "latitude" : "",
     *      "longitude" : "",
     *      "shopName" : "",
     *      "address" : "",
     *      "createdBy" : "",
     *      "createdDate" : "",
     *      "modifiedBy" : "",
     *      "modifiedDate" : "",
     *      "storeOpeningTime" : "",
     *      "storeClosingTime" : "",
     *      "contactNo" : "",
     *      "quantity" : "",
     *      "cityId" : "",
     *      "refNum" : "",
     *      "firstName" : "",
     *      "storeLegalName" : "",
     *      "shopNo" : "",
     *      "percentageCommision" : "",
     *      "staffStrength" : "",
     *      "annualTurnover" : "",
     *      "yearOfCompanyFoundation" : "",
     *      "salesExperience" : "",
     *      "clientName" : "",
     *      "active" : "",
     *      "isOrderMail" : "",
     *      "emailId" : "",
     *     "shipperName" : "",
     *     "storeTypeVendor" : "",
     *     "storeType" : "",
     *     "address2" : "",
     *     "storeCountry" : "",
     *     "mobileNo" : "",
     *     "isStoreShipper" : "",
     *     "isWarehouse" : "",
     *     "isAsp" : "",
     *     "isWebOnline" : "",
     *     "isStore" : "",
     *     "isDeliverStore" : "",
     *     "isOrderStore" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "New Address is created successfully",
     *      "status": "1"
     *      "data" : {}
     * }
     * @apiSampleRequest /api/maps/secure/save-locations
     * @apiErrorExample {json} addAddress error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/secure/save-locations')
    public async saveStores(@Body() mapData: any = {}, @Res() response: any): Promise<any> {
        //console.log("store daat>>",mapData)
        let emailIddata = await this._map.findOne({ where: { emailId: mapData.emailId } });
        //console.log("data>>>>mapData",mapData);
        mapData.googleLocation=Buffer.from(mapData.googleLocation, 'base64').toString('ascii');
        console.log("data with google location",mapData);
         if(!emailIddata){
        const r = await this._map.saveData(mapData);
        if (r) {
            return response.status(200).send(await this._m.getMessage(200, r, ""));
        } else {
            return response.status(400).send(await this._m.getMessage(400, "", ""));
        }
    }else{
        return response.status(400).send(await this._m.getMessage(403 , "Email already exist", "Email already exist"));
    }
    }



    // List Location Stores
    /**
     * @api {get} /api/maps/secure/get-locations/:pincode Get Stores Location API
     * @apiGroup Location Stores 
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully deleted address.",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/maps/secure/get-locations/:pincode
     * @apiErrorExample {json} address error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/secure/get-locations/:pincode')
    //send ALL in case of all data required without pin
    public async getStore(@Req() req: any, @Res() response: any): Promise<any> {

        let _holdData = req.params;
        let _listOfStores = await this._map.storeList(0, 0, 0, _holdData['pincode'], true);
        if (_listOfStores) {
            return response.status(200).send(await this._m.getMessage(200, _listOfStores, ""));
        } else {
            return response.status(400).send(await this._m.getMessage(300, "", ""));
        }
    }

    // List Location Stores Proximity
    /**
     * @api {get} /api/maps/secure/get-stores-nearby/:pincode Get Stores Location API Proximity
     * @apiGroup Location Stores 
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully deleted address.",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/maps/secure/get-stores-nearby/:pincode
     * @apiErrorExample {json} address error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/secure/get-stores-nearby/:pincode')
    //@UseBefore(secureTokenChecks)
    public async getStoreNearBy(@Req() req: any, @Res() response: any): Promise<any> {

        let _holdData = req.params;
        let _listOfStores = await this._map.storeList(0, 0, 0, _holdData['pincode'], false);
        if (_listOfStores) {
            let r = await this._map.getStoresNearMe(_listOfStores.latitude, _listOfStores.longitude);

            if (r.length > 0) {
                return response.status(200).send(await this._m.getMessage(200, r, ""));
            } else {
                return response.status(400).send(await this._m.getMessage(300, "", ""));
            }
        } else {
            return response.status(400).send(await this._m.getMessage(300, "", ""));
        }
    }

    //Update location Store
    /**
     * @api {put} /api/maps/secure/update-location-store Update Store API
     * @apiGroup Location Stores
     * @apiParam (Request body) {String} id id
     * @apiParam (Request body) {String} pincode pincode
     * @apiParam (Request body) {String} latitude latitude
     * @apiParam (Request body) {String} longitude longitude
     * @apiParam (Request body) {String} shopName shopName
     * @apiParam (Request body) {String} address address
     * @apiParam (Request body) {Number} storeOpeningTime storeOpeningTime
     * @apiParam (Request body) {Number} storeClosingTime storeClosingTime
     * @apiParam (Request body) {Number} contactNo contactNo
     * @apiParam (Request body) {Number} quantity quantity
     * @apiParam (Request body) {Number} refNum refNum
     * @apiParam (Request body) {Number} firstName firstName
     * @apiParam (Request body) {Number} storeLegalName storeLegalName
     * @apiParam (Request body) {Number} shopNo shopNo
     * @apiParam (Request body) {Number} businessName businessName
     * @apiParam (Request body) {Number} percentageCommision percentageCommision
     * @apiParam (Request body) {Number} staffStrength staffStrength
     * @apiParam (Request body) {Number} annualTurnover annualTurnover
     * @apiParam (Request body) {Number} yearOfCompanyFoundation yearOfCompanyFoundation
     * @apiParam (Request body) {Number} salesExperience salesExperience
     * @apiParam (Request body) {Number} clientName clientName
     * @apiParam (Request body) {Number} active active
     * @apiParam (Request body) {Number} isOrderMail isOrderMail
     * @apiParam (Request body) {Number} emailId emailId
     * @apiParam (Request body) {Number} shipperName shipperName
     * @apiParam (Request body) {Number} storeTypeVendor storeTypeVendor
     * @apiParam (Request body) {Number} storeType storeType
     * @apiParam (Request body) {Number} address2 address2
     * @apiParam (Request body) {Number} storeCountry storeCountry
     * @apiParam (Request body) {Number} mobileNo mobileNo
     * @apiParam (Request body) {Number} isStoreShipper isStoreShipper
     * @apiParam (Request body) {Number} isWarehouse isWarehouse
     * @apiParam (Request body) {Number} isAsp isAsp
     * @apiParam (Request body) {Number} isWebOnline isWebOnline
     * @apiParam (Request body) {Number} isStore isStore
     * @apiParam (Request body) {Number} isDeliverStore isDeliverStore
     * @apiParam (Request body) {Number} isOrderStore isOrderStore
     * @apiParamExample {json} Input
     * {
     *      "id" : "",
     *      "pincode" : "",
     *      "latitude" : "",
     *      "longitude" : "",
     *      "shopName" : "",
     *      "address" : "",
     *      "storeOpeningTime" : "",
     *      "storeClosingTime" : "",
     *      "contactNo" : "",
     *      "quantity" : "",
     *      "refNum" : "",
     *      "firstName" : "",
     *      "storeLegalName" : "",
     *      "shopNo" : "",
     *      "percentageCommision" : "",
     *      "staffStrength" : "",
     *      "annualTurnover" : "",
     *      "yearOfCompanyFoundation" : "",
     *      "salesExperience" : "",
     *      "clientName" : "",
     *      "active" : "",
     *      "isOrderMail" : "",
     *      "emailId" : "",
     *     "shipperName" : "",
     *     "storeTypeVendor" : "",
     *     "storeType" : "",
     *     "address2" : "",
     *     "storeCountry" : "",
     *     "mobileNo" : "",
     *     "isStoreShipper" : "",
     *     "isWarehouse" : "",
     *     "isAsp" : "",
     *     "isWebOnline" : "",
     *     "isStore" : "",
     *     "isDeliverStore" : "",
     *     "isOrderStore" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully updated Store.",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/maps/secure/update-location-store
     * @apiErrorExample {json} Store error
     * HTTP/1.1 500 Internal Server Error
     */
    @Put('/secure/update-location-store')
    public async updateLocationStore(@Body() @Res() response: any, @Req() request: any): Promise<any> {

        let Id = request.id;
        const storedata: any = await this._map.findOne({
            where: {
                id: Id,
            },
        });
        if (!storedata) {
            return response.status(400).send(await this._m.getMessage(300, "", ""));

        }
        storedata.pincode = request.pincode;
        storedata.latitude = request.latitude;
        storedata.longitude = request.longitude;
        storedata.shopName = request.shopName;
        storedata.address = request.address;
        storedata.storeOpeningTime = request.storeOpeningTime;
        storedata.storeClosingTime = request.storeClosingTime;
        storedata.contactNo = request.contactNo;
        storedata.quantity = request.quantity;
        storedata.cityId = request.cityId;
        storedata.refNum = request.refNum;
        storedata.firstName = request.firstName;
        storedata.storeLegalName = request.storeLegalName;
        storedata.shopNo = request.shopNo;
        storedata.businessName = request.businessName;
        storedata.percentageCommision = request.percentageCommision;
        storedata.staffStrength = request.staffStrength;
        storedata.annualTurnover = request.annualTurnover;
        storedata.yearOfCompanyFoundation = request.yearOfCompanyFoundation;
        storedata.salesExperience = request.salesExperience;
        storedata.clientName = request.clientName;
        storedata.active = request.active;
        storedata.isOrderMail = request.isOrderMail;
        storedata.emailId = request.emailId;
        storedata.shipperName = request.shipperName;
        storedata.storeTypeVendor = request.storeTypeVendor;
        storedata.storeType = request.storeType;
        storedata.address2 = request.address2;
        storedata.storeCountry = request.storeCountry;
        storedata.mobileNo = request.mobileNo;
        storedata.isStoreShipper = request.isStoreShipper;
        storedata.isWarehouse = request.isWarehouse;
        storedata.isAsp = request.isAsp;
        storedata.isWebOnline = request.isWebOnline;
        storedata.isStore = request.isStore;
        storedata.isDeliverStore = request.isDeliverStore;
        storedata.isOrderStore = request.isOrderStore;
        storedata.facilityCode = request.facilityCode;

        const storeUpdate = await this._map.saveData(storedata);
        if (storeUpdate) {
            return response.status(200).send(await this._m.getMessage(200, "", "Successfully updated store"));
        } else {
            return response.status(400).send(await this._m.getMessage(300, "", "Unable to update the store."));
        }
    }
	
	//Store All List
    /**
     * @api {get} /api/maps/secure/get-store-list Get Store List
     * @apiGroup Location Stores
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully Get Store All List.",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/maps/secure/get-store-list
     * @apiErrorExample {json} Store List error
     * HTTP/1.1 500 Internal Server Error
     */
	 @Get('/secure/get-store-list')
    public async getAllStoreList(@Req() req: any, @Res() response: any): Promise<any> {
	   //const select = ['*'];
        const store = await this._map.findStore({select: ['active','address','contactNo','emailId','firstName','googleLocation','id','mobileNo','pincode','shopName','storeCity','storeCode','storeState','latitude','longitude','storeOpeningDate']});
        if (store) {
            return response.status(200).send(await this._m.getMessage(200, classToPlain(store), "Successfully get All Store List"));
        } else {
            return response.status(400).send(await this._m.getMessage(400, "", ""));

        }
    }
	
	
	
	
  // save store inventory
  
    /**
     * @api {post} /api/maps/secure/save-store-inventory Add Store Inventory
     * @apiGroup Location Stores 
     * @apiParam (Request body) {String} storeId storeId
     * @apiParam (Request body) {String} productQuantity productQuantity
     * @apiParam (Request body) {String} productId productId
     * @apiParam (Request body) {String} sku sku
     * @apiParam (Request body) {String} status status
     * @apiParamExample {json} Input
     * {
     *      "storeId" : "",
     *      "productQuantity" : "",
     *      "productId" : "",
     *      "sku" : "",
     *      "status" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Store Inventory is saved successfully",
     *      "status": "1"
     *      "data" : {}
     * }
     * @apiSampleRequest /api/maps/secure/save-store-inventory
     * @apiErrorExample {json} addstoreInventory error
     * HTTP/1.1 500 Internal Server Error
     */
  
   @Post('/secure/save-store-inventory')
    public async saveStoreInventory(@Req() req: any, @Res() response: any): Promise<any> {
		
		 const store = await this._map.findStore({
                where: {
                    id: req.body.storeId
                },
            });
			
		
		let _ch = [];
		_ch.push({
			productId :req.body.productId,
			sku : req.body.sku,
			productQuantity : req.body.productQuantity,
			status : req.body.status
		});
		
        store[0].isWarehouse = "No";
        store[0].storeFk = _ch;
         const storeInventorySaveResponse = await this._map.saveStoreData(store);
         if (storeInventorySaveResponse) {
              return response.status(200).send(await this._m.getMessage(200, storeInventorySaveResponse, "Store Inventory saved successfully"));
         } else {
               return response.status(400).send(await this._m.getMessage(400, "", ""));

         }
    }
    
    
    // save store 
    /**
     * @api {post} /api/maps/secure/import-store Add Store 
     * @apiGroup Location Stores 
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Store Inventory is saved successfully",
     *      "status": "1"
     *      "data" : {}
     * }
     * @apiSampleRequest /api/maps/secure/import-store
     * @apiErrorExample {json} addstoreInventory error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/secure/import-store')
     public async importUserData(@UploadedFile('file') files: any, @Res() res: any): Promise<any> {
          const csv = require("csvtojson");
          let b = files.originalname;

          if (files.mimetype == "text/csv" && b.substring(b.lastIndexOf("."), b.length) == ".csv") {
               let _j = await csv().fromString((files.buffer).toString());

               if (_j.length > 0) {
                for (let inc = 0; inc < _j.length; inc++) {
                    const resultData = await this.pincodeService.stateCityData( _j[inc]['Store State'],_j[inc]['Store City']);
                    const newMaps: any = new Maps();
                    newMaps.refNum = _j[inc]['Ref Num'];
                    newMaps.firstName = _j[inc].First;
                    newMaps.businessName = _j[inc].Bussiness_Name;
                    newMaps.storeLegalName = _j[inc]['Store Legal Name'];
                    newMaps.shopNo = _j[inc]['Shop No'];
                    newMaps.active =  _j[inc]['Is Active'];
                    newMaps.mobileNo = _j[inc]['Mobile No'];
                    newMaps.latitude = _j[inc].Lattitute;

                    newMaps.longitude = _j[inc].Longitute;
                    newMaps.storeState = _j[inc]['Store State'];
                    newMaps.storeCity = _j[inc]['Store City'];

                    newMaps.address = _j[inc].Address;

                    newMaps.emailId = _j[inc]['E-Mail ID'];
                    newMaps.storeCode = _j[inc]['Store code'];
                    if(resultData.length!=0){
                    newMaps.cityId = resultData[0].district_id;
                    }

                     await this._map.saveData(newMaps);
                    
           

                }
        
                    return res.status(200).send(await this._m.getMessage('200', '', 'store saved successfully'));

                
              
               }
          } else {
               return res.status(200).send(await this._m.getMessage('500', '', 'Invalid file.')).end();
          }
     }


     @Post("/secure/validate-store")
     public async validateStoreData(@UploadedFile('file') files: any, @Res() res: any): Promise<any> {
         const csv = require("csvtojson");
         let b = files.originalname;
         if (files.mimetype == "text/csv" && b.substring(b.lastIndexOf("."), b.length) == ".csv") {
             let _j = await csv().fromString((files.buffer).toString());
 
             if (_j.length > 0) {
                 let _executionOver = await this._doStoreValidate(_j);
                 let filePath = "";
                 if (_executionOver.compileRecord.length > 0) {
                     filePath = await this._migration._doCreateCSVOnS3(_executionOver.compileRecord, files.originalname, 'Validate_Store_');
                 } else {
                     filePath = "NA";
                 }
 
 
                 if (filePath) {
                     let _json = {
                         "message": (_executionOver.failedRecord.length > 0) ? "After correction of this csv please validate again." : '',
                         "downloadCompiledRecords": filePath
                     };
                     return res.status(200).send(await this._m.getMessage('200', _json));
                 }
 
             }
         } else {
             return res.status(500).send(await this._m.getMessage('200'));
         }
     }

     public async _doStoreValidate(_j: any): Promise<any> {
        let failedJson = [];
        //let successJson = [];
        let counter = 0;
        let cloneArray = JSON.parse(JSON.stringify(_j));

        let newJson = [];
        for (let inc = 0; inc < _j.length; inc++) {

            counter += 1;
            let errorM = '';
           // let stateName=_j[inc]['Store State'];
           // let stateData = await this.pincodeService.findState(stateName);
            let cityName=_j[inc]['Store City'];
            let cityData = await this.pincodeService.findSubDistrict(cityName);
          

            /*if (stateData.length>0) {
                errorM = errorM + "\r\n" + 'store state is not available';
                // Object.assign(cloneArray[inc], { 'Error Message': 'Email Id is not available' });
                failedJson.push(cloneArray[inc]);
                // newJson.push(cloneArray[inc]);
                //continue;
            }*/
            if (cityData.length==0) {
                errorM = errorM + "\r\n" + 'store city is not available';
                // Object.assign(cloneArray[inc], { 'Error Message': 'Email Id is not available' });
                failedJson.push(cloneArray[inc]);
                // newJson.push(cloneArray[inc]);
               // continue;
            } 
            Object.assign(cloneArray[inc], { 'Error Message': errorM });
            newJson.push(cloneArray[inc]);
            
        }
        if (counter == ((_j.length))) {
            let _newJ = {
                "totalRecord": _j.length,
                "compileRecord": newJson,
                "failedRecord": failedJson
            };
            return Promise.resolve(_newJ);
        }
    }

    //Store All List
    /**
     * @api {get} /api/maps/secure/get-store-by-id Get Store details
     * @apiGroup Location Stores
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully found store",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/maps//secure/get-store-by-id
     * @apiErrorExample {json} Store List error
     * HTTP/1.1 500 Internal Server Error
     */
	 @Get('/secure/get-store-by-id')
     public async getStoreById(@QueryParam("id") id: any , @Req() req: any, @Res() response: any): Promise<any> {
        //const select = ['*'];
         const store = await this._map.findOne({id});
         
         if (store) {
             return response.status(200).send(await this._m.getMessage(200, classToPlain(store), "Successfully found store"));
         } else {
             return response.status(400).send(await this._m.getMessage(400, "", ""));
 
         }
     }

     @Post('/secure/update-store')
     public async updateStore(@Body() mapData: any = {}, @Res() response: any): Promise<any> {
        mapData.googleLocation=Buffer.from(mapData.googleLocation, 'base64').toString('ascii');
             const r = await this._map.saveData(mapData);
       
     if (r) {
         return response.status(200).send(await this._m.getMessage(200, r, ""));
     } else {
         return response.status(400).send(await this._m.getMessage(400, "", ""));
     }
 
 
     } 

     @Get('/secure/get-stores-by-city')
     public async getStoreBycity(@QueryParams() inputs: any , @Req() req: any, @Res() response: any): Promise<any> {
        //const select = ['*'];
        //  const store = await this._map.findStore({where:{storeCity: inputs.city.toLowerCase()}});
         const mapRepo = getManager().getRepository(Maps)
         const store = await mapRepo.createQueryBuilder("maps")
         .where("LOWER(maps.store_city) = LOWER(:title)", { title: inputs.city })
        .getMany();


         if (store) {
             return response.status(200).send(await this._m.getMessage(200, classToPlain(store), "Successfully found store"));
         } else {
             return response.status(400).send(await this._m.getMessage(400, "", ""));
 
         }
     }

}
