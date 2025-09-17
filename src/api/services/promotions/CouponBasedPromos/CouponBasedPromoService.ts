import { Service } from 'typedi';
//import { getManager } from 'typeorm';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { CouponBasedPromtionsRepository } from '../../../repositories/Promotions/CouponBasedPromos/CouponBasedPromosRepository';
import { CouponBasedPromo } from '../../../models/Promotions/CouponBasedPromo/CouponBasedPromo';
import { getConnection } from 'typeorm';


@Service()
export class CouponBasedPromosService {
    constructor(@OrmRepository() private couponBasedPromtionsRepository: CouponBasedPromtionsRepository) { }

    //create 
    public async create(data: any): Promise<any> {
        return this.couponBasedPromtionsRepository.save(data);
    }

    //Get All promotions
    public async getAllpromotions(limit:any,select:any,whereConditions:any): Promise<any> {
        const query: any = await getConnection().getRepository(CouponBasedPromo).createQueryBuilder();
            // Select
        if (select && select.length > 0) {
            query.select(select);
        }
           // Limit & Offset
           if (limit && limit > 0) {
            query.limit(limit);
        }
                // Where
                if (whereConditions && whereConditions.length > 0) {
                    whereConditions.forEach((item: any) => {
                        if (item.op === 'where') {
                            query.where(item.name + ' = ' + item.value);
                        }else if (item.op === 'not') {
                            query.andWhere(item.name + ' != ' + item.value);
                        }  else if (item.op === 'and') {
                            query.andWhere(item.name + ' = ' + item.value);
                        } else if (item.op === 'IN') {
                            query.andWhere(item.name + ' IN (' + item.value + ')');
                        }
                        else if (item.op === 'startDateOp') {
                            query.andWhere(`STR_TO_DATE(${item.name}, '%a %b %d %Y %H:%i:%s') between '${item.value} 00:00:00' and '${item.value} 23:59:59'`);

                        }else if (item.op === 'endDateOp') {
                             query.andWhere(`STR_TO_DATE(${item.name}, '%a %b %d %Y %H:%i:%s') between '${item.value} 00:00:00' and '${item.value} 23:59:59'`);
 
                         }else if (item.op === 'rangeDateOp') {
                             query.andWhere(`STR_TO_DATE(${item.name1}, '%a %b %d %Y %H:%i:%s')>='${item.value1} 00:00:00' and  STR_TO_DATE(${item.name2}, '%a %b %d %Y %H:%i:%s')<='${item.value2} 23:59:59'`);
 
                         }
                        });
                    
                    }
        return query.getRawMany();

       // return this.couponBasedPromtionsRepository.find();
    }

    //Get individual Promotion detail
    public async getPromotionById(id: number): Promise<any> {
        return this.couponBasedPromtionsRepository.findByIds([id]);
    }


    public async updatePromotion(data: any, updateId: any): Promise<any> {
        const result = await this.couponBasedPromtionsRepository.createQueryBuilder()
            .update(data)
            .where({ couponId: updateId })
            .execute();
        return result.affected;
    }

    public async verifyCoupanData(data: any): Promise<any> {
        const coupanData =  await this.couponBasedPromtionsRepository.findOne(data)
        return coupanData
    }


} 