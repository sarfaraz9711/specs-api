import { EntityRepository, Repository } from 'typeorm';
import { FreeProductsPromtions } from '../../../models/Promotions/FreeProducts/FreeProductsPromotions';

@EntityRepository(FreeProductsPromtions)
export class FreeProductsPromtionsRepository extends Repository<FreeProductsPromtions>  {

}
