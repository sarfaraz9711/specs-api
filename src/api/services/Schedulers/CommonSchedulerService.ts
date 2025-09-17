import { Service } from 'typedi';
import {getManager} from 'typeorm';

@Service()
export class CommonSchedulerService {

  constructor(
    //@OrmRepository() private _product : ProductRepository
  ){}

  public async updateProductForExpiredPromotion():Promise<any>{
 //P.promotion_id = null, P.promotion_flag= null,P.promotion_type=null,P.promotion_product_y_id=null,P.promotion_product_y_slug=null,P.promotion_free_product_price=null

    
    // let _p = this._product.createQueryBuilder('P');
    // _p.innerJoin(FreeProductsPromtions,'FPM', 'FPM.promotion_id = P.promotion_id' );
    // _p.update().set({promotionId : null, promotionFlag : null, promotionType:null,promotionProductYid:null,promotionProductYSlug:null,promotionFreeProductPrice:null});
    // _p.where('UNIX_TIMESTAMP(now()) > UNIX_TIMESTAMP(FPM.end_date)');
    // await _p.execute();


    await getManager().query('UPDATE product AS P INNER JOIN tm_freeproductpromotions AS FPM ON FPM.promotion_id = P.promotion_id SET P.promotion_id = null, P.promotion_flag= null,P.promotion_type=null,P.promotion_product_y_id=null,P.promotion_product_y_slug=null,P.promotion_free_product_price=null WHERE UNIX_TIMESTAMP(now()) > UNIX_TIMESTAMP(end_date)');
  }
}