











var swiper2 = new Swiper(".mySwiper2", {
	direction: "vertical",
	pagination: {
		el: ".swiper-pagination",
		clickable: true,
	},
});
var swiper1 = new Swiper(".mySwiper", {
	spaceBetween: 30,
	centeredSlides: true,
	autoplay: {
		delay: 2500,
		disableOnInteraction: false,
	},
	pagination: {
		el: ".swiper-pagination",
		clickable: true,
	},
	navigation: {
		nextEl: ".swiper-button-next",
		prevEl: ".swiper-button-prev",
	},
});
fetch('https://localhost:44314/api/statistic/OwnerMonthlyStatistics')
	.then(response => response.json())  // API'den gelen veriyi JSON formatında al
	.then(data => {

		// Gelen veriyi kullanarak her owner için bir swiper slide ekleyelim
		data.forEach(ownerStats => {
			const ownerName = ownerStats.ownerName;
			const yearlyStats = ownerStats.yearlyStats;

			// Yeni bir swiper slide (div) oluşturuyoruz
			const chartContainer = document.createElement('div');
			chartContainer.className = 'swiper-slide';  // Swiper slide'ı için gerekli sınıf

			// İçeriği dinamik olarak oluşturuyoruz
			chartContainer.innerHTML = `
			<div class="row mt-4 col-lg-12">
			  <div class="col-lg-12 mb-lg-0 mb-4">
				<div class="card z-index-2 h-100">
				  <div class="card-header pb-0 pt-3 bg-transparent">
					<h6 class="text-capitalize">${ownerName} - statistikasi</h6>
					<p class="text-sm mb-0">2024</p>
				  </div>
				  <div class="card-body p-3">
					<div class="chart">
					  <canvas id="chart-${ownerName}" class="chart-canvas" height="300" width="670"></canvas>
					</div>
				  </div>
				</div>
			  </div>
			</div>
		  `;

			// Oluşturduğumuz chart container'ı swiper-wrapper içine ekliyoruz
			document.querySelector('.swiper-wrapper').appendChild(chartContainer);

			// Grafik oluşturma fonksiyonunu çağırıyoruz (Chart.js ile)
			createChart(ownerName, yearlyStats);
		});

		// Swiper'ı başlatıyoruz (Veri yüklendikten sonra)
		initializeSwiper();
	})
	.catch(error => {
		console.error("Veri alınırken hata oluştu:", error);
	});

function createChart(ownerName, yearlyStats) {
	// Chart.js için grafik verilerini hazırlıyoruz
	const labels = Object.keys(yearlyStats[2024]);  // Yılın ayları
	const data = Object.values(yearlyStats[2024]); // Aylık haber sayıları

	const ctx = document.getElementById(`chart-${ownerName}`).getContext('2d');  // Grafik için canvas'ı al

	new Chart(ctx, {
		type: 'line',
		data: {
			labels: labels,
			datasets: [{
				label: `${ownerName} - 2024`,
				data: data,
				borderColor: '#5e72e4',
				backgroundColor: 'rgba(94, 114, 228, 0.2)',
				borderWidth: 2,
				fill: true
			}]
		},
		options: {
			responsive: true,
			plugins: {
				legend: {
					display: false
				}
			},
			scales: {
				x: {
					grid: { display: false }
				},
				y: {
					ticks: {
						beginAtZero: true
					}
				}
			}
		}
	});
}

// Swiper'ı başlatan fonksiyon
function initializeSwiper() {
	new Swiper('.swiper-container', {
		loop: true,  // Loop özelliğini aktif ediyoruz
		navigation: {
			nextEl: '.swiper-button-next',
			prevEl: '.swiper-button-prev'
		},
		pagination: {
			el: '.swiper-pagination',
			clickable: true
		},
		autoplay: {
			delay: 5000,  // Her 5 saniyede bir geçiş yapılacak
		},
		slidesPerView: 1, // Bir seferde bir slide göster
	});
}
var win = navigator.platform.indexOf('Win') > -1;
if (win && document.querySelector('#sidenav-scrollbar')) {
	var options = {
		damping: '0.5'
	}
	Scrollbar.init(document.querySelector('#sidenav-scrollbar'), options);
}