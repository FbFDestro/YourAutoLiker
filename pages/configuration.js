let slider = document.getElementById('myRange');
let output = document.getElementsByClassName('percent')[0];

output.innerHTML = slider.value + '%';

slider.oninput = function() {
  output.innerText = this.value + '%';
}