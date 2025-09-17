import {EntityRepository, Repository} from 'typeorm';
import {Maps} from "../models/Maps";
@EntityRepository(Maps)
export class MapsRepository extends Repository<Maps>{
    
}
