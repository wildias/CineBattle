using Microsoft.AspNetCore.SignalR;
using System.Text.RegularExpressions;

namespace CineBattle.Api.Hubs
{
    public class GameHub : Hub
    {
        public async Task EntrarNaSala(int salaId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, salaId.ToString());
        }

        public async Task SairDaSala(int salaId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, salaId.ToString());
        }
    }
}
