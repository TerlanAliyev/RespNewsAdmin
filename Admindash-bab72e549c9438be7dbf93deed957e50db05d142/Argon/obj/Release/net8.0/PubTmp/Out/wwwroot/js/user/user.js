const baseUrl = "https://news.ishop.az"; // Doğru API URL'si

let page = 0; 

document.getElementById("searchButton").addEventListener("click", () => {
    const query = document.getElementById("searchInput").value.trim();

    if (!query) {
        Swal.fire({
            icon: 'warning',
            title: 'Search Warning',
            text: 'Search query cannot be empty!',
            confirmButtonText: 'Close'
        });
        return;
    }

    // Send GET request to API
    fetch(`${baseUrl}/api/search/user/${encodeURIComponent(query)}/${page}`, {
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
            tableBody.innerHTML = ""; // Clear existing results

            if (data.length === 0) {
                tableBody.innerHTML = "<tr><td colspan='5'>No results found.</td></tr>";
                return;
            }

            data.forEach((user, index) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                        <th scope="row">${index + 1}</th>
                        <td>${user.userName}</td>
                        <td>${user.userNickName}</td>
                        <td>${user.userEmail}</td>
                        <td>${user.userRole}</td>
                        <td>
                            <a class="text-danger deleteUser btn" data-id="${user.userId}">
                                <i class="fa-solid fa-trash"></i>
                            </a>
                        </td>
                    `;
                tableBody.appendChild(row);
            });
        })
        .catch((error) => {
            console.error("Error:", error);
            Swal.fire({
                icon: 'error',
                title: 'Search Error',
                text: `An error occurred while processing the request: ${error.message}`,
                confirmButtonText: 'Close'
            });
        });
});

document.addEventListener("DOMContentLoaded", () => {
    const apiUrl = `${baseUrl}/api/user/users`;
    const tableBody = document.getElementById("categoryTableBody");

    // Fetch users from API
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch user data.");
            }
            return response.json();
        })
        .then(users => {
            tableBody.innerHTML = ""; // Clear existing table

            users.forEach((user, index) => {
                const row = document.createElement("tr");

                row.innerHTML = `
                        <th scope="row">${index + 1}</th>
                        <td>${user.userName}</td>
                        <td>${user.userNickName}</td>
                        <td>${user.userEmail}</td>
                        <td>${user.userRole}</td>
                        <td>
                            <a class="text-danger deleteUser btn" data-id="${user.userId}">
                                <i class="fa-solid fa-trash"></i>
                            </a>
                        </td>
                    `;

                tableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error("Error:", error);
            alert("An error occurred while loading user data.");
        });
});

function deleteUser(id) {
    Swal.fire({
        title: 'Are you sure?',
        text: "Do you really want to delete this user?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete!',
        cancelButtonText: 'No, cancel!'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`${baseUrl}/api/user/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                }
            })
                .then(response => {
                    if (response.ok) {
                        Swal.fire(
                            'Deleted!',
                            'User has been deleted successfully.',
                            'success'
                        ).then(() => {
                            window.location.replace("/home/users");
                        });
                    } else if (response.status === 404) {
                        Swal.fire(
                            'Error!',
                            'User not found.',
                            'error'
                        );
                    } else {
                        Swal.fire(
                            'Error!',
                            `Failed to delete user. Error code: ${response.status}`,
                            'error'
                        );
                    }
                })
                .catch(error => {
                    console.error("Error occurred:", error);
                    Swal.fire(
                        'Server Error!',
                        'Could not reach the server. Please try again.',
                        'error'
                    );
                });
        }
    });
}

document.addEventListener("click", function (e) {
    if (e.target.classList.contains("deleteUser")) {
        const userId = e.target.getAttribute("data-id");
        deleteUser(userId);
    }
});