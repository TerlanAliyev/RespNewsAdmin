const isProduction = true; // Bu real mühit üçündür
const baseUrl = "https://news.ishop.az";

let page = 0; // Sayfa numarası

// Arama butonuna tıklama olayı
document.getElementById("searchButton").addEventListener("click", () => {
    const query = document.getElementById("searchInput").value.trim();

    if (!query) {
        Swal.fire({
            icon: 'warning',
            title: 'Xəbər Araşdırması',
            text: 'Axtarış sorğusu boş ola bilməz!',
            confirmButtonText: 'Bağla'
        });
        return;
    }

    fetch(`${baseUrl}/api/search/infographics/${encodeURIComponent(query)}/${page}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((response) => {
            if (!response.ok) {
                return response.text().then((text) => {
                    throw new Error(text);
                });
            }
            return response.json();
        })
        .then((data) => {
            const tableBody = document.querySelector("tbody");
            tableBody.innerHTML = "";

            if (data.length === 0) {
                tableBody.innerHTML = "<tr><td colspan='8'>Nəticə tapılmadı.</td></tr>";
                return;
            }

            data.forEach((newsItem, index) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                        <td>${index + 1 + page * 10}</td>
                        <td>${newsItem.infName}</td>
                        <td>
                            ${newsItem.infPhoto?.length > 0 ? `
                                <img src="${newsItem.infPhoto ? baseUrl + '/' + newsItem.infPhoto : ''}" alt="Haber Fotoğrafı" style="width: 50px; height: 50px; object-fit: cover;">
                            ` : "Şəkil yoxdur"}
                        </td>
                        <td>${new Date(newsItem.infPostDate).toLocaleDateString()}</td>
                        <td>
                            <a href="/Home/PutInf/${newsItem.infId}" class="text-primary me-2 btn">
                                <i class="fa-solid fa-pen"></i>
                            </a>
                            <a class="text-danger deleteNews btn" data-id="${newsItem.infId}">
                                <i class="fa-solid fa-trash"></i>
                            </a>
                        </td>
                    `;
                tableBody.appendChild(row);
            });
        })
        .catch((error) => {
            console.error("Xəta:", error);
            Swal.fire({
                icon: 'error',
                title: 'Axtarış xətası',
                text: `Sorğu işlənərkən xəta baş verdi: ${error.message}`,
                confirmButtonText: 'Bağla'
            });
        });
});

const apiUrl = `${baseUrl}/api/Infographics/`;
const tableBody = document.querySelector("tbody");
const prevPageButton = document.getElementById("prevPage");
const nextPageButton = document.getElementById("nextPage");
const currentPageDisplay = document.getElementById("currentPage");

let currentPage = 0;
const startDate = "2024-12-01";
const endDate = "2024-12-31";

function fetchNews(page) {
    tableBody.innerHTML = ""; 
    const url = new URL(apiUrl + page);
    if (startDate) url.searchParams.append("startDate", startDate);
    if (endDate) url.searchParams.append("endDate", endDate);

    fetch(url)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Inf getirilemedi");
            }
            return response.json();
        })
        .then((newsItems) => {
            if (newsItems.length === 0) {
                nextPageButton.disabled = true; 
                if (page > 0) currentPage--; 
                return;
            }

            newsItems.forEach((newsItem, index) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                        <td>${index + 1 + page * 10}</td>
                        <td>${newsItem.infName}</td>
                        <td>
                                ${newsItem.infPhoto?.length > 0 ? `
                            <img src="${newsItem.infPhoto ? baseUrl + '/' + newsItem.infPhoto : ''}" alt="Haber Fotoğrafı" style="width: 50px; height: 50px; object-fit: cover;">

                            ` : "Şəkil yoxdur"}
                        </td>
                        <td>${new Date(newsItem.infPostDate).toLocaleDateString()}</td>

                        <td>
                            <a href="/Home/PutInf/${newsItem.infId}" class="text-primary me-2 btn">
                                <i class="fa-solid fa-pen"></i>
                            </a>
                            <a class="text-danger deleteNews btn" data-id="${newsItem.infId}">
                                <i class="fa-solid fa-trash"></i>
                            </a>
                        </td>
                    `;
                tableBody.appendChild(row);
            });

            nextPageButton.disabled = newsItems.length < 10; 
        })
        .catch((error) => {
            console.error("Hata:", error);
        });
}

fetchNews(currentPage);

prevPageButton.addEventListener("click", () => {
    if (currentPage > 0) {
        currentPage--;
        fetchNews(currentPage);
        currentPageDisplay.textContent = currentPage + 1;
        nextPageButton.disabled = false;
    }
    if (currentPage === 0) {
        prevPageButton.disabled = true;
    }
});

nextPageButton.addEventListener("click", () => {
    currentPage++;
    fetchNews(currentPage);
    currentPageDisplay.textContent = currentPage + 1;
    prevPageButton.disabled = false;
});

document.addEventListener("click", function (e) {
    if (e.target.classList.contains("deleteNews")) {
        const newsId = e.target.getAttribute("data-id");
        deleteNews(newsId);
    }
});

function deleteNews(id) {
    Swal.fire({
        title: "Əminsiniz?",
        text: "Bu infi silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Bəli, sil!",
        cancelButtonText: "Xeyr, ləğv et!"
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`${baseUrl}/api/Infographics/delete/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                }
            })
                .then(response => {
                    if (response.ok) {
                        Swal.fire(
                            "Silindi!",
                            "Infoqrafika uğurla silindi.",
                            "success"
                        ).then(() => {
                            location.reload();
                        });
                    } else if (response.status === 404) {
                        Swal.fire(
                            "Tapılmadı!",
                            "Infoqrafika tapılmadı.",
                            "error"
                        );
                    } else {
                        Swal.fire(
                            "Xəta!",
                            `Infoqrafika silinmədi. Xəta kodu: ${response.status}`,
                            "error"
                        );
                    }
                })
                .catch(error => {
                    console.error("Bir xəta baş verdi:", error);
                    Swal.fire(
                        "Server Xətası!",
                        "Serverə qoşulmaq mümkün olmadı. Bir daha cəhd edin.",
                        "error"
                    );
                });
        }
    });
}

