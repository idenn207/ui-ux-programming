const storageKey = 'rehear-training-plans-v1';
const form = document.querySelector('#plan-form');
const steps = [...document.querySelectorAll('.flow-step')];
const progressItems = [...document.querySelectorAll('.progress-item')];
const titleInput = document.querySelector('#presentation-title');
const titleField = document.querySelector('#title-field');
const titleHelp = document.querySelector('#title-help');
const titleCount = document.querySelector('#title-count');
const titleError = document.querySelector('#title-error');
const nicknameInput = document.querySelector('#nickname');
const nicknameCount = document.querySelector('#nickname-count');
const qnaOption = document.querySelector('#qna-option');
const qnaOptions = document.querySelector('#qna-options');
const qnaCountInputs = [...document.querySelectorAll('input[name="qna-count"]')];
const planList = document.querySelector('#plan-list');
const emptyState = document.querySelector('#empty-state');
const planCount = document.querySelector('#plan-count');
const archiveStatus = document.querySelector('#archive-status');
const planDialog = document.querySelector('#plan-dialog');
const navLinks = document.querySelectorAll('.main-nav a');
const menuToggle = document.querySelector('#menu-toggle');
const mainNav = document.querySelector('#main-nav');
const filterButtons = document.querySelectorAll('.filter-button');
let currentFilter = 'all';
const saveButton = document.querySelector('#save-plan');
const submitStatus = document.querySelector('#submit-status');
const forceSaveFailure = new URLSearchParams(location.search).has('save-error');

function readPlans() {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (!Array.isArray(stored)) return [];
    return stored
      .filter((plan) => plan && typeof plan.id === 'string' && typeof plan.title === 'string')
      .map((plan) => ({
        id: plan.id,
        title: plan.title.slice(0, 60),
        nickname: typeof plan.nickname === 'string' ? plan.nickname.slice(0, 10) : '',
        duration: ['3', '5', '10'].includes(plan.duration) ? plan.duration : '5',
        qna: plan.qna === true,
        qnaCount: ['1', '2', '3'].includes(plan.qnaCount) ? plan.qnaCount : '2',
        cancelled: plan.cancelled === true,
        createdAt: typeof plan.createdAt === 'string' ? plan.createdAt : '',
      }));
  } catch {
    return [];
  }
}

let plans = readPlans();
let currentStep = 1;

function savePlans() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(plans));
    return true;
  } catch {
    return false;
  }
}

function showStep(number) {
  currentStep = number;
  steps.forEach((step) => {
    step.hidden = Number(step.dataset.step) !== number;
  });
  progressItems.forEach((item, index) => {
    const isCurrent = index === number - 1;
    item.classList.toggle('is-current', isCurrent);
    item.classList.toggle('is-done', index < number - 1);
    if (isCurrent && number <= 3) item.setAttribute('aria-current', 'step');
    else item.removeAttribute('aria-current');
  });
  const heading = steps[number - 1].querySelector('h3');
  heading.tabIndex = -1;
  heading.focus({ preventScroll: true });
  document.querySelector('#planner').scrollIntoView({ block: 'start', behavior: 'smooth' });
}

function showTitleError(message) {
  titleInput.setAttribute('aria-invalid', 'true');
  titleError.textContent = message;
  titleField.classList.remove('is-valid');
  titleField.classList.add('has-error');
  return false;
}

function clearTitleError() {
  titleInput.removeAttribute('aria-invalid');
  titleError.textContent = '';
  titleField.classList.remove('has-error');
  updateTitleExperience();
}

function validateTitle() {
  const title = titleInput.value.trim();

  if (!title) {
    return showTitleError('발표 제목을 입력해 주세요.');
  }

  if (title.length < 2) {
    return showTitleError('발표 제목을 2자 이상 입력해 주세요.');
  }

  clearTitleError();
  return true;
}

function updateTitleExperience() {
  const length = titleInput.value.length;
  const enough = titleInput.value.trim().length >= 2;
  const invalid = titleInput.getAttribute('aria-invalid') === 'true';

  titleCount.textContent = `${length} / 60자`;
  titleField.classList.toggle('is-valid', enough && !invalid);

  if (!invalid) {
    titleHelp.textContent = enough ? '입력 조건을 충족했습니다.' : '발표를 구분할 수 있도록 2자 이상 입력해 주세요.';
  }
}

function getFormValues() {
  return {
    title: titleInput.value.trim(),
    nickname: nicknameInput.value.trim(),
    duration: form.querySelector('input[name="duration"]:checked').value,
    qna: qnaOption.checked,
    qnaCount: form.querySelector('input[name="qna-count"]:checked').value,
  };
}

function qnaText(plan) {
  return plan.qna ? `질문 ${plan.qnaCount}개 포함` : '포함 안 함';
}

function updateSummary() {
  const values = getFormValues();
  document.querySelector('#summary-title').textContent = values.title;
  document.querySelector('#summary-nickname').textContent = values.nickname || '입력 안 함';
  document.querySelector('#summary-duration').textContent = `${values.duration}분`;
  document.querySelector('#summary-qna').textContent = qnaText(values);
}

titleInput.addEventListener('input', () => {
  updateTitleExperience();

  if (titleInput.getAttribute('aria-invalid') === 'true') {
    validateTitle();
  }
});

nicknameInput.addEventListener('input', () => {
  nicknameCount.textContent = `${nicknameInput.value.length} / 10자`;
});

function syncQnaFields() {
  const open = qnaOption.checked;
  qnaOption.setAttribute('aria-expanded', String(open));
  qnaOptions.hidden = !open;
  qnaCountInputs.forEach((input) => {
    input.disabled = !open;
  });
}

qnaOption.addEventListener('change', syncQnaFields);
syncQnaFields();

document.querySelector('#info-next').addEventListener('click', () => {
  if (validateTitle()) showStep(2);
});
document.querySelector('#option-prev').addEventListener('click', () => showStep(1));
document.querySelector('#option-next').addEventListener('click', () => {
  updateSummary();
  showStep(3);
});
document.querySelector('#edit-info').addEventListener('click', () => showStep(1));
document.querySelector('#edit-options').addEventListener('click', () => showStep(2));

function setSubmitState(loading, message) {
  form.setAttribute('aria-busy', String(loading));
  saveButton.disabled = loading;
  saveButton.textContent = loading ? '저장하는 중…' : '계획 저장하기 →';
  submitStatus.textContent = message;
}

function wait(milliseconds) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

async function persistPlan(plan) {
  await wait(600);

  if (forceSaveFailure) {
    throw new Error('수업용 저장 실패');
  }

  plans.unshift(plan);
  if (!savePlans()) {
    plans.shift();
    throw new Error('브라우저 저장 실패');
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (currentStep === 1) {
    document.querySelector('#info-next').click();
    return;
  }

  if (currentStep !== 3) return;

  if (!validateTitle()) {
    showStep(1);
    window.requestAnimationFrame(() => {
      form.querySelector('[aria-invalid="true"]')?.focus();
    });
    return;
  }

  const data = new FormData(form);
  const plan = {
    id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    title: String(data.get('title') || '').trim(),
    nickname: String(data.get('nickname') || '').trim(),
    duration: String(data.get('duration') || '5'),
    qna: data.get('qna') === 'included',
    qnaCount: String(data.get('qna-count') || '2'),
    cancelled: false,
    createdAt: new Date().toISOString(),
  };

  setSubmitState(true, '훈련 계획을 저장하고 있습니다.');

  try {
    await persistPlan(plan);
    renderPlans();
    archiveStatus.textContent = `‘${plan.title}’ 계획을 저장했습니다.`;
    document.querySelector('#complete-message').textContent = `‘${plan.title}’ 계획을 내 계획에서 다시 열어볼 수 있습니다.`;
    setSubmitState(false, '훈련 계획을 저장했습니다.');
    showStep(4);
  } catch {
    setSubmitState(false, '저장하지 못했습니다. 입력한 내용은 그대로 두었습니다. 다시 시도해 주세요.');
  }
});

document.querySelector('#restart-button').addEventListener('click', () => {
  form.reset();
  syncQnaFields();

  nicknameCount.textContent = '0 / 10자';
  titleCount.textContent = '0 / 60자';
  titleHelp.textContent = '발표를 구분할 수 있도록 2자 이상 입력해 주세요.';
  titleError.textContent = '';

  titleInput.removeAttribute('aria-invalid');
  titleField.classList.remove('is-valid', 'has-error');
  setSubmitState(false, '');

  showStep(1);
  titleInput.focus();
});

function createText(tag, className, content) {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = content;
  return element;
}

function updateCurrentNav() {
  const currentHash = window.location.hash;

  navLinks.forEach((link) => {
    const current = currentHash ? link.getAttribute('href') === currentHash : link === navLinks[0];

    link.classList.toggle('is-current', current);

    if (current) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

window.addEventListener('hashchange', updateCurrentNav);
updateCurrentNav();

menuToggle.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('is-open');

  menuToggle.textContent = isOpen ? '메뉴 닫기' : '메뉴 열기';
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('is-open');
    menuToggle.textContent = '메뉴 열기';
    menuToggle.setAttribute('aria-expanded', 'false');
  });
});

function getVisiblePlans() {
  return plans.filter((plan) => {
    if (currentFilter === 'all') return true;
    if (currentFilter === 'cancelled') return plan.cancelled;
    return !plan.cancelled;
  });
}

function renderPlans() {
  const visiblePlans = getVisiblePlans();

  planList.replaceChildren();
  emptyState.hidden = visiblePlans.length !== 0;
  planList.hidden = visiblePlans.length === 0;

  const emptyTitle = emptyState.querySelector('h3');
  const emptyDescription = emptyState.querySelector('p');
  const emptyAction = emptyState.querySelector('a');

  if (visiblePlans.length === 0) {
    const filtered = currentFilter !== 'all';
    emptyTitle.textContent = filtered ? '선택한 상태의 계획이 없어요.' : '아직 저장한 계획이 없어요.';
    emptyDescription.textContent = filtered ? '다른 상태를 선택해 보세요.' : '첫 발표 훈련 계획을 만들면 이곳에서 다시 볼 수 있습니다.';
    emptyAction.hidden = filtered;
  }

  planCount.textContent = String(visiblePlans.length);
  planCount.setAttribute('aria-label', `현재 표시 중인 계획 ${visiblePlans.length}개`);

  visiblePlans.forEach((plan) => {
    const card = document.createElement('li');
    card.className = `plan-card${plan.cancelled ? ' is-cancelled' : ''}`;
    const top = document.createElement('div');
    top.className = 'plan-card-top';
    top.append(createText('span', 'plan-state', plan.cancelled ? '취소됨' : '저장됨'));
    const date = new Date(plan.createdAt);
    if (!Number.isNaN(date.getTime())) {
      top.append(createText('time', 'plan-date', new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }).format(date)));
    }
    card.append(top);
    card.append(createText('h3', 'plan-title', plan.title));
    card.append(createText('p', 'plan-meta', `${plan.duration}분 연습 · ${qnaText(plan)}`));
    const actions = document.createElement('div');
    actions.className = 'plan-actions';
    const openButton = createText('button', 'button button-secondary', '내용 보기');
    openButton.type = 'button';
    openButton.dataset.action = 'open';
    openButton.dataset.id = plan.id;
    const toggleButton = createText('button', 'button button-text', plan.cancelled ? '취소 되돌리기' : '계획 취소하기');
    toggleButton.type = 'button';
    toggleButton.dataset.action = 'toggle';
    toggleButton.dataset.id = plan.id;
    actions.append(openButton, toggleButton);
    card.append(actions);
    planList.append(card);
  });
}

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    currentFilter = button.dataset.filter;

    filterButtons.forEach((item) => {
      const selected = item === button;
      item.classList.toggle('is-active', selected);
      item.setAttribute('aria-pressed', String(selected));
    });

    renderPlans();
  });
});

planList.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const plan = plans.find((item) => item.id === button.dataset.id);
  if (!plan) return;

  if (button.dataset.action === 'open') {
    document.querySelector('#dialog-title').textContent = plan.title;
    document.querySelector('#dialog-status').textContent = plan.cancelled ? '취소된 계획입니다.' : '저장된 계획입니다.';
    document.querySelector('#dialog-nickname').textContent = plan.nickname || '입력 안 함';
    document.querySelector('#dialog-duration').textContent = `${plan.duration}분`;
    document.querySelector('#dialog-qna').textContent = qnaText(plan);
    planDialog.showModal();
    return;
  }

  const wasCancelled = plan.cancelled;
  plan.cancelled = !wasCancelled;
  const persisted = savePlans();
  renderPlans();
  archiveStatus.textContent = persisted
    ? `‘${plan.title}’ 계획을 ${wasCancelled ? '다시 사용할 수 있습니다' : '취소했습니다'}.`
    : '상태를 현재 화면에서 바꿨지만, 브라우저 저장 공간을 사용할 수 없어 새로고침하면 사라질 수 있습니다.';
  const nextButton = [...planList.querySelectorAll('button[data-action="toggle"]')].find((item) => item.dataset.id === plan.id);
  nextButton?.focus();
});

document.querySelector('#dialog-close').addEventListener('click', () => planDialog.close());
document.querySelector('#dialog-done').addEventListener('click', () => planDialog.close());

const themeButton = document.querySelector('#theme-button');
themeButton.addEventListener('click', () => {
  const dark = document.body.classList.toggle('dark');
  themeButton.textContent = dark ? '라이트 모드' : '다크 모드';
  themeButton.setAttribute('aria-pressed', String(dark));
});

renderPlans();
