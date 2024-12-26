
// Ortama uyğun olaraq əsas URL-i təyin et
const isProduction = window.location.hostname !== "localhost";
const baseUrl = isProduction ? "https://api.yourdomain.com" : "https://localhost:44314";
const apiUrl = `${baseUrl}/api/advert/adverts`;

// Cədvəl gövdəsini seç
const tableBody = document.querySelector("tbody");

// Xəbərləri gətir və cədvəli doldur
function fetchNews() {
    const url = new URL(apiUrl);

    fetch(url)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Videolar gətirilə bilmədi");
            }
            return response.json();
        })
        .then((newsItems) => {
            if (newsItems.length === 0) {
                tableBody.innerHTML = "<tr><td colspan='5'>Nəticə tapılmadı.</td></tr>";
                return;
            }

            newsItems.forEach((newsItem, index) => {
                const row = document.createElement("tr");
                row.id = `news-${newsItem.advertId}`; // Silmə əməliyyatı üçün unikal ID
                row.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${newsItem.advertName}</td>
                        <td>${newsItem.advertContext}</td>
                        <td>
                            ${newsItem.advertCoverUrl?.length > 0 ? `
                            <img src="${baseUrl}${newsItem.advertCoverUrl}" alt="Reklam şəkli" style="width: 50px; height: 50px; object-fit: cover;">
                            ` : "Şəkil yoxdur"}
                        </td>
                        <td>
                            ${newsItem.advertVideoUrl?.length > 0 ? `
                            <img src="${baseUrl}${newsItem.advertVideoUrl}" alt="Reklam videosu" style="width: 50px; height: 50px; object-fit: cover;">
                            ` : "Video yoxdur"}
                        </td>
                        <td>
                            <span class="btn btn-lg status ${newsItem.advertVisibility ? "active" : "inactive"}" data-id="${newsItem.advertId}">
                                ${newsItem.advertVisibility ? "Aktiv" : "Passiv"}
                            </span>
                        </td>
                        <td>
                            <a class="text-danger deleteNews btn" data-id="${newsItem.advertId}">
                                <i class="fa-solid fa-trash"></i>
                            </a>
                        </td>
                    `;
                tableBody.appendChild(row);
            });
        })
        .catch((error) => {
            alert("Bir xəta baş verdi: " + error.message);
        });
}
fetchNews();

// Xəbər görünürlüğünü yenilə
tableBody.addEventListener("click", (e) => {
    const statusButton = e.target.closest(".status");
    if (statusButton) {
        const newsId = statusButton.getAttribute("data-id");
        const currentStatus = statusButton.textContent.trim() === "Aktiv";
        const newStatus = !currentStatus;

        // PUT sorğusu göndər
        fetch(`${baseUrl}/api/advert/${newsId}/visibility`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ IsVisible: newStatus }),
        })
            .then((response) => {
                if (!response.ok) {
                    return response.json().then((data) => {
                        throw new Error(data.message || "Statusd yenilənə bilmədi.");
                        throw new Error(data.message || "Statusd yenilənə bilmədi.");
                    });
                }
                // Uğurlu cavab
                statusButton.textContent = newStatus ? "Aktiv" : "Passiv";
                statusButton.classList.toggle("active", newStatus);
                statusButton.classList.toggle("inactive", !newStatus);
                Swal.fire({
                    title: 'Uğurlu!',
                    text: 'Reklam statusu uğurla yeniləndi!',
                    icon: 'success',
                    confirmButtonText: 'Bağla',
                });
            })
            .catch((error) => {
                console.error("Xəta:", error);
                Swal.fire({
                    title: 'Xəta!',
                    text: 'Status yenilənərkən bir xəta baş verdi.',
                    icon: 'error',
                    confirmButtonText: 'Bağla',
                });
            });
    }
});

// Xəbəri silmə funksiyası
function deleteNews(id) {
    Swal.fire({
        title: 'Əminsiniz?',
        text: "Bu xəbəri silmək istədiyinizə əminsiniz?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Bəli, sil!',
        cancelButtonText: 'Xeyr, ləğv et!',
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`${baseUrl}/api/advert/delete/${id}`, { // Burada endpointi dəyişdirdik
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            })
                .then((response) => {
                    if (response.ok) {
                        Swal.fire(
                            'Xəbər silindi!',
                            'Xəbər uğurla silindi.',
                            'success'
                        ).then(() => {
                            location.reload();
                        });
                        document.querySelector(`#news-${id}`)?.remove();
                    } else if (response.status === 404) {
                        Swal.fire(
                            'Xəta!',
                            'Xəbər tapılmadı.',
                            'error'
                        );
                    } else {
                        Swal.fire(
                            'Xəta',
                            'Xəbər silinə bilmədi. Xəta kodu: ' + response.status,
                            'error'
                        );
                    }
                })
                .catch((error) => {
                    console.error("Xəta baş verdi:", error);
                    Swal.fire(
                        'Server Xətası',
                        'Serverə müraciət oluna bilmədi. Bir daha cəhd edin.',
                        'error'
                    );
                });
        }
    });
}


// Silmə düyməsini dinləyən funksiya
document.addEventListener("click", function (e) {
    if (e.target.classList.contains("deleteNews")) {
        const newsId = e.target.getAttribute("data-id");
        deleteNews(newsId);
    }
});



