
const isProduction = window.location.hostname !== "localhost";
const baseUrl = isProduction ? "https://api.yourdomain.com" : "https://localhost:44314";

let page = 0; 


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

    fetch(`${baseUrl}/api/search/sub/${encodeURIComponent(query)}/${page}`, {
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
                tableBody.innerHTML = "<tr><td colspan='8'>Sonuç bulunamadı.</td></tr>";
                return;
            }

            data.forEach((newsItem, index) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                        <th scope="row">${index + 1}</th>
                        <td>${newsItem.subEmail}</td>
                        <td>${newsItem.subDate}</td>
                        <td>
                            <a class="text-danger deleteNews btn" data-id="${newsItem.subId}" >
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


document.addEventListener("DOMContentLoaded", function () {
    const apiUrl = `${baseUrl}/api/subscribers`;
    const tableBody = document.getElementById("categoryTableBody");

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error("Kullanıcı verileri alınamadı.");
            }
            return response.json();
        })
        .then(users => {
            tableBody.innerHTML = "";

            users.forEach((user, index) => {
                const row = document.createElement("tr");

                row.innerHTML = `
                        <th scope="row">${index + 1}</th>
                        <td>${user.subEmail}</td>
                        <td>${user.subDate}</td>
                        <td>
                            <a class="text-danger deleteNews btn" data-id="${user.subId}" >
                                <i class="fa-solid fa-trash"></i>
                            </a>
                        </td>
                    `;

                tableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error("Hata:", error);
            Swal.fire({
                icon: 'error',
                title: 'Hata',
                text: 'Kullanıcı verileri yüklenirken bir hata oluştu.'
            });
        });
});


function deleteNews(id) {
    Swal.fire({
        title: 'Emin misiniz?',
        text: "Bu abonenti silmek istediğinizden emin misiniz?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Evet, sil!',
        cancelButtonText: 'Hayır, iptal et!'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`${baseUrl}/api/subscribers/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                }
            })
                .then(response => {
                    if (response.ok) {
                        Swal.fire(
                            'Silindi!',
                            'abonenti başarıyla silindi.',
                            'success'
                        ).then(() => {
                            window.location.replace("/home/Subscribers");
                        });
                    } else if (response.status === 404) {
                        Swal.fire(
                            'Hata!',
                            'abonenti bulunamadı.',
                            'error'
                        );
                    } else {
                        Swal.fire(
                            'Hata!',
                            'abonenti silinemedi. Hata kodu: ' + response.status,
                            'error'
                        );
                    }
                })
                .catch(error => {
                    console.error("Bir hata oluştu:", error);
                    Swal.fire(
                        'Sunucu Hatası!',
                        'Sunucuya ulaşılamadı. Lütfen tekrar deneyin.',
                        'error'
                    );
                });
        }
    });
}

document.addEventListener("click", function (e) {
    if (e.target.classList.contains("deleteNews")) {
        const newsId = e.target.getAttribute("data-id");
        deleteNews(newsId);
    }
});
