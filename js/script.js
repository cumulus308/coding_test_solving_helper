document.querySelector('#urlForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const urlInput = document.querySelector('#problem-url').value;
    const programmersStartUrl = 'school.programmers.co.kr/learn/courses/';

    if (urlInput.includes(programmersStartUrl)) {
        localStorage.setItem('savedURL', urlInput);
        window.location.href = './html/nextpage.html';
    } else {
        alert('URL을 입력해주세요.');
    }
});
