(function () {
  const serviceName = 'TeraB';
  let isSubscribed = false;
  let submitCount = 0;

  function makeSubscribeMessage(email, subscribed) {
    if (subscribed == true) {
      return email + '로 신청이 완료되었습니다.';
    }

    return '이메일을 입력한 뒤 신청해주세요.';
  }

  const subscribeForm = document.querySelector('#subscribe-form');
  const emailInput = document.querySelector('#email');
  const subscribeButton = document.querySelector('#subscribeButton');
  const subscribeMessage = document.querySelector('#subscribeMessage');

  function handleSubscribe(event) {
    event.preventDefault();

    const subscriberEmail = emailInput.value.trim();

    if (subscriberEmail === '') {
      subscribeMessage.textContent = '이메일을 입력한 뒤 신청해주세요.';
      emailInput.focus();
      return;
    }

    isSubscribed = true;
    submitCount = 1;

    subscribeMessage.textContent = makeSubscribeMessage(subscriberEmail, isSubscribed);
    subscribeMessage.classList.add('is-success');

    subscribeButton.textContent = '문의완료';
    subscribeButton.disabled = true;
  }

  subscribeForm.addEventListener('submit', handleSubscribe);

  const themeButton = document.querySelector('#themeButton');
  const nicknameInput = document.querySelector('#nickname');
  const nicknameCount = document.querySelector('#nicknameCount');
  const agreeCheck = document.querySelector('#agreeCheck');
  const agreeMessage = document.querySelector('#agreeMessage');
  const startButton = document.querySelector('#startButton');

  function handleThemeClick() {
    const isDark = document.body.classList.toggle('dark');

    themeButton.textContent = isDark ? '라이트 테마로 바꾸기' : '다크 테마로 바꾸기';
  }
  themeButton.addEventListener('click', handleThemeClick);

  function handleNicknameInput(event) {
    const maxLength = nicknameInput.maxLength;
    const currentLength = nicknameInput.value.length;

    nicknameCount.textContent = currentLength + ' / ' + maxLength;
  }
  nicknameInput.addEventListener('input', handleNicknameInput);

  function handleAgreeChange(event) {
    const agreed = agreeCheck.checked;

    startButton.disabled = !agreed;
    agreeMessage.textContent = agreed ? '시작할 수 있습니다' : '시작하기 버튼을 활성화하려면 약관에 동의하세요';

    if (agreed) agreeMessage.classList.add('is-ready');
    else agreeMessage.classList.remove('is-ready');
  }
  agreeCheck.addEventListener('change', handleAgreeChange);

  const tabs = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('.panel');

  function resetTabsAndPanels() {
    tabs.forEach(function (tab) {
      tab.classList.remove('is-active');
      tab.setAttribute('aria-selected', 'false');
    });
    panels.forEach(function (panel) {
      panel.classList.remove('is-active');
      panel.hidden = true;
    });
  }

  function activateTab(clickedTab) {
    const targetSelector = clickedTab.dataset.target;
    const targetPanel = document.querySelector(targetSelector);

    clickedTab.classList.add('is-active');
    clickedTab.setAttribute('aria-seelected', 'true');

    targetPanel.classList.add('is-active');
    targetPanel.hidden = false;
  }

  function handleTabClick(event) {
    resetTabsAndPanels();
    activateTab(event.currentTarget);
  }

  tabs.forEach(function (tab) {
    tab.addEventListener('click', handleTabClick);
  });
})();
