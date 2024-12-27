const baseUrl = "https://news.ishop.az"; // Doğru API URL'si


document.addEventListener("DOMContentLoaded", function () {
    const path = window.location.pathname;
    const id = path.split("/").pop();

    fetch(`${baseUrl}/api/Links/id/${id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Veri alınamadı.");
            }
            return response.json();
        })
        .then(data => {
            if (data) {
                document.getElementById("LinkName").value = data.linkName || "";
                document.getElementById("LinkUrl").value = data.linkUrl || "";

                const coverPreview = document.getElementById("coverPreview");
                coverPreview.innerHTML = ""; 

                if (data.linkCoverUrl) {
                    const img = document.createElement("img");
                    img.src = `${baseUrl}/${data.linkCoverUrl}`;
                    img.style.maxWidth = "200px";
                    img.style.maxHeight = "200px";
                    img.style.objectFit = "cover";
                    coverPreview.appendChild(img);
                }
            }
        })
        .catch(error => {
            console.error("API çağrısı başarısız:", error);
            Swal.fire({
                icon: "error",
                title: "Bir hata oluştu",
                text: error.message || "API çağrısı sırasında bir sorun oluştu."
            });
        });

    const fileInput = document.getElementById("LinkCoverFile");
    fileInput.addEventListener("change", function () {
        const coverPreview = document.getElementById("coverPreview");
        coverPreview.innerHTML = ""; 

        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            const img = document.createElement("img");
            const fileUrl = URL.createObjectURL(file);
            img.src = fileUrl;
            img.style.maxWidth = "200px";
            img.style.maxHeight = "200px";
            img.style.objectFit = "cover";
            coverPreview.appendChild(img);
        }
    });

    document.getElementById("categoryForm").addEventListener("submit", async function (event) {
        event.preventDefault();

        const formData = new FormData(event.target);

        const fileInput = document.getElementById("LinkCoverFile");
        if (fileInput.files.length > 0) {
            formData.append("LinkCoverUrl", fileInput.files[0]); 
        }

        try {
            const response = await fetch(`${baseUrl}/api/Links/edit/${id}`, {
                method: "PUT",
                body: formData,
            });

            if (response.ok) {
                const result = await response.json();
                Swal.fire({
                    icon: "success",
                    title: "Başarılı!",
                    text: result.Message || "Link başarıyla güncellendi.",
                }).then(() => {
                    window.location.replace("/Home/Links");
                });
            } else {
                const errorText = await response.text();
                Swal.fire({
                    icon: "error",
                    title: "Hata!",
                    text: errorText,
                });
            }
        } catch (error) {
            console.error("İstek başarısız oldu:", error);
            Swal.fire({
                icon: "error",
                title: "Bağlantı Hatası",
                text: error.message,
            });
        }
    });
});
