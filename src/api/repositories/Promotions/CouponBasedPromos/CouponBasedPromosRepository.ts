import { EntityRepository, Repository } from 'typeorm';
import { CouponBasedPromo } from '../../../models/Promotions/CouponBasedPromo/CouponBasedPromo';

@EntityRepository(CouponBasedPromo)
export class CouponBasedPromtionsRepository extends Repository<CouponBasedPromo>  {

}
