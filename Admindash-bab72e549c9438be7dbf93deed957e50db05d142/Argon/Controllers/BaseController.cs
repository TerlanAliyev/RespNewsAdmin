using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;

public class BaseController : Controller
{
    protected string GetUserNameFromToken()
    {
        var token = HttpContext.Session.GetString("jwtToken");

        if (string.IsNullOrEmpty(token))
            return null;

        try
        {
            var handler = new JwtSecurityTokenHandler();
            var jwtToken = handler.ReadJwtToken(token);

            // Get the claim for the username
            var username = jwtToken.Claims.FirstOrDefault(c => c.Type == "unique_name")?.Value;
            return username;
        }
        catch (Exception ex)
        {
            // Log or handle token parsing errors
            Console.WriteLine($"Token parsing error: {ex.Message}");
            return null;
        }
    }
    public string GetUserNameFromCookie()
    {
        return HttpContext.Request.Cookies["username"];
    }
}
