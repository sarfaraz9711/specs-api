/*
* spurtcommerce
* http://www.spurtcommerce.com
*
* Copyright (c) 2022 Piccosoft Software Labs Pvt Ltd
* Author Piccosoft Software Labs Pvt Ltd <support@spurtcommerce.com>
* Licensed under the MIT license.
*/

import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { PrimaryGeneratedColumn } from 'typeorm/index';
import { BaseModel } from './BaseModel';
import { Order } from '../models/Order';
import moment from 'moment';
import { Product } from './ProductModel';
import { OrderProductLog } from './OrderProductLog';
import { CouponUsageProduct } from './CouponUsageProduct';
import { PaymentItems } from './PaymentItems';
import { PaymentItemsArchive } from './PaymentItemsArchive';
import { IsNotEmpty } from 'class-validator';
import { OrderStatus } from './OrderStatus';

// const { CommonService : dd } = require('../common/commonService');
//         let c = new dd();


@Entity('order_product')
export class OrderProduct extends BaseModel {
    @IsNotEmpty()
    @PrimaryGeneratedColumn({ name: 'order_product_id' })
    public orderProductId: number;
    @IsNotEmpty()
    @Column({ name: 'product_id' })
    public productId: number;
    @Column({ name: 'order_product_prefix_id' })
    public orderProductPrefixId: number;
    @IsNotEmpty()
    @Column({ name: 'order_id' })
    public orderId: number;
    @IsNotEmpty()
    @Column({ name: 'name' })
    public name: string;

    @Column({ name: 'model' })
    public model: string;

    @Column({ name: 'quantity' })
    public quantity: number;

    @Column({ name: 'product_price' })
    public productPrice: number;

    @Column({ name: 'discount_amount' })
    public discountAmount: number;

    @Column({ name: 'base_price' })
    public basePrice: number;

    @Column({ name: 'tax_type' })
    public taxType: number;

    @Column({ name: 'tax_value' })
    public taxValue: number;
    @IsNotEmpty()
    @Column({ name: 'total' })
    public total: number;

    @Column({ name: 'discounted_amount' })
    public discountedAmount: number;

    @IsNotEmpty()
    @Column({ name: 'order_status_id' })
    public orderStatusId: number;

    @Column({ name: 'tracking_url' })
    public trackingUrl: string;

    @Column({ name: 'tracking_no' })
    public trackingNo: string;

    @Column({ name: 'trace' })
    public trace: number;

    @Column({ name: 'tax' })
    public tax: number;

    @Column({ name: 'cancel_request' })
    public cancelRequest: number;

    @Column({ name: 'cancel_request_status' })
    public cancelRequestStatus: number;

    @Column({ name: 'cancel_reason' })
    public cancelReason: string;

    @Column({ name: 'cancel_reason_description' })
    public cancelReasonDescription: string;

    @Column({ name: 'is_active' })
    public isActive: number;

    @Column({ name: 'varient_name' })
    public varientName: string;

    @Column({ name: 'product_varient_option_id' })
    public productVarientOptionId: number;

    @Column({ name: 'sku_name' })
    public skuName: string;

    @Column({ name: 'parent_order_id' })
    public parentOrderId: string;

    @Column({ name: 'coupon_discount_amount' })
    public couponDiscountAmount: string;

    @Column({ name: 'delivered_date' })
    public deliveredDate: string;

    @Column({ name: 'applied_cn_amount' })
    public appliedCnAmount: number;

    @Column({ name: 'applied_cn_code' })
    public appliedCnCode: string;

    @Column({ name: 'given_return_cancelled_type' })
    public givenReturnCancelledType: string;

    @Column({ name: 'facility_code' })
    public facilityCode: string;

    @Column({ name: 'facility_name' })
    public facilityName: string;
    
    @Column({ name: 'refund_amount' })
    public refundAmount: number;

    @Column({ name: 'item_code' })
    public itemCode: string;
    
    @ManyToOne(type => Product, product => product.orderProduct)
    @JoinColumn({ name: 'product_id' })
    public productInformationDetail: Product;

    @ManyToOne(type => Order, order => order.productlist)
    @JoinColumn({ name: 'order_id' })
    public product: Order;

    @ManyToOne(type => Order, order => order.orderProduct)
    @JoinColumn({ name: 'order_id' })
    public order: Order;

    @OneToOne(type => OrderStatus)
    @JoinColumn({ name: 'order_status_id' })
    public orderStatus: OrderStatus;

    @OneToMany(type => OrderProductLog, orderProductLog => orderProductLog.orderProduct)
    public orderProductLog: OrderProductLog[];

    @OneToMany(type => CouponUsageProduct, couponUsageProduct => couponUsageProduct.orderProduct)
    public couponUsageProduct: CouponUsageProduct[];

    @OneToMany(type => PaymentItems, paymentItems => paymentItems.orderProduct)
    public paymentItems: PaymentItems[];

    @OneToMany(type => PaymentItemsArchive, paymentItemsArchive => paymentItemsArchive.orderProduct)
    public paymentItemsArchive: PaymentItemsArchive[];

    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
       //this.createdDate = c.getDateInIstFormat(true);
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
       //this.modifiedDate = c.getDateInIstFormat(true);
    }

}
