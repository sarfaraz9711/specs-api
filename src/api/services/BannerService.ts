import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { Logger, LoggerInterface } from '../../decorators/Logger';
import { getManager, Like } from 'typeorm/index';
import { BannerRepository } from '../repositories/BannerRepository';
//import { VisitorModel } from '../models/VisitorModel';
//import { VisitorExtendedModel } from '../models/VisitorExtendedModel';

@Service()
export class BannerService {

    constructor(
        @OrmRepository() private bannerRepository: BannerRepository,
        @Logger(__filename) private log: LoggerInterface) {
    }

    // create banner
    public async create(banner: any): Promise<any> {
        this.log.info('Create a new banner ');
        return this.bannerRepository.save(banner);
    }

    // find Condition
    public findOne(banner: any): Promise<any> {
        return this.bannerRepository.findOne(banner);
    }

    // update banner
    public update(banner: any): Promise<any> {
        return this.bannerRepository.save(banner);
    }

    // banner List
    public list(limit: any, offset: any, select: any = [], search: any = [], whereConditions: any = [], count: number | boolean): Promise<any> {
        const condition: any = {};

        if (select && select.length > 0) {
            condition.select = select;
        }
        condition.where = {};

        if (whereConditions && whereConditions.length > 0) {
            whereConditions.forEach((item: any) => {
                condition.where[item.name] = item.value;
            });
        }

        if (search && search.length > 0) {
            search.forEach((table: any) => {
                const operator: string = table.op;
                if (operator === 'where' && table.value !== undefined) {
                    condition.where[table.name] = table.value;
                } else if (operator === 'like' && table.value !== undefined) {
                    condition.where[table.name] = Like('%' + table.value + '%');
                }
            });
        }

        if (limit && limit > 0) {
            condition.take = limit;
            condition.skip = offset;
        }

        condition.order = {
            position: 'ASC',
            createdDate: 'DESC',
        };

        if (count) {
            return this.bannerRepository.count(condition);
        } else {
            return this.bannerRepository.find(condition);
        }
    }

    // delete banner
    public async delete(id: number): Promise<any> {
        return await this.bannerRepository.delete(id);
    }


    public async visitorInfo():Promise<any>{
        let o = await getManager().query('(SELECT sum(1) as counter ,visitorType, "all-visitor" as type FROM tt_visitor_count group by visitorType union SELECT sum(1) as counter, "annonymous" as visitorType, "site-visitor" as type  FROM tt_visitor_count where visitorType="site" and userId is null group by visitorType union SELECT sum(1) as counter, "registered" as visitorType, "site-visitor" as type  FROM tt_visitor_count where visitorType="site" and userId is not null group by visitorType union SELECT sum(1) as counter, "annonymous" as visitorType, "banner-visitor" as type  FROM tt_visitor_count where  visitorType="banner" and userId is null group by visitorType union SELECT sum(1) as counter, "registered" as visitorType, "banner-visitor" as type  FROM tt_visitor_count where visitorType="banner" and userId is not null group by visitorType)');

        if(o.length > 0){
            return JSON.parse(JSON.stringify(o));
        }else{
            return [];
        }
    }

    public async bannerCounter():Promise<any>{
        let o = await getManager().query('(SELECT * FROM ( SELECT bannerId,sum(1) as counter,B.title,B.link, CONCAT(image_path,image) AS imagePath FROM tt_visitor_count AS V INNER JOIN banner AS B ON B.banner_id = V.bannerId where visitorType="banner" group by bannerId) AS TEMP ORDER BY counter DESC)');

        if(o.length > 0){
            return JSON.parse(JSON.stringify(o));
        }else{
            return [];
        }
    }
}
