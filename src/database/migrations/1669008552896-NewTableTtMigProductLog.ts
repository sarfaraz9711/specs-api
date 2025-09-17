import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class NewTableTtMigProductLog1669008552896 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
	
        const table = new Table({
              name: 'tt_mig_product_log',
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
                    name: 'order_no',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: false,
                }, {
                    name: 'action_date',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: false,
                },{
                    name: 'action_type',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: false,
                },{
                    name: 'tracking_no',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: false,
                },
                {
                    name: 'tracking_url',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: false,
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
          const ifExsist = await queryRunner.hasTable('tt_mig_product_log');
          if (!ifExsist) {
              await queryRunner.createTable(table);
          }
      }
  
      public async down(queryRunner: QueryRunner): Promise<void> {
               await queryRunner.dropTable('tt_mig_product_log', true);
  
      }
  
  }
  
