
const isProduction = window.location.hostname !== "localhost";
const baseUrl = isProduction ? "https://api.yourdomain.com" : "https://localhost:44314";

document.addEventListener("DOMContentLoaded", function () {
    const path = window.location.pathname;
    const id = path.split('/').pop();

    fetch(`${baseUrl}/api/newspaper/${id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Veri alınırken bir hata oluştu.");
            }
            return response.json();
        })
        .then(data => {
            console.log("Veri alındı: ", data);
            if (data) {
                document.getElementById("NewspaperTitle").value = data.newspaperTitle;
                document.getElementById("NewspaperLinkFlip").value = data.newspaperLinkFlip;
                document.getElementById("NewspaperDate").value = data.newspaperDate.split('T')[0];
                document.getElementById("NewspaperPrice").value = data.newspaperPrice;

                const statusElement = document.getElementById("NewspaperStatus");
                if (statusElement) {
                    statusElement.checked = data.newspaperStatus;
                }

                const coverPreview = document.getElementById("coverPreview");
                if (data.newspaperCoverUrl) {
                    const coverUrl = `${baseUrl}/${data.newspaperCoverUrl}`;
                    coverPreview.innerHTML = `<img src="${coverUrl}" style="max-width: 200px; max-height: 200px; object-fit: cover;" alt="Qəzet Üzqapağı">`;
                } else {
                    console.warn("Resim URL'si boş veya null.");
                    coverPreview.innerHTML = `<p>Resim yüklenemedi.</p>`;
                }

                const pdfPreview = document.getElementById("pdfPreview");
                pdfPreview.innerHTML = `<a href="${baseUrl}/${data.newspaperPdfUrl}" target="_blank">PDF'yi İndir</a>`;
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

        const formData = new FormData();
        formData.append("NewspaperTitle", document.getElementById("NewspaperTitle").value);
        formData.append("NewspaperLinkFlip", document.getElementById("NewspaperLinkFlip").value);
        formData.append("NewspaperDate", document.getElementById("NewspaperDate").value);
        formData.append("NewspaperPrice", document.getElementById("NewspaperPrice").value);
        formData.append("NewspaperStatus", document.getElementById("NewspaperStatus").checked);

        const coverFile = document.getElementById("NewspaperCoverUrl").files[0];
        if (coverFile) {
            formData.append("NewspaperCoverUrl", coverFile);
        }

        const pdfFile = document.getElementById("NewspaperPdfFile").files[0];
        if (pdfFile) {
            formData.append("NewspaperPdfFile", pdfFile);
        }

        fetch(`${baseUrl}/api/newspaper/edit/${id}`, {
            method: 'PUT',
            body: formData
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Veri güncellenirken bir hata oluştu.");
                }
                return response.json();
            })
            .then(result => {
                Swal.fire({
                    icon: 'success',
                    title: 'Başarılı!',
                    text: result.Message || 'Xəbər redaktə edildi.'
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

