import {MigrationInterface, QueryRunner, Table, TableForeignKey} from "typeorm";

export class CreateTableTtFreeProductPromotionCategory1666061370165 implements MigrationInterface {

    private tableForeignKey = new TableForeignKey({
        name: 'fk_tt_free_products_promotions_category',
        columnNames: ['promotion_fk_id'],
        referencedColumnNames: ['promotion_id'],
        referencedTableName: 'tm_freeproductpromotions',
        onDelete: 'CASCADE',
    });

    public async up(queryRunner: QueryRunner): Promise<void> {

        const table = new Table({
            name : "tt_free_products_promotions_category",
            columns: [
                {
                    name: 'id',
                    type: 'bigint',
                    length: '20',
                    isPrimary: true,
                    isNullable: false,
                    isGenerated: true,
                    generationStrategy: 'increment'
                },
                {
                    name: 'promotion_fk_id',
                    type: 'bigint',
                    length: '20',
                    isPrimary: false,
                    isNullable: false
                },
                {
                    name: 'buy_product_id',
                    type: 'integer',
                    length: '11',
                    isPrimary: false,
                    isNullable: false
                },
                {
                    name: 'get_product_id',
                    type: 'integer',
                    length: '11',
                    isPrimary: false,
                    isNullable: false
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
            ]
        });
        const ifExsist = await queryRunner.hasTable('tt_free_products_promotions_category');
        if (!ifExsist) {
            await queryRunner.createTable(table);
        }

        const ifDataExsist = table.foreignKeys.find(fk => fk.columnNames.indexOf('promotion_fk_id') !== -1);
        if (!ifDataExsist) {
            await queryRunner.createForeignKey(table, this.tableForeignKey);
        }


    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.dropTable('tt_free_products_promotions_category', true);
    }

}
