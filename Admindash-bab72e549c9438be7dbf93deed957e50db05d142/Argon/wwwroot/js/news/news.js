const baseUrl = "https://news.ishop.az";


const searchButton = document.getElementById("searchButton");
const searchInput = document.getElementById("searchInput");
const tableBody = document.querySelector("tbody");
const prevPageButton = document.getElementById("prevPage");
const nextPageButton = document.getElementById("nextPage");
const currentPageDisplay = document.getElementById("currentPage");

let currentPage = 0;

searchButton.addEventListener("click", () => {
    const langCode = 0;
    const query = searchInput.value.trim();

    if (!query) {
        Swal.fire({
            icon: 'warning',
            title: 'Xəbər Araşdırması',
            text: 'Axtarış sorğusu boş ola bilməz!',
            confirmButtonText: 'Bağla'
        });
        return;
    }

    fetch(`${baseUrl}/api/search/${langCode}/${encodeURIComponent(query)}/${currentPage}`, {
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
            tableBody.innerHTML = "";
            if (data.length === 0) {
                tableBody.innerHTML = "<tr><td colspan='8'>Nəticə tapılmadı.</td></tr>";
                return;
            }

            data.forEach((newsItem, index) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${index + 1 + currentPage * 3}</td>
                    <td>${newsItem.newsTitle.length < 10 ? newsItem.newsTitle : (newsItem.newsTitle.slice(0, 10) + '...')}</td>
                    <td>
                        ${newsItem.newsPhotos?.length > 0 ? `
                        <img src="${baseUrl}/${newsItem.newsPhotos[0]?.photoUrl || ''}" alt="Xəbər şəkli" style="width: 50px; height: 50px; object-fit: cover;">
                        ` : "Şəkil yoxdur"}
                    </td>
                    <td>${new Date(newsItem.newsDate).toLocaleDateString()}</td>
                    <td>${newsItem.userName || "Bilinmir"}</td>
                    <td>${newsItem.ownerName || "Bilinmir"}</td>
                    <td>
                        <span class="btn btn-lg status active">Aktiv</span>
                    </td>
                    <td>
                        <a href="https://resp.ishop.az/news/${newsItem.newsId}" class="text-dark me-2 btn">
                            <i class="fa-solid fa-eye"></i>
                        </a>
                        <a href="/Home/PutNews/${newsItem.newsId}" class="text-primary me-2 btn">
                            <i class="fa-solid fa-pen"></i>
                        </a>
                        <a class="text-danger deleteNews btn" data-id="${newsItem.newsId}">
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

async function fetchNews(page) {
    try {
        tableBody.innerHTML = "";
        const url = new URL(`${baseUrl}/api/news/admin/${page}`);
        console.log(url)

        const response = await fetch(url, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 401) {
            throw new Error("Yetkilendirme hatası: Lütfen giriş yapın.");
        } else if (response.status === 403) {
            throw new Error("Erişim izniniz bulunmuyor.");
        } else if (!response.ok) {
            throw new Error("Xəbərlər gətirilə bilmədi");
        }

        const newsItems = await response.json();

        if (newsItems.length === 0) {
            nextPageButton.disabled = true;
            if (page > 0) currentPage--;
            return;
        }

        newsItems.forEach((newsItem, index) => {
            console.log(`Məlumat: ${index}, ID: ${newsItem.newsId}, Title: ${newsItem.newsTitle}`);


            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${index + 1 + page * 10}</td>
                <td>${newsItem.newsTitle.length < 10 ? newsItem.newsTitle : (newsItem.newsTitle.slice(0,10) + '...')}</td>
                <td>
                    ${newsItem.newsPhotos?.length > 0 ? `
                    <img src="${baseUrl}/${newsItem.newsPhotos[0]?.photoUrl || ''}" alt="Xəbər şəkli" style="width: 50px; height: 50px; object-fit: cover;">
                    ` : "Şəkil yoxdur"}
                </td>
                <td>${new Date(newsItem.newsDate).toLocaleDateString()}</td>
                <td>${newsItem.newsAdmin?.userName || "Bilinmir"}</td>
                <td>${newsItem.newsOwner?.ownerName || "Bilinmir"}</td>
                <td>
                    <span class="btn btn-lg status ${newsItem.newsVisibility ? "active" : "inactive"}">
                        ${newsItem.newsVisibility ? "Aktiv" : "Passiv"}
                    </span>
                </td>
                <td>
                    <a href="https://resp.ishop.az/news/${newsItem.newsId}" target="_blank" class="text-dark me-2 btn view-link">
                         <i class="fa-solid fa-eye"></i>
    <span class="news-view-count">${newsItem.newsViewCount}</span>
                    </a>
                    <a href="/Home/PutNews/${newsItem.newsId}" class="text-primary me-2 btn">
                        <i class="fa-solid fa-pen"></i>
                    </a>
                    <a class="text-danger deleteNews btn" data-id="${newsItem.newsId}">
                        <i class="fa-solid fa-trash"></i>
                    </a>
                </td>
            `;
            tableBody.appendChild(row);
        });

        nextPageButton.disabled = newsItems.length < 10;
    } catch (error) {
        console.error("Xəta:", error.message);
        alert(error.message);
    }
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
        title: 'Əminsiniz?',
        text: "Bu xəbəri silmək istədiyinizə əminsiniz?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Bəli, sil!',
        cancelButtonText: 'Xeyr, ləğv et!'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`${baseUrl}/api/news/id/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                }
            })
                .then(response => {
                    if (response.ok) {
                        Swal.fire(
                            "Silindi!",
                            "Xəbər uğurla silindi.",
                            "success"
                        ).then(() => {
                            fetchNews(currentPage);
                        });
                    } else if (response.status === 404) {
                        Swal.fire(
                            "Tapılmadı!",
                            "Xəbər tapılmadı.",
                            "error"
                        );
                    } else {
                        Swal.fire(
                            "Xəta!",
                            `Xəbər silinmədi. Xəta kodu: ${response.status}`,
                            "error"
                        );
                    }
                })
                .catch(error => {
                    console.error("Xəta baş verdi:", error);
                    Swal.fire(
                        'Server Xətası!',
                        'Serverə qoşulmaq mümkün olmadı. Bir daha cəhd edin.',
                        'error'
                    );
                });
        }
    });
}
tableBody.addEventListener("click", (e) => {
    const statusButton = e.target.closest(".status");
    if (statusButton) {
        const row = statusButton.closest("tr");
        const newsId = row.querySelector(".deleteNews").getAttribute("data-id");
        const currentStatus = statusButton.textContent.trim() === "Aktiv";
        const newStatus = !currentStatus;

        fetch(`${baseUrl}/api/news/${newsId}/visibility`, {
            method: "PUT",  
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ IsVisible: newStatus }),
        })
            .then((response) => {
                if (response.ok) {
                    statusButton.textContent = newStatus ? "Aktiv" : "Passiv";
                    statusButton.classList.toggle("active", newStatus);
                    statusButton.classList.toggle("inactive", !newStatus);

                    Swal.fire({
                        title: 'Uğurlu!',
                        text: 'Xəbər statusu uğurla yenilendi!',
                        icon: 'success',
                        confirmButtonText: 'Bağla'
                    });
                } else {
                    throw new Error("Status yenilənə bilmədi");
                }
            })
            .catch((error) => {
                console.error("Xəta:", error);

                Swal.fire({
                    title: 'Xəta!',
                    text: 'Status yenilənərkən bir xəta baş verdi.',
                    icon: 'error',
                    confirmButtonText: 'Bağla'
                });
            });
    }
});