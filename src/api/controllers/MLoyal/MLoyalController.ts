import 'reflect-metadata';
import { Req, JsonController, Post, Res, Body } from 'routing-controllers';
//import { CommonService } from "../../common/commonService";
//import { Body } from 'routing-controllers';
//import { ImageService } from '../../services/ImageService';
//import * as path from 'path';

@JsonController('/m-loyal')
export class MLoyalController {
   constructor(
     // private _m: CommonService,
   ) { }

   // Create M Loyal Customer Registration Action
   /**
    * @api {post} /api/m-loyal/INSERT_CUSTOMER_REGISTRATION_ACTION Insert Customer registration Action
    * @apiGroup M loyal
    * @apiSuccessExample {json} Success
    * HTTP/1.1 200 OK
    * {
    *      "message": "Successfully updated",
    *      "status": "200",
    *      "data" : {}
    * }
    * @apiSampleRequest /api/m-loyal/INSERT_CUSTOMER_REGISTRATION_ACTION
    * @apiErrorExample {json} M Loyal Customer Registration Action Insert error
    * HTTP/1.1 500 Internal Server Error
    */

   @Post('/INSERT_CUSTOMER_REGISTRATION_ACTION')
   public async createCustomerRegistrationAction(@Req() rowdata: any, @Res() res: any): Promise<any> {
    let userId=process.env.USER_ID;
    let password=process.env.MLOYAL_PASSWORD;
    

    const axios = require('axios')
    let json =rowdata.body;
    var response=[];
    var config = {
        method: 'post',
        url: "https://redchief.mloyalcapture.com/service.svc/INSERT_CUSTOMER_REGISTRATION_ACTION",
        headers:  {
          "userid": userId,
          "pwd": password,
          "Content-Length" : (JSON.stringify(json)).length,
          "Content-Type" : "application/json; charset=utf-8"
        },
        data: JSON.stringify(json)
      };
    
        await axios(config).then((res)=>{
          response.push(res.data);
        }).catch((error)=>{

        })
        let responsedata=response[0]
        return res.status(200).send(responsedata);
  }

// Update M Loyal Customer Registration Action
   /**
    * @api {post} /api/m-loyal/UPDATE_CUSTOMER_REGISTRATION Update Customer registration Action
    * @apiGroup M loyal
    * @apiSuccessExample {json} Success
    * HTTP/1.1 200 OK
    * {
    *      "message": "Successfully updated",
    *      "status": "200",
    *      "data" : {}
    * }
    * @apiSampleRequest /api/m-loyal/UPDATE_CUSTOMER_REGISTRATION
    * @apiErrorExample {json} M Loyal Customer Registration Action Update error
    * HTTP/1.1 500 Internal Server Error
    */

  @Post('/UPDATE_CUSTOMER_REGISTRATION')
   public async updateCustomerRegistration(@Req() rowdata: any, @Res() res: any): Promise<any> {
    let userId=process.env.USER_ID;
    let password=process.env.MLOYAL_PASSWORD;
    const axios = require('axios')
    let json =rowdata.body;
    var response=[];
    var config = {
        method: 'post',
        url: "https://redchief.mloyalcapture.com/service.svc/UPDATE_CUSTOMER_REGISTRATION",
        headers:  {
          "userid": userId,
          "pwd": password,
          "Content-Length" : (JSON.stringify(json)).length,
          "Content-Type" : "application/json; charset=utf-8"
        },
        data: JSON.stringify(json)
      };
    
        await axios(config).then((res)=>{
          response.push(res.data);
        }).catch((error)=>{
          //console.error("Error<<<<<<<<<<<<<<_______++++++++++",error);

        })
        let responsedata=response[0]
        return res.status(200).send(responsedata);
   } 

   // Get Customer Transaction info
   /**
    * @api {post} /api/m-loyal/GET_CUSTOMER_TRANS_INFO Customer Transaction info
    * @apiGroup M loyal
    * @apiSuccessExample {json} Success
    * HTTP/1.1 200 OK
    * {
    *      "message": "Successfully get Customer Transaction info",
    *      "status": "200",
    *      "data" : {}
    * }
    * @apiSampleRequest /api/m-loyal/GET_CUSTOMER_TRANS_INFO
    * @apiErrorExample {json} get customer transaction info error
    * HTTP/1.1 500 Internal Server Error
    */

   @Post('/GET_CUSTOMER_TRANS_INFO')
   public async getCustomerTransactionInfo(@Req() rowdata: any, @Res() res: any): Promise<any> {
     let userId=process.env.USER_ID;
     let password=process.env.MLOYAL_PASSWORD;
    const axios = require('axios')
    let json =rowdata.body;
    var response=[];
    var config = {
        method: 'post',
        url: "https://redchief.mloyalcapture.com/service.svc/GET_CUSTOMER_TRANS_INFO",
        headers:  {
          "userid": userId,
          "pwd": password,
          "Content-Length" : (JSON.stringify(json)).length,
          "Content-Type" : "application/json; charset=utf-8"
        },
        data: JSON.stringify(json)
      };
        await axios(config).then((res)=>{
          response.push(res.data);
        }).catch((error)=>{
          //console.error("Error<<<<<<<<<<<<<<_______++++++++++",error);

        })
        let responsedata=response[0]
        return res.status(200).send(responsedata);
   } 

   // Reverse point by transaction
   /**
    * @api {post} /api/m-loyal/REVERSE_POINTS_BY_TRANSACTION_ID Reverse point by transaction id
    * @apiGroup M loyal
    * @apiSuccessExample {json} Success
    * HTTP/1.1 200 OK
    * {
    *      "message": "Successfully Reverse point by transaction id",
    *      "status": "200",
    *      "data" : {}
    * }
    * @apiSampleRequest /api/m-loyal/REVERSE_POINTS_BY_TRANSACTION_ID
    * @apiErrorExample {json} Reverse point by transaction id error
    * HTTP/1.1 500 Internal Server Error
    */
   @Post('/REVERSE_POINTS_BY_TRANSACTION_ID')
   public async reversePointByTransactionId(@Body() rowdata: any): Promise<any> {
    let userId=process.env.USER_ID;
    let password=process.env.MLOYAL_PASSWORD;
    const axios = require('axios')
    let json =rowdata;
    var response=[];
    var config = {
        method: 'post',
        url: "https://redchief.mloyalcapture.com/service.svc/REVERSE_POINTS_BY_TRANSACTION_ID",
        headers:  {
          "userid": userId,
          "pwd": password,
          "Content-Length" : (JSON.stringify(json)).length,
          "Content-Type" : "application/json; charset=utf-8"
        },
        data: JSON.stringify(json)
      };
    
        await axios(config).then((res)=>{
          response.push(res.data);
        }).catch((error)=>{

        })
        let responsedata=response[0]
        return responsedata
   } 


   // Reverse coupon by transaction id
   /**
    * @api {post} /api/m-loyal/REVERSE_COUPON_BY_TRANSACTION_ID Reverse coupon by transaction id
    * @apiGroup M loyal
    * @apiSuccessExample {json} Success
    * HTTP/1.1 200 OK
    * {
    *      "message": "Successfully Reverse point by transaction id",
    *      "status": "200",
    *      "data" : {}
    * }
    * @apiSampleRequest /api/m-loyal/REVERSE_COUPON_BY_TRANSACTION_ID
    * @apiErrorExample {json} Reverse coupon by transaction id error
    * HTTP/1.1 500 Internal Server Error
    */
   @Post('/REVERSE_COUPON_BY_TRANSACTION_ID')
   public async reverseCouponByTransactionId(@Req() rowdata: any, @Res() res: any): Promise<any> {

    let userId=process.env.USER_ID;
    let password=process.env.MLOYAL_PASSWORD;
    const axios = require('axios')
    let json =rowdata.body;
    var response=[];
    var config = {
        method: 'post',
        url: "https://redchief.mloyalcapture.com/service.svc/REVERSE_COUPON_BY_TRANSACTION_ID",
        headers:  {
          "userid": userId,
          "pwd": password,
          "Content-Length" : (JSON.stringify(json)).length,
          "Content-Type" : "application/json; charset=utf-8"
        },
        data: JSON.stringify(json)
      };
    
        await axios(config).then((res)=>{
          response.push(res.data);
        }).catch((error)=>{

        })
        let responsedata=response[0]
        return res.status(200).send(responsedata);
   } 


   // insert item data
   /**
    * @api {post} /api/m-loyal/INSERT_ITEM_DATA Insert item data
    * @apiGroup M loyal
    * @apiSuccessExample {json} Success
    * HTTP/1.1 200 OK
    * {
    *      "message": "Successfully Reverse point by transaction id",
    *      "status": "200",
    *      "data" : {}
    * }
    * @apiSampleRequest /api/m-loyal/INSERT_ITEM_DATA
    * @apiErrorExample {json} Insert item data error
    * HTTP/1.1 500 Internal Server Error
    */
   @Post('/INSERT_ITEM_DATA')
   public async insertItemData(@Req() rowdata: any, @Res() res: any): Promise<any> {

    let userId=process.env.USER_ID;
    let password=process.env.MLOYAL_PASSWORD;
    const axios = require('axios')
    let json =rowdata.body;
    var response=[];
    var config = {
        method: 'post',
        url: "https://redchief.mloyalcapture.com/service.svc/INSERT_ITEM_DATA",
        headers:  {
          "userid": userId,
          "pwd": password,
          "Content-Length" : (JSON.stringify(json)).length,
          "Content-Type" : "application/json; charset=utf-8"
        },
        data: JSON.stringify(json)
      };
    
        await axios(config).then((res)=>{
          response.push(res.data);
        }).catch((error)=>{

        })
        let responsedata=response[0]
        return res.status(200).send(responsedata);
   } 

// GET PROMOTIONAL STATIC UNIQUE COUPON VALIDATION INFO 
   /**
    * @api {post} /api/m-loyal/GET_PROMOTIONAL_STATIC_UNIQUE_COUPON_VALIDATION_INFO GET PROMOTIONAL STATIC UNIQUE COUPON VALIDATION INFO 
    * @apiGroup M loyal
    * @apiSuccessExample {json} Success
    * HTTP/1.1 200 OK
    * {
    *      "message": "Successfully Reverse point by transaction id",
    *      "status": "200",
    *      "data" : {}
    * }
    * @apiSampleRequest /api/m-loyal/GET_PROMOTIONAL_STATIC_UNIQUE_COUPON_VALIDATION_INFO
    * @apiErrorExample {json} GET PROMOTIONAL STATIC UNIQUE COUPON VALIDATION INFO  error
    * HTTP/1.1 500 Internal Server Error
    */
   @Post('/GET_PROMOTIONAL_STATIC_UNIQUE_COUPON_VALIDATION_INFO')
   public async getPromotionalStaticUniqueCouponValidationInfo(@Req() rowdata: any, @Res() res: any): Promise<any> {

    let userId=process.env.USER_ID;
    let password=process.env.MLOYAL_PASSWORD;
    const axios = require('axios')
    let json =rowdata.body;
    var response=[];
    var config = {
        method: 'post',
        url: "https://redchief.mloyalcapture.com/service.svc/GET_PROMOTIONAL_STATIC_UNIQUE_COUPON_VALIDATION_INFO",
        headers:  {
          "userid": userId,
          "pwd": password,
          "Content-Length" : (JSON.stringify(json)).length,
          "Content-Type" : "application/json; charset=utf-8"
        },
        data: JSON.stringify(json)
      };
    
        await axios(config).then((res)=>{
          response.push(res.data);
        }).catch((error)=>{

        })
        let responsedata=response[0]
        return res.status(200).send(responsedata);
   }
   
   // GET POINTS VALIDATION INFO 
   /**
    * @api {post} /api/m-loyal/GET_POINTS_VALIDATION_INFO GET POINTS VALIDATION INFO 
    * @apiGroup M loyal
    * @apiSuccessExample {json} Success
    * HTTP/1.1 200 OK
    * {
    *      "message": "Successfully Reverse point by transaction id",
    *      "status": "200",
    *      "data" : {}
    * }
    * @apiSampleRequest /api/m-loyal/GET_POINTS_VALIDATION_INFO
    * @apiErrorExample {json} GET POINTS VALIDATION INFO  error
    * HTTP/1.1 500 Internal Server Error
    */
   @Post('/GET_POINTS_VALIDATION_INFO')
   public async getPointValidationInfo(@Req() rowdata: any, @Res() res: any): Promise<any> {

    let userId=process.env.USER_ID;
    let password=process.env.MLOYAL_PASSWORD;
    const axios = require('axios')
    let json =rowdata.body;
    var response=[];
    var config = {
        method: 'post',
        url: "https://redchief.mloyalcapture.com/service.svc/GET_POINTS_VALIDATION_INFO",
        headers:  {
          "userid": userId,
          "pwd": password,
          "Content-Length" : (JSON.stringify(json)).length,
          "Content-Type" : "application/json; charset=utf-8"
        },
        data: JSON.stringify(json)
      };
    
        await axios(config).then((res)=>{
          response.push(res.data);
        }).catch((error)=>{

        })
        let responsedata=response[0]
        return res.status(200).send(responsedata);
   }

   // REDEEM LOYALTY POINTS ACTION
   /**
    * @api {post} /api/m-loyal/REDEEM_LOYALTY_POINTS_ACTION REDEEM_LOYALTY_POINTS_ACTION
    * @apiGroup M loyal
    * @apiSuccessExample {json} Success
    * HTTP/1.1 200 OK
    * {
    *      "message": "Successfully Reverse point by transaction id",
    *      "status": "200",
    *      "data" : {}
    * }
    * @apiSampleRequest /api/m-loyal/REDEEM_LOYALTY_POINTS_ACTION
    * @apiErrorExample {json} REDEEM_LOYALTY_POINTS_ACTION  error
    * HTTP/1.1 500 Internal Server Error
    */
   @Post('/REDEEM_LOYALTY_POINTS_ACTION')
   public async redeemLoyalityPointAction(@Req() rowdata: any, @Res() res: any): Promise<any> {

    let userId=process.env.USER_ID;
    let password=process.env.MLOYAL_PASSWORD;
    const axios = require('axios')
    let json =rowdata.body;
    var response=[];
    var config = {
        method: 'post',
        url: "https://redchief.mloyalcapture.com/service.svc/REDEEM_LOYALTY_POINTS_ACTION",
        headers:  {
          "userid": userId,
          "pwd": password,
          "Content-Length" : (JSON.stringify(json)).length,
          "Content-Type" : "application/json; charset=utf-8"
        },
        data: JSON.stringify(json)
      };
    
        await axios(config).then((res)=>{
          response.push(res.data);
        }).catch((error)=>{

        })
        let responsedata=response[0]
        return res.status(200).send(responsedata);
   }

   // INSERT_BILLING_DATA_ACTION
   /**
    * @api {post} /api/m-loyal/INSERT_BILLING_DATA_ACTION INSERT_BILLING_DATA_ACTION
    * @apiGroup M loyal
    * @apiSuccessExample {json} Success
    * HTTP/1.1 200 OK
    * {
    *      "message": "Successfully INSERT BILLING DATA ACTION",
    *      "status": "200",
    *      "data" : {}
    * }
    * @apiSampleRequest /api/m-loyal/INSERT_BILLING_DATA_ACTION
    * @apiErrorExample {json} INSERT_BILLING_DATA_ACTION  error
    * HTTP/1.1 500 Internal Server Error
    */
   @Post('/INSERT_BILLING_DATA_ACTION')
   public async insertBillingDataAction(@Req() rowdata: any, @Res() res: any): Promise<any> {

    let userId=process.env.USER_ID;
    let password=process.env.MLOYAL_PASSWORD;
    const axios = require('axios')
    let json =rowdata.body;
    var response=[];
    var config = {
        method: 'post',
        url: "https://redchief.mloyalcapture.com/service.svc/INSERT_BILLING_DATA_ACTION",
        headers:  {
          "userid": userId,
          "pwd": password,
          "Content-Length" : (JSON.stringify(json)).length,
          "Content-Type" : "application/json; charset=utf-8"
        },
        data: JSON.stringify(json)
      };
    
        await axios(config).then((res)=>{
          response.push(res.data);
        }).catch((error)=>{

        })
        let responsedata=response[0]
        return res.status(200).send(responsedata);
   }

 
}

