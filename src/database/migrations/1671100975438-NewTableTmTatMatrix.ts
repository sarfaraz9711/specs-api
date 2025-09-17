import {MigrationInterface, QueryRunner,Table} from "typeorm";

export class NewTableTmTatMatrix1671100975438 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
	
        const table = new Table({
              name: 'tm_tat_matrix',
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
                    name: 'file_type',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                },
                {
                    name: 'file_path',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
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
          const ifExsist = await queryRunner.hasTable('tm_tat_matrix');
          if (!ifExsist) {
              await queryRunner.createTable(table);
          }
      }
  
      public async down(queryRunner: QueryRunner): Promise<void> {
        
               await queryRunner.dropTable('tm_tat_matrix', true);
  
      }
  
  }
