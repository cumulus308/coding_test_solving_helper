document.addEventListener("DOMContentLoaded", () => {
    const urlInput = document.querySelector('#problem-url');
    const savedUrl = localStorage.getItem('savedURL');

    if (savedUrl) {
        urlInput.value = savedUrl;
        loadProblem(savedUrl);
    }

    document.querySelector('#url-form').addEventListener('submit', function(event) {
        event.preventDefault();
        const newUrl = urlInput.value;

        localStorage.setItem('savedURL', newUrl);
        loadProblem(newUrl);
    });

    document.querySelector('#hint-one').addEventListener('click', () => showHint(0));
    document.querySelector('#hint-two').addEventListener('click', () => showHint(1));
    document.querySelector('#hint-three').addEventListener('click', () => showHint(2));
    document.querySelector('#answer').addEventListener('click', showAnswer);
});

async function loadProblem(url) {
    const content = await displayProblemContent(url);
    if (content) {
        displayProblemHint(content);
    }
}

async function displayProblemContent(url) {
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    const problemContentDiv = document.querySelector('#problem-content');
    try {
        const response = await fetch(proxyUrl + url);
        const html = await response.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const titleElement = doc.querySelector('.challenge-title');
        const contentElement = doc.querySelector('.markdown.solarized-dark');

        const title = titleElement ? titleElement.textContent.trim() : '제목을 가져올 수 없습니다';
        const content = contentElement ? contentElement.innerHTML : '내용을 가져올 수 없습니다';

        problemContentDiv.innerHTML = `<h2>${title}</h2>${content}`;
        return content;
    } catch (error) {
        console.error('Error fetching problem content:', error);
        problemContentDiv.textContent = '문제 내용을 가져오는 중 오류가 발생했습니다.';
        return null;
    }
}

let allHints = [];
let solution = '';

function showHint(index) {
    if (index >= 0 && index < allHints.length) {
        printAnswer(allHints[index]);
    } else {
        console.error(`Hint ${index + 1} not available`);
    }
}

function showAnswer() {
    if (solution) {
        printAnswer(`- 정답 :\n\`\`\`python\n${solution}\n\`\`\``);
    } else {
        console.error('Solution not available');
    }
}

function printAnswer(answer) {
    let hintDiv = document.querySelector("#hint");
    hintDiv.innerHTML = answer.replace(/\n/g, '<br>').replace(/`/g, '');
}

function extractHintsAndSolution(content) {
    const hintRegex = /- (\d+)번째 힌트\s*:\s*\n\s*(\[?[^\]]+\]?)/g;
    const solutionRegex = /- 정답\s*:\s*\n\s*```python\n([\s\S]+?)```/;

    let hints = [];
    let match;

    while ((match = hintRegex.exec(content)) !== null) {
        hints.push(match[2].trim());
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

async function displayProblemHint(content) {
    const apiResponse = await fetchOpenAIAPI(content);

    if (apiResponse) {
        const extractedData = extractHintsAndSolution(apiResponse);

        allHints = [extractedData.hintOne, extractedData.hintTwo, extractedData.hintThree];
        solution = extractedData.answer;

        showHint(0);
    } else {
        console.error('Failed to get hints and solution from API');
    }
}

async function fetchOpenAIAPI(content) {
    let url = `https://open-api.jejucodingcamp.workers.dev/`;

    let data = [
        {
            role: "system", content: "assistant는 코딩테스트 문제푸는 것을 도와주는 친절한 강사이다.",
        }, {
            role: "user" , content : `1. (${content})에서 문제를 확인 2. 해당 문제에 대한 힌트와 답을 작성해 3. 힌트를 세 부분으로 나누어 줘 4. 너의 답변은 다음과 같은 양식말고는 하면 안돼

            - 1번째 힌트 :
                [힌트 내용]

            - 2번째 힌트 :
                [힌트 내용]

            - 3번째 힌트 :
                [힌트 내용]

            - 정답 :
                [코드]`
        }
    ];

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data)
        });

        const json = await response.json();
        if (json.choices && json.choices.length > 0 && json.choices[0].message) {
            return json.choices[0].message.content;
        } else {
            console.error('Invalid response structure:', json);
            return null;
        }
    } catch (error) {
        console.error('Error communicating with OpenAI:', error);
        return null;
    }
}
