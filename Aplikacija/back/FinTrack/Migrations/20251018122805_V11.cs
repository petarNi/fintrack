using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinTrack.Migrations
{
    /// <inheritdoc />
    public partial class V11 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DECLARE @df SYSNAME, @schema SYSNAME, @sql NVARCHAR(4000);

                SELECT 
                    @df     = dc.name,
                    @schema = s.name
                FROM sys.default_constraints AS dc
                JOIN sys.columns            AS c ON c.default_object_id = dc.object_id
                JOIN sys.tables             AS t ON t.object_id = c.object_id
                JOIN sys.schemas            AS s ON s.schema_id = t.schema_id
                WHERE t.name = N'Transactions' AND c.name = N'Status';

                IF @df IS NOT NULL
                BEGIN
                    SET @sql = N'ALTER TABLE ' 
                            + QUOTENAME(@schema) + N'.' + QUOTENAME(N'Transactions')
                            + N' DROP CONSTRAINT ' + QUOTENAME(@df) + N';';
                    EXEC(@sql);
                END
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            
        }
    }
}
