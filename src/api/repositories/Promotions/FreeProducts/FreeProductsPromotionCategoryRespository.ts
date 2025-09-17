import { EntityRepository, Repository } from 'typeorm';
import { FreeProductsPromotionsCategory } from '../../../models/Promotions/FreeProducts/FreeProductPromotionsCategory';

@EntityRepository(FreeProductsPromotionsCategory)
export class FreeProductsPromotionsCategoryRepository extends Repository<FreeProductsPromotionsCategory>  {

}
