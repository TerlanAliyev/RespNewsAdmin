
const isProduction = window.location.hostname !== "localhost";
const baseUrl = isProduction ? "https://api.yourdomain.com" : "https://localhost:44314";

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

fetch(`${baseUrl}/api/statistic/AdminMonthlyStatistics`)
    .then(response => response.json())
    .then(data => {

        data.forEach(adminStats => {
            const adminName = adminStats.adminName;
            const yearlyStats = adminStats.yearlyStats;

            const chartContainer = document.createElement('div');
            chartContainer.className = 'swiper-slide';

            chartContainer.innerHTML = `
            <div class="row mt-4 col-lg-12">
              <div class="col-lg-12 mb-lg-0 mb-4">
                <div class="card z-index-2 h-100">
                  <div class="card-header pb-0 pt-3 bg-transparent">
                    <h6 class="text-capitalize">${adminName} - statistikası</h6>
                    <p class="text-sm mb-0">2024</p>
                  </div>
                  <div class="card-body p-3">
                    <div class="chart">
                      <canvas id="chart-${adminName}" class="chart-canvas" height="300" width="670"></canvas>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          `;

            document.querySelector('.swiper-wrapper').appendChild(chartContainer);

            createChart(adminName, yearlyStats);
        });

        initializeSwiper();
    })
    .catch(error => {
        console.error("Veri alınırken hata oluştu:", error);
    });

function createChart(adminName, yearlyStats) {
    const labels = Object.keys(yearlyStats['2024']);
    const data = Object.values(yearlyStats['2024']);

    const ctx = document.getElementById(`chart-${adminName}`).getContext('2d');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `${adminName} - 2024`,
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

function initializeSwiper() {
    new Swiper('.swiper-container', {
        loop: true,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev'
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true
        },
        autoplay: {
            delay: 5000,
        },
        slidesPerView: 1,
    });
}

var win = navigator.platform.indexOf('Win') > -1;
if (win && document.querySelector('#sidenav-scrollbar')) {
    var options = {
        damping: '0.5'
    };
    Scrollbar.init(document.querySelector('#sidenav-scrollbar'), options);
}
