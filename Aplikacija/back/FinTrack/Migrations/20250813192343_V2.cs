using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinTrack.Migrations
{
    /// <inheritdoc />
    public partial class V2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Balance",
                table: "Users",
                newName: "CashBalance");

            migrationBuilder.AddColumn<decimal>(
                name: "CardBalance",
                table: "Users",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "PaymentMethodId",
                table: "Incomes",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "PaymentMethodId",
                table: "Expenses",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<string>(
                name: "Type",
                table: "Categories",
                type: "varchar(10)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.CreateTable(
                name: "PaymentMethods",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Type = table.Column<string>(type: "varchar(10)", nullable: false),
                    Balance = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PaymentMethods", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PaymentMethods_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Incomes_PaymentMethodId",
                table: "Incomes",
                column: "PaymentMethodId");

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_PaymentMethodId",
                table: "Expenses",
                column: "PaymentMethodId");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentMethods_UserId",
                table: "PaymentMethods",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Expenses_PaymentMethods_PaymentMethodId",
                table: "Expenses",
                column: "PaymentMethodId",
                principalTable: "PaymentMethods",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Incomes_PaymentMethods_PaymentMethodId",
                table: "Incomes",
                column: "PaymentMethodId",
                principalTable: "PaymentMethods",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Expenses_PaymentMethods_PaymentMethodId",
                table: "Expenses");

            migrationBuilder.DropForeignKey(
                name: "FK_Incomes_PaymentMethods_PaymentMethodId",
                table: "Incomes");

            migrationBuilder.DropTable(
                name: "PaymentMethods");

            migrationBuilder.DropIndex(
                name: "IX_Incomes_PaymentMethodId",
                table: "Incomes");

            migrationBuilder.DropIndex(
                name: "IX_Expenses_PaymentMethodId",
                table: "Expenses");

            migrationBuilder.DropColumn(
                name: "CardBalance",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "PaymentMethodId",
                table: "Incomes");

            migrationBuilder.DropColumn(
                name: "PaymentMethodId",
                table: "Expenses");

            migrationBuilder.RenameColumn(
                name: "CashBalance",
                table: "Users",
                newName: "Balance");

            migrationBuilder.AlterColumn<int>(
                name: "Type",
                table: "Categories",
                type: "int",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(10)");
        }
    }
}
