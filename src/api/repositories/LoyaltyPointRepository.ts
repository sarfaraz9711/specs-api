import { EntityRepository, Repository } from 'typeorm';
import {LoyaltyPoint} from '../models/LoyaltyPoint';

@EntityRepository(LoyaltyPoint)
export class LoyaltyPointRepository extends Repository<LoyaltyPoint>  {

}
