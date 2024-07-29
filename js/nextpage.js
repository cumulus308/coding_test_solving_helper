// 첫 화면에서 입력한 url을 그대로 가져오기
document.addEventListener("DOMContentLoaded", () => {
    const urlInput = document.querySelector('#problem-url');
    const savedUrl = localStorage.getItem('savedURL');


    if (savedUrl) {
        urlInput.value = savedUrl;
    }

    document.querySelector('#url-form').addEventListener('submit', function(event) {
        event.preventDefault();
        const newUrl = urlInput.value;

        // 새로운 url 저장
        localStorage.setItem('savedURL', newUrl);

        // 페이지 새로고침
        location.reload();

    });
});
