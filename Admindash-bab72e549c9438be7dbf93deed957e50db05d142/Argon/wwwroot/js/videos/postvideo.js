

const isProduction = window.location.hostname !== "localhost";
const baseUrl = isProduction ? "https://api.yourdomain.com" : "https://localhost:44314";

document.getElementById("categoryForm").addEventListener("submit", function (e) {
    e.preventDefault(); 

    const videoTitle = document.getElementById("videoTitle").value;
    const videoUrl = document.getElementById("videoUrl").value;
    const videoStatus = document.getElementById("videoStatus").checked;

    const ytvideo = {
        VideoTitle: videoTitle,
        VideoUrl: videoUrl,
        VideoStatus: videoStatus ? true : null,
    };

    fetch(`${baseUrl}/api/Youtube`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(ytvideo) 
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Başarılı',
                    text: data.message,
                    confirmButtonText: 'Tamam'
                });
                document.getElementById("categoryForm").reset();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Hata',
                    text: data.message,
                    confirmButtonText: 'Tamam'
                });
            }
        })
        .catch(error => {
            console.error('Hata:', error);
            Swal.fire({
                icon: 'error',
                title: 'Bir hata oluştu',
                text: 'Lütfen tekrar deneyin.',
                confirmButtonText: 'Tamam'
            });
        });
});