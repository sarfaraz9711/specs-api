import { JsonController, Post, Res, UploadedFile,Body, Authorized } from "routing-controllers";
import { Customer } from "../../models/Customer";
import { CustomerService } from "../../services/CustomerService";
import { CommonService } from "../../common/commonService";
//import * as AWS from 'aws-sdk';
import { env } from '../../../env';
import { User } from '../../models/User';
import { EmailTemplateService } from '../../services/EmailTemplateService';
import { SettingService } from '../../services/SettingService';
import { MAILService } from '../../../auth/mail.services';
import { Address } from '../../models/Address';
import { AddressService } from '../../services/AddressService';
import { DataMigrationService } from '../../services/dbMigration/DataMigrationService';



// import { OtpTemplateService } from "../../common/OtptemplateService";
// import { AccessTokenService } from "../../services/AccessTokenService";
// import { CustomerActivityService } from "../../services/CustomerActivityService";
//import { CustomerService } from "../../services/CustomerService";
// import { LoginLogService } from "../../services/LoginLogService";
// import { OtpService } from "../../services/OtpService";
 import { ImageService } from '../../services/ImageService';
import { S3Service } from '../../services/S3Service';
// import { parse } from "json2csv";
import moment = require('moment/moment');
import { MigrationService } from "../../common/MigrationService";
import  fs  = require('fs');
import { ProductImageService } from "../../services/ProductImageService";
import { ProductService } from "../../services/ProductService";
import { ProductVideoService } from "../../services/ProductVideoService";


@JsonController('/data-migration/users')
export class DataMigrationController {
     constructor(
          // private customerService: CustomerService,
          // private otpService: OtpService,
          private _m: CommonService,
          //private customerController: CustomerController,
          // private _message : OtpTemplateService,
          // private customerActivityService: CustomerActivityService,
          // private loginLogService: LoginLogService,
          // private accessTokenService: AccessTokenService
          private imageService : ImageService,
          private customerService: CustomerService,
          private emailTemplateService: EmailTemplateService,
          private settingService: SettingService,
          private s3Service: S3Service,
          private _migration : MigrationService,
          private addressService : AddressService,
          private dataMigrationService : DataMigrationService,
          private _productImageService: ProductImageService,
          private _productService: ProductService,
          private _productVideoService: ProductVideoService


     ) { }



     // Import Users
     /**
      * @api {post} /api/data-migration/secure/import-users Import Users
      * @apiGroup Data Migration
      * @apiParam (Request body) {File} file File
      * @apiSuccessExample {json} Success
      * HTTP/1.1 200 OK
      * {
      *      "message": "Successfully saved XLS data",
      *      "status": "200"
      *      "data" : "{
      *           "Inserted" : "23 rows of 57",
      *           "failed" : "24 rows of 57",
      *           "failed_record_path" : "https:amazon/filename.xls"
      *        }"
      * }
      * @apiSampleRequest /api/data-migration/secure/import-users
      * @apiErrorExample {json} GenerateError error
      * HTTP/1.1 500 Internal Server Error
      */
     @Post('/secure/import-users')
     public async importUserData(@UploadedFile('file') files: any, @Res() res: any): Promise<any> {
          const csv = require("csvtojson");
          let b = files.originalname;

          if (files.mimetype == "text/csv" && b.substring(b.lastIndexOf("."), b.length) == ".csv") {
               let _j = await csv().fromString((files.buffer).toString());
               if (_j.length > 0) {
                    
                    let _executionOver = await this._doRegister(_j);
                    let filePath = "";
                    if(_executionOver.failedRecord.length > 0){
                         filePath = await this._migration._doCreateCSVOnS3(_executionOver.failedRecord,files.originalname,'user');
                    }else{
                         filePath = "NA";
                    }
                    
                    
                    if(filePath){
                         let _json = {
                              "success": _executionOver.successRecord.length,
                              "failed": _executionOver.failedRecord.length,
                              "downloadFailedRecords": filePath
                         };
                         return res.status(200).send(await this._m.getMessage('200', _json)).end();
                    }
               }
          } else {
               return res.status(200).send(await this._m.getMessage('500', '', 'Invalid file.')).end();
          }
     }



     public async _doRegister(_j: any): Promise<any> {
          let failedJson = [];
          let successJson = [];
          let counter = 0;
          let cloneArray = JSON.parse(JSON.stringify(_j));
          


          for (let inc = 0; inc < _j.length; inc++) {
               
               counter += 1;

               if(_j[inc]['Email Id'] == "" && _j[inc]["Mobile Number"] == ""){
                    continue;
               }

               Object.assign(_j[inc], { "password": "MigUserRedchief@2023", "confirmPassword": "MigUserRedchief@2023", 'mailStatus': 0, 'customerGroupId': 1, 'status': 1 });
               if(_j[inc]["profile_image"]!="#N/A" && _j[inc]["profile_image"]!=""){
               var avatar = _j[inc]["profile_image"];//_j[inc].avatar;
               }
               /*if(_j[inc]["profile_image"]!=""){
                    var avatar = _j[inc]["profile_image"];//_j[inc].avatar;
                    }*/
               //var imagebuffer;
               var base64Data ;
               //var params;
               const newCustomer: any = new Customer();
               if(false){
               const resultUser = await this.customerService.findOne({ where: { email: _j[inc]['Email Id'], deleteFlag: 0 } });
               if (resultUser) {
                    Object.assign(cloneArray[inc], { 'message': 'A Customer is already registered with this email Id' });
                    failedJson.push(cloneArray[inc]);

                    continue;
               }
               
               const resultUserMobile = await this.customerService.findOne({ where: { mobileNumber: _j[inc]['Mobile Number'], deleteFlag: 0 } });
               if (resultUserMobile) {

                    Object.assign(cloneArray[inc], { 'message': 'A Customer is already registered with this mobile' });
                    failedJson.push(cloneArray[inc]);

                    continue;
               }
          }

               if (false && avatar) {
                    //const type = avatar.split(';')[0].split('/')[1];
                    const type = avatar.split('/')[1].split('.')[1];
                    const availableTypes = env.availImageTypes.split(',');
                    if (!availableTypes.includes(type)) {
                         Object.assign(cloneArray[inc], { 'message': 'Only ' + env.availImageTypes + ' types are allowed' });
                         failedJson.push(cloneArray[inc]);
                    }
                    const name = 'Img_' + Date.now() + '.' + type;
                    //const s3 = new AWS.S3();
                    const path = 'customer/';
                    let th = this;
                    fs.readFile(__dirname+ '/'+_j[inc]["profile_image"], (err: any, imagedata: any)=>{
                         if (err) {
                              throw err;
                         }
                            base64Data=new Buffer(imagedata).toString('base64');
                            if (env.imageserver === 's3') {
                               th.s3Service.imageUpload((path + name), base64Data, type);
                          } else {
                               th.imageService.imageUpload((path + name), base64Data);
                          }


                       });
                    newCustomer.avatar = name;
                    newCustomer.avatarPath = path;
                   
               }


               if (_j[inc].password === _j[inc].confirmPassword) {
                    
                   
                    const password = await User.hashPassword(_j[inc].password);
                       
                    newCustomer.customerGroupId = _j[inc].customerGroupId;
                    
                    
                   var lastname= _j[inc]['Customer Name'].split(' ')[1];
                   var firstname= _j[inc]['Customer Name'].split(' ')[0];
                   newCustomer.firstName = firstname;
                   if(lastname==undefined){
                    newCustomer.lastName = _j[inc]['Customer Name'];
                   }else{
                    newCustomer.lastName = lastname;
                   }
                    newCustomer.username = _j[inc]['User Name'];
                    newCustomer.email = _j[inc]['Email Id'];
                    newCustomer.mobileNumber = _j[inc]['Mobile Number'];
                    newCustomer.password = password;
                    newCustomer.mailStatus = _j[inc].mailStatus;
                    newCustomer.deleteFlag = 0;
                    newCustomer.isActive = _j[inc].status;
                    newCustomer.gender = _j[inc]["Gender"];
                    newCustomer.migUserActive = 0


                    newCustomer.oldUserId = _j[inc]['Email Id'];
                    
                    if(false && _j[inc]['Date Of Registration']!="#N/A" && _j[inc]['Date Of Registration']!=""){
                    newCustomer.userCreationDate = moment(new Date(_j[inc]['Date Of Registration'])).format('YYYY-MM-DD HH:mm:ss');
                    }
                    newCustomer.userCreationDate = _j[inc]['Date Of Registration']
                    newCustomer.city = _j[inc]['city'];
                    newCustomer.state = _j[inc]['state'];
                    newCustomer.pincode = _j[inc]['pincode'];
                    newCustomer.address = _j[inc]['address'];
                    if(false && _j[inc]['dob']!="#N/A" && _j[inc]['dob']!=""){
                    newCustomer.DOB = moment(new Date(_j[inc]['dob'])).format('YYYY-MM-DD HH:mm:ss');
                    }
                    /*if(_j[inc]['dob']!=""){
                         newCustomer.DOB = moment(new Date(_j[inc]['dob'])).format('YYYY-MM-DD HH:mm:ss');
                         }*/


                    

                    
                    const customerSave = await this.customerService.create(newCustomer);
                    if (false && customerSave) {

                         successJson.push(_j[inc]);

                         if (_j[inc].mailStatus === 1) {
                              const emailContent = await this.emailTemplateService.findOne(4);
                              const logo = await this.settingService.findOne();
                              const message = emailContent.content.replace('{name}', _j[inc].username).replace('{username}', _j[inc].email).replace('{password}', _j[inc].password);
                              const redirectUrl = env.storeRedirectUrl;
                              MAILService.customerLoginMail(logo, message, _j[inc].email, emailContent.subject, redirectUrl);

                         }
                    }
               }
          }
          if (counter == ((_j.length))) {
               let _newJ = {
                    "totalRecord": _j.length,
                    "failedRecord": failedJson,
                    "successRecord": successJson
               };
               return Promise.resolve(_newJ);
          }
     }


      // Import Users
     /**
      * @api {post} /api/data-migration/secure/map-address-to-customer Import Users
      * @apiGroup Data Migration
      * @apiParam (Request body) {String} oldOrderId old order id
      * @apiSuccessExample {json} Success
      * HTTP/1.1 200 OK
      * {
      *      "message": "Successfully saved XLS data",
      *      "status": "200"
      *      "data" : "{
      *           "Inserted" : "23 rows of 57",
      *           "failed" : "24 rows of 57",
      *           "failed_record_path" : "https:amazon/filename.xls"
      *        }"
      * }
      * @apiSampleRequest /api/data-migration/secure/map-address-to-customer
      * @apiErrorExample {json} GenerateError error
      * HTTP/1.1 500 Internal Server Error
      */
     @Post('/secure/map-address-to-customer')
     public async mapAddressToCustomer(@Body({ validate: true }) rawData:any = {}, @Res() res: any): Promise<any> {
          let orderId=rawData.oldOrderId;
          let orderdata = await this.dataMigrationService.findAllOrder(orderId);
          var order=JSON.parse(JSON.stringify(orderdata));
          let originalArray = JSON.parse(JSON.stringify(orderdata));
         let insertedData = [];

          for (let i = 0; i < order.length; i++) {
               if(!insertedData.includes(order[i].customer_id)){
                    insertedData.push(order[i].customer_id);

                    let _filterArray = originalArray.filter((x: any) => {
                         return x["customer_id"] == order[i].customer_id;
                     });
                    
                     let uniqueAddressData = _filterArray.filter((orderData: any,index: any)=> {
      
                        return _filterArray.findIndex((x: any)=>{
                              return (x.shipping_address_1==orderData.shipping_address_1) && (x.shipping_firstname==orderData.shipping_firstname); 
                         })==index;

                     });
                     for(var inc = 0; inc < uniqueAddressData.length; inc++){

                         const addressData = await this.addressService.find({
                               where: {
                                    customerId: uniqueAddressData[inc].customer_id,
                                    firstName:uniqueAddressData[inc].shipping_firstname,
                                    address1:uniqueAddressData[inc].shipping_address_1,
                               },
                           });
                       if(addressData.length==0){
                         const newAddress = new Address();
                         newAddress.customerId = uniqueAddressData[inc].customer_id;
                         newAddress.firstName = uniqueAddressData[inc].shipping_firstname;
                         newAddress.lastName = uniqueAddressData[inc].shipping_lastname;
                         newAddress.address1 = uniqueAddressData[inc].shipping_address_1;
                         newAddress.address2 = uniqueAddressData[inc].shipping_address_2;
                         newAddress.city = uniqueAddressData[inc].shipping_city;
                         newAddress.state = uniqueAddressData[inc].shipping_zone;
                         newAddress.postcode = uniqueAddressData[inc].shipping_postcode;
                         newAddress.company = (uniqueAddressData[inc].shipping_firstname)+" "+(uniqueAddressData[inc].shipping_lastname);
                         newAddress.addressType = 1;
                         newAddress.countryId = 99;
                         newAddress.isActive =1;
                          await this.addressService.create(newAddress);
                       }else{
                         continue;

                       }
                     }

               }
          }
         
     }

     @Post('/secure/mapImagesToProduct')
     @Authorized()
     public async mapImagesToProduct(@UploadedFile('file') files: any, @Res() res: any): Promise<any> {
          const currentDate = new Date();
          let timeString = currentDate.getDate() + "-" + (currentDate.getMonth() + 1) + "-" + currentDate.getFullYear() + "-" + currentDate.getHours() + ":" + currentDate.getMinutes();
          var logger = fs.createWriteStream('logs/update-product-images-logs.txt')
          var writeLine = (line) => logger.write(`\n${line}`);
          const csv = require("csvtojson");
          let b = files.originalname;

          if (files.mimetype == "text/csv" && b.substring(b.lastIndexOf("."), b.length) == ".csv") {
               let _j = await csv().fromString((files.buffer).toString());
               let isAvailableUpc:any[]=[]
               let imageDefault=0
               if (_j.length > 0) {
                    for(let i=0; i<_j.length; i++){
                         let productId:any
                         
                         if(!isAvailableUpc.some(item=>item.upc==_j[i].UPC)){
                         const productData = await this._productService.findOne({where: {upc:_j[i].UPC}})
                         productId = productData && productData.productId
                         if(_j[i].type=='image'){
                         await this._productImageService.deleteProduct(productId)
                         }
                         if(_j[i].type=='video'){
                         await this._productVideoService.delete({productId})
                         }
                         isAvailableUpc.push({upc:_j[i].UPC, productId})
                         imageDefault=1
                         }else{
                         productId=isAvailableUpc.filter(item=>item.upc==_j[i].UPC)[0].productId
                         imageDefault=0
                         if(_j[i].type=='video'){
                         await this._productVideoService.delete({productId})
                         }
                         }
                         if(productId){
                         if(_j[i].type=='image'){
                         const newProductImage:any={}
                         newProductImage.productId = productId;
                         newProductImage.image = _j[i].name;
                         newProductImage.containerName = 'migProductImages/';
                         newProductImage.defaultImage = imageDefault;
                         await this._productImageService.create(newProductImage)
                         }else if(_j[i].type=='video'){
                              const productVideo:any={}
                              productVideo.productId = productId;
                              productVideo.name = _j[i].name;
                              productVideo.path = 'video/';
                              productVideo.type = 1;
                              await this._productVideoService.create(productVideo)
                         }else{
                              writeLine(`ERROR - UPC: ${_j[i].UPC} Message:- UPC not found [${timeString}]`);     
                         }
                         writeLine(`SUCCESS - UPC: ${_j[i].UPC} Message: Product successfully updated [${timeString}]`);
                         }else{
                         writeLine(`ERROR - UPC: ${_j[i].UPC} Message: UPC not found [${timeString}]`);
                         }
                    };
                    return {
                         status:200,
                         message:'Product Updated Successfully, Please download logs file and check',
                         data:null
                    }
          } else {
               return res.status(200).send(await this._m.getMessage('500', '', 'Invalid file.')).end();
          }
     }
     }

     @Post('/secure/mapImagesToProductDelete')
     @Authorized()
     public async mapImagesToProductDelete(@UploadedFile('file') files: any, @Res() res: any): Promise<any> {
          const csv = require("csvtojson");
          let b = files.originalname;

          if (files.mimetype == "text/csv" && b.substring(b.lastIndexOf("."), b.length) == ".csv") {
               let _j = await csv().fromString((files.buffer).toString());
               if (_j.length > 0) {
                    let count=0
                    _j.forEach(async (element:any) => {
                         const productId:any = await this._productService.findOne({where: {upc:element.UPC}})
                         try{
                         await this._productImageService.deleteProduct(productId)
                         count++
                         }catch{
                         }
                    });
                    return "Delete record "+count
          } else {
               return res.status(200).send(await this._m.getMessage('500', '', 'Invalid file.')).end();
          }
     }
     }

}
