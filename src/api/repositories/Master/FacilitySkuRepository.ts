import { EntityRepository, Repository } from 'typeorm';
import { FacilitySkuModel } from '../../models/Master/FacilitySkuModel';

@EntityRepository(FacilitySkuModel)
export class FacilitySkuRepository extends Repository<FacilitySkuModel>  {

}