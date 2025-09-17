import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class FacilitySkuMapping1671275703080 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = new Table({
            name: 'tm_facility_sku_mapping',
            columns: [
              {
                  name: 'id',
                  type: 'int',
                  length: '11',
                  isPrimary: true,
                  isNullable: false,
                  isGenerated: true,
                  generationStrategy: 'increment',
              }, {
                  name: 'facility_code',
                  type: 'varchar',
                  length: '255',
                  isPrimary: false,
                  isNullable: true,
              },
              {
                  name: 'sku',
                  type: 'varchar',
                  length: '255',
                  isPrimary: false,
                  isNullable: true,
              }, 
              {
                name: 'quantity',
                type: 'int',
                length: '11',
                isPrimary: false,
                isNullable: true,
                default : 0
                }, 
              {
                  name: 'status',
                  type: 'varchar',
                  length: '255',
                  isPrimary: false,
                  isNullable: true,
              }, 
              {
                  name: 'created_date',
                  type: 'datetime',
                  isPrimary: false,
                  isNullable: true,
                  default: 'CURRENT_TIMESTAMP',
              }, {
                  name: 'modified_date',
                  type: 'datetime',
                  isPrimary: false,
                  isNullable: true,
                  default: 'CURRENT_TIMESTAMP',
              }, {
                  name: 'created_by',
                  type: 'int',
                  length: '11',
                  isPrimary: false,
                  isNullable: true,
              }, {
                  name: 'modified_by',
                  type: 'int',
                  length: '11',
                  isPrimary: false,
                  isNullable: true,
              },
          ],
        });
        const ifExsist = await queryRunner.hasTable('tm_facility_sku_mapping');
        if (!ifExsist) {
            await queryRunner.createTable(table);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('tm_facility_sku_mapping', true);
    }

}
