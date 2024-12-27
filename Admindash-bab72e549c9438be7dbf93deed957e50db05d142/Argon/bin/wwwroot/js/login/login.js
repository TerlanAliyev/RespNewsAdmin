const isProduction = true; // Bu real mühit üçündür
const baseUrl = "https://news.ishop.az";


document.getElementById('loginForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const nickname = document.getElementById('UserNickName').value;
    const password = document.getElementById('UserPassword').value;

    const loginData = { UserNickName: nickname, UserPassword: password };

    try {
        const response = await fetch(`${baseUrl}/api/user/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData)
        });

        const tokenDto = await response.json();
        console.log('Response status:', response.status);
        console.log('Response data:', tokenDto);

        if (!response.ok) {
            Swal.fire({
                icon: 'error',
                title: 'Giriş Uğursuz Oldu!',
                text: tokenDto.Message || 'İstifadəçi adı və ya şifrə səhvdir.',
                timer: 1000,
                showConfirmButton: false
            });
            return;
        }

        localStorage.setItem('jwtToken', tokenDto.token);

        const decodedToken = parseJwt(tokenDto.token);
        const userName = decodedToken?.userName || 'not found'; 
        localStorage.setItem('userName', userName);

        Swal.fire({
            icon: 'success',
            title: 'Xoş Gəldiniz!',
            text: `Salam, ${userName}. Giriş uğurludur.`,
            timer: 5000,
            showConfirmButton: false
        });

        setTimeout(() => {
            window.location.href = '/Home/Index';
        }, 1000);
    } catch (error) {
        console.error('Network Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Şəbəkə Xətası!',
            text: 'Bir xəta baş verdi. Yenidən cəhd edin.',
            timer: 3000,
            showConfirmButton: false
        });
    }
});

function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1]; 
        const base64 = atob(base64Url.replace(/-/g, '+').replace(/_/g, '/'));
        const decodedToken = JSON.parse(decodeURIComponent(escape(base64)));


        return decodedToken; 
    } catch (error) {
        console.error('Token çözümleme hatası:', error);
        return null;
    }
}


