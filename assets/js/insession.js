// ─── Pose meta ───────────────────────────────────────
const POSE_META = {
  mountain: { name:'Mountain Pose', sanskrit:'Tadasana',             timer:300 },
  downdog:  { name:'Downward Dog',  sanskrit:'Adho Mukha Svanasana', timer:600 },
  warrior:  { name:'Warrior I',     sanskrit:'Virabhadrasana I',      timer:900 },
};
 
// ─── Connections ─────────────────────────────────────
const CONNECTIONS = [
  [0,11],[0,12],[11,12],
  [11,23],[12,24],[23,24],
  [11,13],[13,15],
  [12,14],[14,16],
  [23,25],[25,27],[27,31],
  [24,26],[26,28],[28,32],
];
 
const POSE_SEGMENTS = {
  mountain: [
    { ci:0, c:[[0,11],[0,12],[11,12],[11,23],[12,24],[23,24],[23,25],[24,26],[25,27],[26,28],[27,31],[28,32]] },
    { ci:1, c:[[11,13],[13,15],[12,14],[14,16]] },
  ],
  downdog: [
    { ci:0, c:[[11,23],[12,24],[23,24],[23,25],[24,26],[25,27],[26,28],[27,31],[28,32]] },
    { ci:1, c:[[0,11],[0,12],[11,12],[11,13],[13,15],[12,14],[14,16]] },
  ],
  warrior: [
    { ci:0, c:[[23,25],[24,26],[25,27],[26,28],[27,31],[28,32]] },
    { ci:1, c:[[0,11],[0,12],[11,12],[11,13],[13,15],[12,14],[14,16]] },
  ],
};
 
// ─── Thresholds — tuned for real front-facing webcam use ─
// ALL angles use the dot-product / cosine method which is
// rotation-invariant and works from any camera angle.
const T = {
  mountain: {
    spineMin:  150,   // shoulder–hip–ankle ≥ 150° = good (front-facing camera foreshortens this)
    spineWarn: 130,
    armGood:   0.12,  // wrist-to-hip horizontal distance (normalised) — generous
    armWarn:   0.22,
  },
  downdog: {
    hipMin:    85,    // wrist–hip–ankle ≥ 85° (front-facing: hips look less open than side-on)
    hipWarn:   60,
    armMin:    145,   // shoulder–elbow–wrist ≥ 145° = acceptably straight
    armWarn:   120,
  },
  warrior: {
    kneeMin:   60,    // front knee hip–knee–ankle — front-facing camera makes this look smaller
    kneeMax:   120,   // wide range — reward the attempt
    armsMin:   120,   // elbow–shoulder–hip — arms raised, front-facing foreshortens
    armsWarn:  90,
  },
};
 
// ─── Angle utility (dot-product cosine — works from any camera angle) ──
// Returns the angle IN DEGREES at vertex B, between rays BA and BC.
// Uses 3D-aware cosine law so it's robust to camera perspective.
function ang(A, B, C) {
  const ax = A.x - B.x, ay = A.y - B.y;
  const cx = C.x - B.x, cy = C.y - B.y;
  const dot  = ax * cx + ay * cy;
  const magA = Math.sqrt(ax * ax + ay * ay);
  const magC = Math.sqrt(cx * cx + cy * cy);
  if (magA < 1e-6 || magC < 1e-6) return 180; // degenerate — treat as straight
  const cosVal = Math.max(-1, Math.min(1, dot / (magA * magC)));
  return Math.acos(cosVal) * 180 / Math.PI;
}
 
function aStatus(v, good, warn) {
  return v >= good ? 'good' : v >= warn ? 'needwork' : 'wrong';
}
 
// ─── MOUNTAIN POSE ───────────────────────────────────
// Front-facing camera: person stands upright, arms at sides.
// We check: (1) spine roughly vertical via shoulder-hip-ankle,
//           (2) wrists are close to hips horizontally.
function checkMountain(lm) {
  const t = T.mountain;
 
  // Spine: average both sides, use hip as midpoint landmark
  const spineL = ang(lm[11], lm[23], lm[27]);
  const spineR = ang(lm[12], lm[24], lm[28]);
  const spine  = (spineL + spineR) / 2;
  const ss     = aStatus(spine, t.spineMin, t.spineWarn);
 
  // Arms: wrist x-position should be near hip x-position
  // Use absolute pixel-space normalised distance
  const dL  = Math.abs(lm[15].x - lm[23].x);
  const dR  = Math.abs(lm[16].x - lm[24].x);
  const arm = (dL + dR) / 2;
  const as  = arm < t.armGood ? 'good' : arm < t.armWarn ? 'needwork' : 'wrong';
 
  return [
    {
      status: ss,
      title:  'Stand Tall',
      msg:    ss === 'wrong'
        ? 'Your body is leaning. Stand upright and stack your spine from pelvis to crown.'
        : 'Slightly adjust — lengthen upward and keep your gaze forward.',
    },
    {
      status: as,
      title:  'Relax Arms at Sides',
      msg:    'Let your arms hang naturally close to your body, palms facing forward.',
    },
  ];
}
 
// ─── DOWNWARD DOG ────────────────────────────────────
// Front-facing camera: person is in an inverted V.
// We check: (1) hip elevation (hips higher than shoulders in frame),
//           (2) arms straight.
// NOTE: from a front-facing camera the wrist–hip–ankle angle
//       is unreliable because the body is rotated ~45°.
//       Instead we check: hips are above shoulders in y-coords,
//       and the body forms a triangular shape.
function checkDowndog(lm) {
  const t = T.downdog;
 
  // Check 1 — hips elevated: hip y-coord < shoulder y-coord
  // (in normalised coords, smaller y = higher in frame)
  const hipY  = (lm[23].y + lm[24].y) / 2;
  const shY   = (lm[11].y + lm[12].y) / 2;
  const wristY = (lm[15].y + lm[16].y) / 2;
 
  // Hip should be between shoulders and wrists vertically — forms the V peak
  // Good: hips clearly above shoulders (hipY < shY by at least 0.05)
  const hipLift = shY - hipY; // positive = hips higher than shoulders
  let hs;
  if (hipLift >= 0.08)       hs = 'good';
  else if (hipLift >= 0.02)  hs = 'needwork';
  else                        hs = 'wrong';
 
  // Check 2 — arms straight (shoulder–elbow–wrist angle)
  const armL = ang(lm[11], lm[13], lm[15]);
  const armR = ang(lm[12], lm[14], lm[16]);
  const arm  = (armL + armR) / 2;
  const as   = aStatus(arm, t.armMin, t.armWarn);
 
  return [
    {
      status: hs,
      title:  'Push Hips Higher',
      msg:    hs === 'wrong'
        ? 'Drive your hips up and back — your bottom should be the highest point.'
        : 'Keep pressing your hips toward the ceiling for a deeper V shape.',
    },
    {
      status: as,
      title:  'Straighten Your Arms',
      msg:    arm < t.armWarn
        ? 'Your elbows are bent. Fully extend your arms and press through your palms.'
        : 'Almost straight — extend just a little more through the elbows.',
    },
  ];
}
 
// ─── WARRIOR I ───────────────────────────────────────
// Front-facing camera: lunge with arms up.
// We check: (1) front knee bend — use the more bent knee,
//           (2) arms raised — wrists should be above shoulders.
// From front-facing, elbow–shoulder–hip angle is unreliable
// so we use a simpler spatial check for arms.
function checkWarrior(lm) {
  const t = T.warrior;
 
  // Front knee — pick the more bent side (smaller angle)
  const kL = ang(lm[23], lm[25], lm[27]);
  const kR = ang(lm[24], lm[26], lm[28]);
  const fk = Math.min(kL, kR);
 
  let ks;
  if (fk >= t.kneeMin && fk <= t.kneeMax)         ks = 'good';
  else if (fk > t.kneeMax && fk <= t.kneeMax + 30) ks = 'needwork'; // not bent enough
  else if (fk < t.kneeMin && fk >= t.kneeMin - 20) ks = 'needwork'; // slightly too deep
  else                                               ks = 'wrong';
 
  // Arms raised — wrists should be above (lower y than) shoulders
  const wristY = (lm[15].y + lm[16].y) / 2;
  const shY    = (lm[11].y + lm[12].y) / 2;
  const armsLift = shY - wristY; // positive = wrists above shoulders
 
  let as;
  if (armsLift >= 0.15)       as = 'good';
  else if (armsLift >= 0.0)   as = 'needwork';
  else                         as = 'wrong';
 
  return [
    {
      status: ks,
      title:  'Adjust Front Knee',
      msg:    fk > t.kneeMax
        ? 'Bend your front knee deeper — aim for your thigh to be parallel to the floor.'
        : fk < t.kneeMin
          ? 'Ease back slightly — your front knee is bending past 90°.'
          : 'Good knee position — hold it steady.',
    },
    {
      status: as,
      title:  'Raise Your Arms',
      msg:    armsLift < 0
        ? 'Lift both arms fully overhead — reach your fingertips toward the ceiling.'
        : 'Extend a little higher — arms should be straight alongside your ears.',
    },
  ];
}
 
const CHECKERS = { mountain:checkMountain, downdog:checkDowndog, warrior:checkWarrior };
 
// ─── Skeleton colors ─────────────────────────────────
const SC = {
  good:     '#22c55e',               // vivid green
  needwork: '#f97316',               // orange
  wrong:    '#ef4444',               // red
  neutral:  'rgba(180,180,180,0.4)', // barely-there grey
};
const PRIO = { [SC.neutral]:0, [SC.good]:1, [SC.needwork]:2, [SC.wrong]:3 };
 
// Resolve a connection's status color key string
function colorKey(color) {
  return color === SC.good ? 'good' : color === SC.needwork ? 'needwork' : color === SC.wrong ? 'wrong' : 'neutral';
}
 
// ─── Skeleton drawing ────────────────────────────────
function drawSkeleton(lm, checks) {
  const W = canvas.width, H = canvas.height;
 
  // Build connection → color map
  const cmap = new Map();
  if (activePose && checks) {
    (POSE_SEGMENTS[activePose] || []).forEach(seg => {
      const color = SC[checks[seg.ci]?.status || 'neutral'];
      seg.c.forEach(([a, b]) => {
        cmap.set(`${a}-${b}`, color);
        cmap.set(`${b}-${a}`, color);
      });
    });
  }
 
  // Joint worst-color accumulator
  const jc = new Map();
  const jUp = (i, c) => {
    if (!jc.has(i) || (PRIO[c] || 0) > (PRIO[jc.get(i)] || 0)) jc.set(i, c);
  };
 
  // Collect visible joints first
  CONNECTIONS.forEach(([a, b]) => {
    const la = lm[a], lb = lm[b];
    if (!la || !lb || (la.visibility ?? 1) < 0.25 || (lb.visibility ?? 1) < 0.25) return;
    const color = cmap.get(`${a}-${b}`) || SC.neutral;
    jUp(a, color); jUp(b, color);
  });
 
  // ── Pass 1: Body fill polygon (torso + hips — gives the "body suit" feel) ──
  const bodyPoly = [11, 12, 24, 23]; // L-shoulder, R-shoulder, R-hip, L-hip
  const polyPts  = bodyPoly.map(i => lm[i]).filter(l => l && (l.visibility ?? 1) >= 0.25);
  if (polyPts.length === 4) {
    // Determine dominant color of torso connections
    const torsoColors = [[11,23],[12,24],[11,12],[23,24]]
      .map(([a,b]) => cmap.get(`${a}-${b}`) || SC.neutral);
    const torsoColor = torsoColors.reduce((best, c) =>
      (PRIO[c] || 0) >= (PRIO[best] || 0) ? c : best, SC.neutral);
 
    ctx.beginPath();
    ctx.moveTo(polyPts[0].x * W, polyPts[0].y * H);
    polyPts.forEach(p => ctx.lineTo(p.x * W, p.y * H));
    ctx.closePath();
    // Subtle fill — just a tinted translucent wash
    ctx.fillStyle = torsoColor === SC.neutral
      ? 'rgba(180,180,180,0.07)'
      : torsoColor + '18'; // hex + 18 = ~9% opacity
    ctx.fill();
  }
 
  // ── Pass 2: Capsule-style limb bones ──
  CONNECTIONS.forEach(([a, b]) => {
    const la = lm[a], lb = lm[b];
    if (!la || !lb || (la.visibility ?? 1) < 0.25 || (lb.visibility ?? 1) < 0.25) return;
    const color = cmap.get(`${a}-${b}`) || SC.neutral;
 
    const x1 = la.x * W, y1 = la.y * H;
    const x2 = lb.x * W, y2 = lb.y * H;
    const isNeutral = color === SC.neutral;
 
    // Layer 1 — wide dark shadow (ground the line on any background)
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth   = isNeutral ? 7 : 10;
    ctx.lineCap     = 'round';
    ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
    ctx.stroke();
 
    // Layer 2 — glow halo for non-neutral connections
    if (!isNeutral) {
      ctx.beginPath();
      ctx.strokeStyle = color + '55'; // 33% opacity glow
      ctx.lineWidth   = 16;
      ctx.lineCap     = 'round';
      ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
      ctx.stroke();
    }
 
    // Layer 3 — main capsule stroke
    ctx.beginPath();
    ctx.strokeStyle = isNeutral ? color : color + 'ee'; // ~93% opacity
    ctx.lineWidth   = isNeutral ? 3 : 5.5;
    ctx.lineCap     = 'round';
    ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
    ctx.stroke();
  });
 
  // ── Pass 3: Joints — diamond/pulse style ──
  new Set(CONNECTIONS.flat()).forEach(i => {
    const l = lm[i];
    if (!l || (l.visibility ?? 1) < 0.25) return;
 
    const x     = l.x * W;
    const y     = l.y * H;
    const color = jc.get(i) || SC.neutral;
    const isNeutral = color === SC.neutral;
 
    if (isNeutral) {
      // Simple small grey dot for untracked joints
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(180,180,180,0.35)';
      ctx.fill();
      return;
    }
 
    // Outer glow ring
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, Math.PI * 2);
    ctx.fillStyle = color + '22'; // very translucent glow
    ctx.fill();
 
    // Dark backing circle
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fill();
 
    // Colored filled circle
    ctx.beginPath();
    ctx.arc(x, y, 6.5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
 
    // Bright white center dot — precision indicator
    ctx.beginPath();
    ctx.arc(x, y, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  });
}
 
// ─── State ───────────────────────────────────────────
let timerInterval = null, timerSec = 300;
let timerTotal = 300;           // full duration for current pose
let smoothScore = null;         // FIX #5: null = no readings yet, avoids fake 85% start
let scoreReadings = 0;          // count of real readings so far
let lastFbTs = 0;
let finalScore = 0;
let personInFrame = false;
let timerRunning  = false;
let totalElapsedSec = 0;        // FIX #6: accumulates time across pose switches
const DEBOUNCE = 380;
const TERMS_ACCEPTED_KEY = 'flowbuddyTermsAcceptedThisVisit';
 
// FIX #4: pose-lock — timer only counts when user is in correct pose
const POSE_LOCK_THRESHOLD = 45; // % score — at least one check must be good
let poseLockedFrames = 0;       // consecutive frames above threshold
const LOCK_FRAMES_NEEDED = 5;   // ~2 seconds to confirm pose
let poseLocked = false;
 
const video  = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx    = canvas.getContext('2d');
 
// ─── MediaPipe ───────────────────────────────────────
// FIX #7: guard against CDN failure or offline state
let poseDetector = null;
try {
  poseDetector = new Pose({ locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${f}` });
  poseDetector.setOptions({ modelComplexity:1, smoothLandmarks:true, enableSegmentation:false, minDetectionConfidence:0.5, minTrackingConfidence:0.5 });
  poseDetector.onResults(results => {
    canvas.width  = video.videoWidth  || 640;
    canvas.height = video.videoHeight || 480;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
 
    if (!results.poseLandmarks) {
      if (personInFrame) {
        personInFrame    = false;
        poseLocked       = false;
        poseLockedFrames = 0;
        pauseTimer();
        updateToast({ title: 'Step Back Into Frame', msg: 'Your timer is paused. Return to the frame to continue your practice.' });
      }
      return;
    }
 
    if (!personInFrame) {
      personInFrame = true;
      updateToast({ title: 'Hold the Pose', msg: 'Get into position — your timer will start once your form is detected.' });
    }
 
    const lm      = results.poseLandmarks;
    const checker = CHECKERS[activePose];
    if (!checker) return;
    const checks = checker(lm);
    drawSkeleton(lm, checks);
    if (Date.now() - lastFbTs > DEBOUNCE) { lastFbTs = Date.now(); updateUI(checks); }
  });
} catch (mpErr) {
  console.error('MediaPipe failed to load:', mpErr);
  // Show a visible error so the user knows what happened
  document.addEventListener('DOMContentLoaded', () => {
    const errEl = document.getElementById('cam-error');
    if (errEl) {
      errEl.style.display = 'flex';
      const strong = errEl.querySelector('strong');
      const p      = errEl.querySelector('p');
      if (strong) strong.textContent = 'Pose detection unavailable';
      if (p) p.textContent = 'FlowBuddy could not load the AI model. Please check your internet connection and reload.';
    }
  });
}
 
// Use the guarded reference everywhere below
const pose = poseDetector;
 
// ─── UI updates ──────────────────────────────────────
function updateUI(checks) {
  const prio = { wrong:0, needwork:0.5, good:1 };
  const raw  = checks.reduce((s,c) => s + (prio[c.status] || 0), 0) / checks.length * 100;
 
  // FIX #5: seed from first real reading, not 85
  if (smoothScore === null) {
    smoothScore = raw;
    scoreReadings = 1;
  } else {
    // Blend faster early (more weight on new data), stabilise after 10+ readings
    const alpha = scoreReadings < 10 ? 0.35 : 0.1;
    smoothScore = smoothScore * (1 - alpha) + raw * alpha;
    scoreReadings++;
  }
  const pct = Math.round(smoothScore);
 
  // Desktop sidebar
  const sbPct = document.getElementById('sb-score-pct');
  const sbBar = document.getElementById('sb-score-bar');
  if (sbPct) sbPct.textContent = pct + '%';
  if (sbBar) sbBar.style.width = pct + '%';
 
  // Mobile panel
  const bpPct = document.getElementById('bp-score-pct');
  const bpBar = document.getElementById('bp-score-bar');
  if (bpPct) bpPct.textContent = pct + '%';
  if (bpBar) bpBar.style.width = pct + '%';
 
  // FIX #4: pose-lock gate — only allow timer to run when pose is held
  if (pct >= POSE_LOCK_THRESHOLD) {
    poseLockedFrames = Math.min(poseLockedFrames + 1, LOCK_FRAMES_NEEDED);
  } else {
    poseLockedFrames = Math.max(poseLockedFrames - 1, 0);
  }
 
  const wasLocked = poseLocked;
  poseLocked = poseLockedFrames >= LOCK_FRAMES_NEEDED;
 
  if (poseLocked && !wasLocked) {
    // Just achieved the pose — resume timer
    resumeTimer();
    updateToast(null);
  } else if (!poseLocked && wasLocked && personInFrame) {
    // Lost the pose while still in frame — pause and show correction
    pauseTimer();
    const failing = checks.find(c => c.status !== 'good');
    if (failing) updateToast(failing);
  } else if (poseLocked) {
    // Holding the pose — show corrections for needwork but keep timer going
    const failing = checks.find(c => c.status === 'wrong');
    updateToast(failing || null);
  } else {
    // Not yet locked — show the worst correction
    const failing = checks.find(c => c.status !== 'good');
    updateToast(failing || null);
  }
}
 
function updateToast(check) {
  const t = document.getElementById('correction-toast');
  if (!check) { t.classList.add('hidden'); return; }
  document.getElementById('toast-title').textContent = check.title;
  document.getElementById('toast-msg').textContent   = check.msg;
  t.classList.remove('hidden');
}
 
// ─── Timer ───────────────────────────────────────────
function startTimer(seconds) {
  clearInterval(timerInterval);
  timerSec      = seconds;
  timerTotal    = seconds;
  timerRunning  = false;
  personInFrame = false;
  poseLocked    = false;
  poseLockedFrames = 0;
  renderTimer();
  showTimerPausedState();
}
 
function resumeTimer() {
  if (timerRunning || timerSec <= 0) return;
  timerRunning = true;
  hideTimerPausedState();
  timerInterval = setInterval(() => {
    timerSec = Math.max(0, timerSec - 1);
    totalElapsedSec++;            // FIX #6: accumulate across all poses
    renderTimer();
    if (!timerSec) {
      clearInterval(timerInterval);
      timerRunning = false;
      onTimerComplete();
    }
  }, 1000);
}
 
function pauseTimer() {
  if (!timerRunning) return;
  timerRunning = false;
  clearInterval(timerInterval);
  showTimerPausedState();
}
 
function showTimerPausedState() {
  ['sb-timer', 'bp-timer'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.opacity = '0.35';
  });
}
 
function hideTimerPausedState() {
  ['sb-timer', 'bp-timer'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.opacity = '1';
  });
}
 
function onTimerComplete() {
  if (mpCamera) { mpCamera.stop(); mpCamera = null; }
  if (video.srcObject) { video.srcObject.getTracks().forEach(t => t.stop()); video.srcObject = null; }
  // FIX #6: use accumulated total, not just current pose timer
  const alignment = smoothScore !== null ? Math.round(smoothScore) : 0;
  window.location.href = `summary.html?duration=${totalElapsedSec}&alignment=${alignment}`;
}
 
function renderTimer() {
  const m = String(Math.floor(timerSec/60)).padStart(2,'0');
  const s = String(timerSec%60).padStart(2,'0');
  const val = `${m}:${s}`;
  const sbT = document.getElementById('sb-timer');
  const bpT = document.getElementById('bp-timer');
  if (sbT) sbT.textContent = val;
  if (bpT) bpT.textContent = val;
}
 
// ─── Terms & Conditions ──────────────────────────────
function onTcCheckboxChange() {
  const checkbox = document.getElementById('tc-agree-checkbox');
  const btn      = document.getElementById('btn-tc-accept');
  btn.disabled   = !checkbox.checked;
}
 
function acceptTermsAndStart() {
  sessionStorage.setItem(TERMS_ACCEPTED_KEY, 'true');
  const overlay = document.getElementById('tc-overlay');
  overlay.classList.add('hidden');
  setTimeout(() => {
    overlay.style.display = 'none';
    startPose(activePose);
  }, 320);
}
 
function declineTerms() {
  window.location.href = '../practice/practice.html';
}
 
// ─── Navigation ──────────────────────────────────────
async function initFromURL() {
  const params  = new URLSearchParams(window.location.search);
  const poseKey = params.get('pose') || 'mountain';
  const navEntry = performance.getEntriesByType('navigation')[0];
  if (navEntry?.type === 'reload') {
    sessionStorage.removeItem(TERMS_ACCEPTED_KEY);
  }
 
  // Populate sidebar meta before starting the selected pose.
  activePose  = poseKey;
  smoothScore = null; scoreReadings = 0;
  poseLocked = false; poseLockedFrames = 0;
  const meta = POSE_META[poseKey] || POSE_META.mountain;
  updateSidebarMeta(poseKey, meta);
  updateActivePill(poseKey);
  startTimer(meta.timer);
 
  const overlay = document.getElementById('tc-overlay');
  if (sessionStorage.getItem(TERMS_ACCEPTED_KEY) === 'true') {
    if (overlay) {
      overlay.classList.add('hidden');
      overlay.style.display = 'none';
    }
    startPose(activePose);
  } else if (overlay) {
    overlay.style.display = 'flex';
    overlay.classList.remove('hidden');
  }
}
 
async function startPose(poseKey) {
  activePose = poseKey;
  // FIX #5: start fresh — no fake initial score
  smoothScore = null; scoreReadings = 0;
  poseLocked = false; poseLockedFrames = 0;
  const meta = POSE_META[poseKey] || POSE_META.mountain;
  updateSidebarMeta(poseKey, meta);
  updateActivePill(poseKey);
  startTimer(meta.timer);
 
  ['sb-score-pct','bp-score-pct'].forEach(id=>{ const el=document.getElementById(id); if(el) el.textContent='—'; });
  ['sb-score-bar','bp-score-bar'].forEach(id=>{ const el=document.getElementById(id); if(el) el.style.width='0%'; });
  document.getElementById('correction-toast').classList.add('hidden');
  document.getElementById('loading-overlay').style.display = 'flex';
  document.getElementById('cam-error').style.display = 'none';
 
  // FIX #7: abort early if MediaPipe failed to load
  if (!poseDetector) {
    document.getElementById('loading-overlay').style.display = 'none';
    const errEl = document.getElementById('cam-error');
    if (errEl) {
      errEl.style.display = 'flex';
      const strong = errEl.querySelector('strong');
      const p      = errEl.querySelector('p');
      if (strong) strong.textContent = 'Pose detection unavailable';
      if (p) p.textContent = 'FlowBuddy could not load the AI model. Please check your internet connection and reload.';
    }
    return;
  }
 
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video:true, audio:false });
    video.srcObject = stream;
    await video.play();
    mpCamera = new Camera(video, { onFrame: async()=>{ await pose.send({image:video}); }, width:640, height:480 });
    mpCamera.start();
    document.getElementById('loading-overlay').style.display = 'none';
  } catch(e) {
    document.getElementById('loading-overlay').style.display = 'none';
    document.getElementById('cam-error').style.display = 'flex';
    console.error(e);
  }
}
 
function switchPose(poseKey) {
  if (poseKey === activePose) return;
  const url = new URL(window.location);
  url.searchParams.set('pose', poseKey);
  window.history.replaceState({}, '', url);
  // FIX #5: reset score seeding for new pose; FIX #6: keep totalElapsedSec running
  activePose = poseKey; smoothScore = null; scoreReadings = 0;
  personInFrame = false; timerRunning = false; poseLocked = false; poseLockedFrames = 0;
  clearInterval(timerInterval);
  const meta = POSE_META[poseKey];
  updateSidebarMeta(poseKey, meta);
  updateActivePill(poseKey);
  startTimer(meta.timer);
  ['sb-score-pct','bp-score-pct'].forEach(id=>{ const el=document.getElementById(id); if(el) el.textContent='—'; });
  ['sb-score-bar','bp-score-bar'].forEach(id=>{ const el=document.getElementById(id); if(el) el.style.width='0%'; });
  document.getElementById('correction-toast').classList.add('hidden');
}
 
function updateSidebarMeta(poseKey, meta) {
  const setIfExists = (id, val) => { const el=document.getElementById(id); if(el) el.textContent=val; };
  setIfExists('sb-pose-name', meta.name);
  setIfExists('sb-sanskrit',  meta.sanskrit);
  setIfExists('bp-pose-name', meta.name);
  setIfExists('bp-sanskrit',  meta.sanskrit);
}
 
function updateActivePill(k) {
  // Desktop sidebar pills
  ['mountain','downdog','warrior'].forEach(p => {
    const el  = document.getElementById(`pli-${p}`);
    if (!el) return;
    const chv = el.querySelector('.pli-chevron');
    const dot = el.querySelector('.pli-dot');
    if (p===k) { el.classList.add('active'); if(chv) chv.style.display='none'; if(dot) dot.style.display='block'; }
    else        { el.classList.remove('active'); if(chv) chv.style.display='inline'; if(dot) dot.style.display='none'; }
  });
  // Mobile pills
  ['mountain','downdog','warrior'].forEach(p => {
    const el = document.getElementById(`bpp-${p}`);
    if (!el) return;
    if (p===k) el.classList.add('active'); else el.classList.remove('active');
  });
}
 
function endSession() {
  clearInterval(timerInterval);
  if (mpCamera) { mpCamera.stop(); mpCamera = null; }
  if (video.srcObject) { video.srcObject.getTracks().forEach(t => t.stop()); video.srcObject = null; }
  // FIX #6: use accumulated total; FIX #5: guard null score
  const alignment = smoothScore !== null ? Math.round(smoothScore) : 0;
  window.location.href = `summary.html?duration=${totalElapsedSec}&alignment=${alignment}`;
}
 
initFromURL();
