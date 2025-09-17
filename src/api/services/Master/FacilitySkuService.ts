import { Service } from "typedi";
import { OrmRepository } from "typeorm-typedi-extensions";
import { FacilitySkuRepository } from "../../repositories/Master/FacilitySkuRepository";

@Service()
export class FacilitySkuService {
     constructor(
        @OrmRepository() private _saveFacilitySku : FacilitySkuRepository
     ){}



    public saveFacilitySkuData = async (rawData:any) : Promise<any>=>{
        let _m = await this._saveFacilitySku.save(rawData);
        return _m;
    }
}