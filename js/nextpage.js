// 첫 화면에서 입력한 url을 그대로 가져오기
const urlInput = document.querySelector('#urlInput');
const savedUrl = localStorage.getItem('savedURL');
urlInput.setAttribute('value',savedUrl);

//
