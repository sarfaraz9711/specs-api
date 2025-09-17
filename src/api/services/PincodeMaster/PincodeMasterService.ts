/*
 * spurtcommerce API
 * version 3.0.1
 * Copyright (c) 2019 piccosoft ltd
 * Author piccosoft ltd <support@piccosoft.com>
 * Licensed under the MIT license.
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
// import { Logger, LoggerInterface } from '../../decorators/Logger';
//import { Pincode } from '../../../../models/Business/PincodeMaster/Pincode';
//import { getManager } from 'typeorm/index';
//import { getManager } from 'typeorm/index';
//import { District } from '../../models/PincodeMaster/TmDistrict';

import { PincodeRepository } from '../../repositories/PincodeMaster/PincodeMasterRepository';
import { DistrictRepository } from '../../repositories/PincodeMaster/DistrictRepository';
import { SubDistrictRepository } from '../../repositories/PincodeMaster/SubDistrictRepository';
import { StateRepository } from '../../repositories/PincodeMaster/StateRepository';

@Service()
export class PincodeService {

    constructor(
        @OrmRepository() private pincodeRepository: PincodeRepository,
        @OrmRepository() private districtRepository: DistrictRepository,
        @OrmRepository() private subDistrictRepository: SubDistrictRepository,
        @OrmRepository() private stateRepository: StateRepository,


		// @Logger(__filename) private log: LoggerInterface
    ) { }

    
	 // pincode list
    public list(pincode:any): Promise<any> {
            let pincodedata= this.pincodeRepository.createQueryBuilder()
            .select("pincode_id,pincode,district_code,district_name,state_code,state_name,taluka_name")
      .where(" pincode= :pincode", { pincode:pincode  }).execute()
      return pincodedata;
    }

    public async districtdata(statecode:any): Promise<any> {
      
       let districtdata= this.districtRepository.createQueryBuilder().select('district_code,district_name')
       .where(" state_code_fk= :state_code_fk", { state_code_fk:statecode  }).execute()
       return districtdata;      
}

public async subdistrictdata(districtcode:any): Promise<any> {
  let subDistrictdata= this.subDistrictRepository.createQueryBuilder().select('sub_district_name')
  .where(" district_code_fk= :district_code_fk", { district_code_fk:districtcode  }).execute()
  return subDistrictdata; 

   
}

public async findAllState(): Promise<any> {
  return this.stateRepository.find(); 
}

public async findState(stateName:any): Promise<any> {
  //return this.stateRepository.find(); 

  let statedata= this.stateRepository.createQueryBuilder().select('state_ut_name')
       .where(" state_ut_name= :state_ut_name", { state_ut_name:stateName  }).execute()
       return statedata; 
}

public async findSubDistrict(stateName:any): Promise<any> {
  //return this.stateRepository.find(); 

  let subdistrictdata= this.subDistrictRepository.createQueryBuilder().select('sub_district_name,sub_district_id')
       .where(" sub_district_name= :sub_district_name", { sub_district_name:stateName  }).execute()
       return subdistrictdata; 
}



public async stateCityData(stateName:any,cityName:any): Promise<any> {

   //let data = await getManager().query(`SELECT district_id FROM rc2_new.tm_state_ut INNER JOIN rc2_new.tm_district  ON tm_state_ut.state_ut_code = tm_district.state_code_fk where lower(rc2_new.tm_state_ut.state_ut_name) = lower('${stateName}') AND rc2_new.tm_district.district_name = lower('${cityName}')`);

  

   const result = await this.stateRepository.createQueryBuilder('ptc')
        .select(['p.district_id as district_id'])
        .innerJoin('tm_district','p','ptc.state_ut_code=p.state_code_fk')
        .where('ptc.state_ut_name=:state',{state: stateName.toLowerCase()})
        .andWhere('p.district_name=:districtName',{districtName:cityName.toLowerCase()})
        .getRawMany();

        return result;
    }

  
}


   

