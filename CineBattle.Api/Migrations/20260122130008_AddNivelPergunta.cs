using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CineBattle.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddNivelPergunta : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Nivel",
                table: "Perguntas",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Nivel",
                table: "Perguntas");
        }
    }
}
