import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class NewTablePinCodeMaster1669985054510 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
	
        const table = new Table({
              name: 'tm_pincode_master',
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
                    name: 'circlename',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: false,
                }, {
                    name: 'regionname',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: false,
                },{
                    name: 'divisionname',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: false,
                },{
                    name: 'officename',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: false,
                },
                {
                    name: 'pincode',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: false,
                },
                {
                    name: 'officetype',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: false,
                },
                {
                    name: 'delivery',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: false,
                },
                {
                    name: 'district',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: false,
                },
                {
                    name: 'statename',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: false,
                },
                {
                    name: 'latitude',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: false,
                },
                {
                    name: 'longitude',
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
          const ifExsist = await queryRunner.hasTable('tm_pincode_master');
          if (!ifExsist) {
              await queryRunner.createTable(table);
          }
      }
  
      public async down(queryRunner: QueryRunner): Promise<void> {
               await queryRunner.dropTable('tm_pincode_master', true);
  
      }
  
  }