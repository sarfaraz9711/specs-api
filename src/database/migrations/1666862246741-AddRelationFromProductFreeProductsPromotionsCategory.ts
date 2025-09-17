import {MigrationInterface, QueryRunner, TableForeignKey} from "typeorm";

export class AddRelationFromProductFreeProductsPromotionsCategory1666862246741 implements MigrationInterface {
    private tableForeignKey = new TableForeignKey({
        name: 'fk_get_product_id',
        columnNames: ['get_product_id'],
        referencedColumnNames: ['product_id'],
        referencedTableName: 'product',
        onDelete: 'CASCADE',
    });

    // private tableForeignKeySecond = new TableForeignKey({
    //     name: 'fk_buy_product_id',
    //     columnNames: ['buy_product_id'],
    //     referencedColumnNames: ['product_id'],
    //     referencedTableName: 'product',
    //     onDelete: 'CASCADE',
    // });
    public async up(queryRunner: QueryRunner): Promise<void> {

        const table = await queryRunner.getTable('tt_free_products_promotions_category');
        const ifDataExsist = table.foreignKeys.find(fk => fk.columnNames.indexOf('get_product_id') !== -1);
        if (!ifDataExsist) {
            //await queryRunner.createForeignKey(table, this.tableForeignKey);
        }

        const table2 = await queryRunner.getTable('tt_free_products_promotions_category');
        const ifFkExsist = table2.foreignKeys.find(fk => fk.columnNames.indexOf('buy_product_id') !== -1);
        if (!ifFkExsist) {
            //await queryRunner.createForeignKey(table2, this.tableForeignKeySecond);
        }



    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('tt_free_products_promotions_category');
        const ifDataExsist = table.foreignKeys.find(fk => fk.columnNames.indexOf('get_product_id') !== -1);
        if (ifDataExsist) {
            await queryRunner.createForeignKey(table, this.tableForeignKey);
        }


        const table2 = await queryRunner.getTable('tt_free_products_promotions_category');
        const ifFkExsist = table.foreignKeys.find(fk => fk.columnNames.indexOf('buy_product_id') !== -1);
        if (ifFkExsist) {
            await queryRunner.createForeignKey(table2, this.tableForeignKey);
        }
    }

}
