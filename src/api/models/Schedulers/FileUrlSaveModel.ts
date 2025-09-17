import { IsEmpty, IsNotEmpty } from "class-validator";
import moment from "moment";
import { BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { BaseModel } from "../BaseModel";

@Entity('tm_file_url_save')
export class FileUrlSaveModel extends BaseModel {
    @PrimaryGeneratedColumn({name: 'id'})
    @IsNotEmpty()
    public Id: number;

    @IsNotEmpty()
    @Column({ name: 'file_url' })
    public fileUrl: string;

    @IsNotEmpty()
    @Column({ name: 'module_type' })
    public moduleType: string;

    @IsEmpty()
    @Column({ name: 'e_tag' })
    public eTag: string;

    @IsEmpty()
    @Column({ name: 'version_id' })
    public versionId: string;

    @IsEmpty()
    @Column({ name: 'key' })
    public key: string;

    @IsEmpty()
    @Column({ name: 'second_key' })
    public secondKey: string;

    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }
}