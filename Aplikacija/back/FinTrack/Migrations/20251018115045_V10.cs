using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinTrack.Migrations
{
    /// <inheritdoc />
    public partial class V10 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE [Transactions]
                SET [Status] = 1
                WHERE [Status] IS NULL OR [Status] = 0;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
