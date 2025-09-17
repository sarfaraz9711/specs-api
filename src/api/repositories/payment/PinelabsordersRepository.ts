
import { Pinelabsorders } from '../../models/PineLabs/Pinelabsorders';
import {EntityRepository, Repository} from 'typeorm';

@EntityRepository(Pinelabsorders)
export class PinelabsordersRepository extends Repository<Pinelabsorders>{
    
}
