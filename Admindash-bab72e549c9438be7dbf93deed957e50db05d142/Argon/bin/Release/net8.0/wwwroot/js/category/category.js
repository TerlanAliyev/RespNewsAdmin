const baseUrl = "https://news.ishop.az"; // Doğru API URL'si

const tableBody = document.querySelector("#categoryTableBody");

const apiUrlAzerbaijan = `${baseUrl}/api/category/language/1`;
const apiUrlEnglish = `${baseUrl}/api/category/language/2`;
const apiUrlRussian = `${baseUrl}/api/category/language/3`;

function fetchCategories(language) {
    tableBody.innerHTML = "";
    let apiUrl;

    if (language === "1") {
        apiUrl = apiUrlAzerbaijan;
    } else if (language === "2") {
        apiUrl = apiUrlEnglish;
    } else if (language === "3") {
        apiUrl = apiUrlRussian;
    }

    fetch(apiUrl)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Kateqoriyalar gətirilə bilmədi.");
            }
            return response.json();
        })
        .then((categories) => {
            if (categories.length === 0) {
                tableBody.innerHTML = "<tr><td colspan='5'>Nəticə tapılmadı.</td></tr>";
                return;
            }

            categories.forEach((category, index) => {
                const row = document.createElement("tr");
                const imageUrl = `${baseUrl}${category.categoryCoverUrl}`;

                row.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${category.categoryName}</td>
                        <td>
                            ${category.categoryCoverUrl?.length > 0 ? `<img src="${imageUrl}" alt="Kateqoriya şəkli" style="width: 50px; height: 50px; object-fit: cover;">` : "Şəkil yoxdur"}
                        </td>
                        <td>
                            <span class="btn btn-lg status ${category.categoryStatus ? "active" : "inactive"}" data-id="${category.categoryId}">
                                ${category.categoryStatus ? "Aktiv" : "Passiv"}
                            </span>
                        </td>
                        <td>
                            <a class="text-danger deleteNews btn" data-id="${category.categoryId}">
                                <i class="fa-solid fa-trash"></i>
                            </a>
                        </td>
                    `;
                tableBody.appendChild(row);
            });
        })
        .catch((error) => {
            Swal.fire({
                title: 'Xəta!',
                text: 'Kateqoriyalar gətirilərkən bir xəta baş verdi.',
                icon: 'error',
                confirmButtonText: 'Bağla'
            });
        });
}

document.getElementById("azelang").addEventListener("click", () => {
    fetchCategories("1");
});

document.getElementById("enlang").addEventListener("click", () => {
    fetchCategories("2");
});

document.getElementById("rulng").addEventListener("click", () => {
    fetchCategories("3");
});

function deleteCategory(id) {
    Swal.fire({
        title: 'Əminsiniz?',
        text: "Bu kateqoriyanı silmək istədiyinizə əminsiniz?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Bəli, sil!',
        cancelButtonText: 'Xeyr, ləğv et!'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`${baseUrl}/api/category/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            })
                .then((response) => {
                    if (response.ok) {
                        Swal.fire(
                            'Kateqoriya silindi!',
                            'Kateqoriya uğurla silindi.',
                            'success'
                        ).then(() => {
                            document.querySelector(`#category-${id}`)?.remove();
                        });
                    } else if (response.status === 404) {
                        Swal.fire(
                            'Xəta!',
                            'Kateqoriya tapılmadı.',
                            'error'
                        );
                    } else {
                        Swal.fire(
                            'Xəta',
                            'Kateqoriya silinə bilmədi. Xəta kodu: ' + response.status,
                            'error'
                        );
                    }
                })
                .catch((error) => {
                    Swal.fire(
                        'Server Xətası',
                        'Serverə müraciət oluna bilmədi. Bir daha cəhd edin.',
                        'error'
                    );
                });
        }
    });
}

document.addEventListener("click", function (e) {
    if (e.target.classList.contains("deleteNews")) {
        const categoryId = e.target.getAttribute("data-id");
        deleteCategory(categoryId);
    }
});

tableBody.addEventListener("click", (e) => {
    const statusButton = e.target.closest(".status");
    if (statusButton) {
        const row = statusButton.closest("tr");
        const categoryId = statusButton.getAttribute("data-id");
        const currentStatus = statusButton.textContent.trim() === "Aktiv";
        const newStatus = !currentStatus;

        fetch(`${baseUrl}/api/category/${categoryId}/visibility`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ IsVisible: newStatus }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Durum yenilənə bilmədi.");
                }
                statusButton.textContent = newStatus ? "Aktiv" : "Passiv";
                statusButton.classList.toggle("active", newStatus);
                statusButton.classList.toggle("inactive", !newStatus);
                Swal.fire({
                    title: 'Uğurlu!',
                    text: 'Status uğurla yeniləndi!',
                    icon: 'success',
                    confirmButtonText: 'Bağla'
                });
            })
            .catch((error) => {
                Swal.fire({
                    title: 'Xəta!',
                    text: 'Status yenilənərkən bir xəta baş verdi.',
                    icon: 'error',
                    confirmButtonText: 'Bağla'
                });
            });
    }
});
    document.getElementById('toggleSection').addEventListener('click', function() {
        const section = document.getElementById('categorySection');
    section.classList.toggle('show');
    });
