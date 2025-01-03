using System.Diagnostics;
using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text.Json;
using System.Text.Json.Nodes;
using Argon.Models;
using Microsoft.AspNetCore.Mvc;

namespace Argon.Controllers
{
    public class HomeController : BaseController
    {
        private readonly ILogger<HomeController> _logger;
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;

        public HomeController(ILogger<HomeController> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
            _httpClient = new HttpClient();
        }


        [HttpPost]
        public async Task<IActionResult> Login(string username, string password)
        {
            var loginRequest = new
            {
                UserName = username,
                UserPassword = password
            };

            var jsonContent = new StringContent(JsonSerializer.Serialize(loginRequest), System.Text.Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync("https://news.ishop.az/api/user/login", jsonContent);

            if (response.IsSuccessStatusCode)
            {
                var token = await response.Content.ReadAsStringAsync();
                HttpContext.Session.SetString("jwtToken", token);

                Response.Cookies.Append("userName", username);

                ViewBag.UserName = username;

                return RedirectToAction("Home");
            }
            else
            {
                var errorMessage = await response.Content.ReadAsStringAsync();
                ViewData["ErrorMessage"] = errorMessage;
                return View();
            }
        }

        public async Task<IActionResult> ProtectedData()
        {
            var token = HttpContext.Session.GetString("jwtToken");

            if (string.IsNullOrEmpty(token))
            {
                return RedirectToAction("Login");
            }

            var requestMessage = new HttpRequestMessage(HttpMethod.Get, "https://news.ishop.az/api/protected-resource");
            requestMessage.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var response = await _httpClient.SendAsync(requestMessage);

            if (response.IsSuccessStatusCode)
            {
                var data = await response.Content.ReadAsStringAsync();
                ViewData["ProtectedData"] = data;
                return View();
            }

            return Unauthorized();
        }

        public IActionResult SomeAction()
        {
            var userName = Request.Cookies["UserName"];


            ViewBag.UserName = userName;

            return View();
        }




        private string GetUserNameFromToken(string token)
        {
            var handler = new JwtSecurityTokenHandler();
            try
            {
                var jwtToken = handler.ReadJwtToken(token);

                var usernameClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;

                if (string.IsNullOrEmpty(usernameClaim))
                {
                    throw new Exception("Token'da kullanýcý adý bulunamadý.");
                }

                return usernameClaim;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Token iþleme hatasý: {ex.Message}");
                throw;
            }
        }




        public IActionResult Logout()
        {
            HttpContext.Session.Remove("jwtToken");
            HttpContext.Response.Cookies.Delete("username");

            return RedirectToAction("Login");
        }





        //NewsPapercount
        private async Task<int> GetNewsPaperCount()
        {
            var response = await _httpClient.GetAsync("https://news.ishop.az/api/newspaper/count");

            if (response.IsSuccessStatusCode)
            {
                var data = await response.Content.ReadAsStringAsync();
                var newspapercount = JsonSerializer.Deserialize<JsonElement>(data).GetProperty("newsPaperCount").GetInt32();
                return newspapercount;
            }
            return 0; // Eðer hata oluþursa 0 döndür
        }


        // Kategori sayýsýný almak için API'den GET isteði
        private async Task<int> GetCategoryCount()
        {
            var response = await _httpClient.GetAsync("https://news.ishop.az/api/category/count");

            if (response.IsSuccessStatusCode)
            {
                var data = await response.Content.ReadAsStringAsync();
                var categoryCount = JsonSerializer.Deserialize<JsonElement>(data).GetProperty("categoryCount").GetInt32();
                return categoryCount;
            }
            return 0; // Eðer hata oluþursa 0 döndür
        }

        // Kategori sayýsýný almak için API'den GET isteði
        private async Task<int> GetCategoryCountByLang1()
        {
            var response = await _httpClient.GetAsync("https://news.ishop.az/api/category/count/1");

            if (response.IsSuccessStatusCode)
            {
                var data = await response.Content.ReadAsStringAsync();
                var categoryCount = JsonSerializer.Deserialize<JsonElement>(data).GetProperty("categoryCount").GetInt32();
                return categoryCount;
            }
            return 0; // Eðer hata oluþursa 0 döndür
        }

        private async Task<int> GetCategoryCountByLang2()
        {
            var response = await _httpClient.GetAsync("https://news.ishop.az/api/category/count/2");

            if (response.IsSuccessStatusCode)
            {
                var data = await response.Content.ReadAsStringAsync();
                var categoryCount = JsonSerializer.Deserialize<JsonElement>(data).GetProperty("categoryCount").GetInt32();
                return categoryCount;
            }
            return 0; // Eðer hata oluþursa 0 döndür
        }
        private async Task<int> GetCategoryCountByLang3()
        {
            var response = await _httpClient.GetAsync("https://news.ishop.az/api/category/count/3");

            if (response.IsSuccessStatusCode)
            {
                var data = await response.Content.ReadAsStringAsync();
                var categoryCount = JsonSerializer.Deserialize<JsonElement>(data).GetProperty("categoryCount").GetInt32();
                return categoryCount;
            }
            return 0; // Eðer hata oluþursa 0 döndür
        }





        // Kategoriye aid xeberler almak için API'den GET isteði
        private async Task<List<CategoryNews>> GetCategoryNews()
        {
            var response = await _httpClient.GetAsync("https://news.ishop.az/api/statistic/CategoryNewsCount");

            if (response.IsSuccessStatusCode)
            {
                var data = await response.Content.ReadAsStringAsync();
                // JSON verisini listeye deserialize et
                var categoryNewsList = JsonSerializer.Deserialize<List<CategoryNews>>(data);

                return categoryNewsList;  // Listeyi döndür
            }

            return new List<CategoryNews>();  // Eðer hata oluþursa boþ bir liste döndür
        }









        // News sayýsýný almak için API'den GET isteði
        private async Task<int> GetNewsCount()
        {
            var response = await _httpClient.GetAsync("https://news.ishop.az/api/news/count");

            if (response.IsSuccessStatusCode)
            {
                var data = await response.Content.ReadAsStringAsync();
                var newsCount = JsonSerializer.Deserialize<JsonElement>(data).GetProperty("newsCount").GetInt32();
                return newsCount;
            }
            return 0;
        }

        // Pdf sayý almaq ucun API'dan GET 
        private async Task<int> GetPdfCount()
        {
            var response = await _httpClient.GetAsync("https://news.ishop.az/api/newspaper/count");
            if (response.IsSuccessStatusCode)
            {
                var data = await response.Content.ReadAsStringAsync();
                var pdfCount = JsonSerializer.Deserialize<JsonElement>(data).GetProperty("newsPaperCount").GetInt32();
                return pdfCount;
            }
            return 0;

        }

        private async Task<int> GetInfogCount()
        {
            var response = await _httpClient.GetAsync("https://news.ishop.az/api/Infographics/count");
            if (response.IsSuccessStatusCode)
            {
                var data = await response.Content.ReadAsStringAsync();
                var infcount = JsonSerializer.Deserialize<JsonElement>(data).GetProperty("infCount").GetInt32();
                return infcount;
            }
            return 0;
        }



        private async Task<int> GetNewsCountByLang1()
        {
            var response = await _httpClient.GetAsync("https://news.ishop.az/api/news/count/1");

            if (response.IsSuccessStatusCode)
            {
                var data = await response.Content.ReadAsStringAsync();
                var NewsCount = JsonSerializer.Deserialize<JsonElement>(data).GetProperty("newsCount").GetInt32();
                return NewsCount;
            }
            return 0; // Eðer hata oluþursa 0 döndür
        }
        private async Task<int> GetNewsCountByLang2()
        {
            var response = await _httpClient.GetAsync("https://news.ishop.az/api/news/count/2");

            if (response.IsSuccessStatusCode)
            {
                var data = await response.Content.ReadAsStringAsync();
                var NewsCount = JsonSerializer.Deserialize<JsonElement>(data).GetProperty("newsCount").GetInt32();
                return NewsCount;
            }
            return 0; // Eðer hata oluþursa 0 döndür
        }

        private async Task<int> GetNewsCountByLang3()
        {
            var response = await _httpClient.GetAsync("https://news.ishop.az/api/news/count/3");

            if (response.IsSuccessStatusCode)
            {
                var data = await response.Content.ReadAsStringAsync();
                var NewsCount = JsonSerializer.Deserialize<JsonElement>(data).GetProperty("newsCount").GetInt32();
                return NewsCount;
            }
            return 0; // Eðer hata oluþursa 0 döndür
        }




        //  view-a gonder 
        public async Task<IActionResult> Index()
        {
            var categoryCount = await GetCategoryCount();
            var newsCount = await GetNewsCount();
            var pdfCount = await GetPdfCount();
            var infcount = await GetInfogCount();
            ViewBag.UserName = GetUserNameFromCookie();


            ViewData["CategoryCount"] = categoryCount;
            ViewData["NewsCount"] = newsCount;
            ViewData["Pdfcount"] = pdfCount;
            ViewData["infcount"] = infcount;

            return View();
        }


        public async Task<IActionResult> Categories()
        {
            var categoryCount = await GetCategoryCount();
            var categoryNewsList = await GetCategoryNews();
            var newsCountAze = await GetCategoryCountByLang1();
            var newsCountEng = await GetCategoryCountByLang2();
            var newsCountRus = await GetCategoryCountByLang3();



            // Kategori sayýsýný ViewData'ya gönder
            ViewData["CategoryCount"] = categoryCount;
            ViewData["CategoryNewsList"] = categoryNewsList;
            ViewData["CategoryCountAze"] = newsCountAze;
            ViewData["CategoryCountEng"] = newsCountEng;
            ViewData["CategoryCountRus"] = newsCountRus;


            return View();
        }
        public async Task<IActionResult> News()
        {
            var categoryNewsList = await GetCategoryNews();
            var newsCountAze = await GetNewsCountByLang1();
            var newsCountEng = await GetNewsCountByLang2();
            var newsCountRus = await GetNewsCountByLang3();



            // Kategori sayýsýný ViewData'ya gönder
            ViewData["CategoryNewsList"] = categoryNewsList;
            ViewData["NewsCountAze"] = newsCountAze;
            ViewData["NewsCountEng"] = newsCountEng;
            ViewData["NewsCountRus"] = newsCountRus;


            return View();
        }

        public async Task<IActionResult> NewsPaper()
        {
            var newspapercount= await GetNewsPaperCount();
            ViewData["NewsPapercount"] = newspapercount;

            return View();
        }

        public async Task<IActionResult> Infographics()
        {
            var newspapercount = await GetNewsPaperCount();
            ViewData["NewsPapercount"] = newspapercount;

            return View();
        }






        // Diðer aksiyonlar
        public IActionResult features() => View();
        public IActionResult Subscribers() => View();
        public IActionResult Users() => View();
        public IActionResult Adverts() => View();
        public IActionResult PostAdvert() => View();

        public IActionResult Logos() => View();
        public IActionResult PostLogo() => View();


        public IActionResult Links() => View();
        public IActionResult PostLinks() => View();

        public IActionResult PutLinks() => View();

        public IActionResult PostNews() => View();
        public IActionResult PostUser() => View();
        public IActionResult PostSubscribers() => View();


        public IActionResult PutNews() => View();
        public IActionResult PutInf() => View();
        public IActionResult PutYT() => View();


        public IActionResult PostInf() => View();
        public IActionResult YtVideos() => View();
        public IActionResult PostVideos() => View();




        public IActionResult PostNewsPaper() => View();
        public IActionResult PutNewsPaper() => View();


        public IActionResult login() => View();

        public IActionResult profile() => View();
        public IActionResult signUp() => View();
        public IActionResult PostCategory() => View();
        public IActionResult Privacy() => View();




        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
