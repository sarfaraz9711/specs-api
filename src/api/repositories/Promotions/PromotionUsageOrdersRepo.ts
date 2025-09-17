import { EntityRepository, Repository } from 'typeorm';
import { PromotionsUsageOrders } from '../../models/Promotions/PromotionsUsageOrders';

@EntityRepository(PromotionsUsageOrders)
export class PromotionsUsageOrdersRepository extends Repository<PromotionsUsageOrders>  {

}
