import { DeliveryPartenerModel } from '../../models/delivery/DeliveryTrackingModel';
import { EntityRepository, Repository } from 'typeorm';


@EntityRepository(DeliveryPartenerModel)
export class DeliveryPartenerRepository extends Repository<DeliveryPartenerModel>  {

}
