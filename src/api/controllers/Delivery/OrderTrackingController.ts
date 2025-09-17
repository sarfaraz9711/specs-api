import 'reflect-metadata';
import { Body, Get, JsonController, Param, Post, Req, Res, UploadedFile } from 'routing-controllers';
import { CommonService } from "../../common/commonService";
import { OrderTrackingService } from '../../services/OrderTrackingService';
import moment from 'moment';
import { delivery_ecom, prozo } from "../../../env";
import { DeliveryService } from '../../services/delivery/DeliveryService';
import { PincodeService } from '../../services/Master/pincodeService';
import { S3Service } from '../../services/S3Service';
import { env } from '../../../env';
import { TatMatrixModel } from '../../models/Schedulers/TatMatrixModel';
//import { getManager } from 'typeorm';
//import { DeliveryPartenerModel } from '../../models/delivery/DeliveryTrackingModel';
//import { DeliveryPartenerEcomModel } from '../../models/delivery/DeliveryTrackingEcomModel';
//import { ImageService } from '../../services/ImageService';
//import * as path from 'path';




@JsonController('/order-tracking')
export class OrderTrackingController {
   constructor(
      private _m: CommonService,
      private _orderTracking: OrderTrackingService,
      private _deliveryService: DeliveryService,
      private _master : PincodeService,
      private s3Service: S3Service,
      //private imageService: ImageService,


   ) { }

   // Create Order Tracking API
   /**
    * @api {post} /api/order-tracking/secure/update-tracking Update Order Tracking
    * @apiGroup Order Tracking | Delivery
    * @apiParam (Request body) {String} orderId Order Id
    * @apiParam (Request body) {String} transactionalDate transactionalDate
    * @apiParam (Request body) {String} actionTypeId Current status of shippment (1 - order placed, 2-order accepted, 3-packing in progress, 4-shipped, 5-delivered)
    * @apiParam (Request body) {String} trackingUrl tracking url
    * @apiParam (Request body) {String} trackingNo tracking No
    * @apiHeader {String} Authorization
    * @apiParamExample {json} Input
    * {
    *      "orderId" : "",
    *      "actionTypeId" : "",
    *      "trackingUrl" : "",
    *      "trackingNo" : ""
    * }
    * @apiSuccessExample {json} Success
    * HTTP/1.1 200 OK
    * {
    *      "message": "Successfully updated",
    *      "status": "200",
    *      "data" : {}
    * }
    * @apiSampleRequest /api/order-tracking/secure/update-tracking
    * @apiErrorExample {json} Page error
    * HTTP/1.1 500 Internal Server Error
    */

   @Post('/secure/update-tracking')
   public async updateTracking(@Body({}) rawData: any, @Res() res: any): Promise<any> {
      if (rawData.actionTypeId == '1') {
         rawData.actionType = 'order placed';
      } else if (rawData.actionTypeId == '2') {
         rawData.actionType = 'order accepted';
      } else if (rawData.actionTypeId == '3') {
         rawData.actionType = 'packing in progress';
      } else if (rawData.actionTypeId == '4') {
         rawData.actionType = 'shipped';
      } else if (rawData.actionTypeId == '5') {
         rawData.actionType = 'delivered';
      } else {
         rawData.actionType = rawData.actionTypeId;
      }

      let _dateForTracking = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
      rawData.transactionalDate = _dateForTracking;

      let _c = await this._orderTracking.createNewTracking(rawData);
      if (_c) {
         return res.status(200).send(await this._m.getMessage(200, _c));
      } else {
         return res.status(200).send(await this._m.getMessage(300));
      }
   }




   // Get Order Tracking API
   /**
    * @api {post} /api/order-tracking/secure/get-tracking Get Order Tracking
    * @apiGroup Order Tracking | Delivery
    * @apiParam (Request body) {String} orderId Order Id
    * @apiHeader {String} Authorization
    * @apiParamExample {json} Input
    * {
    *      "orderId" : "",
    * }
    * @apiSuccessExample {json} Success
    * HTTP/1.1 200 OK
    * {
    *      "message": "Successfully updated",
    *      "status": "200",
    *      "data" : []
    * }
    * @apiSampleRequest /api/order-tracking/secure/get-tracking
    * @apiErrorExample {json} Page error
    * HTTP/1.1 500 Internal Server Error
    */

   @Post('/secure/get-tracking')
   public async getTracking(@Body({}) rawData: any, @Res() res: any): Promise<any> {

      const trackingData = await this._orderTracking.getTrackingById(rawData.orderId);

      if (trackingData.length > 0) {
         return res.status(200).send(await this._m.getMessage(200, trackingData));
      } else {
         return res.status(200).send(await this._m.getMessage(300));
      }
   }



   // Get Pin Code Availability
   /**
    * @api {post} /api/order-tracking/secure/get-delhivery-availability/:pinCode Get Pin Code Availability - Delhivery
    * @apiGroup Order Tracking | Delivery
    * @apiHeader {String} Authorization
    * @apiParamExample {json} Input
    * {
    *      "pinCode" : "201017",
    * }
    * @apiSuccessExample {json} Success
    * HTTP/1.1 200 OK
    * {
    *      "message": "Fetch result",
    *      "status": "200",
    *      "data" : [{}]
    * }
    * @apiSampleRequest /api/order-tracking/secure/get-delhivery-availability/:pinCode
    * @apiErrorExample {json} Page error
    * HTTP/1.1 500 Internal Server Error
    */
   @Get('/secure/get-delhivery-availability/:pinCode')
   public async getPincodeDelhiveryAvailability(@Res() res: any, @Req() req: any): Promise<any> {
      let _holdData = req.params;
      let delhiVeryPromise = await this.getDelhiveryServicability(_holdData.pinCode, res);
      
      //As discussion with delhivery team, only refer index 0 data for delivery purposes.
      if(delhiVeryPromise["data"] && delhiVeryPromise["data"]["delivery_codes"] && delhiVeryPromise["data"]["delivery_codes"].length > 0){
         let deliveryStatus = {
            'isDeliveryAvailable': ((delhiVeryPromise.data.delivery_codes.length > 0) ? true : false),
            'isCODAvailable': ((delhiVeryPromise.data["delivery_codes"][0]["postal_code"]["cod"] == 'Y') ? true : false),
            'partnerType': "DELHIVERY",
            'rawData': delhiVeryPromise.data
         };
         return res.status(200).send(await this._m.getMessage(200, deliveryStatus));
      }else{
         return res.status(200).send(await this._m.getMessage(300, "COD not available" ));
      }
      
      

   }

   public async getDelhiveryServicability(pinCode: any, res:any): Promise<any> {
      const axios = require('axios');
      const options = {
         method: 'GET',
         url: delivery_ecom.DELHIVERY_URL + pinCode,
         headers: {
            accept: 'application/json',
            Authorization: delivery_ecom.DEL_API_TOKEN,
            'Content-Type': 'application/json'
         }
      };
      try{
         let _b = await axios.request(options);
         return _b;
      }catch(e){
         return null;
      }
      

   }







   // Get Pin Code Availability
   /**
    * @api {post} /api/order-tracking/secure/get-ecom-availability/:pinCode Get Pin Code Availability - ECOM
    * @apiGroup Order Tracking | Delivery
    * @apiHeader {String} Authorization
    * @apiParamExample {json} Input
    * {
    *      "pinCode" : "201017",
    * }
    * @apiSuccessExample {json} Success
    * HTTP/1.1 200 OK
    * {
    *      "message": "Fetch result",
    *      "status": "200",
    *      "data" : [{}]
    * }
    * @apiSampleRequest /api/order-tracking/secure/get-ecom-availability/:pinCode
    * @apiErrorExample {json} Page error
    * HTTP/1.1 500 Internal Server Error
    */
   @Get('/secure/get-ecom-availability/:pinCode')
   public async getPincodeEcomAvailability(@Res() res: any, @Req() req: any): Promise<any> {
      let _holdData = req.params;
      let ecomPromise = await this.getEcomServicability(_holdData.pinCode);
      
      let deliveryStatus  = {};

      if(ecomPromise){
         deliveryStatus = Object.fromEntries(ecomPromise);
      }else{
             deliveryStatus = {
               'isDeliveryAvailable': false,
               'isCODAvailable':false,
               'partnerType': "ECOM",
               'rawData': {}
            };
      }
      return res.status(200).send(await this._m.getMessage(200, deliveryStatus));
   }

   public async getEcomServicability(pinCode: any): Promise<any> {

      let _delEcom = await this._deliveryService.findEcomByPincode(pinCode);
      if(_delEcom){
         let _returnable = new Map();
         if(_delEcom.active == 1){
            _returnable.set("isDeliveryAvailable",(_delEcom.status==1?true:false));
            _returnable.set("isCODAvailable",(_delEcom.active==1?true:false));
            _returnable.set("partnerType","ECOM");
            _returnable.set("rawData",_delEcom);

            return _returnable;
         }
      }
      /*
      
      var axios = require('axios');
      var FormData = require('form-data');
      var data = new FormData();
      data.append('username', delivery_ecom.ECOM_USERNAME);
      data.append('password', delivery_ecom.ECOM_PASSWORD);
      data.append('pincode', pinCode);

      var config = {
         method: 'post',
         url: delivery_ecom.ECOM_URL,
         headers: {
            ...data.getHeaders()
         },
         data: data
      };


      let _b = await axios(config);
      return _b;

      */



   }

   // Get Import Delivery metrics
   /**
    * @api {post} /api/order-tracking/secure/delivery-tat-metrics TAT Matrix
    * @apiGroup Order Tracking | Delivery
    * @apiParam (Request body) {String} delivery_type delivery_type Id
    * @apiHeader {String} Authorization
    * @apiParamExample {json} Input
    * {
    * }
    * @apiSuccessExample {json} Success
    * HTTP/1.1 200 OK
    * {
    *      "message": "Successfully import",
    *      "status": "200",
    *      "data" : []
    * }
    * @apiSampleRequest /api/order-tracking/secure/delivery-tat-metrics
    * @apiErrorExample {json} Page error
    * HTTP/1.1 500 Internal Server Error
    */

   @Post('/secure/delivery-tat-metrics')
   public async importDeliveryTatMetrics(@UploadedFile('file') files: any, @Res() res: any, @Req() req: any): Promise<any> {

      let deliveryType = req.body.delivery_type;

      const csv = require("csvtojson");
      let b = files.originalname;
      if (files.mimetype == "text/csv" && b.substring(b.lastIndexOf("."), b.length) == ".csv") {
         let _j = await csv().fromString((files.buffer).toString());
         if (_j.length > 0) {
            let resp = await this._doCreateOrder(_j, deliveryType);
            if (resp) {
               return res.status(200).send(await this._m.getMessage(200, "Delivery Tat Matrix saved successfully"));
            }
         }

      } else {
         return res.status(200).send(await this._m.getMessage(500, "Error"));
      }



   }

   public async _doCreateOrder(_j: any, _deliveryType: any): Promise<any> {
      await this._deliveryService.emptyDeliveryTatMetricsTable();
      let newArray = [];
      let type = ((_deliveryType == "ECOM") ? 'ECOM' : 'DELHIVERY');

      for (let inc = 0; inc < _j.length; inc++) {
         newArray.push({
            origin: _j[inc].Origin,
            destination: _j[inc].Destination,
            forwardSurfaceCutoff: _j[inc]['Forward Surface Cutoff'],
            forwardSurfaceTat: _j[inc]['Forward Surface Tat'],
            forwardExpressCutoff: _j[inc]['Forward Express Cutoff'],
            forwardExpressTat: _j[inc]['Forward Express Tat'],
            heavyCutoff: _j[inc]['Heavy Cutoff'],
            heavyTat: _j[inc]['Heavy TAT'],
            deliveryPartener: type
         });


         if (newArray.length == 1000 || inc == (_j.length - 1)) {
            await this._deliveryService.importDeliveryTatMetrics(newArray);
            newArray = [];
            continue;
         } else {
            continue;
         }
      }
      let data = { "message": "Process done" };
      return Promise.resolve(data);

   }


   // Get Pincode expected Delivery
   /**
    * @api {post} /api/order-tracking/secure/expected-delivery Get Pincode expected Delivery
    * @apiGroup Order Tracking | Delivery
    * @apiParam (Request body) {String} pinCode delivery pincode
    * @apiParam (Request body) {String} deliveryPartner delivery partener {DELHIVERY || ECOM}
    * @apiHeader {String} Authorization
    * @apiParamExample {json} Input
    * {
    * }
    * @apiSuccessExample {json} Success
    * HTTP/1.1 200 OK
    * {
    *      "message": "Data Fetched",
    *      "status": "200",
    *      "data" : {
    *          deliveryDays : '4 days',
    *          deliveryDate : 'Friday 2nd May, 2022'
    *       }
    * }
    * @apiSampleRequest /api/order-tracking/secure/expected-delivery
    * @apiErrorExample {json} Page error
    * HTTP/1.1 500 Internal Server Error
    */

   @Post("/secure/expected-delivery")
   public async getPincodeExpectedDelivery(@Body() rawData: any, @Res() res: any): Promise<any> {
      if (rawData.deliveryPartner == "DELHIVERY") {
         let processData = await this.getDelhiveryExpected(rawData.pinCode);
         return res.status(200).send(await this._m.getMessage(200, processData));
      } else if (rawData.deliveryPartner == "ECOM") {
         let processData = await this.getEcomExpected(rawData.pinCode);
         return res.status(200).send(await this._m.getMessage(200, processData));
      } else {
         return res.status(200).send(await this._m.getMessage(300, "", "Please provide delivery partner"));
      }
   }

   public async getDelhiveryExpected(pincode: any): Promise<any> {

      let pinCodeRaw = await this._master.findById(pincode);

      let defaultDays : any = 6;
      var defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + parseInt(defaultDays));



      let _data = {};
      if(pinCodeRaw){
         let tentativeRaw = await this._deliveryService.getExpectedDelivery(pinCodeRaw.officename,"DELHIVERY");
         if(tentativeRaw){
            var date = new Date();
            date.setDate(date.getDate() + parseInt(tentativeRaw.forwardSurfaceTat));
            _data = {
               deliveryDays: parseInt(tentativeRaw.forwardSurfaceTat)+" days",
               deliveryDate:"Delivery by "+ moment(date).format("dddd, Do MMMM"),
               isGatewayResponse : 'yes',
               getWay : 'delhivery'
            };
         }else{

            // _data = {
            //    deliveryDays: defaultDays+" days",
            //    deliveryDate: "Delivery by "+ moment(defaultDate).format("dddd, Do MMMM"),
            //    isGatewayResponse : 'no',
            //    getWay : 'delhivery'
            // };
            _data = await this.getEcomExpected(pincode);
         }
      }else{
         _data = await this.getEcomExpected(pincode);
        

      }
      return _data;
   }

   public async getEcomExpected(pincode: any): Promise<any> {
      let pinCodeRaw = await this._deliveryService.findEcomByPincode(pincode);
      //let pinCodeRaw = await this._master.findById(pincode);
      
      let defaultDays : any = 6;
      var defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + parseInt(defaultDays));
      
      
      let _data = {};
      if(pinCodeRaw){
         let tentativeRaw = await this._deliveryService.getExpectedDelivery(pinCodeRaw.city,"ECOM",pincode);
         if(tentativeRaw){
            var _date = new Date();
            _date.setDate(_date.getDate() + parseInt(tentativeRaw.noCutoff));

            _data = {
               deliveryDays: parseInt(tentativeRaw.noCutoff)+" days",
               deliveryDate: "Delivery by "+ moment(_date).format("dddd, Do MMMM"),
               isGatewayResponse : 'yes',
               getWay : 'ecom'
            };
         }else{
            _data = {
               deliveryDays: defaultDays+" days",
               deliveryDate: "Delivery by "+ moment(defaultDate).format("dddd, Do MMMM"),
               isGatewayResponse : 'no',
               getWay : 'ecom'
            };
         }
      }else{
         _data = {
            deliveryDays: defaultDays+" days",
            deliveryDate: "Delivery by "+ moment(defaultDate).format("dddd, Do MMMM"),
            isGatewayResponse : 'no',
            getWay : 'ecom'
         };
      }
      return _data;
   }



   //  Import Ecom metrics
   /**
    * @api {post} /api/order-tracking/secure/ecom-tat-metrics Import Ecom TAT Matrix
    * @apiGroup Order Tracking | Ecom
    * @apiParamExample {json} Input
    * {
    * }
    * @apiSuccessExample {json} Success
    * HTTP/1.1 200 OK
    * {
    *      "message": "Successfully import",
    *      "status": "200",
    *      "data" : []
    * }
    * @apiSampleRequest /api/order-tracking/secure/ecom-tat-metrics
    * @apiErrorExample {json} Page error
    * HTTP/1.1 500 Internal Server Error
    */

   @Post('/secure/ecom-tat-metrics')
   public async importEcomTatMetrics(@UploadedFile('file') files: any, @Res() res: any, @Req() req: any): Promise<any> {


      const csv = require("csvtojson");
      let b = files.originalname;
      if (files.mimetype == "text/csv" && b.substring(b.lastIndexOf("."), b.length) == ".csv") {
         let _j = await csv().fromString((files.buffer).toString());
        if (_j.length > 0) {
            let resp = await this._doCreateEcomOrder(_j);
            if (resp) {
               return res.status(200).send(await this._m.getMessage(200, "Ecom Tat Matrix saved successfully"));
            }
         }

      } else {
         return res.status(200).send(await this._m.getMessage(500, "Error"));
      }
   }

   public async _doCreateEcomOrder(_j: any): Promise<any> {
      await this._deliveryService.emptyEcomTatMetricsTable();
      let newArray = [];

      for (let inc = 1; inc < _j.length; inc++) {
         newArray.push({
            pincode: _j[inc].PINCODE,
            cityName: _j[inc]["CITY NAME"],
            dcCode: _j[inc]['DC Code'],
            state: _j[inc].STATE,
            region: _j[inc].REGION,
            regularUpRos: _j[inc]['Regular / UP / ROS'],
            preCutoff: _j[inc]['Lucknow -226001'],
            noCutoff: _j[inc].field8,
            deliveryPartener: "ECOM"
         });

         if (newArray.length == 1000 || inc == (_j.length)) {
            await this._deliveryService.importEcomTatMetrics(newArray);
            newArray = [];
            continue;
         } else {
            continue;
         }
      }
      let data = { "message": "Process done" };
      return Promise.resolve(data);

   }


   //  Upload tat metrics
   /**
    * @api {post} /api/order-tracking/secure/tat-matrix-upload Upload TAT Matrix
    * @apiGroup Order Tracking | Upload tat matrix
    * @apiParamExample {json} Input
    * {
    * }
    * @apiSuccessExample {json} Success
    * HTTP/1.1 200 OK
    * {
    *      "message": "successfully upload tat matrix file",
    *      "status": "200",
    *      "data" : []
    * }
    * @apiSampleRequest /api/order-tracking/secure/tat-matrix-upload
    * @apiErrorExample {json} Page error
    * HTTP/1.1 500 Internal Server Error
    */
   @Post('/secure/tat-matrix-upload')
   public async uploadTatMatrix(@UploadedFile('file') files: any, @Res() res: any, @Req() req: any): Promise<any> {
      let b:any
      let fileType:any
      if(files) {
         b = files.originalname;
         fileType=b.split('.')[1]
      }

      if(fileType=='csv'){
      const path = 'uploads/e_tat_metrix/';
      if (env.imageserver == 's3') {
          await this.s3Service.fileUpload((path + b), files.buffer, 'csv',"yes");
          const TatMatrixParams = new TatMatrixModel();
          TatMatrixParams.filePath=path+b;
          TatMatrixParams.fileType=req.body.file_type;
          TatMatrixParams.status=0;
          await this._deliveryService.saveTatMatrix(TatMatrixParams);
      }
      }else{
         return res.status(400).send(await this._m.getMessage(400, null, "Please upload valid data"));
      }
      return res.status(200).send(await this._m.getMessage("successfully upload tat matrix file"));

   }

@Get('/check-delivery-time/:pincode')
   public async expectedDeliveryWithBothPartner(@Param('pincode') pincode:number): Promise<any>{
      try{
      const delhiveryresponse:any = await this.getPincodeServicebilityDelhivery(pincode)
         if(delhiveryresponse.status==200){
            return delhiveryresponse            
         }else{
            const prozoResponse:any = await this.getPincodeServicebilityProzo(pincode)
            return prozoResponse
         }
      }catch{
         return {status: 400,
            message:'Pincode is not serviceable',
            data: null}
         }
   }

   public async getPincodeServicebilityDelhivery(pincode:any){
      const resultJson:any={}
      try{
      const axios = require('axios')
      const config = {
          method: 'get',
          url: `${delivery_ecom.DELHIVERY_URL}${pincode}`,
          headers:  {
            "Content-Type" : "application/json; charset=utf-8",
          }
        };
        const result = await axios(config)
        if (result.status == 200 && result.data && result.data.delivery_codes.length > 0) {
      const postalCodes = result.data.delivery_codes[0].postal_code
      if(postalCodes.cod=='Y' && postalCodes.pre_paid=='Y' && postalCodes.remarks!='Embargo'){
         resultJson.status = 200
         resultJson.message = 'Pincode serviceable and usually delivery within 5 days',
         resultJson.data = {pre_paid:'Y',cod:'Y',serviceProvider:'Delhivery'}
      }else{
         resultJson.status = 300
         resultJson.message = 'Pincode is not serviceable',
         resultJson.data = null
      }
   }else{
      resultJson.status = 400
      resultJson.message = 'Pincode is not serviceable',
      resultJson.data = null
   }
}catch{
   resultJson.status = 500
   resultJson.message = 'Pincode is not serviceable',
   resultJson.data = null
}
return resultJson
}


public async prozoToken(){
   const axios = require('axios')
   const payload:any={
      "username":`${prozo.PROZO_USERNAMR}`,
      "password":`${prozo.PROZO_PASSWORD}`
  }
   const config = {
       method: 'post',
       url: `${prozo.PROZO_URL}api/auth/signin`,
       headers:  {
         "Content-Type" : "application/json; charset=utf-8",},
         data:payload
     };
   const result = await axios(config)
   const token:any = `${result.data.tokenType} ${result.data.accessToken}`
     return token
}

public async getPincodeServicebilityProzo(pincode:any){
   const getToken:any = await this.prozoToken()
   const axios = require('axios')
   const payload:any=[{
      "drop_pincode":pincode,
      "pickup_pincode":208022
      }]
   const config = {
       method: 'post',
       url: `${prozo.PROZO_URL}api/tools/serviceability`,
       headers:  {
         "Content-Type" : "application/json; charset=utf-8",
         "Authorization": getToken
      },
         data:payload
     };
     const resultJson:any={}
     try{
   const result = await axios(config)
   console.log("result.data",result.data)
   const actResult:any = result.data
   if(actResult.meta.success && actResult.result.length>0){
      resultJson.status = 200
      resultJson.message = 'Pincode serviceable and usually delivery within 5 days',
      resultJson.data = {pre_paid:actResult.result[0].serviceable.PREPAID?'Y':'N' ,cod:actResult.result[0].serviceable.COD?'N':'N',serviceProvider:'Prozo'}
   }else{
      resultJson.status = 300
      resultJson.message = 'Pincode is not serviceable',
      resultJson.data = null
   }
}catch{
   resultJson.status = 400
   resultJson.message = 'Pincode is not serviceable',
   resultJson.data = null
}
return resultJson
}

}
