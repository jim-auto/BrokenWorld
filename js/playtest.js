const STORAGE_KEY = 'brokenworld-playtest-v1';

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function updateProgress() {
  const boxes = [...document.querySelectorAll('#checklist input[type="checkbox"]')];
  const done = boxes.filter((b) => b.checked).length;
  const el = document.getElementById('check-progress');
  if (el) el.textContent = `${done} / ${boxes.length} 完了`;
}

const state = loadState();

document.querySelectorAll('#checklist input[type="checkbox"]').forEach((box) => {
  const id = box.dataset.id;
  if (state[id]) box.checked = true;
  box.addEventListener('change', () => {
    state[id] = box.checked;
    saveState(state);
    updateProgress();
  });
});

document.getElementById('reset-checks')?.addEventListener('click', () => {
  document.querySelectorAll('#checklist input[type="checkbox"]').forEach((box) => {
    box.checked = false;
    delete state[box.dataset.id];
  });
  saveState(state);
  updateProgress();
});

document.getElementById('copy-feedback')?.addEventListener('click', async () => {
  const notes = document.getElementById('feedback-notes')?.value || '';
  const boxes = [...document.querySelectorAll('#checklist input[type="checkbox"]')];
  const lines = boxes.map((b) => {
    const label = b.parentElement?.textContent?.trim() || '';
    return `[${b.checked ? 'x' : ' '}] ${label}`;
  });

  const text = [
    '=== 十二番目の鐘が鳴る前に / プレイテスト記録 ===',
    '',
    '【チェックリスト】',
    ...lines,
    '',
    '【メモ】',
    notes || '（なし）',
  ].join('\n');

  try {
    await navigator.clipboard.writeText(text);
    const status = document.getElementById('copy-status');
    if (status) {
      status.textContent = 'コピーしました';
      setTimeout(() => { status.textContent = ''; }, 2000);
    }
  } catch {
    const status = document.getElementById('copy-status');
    if (status) status.textContent = 'コピーに失敗しました';
  }
});

const savedNotes = localStorage.getItem(STORAGE_KEY + '-notes');
if (savedNotes) {
  const ta = document.getElementById('feedback-notes');
  if (ta) ta.value = savedNotes;
}

document.getElementById('feedback-notes')?.addEventListener('input', (e) => {
  localStorage.setItem(STORAGE_KEY + '-notes', e.target.value);
});

updateProgress();
