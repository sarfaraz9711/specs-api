/*
* spurtcommerce
* http://www.spurtcommerce.com
*
* Copyright (c) 2022 Piccosoft Software Labs Pvt Ltd
* Author Piccosoft Software Labs Pvt Ltd <support@spurtcommerce.com>
* Licensed under the MIT license.
*/

import { Column, PrimaryGeneratedColumn, Entity, OneToMany } from 'typeorm';
import { Zone } from './Zone';
import { Customer } from './Customer';
import { IsNotEmpty } from 'class-validator';

@Entity('country')
export class Country {
    @IsNotEmpty()
    @PrimaryGeneratedColumn({ name: 'country_id' })
    public countryId: number;
    @IsNotEmpty()
    @Column({ name: 'name' })
    public name: string;

    @Column({ name: 'iso_code_2' })
    public isoCode2: string;

    @Column({ name: 'iso_code_3' })
    public isoCode3: string;

    @Column({ name: 'address_format' })
    public addressFormat: string;

    @Column({ name: 'postcode_required' })
    public postcodeRequired: number;

    @Column({ name: 'is_active' })
    public isActive: number;

    @OneToMany(type => Zone, zone => zone.country)
    public zone: Zone[];

    @OneToMany(type => Customer, customer => customer.country)
    public customer: Customer[];
}
