const STORAGE_KEY = 'equilibrio.v1';
const routineItems = [
  { id: 'movement', icon: '🚶', title: 'Mexa o corpo', detail: 'Nem que seja por 5 minutos' },
  { id: 'water', icon: '💧', title: 'Beba água', detail: 'Um copo de cada vez' },
  { id: 'breathing', icon: '🌬️', title: 'Faça uma pausa', detail: 'Respire fundo por 1 minuto' },
  { id: 'rest', icon: '🌙', title: 'Respeite seu ritmo', detail: 'Pausar também é progresso' }
];
const moodLabels = {
  leve: 'Leve',
  bem: 'Bem',
  'mais-ou-menos': 'Mais ou menos',
  dificil: 'Difícil'
};

const elements = {
  todayLabel: document.querySelector('#today-label'),
  moodOptions: [...document.querySelectorAll('.mood-option')],
  note: document.querySelector('#daily-note'),
  saveCheckin: document.querySelector('#save-checkin'),
  checkinFeedback: document.querySelector('#checkin-feedback'),
  routineList: document.querySelector('#routine-list'),
  todayProgress: document.querySelector('#today-progress'),
  weekCheckins: document.querySelector('#week-checkins'),
  weekSteps: document.querySelector('#week-steps')
};

let storageUnavailable = false;
let state = loadState();
let selectedMood = '';

function localDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function loadState() {
  let serialized;
  try {
    serialized = localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    console.error('Não foi possível acessar o armazenamento local.', error);
    storageUnavailable = true;
    elements.checkinFeedback.textContent = 'O armazenamento local está indisponível. Você pode usar a página, mas seus dados não serão mantidos.';
    elements.checkinFeedback.classList.add('error');
    return { days: {} };
  }

  if (!serialized) return { days: {} };

  try {
    const stored = JSON.parse(serialized);
    if (!stored || typeof stored !== 'object' || Array.isArray(stored) ||
        !stored.days || typeof stored.days !== 'object' || Array.isArray(stored.days)) {
      throw new TypeError('Formato de dados inválido.');
    }
    return stored;
  } catch (error) {
    console.error('Os dados salvos do Equilíbrio estão inválidos.', error);
    elements.checkinFeedback.textContent = 'Não foi possível ler os dados anteriores. Um novo registro será iniciado.';
    elements.checkinFeedback.classList.add('error');
    return { days: {} };
  }
}

function saveState(nextState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    state = nextState;
    return true;
  } catch (error) {
    console.error('Não foi possível salvar os dados do Equilíbrio.', error);
    elements.checkinFeedback.textContent = 'Não foi possível salvar neste dispositivo. Verifique as permissões e o espaço disponível.';
    elements.checkinFeedback.classList.add('error');
    return false;
  }
}

function getDay(dateKey = localDateKey(new Date())) {
  const day = state.days[dateKey];
  return day && typeof day === 'object' && !Array.isArray(day) ? day : {};
}

function setTodayLabel() {
  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).format(new Date());
  elements.todayLabel.textContent = formattedDate.toLocaleUpperCase('pt-BR');
}

function setMood(mood) {
  selectedMood = mood;
  elements.moodOptions.forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.mood === mood));
  });
}

function renderRoutine() {
  const today = getDay();
  const completed = today.routine && typeof today.routine === 'object' && !Array.isArray(today.routine)
    ? today.routine
    : {};
  elements.routineList.replaceChildren();

  routineItems.forEach((item) => {
    const isComplete = completed[item.id] === true;
    const card = document.createElement('article');
    card.className = `routine-card${isComplete ? ' complete' : ''}`;

    const icon = document.createElement('span');
    icon.className = 'routine-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = item.icon;

    const copy = document.createElement('div');
    copy.className = 'routine-copy';
    const title = document.createElement('strong');
    title.textContent = item.title;
    const detail = document.createElement('span');
    detail.textContent = item.detail;
    copy.append(title, detail);

    const toggle = document.createElement('button');
    toggle.className = 'routine-toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-label', `${isComplete ? 'Desmarcar' : 'Marcar'}: ${item.title}`);
    toggle.setAttribute('aria-pressed', String(isComplete));
    toggle.textContent = isComplete ? '✓' : '';
    toggle.addEventListener('click', () => {
      const dateKey = localDateKey(new Date());
      const day = getDay(dateKey);
      if (!day.routine || typeof day.routine !== 'object' || Array.isArray(day.routine)) day.routine = {};
      day.routine[item.id] = !isComplete;
      const nextState = { ...state, days: { ...state.days, [dateKey]: day } };
      if (saveState(nextState)) {
        renderRoutine();
        renderWeekStats();
      }
    });

    card.append(icon, copy, toggle);
    elements.routineList.append(card);
  });

  const count = routineItems.filter((item) => completed[item.id] === true).length;
  elements.todayProgress.textContent = `${count}/${routineItems.length}`;
}

function renderWeekStats() {
  const today = new Date();
  let checkins = 0;
  let steps = 0;

  for (let offset = 0; offset < 7; offset += 1) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset);
    const day = getDay(localDateKey(date));
    if (moodLabels[day.mood]) checkins += 1;
    if (day.routine && typeof day.routine === 'object' && !Array.isArray(day.routine)) {
      steps += routineItems.filter((item) => day.routine[item.id] === true).length;
    }
  }

  elements.weekCheckins.textContent = String(checkins);
  elements.weekSteps.textContent = String(steps);
}

function restoreToday() {
  const today = getDay();
  setMood(moodLabels[today.mood] ? today.mood : '');
  elements.note.value = typeof today.note === 'string' ? today.note : '';
  renderRoutine();
  renderWeekStats();
}

elements.moodOptions.forEach((button) => {
  button.addEventListener('click', () => {
    setMood(button.dataset.mood);
    if (!storageUnavailable) {
      elements.checkinFeedback.textContent = '';
      elements.checkinFeedback.classList.remove('error');
    }
  });
});

elements.saveCheckin.addEventListener('click', () => {
  if (!moodLabels[selectedMood]) {
    elements.checkinFeedback.textContent = 'Escolha como você está se sentindo para salvar seu check-in.';
    elements.checkinFeedback.classList.remove('error');
    elements.moodOptions[0].focus();
    return;
  }

  const dateKey = localDateKey(new Date());
  const today = getDay(dateKey);
  const nextState = {
    ...state,
    days: {
      ...state.days,
      [dateKey]: { ...today, mood: selectedMood, note: elements.note.value.trim() }
    }
  };
  if (saveState(nextState)) {
    elements.checkinFeedback.classList.remove('error');
    elements.checkinFeedback.textContent = 'Check-in salvo. Obrigado por reservar esse momento para você.';
    renderWeekStats();
  }
});

setTodayLabel();
restoreToday();
