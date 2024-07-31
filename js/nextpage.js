// 전역 변수
let allHints = [];
let solution = '';

// DOM이 로드된 후 실행되는 초기화 함수
document.addEventListener("DOMContentLoaded", initializeApp);

function initializeApp() {
    const urlInput = document.querySelector('#problem-url');
    const savedUrl = localStorage.getItem('savedURL');

    if (savedUrl) {
        urlInput.value = savedUrl;
        loadProblemData(savedUrl);
    }

    setupEventListeners();
}

function setupEventListeners() {
    document.querySelector('#url-form').addEventListener('submit', handleUrlSubmit);
    document.querySelector('#hint-one').addEventListener('click', () => showHint(0));
    document.querySelector('#hint-two').addEventListener('click', () => showHint(1));
    document.querySelector('#hint-three').addEventListener('click', () => showHint(2));
    document.querySelector('#answer').addEventListener('click', showAnswer);
}

function handleUrlSubmit(event) {
    event.preventDefault();
    const urlInput = document.querySelector('#problem-url');
    const newUrl = urlInput.value;
    localStorage.setItem('savedURL', newUrl);
    loadProblemData(newUrl);
}

async function loadProblemData(url) {
    await displayProblemContent(url);
    await displayProblemHint(url);
}

// 문제 내용을 가져와 표시하는 함수
async function displayProblemContent(url) {
    const problemContentDiv = document.querySelector('#problem-content');
    problemContentDiv.textContent = `문제 URL: ${url}`;
    try {
        const response = await fetch(url);
        const html = await response.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');

        const titleElement = doc.querySelector('.challenge-title');
        const contentElement = doc.querySelector('.markdown.solarized-dark');

        const title = titleElement ? titleElement.textContent.trim() : '제목을 가져올 수 없습니다';
        const content = contentElement ? contentElement.innerHTML : '내용을 가져올 수 없습니다';

        problemContentDiv.innerHTML = `<h2>${title}</h2>${content}`;
        return content;
    } catch (error) {
        console.error('Error fetching problem content:', error);
        problemContentDiv.textContent = '문제 내용을 가져오는 중 오류가 발생했습니다.';
    }
}

// 힌트와 해답을 가져오는 함수
async function displayProblemHint(requestUrl) {
    const responseContent = await displayProblemContent(requestUrl);
    const apiUrl = `https://open-api.jejucodingcamp.workers.dev/`;

    const data = [
        { role: "system", content: "assistant는 코딩테스트 문제푸는 것을 도와주는 친절한 강사이다." },
        { role: "user", content: createPrompt(responseContent) }
    ];

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const json = await response.json();
        if (json.choices && json.choices.length > 0 && json.choices[0].message) {
            const hintContent = json.choices[0].message.content;
            const extractedData = extractHintsAndSolution(hintContent);

            allHints = [extractedData.hintOne, extractedData.hintTwo, extractedData.hintThree];
            solution = extractedData.answer;

            showHint(0); // 첫 번째 힌트 표시
        } else {
            console.error('Invalid response structure:', json);
        }
    } catch (error) {
        console.error('Error communicating with OpenAI:', error);
    }
}

function createPrompt(responseContent) {
    return `1. (${responseContent})에서 문제를 확인 2. 해당 문제에 대한 힌트와 답을 작성해 3. 힌트를 세 부분으로 나누어 줘 4. 너의 답변은 다음과 같은 양식말고는 하면 안돼

    - 1번째 힌트 :
        [힌트 내용]
        =====

    - 2번째 힌트 :
        [힌트 내용]
        =====

    - 3번째 힌트 :
        [힌트 내용]
        =====

    - 정답 :
        [코드]
        =====`;
}

function extractHintsAndSolution(content) {
    const hintRegex = /- \d+번째 힌트\s*:\s*([\s\S]*?)(?:\s*=====|$)/g;
    const solutionRegex = /- 정답\s*:\s*```\s*([\s\S]+?)(?:\n=====|$)/;
    let hints = [];
    let match;

    while ((match = hintRegex.exec(content)) !== null) {
        hints.push(match[1].trim());
    }

    const solutionMatch = solutionRegex.exec(content);
    const solution = solutionMatch ? solutionMatch[1].trim() : null;

    return {
        hintOne: hints[0] || '',
        hintTwo: hints[1] || '',
        hintThree: hints[2] || '',
        answer: solution
    };
}

function showHint(index) {
    if (index >= 0 && index < allHints.length) {
        printAnswer(allHints[index]);
    } else {
        console.error(`Hint ${index + 1} not available`);
    }
}

function showAnswer() {
    if (solution) {
        const cleanedSolution = solution.replace(/=====/, '').trim();
        printAnswer(`- 정답 :\n\`\`\`\n${cleanedSolution}\n\`\`\``);
    } else {
        console.error('Solution not available');
    }
}

function printAnswer(answer) {
    let hintDiv = document.querySelector("#hint");
    hintDiv.innerHTML = answer.replace(/\n/g, '<br>').replace(/`/g, '');
}
