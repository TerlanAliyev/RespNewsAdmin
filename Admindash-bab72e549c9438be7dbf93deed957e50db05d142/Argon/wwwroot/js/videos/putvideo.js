
const isProduction = window.location.hostname !== "localhost";
const baseUrl = isProduction ? "https://api.yourdomain.com" : "https://localhost:44314";

document.addEventListener("DOMContentLoaded", function () {
    const path = window.location.pathname;
    const id = path.split('/').pop();

    fetch(`${baseUrl}/api/Youtube/video/${id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Video bilgisi alınamadı.");
            }
            return response.text();
        })
        .then(text => {
            const data = text ? JSON.parse(text) : {};

            if (data) {
                document.getElementById("videoTitle").value = data.videoTitle || "";
                document.getElementById("videoUrl").value = data.videoUrl || "";

                if (data.videoDate) {
                    const date = new Date(data.videoDate);
                    const formattedDate = date.toISOString().slice(0, 16);
                    document.getElementById("videoDate").value = formattedDate;
                } else {
                    document.getElementById("videoDate").value = "";
                }

                document.getElementById("videoStatus").value = data.videoStatus ? "true" : "false";
            }
        })
        .catch(error => {
            console.error("API çağrısı başarısız:", error);
            Swal.fire({
                icon: 'error',
                title: 'Bir hata oluştu',
                text: error.message || 'API çağrısı sırasında bir sorun oluştu.'
            });
        });

    document.getElementById("updateForm").addEventListener("submit", function (event) {
        event.preventDefault();

        const updatedVideo = {
            videoTitle: document.getElementById("videoTitle").value,
            videoUrl: document.getElementById("videoUrl").value,
            videoDate: document.getElementById("videoDate").value,
            videoStatus: document.getElementById("videoStatus").value === "true"
        };


        fetch(`${baseUrl}/api/Youtube/edit/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedVideo)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Video güncellenemedi.");
                }
                return response.text();
            })
            .then(text => {
                const result = text ? JSON.parse(text) : {};
                console.log("API Yanıtı:", result);
                Swal.fire({
                    icon: 'success',
                    title: 'Başarılı!',
                    text: 'Video başarıyla güncellendi.'
                }).then(() => {
                    window.location.replace("/Home/Ytvideos");
                });
            })
            .catch(error => {
                Swal.fire({
                    icon: 'error',
                    title: 'Bir hata oluştu',
                    text: error.message || 'API çağrısı başarısız oldu.'
                });
                console.error("API çağrısı başarısız:", error);
            });
    });
});
