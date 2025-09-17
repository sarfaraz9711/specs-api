import { Service } from 'typedi';
import { getManager, Like } from 'typeorm';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { AdditionalDataModel } from '../models/dbMigration/AdditionalDataModel';
import { ProductLogModel } from '../models/dbMigration/ProductLogModel';
import { OrderProductLogRepository } from '../repositories/OrderProductLogRepository';
import { OrderProductRepository } from '../repositories/OrderProductRepository';
import { OrderRepository } from '../repositories/OrderRepository';
import { OrderStatusRepository } from '../repositories/OrderStatusRepository';
// import { OrderTrackingModel } from '../models/OrderTrackingModel';

import { OrderTrackingRepository } from '../repositories/OrderTracking/OrderTrackingRepository';

@Service()
export class OrderTrackingService {
    constructor(
        @OrmRepository() private _ordeTracking: OrderTrackingRepository,
        @OrmRepository() private orderRepo: OrderRepository,
        @OrmRepository() private orderStatusRepo: OrderStatusRepository,
        @OrmRepository() private _orderProduct: OrderProductRepository,
        @OrmRepository() private _orderProductLog: OrderProductLogRepository,
        ){}

    public async getOldTrackingData(): Promise<any> {
        const additionalRepository = getManager().getRepository(AdditionalDataModel);
        let _m = additionalRepository.createQueryBuilder('a');
        _m.innerJoin(ProductLogModel, 'prdl', 'prdl.order_no = a.old_order_id');
        // _m.select(['a.old_order_id as oldOrderId', 'prdl.id as prdlId', 'a.order_id as orderId', 'prdl.action_date as transactionalDate', 'prdl.action_type as actionType', 'prdl.tracking_url as trackingUrl', 'prdl.tracking_no as trackingNo', 'prdl.id as productLOgId', 'case WHEN LOWER(prdl.action_type)="order placed" then 1 WHEN LOWER(prdl.action_type)="order accepted" then 2 WHEN LOWER(prdl.action_type)="packing in progress" then 3 WHEN LOWER(prdl.action_type)="shipped" then 4 WHEN LOWER(prdl.action_type)="delivered" then 5 end as actionTypeId']);

        _m.select(['a.old_order_id as oldOrderId', 'prdl.id as prdlId', 'a.order_id as orderId', 'prdl.action_date as transactionalDate', 'prdl.action_type as actionType', 'prdl.tracking_url as trackingUrl', 'prdl.tracking_no as trackingNo', 'prdl.id as productLOgId', 'prdl.action_type as actionTypeId']);


        _m.where('prdl.status = :statusFlag');
        _m.setParameter('statusFlag', 1);
        let _data = await _m.execute();
        //const totalTrack = await additionalRepository.find();
        return _data;
    }





    public async updateOldProductLog(logid: any): Promise<any> {
        await getManager().query('update tt_mig_product_log set status=0 where order_no="' + logid + '"');
    }

    public async saveOrderTracking(_data: any = {}): Promise<any> {
        //const oTrack = getManager().getRepository(OrderTrackingModel);
        await this._ordeTracking.save(_data);
    }


    public async getTrackingById(userOrderId: any): Promise<any> {
         const _m = this._ordeTracking.createQueryBuilder('o');
         _m.select(['o.order_id',' DATE_FORMAT(date(o.transactional_date), "%d-%m-%Y %h:%i:%s") as transactional_date','o.action_type']);
        _m.where('o.order_id = :ordrrId',{ordrrId:userOrderId});
        _m.orderBy('o.transactional_date',"ASC");
        let _re = await _m.execute();

        return _re;

        // let _data = await this._ordeTracking.find({
        //     where: {
        //         orderId: userOrderId
        //     },
        //     order: {
        //         actionTypeId: "ASC"
        //     }
        // });

        // return _data;
        
    }

    public async createNewTracking(_rawData:any = {}):Promise<any>{
        let _m = await this._ordeTracking.save(_rawData);
        return _m;
    }


    public async updateMainOrderStatus(_orderId:any, orderStatus:any):Promise<any>{
        let _order = await this.orderRepo.findOne({
            where : {
                orderId : _orderId
            }
        });

        if(_order){
            //_order.orderStatus = 1;
            _order.orderStatusId = orderStatus;
            await this.orderRepo.update(_orderId,_order);
            await this.updateChildOrderProduct(_orderId,orderStatus);
        }
    }

    public async updateChildOrderProduct(_orderId:any,orderStatus:any):Promise<any>{
        let _m = this._orderProduct.createQueryBuilder().update()
        .set({orderStatusId : orderStatus});
        _m.where("order_id = :_orderIdD",{_orderIdD : _orderId});
        await _m.execute();

        let _ml = this._orderProductLog.createQueryBuilder().update().set({orderStatusId : orderStatus});
        _ml.where("order_id = :_orderIdD",{_orderIdD : _orderId});
        await _ml.execute();
    }

    public async getOrderStatusIdAndName(orderStatusName:any):Promise<any>{
        let _option = await this.orderStatusRepo.findOne({
            where : {
                name : Like(`%${orderStatusName}%`),
                isActive : 1
            },
            select : [
                'orderStatusId','name'
            ]
        });

        return _option;
    }

  
}