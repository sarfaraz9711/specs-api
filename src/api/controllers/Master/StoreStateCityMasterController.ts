import 'reflect-metadata';
import {
    
    JsonController,
    Res,
    
    Req,
    Get,
    QueryParams
    //UseBefore
} from 'routing-controllers';

import { getManager } from 'typeorm';

import { StoreStateCityModel } from "../../models/Master/StoreStateCityModel";



//import { secureTokenChecks } from '../middlewares/SecureHandlerMiddleware';

@JsonController('/store_state_city_master')
export class StoreStateCityMasterController {

     @Get('/get-store-states')
     public async getStoreStates(@QueryParams() inputs: any , @Req() req: any, @Res() response: any): Promise<any> {
        
         const mapRepo = getManager().getRepository(StoreStateCityModel)
         const states = await mapRepo.createQueryBuilder("maps")
         .select(["maps.StoreState as stateName", "maps.StateCode as stateCode"])
         .distinct(true)
         .orderBy('stateName')
        .getRawMany();


         
             return response.status(200).send({
                status: 1,
                data: states,
                message: "Data found successfully"
             });
         
     }

     @Get('/get-store-city-by-state')
     public async getCityByState(@QueryParams() inputs: any , @Req() req: any, @Res() response: any): Promise<any> {
        const stateCode = inputs.stateCode;
         const mapRepo = getManager().getRepository(StoreStateCityModel)
         const cityData = await mapRepo.createQueryBuilder("maps")
         .select(["maps.CityName as cityName", "maps.CityCode as cityCode"])
         .distinct(true)
         .where('maps.StateCode = :sCode',  { sCode: stateCode})
         .orderBy('cityName')
        .getRawMany();


         
             return response.status(200).send({
                status: 1,
                data: cityData,
                message: "Data found successfully"
             });
         
     }

     @Get('/get-state-citye-by-pin-code')
     public async getStateCityByPinCode(@QueryParams() inputs: any , @Req() req: any, @Res() response: any): Promise<any> {
        const pinCode = inputs.pincode;
         const mapRepo = getManager().getRepository(StoreStateCityModel)
         const cityData = await mapRepo.createQueryBuilder("maps")
         .select(["maps.StateCode as stateCode, maps.StoreState as stateName, maps.DistrictName as districtName, maps.PinCode as pinCode, maps.CityName as cityName", "maps.CityCode as cityCode"])
         
         .where('maps.PinCode = :pCode',  { pCode: pinCode})
         
        .getRawOne();


         
             return response.status(200).send({
                status: 1,
                data: cityData,
                message: "Data found successfully"
             });
         
     }

}
