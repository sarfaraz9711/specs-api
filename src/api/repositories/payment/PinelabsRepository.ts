import {EntityRepository, Repository} from 'typeorm';

import {Pinlabs} from "../../models/PineLabs/Pinelabs";

@EntityRepository(Pinlabs)
export class PinelabsRepository extends Repository<Pinlabs>{
    
}


