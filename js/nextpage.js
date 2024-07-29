// 첫 화면에서 입력한 url을 그대로 가져오기
document.addEventListener("DOMContentLoaded", () => {
    const urlInput = document.querySelector('#problem-url');
    const savedUrl = localStorage.getItem('savedURL');


    if (savedUrl) {
        urlInput.value = savedUrl;
        displayProblemContent(savedUrl);
    }

    document.querySelector('#url-form').addEventListener('submit', function(event) {
        event.preventDefault();
        const newUrl = urlInput.value;

        // 새로운 url 저장
        localStorage.setItem('savedURL', newUrl);

        // 페이지 새로고침
        displayProblemContent(newUrl);
    });
});

// 페이지에 문제를 가져오는 함수
async function displayProblemContent(url) {
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/'
    const problemContentDiv = document.querySelector('#problem-content');
    problemContentDiv.textContent = `문제 URL: ${url}`;
    try {
        const response = await fetch(proxyUrl + url);
        const html = await response.text();

        // HTML 문자열을 파싱하여 DOM 객체로 변환
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // 필요한 데이터 추출
        const titleElement = doc.querySelector('.challenge-title');
        const contentElement = doc.querySelector('.markdown.solarized-dark');

        const title = titleElement ? titleElement.textContent.trim() : '제목을 가져올 수 없습니다';
        const content = contentElement ? contentElement.innerHTML : '내용을 가져올 수 없습니다';

        // 추출한 데이터 표시
        problemContentDiv.innerHTML = `<h2>${title}</h2>${content}`;
    } catch (error) {
        console.error('Error fetching problem content:', error);
        problemContentDiv.textContent = '문제 내용을 가져오는 중 오류가 발생했습니다.';
    }
}
