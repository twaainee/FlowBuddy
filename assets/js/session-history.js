(function () {
  const STORAGE_KEY = 'flowbuddySessionHistory';
  const MAX_SESSIONS = 30;

  const POSE_NAMES = {
    mountain: 'Mountain Pose',
    downdog: 'Downward Dog',
    warrior: 'Warrior I'
  };

  function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
  }

  function readSessions() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function writeSessions(sessions) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(0, MAX_SESSIONS)));
  }

  function saveSession(input) {
    const session = {
      id: input.id || `fb-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: input.createdAt || new Date().toISOString(),
      duration: clamp(Number(input.duration) || 0, 0, 6 * 60 * 60),
      alignment: clamp(Number(input.alignment) || 0, 0, 100),
      activePose: input.activePose || 'mountain',
      bestPose: input.bestPose || input.activePose || 'mountain',
      focusPose: input.focusPose || input.activePose || 'mountain',
      focusArea: input.focusArea || 'overall alignment',
      focusAdvice: input.focusAdvice || 'Keep practicing with slow, steady holds.',
      poses: input.poses || {}
    };

    const sessions = readSessions().filter(item => item.id !== session.id);
    sessions.unshift(session);
    writeSessions(sessions);
    return session;
  }

  function getSession(id) {
    if (!id) return null;
    return readSessions().find(session => session.id === id) || null;
  }

  function getLatestSession() {
    return readSessions()[0] || null;
  }

  function clearSessions() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function poseName(poseKey) {
    return POSE_NAMES[poseKey] || poseKey || 'Practice';
  }

  function formatDuration(totalSec) {
    const seconds = clamp(Number(totalSec) || 0, 0, 6 * 60 * 60);
    if (seconds <= 0) return '-';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h) return `${h}h ${m}m`;
    if (m) return s ? `${m}m ${s}s` : `${m}m`;
    return `${s}s`;
  }

  function formatDate(iso) {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return 'Recently';
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function getStats() {
    const sessions = readSessions();
    const totals = sessions.reduce((acc, session) => {
      acc.duration += session.duration || 0;
      acc.alignment += session.alignment || 0;
      return acc;
    }, { duration: 0, alignment: 0 });

    const best = sessions.reduce((currentBest, session) => {
      if (!currentBest || (session.alignment || 0) > (currentBest.alignment || 0)) return session;
      return currentBest;
    }, null);

    return {
      count: sessions.length,
      totalDuration: totals.duration,
      averageAlignment: sessions.length ? Math.round(totals.alignment / sessions.length) : 0,
      bestAlignment: best?.alignment || 0,
      bestPose: best?.bestPose || best?.activePose || ''
    };
  }

  window.FlowBuddyHistory = {
    readSessions,
    saveSession,
    getSession,
    getLatestSession,
    clearSessions,
    getStats,
    poseName,
    formatDuration,
    formatDate
  };
})();
