const baseUrl = window.location.hostname === "localhost"
    ? "https://localhost:44314"
    : "https://api.yourdomain.com";

document.getElementById("categoryForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);

    try {
        const response = await fetch(`${baseUrl}/api/advert/upload`, {
            method: "POST",
            body: formData,
        });

        if (response.ok) {
            const result = await response.json();
            Swal.fire({
                icon: 'success',
                title: 'Uğurlu əməliyyat',
                text: "Reklam uğurla əlavə edildi",
            }).then(() => {
                location.reload();
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
        console.error("İstək uğursuz oldu:", error);
        Swal.fire({
            icon: 'error',
            title: 'Xəta',
            text: 'Reklam əlavə edilə bilmədi',
        });
    }
});
