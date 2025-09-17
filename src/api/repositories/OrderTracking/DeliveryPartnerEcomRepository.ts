import { DeliveryPartenerEcomModel } from '../../models/delivery/DeliveryTrackingEcomModel';
import { EntityRepository, Repository } from 'typeorm';


@EntityRepository(DeliveryPartenerEcomModel)
export class DeliveryPartenerEcomRepository extends Repository<DeliveryPartenerEcomModel>  {

}
