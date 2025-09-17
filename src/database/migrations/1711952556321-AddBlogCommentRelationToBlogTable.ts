import {MigrationInterface, QueryRunner,TableForeignKey} from "typeorm";

export class AddBlogCommentRelationToBlogTable1711952556321 implements MigrationInterface {

    private tableForeignKey = new TableForeignKey({
        name: 'fk_blog_comment',
        columnNames: ['blog_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'blog',
        onDelete: 'CASCADE',
    });
    public async up(queryRunner: QueryRunner): Promise<any> {
        const table = await queryRunner.getTable('blog_comment');
        const ifDataExsist = table.foreignKeys.find(fk => fk.columnNames.indexOf('blog_id') !== -1);
        if (!ifDataExsist) {
            await queryRunner.createForeignKey(table, this.tableForeignKey);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('blog_comment');
        const ifDataExsist = table.foreignKeys.find(fk => fk.columnNames.indexOf('blog_id') !== -1);
        if (ifDataExsist) {
            await queryRunner.dropForeignKey(table, this.tableForeignKey);
        }
    }

}
