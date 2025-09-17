import { EntityRepository, Repository } from 'typeorm';
import { HundredOffOnPreProdOrder } from '../../models/Promotions/hundredOffOnPrepaidOrder';

@EntityRepository(HundredOffOnPreProdOrder)
export class HundredOffOnPreprodOrdersRepository extends Repository<HundredOffOnPreProdOrder>  {

}