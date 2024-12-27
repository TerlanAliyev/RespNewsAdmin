const baseUrl = "https://news.ishop.az"; // Doğru API URL'si

document.getElementById("categoryForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);

    try {
        const response = await fetch(`${baseUrl}/api/category`, {
            method: "POST",
            body: formData,
        });

        if (response.ok) {
            const result = await response.json();
            Swal.fire({
                icon: 'success',
                title: 'Uğurlu əməliyyat',
                text: "Kateqoriya uğurla əlavə edildi",
            });
        } else {
            const errorText = await response.text();
            Swal.fire({
                icon: 'error',
                title: 'Xəta',
                text: errorText,
            });
        }
    } catch (error) {
        console.error("İstek başarısız oldu:", error);
        Swal.fire({
            icon: 'error',
            title: 'Xəta',
            text: 'Kateqoriya əlavə edilə bilmədi',
        });
    }
});

