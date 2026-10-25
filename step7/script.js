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
    agreeMessage.textContent = agreed ? '신청을 시작할 수 있습니다' : '동의 후 신청을 시작할 수 있습니다';

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
    clickedTab.setAttribute('aria-selected', 'true');

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

  const trainingFlow = document.querySelector('#training-flow');
  const flowSteps = trainingFlow.querySelectorAll('.step');
  const progressItems = trainingFlow.querySelectorAll('.progress__item');
  const titleInput = document.querySelector('#presentation-title');
  const titleError = document.querySelector('#title-error');
  const titleNext = document.querySelector('#title-next');
  const durationRange = document.querySelector('#duration-range');
  const durationValue = document.querySelector('#duration-value');
  const qnaOption = document.querySelector('#qna-option');
  const qnaOptions = document.querySelector('#qna-options');
  const optionPrev = document.querySelector('#option-prev');
  const optionNext = document.querySelector('#option-next');
  const summaryPrev = document.querySelector('#summary-prev');
  const finishButton = document.querySelector('#finish-button');
  const restartButton = document.querySelector('#restart-button');
  const summaryTitle = document.querySelector('#summary-title');
  const summaryDuration = document.querySelector('#summary-duration');
  const summaryQna = document.querySelector('#summary-qna');
  const durationValues = ['1', '5', '10'];

  const formData = {
    title: '',
    duration: '5',
    qna: false,
    qnaCount: '2',
  };

  function showStep(index) {
    flowSteps.forEach((step, i) => {
      step.hidden = i != index;
    });
    progressItems.forEach((item, i) => {
      item.classList.toggle('is-active', i === index);
    });
  }

  const recordingDialog = document.querySelector('#recording-dialog');
  const recordingCancel = document.querySelector('#recording-cancel');
  const recordingConfirm = document.querySelector('#recording-confirm');

  function revokeRecordingAgreement() {
    agreeCheck.checked = false;
    trainingFlow.hidden = true;
    handleAgreeChange();
    agreeCheck.focus();
  }

  startButton.addEventListener('click', () => {
    if (!agreeCheck.checked) return;
    recordingDialog.showModal();
  });

  recordingCancel.addEventListener('click', () => {
    recordingDialog.close();
    revokeRecordingAgreement();
  });

  recordingDialog.addEventListener('cancel', revokeRecordingAgreement);
  recordingConfirm.addEventListener('click', () => {
    if (!agreeCheck.checked) return;
    recordingDialog.close();
    trainingFlow.hidden = false;
    showStep(0);
    trainingFlow.scrollIntoView({ behavior: 'smooth' });
    titleInput.focus();
  });

  function validateTitle() {
    const value = titleInput.value.trim();
    if (!value) {
      titleError.textContent = '저장 공간 이름을 입력해 주세요.';
      titleInput.classList.add('has-error');
      titleInput.focus();
      return false;
    }

    titleError.textContent = '';
    titleInput.classList.remove('has-error');
    formData.title = value;
    return true;
  }

  titleNext.addEventListener('click', () => {
    if (!validateTitle()) return;
    showStep(1);
  });

  durationRange.addEventListener('input', () => {
    durationValue.value = durationValues[durationRange.value] + 'TB';
  });

  qnaOption.addEventListener('change', () => {
    qnaOptions.hidden = !qnaOption.checked;
  });

  optionPrev.addEventListener('click', () => {
    showStep(0);
  });
  optionNext.addEventListener('click', () => {
    formData.duration = durationValues[durationRange.value];
    formData.qna = qnaOption.checked;
    const count = document.querySelector(`input[name="qna-count"]:checked`);
    formData.qnaCount = count.value;
    summaryTitle.textContent = formData.title;
    summaryDuration.textContent = formData.duration + 'TB';
    summaryTitle.textContent = formData.title;
    summaryQna.textContent = formData.qna ? formData.qnaCount + '개 포함' : '미포함';
    showStep(2);
  });

  summaryPrev.addEventListener('click', () => showStep(1));
  finishButton.addEventListener('click', () => showStep(3));
  restartButton.addEventListener('click', () => {
    formData.title = '';
    formData.duration = '5';
    formData.qna = false;
    formData.qnaCount = '2';
    titleInput.value = '';
    titleError.textContent = '';
    titleInput.classList.remove('has-error');
    durationRange.value = '1';
    durationValue.value = '5TB';
    qnaOption.checked = false;
    qnaOptions.hidden = true;
    document.querySelector(`input[name="qna-count"][value="2"]`).checked = true;
    summaryDuration.textContent = '';
    summaryQna.textContent = '';
    showStep(0);
  });
})();
