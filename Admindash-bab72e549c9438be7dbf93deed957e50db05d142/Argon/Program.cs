using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = WebApplication.CreateBuilder(args);

// Kestrel'i yalnýzca HTTP ile yapýlandýrma
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenLocalhost(5002); // Sadece HTTP kullanýlýr
});

// Servisleri ekleme
builder.Services.AddControllersWithViews();
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
    options.IdleTimeout = TimeSpan.FromMinutes(30); // Oturum süresi
});

// CORS yapýlandýrmasý
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin", policy =>
    {
        policy.AllowAnyOrigin()   // Tüm kaynaklardan gelen isteklere izin verir
              .AllowAnyHeader()   // Her türlü HTTP baþlýðýna izin verir
              .AllowAnyMethod();  // Her türlü HTTP metoduna izin verir
    });
});

var app = builder.Build();

// Hata yönetimi ve statik dosyalar
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
