import { BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { BaseModel } from "./BaseModel";
import moment from 'moment';
import { IsNotEmpty } from "class-validator";

@Entity('tt_product_review_images')
export class ProductReviewImages extends BaseModel {
    @IsNotEmpty()
    @PrimaryGeneratedColumn({ name: 'id' })
    public id: number;

    @IsNotEmpty()
    @Column({ name: 'review_fk_id' })
    public reviewFkId: number;

    @IsNotEmpty()
    @Column({ name: 'image' })
    public image: string;

    @IsNotEmpty()
    @Column({ name: 'container_name' })
    public containerName: string;

    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }
}