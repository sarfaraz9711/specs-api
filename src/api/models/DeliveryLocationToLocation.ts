/*
* spurtcommerce
* http://www.spurtcommerce.com
*
* Copyright (c) 2022 Piccosoft Software Labs Pvt Ltd
* Author Piccosoft Software Labs Pvt Ltd <support@spurtcommerce.com>
* Licensed under the MIT license.
*/

import { Column, PrimaryGeneratedColumn, Entity, BeforeUpdate, BeforeInsert, ManyToOne, JoinColumn } from 'typeorm';
import { BaseModel } from './BaseModel';
import { DeliveryLocation } from './DeliveryLocation';
import moment = require('moment/moment');
import { IsNotEmpty } from 'class-validator';

@Entity('delivery_location_to_location')
export class DeliveryLocationToLocation extends BaseModel {
    @IsNotEmpty()
    @PrimaryGeneratedColumn({ name: 'id' })
    public id: number;
    @IsNotEmpty()
    @Column({ name: 'delivery_location_id' })
    public deliveryLocationId: number;

    @Column({ name: 'location' })
    public location: string;

    @ManyToOne(type => DeliveryLocation, deliveryLocation => deliveryLocation.deliveryLocationToLocation)
    @JoinColumn({ name: 'delivery_location_id' })
    public deliveryLocation: DeliveryLocation;

    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }
}
