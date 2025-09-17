import { Service } from 'typedi';
import { ImageService } from '../services/ImageService';
import { S3Service } from '../services/S3Service';
import { parse } from "json2csv";
import { env } from '../../env';
import { getManager } from 'typeorm';
import { PaymentMigrationModel } from '../models/dbMigration/PaymentMigrationModel';
import { AdditionalDataModel } from '../models/dbMigration/AdditionalDataModel';

@Service()
export class MigrationService {
    constructor(
        private imageService: ImageService,
        private s3Service: S3Service,
        //private queryRunner : QueryRunner
    ) { }
    public async _doCreateCSVOnS3(actualData: any, filename:any, fromData: any): Promise<any> {
        const csvPayload = parse(actualData, { header: true, defaultValue: "-----" });


        const name = 'Import_' + fromData + "__" + Date.now() + "__" + filename;

        if (env.imageserver == 's3') {
            const cPath = await this.s3Service.fileUploadExtended(('storeMigration/' + name), csvPayload, 'application/octet-stream');
            return cPath.path;
        } else {
            var buf = Buffer.from(csvPayload);
            let _base64 = buf.toString('base64');
            const cPath = await this.imageService.imageUpload(('storeMigration/' + name), _base64);
            return cPath;
        }


    }



    public async mapPayamentData(): Promise<any> {
        const _migPayment = getManager().getRepository(PaymentMigrationModel);
        let _m = _migPayment.createQueryBuilder('p');
        _m.select(['p.*','ad.order_id as ad_order_id']);
        _m.innerJoin(AdditionalDataModel, 'ad', 'ad.old_order_id=p.order_id');
        _m.where('p.is_payment=:flagSet');
        _m.setParameter('flagSet',0);
        //_m.groupBy('ad.order_id');
        let _dataO = await _m.execute();
        
        return Promise.resolve(_dataO);
        
    }
}