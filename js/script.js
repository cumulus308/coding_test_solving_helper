document.getElementById('urlForm').addEventListener('submit', function(event) {
    event.preventDefault(); // 폼의 기본 제출 동작을 막음

    const urlInput = document.getElementById('urlInput').value;

    if (urlInput) {
        localStorage.setItem('savedURL', urlInput);
        alert('URL이 저장되었습니다: ' + urlInput);
    } else {
        alert('URL을 입력해주세요.');
    }
});
