
import { EntityRepository, Repository } from 'typeorm';
import { OrderReturn } from '../models/OrderReturn';

@EntityRepository(OrderReturn)
export class OrderReturnRepository extends Repository<OrderReturn>  {

}
