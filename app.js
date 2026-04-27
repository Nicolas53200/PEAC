const STORAGE_KEY = 'peac-evaluations-v10';
const CANDIDATES_KEY = 'peac-candidates-v1';
const BASE_POINTS = 5;
const CHRONO_PRESETS = {
  F: { label: 'Femme', durationMs: 5 * 60 * 1000 + 30 * 1000 },
  H: { label: 'Homme', durationMs: 4 * 60 * 1000 },
};

const BAREMES = {
  1: {
    title: 'Fonction 1',
    subtitle: 'Toutes missions',
    ranges: [
      { min: 16, max: 30, label: '16–30 ans', multiplier: 0.7 },
      { min: 31, max: 40, label: '31–40 ans', multiplier: 0.8 },
      { min: 41, max: 50, label: '41–50 ans', multiplier: 0.9 },
      { min: 51, max: 60, label: '51–60 ans', multiplier: 1 },
      { min: 61, max: 67, label: '61–67 ans', multiplier: 1.2 },
    ],
  },
  2: {
    title: 'Fonction 2',
    subtitle: 'SSUAP',
    ranges: [
      { min: 16, max: 30, label: '16–30 ans', multiplier: 0.9 },
      { min: 31, max: 40, label: '31–40 ans', multiplier: 1 },
      { min: 41, max: 50, label: '41–50 ans', multiplier: 1.1 },
      { min: 51, max: 60, label: '51–60 ans', multiplier: 1.2 },
      { min: 61, max: 67, label: '61–67 ans', multiplier: 1.4 },
    ],
  },
  3: {
    title: 'Fonction 3',
    subtitle: 'Cadres',
    ranges: [
      { min: 18, max: 30, label: '18–30 ans', multiplier: 1 },
      { min: 31, max: 40, label: '31–40 ans', multiplier: 1.1 },
      { min: 41, max: 50, label: '41–50 ans', multiplier: 1.2 },
      { min: 51, max: 60, label: '51–60 ans', multiplier: 1.3 },
      { min: 61, max: 67, label: '61–67 ans', multiplier: 1.5 },
    ],
  },
};

const form = document.getElementById('evaluationForm');
const setupView = document.getElementById('setupView');
const recordsView = document.getElementById('recordsView');
const terrainMode = document.getElementById('terrainMode');
const openTerrainBtn = document.getElementById('openTerrainBtn');
const exitTerrainBtn = document.getElementById('exitTerrainBtn');
const saveTerrainBtn = document.getElementById('saveTerrainBtn');
const saveTerrainTopBtn = document.getElementById('saveTerrainTopBtn');
const newEvaluationBtn = document.getElementById('newEvaluationBtn');
const resetFormBtn = document.getElementById('resetFormBtn');
const exportCsvBtn = document.getElementById('exportCsvBtn');
const exportPdfBtn = document.getElementById('exportPdfBtn');
const shareBtn = document.getElementById('shareBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const recordsBody = document.getElementById('recordsBody');
const statsLine = document.getElementById('statsLine');
const rankingList = document.getElementById('rankingList');
const baremesTableBody = document.getElementById('baremesTableBody');
const ageRangeEl = document.getElementById('ageRange');
const multiplierEl = document.getElementById('multiplier');
const basePointsEl = document.getElementById('basePoints');
const distancePointsEl = document.getElementById('distancePoints');
const pointsEl = document.getElementById('points');
const openBaremesBtn = document.getElementById('openBaremesBtn');
const openBaremesTerrainBtn = document.getElementById('openBaremesTerrainBtn');
const closeBaremesBtn = document.getElementById('closeBaremesBtn');
const baremesModal = document.getElementById('baremesModal');

const chronoDisplays = [
  document.getElementById('chronoDisplay'),
  document.getElementById('terrainChronoDisplay'),
];
const chronoPresetLabels = [
  document.getElementById('chronoPresetLabel'),
  document.getElementById('terrainPresetLabel'),
];
const counterDisplays = [
  document.getElementById('counterDisplay'),
  document.getElementById('terrainCounterDisplay'),
];
const terrainDistanceInfo = document.getElementById('terrainDistanceInfo');
const terrainChronoInfo = document.getElementById('terrainChronoInfo');
const terrainCandidateName = document.getElementById('terrainCandidateName');
const terrainCandidateMeta = document.getElementById('terrainCandidateMeta');

const startButtons = [
  document.getElementById('startChronoBtn'),
  document.getElementById('terrainStartChronoBtn'),
];
const pauseButtons = [
  document.getElementById('pauseChronoBtn'),
  document.getElementById('terrainPauseChronoBtn'),
];
const resetButtons = [
  document.getElementById('resetChronoBtn'),
  document.getElementById('terrainResetChronoBtn'),
];
const presetFemmeButtons = [
  document.getElementById('presetFemmeBtn'),
  document.getElementById('terrainPresetFemmeBtn'),
];
const presetHommeButtons = [
  document.getElementById('presetHommeBtn'),
  document.getElementById('terrainPresetHommeBtn'),
];
const plusDistanceButtons = [
  document.getElementById('plusDistanceBtn'),
  document.getElementById('terrainPlusDistanceBtn'),
];
const minusDistanceButtons = [
  document.getElementById('minusDistanceBtn'),
  document.getElementById('terrainMinusDistanceBtn'),
];
const resetDistanceButtons = [
  document.getElementById('resetDistanceBtn'),
  document.getElementById('terrainResetDistanceBtn'),
];

const fields = {
  nom: document.getElementById('nom'),
  prenom: document.getElementById('prenom'),
  centre: document.getElementById('centre'),
  age: document.getElementById('age'),
  sexe: document.getElementById('sexe'),
  fonction: document.getElementById('fonction'),
  distances: document.getElementById('distances'),
  fc1: document.getElementById('fc1'),
  fc2: document.getElementById('fc2'),
  observation: document.getElementById('observation'),
};

let records = loadRecords();
let candidates = loadCandidates();
let activeCandidateTab = 'pending';
let ppaMode = false;
let chronoInterval = null;
let chronoStart = 0;
let chronoElapsed = 0;
let chronoDuration = CHRONO_PRESETS.F.durationMs;
let selectedChronoSexe = 'F';
let beepPlayed = false;
let distanceCounter = 0;

// ─── Candidates ──────────────────────────────────────────────────────────────

function loadCandidates() {
  try {
    return JSON.parse(localStorage.getItem(CANDIDATES_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCandidates() {
  localStorage.setItem(CANDIDATES_KEY, JSON.stringify(candidates));
}

function generateCandidateId() {
  if (window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID();
  return `cand-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

function markCandidateDone(candidateId) {
  const cand = candidates.find((c) => c.id === candidateId);
  if (cand) { cand.status = 'done'; saveCandidates(); renderCandidates(); }
}

function getCandidateByName(nom, prenom) {
  return candidates.find(
    (c) => c.nom.toLowerCase() === nom.toLowerCase() && c.prenom.toLowerCase() === prenom.toLowerCase()
  ) || null;
}

function addCandidate(data) {
  const existing = candidates.find(
    (c) => c.nom.toLowerCase() === data.nom.toLowerCase() && c.prenom.toLowerCase() === data.prenom.toLowerCase()
  );
  if (existing) {
    alert(`${data.prenom} ${data.nom} est déjà dans la liste.`);
    return false;
  }
  candidates.push({ ...data, id: generateCandidateId(), status: 'pending', createdAt: new Date().toISOString() });
  saveCandidates();
  renderCandidates();
  return true;
}

function renderCandidates() {
  const pendingList = document.getElementById('candidatesPendingList');
  const doneList = document.getElementById('candidatesDoneList');
  const pendingTab = document.getElementById('tabPending');
  const doneTab = document.getElementById('tabDone');
  const pendingCount = document.getElementById('pendingCount');
  const doneCount = document.getElementById('doneCount');
  if (!pendingList || !doneList) return;

  const pending = candidates.filter((c) => c.status === 'pending');
  const done = candidates.filter((c) => c.status === 'done');

  pendingCount.textContent = pending.length;
  doneCount.textContent = done.length;

  pendingTab.classList.toggle('is-active', activeCandidateTab === 'pending');
  doneTab.classList.toggle('is-active', activeCandidateTab === 'done');

  pendingList.hidden = activeCandidateTab !== 'pending';
  doneList.hidden = activeCandidateTab !== 'done';

  function buildCard(cand, isDone, index) {
    const fonctionLabel = cand.fonction ? `${BAREMES[cand.fonction]?.title || ''}` : '';
    const sexeLabel = cand.sexe === 'F' ? 'Femme' : cand.sexe === 'H' ? 'Homme' : '';
    const metaParts = [cand.centre, fonctionLabel, sexeLabel, cand.age ? cand.age + ' ans' : ''].filter(Boolean);
    const card = document.createElement('div');
    card.className = `candidate-card${isDone ? ' is-done' : ''}`;
    card.innerHTML = `
      <div class="candidate-info">
        <span class="candidate-index">${index + 1}</span>
        <span class="candidate-name">${escapeHtml(cand.prenom)} ${escapeHtml(cand.nom)}</span>
        ${metaParts.length ? `<span class="candidate-sep">·</span><span class="candidate-meta">${escapeHtml(metaParts.join(' · '))}</span>` : ''}
        ${isDone ? '<span class="candidate-done-badge">✓ Passé</span>' : ''}
      </div>
      <div class="candidate-actions">
        <button class="primary-btn candidate-select-btn" data-cand-id="${cand.id}" type="button">${isDone ? '✏️ Corriger' : '▶ Évaluer'}</button>
        <button class="candidate-delete-btn" data-cand-delete="${cand.id}" type="button">✕</button>
      </div>
    `;
    return card;
  }

  pendingList.innerHTML = '';
  if (pending.length === 0) {
    pendingList.innerHTML = '<p class="candidates-empty">Aucun candidat en attente.</p>';
  } else {
    pending.forEach((c, i) => pendingList.appendChild(buildCard(c, false, i)));
  }

  doneList.innerHTML = '';
  if (done.length === 0) {
    doneList.innerHTML = '<p class="candidates-empty">Aucun candidat passé pour le moment.</p>';
  } else {
    done.forEach((c, i) => doneList.appendChild(buildCard(c, true, i)));
  }
}

function selectCandidate(candidateId) {
  const cand = candidates.find((c) => c.id === candidateId);
  if (!cand) return;
  fields.nom.value = cand.nom;
  fields.prenom.value = cand.prenom;
  fields.centre.value = cand.centre || '';
  fields.age.value = cand.age || '';
  fields.fonction.value = cand.fonction || '';
  if (cand.sexe) setChronoPreset(cand.sexe);
  setDistanceCounter(0);
  calculatePreview();
  switchMainView('setup');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openAddCandidateModal() {
  const modal = document.getElementById('addCandidateModal');
  if (!modal) return;
  modal.hidden = false;
  requestAnimationFrame(() => modal.classList.add('is-visible'));
  document.getElementById('candNom').focus();
}

function closeAddCandidateModal() {
  const modal = document.getElementById('addCandidateModal');
  if (!modal) return;
  modal.classList.remove('is-visible');
  setTimeout(() => { modal.hidden = true; }, 180);
  document.getElementById('addCandidateForm').reset();
}

function handleImportExcel(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      let added = 0;
      let skipped = 0;
      rows.forEach((row) => {
        // Accept flexible column names (case-insensitive)
        const get = (keys) => {
          for (const k of keys) {
            const found = Object.keys(row).find((rk) => rk.toLowerCase().replace(/[^a-z]/g, '') === k);
            if (found !== undefined) return String(row[found]).trim();
          }
          return '';
        };
        const nom = get(['nom']);
        const prenom = get(['prenom', 'prénom']);
        const centre = get(['centre']);
        const ageRaw = get(['age']);
        const age = ageRaw ? Number(ageRaw) : '';
        const sexeRaw = get(['sexe']).toUpperCase();
        const sexe = sexeRaw === 'F' || sexeRaw === 'FEMME' ? 'F' : sexeRaw === 'H' || sexeRaw === 'HOMME' ? 'H' : '';
        const fonctionRaw = get(['fonction']);
        const fonction = ['1', '2', '3'].includes(String(fonctionRaw)) ? String(fonctionRaw) : '';
        if (!nom || !prenom) { skipped++; return; }
        const existing = candidates.find(
          (c) => c.nom.toLowerCase() === nom.toLowerCase() && c.prenom.toLowerCase() === prenom.toLowerCase()
        );
        if (existing) { skipped++; return; }
        candidates.push({ nom, prenom, centre, age, sexe, fonction, id: generateCandidateId(), status: 'pending', createdAt: new Date().toISOString() });
        added++;
      });
      saveCandidates();
      renderCandidates();
      alert(`Import terminé : ${added} candidat(s) ajouté(s), ${skipped} ignoré(s) (doublon ou données manquantes).`);
    } catch (err) {
      console.error('Erreur import Excel', err);
      alert('Impossible de lire le fichier Excel. Vérifiez le format.');
    }
  };
  reader.readAsArrayBuffer(file);
}

// ─────────────────────────────────────────────────────────────────────────────

function findBareme(fonction, age) {
  const selected = BAREMES[fonction];
  if (!selected || Number.isNaN(age)) return null;
  return selected.ranges.find((range) => age >= range.min && age <= range.max) || null;
}

function calculateScore(range, distances) {
  if (ppaMode) {
    const distancePoints = Number(distances.toFixed(2));
    const totalPoints = Number((BASE_POINTS + distancePoints).toFixed(2));
    return { distancePoints, totalPoints };
  }
  const distancePoints = range ? Number((distances * range.multiplier).toFixed(2)) : 0;
  const totalPoints = Number((BASE_POINTS + distancePoints).toFixed(2));
  return { distancePoints, totalPoints };
}

function calculatePreview() {
  const age = Number(fields.age.value);
  const fonction = fields.fonction.value;
  const distances = Number(fields.distances.value || 0);
  const range = ppaMode ? null : findBareme(fonction, age);
  const { distancePoints, totalPoints } = calculateScore(range, distances);

  ageRangeEl.textContent = ppaMode ? 'PPA' : (range ? range.label : '—');
  multiplierEl.textContent = ppaMode ? '× 1' : (range ? formatNumber(range.multiplier) : '—');
  basePointsEl.textContent = formatNumber(BASE_POINTS);
  distancePointsEl.textContent = formatNumber(distancePoints);
  pointsEl.textContent = formatNumber(totalPoints);
  updateTerrainCandidateSummary();

  return { range, distancePoints, totalPoints };
}

function openBaremesModal() {
  if (!baremesModal) return;
  baremesModal.hidden = false;
  requestAnimationFrame(() => baremesModal.classList.add('is-visible'));
}

function closeBaremesModal() {
  if (!baremesModal) return;
  baremesModal.classList.remove('is-visible');
  setTimeout(() => {
    baremesModal.hidden = true;
  }, 180);
}

function renderBaremesTable() {
  baremesTableBody.innerHTML = '';
  const rowCount = Math.max(...Object.values(BAREMES).map((item) => item.ranges.length));

  for (let i = 0; i < rowCount; i += 1) {
    const f1 = BAREMES[1].ranges[i];
    const f2 = BAREMES[2].ranges[i];
    const f3 = BAREMES[3].ranges[i];
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${escapeHtml(f1?.label || f2?.label || f3?.label || '—')}</td>
      <td>${f1 ? formatNumber(f1.multiplier) : '—'}</td>
      <td>${f2 ? formatNumber(f2.multiplier) : '—'}</td>
      <td>${f3 ? formatNumber(f3.multiplier) : '—'}</td>
    `;
    baremesTableBody.appendChild(row);
  }
}

function getRankedRecords() {
  return [...records].sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    if (b.distancePoints !== a.distancePoints) return b.distancePoints - a.distancePoints;
    return new Date(a.createdAt) - new Date(b.createdAt);
  });
}

function renderRanking() {
  rankingList.innerHTML = '';
  if (!records.length) {
    rankingList.innerHTML = '<div class="ranking-pill">Aucun classement pour le moment.</div>';
    return;
  }

  getRankedRecords().slice(0, 5).forEach((record, index) => {
    const pill = document.createElement('div');
    pill.className = 'ranking-pill';
    pill.textContent = `#${index + 1} ${record.prenom} ${record.nom} — ${formatNumber(record.totalPoints)} pts`;
    rankingList.appendChild(pill);
  });
}

function renderRecords() {
  recordsBody.innerHTML = '';

  if (records.length === 0) {
    const row = document.createElement('tr');
    row.className = 'empty-row';
    row.innerHTML = '<td colspan="18">Aucune évaluation enregistrée pour le moment.</td>';
    recordsBody.appendChild(row);
    statsLine.textContent = '0 fiche';
    renderRanking();
    return;
  }

  const ranked = getRankedRecords();

  ranked.forEach((record, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${index + 1}</strong></td>
      <td>${escapeHtml(record.nom)}</td>
      <td>${escapeHtml(record.prenom)}</td>
      <td>${escapeHtml(record.centre)}</td>
      <td>${record.age}</td>
      <td>${escapeHtml(record.sexeLabel || '')}</td>
      <td>${escapeHtml(record.fonctionLabel)}</td>
      <td>${record.distances}</td>
      <td>${escapeHtml(record.chrono || '')}</td>
      <td>${record.ageRange}</td>
      <td>${formatNumber(record.multiplier)}</td>
      <td>${formatNumber(record.basePoints)}</td>
      <td>${formatNumber(record.distancePoints)}</td>
      <td><strong>${formatNumber(record.totalPoints)}</strong></td>
      <td>${escapeHtml(record.fc1 || '')}</td>
      <td>${escapeHtml(record.fc2 || '')}</td>
      <td>${escapeHtml(record.observation || '')}</td>
      <td><button class="small-btn" data-delete="${record.id}">Supprimer</button></td>
    `;
    recordsBody.appendChild(row);
  });

  const total = records.reduce((sum, entry) => sum + Number(entry.totalPoints), 0);
  statsLine.textContent = `${records.length} fiche${records.length > 1 ? 's' : ''} • ${formatNumber(total)} points cumulés`;
  renderRanking();
}

function saveRecords() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function loadRecords() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (error) {
    console.error('Impossible de relire les données locales', error);
    return [];
  }
}

function formatNumber(value) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(value);
}

function normalizeText(value) {
  return value.trim().replace(/\s+/g, ' ');
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function generateRecordId() {
  if (window.crypto && typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }
  return `record-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

function persistRecord(record) {
  records = [record, ...records];
  saveRecords();
  // Mark matching candidate as done
  const cand = getCandidateByName(record.nom, record.prenom);
  if (cand && cand.status === 'pending') {
    cand.status = 'done';
    saveCandidates();
    renderCandidates();
  }
  renderRecords();
}

function switchMainView(view) {
  const showSetup = view === 'setup';
  setupView.hidden = !showSetup;
  recordsView.hidden = showSetup;
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
}

function updateTerrainCandidateSummary() {
  const nom = normalizeText(fields.nom.value || '');
  const prenom = normalizeText(fields.prenom.value || '');
  const centre = normalizeText(fields.centre.value || '');
  const fonction = fields.fonction.value ? `${BAREMES[fields.fonction.value].title}` : 'Fonction à choisir';
  const sexe = fields.sexe.value === 'F' ? 'Femme' : fields.sexe.value === 'H' ? 'Homme' : 'Sexe à choisir';
  const fullName = `${prenom} ${nom}`.trim() || 'Nom Prénom';

  terrainCandidateName.textContent = fullName;
  terrainCandidateMeta.textContent = [centre || 'Centre à renseigner', fonction, sexe].join(' · ');
}

function syncDistanceInput() {
  fields.distances.value = String(distanceCounter);
  counterDisplays.forEach((display) => {
    display.textContent = String(distanceCounter);
  });
  terrainDistanceInfo.textContent = String(distanceCounter);
  calculatePreview();
}

function setDistanceCounter(value) {
  distanceCounter = Math.max(0, Number(value) || 0);
  syncDistanceInput();
}

function setPpaMode(active) {
  ppaMode = active;
  const btn = document.getElementById('ppaToggleBtn');
  const banner = document.getElementById('ppaBanner');
  if (btn) btn.classList.toggle('ppa-btn-active', active);
  if (banner) banner.hidden = !active;
  calculatePreview();
}

function openPpaModal() {
  const modal = document.getElementById('ppaModal');
  if (!modal) return;
  modal.hidden = false;
  requestAnimationFrame(() => modal.classList.add('is-visible'));
}

function closePpaModal() {
  const modal = document.getElementById('ppaModal');
  if (!modal) return;
  modal.classList.remove('is-visible');
  setTimeout(() => { modal.hidden = true; }, 180);
}

function resetForm() {
  form.reset();
  setDistanceCounter(0);
  setPpaMode(false);
  calculatePreview();
  setChronoPreset('F');
  fields.nom.focus();
}

function buildCsvContent() {
  const ranked = getRankedRecords();
  const header = [
    'Rang', 'Nom', 'Prénom', 'Centre', 'Âge', 'Sexe', 'Fonction', 'Distances (18m)', 'Chrono', 'Tranche',
    'Barème', 'Points initiaux', 'Points distances', 'Total', 'FC1', 'FC2', 'Observation'
  ];

  const rows = ranked.map((r, index) => [
    index + 1, r.nom, r.prenom, r.centre, r.age, r.sexeLabel || '', r.fonctionLabel, r.distances, r.chrono || '', r.ageRange,
    r.multiplier, r.basePoints, r.distancePoints, r.totalPoints, r.fc1 || '', r.fc2 || '', r.observation || ''
  ]);

  return [header, ...rows]
    .map((line) => line.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(';'))
    .join('\n');
}

function exportCsv() {
  if (records.length === 0) {
    alert('Aucune donnée à exporter.');
    return;
  }

  const csv = buildCsvContent();
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `peac-evaluations-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

function buildPrintHtml() {
  const ranked = getRankedRecords();
  const rows = ranked.map((record, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${escapeHtml(record.nom)}</td>
      <td>${escapeHtml(record.prenom)}</td>
      <td>${escapeHtml(record.centre)}</td>
      <td>${record.age}</td>
      <td>${escapeHtml(record.sexeLabel || '')}</td>
      <td>${escapeHtml(record.fonctionLabel)}</td>
      <td>${record.distances}</td>
      <td>${escapeHtml(record.chrono || '')}</td>
      <td>${escapeHtml(record.ageRange)}</td>
      <td>${formatNumber(record.multiplier)}</td>
      <td>${formatNumber(record.basePoints)}</td>
      <td>${formatNumber(record.distancePoints)}</td>
      <td>${formatNumber(record.totalPoints)}</td>
      <td>${escapeHtml(record.fc1 || '')}</td>
      <td>${escapeHtml(record.fc2 || '')}</td>
      <td>${escapeHtml(record.observation || '')}</td>
    </tr>
  `).join('');

  return `<!doctype html>
  <html lang="fr">
  <head>
    <meta charset="utf-8">
    <title>PEAC SDIS Mayenne - Évaluations</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 24px; color: #111827; }
      h1 { margin: 0 0 8px; }
      p { margin: 0 0 16px; color: #4b5563; }
      table { width: 100%; border-collapse: collapse; font-size: 10px; }
      th, td { border: 1px solid #cbd5e1; padding: 6px; text-align: left; vertical-align: top; }
      th { background: #eff6ff; }
    </style>
  </head>
  <body>
    <h1>PEAC SDIS Mayenne — Évaluations</h1>
    <p>Édition du ${new Date().toLocaleString('fr-FR')}</p>
    <table>
      <thead>
        <tr>
          <th>Rang</th><th>Nom</th><th>Prénom</th><th>Centre</th><th>Âge</th><th>Sexe</th><th>Fonction</th><th>Distances</th><th>Chrono</th><th>Tranche</th><th>Barème</th><th>Base</th><th>Pts distances</th><th>Total</th><th>FC1</th><th>FC2</th><th>Observation</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </body>
  </html>`;
}

function exportPdfView() {
  if (records.length === 0) {
    alert('Aucune donnée à exporter.');
    return;
  }
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Impossible d’ouvrir la fenêtre PDF. Vérifie le bloqueur de pop-up.');
    return;
  }
  printWindow.document.open();
  printWindow.document.write(buildPrintHtml());
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 400);
}

async function shareRecords() {
  if (records.length === 0) {
    alert('Aucune donnée à partager.');
    return;
  }

  const csvBlob = new Blob([buildCsvContent()], { type: 'text/csv' });
  const fileName = `peac-evaluations-${new Date().toISOString().slice(0, 10)}.csv`;
  const csvFile = new File([csvBlob], fileName, { type: 'text/csv' });

  if (navigator.canShare && navigator.canShare({ files: [csvFile] })) {
    try {
      await navigator.share({
        title: 'PEAC SDIS Mayenne',
        text: 'Export des évaluations PEAC.',
        files: [csvFile],
      });
      return;
    } catch (error) {
      if (error?.name !== 'AbortError') {
        console.error('Partage annulé ou impossible', error);
      }
    }
  }

  const subject = encodeURIComponent('Export évaluations PEAC SDIS Mayenne');
  const body = encodeURIComponent('Bonjour,\n\nLe fichier CSV a été généré sur la tablette. Ajoutez-le en pièce jointe à cet e-mail.\n\nCordialement.');
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
}

function formatChrono(ms) {
  const clamped = Math.max(0, ms);
  const totalTenths = Math.floor(clamped / 100);
  const minutes = Math.floor(totalTenths / 600);
  const seconds = Math.floor((totalTenths % 600) / 10);
  const tenths = totalTenths % 10;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${tenths}`;
}

function playBeep() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = 880;
    gain.gain.value = 0.12;
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.45);
    oscillator.onended = () => context.close();
  } catch (error) {
    console.error('Bip impossible', error);
  }
}

function updateAllChronoDisplays(text, isDanger) {
  chronoDisplays.forEach((display) => {
    display.textContent = text;
    display.classList.toggle('danger', isDanger);
  });
  terrainChronoInfo.textContent = text;
}

function applySexeTheme(sexe) {
  chronoDisplays.forEach((display) => {
    display.classList.toggle('female-mode', sexe === 'F');
    display.classList.toggle('male-mode', sexe === 'H');
  });
  const panelLabels = [...chronoPresetLabels, terrainChronoInfo];
  panelLabels.forEach((element) => {
    if (!element) return;
    element.classList.toggle('female-mode', sexe === 'F');
    element.classList.toggle('male-mode', sexe === 'H');
  });
}

function setChronoPreset(sexe) {
  selectedChronoSexe = sexe;
  fields.sexe.value = sexe;
  chronoDuration = CHRONO_PRESETS[sexe].durationMs;
  beepPlayed = false;

  presetFemmeButtons.forEach((button) => button.classList.toggle('is-active', sexe === 'F'));
  presetHommeButtons.forEach((button) => button.classList.toggle('is-active', sexe === 'H'));
  chronoPresetLabels.forEach((label) => {
    label.textContent = `${CHRONO_PRESETS[sexe].label} · ${formatChrono(chronoDuration).replace('.0', '')}`;
  });
  applySexeTheme(sexe);
  resetChrono();
  updateTerrainCandidateSummary();
}

function currentRemainingMs() {
  const elapsed = chronoElapsed + (chronoInterval ? Date.now() - chronoStart : 0);
  return Math.max(0, chronoDuration - elapsed);
}

function updateChronoDisplay() {
  const remaining = currentRemainingMs();
  const displayText = formatChrono(remaining);
  const isDanger = remaining > 0 && remaining <= 30000;
  updateAllChronoDisplays(displayText, isDanger);

  if (remaining <= 0 && chronoInterval) {
    clearInterval(chronoInterval);
    chronoInterval = null;
    chronoElapsed = chronoDuration;
    if (!beepPlayed) {
      beepPlayed = true;
      playBeep();
    }
  }
}

function startChrono() {
  if (chronoInterval) return;
  chronoStart = Date.now();
  beepPlayed = false;
  chronoInterval = setInterval(updateChronoDisplay, 100);
  updateChronoDisplay();
}

function pauseChrono() {
  if (!chronoInterval) return;
  chronoElapsed += Date.now() - chronoStart;
  clearInterval(chronoInterval);
  chronoInterval = null;
  updateChronoDisplay();
}

function resetChrono() {
  clearInterval(chronoInterval);
  chronoInterval = null;
  chronoElapsed = 0;
  chronoStart = 0;
  updateChronoDisplay();
}

function validateSetupBeforeTerrain() {
  if (!fields.nom.value.trim() || !fields.prenom.value.trim() || !fields.centre.value.trim()) {
    alert('Renseigne au minimum nom, prénom et centre avant de passer en mode jury.');
    return false;
  }
  if (!fields.age.value || !fields.fonction.value || !fields.sexe.value) {
    alert('Choisis l’âge, la fonction et le sexe avant de passer en mode jury.');
    return false;
  }
  const age = Number(fields.age.value);
  if (!findBareme(fields.fonction.value, age)) {
    alert('Âge ou fonction hors barème. Vérifie la saisie.');
    return false;
  }
  return true;
}

async function enterTerrainMode() {
  if (!validateSetupBeforeTerrain()) return;
  updateTerrainCandidateSummary();
  terrainMode.hidden = false;
  document.body.classList.add('terrain-open');
  try {
    if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    }
  } catch (error) {
    console.error('Plein écran non disponible', error);
  }
}

async function exitTerrainMode(targetView = 'records') {
  terrainMode.hidden = true;
  document.body.classList.remove('terrain-open');
  try {
    if (document.fullscreenElement && document.exitFullscreen) {
      await document.exitFullscreen();
    }
  } catch (error) {
    console.error('Sortie plein écran impossible', error);
  }
  switchMainView(targetView);
}

function buildRecordFromForm() {
  const age = Number(fields.age.value);
  const sexe = fields.sexe.value;
  const fonction = fields.fonction.value;
  const distances = Number(fields.distances.value || 0);
  const range = ppaMode ? null : findBareme(fonction, age);

  if (!ppaMode && !range) {
    alert('Âge ou fonction hors barème. Vérifie la saisie.');
    return null;
  }

  const { distancePoints, totalPoints } = calculateScore(range, distances);

  return {
    id: generateRecordId(),
    nom: normalizeText(fields.nom.value),
    prenom: normalizeText(fields.prenom.value),
    centre: normalizeText(fields.centre.value),
    age,
    sexe,
    sexeLabel: sexe === 'F' ? 'Femme' : 'Homme',
    fonction,
    fonctionLabel: fonction ? `${BAREMES[fonction].title} – ${BAREMES[fonction].subtitle}` : '—',
    distances,
    multiplier: ppaMode ? 1 : (range ? range.multiplier : 0),
    ageRange: ppaMode ? 'PPA' : (range ? range.label : '—'),
    basePoints: BASE_POINTS,
    distancePoints,
    totalPoints,
    ppa: ppaMode,
    fc1: normalizeText(fields.fc1.value),
    fc2: normalizeText(fields.fc2.value),
    observation: normalizeText(fields.observation.value),
    chrono: chronoDisplays[0].textContent,
    createdAt: new Date().toISOString(),
  };
}

async function saveCurrentEvaluation() {
  const record = buildRecordFromForm();
  if (!record) return;

  try {
    persistRecord(record);
    resetForm();
    await exitTerrainMode('records');
  } catch (error) {
    console.error('Enregistrement impossible', error);
    alert('Impossible d’enregistrer le résultat sur cette tablette.');
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const record = buildRecordFromForm();
  if (!record) return;

  try {
    persistRecord(record);
    switchMainView('records');
    resetForm();
  } catch (error) {
    console.error('Enregistrement impossible', error);
    alert('Impossible d’enregistrer le résultat sur cette tablette.');
  }
});

recordsBody.addEventListener('click', (event) => {
  const deleteId = event.target.getAttribute('data-delete');
  if (!deleteId) return;
  records = records.filter((record) => record.id !== deleteId);
  saveRecords();
  renderRecords();
});

resetFormBtn.addEventListener('click', resetForm);
openTerrainBtn.addEventListener('click', enterTerrainMode);
exitTerrainBtn.addEventListener('click', () => exitTerrainMode('records'));
saveTerrainBtn.addEventListener('click', saveCurrentEvaluation);
if (saveTerrainTopBtn) saveTerrainTopBtn.addEventListener('click', saveCurrentEvaluation);
newEvaluationBtn.addEventListener('click', () => switchMainView('setup'));
document.getElementById('viewResultsBtn')?.addEventListener('click', () => switchMainView('records'));
exportCsvBtn.addEventListener('click', exportCsv);
exportPdfBtn.addEventListener('click', exportPdfView);
shareBtn.addEventListener('click', shareRecords);
if (openBaremesBtn) openBaremesBtn.addEventListener('click', openBaremesModal);
if (openBaremesTerrainBtn) openBaremesTerrainBtn.addEventListener('click', openBaremesModal);
if (closeBaremesBtn) closeBaremesBtn.addEventListener('click', closeBaremesModal);
if (baremesModal) {
  baremesModal.addEventListener('click', (event) => {
    if (event.target === baremesModal) closeBaremesModal();
  });
}

// PPA
document.getElementById('ppaToggleBtn')?.addEventListener('click', () => {
  if (ppaMode) {
    setPpaMode(false); // toggle off directly
  } else {
    openPpaModal();
  }
});
document.getElementById('ppaConfirmBtn')?.addEventListener('click', () => {
  closePpaModal();
  setPpaMode(true);
});
document.getElementById('ppaCancelBtn')?.addEventListener('click', closePpaModal);
document.getElementById('ppaModal')?.addEventListener('click', (e) => {
  if (e.target === document.getElementById('ppaModal')) closePpaModal();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (baremesModal && !baremesModal.hidden) closeBaremesModal();
    if (document.getElementById('ppaModal') && !document.getElementById('ppaModal').hidden) closePpaModal();
  }
});

clearAllBtn.addEventListener('click', () => {
  if (!records.length) return;
  const confirmed = window.confirm('Supprimer toutes les évaluations enregistrées sur cette tablette ?');
  if (!confirmed) return;
  records = [];
  saveRecords();
  renderRecords();
});

startButtons.forEach((button) => button.addEventListener('click', startChrono));
pauseButtons.forEach((button) => button.addEventListener('click', pauseChrono));
resetButtons.forEach((button) => button.addEventListener('click', resetChrono));
presetFemmeButtons.forEach((button) => button.addEventListener('click', () => setChronoPreset('F')));
presetHommeButtons.forEach((button) => button.addEventListener('click', () => setChronoPreset('H')));
plusDistanceButtons.forEach((button) => button.addEventListener('click', () => setDistanceCounter(distanceCounter + 1)));
minusDistanceButtons.forEach((button) => button.addEventListener('click', () => setDistanceCounter(distanceCounter - 1)));
resetDistanceButtons.forEach((button) => button.addEventListener('click', () => setDistanceCounter(0)));

counterDisplays.forEach((display) => {
  display.addEventListener('click', () => setDistanceCounter(distanceCounter + 1));
});


fields.distances.addEventListener('input', () => setDistanceCounter(fields.distances.value));
fields.sexe.addEventListener('change', () => {
  if (fields.sexe.value && fields.sexe.value !== selectedChronoSexe) {
    setChronoPreset(fields.sexe.value);
  }
  updateTerrainCandidateSummary();
});

Object.values(fields).forEach((field) => {
  if (field !== fields.distances && field !== fields.sexe) {
    field.addEventListener('input', calculatePreview);
  }
  field.addEventListener('change', calculatePreview);
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch((error) => {
      console.error('Service worker non enregistré', error);
    });
  });
}

renderBaremesTable();
renderRecords();
renderCandidates();
switchMainView(records.length ? 'records' : 'setup');
resetForm();

// ─── Candidates UI wiring ────────────────────────────────────────────────────

document.getElementById('tabPending')?.addEventListener('click', () => {
  activeCandidateTab = 'pending'; renderCandidates();
});
document.getElementById('tabDone')?.addEventListener('click', () => {
  activeCandidateTab = 'done'; renderCandidates();
});

document.getElementById('openAddCandidateBtn')?.addEventListener('click', openAddCandidateModal);
document.getElementById('closeAddCandidateBtn')?.addEventListener('click', closeAddCandidateModal);
document.getElementById('closeAddCandidateBtn2')?.addEventListener('click', closeAddCandidateModal);
document.getElementById('addCandidateModal')?.addEventListener('click', (e) => {
  if (e.target === document.getElementById('addCandidateModal')) closeAddCandidateModal();
});

document.getElementById('addCandidateForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const nom = document.getElementById('candNom').value.trim();
  const prenom = document.getElementById('candPrenom').value.trim();
  const centre = document.getElementById('candCentre').value.trim();
  const age = Number(document.getElementById('candAge').value) || '';
  const sexe = document.getElementById('candSexe').value;
  const fonction = document.getElementById('candFonction').value;
  if (addCandidate({ nom, prenom, centre, age, sexe, fonction })) closeAddCandidateModal();
});

document.getElementById('importExcelBtn')?.addEventListener('click', () => {
  document.getElementById('importExcelInput').click();
});
document.getElementById('importExcelInput')?.addEventListener('change', (e) => {
  handleImportExcel(e.target.files[0]);
  e.target.value = '';
});
document.getElementById('clearCandidatesBtn')?.addEventListener('click', () => {
  if (!candidates.length) return;
  if (!confirm('Supprimer toute la liste des candidats ?')) return;
  candidates = [];
  saveCandidates();
  renderCandidates();
});

// Delegate: select or delete candidate cards
document.getElementById('candidatesPendingList')?.addEventListener('click', handleCandidateListClick);
document.getElementById('candidatesDoneList')?.addEventListener('click', handleCandidateListClick);

function handleCandidateListClick(e) {
  const selectBtn = e.target.closest('[data-cand-id]');
  const deleteBtn = e.target.closest('[data-cand-delete]');
  if (selectBtn) selectCandidate(selectBtn.getAttribute('data-cand-id'));
  if (deleteBtn) {
    const id = deleteBtn.getAttribute('data-cand-delete');
    candidates = candidates.filter((c) => c.id !== id);
    saveCandidates();
    renderCandidates();
  }
}
