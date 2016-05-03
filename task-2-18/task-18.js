window.onload = function () {
  var numArr = [],
      $leftInput = document.getElementById('left-input');
      $rightInput = document.getElementById('right-input');
      $result = document.getElementById('result');

  function focusInput(el) {
    console.log(numArr);
    el.value = '';
    el.focus();
  }

  function ctrlBtn(event) {
    var leftInputValue = $leftInput.value.trim(),
        rightInputValue = $rightInput.value.trim(),
        target = event.target,
        id = target.id;

    switch(id) {
      case 'left-in':
        if (!leftInputValue) break;
        numArr.unshift(leftInputValue);
        $result.insertAdjacentHTML('afterbegin', '<button class="btn btn-default">'+leftInputValue+'</btn>');
        break;
      case 'left-out':
        numArr.shift();
        $result.firstChild.classList.add('zoom-out');
        break;
      case 'right-in':
        if (!rightInputValue) break;
        numArr.push(rightInputValue);
        $result.insertAdjacentHTML('beforeend', '<button class="btn btn-default">'+rightInputValue+'</btn>');
        break;
      case 'right-out':
        numArr.pop();
        $result.lastChild.classList.add('zoom-out');
        break;
    }

    focusInput( id.startsWith('left')? $leftInput : $rightInput);
  }

  function zoomOut(event) {
    var target = event.target,
        idx = [].indexOf.call(target.parentNode.children, target);

    if (target.nodeName === 'BUTTON') {
      numArr.splice(idx, 1);
      target.classList.add('zoom-out');
    }
  }

  function delBtn(event) {
    if (event.animationName === 'zoomOut') {
      event.target.parentNode.removeChild(event.target);
    }
  }

  function init() {
    var $btns = document.getElementsByClassName('btn'),
        $body = document.body;

    [].forEach.call($btns, function($btn){
      $btn.addEventListener('click', ctrlBtn);
    });

    [$leftInput, $rightInput].forEach(function($input){
      $input.addEventListener('keyup', function(event){
        if(event.keyCode === 13){
          event.target.id = event.target.id.startsWith('left') ? 'left-in' : 'right-in';
          ctrlBtn(event);
        }
      });
    });

    $result.addEventListener('click', zoomOut);

    $body.addEventListener('animationend', delBtn);
  }

  init();
}