using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = WebApplication.CreateBuilder(args);

// Kestrel'i yaln�zca HTTP ile yap�land�rma
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenLocalhost(5002); // Sadece HTTP kullan�l�r
});

// Servisleri ekleme
builder.Services.AddControllersWithViews();
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
    options.IdleTimeout = TimeSpan.FromMinutes(30); // Oturum s�resi
});

// CORS yap�land�rmas�
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin", policy =>
    {
        policy.AllowAnyOrigin()   // T�m kaynaklardan gelen isteklere izin verir
              .AllowAnyHeader()   // Her t�rl� HTTP ba�l���na izin verir
              .AllowAnyMethod();  // Her t�rl� HTTP metoduna izin verir
    });
});

var app = builder.Build();

// Hata y�netimi ve statik dosyalar
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
}

app.UseStaticFiles();
app.UseSession();
app.UseRouting();
app.UseCors("AllowSpecificOrigin");
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=login}/{id?}");

app.Run();
