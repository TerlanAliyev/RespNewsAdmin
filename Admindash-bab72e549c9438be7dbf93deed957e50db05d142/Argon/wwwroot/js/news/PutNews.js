
        document.addEventListener("DOMContentLoaded", () => {
        const tagContainer = document.getElementById("tag-container");
        const tagInput = document.getElementById("tag-input");
        const tags = [];

        // Etiket ekleme
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

                // Etiket silme işlevi
                tagElement.querySelector("span").addEventListener("click", () => {
                    tagContainer.removeChild(tagElement);
                    const index = tags.indexOf(tagValue);
                    if (index !== -1) {
                        tags.splice(index, 1);
                    }
                });
            }
        });

        // Form submit sırasında etiketleri backend'e göndermek için
        document.querySelector("form").addEventListener("submit", function (e) {
        e.preventDefault();

        const form = document.getElementById('newsForm');
        const formData = new FormData(form);
        const newsId = document.getElementById('newsId').value;

        fetch(`https://localhost:44314/api/news/id/${newsId}`, {
            method: 'PUT',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(JSON.stringify(err));
                });
            }
            return response.json();
        })
        .then(data => {
            console.log("Başarılı:", data);
            alert(data.Message);
        })
        .catch(error => {
            console.error('Hata:', error.message);
            alert(`Güncelleme sırasında bir hata oluştu: ${error.message}`);
        });
    });



    document.addEventListener("DOMContentLoaded", function () {
        const langSelect = document.getElementById('newsLangId');
        const ownerSelect = document.getElementById('newsOwnerId');
        const adminSelect = document.getElementById('newsAdminId');
        const categorySelect = document.getElementById('newsCategoryId');

        // Admin verilerini API'den çek
        async function fetchAdmins() {
            try {
                const response = await fetch('https://localhost:44314/api/user/users');
                const admins = await response.json();
                adminSelect.innerHTML = '<option value="">Admin Seçin</option>';
                admins.forEach(admin => {
                    const option = document.createElement('option');
                    option.value = admin.userId;
                    option.textContent = admin.userName;
                    adminSelect.appendChild(option);
                });
            } catch (error) {
                console.error('Admin verileri alınamadı:', error);
            }
        }

        // Owner verilerini API'den çek
        async function fetchOwners() {
            try {
                const response = await fetch('https://localhost:44314/api/owner');
                const owners = await response.json();
                ownerSelect.innerHTML = '<option value="">Muhabir Seçin</option>';
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

        // Dil verilerini API'den çek
        async function fetchLanguages() {
            try {
                const response = await fetch('https://localhost:44314/api/languages/all');
                const languages = await response.json();
                langSelect.innerHTML = '<option value="">Dil Seçin</option>';
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

        // Kategorileri API'den çek ve dil ID'sine göre filtrele
        async function fetchCategoriesByLanguage(langId) {
            try {
                const response = await fetch(`https://localhost:44314/api/category/language/${langId}`);
                const categories = await response.json();
                categorySelect.innerHTML = '<option value="">Kategori Seçin</option>';
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

        // Dil seçildiğinde kategorileri getir
        langSelect.addEventListener('click', function () {
            const selectedLangId = langSelect.value;
            if (selectedLangId) {
                fetchCategoriesByLanguage(selectedLangId);
            } else {
                categorySelect.innerHTML = '<option value="">Kategori Seçin</option>';
            }
        });

        // Sayfa yüklendiğinde dil ve owner verilerini çek
        fetchLanguages();
        fetchOwners();
        fetchAdmins();
    });
        document.addEventListener('DOMContentLoaded', () => {
        const pathParts = window.location.pathname.split('/');
        const newsId = pathParts[pathParts.length - 1];  // Sayfa URL'sinden haber ID'sini al
        const apiUrl = `https://localhost:44314/api/news/id/${newsId}`;  // API URL'sini oluştur

        const quill = new Quill("#editor", {
            theme: "snow",
            modules: {
                toolbar: "#toolbar",
            },
        });

        // API'den veri çekme
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                // Title ve Content alanları zaten doğru şekilde yüklendi.
                document.getElementById("newsTitle").value = data.newsTitle || '';
                document.getElementById("newsRating").value = data.newsRating || '';
                document.getElementById("newsYoutubeLink").value = data.newsYoutubeLink || '';
                quill.root.innerHTML = data.newsContetText || '';

                // Select element'lerine veri aktarımı
                if (data.newsLangId) {
                    document.getElementById("newsLangId").value = data.newsLangId;
                }
                if (data.newsCategoryId) {
                    document.getElementById("newsCategoryId").value = data.newsCategoryId;
                }

                // Fotoğraf ve video önizlemeleri için
                const photosContainer = document.getElementById("photosPreview");
                if (data.newsPhotos) {
                    data.newsPhotos.forEach(photo => {
                        const img = document.createElement("img");
                        img.src = photo.photoUrl;
                        photosContainer.appendChild(img);
                    });
                }

                const videosContainer = document.getElementById("videosPreview");
                if (data.newsVideos) {
                    data.newsVideos.forEach(video => {
                        const link = document.createElement("a");
                        link.href = video.videoUrl;
                        link.target = "_blank";
                        link.innerText = "Video";
                        videosContainer.appendChild(link);
                    });
                }
            })
            .catch(error => console.error('API hatası:', error));

        document.getElementById("newsForm").addEventListener("submit", async (event) => {
            event.preventDefault();

            const formData = new FormData(event.target);
            const quillContent = quill.root.innerHTML;
            formData.append("newsContetText", quillContent);

            // FormData'dan updateNewsDto'yu oluştur
            const updateNewsDto = {
                NewsTitle: formData.get('newsTitle'),
                NewsContetText: quillContent,
                NewsDate: formData.get('newsDate'),
                NewsCategoryId: formData.get('newsCategoryId'),
                NewsLangId: formData.get('newsLangId'),
                NewsVisibility: formData.get('newsVisibility') === 'on',  // Eğer checkbox kullanıyorsanız
                NewsTags: formData.get('newsTags'),
                NewsRating: parseFloat(formData.get('newsRating')),
                NewsYoutubeLink: formData.get('newsYoutubeLink'),
                NewsOwnerId: formData.get('newsOwnerId'),
                NewsAdminId: formData.get('newsAdminId'),
                NewsPhotos: [],  // Fotoğraf verilerini ekleyebilirsiniz
                NewsVideos: []  // Video verilerini ekleyebilirsiniz
            };

            // Fotoğrafları ekleme (isteğe bağlı)
            const photoFiles = formData.getAll('newsPhotos');  // Form verilerinden fotoğrafları alın
            updateNewsDto.NewsPhotos = photoFiles.map(file => ({ PhotoUrl: file.name }));  // Fotoğraf URL'lerini ekle

            // Videoları ekleme (isteğe bağlı)
            const videoLinks = formData.getAll('newsVideos');  // Form verilerinden video URL'lerini alın
            updateNewsDto.NewsVideos = videoLinks.map(link => ({ VideoUrl: link }));  // Video URL'lerini ekle

            // PUT isteği ile veri gönderme
            fetch(`https://localhost:44314/api/news/id/${newsId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateNewsDto),  // JSON formatında gönder
            })
            .then(response => {
                return response.text();  // Yanıtı metin olarak al
            })
            .then(data => {
                console.log("Sunucu yanıtı:", data);  // Yanıtı yazdır
                // Eğer burada JSON dönüyorsa response.json() ile de işlenebilir
                // console.log('Haber başarıyla güncellendi', data);
            })
            .catch(error => {
                console.error('Hata:', error);
            });
        });
    });

    // Fotoğraf önizlemesi
    document.getElementById('newsPhotos').addEventListener('change', function(event) {
        const photoPreview = document.getElementById('photoPreview');
        const files = event.target.files;
        photoPreview.innerHTML = '';
        for (let i = 0; i < files.length; i++) {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(files[i]);
            img.classList.add('thumbnail');
            photoPreview.appendChild(img);
        }
    });

    // Video önizlemesi
    document.getElementById('newsVideos').addEventListener('change', function(event) {
        const videoPreview = document.getElementById('videoPreview');
        const files = event.target.files;
        videoPreview.innerHTML = '';
        for (let i = 0; i < files.length; i++) {
            const videoLink = document.createElement('a');
            videoLink.href = URL.createObjectURL(files[i]);
            videoLink.innerText = 'Video ' + (i + 1);
            videoLink.target = '_blank';
            videoPreview.appendChild(videoLink);
        }
    });
