import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateTableTmFreeProductPromotion1666061354063 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = new Table({
            name: 'tm_freeproductpromotions',
            columns: [{
                name: 'promotion_id',
                type: 'bigint',
                length: '20',
                isPrimary: true,
                isNullable: false,
                isGenerated: true,
                generationStrategy: 'increment',
            },
            {
                name: 'free_promotion_type',
                type: 'varchar',
                length: '50',
                isPrimary: false,
                isNullable: false,
            },
            {
                name: 'start_date',
                type: 'datetime',
                isPrimary: false,
                isNullable: true,
            }, {
                name: 'end_date',
                type: 'datetime',
                isPrimary: false,
                isNullable: true,
            },
            {
                name: 'is_active',
                type: 'integer',
                length: '11',
                isPrimary: false,
                isNullable: true,
            }, {
                name: 'created_by',
                type: 'integer',
                length: '11',
                isPrimary: false,
                isNullable: true,
            }, {
                name: 'created_date',
                type: 'datetime',
                isPrimary: false,
                isNullable: true,
                default: 'CURRENT_TIMESTAMP',
            }, {
                name: 'modified_by',
                type: 'integer',
                length: '11',
                isPrimary: false,
                isNullable: true,
            }, {
                name: 'modified_date',
                type: 'datetime',
                isPrimary: false,
                isNullable: true,
                default: 'CURRENT_TIMESTAMP',
            }]
        });

        const ifExsist = await queryRunner.hasTable('tm_freeproductpromotions');
        if (!ifExsist) {
            await queryRunner.createTable(table);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('tm_freeproductpromotions', true);
    }

}
