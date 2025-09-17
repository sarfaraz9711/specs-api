import { EntityRepository, Repository } from 'typeorm';
import { OrderTrackingModel } from '../../models/OrderTrackingModel';

@EntityRepository(OrderTrackingModel)
export class OrderTrackingRepository extends Repository<OrderTrackingModel>  {

}
