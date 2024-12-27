const baseUrl = "https://news.ishop.az"; // Doğru API URL'si

let page = 0; 

// Search videos
function searchVideos(query) {
    fetch(`${baseUrl}/api/search/videos/${encodeURIComponent(query)}/${page}`, {
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

            data.forEach((newsItem, index) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                        <td>${index + 1 + page * 10}</td>
                        <td>
                            <iframe src="${convertToEmbedUrl(newsItem.videoUrl)}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                        </td>
                        <td>${newsItem.videoTitle}</td>
                        <td>${new Date(newsItem.videoDate).toLocaleDateString()}</td>
                        <td>
                            <a href="/Home/PutYT/${newsItem.videoId}" class="text-primary me-2 btn">
                                <i class="fa-solid fa-pen"></i>
                            </a>
                            <a class="text-danger deleteNews btn" data-id="${newsItem.videoId}">
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
}

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

    searchVideos(query);
});

// Convert YouTube URL to embed URL
function convertToEmbedUrl(url) {
    if (!url) {
        console.error("URL is undefined or null");
        return null;
    }

    url = url.split('?')[0]; // Remove parameters

    const regex = /(?:youtu\.be\/|youtube\.com\/(?:[^\/]+\/[^\/]+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=))([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}`;
    }

    console.error("Invalid video URL:", url);
    return null;
}

// Fetch videos for pagination
function fetchVideos(page) {
    const tableBody = document.querySelector("tbody");
    tableBody.innerHTML = ""; // Clear previous data

    const url = new URL(`${baseUrl}/api/Youtube/videos/${page}`);
    fetch(url)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Failed to fetch videos.");
            }
            return response.json();
        })
        .then((videos) => {
            if (videos.length === 0) {
                document.getElementById("nextPage").disabled = true;
                if (page > 0) page--;
                return;
            }

            videos.forEach((video, index) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                        <td>${index + 1 + page * 10}</td>
                        <td>
                            <iframe src="${convertToEmbedUrl(video.videoUrl)}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                        </td>
                        <td>${video.videoTitle}</td>
                        <td>${new Date(video.videoDate).toLocaleDateString()}</td>
                        <td>
                            <a href="/Home/PutYT/${video.videoId}" class="text-primary me-2 btn">
                                <i class="fa-solid fa-pen"></i>
                            </a>
                            <a class="text-danger deleteNews btn" data-id="${video.videoId}">
                                <i class="fa-solid fa-trash"></i>
                            </a>
                        </td>
                    `;
                tableBody.appendChild(row);
            });

            document.getElementById("nextPage").disabled = videos.length < 10;
        })
        .catch((error) => {
            console.error("Error:", error);
        });
}

// Initial fetch
fetchVideos(page);

document.getElementById("prevPage").addEventListener("click", () => {
    if (page > 0) {
        page--;
        fetchVideos(page);
        document.getElementById("currentPage").textContent = page + 1;
        document.getElementById("nextPage").disabled = false;
    }
});

document.getElementById("nextPage").addEventListener("click", () => {
    page++;
    fetchVideos(page);
    document.getElementById("currentPage").textContent = page + 1;
    document.getElementById("prevPage").disabled = page === 0;
});

// Delete video
function deleteVideo(id) {
    Swal.fire({
        title: "Are you sure?",
        text: "Do you really want to delete this video? This action cannot be undone!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete!",
        cancelButtonText: "No, cancel!"
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`${baseUrl}/api/Youtube/delete/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                }
            })
                .then(response => {
                    if (response.ok) {
                        Swal.fire(
                            "Deleted!",
                            "Video has been deleted successfully.",
                            "success"
                        ).then(() => {
                            fetchVideos(page); // Refresh the page
                        });
                    } else {
                        throw new Error(`Error: ${response.status}`);
                    }
                })
                .catch(error => {
                    console.error("Error occurred:", error);
                    Swal.fire("Server Error!", "Could not reach the server. Please try again.", "error");
                });
        }
    });
}

document.addEventListener("click", function (e) {
    if (e.target.classList.contains("deleteNews")) {
        const videoId = e.target.getAttribute("data-id");
        deleteVideo(videoId);
    }
});
