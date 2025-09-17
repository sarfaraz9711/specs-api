import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { Maps } from '../../models/Maps';
import { MapsRepository } from '../../repositories/MapsRepository';


@Service()
export class MapService {
    constructor(
        @OrmRepository() private _m: MapsRepository) { }

    public async saveData(d: Maps): Promise<Maps> {
        const ls =  this._m.save(d);
        return ls;
    }

    public storeList = (limit: number, offset: number, count: number, isPinCode: any = "", isRequiredAll: any = false): Promise<any> => {
        const condition: any = {};
        condition.where = {};

        if (isPinCode != "ALL") {
            condition.where = { 'pincode': isPinCode };
        }
        if (limit && limit > 0) {
            condition.take = limit;
            condition.skip = offset;
        }
        if (isRequiredAll) {
            return this._m.find(condition);
        } else {
            return this._m.findOne(condition);
        }
    }
    public getStoresNearMe = async (lat: any = "", lng: any = ""): Promise<any> => {
        const maps = this._m.createQueryBuilder("m");
        maps.select("*");
        maps.addSelect('6371 * 2 * ASIN(SQRT(POWER(SIN((:latitude -abs(latitude)) * pi()/180 / 2),2) + COS(:latitude1 * pi()/180 ) * COS(abs(latitude) *  pi()/180) * POWER(SIN((:longitude - abs(longitude)) *  pi()/180 / 2), 2)))', "distance");
        maps.setParameter("latitude", lat);
        maps.setParameter("latitude1", lat);
        maps.setParameter("longitude", lng);
        maps.having("distance < 50");
        maps.getMany();
        let r = await maps.execute();
        return r;
    }

    public findOne(mapdata: any): Promise<any> {
        return this._m.findOne(mapdata);
    }

    public findLocation(maps: any): Promise<any> {
        return this._m.find(maps);
    }
	
	
    // store list
    public list(select: any = []): Promise<any> {
		const condition: any = {};
		 if (select && select.length > 0) {
            condition.select = select;
        }
        return this._m.find(condition);
    }
	
	// store list based on id
    public findStore(maps: any): Promise<any> {
        return this._m.find(maps);
    }
	
	
	
	
	 public async saveStoreData(d: Maps): Promise<Maps> {
        const ls = await this._m.save(d);
        return ls;
    }
	
	
}
