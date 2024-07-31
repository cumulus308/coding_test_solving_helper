// 두번째 힌트를 보여주는 함수
function showSecondHint() {
    if (allHints.length >= 2) {
        printAnswer(allHints[1]);
    } else {
        console.error('Second hint not available');
    }
}


// 정답 코드를 추출하는 함수
function extractSolution(content) {
    const solutionRegex = /- 정답\s*:\s*\n\s*```python\s*([^`]+)```/;
    const match = solutionRegex.exec(content);
    return match ? match[1].trim() : null;
}

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
