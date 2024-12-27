const baseUrl = "https://news.ishop.az"; // Doğru API URL'si

document.getElementById("UserForm").addEventListener("submit", async (event) => {
    event.preventDefault(); 

    const formData = new FormData(event.target); 
    try {
        const response = await fetch(`${baseUrl}/api/subscribers/post`, {
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
