const baseUrl = "https://news.ishop.az"; // Doğru API URL'si


let page = 0; 

document.getElementById("searchButton").addEventListener("click", () => {
    const query = document.getElementById("searchInput").value.trim();

    if (!query) {
        Swal.fire({
            icon: 'warning',
            title: 'Link Araşdırması',
            text: 'Axtarış sorğusu boş ola bilməz!',
            confirmButtonText: 'Bağla'
        });
        return;
    }

    fetch(`${baseUrl}/api/search/link/${encodeURIComponent(query)}/${page}`, {
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

            data.forEach((link, index) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${link.linkName}</td>
                        <td>
                            <img src="${link.linkCoverUrl ? baseUrl + link.linkCoverUrl : ''}" alt="Link Fotoğrafı" style="width: 50px; height: 50px; object-fit: cover;">
                        </td>
                        <td>
                            <span class="btn btn-lg status ${link.linkVisibility ? 'active' : 'inactive'}">
                                ${link.linkVisibility ? 'Aktiv' : 'Passiv'}
                            </span>
                        </td>
                        <td>
                            <a href="${link.linkUrl}" class="text-primary me-2 btn" target="_blank">
                                <i class="fa-solid fa-link"></i>
                            </a>
                            <a href="/Home/PutLinks/${link.linkId}" class="text-primary me-2 btn">
                                <i class="fa-solid fa-pen"></i>
                            </a>
                            <a class="text-danger deleteLink btn" data-id="${link.linkId}">
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

const apiUrl = `${baseUrl}/api/Links`;
const tableBody = document.querySelector("tbody");

function fetchLinks() {
    tableBody.innerHTML = ""; 

    fetch(apiUrl)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Linklər gətirilə bilmədi");
            }
            return response.json();
        })
        .then((links) => {
            links.forEach((link, index) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${link.linkName}</td>
                        <td>
                            <img src="${link.linkCoverUrl ? baseUrl + link.linkCoverUrl : ''}" alt="Link Fotoğrafı" style="width: 50px; height: 50px; object-fit: cover;">
                        </td>
                        <td>
                            <span class="btn btn-lg status ${link.linkVisibility ? 'active' : 'inactive'}">
                                ${link.linkVisibility ? 'Aktiv' : 'Passiv'}
                            </span>
                        </td>
                        <td>
                            <a href="${link.linkUrl}" class="text-primary me-2 btn" target="_blank">
                                <i class="fa-solid fa-link"></i>
                            </a>
                            <a href="/Home/PutLinks/${link.linkId}" class="text-primary me-2 btn">
                                <i class="fa-solid fa-pen"></i>
                            </a>
                            <a class="text-danger deleteLink btn" data-id="${link.linkId}">
                                <i class="fa-solid fa-trash"></i>
                            </a>
                        </td>
                    `;
                tableBody.appendChild(row);
            });
        })
        .catch((error) => {
            console.error("Hata:", error);
        });
}

tableBody.addEventListener("click", (e) => {
    const statusButton = e.target.closest(".status");
    if (statusButton) {
        const row = statusButton.closest("tr");
        const linkId = row.querySelector(".deleteLink").getAttribute("data-id");
        const currentStatus = statusButton.textContent.trim() === "Aktiv";
        const newStatus = !currentStatus;

        fetch(`${apiUrl}/${linkId}/visibility`, {
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
                        text: 'Link statusu uğurla yeniləndi!',
                        icon: 'success',
                        confirmButtonText: 'Bağla',
                    });
                } else {
                    throw new Error("Durum yenilənə bilmədi.");
                }
            })
            .catch((error) => {
                console.error("Hata:", error);

                Swal.fire({
                    title: 'Xəta!',
                    text: 'Status yenilənərkən bir xəta baş verdi.',
                    icon: 'error',
                    confirmButtonText: 'Bağla',
                });
            });
    }
});

fetchLinks();

document.addEventListener("click", function (e) {
    if (e.target.classList.contains("deleteLink")) {
        const linkId = e.target.getAttribute("data-id");
        deleteLink(linkId);
    }
});

function deleteLink(id) {
    Swal.fire({
        title: 'Əminsiniz?',
        text: "Bu linki silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Bəli, sil!',
        cancelButtonText: 'Xeyr, ləğv et!'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`${apiUrl}/id/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                }
            })
                .then(response => {
                    if (response.ok) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Silindi!',
                            text: 'Link uğurla silindi.',
                            showConfirmButton: false,
                            timer: 1500
                        }).then(() => {
                            fetchLinks();
                        });
                    } else if (response.status === 404) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Tapılmadı!',
                            text: 'Link tapılmadı.'
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Xəta!',
                            text: `Link silinmədi. Xəta kodu: ${response.status}`
                        });
                    }
                })
                .catch(error => {
                    console.error("Xəta baş verdi:", error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Xəta!',
                        text: 'Serverə qoşulmaq mümkün olmadı. Bir daha cəhd edin.'
                    });
                });
        }
    });
}
