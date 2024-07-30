// 첫 화면에서 입력한 url을 그대로 가져오기
document.addEventListener("DOMContentLoaded", () => {
    const urlInput = document.querySelector('#problem-url');
    const savedUrl = localStorage.getItem('savedURL');


    if (savedUrl) {
        urlInput.value = savedUrl;
        displayProblemContent(savedUrl);
        displayProblemHint(savedUrl);
    }

    document.querySelector('#url-form').addEventListener('submit', function(event) {
        event.preventDefault();
        const newUrl = urlInput.value;

        // 새로운 url 저장
        localStorage.setItem('savedURL', newUrl);

        // 페이지 새로고침
        displayProblemContent(newUrl);
        displayProblemHint(newUrl);
    });

    document.querySelector('#hint-one').addEventListener('click', () => showHint(0));
    document.querySelector('#hint-two').addEventListener('click', () => showHint(1));
    document.querySelector('#hint-three').addEventListener('click', () => showHint(2));
    document.querySelector('#answer').addEventListener('click', showAnswer);
});

// 페이지에 문제를 가져오는 함수
async function displayProblemContent(url) {
    // const proxyUrl = 'https://cors-anywhere.herokuapp.com/'
    const problemContentDiv = document.querySelector('#problem-content');
    problemContentDiv.textContent = `문제 URL: ${url}`;
    try {
        const response = await fetch(url);
        const html = await response.text();

        // HTML 문자열을 파싱하여 DOM 객체로 변환
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // 필요한 데이터 추출
        const titleElement = doc.querySelector('.challenge-title');
        const contentElement = doc.querySelector('.markdown.solarized-dark');

        const title = titleElement ? titleElement.textContent.trim() : '제목을 가져올 수 없습니다';
        const content = contentElement ? contentElement.innerHTML : '내용을 가져올 수 없습니다';
        console.log(content)

        // 추출한 데이터 표시
        problemContentDiv.innerHTML = `<h2>${title}</h2>${content}`;
        return content
    } catch (error) {
        console.error('Error fetching problem content:', error);
        problemContentDiv.textContent = '문제 내용을 가져오는 중 오류가 발생했습니다.';
    }

}

let allHints = [];
let solution = '';

// 힌트를 표시하는 함수
function showHint(index) {
    if (index >= 0 && index < allHints.length) {
        printAnswer(allHints[index]);
    } else {
        console.error(`Hint ${index + 1} not available`);
    }
}

// 정답을 표시하는 함수
function showAnswer() {
    if (solution) {
        const cleanedSolution = solution.replace(/=====/, '').trim();
        printAnswer(`- 정답 :\n\`\`\`\n${cleanedSolution}\n\`\`\``);
    } else {
        console.error('Solution not available');
    }
}

// 화면에 답변 그려주는 함수
function printAnswer(answer) {
    let hintDiv = document.querySelector("#hint");
    hintDiv.innerHTML = answer.replace(/\n/g, '<br>').replace(/`/g, '');
}

function extractHintsAndSolution(content) {
    const hintRegex = /- \d+번째 힌트\s*:\s*([\s\S]*?)(?:\s*=====|$)/g;
    const solutionRegex = /- 정답\s*:\s*```sql\s*([\s\S]+?)(?:\n=====|$)/;
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

async function displayProblemHint (requestUrl) {
    const responseContent = await displayProblemContent(requestUrl)

    // openAI API
    let url = `https://open-api.jejucodingcamp.workers.dev/`;

    // 질문과 답변 저장
    let data = [
    {
        role: "system", content: "assistant는 코딩테스트 문제푸는 것을 도와주는 친절한 강사이다.",
    }, {
        role: "user" , content : `1. (${responseContent})에서 문제를 확인 2. 해당 문제에 대한 힌트와 답을 작성해 3. 힌트를 세 부분으로 나누어 줘 4. 너의 답변은 다음과 같은 양식말고는 하면 안돼

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
            =====`

    }
    ];

    // api 요청보내는 함수
    const apiPost = async () => {
        try {
            console.log('Sending API request...');
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data)
            });

            console.log('API response received:', response);
            const json = await response.json();
            console.log('API response JSON:', json);
            if (json.choices && json.choices.length > 0 && json.choices[0].message) {
                const hintContent = json.choices[0].message.content;
                console.log(hintContent);
                const extractedData = extractHintsAndSolution(hintContent);

                allHints = [extractedData.hintOne, extractedData.hintTwo, extractedData.hintThree];
                solution = extractedData.answer;

                console.log(allHints);
                console.log(solution);

                showHint(0); // 첫 번째 힌트 표시
            } else {
                console.error('Invalid response structure:', json);
            }
        } catch (error) {
            console.error('Error communicating with OpenAI:', error);
        }
    };

// 주어진 컨텐츠에서 힌트를 추출하는 함수
function extractHints(content) {
    const hintRegex = /- (\d+)번째 힌트\s*:\s*\n\s*(.+?)(?=- \d+번째 힌트|$)/gs;
    let hints = [];
    let match;

    while ((match = hintRegex.exec(content)) !== null) {
        hints.push(match[2].trim());
    }

    return hints;
    }
await apiPost();
}

// 정답 코드를 추출하는 함수
function extractSolution(content) {
    const solutionRegex = /- 정답\s*:\s*\n\s*```python\s*([^`]+)```/;
    const match = solutionRegex.exec(content);
    return match ? match[1].trim() : null;
}

// 두번째 힌트를 보여주는 함수
function showSecondHint() {
    if (allHints.length >= 2) {
        printAnswer(allHints[1]);
    } else {
        console.error('Second hint not available');
    }
}
