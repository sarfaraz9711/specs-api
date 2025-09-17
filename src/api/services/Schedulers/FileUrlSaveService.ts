import { FileUrlSaveRepository } from '../../repositories/Schedulers/FileUrlSaveRepository';
import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { FacilitySkuRepository } from '../../repositories/Master/FacilitySkuRepository';
import {env} from "../../../env"



@Service()
export class FileUrlSaveService {

    constructor(
        @OrmRepository() private _fileUrlSave: FileUrlSaveRepository,
        @OrmRepository() private _facilitySkuRepository: FacilitySkuRepository
        ){}

    public saveSchedulerFile = async (saveData:any):Promise<any>=>{
        let _m = await this._fileUrlSave.save(saveData);
        return _m;
    }

    public findOneLatest = async (type:any):Promise<any>=>{
        let _m = await this._fileUrlSave.findOne({
            where : [
                {moduleType : type}
            ],
            order : {
                Id : "DESC"
            }            
        });
        return _m;
    }

    public findfacilitycodeAll = async ():Promise<any>=>{
        const condition: any = {};
		condition.where = {};
        condition.where = {
            status:1,
        };
        return this._facilitySkuRepository.find(condition);
    }

    public findAllFacilitycode = async ():Promise<any>=>{
        //const condition: any = {};
        //condition.select = ["facilitycode"];
        const condition: any = {};
		condition.where = {};
        condition.where = {
            status:1,
        };
        return this._facilitySkuRepository.find(condition);
    }

    public findSkuBasedOnfacilitycode = async (facilityCode:any):Promise<any>=>{
        const condition: any = {};
		condition.where = {};
        condition.where = {
            facilityCode:facilityCode
        };
        return this._facilitySkuRepository.find(condition);
       // let o = await getManager().query('SELECT COUNT(sku) as skuCount FROM tm_facility_sku_mapping where facility_code='+facilityCode+' GROUP BY facility_code');
        //return o;
    }
    public addSkuBasedOnfacilitycode = async (facilityCode:any,sku:any):Promise<any>=>{
        const condition: any = {};
		condition.where = {};
        condition.where = {
            facilityCode:facilityCode,
            sku:sku
        };
        return this._facilitySkuRepository.find(condition);
    }

    public updatefacilitycodestatus = async (id:any):Promise<any>=>{
       await this._facilitySkuRepository.createQueryBuilder()
       .update()
       .set({ status: "0"})
       .where("id = :id", { id: id })
       .execute()
    }

    public addfacilitycode = async (data:any):Promise<any>=>{
        const newfacility = await this._facilitySkuRepository.save(data);
        return newfacility;

     }


     public callProcedureForUpdate = async ():Promise<any>=>{
        let timeDuration = env.procedureTimeDuration
        const _isDone = await this._facilitySkuRepository.query(`call SkuFacilityUpdate(${timeDuration})`);
        return _isDone;
     }

     public exportFacilitySku = async ():Promise<any>=>{
        const select = ['sku','facilityCode', 'Quantity','modifiedDate'];
        //const condition: any = {};
        //condition.select = ["facilitycode"];
        const condition: any = {};
        condition.select = select;
		condition.where = {};
        condition.where = {
            status:1,
        };
        return this._facilitySkuRepository.find(condition);
    }



}