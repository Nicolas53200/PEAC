const STORAGE_KEY = 'peac-evaluations-v10';
const CANDIDATES_KEY = 'peac-candidates-v1';
const BASE_POINTS_MAX = 5;
const CHRONO_PRESETS = {
  F: { label: 'Femme', durationMs: 5 * 60 * 1000 + 30 * 1000 },
  H: { label: 'Homme', durationMs: 4 * 60 * 1000 },
};

const ETAPES = [
  { id: 'e1', label: '10 ondulations' },
  { id: 'e2', label: 'Passage du banc A/R' },
  { id: 'e3', label: '10 Steps avec 2 sacs' },
  { id: 'e4', label: '10 touchés alternatifs (1m60)' },
  { id: 'e5', label: 'Traction charge 20 kg A/R' },
];

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
const candidatesSection = document.getElementById('candidatesSection');
const evaluationCard = document.getElementById('evaluationCard');
const jurySection = document.getElementById('jurySection');
const openCandidateEvaluationBtn = document.getElementById('openCandidateEvaluationBtn');
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
const stopButtons = [
  document.getElementById('stopChronoBtn'),
  document.getElementById('terrainStopChronoBtn'),
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
  fc0: document.getElementById('fc0'),
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

// Callback à appeler après confirmation du popup résultat partiel
let _partialResultCallback = null;

// ─── Résultat partiel (blessure / arrêt) ─────────────────────────────────────

function openPartialResultModal(onConfirm) {
  const modal = document.getElementById('partialResultModal');
  if (!modal) return;

  // Reset checkboxes et champs
  ETAPES.forEach((e) => {
    const cb = document.getElementById(`etape_${e.id}`);
    if (cb) cb.checked = false;
  });
  const blessureEl = document.getElementById('partialBlessure');
  const commentEl = document.getElementById('partialComment');
  if (blessureEl) blessureEl.checked = false;
  if (commentEl) commentEl.value = '';

  _partialResultCallback = onConfirm;
  modal.hidden = false;
  requestAnimationFrame(() => modal.classList.add('is-visible'));
}

function closePartialResultModal() {
  const modal = document.getElementById('partialResultModal');
  if (!modal) return;
  modal.classList.remove('is-visible');
  setTimeout(() => { modal.hidden = true; }, 180);
  // _partialResultCallback géré par le listener confirm/cancel — pas effacé ici
}

function collectPartialResult() {
  const etapesValidees = ETAPES.filter((e) => {
    const cb = document.getElementById(`etape_${e.id}`);
    return cb && cb.checked;
  });
  const blessure = document.getElementById('partialBlessure')?.checked || false;
  const comment = document.getElementById('partialComment')?.value.trim() || '';
  return { etapesValidees, blessure, comment };
}

function buildEtapesLabel(etapesValidees) {
  if (!etapesValidees || etapesValidees.length === 0) return 'Aucune étape';
  return etapesValidees.map((e, i) => `Ét.${ETAPES.indexOf(e) + 1}`).join(' ');
}

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

let _editingRecordId = null;

function showEvaluationCard(showJury = false) {
  if (evaluationCard) evaluationCard.hidden = false;
  if (jurySection) jurySection.hidden = !showJury;
}

function hideEvaluationWorkspace() {
  if (evaluationCard) evaluationCard.hidden = true;
  if (jurySection) jurySection.hidden = true;
}

function openCandidateEvaluationPanel() {
  // Le bouton "Évaluation du candidat" bascule directement sur le poste jury pleine page.
  enterTerrainMode();
}

function selectCandidate(candidateId) {
  const cand = candidates.find((c) => c.id === candidateId);
  if (!cand) return;

  // Chercher le record existant pour pré-remplir aussi les données d'évaluation
  const existingRecord = records.find(
    (r) => r.nom.toLowerCase() === cand.nom.toLowerCase()
      && r.prenom.toLowerCase() === cand.prenom.toLowerCase()
  );

  _editingRecordId = existingRecord ? existingRecord.id : null;

  fields.nom.value = cand.nom;
  fields.prenom.value = cand.prenom;
  fields.centre.value = cand.centre || '';
  fields.age.value = existingRecord ? existingRecord.age : (cand.age || '');
  fields.fonction.value = existingRecord ? existingRecord.fonction : (cand.fonction || '');
  if (cand.sexe || existingRecord?.sexe) setChronoPreset(cand.sexe || existingRecord.sexe);

  if (existingRecord) {
    setDistanceCounter(existingRecord.distances || 0);
    fields.fc0.value = existingRecord.fc0 || '';
    fields.fc1.value = existingRecord.fc1 || '';
    fields.fc2.value = existingRecord.fc2 || '';
    fields.observation.value = existingRecord.observation || '';
  } else {
    setDistanceCounter(0);
  }

  // Indicateur visuel mode édition
  const formTitle = document.querySelector('#setupView .form-card .section-head h2');
  if (formTitle) {
    formTitle.textContent = _editingRecordId ? '✏️ Modifier l\'évaluation' : 'Nouvelle évaluation';
  }
  const submitBtn = document.getElementById('addWithoutFullscreenBtn');
  if (submitBtn) submitBtn.textContent = _editingRecordId ? 'Enregistrer les modifications' : 'Ajouter l\'évaluation';

  calculatePreview();
  updateTerrainCandidateSummary();
  showEvaluationCard(false);
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

function calculateAgeFromDob(dob) {
  let date;
  if (dob instanceof Date) {
    date = dob;
  } else if (typeof dob === 'number') {
    date = new Date((dob - 25569) * 86400 * 1000);
  } else if (typeof dob === 'string') {
    const parts = dob.split(/[\/\-\.]/);
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        date = new Date(`${parts[0]}-${parts[1]}-${parts[2]}`);
      } else {
        date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      }
    }
  }
  if (!date || isNaN(date)) return '';
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const m = today.getMonth() - date.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < date.getDate())) age--;
  return age >= 16 && age <= 67 ? age : '';
}

function handleImportExcel(file) {
  if (!file) return;
  if (typeof XLSX === 'undefined') {
    alert('La librairie Excel n\'est pas disponible (connexion internet requise pour le premier chargement). Reconnecte-toi une fois pour mettre en cache cette fonctionnalité.');
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array', cellDates: true });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      let added = 0;
      let skipped = 0;
      rows.forEach((row) => {
        const get = (keys) => {
          for (const k of keys) {
            const found = Object.keys(row).find((rk) => rk.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z]/g, '') === k);
            if (found !== undefined) return row[found];
          }
          return '';
        };
        const nom = String(get(['nom']) || '').trim();
        const prenom = String(get(['prenom']) || '').trim();
        const centre = String(get(['centre']) || '').trim();

        let age = '';
        const ageRaw = get(['age', 'ageauto']);
        if (ageRaw !== '') age = Number(ageRaw) || '';
        if (!age) {
          const dobRaw = get(['datenaissance', 'ddn', 'naissance', 'datedenaissance']);
          if (dobRaw !== '') age = calculateAgeFromDob(dobRaw);
        }

        const sexeRaw = String(get(['sexe']) || '').toUpperCase().trim();
        const sexe = sexeRaw === 'F' || sexeRaw === 'FEMME' ? 'F' : sexeRaw === 'H' || sexeRaw === 'HOMME' ? 'H' : '';
        const fonctionRaw = String(get(['fonction']) || '').trim();
        const fonction = ['1', '2', '3'].includes(fonctionRaw) ? fonctionRaw : '';

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

function calculateScore(range, distances, basePoints) {
  const base = typeof basePoints === 'number' ? basePoints : BASE_POINTS_MAX;
  if (ppaMode) {
    const distancePoints = Number(distances.toFixed(2));
    const totalPoints = Number((base + distancePoints).toFixed(2));
    return { distancePoints, totalPoints };
  }
  const distancePoints = range ? Number((distances * range.multiplier).toFixed(2)) : 0;
  const totalPoints = Number((base + distancePoints).toFixed(2));
  return { distancePoints, totalPoints };
}

function calculatePreview() {
  const age = Number(fields.age.value);
  const fonction = fields.fonction.value;
  const distances = Number(fields.distances.value || 0);
  const range = ppaMode ? null : findBareme(fonction, age);
  const { distancePoints, totalPoints } = calculateScore(range, distances, BASE_POINTS_MAX);

  ageRangeEl.textContent = ppaMode ? 'PPA' : (range ? range.label : '—');
  multiplierEl.textContent = ppaMode ? '× 1' : (range ? formatNumber(range.multiplier) : '—');
  basePointsEl.textContent = formatNumber(BASE_POINTS_MAX);
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
  setTimeout(() => { baremesModal.hidden = true; }, 180);
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
    let label = `#${index + 1} ${record.prenom} ${record.nom} — ${formatNumber(record.totalPoints)} pts`;
    if (record.blessure) label += ' 🩹';
    rankingList.appendChild(pill);
    pill.textContent = label;
  });
}

function buildEtapesCell(record) {
  if (!record.etapesValidees || record.etapesValidees.length === 0) {
    return record.distances > 0
      ? '<span class="etapes-all">✓ Toutes</span>'
      : '<span class="etapes-none">—</span>';
  }
  const nums = record.etapesValidees.map((e) => {
    const idx = ETAPES.findIndex((et) => et.id === e.id);
    return idx >= 0 ? idx + 1 : '?';
  });
  return `<span class="etapes-partial">Ét. ${nums.join(', ')}</span>`;
}


function buildCandidateProgressText() {
  const passed = candidates.filter((c) => c.status === 'done').length || records.length;
  const remaining = candidates.filter((c) => c.status !== 'done').length;
  return `${passed} candidat${passed > 1 ? 's' : ''} passé${passed > 1 ? 's' : ''} • ${remaining} candidat${remaining > 1 ? 's' : ''} restant${remaining > 1 ? 's' : ''}`;
}

function renderRecords() {
  recordsBody.innerHTML = '';

  if (records.length === 0) {
    const row = document.createElement('tr');
    row.className = 'empty-row';
    row.innerHTML = '<td colspan="20">Aucune évaluation enregistrée pour le moment.</td>';
    recordsBody.appendChild(row);
    statsLine.textContent = buildCandidateProgressText();
    renderRanking();
    return;
  }

  const ranked = getRankedRecords();

  ranked.forEach((record, index) => {
    const row = document.createElement('tr');
    if (record.blessure) row.classList.add('row-blessure');
    else if (record.etapesValidees && record.etapesValidees.length < 5 && record.distances === 0) row.classList.add('row-partiel');

    const blessureIcon = record.blessure ? ' <span class="blessure-icon" title="Arrêt blessure">🩹</span>' : '';

    row.innerHTML = `
      <td><strong>${index + 1}</strong></td>
      <td>${escapeHtml(record.nom)}${blessureIcon}</td>
      <td>${escapeHtml(record.prenom)}</td>
      <td>${escapeHtml(record.centre)}</td>
      <td>${record.age}</td>
      <td>${escapeHtml(record.sexeLabel || '')}</td>
      <td>${escapeHtml(record.fonctionLabel)}</td>
      <td>${buildEtapesCell(record)}</td>
      <td>${record.distances}</td>
      <td>${escapeHtml(record.chrono || '')}</td>
      <td>${record.ageRange}</td>
      <td>${formatNumber(record.multiplier)}</td>
      <td>${formatNumber(record.basePoints)}</td>
      <td>${formatNumber(record.distancePoints)}</td>
      <td><strong>${formatNumber(record.totalPoints)}</strong></td>
      <td>${escapeHtml(record.fc0 || '')}</td>
      <td>${escapeHtml(record.fc1 || '')}</td>
      <td>${escapeHtml(record.fc2 || '')}</td>
      <td>${escapeHtml(record.observation || '')}</td>
      <td class="actions-cell">
        <button class="small-btn qr-btn" data-qr-id="${record.id}" title="Générer QR pour tablette 2">QR</button>
        <button class="small-btn" data-delete="${record.id}">Supprimer</button>
      </td>
    `;
    recordsBody.appendChild(row);
  });

  statsLine.textContent = buildCandidateProgressText();
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
  if (_editingRecordId) {
    // Mode édition — remplacer le record existant
    const idx = records.findIndex((r) => r.id === _editingRecordId);
    if (idx !== -1) {
      record.id = _editingRecordId; // conserver le même id
      record.createdAt = records[idx].createdAt; // conserver la date originale
      records[idx] = record;
    } else {
      records = [record, ...records];
    }
    _editingRecordId = null;
  } else {
    records = [record, ...records];
  }
  saveRecords();

  // Sync candidat dans la liste
  const nomLower = record.nom.toLowerCase();
  const prenomLower = record.prenom.toLowerCase();
  let cand = candidates.find(
    (c) => c.nom.toLowerCase() === nomLower && c.prenom.toLowerCase() === prenomLower
  );
  if (cand) {
    cand.status = 'done';
  } else {
    candidates.push({
      id: generateCandidateId(),
      nom: record.nom, prenom: record.prenom,
      centre: record.centre || '', age: record.age || '',
      sexe: record.sexe || '', fonction: record.fonction || '',
      status: 'done', createdAt: new Date().toISOString(), autoAdded: true,
    });
  }
  saveCandidates();
  renderCandidates();
  renderRecords();
}

function switchMainView(view) {
  const showSetup = view === 'setup';
  setupView.hidden = !showSetup;
  recordsView.hidden = showSetup;
  if (candidatesSection) candidatesSection.hidden = !showSetup;
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
  _editingRecordId = null;
  const formTitle = document.querySelector('#setupView .form-card .section-head h2');
  if (formTitle) formTitle.textContent = 'Nouvelle évaluation';
  const submitBtn = document.getElementById('addWithoutFullscreenBtn');
  if (submitBtn) submitBtn.textContent = 'Ajouter l\'évaluation';
  if (!evaluationCard || !evaluationCard.hidden) fields.nom.focus();
}

function buildCsvContent() {
  const ranked = getRankedRecords();
  const header = [
    'Rang', 'Nom', 'Prénom', 'Centre', 'Âge', 'Sexe', 'Fonction',
    'Étapes validées', 'Distances (18m)', 'Chrono', 'Tranche',
    'Barème', 'Points initiaux', 'Points distances', 'Total',
    'Blessure', 'FC0', 'FC1', 'FC2', 'Observation'
  ];

  const rows = ranked.map((r, index) => {
    const etapesStr = r.distances > 0
      ? 'Toutes (5/5)'
      : r.etapesValidees
        ? r.etapesValidees.map((e) => e.label).join(' | ')
        : '—';
    return [
      index + 1, r.nom, r.prenom, r.centre, r.age, r.sexeLabel || '', r.fonctionLabel,
      etapesStr, r.distances, r.chrono || '', r.ageRange,
      r.multiplier, r.basePoints, r.distancePoints, r.totalPoints,
      r.blessure ? 'Oui' : 'Non', r.fc0 || '', r.fc1 || '', r.fc2 || '', r.observation || ''
    ];
  });

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
  const rows = ranked.map((record, index) => {
    const etapesStr = record.distances > 0
      ? 'Toutes (5/5)'
      : record.etapesValidees
        ? record.etapesValidees.map((e) => e.label).join(', ') || '—'
        : '—';
    const blessureStr = record.blessure ? '🩹 Oui' : '—';
    const rowStyle = record.blessure ? 'background:#fff3f3;' : (record.etapesValidees && record.etapesValidees.length < 5 && record.distances === 0 ? 'background:#fff8ec;' : '');
    return `
    <tr style="${rowStyle}">
      <td>${index + 1}</td>
      <td>${escapeHtml(record.nom)}</td>
      <td>${escapeHtml(record.prenom)}</td>
      <td>${escapeHtml(record.centre)}</td>
      <td>${record.age}</td>
      <td>${escapeHtml(record.sexeLabel || '')}</td>
      <td>${escapeHtml(record.fonctionLabel)}</td>
      <td>${escapeHtml(etapesStr)}</td>
      <td>${record.distances}</td>
      <td>${escapeHtml(record.chrono || '')}</td>
      <td>${escapeHtml(record.ageRange)}</td>
      <td>${formatNumber(record.multiplier)}</td>
      <td>${formatNumber(record.basePoints)}</td>
      <td>${formatNumber(record.distancePoints)}</td>
      <td>${formatNumber(record.totalPoints)}</td>
      <td>${blessureStr}</td>
      <td>${escapeHtml(record.fc0 || '')}</td>
      <td>${escapeHtml(record.fc1 || '')}</td>
      <td>${escapeHtml(record.fc2 || '')}</td>
      <td>${escapeHtml(record.observation || '')}</td>
    </tr>
  `;
  }).join('');

  return `<!doctype html>
  <html lang="fr">
  <head>
    <meta charset="utf-8">
    <title>PEAC SDIS Mayenne - Évaluations</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 24px; color: #111827; }
      h1 { margin: 0 0 8px; }
      p { margin: 0 0 16px; color: #4b5563; }
      table { width: 100%; border-collapse: collapse; font-size: 9px; }
      th, td { border: 1px solid #cbd5e1; padding: 5px; text-align: left; vertical-align: top; }
      th { background: #eff6ff; }
    </style>
  </head>
  <body>
    <h1>PEAC SDIS Mayenne — Évaluations</h1>
    <p>Édition du ${new Date().toLocaleString('fr-FR')}</p>
    <table>
      <thead>
        <tr>
          <th>Rang</th><th>Nom</th><th>Prénom</th><th>Centre</th><th>Âge</th><th>Sexe</th><th>Fonction</th>
          <th>Étapes</th><th>Distances</th><th>Chrono</th><th>Tranche</th><th>Barème</th>
          <th>Base</th><th>Pts dist.</th><th>Total</th><th>Blessure</th>
          <th>FC0</th><th>FC1</th><th>FC2</th><th>Observation</th>
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
    alert('Impossible d\'ouvrir la fenêtre PDF. Vérifie le bloqueur de pop-up.');
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

    // 3 bips courts et forts
    [0, 0.25, 0.5].forEach((offset) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'square';
      oscillator.frequency.value = 880;
      gain.gain.setValueAtTime(0, context.currentTime + offset);
      gain.gain.linearRampToValueAtTime(1.0, context.currentTime + offset + 0.01);
      gain.gain.linearRampToValueAtTime(0, context.currentTime + offset + 0.18);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(context.currentTime + offset);
      oscillator.stop(context.currentTime + offset + 0.2);
    });

    // 1 bip long final
    const osc2 = context.createOscillator();
    const gain2 = context.createGain();
    osc2.type = 'square';
    osc2.frequency.value = 660;
    gain2.gain.setValueAtTime(0, context.currentTime + 0.75);
    gain2.gain.linearRampToValueAtTime(1.0, context.currentTime + 0.76);
    gain2.gain.linearRampToValueAtTime(0, context.currentTime + 1.4);
    osc2.connect(gain2);
    gain2.connect(context.destination);
    osc2.start(context.currentTime + 0.75);
    osc2.stop(context.currentTime + 1.5);
    osc2.onended = () => context.close();

  } catch (error) {
    console.error('Bip impossible', error);
  }
}

function triggerEndAlert() {
  // Clignotement rouge intense sur tout l'écran
  const flash = document.createElement('div');
  flash.id = 'endFlash';
  flash.style.cssText = `
    position: fixed; inset: 0; z-index: 9999;
    background: #ef4444;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 24px;
    pointer-events: none;
  `;
  flash.innerHTML = `
    <div style="font-size: clamp(5rem, 18vw, 12rem); font-weight: 900; color: #fff; letter-spacing: -0.03em; font-family: ui-monospace, monospace;">STOP</div>
    <div style="font-size: clamp(1.4rem, 4vw, 2.8rem); font-weight: 800; color: rgba(255,255,255,0.9);">Temps écoulé — Arrêt de l'épreuve</div>
  `;
  document.body.appendChild(flash);

  // Clignotement 4 fois puis disparaît
  let count = 0;
  const blink = setInterval(() => {
    flash.style.opacity = flash.style.opacity === '0' ? '1' : '0';
    count++;
    if (count >= 8) {
      clearInterval(blink);
      flash.style.transition = 'opacity 0.6s ease';
      flash.style.opacity = '0';
      setTimeout(() => flash.remove(), 700);
    }
  }, 250);
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
      triggerEndAlert();
    }
  }
}

function startChrono() {
  if (chronoInterval || chronoStopped) return;
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

let chronoStopped = false;

function stopChrono() {
  if (chronoInterval) {
    chronoElapsed += Date.now() - chronoStart;
    clearInterval(chronoInterval);
    chronoInterval = null;
  }
  chronoStopped = true;
  updateChronoDisplay();
  stopButtons.forEach((btn) => btn.classList.add('is-stopped'));
  startButtons.forEach((btn) => { btn.disabled = true; btn.style.opacity = '0.4'; });
  pauseButtons.forEach((btn) => { btn.disabled = true; btn.style.opacity = '0.4'; });
}

function resetChrono() {
  clearInterval(chronoInterval);
  chronoInterval = null;
  chronoElapsed = 0;
  chronoStart = 0;
  chronoStopped = false;
  stopButtons.forEach((btn) => btn.classList.remove('is-stopped'));
  startButtons.forEach((btn) => { btn.disabled = false; btn.style.opacity = ''; });
  pauseButtons.forEach((btn) => { btn.disabled = false; btn.style.opacity = ''; });
  updateChronoDisplay();
}

function validateSetupBeforeTerrain() {
  if (!fields.nom.value.trim() || !fields.prenom.value.trim() || !fields.centre.value.trim()) {
    alert('Renseigne au minimum nom, prénom et centre avant de passer en mode jury.');
    return false;
  }
  if (!fields.age.value || !fields.fonction.value || !fields.sexe.value) {
    alert('Choisis l\'âge, la fonction et le sexe avant de passer en mode jury.');
    return false;
  }
  if (!ppaMode) {
    const age = Number(fields.age.value);
    if (!findBareme(fields.fonction.value, age)) {
      alert('Âge ou fonction hors barème. Vérifie la saisie.');
      return false;
    }
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

function buildRecordFromForm(partialData = null) {
  const age = Number(fields.age.value);
  const sexe = fields.sexe.value;
  const fonction = fields.fonction.value;
  const distances = Number(fields.distances.value || 0);
  const range = ppaMode ? null : findBareme(fonction, age);

  if (!ppaMode && !range) {
    alert('Âge ou fonction hors barème. Vérifie la saisie.');
    return null;
  }

  // BASE_POINTS = nombre d'étapes validées (max 5)
  // Si distances > 0 : toutes les étapes sont supposées validées → 5 pts
  // Si résultat partiel : on compte les étapes cochées
  let basePoints = BASE_POINTS_MAX;
  let etapesValidees = null;
  let blessure = false;
  let partialComment = '';

  if (partialData) {
    etapesValidees = partialData.etapesValidees;
    blessure = partialData.blessure;
    partialComment = partialData.comment;
    basePoints = etapesValidees.length; // 0 à 5 selon étapes cochées
  }

  const { distancePoints, totalPoints } = calculateScore(range, distances, basePoints);

  // Fusionner commentaire partiel avec observation existante
  const baseObs = normalizeText(fields.observation.value);
  const fullObs = [
    blessure ? '⚠️ Arrêt blessure' : '',
    partialComment,
    baseObs,
  ].filter(Boolean).join(' — ');

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
    basePoints,
    distancePoints,
    totalPoints,
    ppa: ppaMode,
    etapesValidees,
    blessure,
    fc0: normalizeText(fields.fc0.value),
    fc1: normalizeText(fields.fc1.value),
    fc2: normalizeText(fields.fc2.value),
    observation: fullObs,
    chrono: chronoDisplays[0].textContent,
    createdAt: new Date().toISOString(),
  };
}

// ─── Popup FC (choix → saisie) ───────────────────────────────────────────────

let _fcCallback = null;
let _fcChronoInterval = null;
let _fcChronoElapsed = 0;
let _fcChronoStart = 0;
const FC_POPUP_DURATION = 60000;

function openFcPopup(onConfirm) {
  const modal = document.getElementById('fcPopupModal');
  if (!modal) { onConfirm({ fc0: '', fc1: '', fc2: '' }); return; }
  _fcCallback = onConfirm;

  // Afficher l'écran de choix, masquer le formulaire
  document.getElementById('fcPopupChoice').hidden = false;
  document.getElementById('fcPopupForm').hidden = true;

  document.getElementById('fcPopupInput0').value = '';
  document.getElementById('fcPopupInput1').value = '';
  document.getElementById('fcPopupInput2').value = '';
  document.getElementById('fcPopupDelta').textContent = '—';
  document.getElementById('fcPopupInterp').textContent = '';
  resetFcPopupChrono();
  modal.hidden = false;
  requestAnimationFrame(() => modal.classList.add('is-visible'));
}

function closeFcPopup() {
  const modal = document.getElementById('fcPopupModal');
  if (!modal) return;
  modal.classList.remove('is-visible');
  setTimeout(() => { modal.hidden = true; }, 180);
  stopFcPopupChrono();
  _fcCallback = null;
}

function updateFcPopupDelta() {
  const fc1 = parseInt(document.getElementById('fcPopupInput1').value) || 0;
  const fc2 = parseInt(document.getElementById('fcPopupInput2').value) || 0;
  const deltaEl = document.getElementById('fcPopupDelta');
  const interpEl = document.getElementById('fcPopupInterp');
  if (!fc1 || !fc2) { deltaEl.textContent = '—'; interpEl.textContent = ''; return; }
  const delta = fc2 - fc1;
  deltaEl.textContent = (delta >= 0 ? '+' : '') + delta;
  if (delta <= -20) { interpEl.textContent = '✅ Bonne récupération'; interpEl.className = 'fc-interp fc-good'; }
  else if (delta <= 0) { interpEl.textContent = '🟡 Récupération correcte'; interpEl.className = 'fc-interp fc-medium'; }
  else { interpEl.textContent = '🔴 Récupération insuffisante'; interpEl.className = 'fc-interp fc-bad'; }
}

function updateFcPopupChronoDisplay() {
  const elapsed = _fcChronoElapsed + (_fcChronoInterval ? Date.now() - _fcChronoStart : 0);
  const remaining = Math.max(0, FC_POPUP_DURATION - elapsed);
  const secs = Math.ceil(remaining / 1000);
  const el = document.getElementById('fcPopupChronoDisplay');
  if (el) { el.textContent = `${secs}s`; el.classList.toggle('fc-chrono-done', remaining === 0); }
  if (remaining === 0 && _fcChronoInterval) {
    clearInterval(_fcChronoInterval); _fcChronoInterval = null;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator(); const g = ctx.createGain();
      osc.frequency.value = 880; g.gain.value = 0.12;
      osc.connect(g); g.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.45);
      osc.onended = () => ctx.close();
    } catch (_) {}
    const btn = document.getElementById('fcPopupStartChronoBtn');
    if (btn) { btn.disabled = false; btn.textContent = 'Relancer'; }
  }
}

function startFcPopupChrono() {
  if (_fcChronoInterval) return;
  _fcChronoStart = Date.now();
  _fcChronoElapsed = 0;
  _fcChronoInterval = setInterval(updateFcPopupChronoDisplay, 200);
  const btn = document.getElementById('fcPopupStartChronoBtn');
  if (btn) { btn.disabled = true; btn.textContent = 'En cours…'; }
  updateFcPopupChronoDisplay();
}

function stopFcPopupChrono() {
  if (_fcChronoInterval) { clearInterval(_fcChronoInterval); _fcChronoInterval = null; }
}

function resetFcPopupChrono() {
  stopFcPopupChrono();
  _fcChronoElapsed = 0;
  const el = document.getElementById('fcPopupChronoDisplay');
  if (el) { el.textContent = '60s'; el.classList.remove('fc-chrono-done'); }
  const btn = document.getElementById('fcPopupStartChronoBtn');
  if (btn) { btn.disabled = false; btn.textContent = 'Lancer 1 min'; }
}

document.getElementById('fcPopupStartChronoBtn')?.addEventListener('click', startFcPopupChrono);
document.getElementById('fcPopupResetChronoBtn')?.addEventListener('click', resetFcPopupChrono);
document.getElementById('fcPopupInput1')?.addEventListener('input', updateFcPopupDelta);
document.getElementById('fcPopupInput2')?.addEventListener('input', updateFcPopupDelta);

// Choix : saisir ici (tablette 1)
document.getElementById('fcChoiceT1Btn')?.addEventListener('click', () => {
  document.getElementById('fcPopupChoice').hidden = true;
  document.getElementById('fcPopupForm').hidden = false;
  document.getElementById('fcPopupInput1').focus();
});

// Choix : tablette 2 via QR — on ferme le popup FC, on laisse afterSave ouvrir le QR
document.getElementById('fcChoiceT2Btn')?.addEventListener('click', () => {
  const cb = _fcCallback;
  closeFcPopup();
  if (cb) cb({ fc0: '', fc1: '', fc2: '', useQr: true });
});

// Choix : passer
document.getElementById('fcChoiceSkipBtn')?.addEventListener('click', () => {
  const cb = _fcCallback;
  closeFcPopup();
  if (cb) cb({ fc0: '', fc1: '', fc2: '' });
});

document.getElementById('fcPopupSkipBtn')?.addEventListener('click', () => {
  const cb = _fcCallback;
  closeFcPopup();
  if (cb) cb({ fc0: '', fc1: '', fc2: '' });
});
document.getElementById('fcPopupConfirmBtn')?.addEventListener('click', () => {
  const fc0 = document.getElementById('fcPopupInput0').value.trim();
  const fc1 = document.getElementById('fcPopupInput1').value.trim();
  const fc2 = document.getElementById('fcPopupInput2').value.trim();
  const cb = _fcCallback;
  closeFcPopup();
  if (cb) cb({ fc0, fc1, fc2 });
});
document.getElementById('fcPopupModal')?.addEventListener('click', (e) => {
  if (e.target === document.getElementById('fcPopupModal')) {
    const cb = _fcCallback;
    closeFcPopup();
    if (cb) cb({ fc0: '', fc1: '', fc2: '' });
  }
});

// ─── attemptSave refondu ──────────────────────────────────────────────────────

function attemptSave(afterSave) {
  const distances = Number(fields.distances.value || 0);

  function doFcThenSave(partialData) {
    openFcPopup(({ fc0, fc1, fc2, useQr }) => {
      const record = buildRecordFromForm(partialData);
      if (!record) return;
      record.fc0 = fc0 || normalizeText(fields.fc0.value);
      record.fc1 = fc1 || normalizeText(fields.fc1.value);
      record.fc2 = fc2 || normalizeText(fields.fc2.value);
      if (record.fc1 && record.fc2) {
        record.fcDelta = parseInt(record.fc2) - parseInt(record.fc1);
      }
      try {
        persistRecord(record);
        resetForm();
        afterSave(record, useQr);
      } catch (err) {
        console.error('Enregistrement impossible', err);
        alert('Impossible d\'enregistrer le résultat sur cette tablette.');
      }
    });
  }

  if (distances === 0) {
    // Étape 1 : popup étapes/blessure
    openPartialResultModal((partialData) => {
      // Étape 2 : popup FC
      doFcThenSave(partialData);
    });
  } else {
    // Directement le popup FC (étapes toutes validées)
    doFcThenSave(null);
  }
}

async function saveCurrentEvaluation() {
  attemptSave(async (record, useQr) => {
    renderRecords();
    await exitTerrainMode('records');
    if (record && useQr) openQrModal(record);
  });
}

// ─── Event listeners ──────────────────────────────────────────────────────────

form.addEventListener('submit', (event) => {
  event.preventDefault();
  attemptSave((record, useQr) => {
    renderRecords();
    switchMainView('records');
    if (record && useQr) openQrModal(record);
  });
});

recordsBody.addEventListener('click', (event) => {
  const deleteId = event.target.getAttribute('data-delete');
  if (!deleteId) return;
  records = records.filter((record) => record.id !== deleteId);
  saveRecords();
  renderRecords();
});

resetFormBtn.addEventListener('click', resetForm);
if (openTerrainBtn) openTerrainBtn.addEventListener('click', enterTerrainMode);
exitTerrainBtn.addEventListener('click', () => exitTerrainMode('records'));
saveTerrainBtn.addEventListener('click', saveCurrentEvaluation);
if (saveTerrainTopBtn) saveTerrainTopBtn.addEventListener('click', saveCurrentEvaluation);
newEvaluationBtn.addEventListener('click', () => { resetForm(); hideEvaluationWorkspace(); switchMainView('setup'); });
document.getElementById('backToFormBtn')?.addEventListener('click', () => switchMainView('setup'));
document.getElementById('viewResultsBtn')?.addEventListener('click', () => switchMainView('records'));
document.getElementById('viewResultsFromCandidatesBtn')?.addEventListener('click', () => switchMainView('records'));
openCandidateEvaluationBtn?.addEventListener('click', openCandidateEvaluationPanel);
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
  if (ppaMode) { setPpaMode(false); } else { openPpaModal(); }
});
document.getElementById('ppaConfirmBtn')?.addEventListener('click', () => { closePpaModal(); setPpaMode(true); });
document.getElementById('ppaCancelBtn')?.addEventListener('click', closePpaModal);
document.getElementById('ppaModal')?.addEventListener('click', (e) => {
  if (e.target === document.getElementById('ppaModal')) closePpaModal();
});

// Résultat partiel
document.getElementById('partialResultConfirmBtn')?.addEventListener('click', () => {
  const partialData = collectPartialResult();
  const cb = _partialResultCallback; // sauvegarder AVANT closePartialResultModal
  closePartialResultModal();
  if (cb) cb(partialData);
});
document.getElementById('partialResultCancelBtn')?.addEventListener('click', () => {
  _partialResultCallback = null;
  closePartialResultModal();
});
document.getElementById('partialResultModal')?.addEventListener('click', (e) => {
  if (e.target === document.getElementById('partialResultModal')) {
    _partialResultCallback = null;
    closePartialResultModal();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (baremesModal && !baremesModal.hidden) closeBaremesModal();
    if (document.getElementById('ppaModal') && !document.getElementById('ppaModal').hidden) closePpaModal();
    if (document.getElementById('partialResultModal') && !document.getElementById('partialResultModal').hidden) closePartialResultModal();
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
stopButtons.forEach((button) => button.addEventListener('click', stopChrono));
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
switchMainView('setup');
// Forcer état propre du chrono au chargement
chronoStopped = false;
startButtons.forEach((btn) => { btn.disabled = false; btn.style.opacity = ''; });
pauseButtons.forEach((btn) => { btn.disabled = false; btn.style.opacity = ''; });
stopButtons.forEach((btn) => btn.classList.remove('is-stopped'));
resetForm();
hideEvaluationWorkspace();

// ─── Candidates UI wiring ────────────────────────────────────────────────────

document.getElementById('tabPending')?.addEventListener('click', () => {
  activeCandidateTab = 'pending'; renderCandidates();
});
document.getElementById('tabDone')?.addEventListener('click', () => {
  activeCandidateTab = 'done'; renderCandidates();
});

document.getElementById('openAddCandidateBtn')?.addEventListener('click', () => {
  resetForm();
  showEvaluationCard(false);
  openAddCandidateModal();
});
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
  if (addCandidate({ nom, prenom, centre, age, sexe, fonction })) {
    closeAddCandidateModal();
    const created = getCandidateByName(nom, prenom);
    if (created) selectCandidate(created.id);
  }
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

// ─── QR Code — Tablette 1 : génération ──────────────────────────────────────

function buildQrPayload(record) {
  // Payload compact JSON transmis dans le QR
  return JSON.stringify({
    v: 1,                          // version du format
    id: record.id,
    nom: record.nom,
    prenom: record.prenom,
    centre: record.centre,
    age: record.age,
    sexe: record.sexe,
    fonction: record.fonction,
    distances: record.distances,
    chrono: record.chrono || '',
    totalPoints: record.totalPoints,
    blessure: record.blessure || false,
    etapes: record.etapesValidees ? record.etapesValidees.length : 5,
  });
}

let _currentQrRecord = null;

function openQrModal(record) {
  _currentQrRecord = record;
  const modal = document.getElementById('qrModal');
  const nameEl = document.getElementById('qrCandidatName');
  const pointsEl = document.getElementById('qrCandidatPoints');
  if (!modal) return;

  nameEl.textContent = `${record.prenom} ${record.nom}`;
  pointsEl.textContent = `${formatNumber(record.totalPoints)} pts · ${record.distances} navette(s)`;

  // Vider le conteneur
  const wrapper = document.getElementById('qrCanvasWrapper');
  wrapper.innerHTML = '';

  try {
    // qrcode-generator expose la variable globale 'qrcode'
    const qr = qrcode(0, 'M');
    qr.addData(buildQrPayload(record));
    qr.make();

    const count = qr.getModuleCount();
    const size = 280;
    const cell = size / count;
    let rects = '';
    for (let r = 0; r < count; r++) {
      for (let c = 0; c < count; c++) {
        if (qr.isDark(r, c)) {
          rects += `<rect x="${(c * cell).toFixed(2)}" y="${(r * cell).toFixed(2)}" width="${cell.toFixed(2)}" height="${cell.toFixed(2)}"/>`;
        }
      }
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" style="display:block;border-radius:8px;">
      <rect width="${size}" height="${size}" fill="#ffffff"/>
      <g fill="#07142d">${rects}</g>
    </svg>`;
    wrapper.innerHTML = svg;
  } catch (e) {
    console.error('QR génération erreur', e);
    wrapper.innerHTML = `<div style="width:280px;height:280px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#fff;border-radius:12px;padding:16px;text-align:center;gap:8px;"><div style="font-size:2rem">⚠️</div><div style="font-size:0.85rem;color:#374151;font-weight:700;">QR Code indisponible</div></div>`;
  }

  modal.hidden = false;
  requestAnimationFrame(() => modal.classList.add('is-visible'));
}

function closeQrModal() {
  const modal = document.getElementById('qrModal');
  if (!modal) return;
  modal.classList.remove('is-visible');
  setTimeout(() => { modal.hidden = true; }, 180);
}

document.getElementById('closeQrModalBtn')?.addEventListener('click', closeQrModal);
document.getElementById('qrSkipBtn')?.addEventListener('click', () => {
  closeQrModal();
  switchMainView('records');
});
document.getElementById('qrOpenFcBtn')?.addEventListener('click', () => {
  if (!_currentQrRecord) return;
  closeQrModal();
  openFcView();
  populateFcForm(JSON.parse(buildQrPayload(_currentQrRecord)));
});
document.getElementById('qrModal')?.addEventListener('click', (e) => {
  if (e.target === document.getElementById('qrModal')) closeQrModal();
});

// Ouvre le QR depuis la ligne du tableau
document.getElementById('recordsBody')?.addEventListener('click', (e) => {
  const qrBtn = e.target.closest('[data-qr-id]');
  if (!qrBtn) return;
  const id = qrBtn.getAttribute('data-qr-id');
  const record = records.find((r) => r.id === id);
  if (record) openQrModal(record);
});

// ─── QR Code — Tablette 2 : scan + saisie FC ────────────────────────────────

let fcChronoInterval = null;
let fcChronoElapsed = 0;
let fcChronoStart = 0;
const FC_DURATION_MS = 60 * 1000; // 1 minute
let fcRecordInProgress = null;

function openFcView() {
  document.getElementById('fcView').hidden = false;
  document.getElementById('setupView').hidden = true;
  document.getElementById('recordsView').hidden = true;
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
}

function closeFcView() {
  stopFcChrono();
  fcRecordInProgress = null;
  document.getElementById('fcView').hidden = true;
  document.getElementById('fcScanResult').hidden = true;
  document.getElementById('fcScanPlaceholder').hidden = false;
  document.getElementById('fcForm').reset();
  resetFcChrono();
  switchMainView('setup');
}

function populateFcForm(payload) {
  fcRecordInProgress = payload;
  document.getElementById('fcNom').textContent = `${payload.prenom} ${payload.nom}`;
  document.getElementById('fcCentre').textContent = payload.centre || '—';
  document.getElementById('fcPoints').textContent = `${formatNumber(payload.totalPoints)} pts · ${payload.distances} navette(s)`;
  document.getElementById('fcBlessureAlert').hidden = !payload.blessure;
  document.getElementById('fcScanPlaceholder').hidden = true;
  document.getElementById('fcScanResult').hidden = false;
  document.getElementById('fcInput0').value = '';
  document.getElementById('fcInput1').value = '';
  document.getElementById('fcInput2').value = '';
  document.getElementById('fcDeltaDisplay').textContent = '—';
  document.getElementById('fcInterpretation').textContent = '';
  resetFcChrono();
}

function computeFcDelta() {
  const fc1 = parseInt(document.getElementById('fcInput1').value) || 0;
  const fc2 = parseInt(document.getElementById('fcInput2').value) || 0;
  if (!fc1 || !fc2) {
    document.getElementById('fcDeltaDisplay').textContent = '—';
    document.getElementById('fcInterpretation').textContent = '';
    return;
  }
  const delta = fc2 - fc1;
  const deltaEl = document.getElementById('fcDeltaDisplay');
  const interpEl = document.getElementById('fcInterpretation');
  deltaEl.textContent = (delta >= 0 ? '+' : '') + delta;
  // Interprétation provisoire — à remplacer par la vraie grille
  if (delta <= -20) {
    interpEl.textContent = '✅ Bonne récupération';
    interpEl.className = 'fc-interp fc-good';
  } else if (delta <= 0) {
    interpEl.textContent = '🟡 Récupération correcte';
    interpEl.className = 'fc-interp fc-medium';
  } else {
    interpEl.textContent = '🔴 Récupération insuffisante';
    interpEl.className = 'fc-interp fc-bad';
  }
}

// Chrono 1 min FC2
function updateFcChronoDisplay() {
  const elapsed = fcChronoElapsed + (fcChronoInterval ? Date.now() - fcChronoStart : 0);
  const remaining = Math.max(0, FC_DURATION_MS - elapsed);
  const secs = Math.ceil(remaining / 1000);
  const el = document.getElementById('fcChronoDisplay');
  if (el) {
    el.textContent = `${secs}s`;
    el.classList.toggle('fc-chrono-done', remaining === 0);
  }
  if (remaining === 0 && fcChronoInterval) {
    clearInterval(fcChronoInterval);
    fcChronoInterval = null;
    // Bip
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.frequency.value = 880; g.gain.value = 0.12;
      osc.connect(g); g.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.45);
      osc.onended = () => ctx.close();
    } catch (_) {}
    document.getElementById('fcStartChronoBtn').disabled = false;
    document.getElementById('fcStartChronoBtn').textContent = 'Relancer';
  }
}

function startFcChrono() {
  if (fcChronoInterval) return;
  fcChronoStart = Date.now();
  fcChronoElapsed = 0;
  fcChronoInterval = setInterval(updateFcChronoDisplay, 200);
  document.getElementById('fcStartChronoBtn').disabled = true;
  document.getElementById('fcStartChronoBtn').textContent = 'En cours…';
  updateFcChronoDisplay();
}

function stopFcChrono() {
  if (fcChronoInterval) { clearInterval(fcChronoInterval); fcChronoInterval = null; }
}

function resetFcChrono() {
  stopFcChrono();
  fcChronoElapsed = 0;
  const el = document.getElementById('fcChronoDisplay');
  if (el) { el.textContent = '60s'; el.classList.remove('fc-chrono-done'); }
  const btn = document.getElementById('fcStartChronoBtn');
  if (btn) { btn.disabled = false; btn.textContent = 'Lancer 1 min'; }
}

function saveFcRecord() {
  if (!fcRecordInProgress) return;
  const fc0 = document.getElementById('fcInput0').value.trim();
  const fc1 = document.getElementById('fcInput1').value.trim();
  const fc2 = document.getElementById('fcInput2').value.trim();
  if (!fc1 || !fc2) { alert('Saisis FC1 et FC2 avant d\'enregistrer.'); return; }

  // Chercher si le record existe déjà (même id)
  const existing = records.find((r) => r.id === fcRecordInProgress.id);
  if (existing) {
    existing.fc0 = fc0;
    existing.fc1 = fc1;
    existing.fc2 = fc2;
    existing.fcDelta = parseInt(fc2) - parseInt(fc1);
    saveRecords();
    renderRecords();
    alert(`FC enregistrées pour ${fcRecordInProgress.prenom} ${fcRecordInProgress.nom}.`);
    closeFcView();
    return;
  }

  // Nouveau record (tablette 2 indépendante)
  const newRecord = {
    id: fcRecordInProgress.id,
    nom: fcRecordInProgress.nom,
    prenom: fcRecordInProgress.prenom,
    centre: fcRecordInProgress.centre,
    age: fcRecordInProgress.age,
    sexe: fcRecordInProgress.sexe,
    sexeLabel: fcRecordInProgress.sexe === 'F' ? 'Femme' : 'Homme',
    fonction: fcRecordInProgress.fonction,
    fonctionLabel: fcRecordInProgress.fonction ? `${BAREMES[fcRecordInProgress.fonction]?.title || ''} – ${BAREMES[fcRecordInProgress.fonction]?.subtitle || ''}` : '—',
    distances: fcRecordInProgress.distances,
    chrono: fcRecordInProgress.chrono || '',
    ageRange: '—',
    multiplier: 0,
    basePoints: fcRecordInProgress.etapes || 5,
    distancePoints: 0,
    totalPoints: fcRecordInProgress.totalPoints,
    fc0, fc1, fc2,
    fcDelta: parseInt(fc2) - parseInt(fc1),
    blessure: fcRecordInProgress.blessure || false,
    etapesValidees: null,
    observation: '',
    createdAt: new Date().toISOString(),
    fromQr: true,
  };
  persistRecord(newRecord);
  alert(`Candidat ${newRecord.prenom} ${newRecord.nom} ajouté avec FC.`);
  closeFcView();
}

// ─── Scanner QR via caméra (jsQR) ────────────────────────────────────────────

let scanActive = false;
let scanStream = null;

async function startQrScan() {
  if (typeof jsQR === 'undefined') {
    alert('Le scanner QR n\'est pas disponible hors ligne. Connecte-toi une fois pour mettre en cache cette fonctionnalité.');
    return;
  }
  const video = document.getElementById('fcScanVideo');
  const overlay = document.getElementById('fcScanOverlay');
  if (!video) return;

  try {
    scanStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    video.srcObject = scanStream;
    video.play();
    overlay.hidden = false;
    scanActive = true;
    requestAnimationFrame(scanQrFrame);
  } catch (err) {
    alert('Caméra non disponible. Assure-toi d\'autoriser l\'accès caméra.');
    console.error(err);
  }
}

function stopQrScan() {
  scanActive = false;
  if (scanStream) { scanStream.getTracks().forEach((t) => t.stop()); scanStream = null; }
  const overlay = document.getElementById('fcScanOverlay');
  if (overlay) overlay.hidden = true;
}

function scanQrFrame() {
  if (!scanActive) return;
  const video = document.getElementById('fcScanVideo');
  if (!video || video.readyState !== video.HAVE_ENOUGH_DATA) {
    requestAnimationFrame(scanQrFrame); return;
  }
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  try {
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    if (code) {
      const payload = JSON.parse(code.data);
      if (payload.v === 1) {
        stopQrScan();
        populateFcForm(payload);
        return;
      }
    }
  } catch (_) {}
  requestAnimationFrame(scanQrFrame);
}

// Event listeners FC view
document.getElementById('openFcViewBtn')?.addEventListener('click', openFcView);
document.getElementById('closeFcViewBtn')?.addEventListener('click', closeFcView);
document.getElementById('fcScanBtn')?.addEventListener('click', startQrScan);
document.getElementById('fcStopScanBtn')?.addEventListener('click', stopQrScan);
document.getElementById('fcStartChronoBtn')?.addEventListener('click', startFcChrono);
document.getElementById('fcResetChronoBtn')?.addEventListener('click', resetFcChrono);
document.getElementById('fcSaveBtn')?.addEventListener('click', saveFcRecord);
document.getElementById('fcViewResultsBtn')?.addEventListener('click', () => switchMainView('records'));
document.getElementById('fcExportCsvBtn')?.addEventListener('click', exportCsv);
document.getElementById('fcExportPdfBtn')?.addEventListener('click', exportPdfView);
document.getElementById('fcShareBtn')?.addEventListener('click', shareRecords);
document.getElementById('fcInput1')?.addEventListener('input', computeFcDelta);
document.getElementById('fcInput2')?.addEventListener('input', computeFcDelta);

document.getElementById('fcScanBtn2')?.addEventListener('click', () => {
  document.getElementById('fcScanResult').hidden = true;
  document.getElementById('fcScanPlaceholder').hidden = false;
  fcRecordInProgress = null;
});
