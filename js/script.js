document.getElementById('urlForm').addEventListener('submit', function(event) {
    event.preventDefault(); // 폼의 기본 제출 동작을 막음

    const urlInput = document.getElementById('urlInput').value;

    if (urlInput) {
        localStorage.setItem('savedURL', urlInput);
        window.location.href = '/coding_test_solving_helper/templates/nextpage.html'; // 절대 경로로 설정
    } else {
        alert('URL을 입력해주세요.');
    }
});
