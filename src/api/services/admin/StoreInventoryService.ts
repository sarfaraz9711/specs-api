import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { TmStoreInventory } from '../../models/TmStoreInventry';
import { StoreInventoryRepository } from '../../repositories/StoreInventoryRepository';

@Service()
export class StoreInventoryService {
    constructor(
        @OrmRepository() private _storeInventory: StoreInventoryRepository) { }
		
	// create store inventory
    public async create(tmStoreInventory: TmStoreInventory): Promise<TmStoreInventory> {
        const newstoreInventoryData = await this._storeInventory.save(tmStoreInventory);
        return newstoreInventoryData;
    }
}
