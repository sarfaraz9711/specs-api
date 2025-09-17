import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { getManager } from 'typeorm';
import { DeliveryPartenerRepository } from '../../repositories/OrderTracking/DeliveryPartenerRepository';
import { EcomRepository } from '../../repositories/EcomRepository';
import { DeliveryPartenerEcomRepository } from '../../repositories/OrderTracking/DeliveryPartnerEcomRepository';
import { TatMatrixRepository } from '../../repositories/Schedulers/TatMatrixRepository';
import { TatMatrixModel } from '../../models/Schedulers/TatMatrixModel';


@Service()
export class DeliveryService {
    constructor(
        @OrmRepository() private _deliveryPartenerRepository: DeliveryPartenerRepository,
        @OrmRepository() private _ecomRepo : EcomRepository,
        @OrmRepository() private _deliveryPartenerEcomRepository : DeliveryPartenerEcomRepository,
        @OrmRepository() private _tatMatrixRepository : TatMatrixRepository

        ){}

    public async importDeliveryTatMetrics(_rawData:any = {}):Promise<any>{
        let _m = await this._deliveryPartenerRepository.save(_rawData);
        return _m;
    }

    public async emptyDeliveryTatMetricsTable():Promise<any>{
       let _m =await getManager().query('TRUNCATE TABLE tm_delivery_expected_delhivery');
       return _m;
    }

    public async getExpectedDelivery(circleName:any, deliveryType:any, pincode:any = ""):Promise<any>{
        if(deliveryType == 'DELHIVERY'){
            const _m = this._deliveryPartenerRepository.createQueryBuilder('o');
            _m.select(["*"]);
            _m.where("destination like  :_dest",{_dest: `%${circleName}%`});
            //_m.andWhere("delivery_partener = :_partner",{_partner : deliveryType});
            let _ds = await _m.getOne();
            return _ds;
        }else{
            // const _m = this._deliveryPartenerEcomRepository.createQueryBuilder('o');
            // _m.select(["*"]);
            // _m.where("city_name like  :_dest",{_dest: `%${circleName}%`});
            // _m.andWhere('pincode = :pinCode',{pinCode:pincode});
            // _m.limit(1);
            // let _ds = await _m.execute();
            // return _ds;

            let _m = this._deliveryPartenerEcomRepository.findOne({
                where : [{
                    cityName : `like %${circleName}%`
                },
                {
                    pincode : pincode
                }
            ]
            });
            
            return _m;
        }
        
     }

     public async saveEcom(_rawData:any ):Promise<any>{
        let _m = await this._ecomRepo.save(_rawData);
        return _m;
    }

    public async truncateEcom():Promise<any>{
        let _m =await getManager().query('TRUNCATE TABLE tm_ecom_master');
        return _m;
     }


     public async findEcomByPincode(pincode:any ):Promise<any>{
        let _m = await this._ecomRepo.findOne(
            {
                where:{
                    "pincode" : pincode
                }
            });
        return _m;
    }

    public async importEcomTatMetrics(_rawData:any = {}):Promise<any>{
        let _m = await this._deliveryPartenerEcomRepository.save(_rawData);
        return _m;
    }

    public async emptyEcomTatMetricsTable():Promise<any>{
        let _m =await getManager().query('TRUNCATE TABLE tm_delivery_expected_ecom');
        return _m;
     }
     public async saveTatMatrix(_rawData:any):Promise<any>{
        let _m = await this._tatMatrixRepository.save(_rawData);
        return _m;
            }

    public async findTatMatrix():Promise<any>{
        let _m = await this._tatMatrixRepository.find({
            where:{
                "status" : 0
            }
        });
        return _m;
          }

    /* public async updateTatMatrixStatus(status: number):Promise<any>{
            
              }*/


              public updateTatMatrixStatus(id: number): Promise<any> {
                const _m = this._tatMatrixRepository.createQueryBuilder().update(TatMatrixModel)
                .set({ status: 1})
                .where("id = :id", { id: id })
                .execute();
                return _m;
            }

            
}