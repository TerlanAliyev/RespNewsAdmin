function parseJwt(token) {
    try {
        const base64 = atob(base64Url.replace(/-/g, '+').replace(/_/g, '/'));
        return JSON.parse(decodeURIComponent(escape(base64)));
    } catch (error) {
        console.error('Token çözümleme hatası:', error);
        return null;
    }
}

window.onload = function () {
    const token = localStorage.getItem('jwtToken');
    if (token) {
        const decodedToken = parseJwt(token);
        const adminId = decodedToken?.userId; 

        if (adminId) {
            const newsAdminIdSelect = document.getElementById('NewsAdminId');
            newsAdminIdSelect.value = adminId; 
        }
    } else {
        console.warn('Token bulunamadı veya geçersiz.');
    }
};




document.addEventListener("DOMContentLoaded", () => {
    const tagContainer = document.getElementById("tag-container");
    const tagInput = document.getElementById("tag-input");
    const tags = [];

    tagInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && tagInput.value.trim() !== "") {
            event.preventDefault();
            const tagValue = tagInput.value.trim();
            tags.push(tagValue);
            console.log(tags);
            const tagElement = document.createElement("div");
            tagElement.classList.add("tag");
            tagElement.innerHTML = `${tagValue} <span>&times;</span>`;

            tagContainer.insertBefore(tagElement, tagInput);
            tagInput.value = "";

            tagElement.querySelector("span").addEventListener("click", () => {
                tagContainer.removeChild(tagElement);
                const index = tags.indexOf(tagValue);
                if (index !== -1) {
                    tags.splice(index, 1);
                }
            });
        }
    });

    document.querySelector("form").addEventListener("submit", function (e) {
        e.preventDefault(); 

        const formData = new FormData(this);
        formData.append("Tags", JSON.stringify(tags));  

        fetch('https://news.ishop.az/api/news', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(result => {
                console.log(result);
                alert("Başarılı: " + JSON.stringify(result));
            })
            .catch(error => {
                console.error("Hata oluştu:", error);
                alert("Hata: " + error.message);
            });
    });
});

document.addEventListener("DOMContentLoaded", function () {
    console.log('Sayfa yüklendi ve script çalışmaya başladı.');

    const langSelect = document.getElementById('newsLangId');
    const ownerSelect = document.getElementById('newsOwnerId');
    const categorySelect = document.getElementById('newsCategoryId');


    async function fetchOwners() {
        try {
            const response = await fetch('https://news.ishop.az/api/owner');
            const owners = await response.json();
            ownerSelect.innerHTML = '<option value="">Müxbir seçin</option>';
            owners.forEach(owner => {
                const option = document.createElement('option');
                option.value = owner.ownerId;
                option.textContent = owner.ownerName;
                ownerSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Owner verileri alınamadı:', error);
        }
    }

    async function fetchLanguages() {
        try {
            const response = await fetch('https://news.ishop.az/api/languages/all');
            const languages = await response.json();
            langSelect.innerHTML = '<option value="">Dil seçin</option>';
            languages.forEach(language => {
                const option = document.createElement('option');
                option.value = language.languageId;
                option.textContent = language.languageName;
                langSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Dil verileri alınamadı:', error);
        }
    }

    async function fetchCategoriesByLanguage(langId) {
        try {
            const response = await fetch(`https://news.ishop.az/api/category/language/${langId}`);
            const categories = await response.json();
            categorySelect.innerHTML = '<option value="">Dil seçin</option>';
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.categoryId;
                option.textContent = category.categoryName;
                categorySelect.appendChild(option);
            });
        } catch (error) {
            console.error('Kategori verileri alınamadı:', error);
        }
    }

    langSelect.addEventListener('change', function () {
        const selectedLangId = langSelect.value;
        if (!selectedLangId) {
            categorySelect.innerHTML = '<option value="">Kateqoriya seçin</option>';
            return;
        }
        fetchCategoriesByLanguage(selectedLangId);
    });

    fetchLanguages();
    fetchOwners();
});

// Quill editor setup
const toolbarOptions = {
    container: "#toolbar",
    handlers: {
        image: () => {
            const input = document.createElement("input");
            input.setAttribute("type", "file");
            input.setAttribute("accept", "image/*");
            input.click();
            input.onchange = () => {
                const file = input.files[0];
                const reader = new FileReader();
                reader.onload = () => {
                    const range = quill.getSelection();
                    quill.insertEmbed(range.index, "image", reader.result);
                };
                reader.readAsDataURL(file);
            };
        },
    },
};

const quill = new Quill("#editor", {
    theme: "snow",
    modules: {
        toolbar: toolbarOptions,
    },
});

document.getElementById("newsForm").addEventListener("submit", async (event) => {
    event.preventDefault(); 

    const formData = new FormData(event.target);

    const quillContent = quill.root.innerHTML;
    formData.append("NewsContetText", quillContent);

 

    try {
        const response = await fetch("https://news.ishop.az/api/news", {
            method: "POST",
            body: formData,
        });

        if (response.ok) {
            const result = await response.json();
            Swal.fire({
                icon: 'success',
                title: 'Başarılı!',
                text: 'Haber başarıyla gönderildi!',
            }).then(() => {
                window.location.href = '/home/news'; // Yönlendirme
            });
        } else {
            const errorText = await response.text();
            Swal.fire({
                icon: 'error',
                title: 'Hata!',
                text: 'Bir hata oluştu: ' + errorText,
            });
        }
    } catch (error) {
        console.error("İstek başarısız oldu:", error);
        Swal.fire({
            icon: 'error',
            title: 'Bağlantı Hatası!',
            text: 'Sunucuya bağlanırken bir hata oluştu.',
        });
    }
});
document.getElementById('newsPhotos').addEventListener('change', function (event) {
    const photoPreview = document.getElementById('photoPreview');
    const files = event.target.files;

    if (files.length > 0) {
        const file = files[0];
        const reader = new FileReader();
        reader.onload = function (e) {
            photoPreview.src = e.target.result;
            photoPreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        photoPreview.style.display = 'none';
    }
});

document.getElementById('newsVideos').addEventListener('change', function (event) {
    const videoPreviewContainer = document.createElement('div');
    const files = event.target.files;
    const videoPreview = document.getElementById('videoPreviewContainer');

    videoPreview.innerHTML = '';

    Array.from(files).forEach((file, index) => {
        const videoElement = document.createElement('video');
        videoElement.src = URL.createObjectURL(file);
        videoElement.controls = true;
        videoElement.style.maxWidth = '200px';
        videoElement.style.marginRight = '10px';
        videoPreviewContainer.appendChild(videoElement);
    });

    videoPreview.innerHTML = '';  
    videoPreview.appendChild(videoPreviewContainer);
});



