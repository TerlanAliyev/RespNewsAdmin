
const isProduction = window.location.hostname !== "localhost";
const baseUrl = isProduction ? "https://api.yourdomain.com" : "https://localhost:44314";

document.getElementById("UserForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    try {
        const response = await fetch(`${baseUrl}/api/user`, {
            method: "POST",
            body: formData,
        });

        if (response.ok) {
            const result = response.headers.get("Content-Type")?.includes("application/json")
                ? await response.json()
                : { message: "İşlem başarılı ancak yanıt JSON değil." };

            Swal.fire({
                icon: 'success',
                title: 'Uğurlu əməliyyat',
                text: result.message,
            });

            event.target.reset();
        } else {
            const errorText = response.headers.get("Content-Type")?.includes("application/json")
                ? await response.json()
                : { message: "Bir hata oluştu ancak detay verilmedi." };

            Swal.fire({
                icon: 'error',
                title: 'Xəta',
                text: errorText.message,
            });
        }
    } catch (error) {
        console.error("İstek başarısız oldu:", error);
        Swal.fire({
            icon: 'error',
            title: 'Xəta',
            text: 'Kullanıcı eklenemedi. Lütfen tekrar deneyin.',
        });
    }
});