document.getElementById('urlForm').addEventListener('submit', function(event) {
    event.preventDefault(); // 폼의 기본 제출 동작을 막음

    const urlInput = document.getElementById('urlInput').value;

    if (urlInput) {
        localStorage.setItem('savedURL', urlInput);
        window.location.href = 'templates/nextpage.html'; // templates/nextpage.html 페이지로 이동
    } else {
        alert('URL을 입력해주세요.');
    }
});
