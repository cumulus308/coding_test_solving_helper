document.getElementById('urlForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const urlInput = document.getElementById('urlInput').value;

    if (urlInput) {
        localStorage.setItem('savedURL', urlInput);
        window.location.href = './html/nextpage.html'; // 절대 경로로 설정
    } else {
        alert('URL을 입력해주세요.');
    }
});
