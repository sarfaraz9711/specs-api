import { EntityRepository, Repository } from 'typeorm';
import { EcomModel } from '../models/delivery/EcomModel';

@EntityRepository(EcomModel)
export class EcomRepository extends Repository<EcomModel>  {

}