(function () {
  const pricePerTb = 35000;
  const linkPrice = 6000;

  function formatWon(amount) {
    return amount.toLocaleString('ko-KR') + '원';
  }

  function sumPrice(items) {
    return items.reduce(function (total, item) {
      return total + item.price;
    }, 0);
  }

  console.assert(sumPrice([{ price: 35000 }, { price: 15000 }]) === 50000, '요금 합계 계산이 올바르지 않습니다.');

  const themeButton = document.querySelector('#themeButton');

  function handleThemeClick() {
    const isDark = document.body.classList.toggle('dark');

    themeButton.textContent = isDark ? '라이트 테마로 바꾸기' : '다크 테마로 바꾸기';
  }
  themeButton.addEventListener('click', handleThemeClick);

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

  const startButton = document.querySelector('#startButton');
  const applyHint = document.querySelector('#apply-hint');
  const applySummary = document.querySelector('#apply-summary');
  const flowDialog = document.querySelector('#flow-dialog');
  const flowClose = document.querySelector('#flow-close');
  const flowSteps = flowDialog.querySelectorAll('.step');
  const progress = flowDialog.querySelector('#progress');
  const progressItems = flowDialog.querySelectorAll('.progress__item');
  const titleInput = document.querySelector('#presentation-title');
  const titleError = document.querySelector('#title-error');
  const titleNext = document.querySelector('#title-next');
  const durationRange = document.querySelector('#duration-range');
  const durationValue = document.querySelector('#duration-value');
  const durationPrice = document.querySelector('#duration-price');
  const optionPrev = document.querySelector('#option-prev');
  const optionNext = document.querySelector('#option-next');
  const qnaOption = document.querySelector('#qna-option');
  const qnaOptions = document.querySelector('#qna-options');
  const extraChecks = flowDialog.querySelectorAll('input[name="extra"]');
  const extrasSelected = document.querySelector('#extras-selected');
  const extrasSubtotal = document.querySelector('#extras-subtotal');
  const extrasPrev = document.querySelector('#extras-prev');
  const extrasNext = document.querySelector('#extras-next');
  const summaryList = document.querySelector('#summary-list');
  const summaryPrev = document.querySelector('#summary-prev');
  const finishButton = document.querySelector('#finish-button');
  const restartButton = document.querySelector('#restart-button');
  const invoiceStart = document.querySelector('#invoice-start');
  const completeTotal = document.querySelector('#complete-total');
  const billingTotal = document.querySelector('#billing-total');

  const formData = {
    title: '',
    duration: '5',
    extras: [],
    completed: false,
  };

  function storagePrice(size) {
    return pricePerTb * Number(size);
  }

  function selectedExtras() {
    const extras = [];

    if (qnaOption.checked) {
      const count = flowDialog.querySelector('input[name="qna-count"]:checked').value;

      extras.push({ name: '링크 공유 ' + count + '개', price: linkPrice * Number(count) });
    }

    extraChecks.forEach(function (check) {
      if (check.checked) {
        extras.push({ name: check.dataset.name, price: Number(check.dataset.price) });
      }
    });

    return extras;
  }

  function buildItems() {
    const items = [{ name: '저장 용량 ' + formData.duration + 'TB', price: storagePrice(formData.duration) }];

    return items.concat(formData.extras);
  }

  function totalAmount() {
    return sumPrice(buildItems());
  }

  function renderRows(container, rows) {
    container.textContent = '';
    rows.forEach(function (row) {
      const line = document.createElement('div');
      const label = document.createElement('span');
      const value = document.createElement('strong');

      if (row.total) line.classList.add('is-total');
      label.textContent = row.label;
      value.textContent = row.value;
      line.append(label, value);
      container.append(line);
    });
  }

  function summaryRows() {
    const rows = [
      { label: '저장 공간 이름', value: formData.title },
      { label: '저장 용량', value: formData.duration + 'TB / ' + formatWon(storagePrice(formData.duration)) },
    ];

    if (formData.extras.length === 0) {
      rows.push({ label: '추가 서비스', value: '없음' });
    } else {
      formData.extras.forEach(function (extra, index) {
        rows.push({ label: index === 0 ? '추가 서비스' : '', value: extra.name + ' / ' + formatWon(extra.price) });
      });
    }

    rows.push({ label: '월 합계', value: formatWon(totalAmount()), total: true });
    return rows;
  }

  function updateBilling() {
    billingTotal.textContent = formData.completed ? formatWon(totalAmount()) : '이용 옵션을 선택해 주세요';
  }

  function updateApplyCard() {
    applyHint.hidden = formData.completed;
    applySummary.hidden = !formData.completed;
    startButton.textContent = formData.completed ? '신청 설정 수정하기' : 'TeraB 신청 시작하기';

    if (formData.completed) renderRows(applySummary, summaryRows());
  }

  function updateDurationPrice() {
    const size = durationRange.value;

    durationValue.value = size + 'TB';
    durationPrice.textContent = formatWon(storagePrice(size));
  }

  function updateExtras() {
    const extras = selectedExtras();

    extrasSelected.textContent =
      extras.length === 0
        ? '선택한 추가 서비스가 없습니다.'
        : extras
            .map(function (extra) {
              return extra.name;
            })
            .join(', ');
    extrasSubtotal.textContent = formatWon(sumPrice(extras));
  }

  function showStep(index) {
    flowSteps.forEach(function (step, i) {
      step.hidden = i !== index;
    });
    progressItems.forEach(function (item, i) {
      item.classList.toggle('is-active', i === index);
      item.classList.toggle('is-done', i < index);
    });
  }

  function hideStep() {
    progress.hidden = true;
  }

  startButton.addEventListener('click', () => {
    flowDialog.showModal();
    showStep(0);
    titleInput.focus();
  });

  flowClose.addEventListener('click', () => flowDialog.close());

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

  durationRange.addEventListener('input', updateDurationPrice);

  optionPrev.addEventListener('click', () => showStep(0));
  optionNext.addEventListener('click', () => {
    formData.duration = durationRange.value;
    showStep(2);
  });

  qnaOption.addEventListener('change', () => {
    qnaOptions.hidden = !qnaOption.checked;
    updateExtras();
  });

  flowDialog.querySelectorAll('input[name="extra"], input[name="qna-count"]').forEach(function (input) {
    input.addEventListener('change', updateExtras);
  });

  extrasPrev.addEventListener('click', () => showStep(1));
  extrasNext.addEventListener('click', () => {
    formData.extras = selectedExtras();
    renderRows(summaryList, summaryRows());
    showStep(3);
  });

  summaryPrev.addEventListener('click', () => showStep(2));

  const subscribeForm = document.querySelector('#subscribe-form');
  const contactName = document.querySelector('#contact-name');
  const emailInput = document.querySelector('#contact-email');
  const contactPhone = document.querySelector('#contact-phone');
  const contactCompany = document.querySelector('#contact-company');
  const agreeCheck = document.querySelector('#agreeCheck');
  const termsCheck = document.querySelector('#termsCheck');
  const subscribeButton = document.querySelector('#subscribeButton');
  const viewInvoiceButton = document.querySelector('#viewInvoiceButton');
  const cancelSendButton = document.querySelector('#cancelSendButton');
  const subscribeMessage = document.querySelector('#subscribeMessage');
  const subscribeSection = document.querySelector('#subscribe');

  const invoiceDialog = document.querySelector('#invoice-dialog');
  const invoiceDate = document.querySelector('#invoice-date');
  const invoiceName = document.querySelector('#invoice-name');
  const invoiceCompany = document.querySelector('#invoice-company');
  const invoiceEmail = document.querySelector('#invoice-email');
  const invoicePhone = document.querySelector('#invoice-phone');
  const invoiceItems = document.querySelector('#invoice-items');
  const invoiceTotal = document.querySelector('#invoice-total');
  const invoiceEdit = document.querySelector('#invoice-edit');
  const invoiceSend = document.querySelector('#invoice-send');
  let pendingInvoice = null;
  let sentInvoice = null;

  function showMessage(text, state) {
    subscribeMessage.textContent = text;
    subscribeMessage.classList.toggle('is-error', state === 'error');
    subscribeMessage.classList.toggle('is-success', state === 'success');
  }

  function setFieldError(input, message) {
    input.closest('.form-field').querySelector('.field-error').textContent = message;
    input.classList.toggle('has-error', message !== '');
  }

  function clearFieldErrors() {
    [contactName, emailInput, contactPhone, contactCompany].forEach(function (input) {
      setFieldError(input, '');
    });
  }

  finishButton.addEventListener('click', () => {
    formData.completed = true;
    completeTotal.textContent = formatWon(totalAmount());
    updateBilling();
    updateApplyCard();
    hideStep();
    showMessage('담당자 정보를 입력하고 청구서를 받아 보세요.', 'info');
    showStep(4);
  });

  invoiceStart.addEventListener('click', () => {
    flowDialog.close();
    subscribeSection.scrollIntoView({ behavior: 'smooth' });
    contactName.focus();
  });

  function buildInvoice() {
    return {
      date: new Date().toLocaleDateString('ko-KR'),
      name: contactName.value.trim(),
      company: contactCompany.value.trim() || '-',
      email: emailInput.value.trim(),
      phone: contactPhone.value.trim(),
      items: buildItems(),
      total: totalAmount(),
    };
  }

  function renderInvoice(invoice, mode) {
    invoiceDate.textContent = invoice.date;
    invoiceName.textContent = invoice.name;
    invoiceCompany.textContent = invoice.company;
    invoiceEmail.textContent = invoice.email;
    invoicePhone.textContent = invoice.phone;

    renderRows(
      invoiceItems,
      invoice.items.map(function (item) {
        return { label: item.name, value: formatWon(item.price) };
      }),
    );

    invoiceTotal.textContent = formatWon(invoice.total);
    invoiceSend.hidden = mode === 'view';
    invoiceEdit.textContent = mode === 'view' ? '닫기' : '내용 수정하기';
    invoiceDialog.showModal();
  }

  function handleSubscribe(event) {
    event.preventDefault();
    clearFieldErrors();

    if (!formData.completed) {
      showMessage('먼저 이용 옵션 선택에서 신청 설정을 완료해 주세요.', 'error');
      startButton.closest('#start-apply').scrollIntoView({ behavior: 'smooth' });
      startButton.focus({ preventScroll: true });
      return;
    }

    if (contactName.value.trim() === '') {
      setFieldError(contactName, '담당자 이름을 입력해 주세요.');
      contactName.focus();
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())) {
      setFieldError(emailInput, '이메일 형식이 올바르지 않습니다.');
      emailInput.focus();
      return;
    }

    if (!/^01[0-9]{9}$/.test(contactPhone.value.trim())) {
      setFieldError(contactPhone, '숫자 11자리로 입력해 주세요.');
      contactPhone.focus();
      return;
    }

    if (!agreeCheck.checked || !termsCheck.checked) {
      showMessage('개인정보 수집과 서비스 이용 약관에 동의해 주세요.', 'error');
      (agreeCheck.checked ? termsCheck : agreeCheck).focus();
      return;
    }

    pendingInvoice = buildInvoice();
    renderInvoice(pendingInvoice, 'confirm');
  }

  subscribeForm.addEventListener('submit', handleSubscribe);

  invoiceEdit.addEventListener('click', () => invoiceDialog.close());

  invoiceSend.addEventListener('click', () => {
    sentInvoice = pendingInvoice;
    invoiceDialog.close();
    subscribeButton.textContent = '발송 완료';
    subscribeButton.disabled = true;
    viewInvoiceButton.hidden = false;
    cancelSendButton.hidden = false;
    showMessage(sentInvoice.email + '로 ' + formatWon(sentInvoice.total) + ' 청구서를 발송했습니다.', 'success');
  });

  viewInvoiceButton.addEventListener('click', () => {
    if (!sentInvoice) return;
    renderInvoice(sentInvoice, 'view');
  });

  function resetSendState() {
    sentInvoice = null;
    pendingInvoice = null;
    subscribeButton.textContent = '청구서 확인하기';
    subscribeButton.disabled = false;
    viewInvoiceButton.hidden = true;
    cancelSendButton.hidden = true;
  }

  cancelSendButton.addEventListener('click', () => {
    resetSendState();
    showMessage('청구서 발송을 취소했습니다. 내용을 수정해 다시 발송할 수 있습니다.', 'error');
  });

  restartButton.addEventListener('click', () => {
    formData.title = '';
    formData.duration = '5';
    formData.extras = [];
    formData.completed = false;
    titleInput.value = '';
    titleError.textContent = '';
    titleInput.classList.remove('has-error');
    durationRange.value = '5';
    updateDurationPrice();
    qnaOption.checked = false;
    qnaOptions.hidden = true;
    flowDialog.querySelector('input[name="qna-count"][value="2"]').checked = true;
    extraChecks.forEach(function (check) {
      check.checked = false;
    });
    updateExtras();
    summaryList.textContent = '';
    completeTotal.textContent = '';
    clearFieldErrors();
    resetSendState();
    updateBilling();
    updateApplyCard();
    showMessage('', 'info');
    showStep(0);
  });

  updateDurationPrice();
  updateExtras();
})();

