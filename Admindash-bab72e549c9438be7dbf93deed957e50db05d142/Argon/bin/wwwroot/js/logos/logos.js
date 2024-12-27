const baseUrl = "https://news.ishop.az"; // Doğru API URL'si

const apiUrl = `${baseUrl}/api/logo/logos`;
const tableBody = document.querySelector("tbody");

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
                row.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${newsItem.logoName}</td>
                        <td>
                            ${newsItem.logoCoverUrl?.length > 0 ? `
                            <img src="${baseUrl}${newsItem.logoCoverUrl}" alt="Logo şəkli" style="width: 50px; height: 50px; object-fit: cover;">
                            ` : "Şəkil yoxdur"}
                        </td>
                        <td>
                            <span class="btn btn-lg status ${newsItem.logoVisibility ? "active" : "inactive"}" data-id="${newsItem.logoId}">
                                ${newsItem.logoVisibility ? "Aktiv" : "Passiv"}
                            </span>
                        </td>
                        <td>
                            <a class="text-danger deleteNews btn" data-id="${newsItem.logoId}">
                                <i class="fa-solid fa-trash"></i>
                            </a>
                        </td>
                    `;
                tableBody.appendChild(row);
            });
        })
        .catch((error) => {
            console.error("Xəta:", error);
            alert("Bir xəta baş verdi: " + error.message);
        });
}
fetchNews();

tableBody.addEventListener("click", (e) => {
    const statusButton = e.target.closest(".status");
    if (statusButton) {
        const logoId = statusButton.getAttribute("data-id");
        const currentStatus = statusButton.textContent.trim() === "Aktiv";
        const logoVisibility = !currentStatus;

        fetch(`${baseUrl}/api/logo/${logoId}/visibility`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ IsVisible: logoVisibility }),
        })
            .then((response) => {
                if (!response.ok) {
                    return response.json().then((data) => {
                        throw new Error(data.message || "Durum yenilənə bilmədi.");
                    });
                }

                statusButton.textContent = logoVisibility ? "Aktiv" : "Passiv";
                statusButton.classList.toggle("active", logoVisibility);
                statusButton.classList.toggle("inactive", !logoVisibility);

                Swal.fire({
                    title: 'Uğurlu!',
                    text: 'Logo statusu uğurla yeniləndi!',
                    icon: 'success',
                    confirmButtonText: 'Bağla'
                });
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

function deleteNews(id) {
    Swal.fire({
        title: 'Əminsiniz?',
        text: "Bu logonu silmək istədiyinizə əminsiniz?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Bəli, sil!',
        cancelButtonText: 'Xeyr, ləğv et!'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`${baseUrl}/api/logo/delete/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                }
            })
                .then(response => {
                    if (response.ok) {
                        Swal.fire(
                            'Silindi!',
                            'Logo uğurla silindi.',
                            'success'
                        ).then(() => {
                            location.reload();
                        });
                    } else if (response.status === 404) {
                        Swal.fire(
                            'Xəta!',
                            'Logo tapılmadı.',
                            'error'
                        );
                    } else {
                        Swal.fire(
                            'Xəta',
                            'Logo silinə bilmədi. Xəta kodu: ' + response.status,
                            'error'
                        );
                    }
                })
                .catch(error => {
                    console.error("Xəta baş verdi:", error);
                    Swal.fire(
                        'Server Xətası',
                        'Serverə qoşulmaq mümkün olmadı. Yenidən cəhd edin.',
                        'error'
                    );
                });
        }
    });
}

document.addEventListener("click", function (e) {
    if (e.target.classList.contains("deleteNews")) {
        const logoId = e.target.getAttribute("data-id");
        deleteNews(logoId);
    }
});

