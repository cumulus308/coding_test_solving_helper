// 전역 변수
let allHints = [];
let solution = '';

// DOM이 로드된 후 실행되는 초기화 함수
document.addEventListener("DOMContentLoaded", initializeApp);
// 초기 상태 설정
function initializeApp() {
    const urlInput = document.querySelector('#problem-url');
    const savedUrl = localStorage.getItem('savedURL');

    if (savedUrl) {
        urlInput.value = savedUrl; // URL창에 저장된 URL을 출력
        loadProblemData(savedUrl);
    }

    setupEventListeners();
}

// 버튼 눌렀을 때 작동하는 함수
function setupEventListeners() {
    document.querySelector('#url-form').addEventListener('submit', handleUrlSubmit);
    document.querySelector('#hint-one').addEventListener('click', () => showHint(0));
    document.querySelector('#hint-two').addEventListener('click', () => showHint(1));
    document.querySelector('#hint-three').addEventListener('click', () => showHint(2));
    document.querySelector('#answer').addEventListener('click', showAnswer);
}

// submit 눌렀을 때 함수
function handleUrlSubmit(event) {
    event.preventDefault();
    // 창의 새로고침을 막음 // a태그 submit 태그에서 많이 사용됨
    const urlInput = document.querySelector('#problem-url');
    const newUrl = urlInput.value;
    localStorage.setItem('savedURL', newUrl);
    loadProblemData(newUrl);
}

// URL을 받아서 문제와 힌트를 불러오는 함수
async function loadProblemData(url) {
    await displayProblemContent(url);
    await displayProblemHint(url);
}

// 문제 내용을 가져와 표시하는 함수
async function displayProblemContent(url) {
    // const proxyUrl = 'https://cors-anywhere.herokuapp.com/'
    // CORS 보안정책으로 인해 무조건 써야 하는줄 알았으나, CORS가 허용되어 있었음
    const problemContentDiv = document.querySelector('#problem-content');
    problemContentDiv.textContent = `문제 URL: ${url}`; // 문제가 로딩 중 나올 내용
    try {
        // URL에서 비동기로 HTML을 가져와서 DOM객체로 변환시킴
        const response = await fetch(url);
        const html = await response.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');

        // 원하는 부분을 클래스를 이용하여 선택함
        const titleElement = doc.querySelector('.challenge-title');
        const contentElement = doc.querySelector('.markdown.solarized-dark');

        // 삼항연산자를 사용하여 출력될 내용을 변수에 저장
        const title = titleElement ? titleElement.textContent.trim() : '제목을 가져올 수 없습니다';
        const content = contentElement ? contentElement.innerHTML : '내용을 가져올 수 없습니다';

        // 화면에 출력
        problemContentDiv.innerHTML = `<h2>${title}</h2>${content}`;
        return content; // 문제 내용을 프롬프트에서 재사용하기 위해 반환
    } catch (error) {
        console.error('Error fetching problem content:', error);
        problemContentDiv.textContent = '문제 내용을 가져오는 중 오류가 발생했습니다.';
    }
}

// 힌트와 해답을 가져오는 함수
async function displayProblemHint(requestUrl) {
    const responseContent = await displayProblemContent(requestUrl);
    // 크롤링으로 받아온 문제 내용을 재사용하기 위한 변수
    const apiUrl = `https://open-api.jejucodingcamp.workers.dev/`;

    const data = [
        { role: "system", content: "assistant는 코딩테스트 문제푸는 것을 도와주는 친절한 강사이다." },
        { role: "user", content: createPrompt(responseContent) }
    ];

    try {
        console.log('Sending API request...');
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        console.log('API response received:', response);
        const json = await response.json();
        if (json.choices && json.choices.length > 0 && json.choices[0].message) {
            const hintContent = json.choices[0].message.content;
            console.log(hintContent);
            const extractedData = extractHintsAndSolution(hintContent); // JSON에서 힌트와 정답을 추출함

            allHints = [extractedData.hintOne, extractedData.hintTwo, extractedData.hintThree]; // 추출한 객체에서 원하는 부분을 가져와서 배열을 만듦
            solution = extractedData.answer;

            showHint(0); // 첫 번째 힌트 표시
        } else {
            console.error('Invalid response structure:', json);
        }
    } catch (error) {
        console.error('Error communicating with OpenAI:', error);
    }
}

// data의 'user'의 'content' 부분에 들어가는 프롬프트
function createPrompt(responseContent) {
    return `1. (${responseContent})에서 문제를 확인 2. 해당 문제에 대한 힌트와 답을 작성해 3. 힌트를 세 부분으로 나누어 줘 4. 너의 답변은 다음과 같은 양식말고는 하면 안돼

    - 1번 힌트 :
        [힌트 내용]
        =====

    - 2번 힌트 :
        [힌트 내용]
        =====

    - 3번 힌트 :
        [힌트 내용]
        =====

    - 정답 :
        [코드]
        =====`;
}

// 정규표현식을 사용하여 원하는 내용 추출
function extractHintsAndSolution(content) {
    const hintRegex = /- \d번 힌트\s*:\s*([\s\S]*?)(?:\s*=====|$)/g;
    const solutionRegex = /- 정답\s*:\s*```\s*([\s\S]+?)(?:\s*=====|$)/;
    let hints = [];
    let match;

    while ((match = hintRegex.exec(content)) !== null) {
        hints.push(match[1].trim());
        // 캡쳐한 부분만을 hints배열에 추가
    }

    const solutionMatch = solutionRegex.exec(content); // 정규분포에 해당하는 내용을 배열로 반환
    const solution = solutionMatch ? solutionMatch[1].trim() : null;

    return {
        hintOne: hints[0] || '',
        hintTwo: hints[1] || '',
        hintThree: hints[2] || '',
        answer: solution
    };
}

// 힌트 내용을 구하는 함수
function showHint(index) {
    if (index >= 0 && index < allHints.length) {
        printAnswer(allHints[index]);
    } else {
        console.error(`Hint ${index + 1} not available`);
        printAnswer('죄송합니다. f12를 눌러 console에서 확인해주세요.')
    }
}

// 정답 내용을 구하는 함수
function showAnswer() {
    if (solution) {
        const cleanedSolution = solution.replace(/=====/, '').trim();
        printAnswer(`- 정답 :\n\`\`\`\n${cleanedSolution}\n\`\`\``);
    } else {
        console.error('Solution not available');
        printAnswer('죄송합니다. f12를 눌러 console에서 확인해주세요.')
    }
}

// 힌트와 정답을 그려주는 함수
function printAnswer(answer) {
    let hintDiv = document.querySelector("#hint");
    hintDiv.innerHTML = answer.replace(/\n/g, '<br>');
}
