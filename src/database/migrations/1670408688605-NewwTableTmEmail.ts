import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class NewwTableTmEmail1670408688605 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
	
        const table = new Table({
              name: 'tm_email',
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
                    name: 'SEND_TO',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                },
                {
                    name: 'SENDER',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                }, 
                {
                    name: 'SUBJECT',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                }, 
                {
                    name: 'AS_OTP',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                },
                {
                    name: 'BODY_CONTENT',
                    type: 'text',
                    length: '30000',
                    isPrimary: false,
                    isNullable: true,
                }, 
                {
                    name: 'FROM_ADDR',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                }, 
                {
                    name: 'CC_ADDR',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                }, 
                {
                    name: 'STATUS',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                },
                {
                    name: 'CREATED_ON',
                    type: 'datetime',
                    isPrimary: false,
                    isNullable: true,
                },
                {
                    name: 'SENDED_ON',
                    type: 'datetime',
                    isPrimary: false,
                    isNullable: true,
                },
                {
                    name: 'ATTEMPT',
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
          const ifExsist = await queryRunner.hasTable('tm_email');
          if (!ifExsist) {
              await queryRunner.createTable(table);
          }
      }
  
      public async down(queryRunner: QueryRunner): Promise<void> {
        
               await queryRunner.dropTable('tm_email', true);
  
      }
  
  }