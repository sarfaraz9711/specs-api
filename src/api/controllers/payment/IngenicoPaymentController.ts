// import { Body, JsonController, Post, Res, Req } from 'routing-controllers';
// // import {IngenicoService} from '../../services/payment/IngenicoService';
// // import {CommonService} from '../../services/../common/commonService';

// @JsonController('/payment-ingenico')
// export class PaytmPaymentController {
//     constructor(
//         // private _ingenicoService: IngenicoService,
//         // private _commonService: CommonService
//     ) {
//     }

//     // @Get('/secure/create-token')
//     // public async createToken(@Res() response: any): Promise<any> {
//     //    let res =  await this._ingenicoService.createToken({name: "Neeraj"}, 'dummy');
//     //    return response.status(200).send(this._commonService.getMessage(200, res, "Get data successfully"));

//     // }

//     @Post('/secure/get-payment-response')
//     public async getPaymentResponse(@Body({ validate: true }) paymentResponse: any, @Res() response: any, @Req() request: any){

//     }
// }