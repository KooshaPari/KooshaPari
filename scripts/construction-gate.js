const STORAGE_KEY = 'portfolio-construction-entered';

function safeGet(storage) {
  try { return storage?.getItem(STORAGE_KEY) === 'yes'; } catch { return false; }
}

function safeSet(storage) {
  try { storage?.setItem(STORAGE_KEY, 'yes'); } catch { /* session storage is optional */ }
}

function getSessionStorage() {
  try { return globalThis.sessionStorage; } catch { return undefined; }
}

export function initializeConstructionGate(document, storage = getSessionStorage()) {
  const gate = document.getElementById('construction-gate');
  const site = document.getElementById('construction-site');
  const continueLink = document.getElementById('construction-continue');
  if (!gate || !site || !continueLink) return;

  const enter = () => {
    safeSet(storage);
    gate.hidden = true;
    gate.setAttribute('aria-hidden', 'true');
    site.inert = false;
    document.documentElement.dataset.construction = 'entered';
    document.body.classList.remove('construction-locked');
    continueLink.blur();
  };

  const hash = document.location?.hash ?? '';
  if (safeGet(storage) || document.documentElement.dataset.construction === 'entered' || hash === '#construction-entered') {
    enter();
    return;
  }

  site.inert = true;
  document.body.classList.add('construction-locked');
  continueLink.focus();
  continueLink.addEventListener('click', (event) => {
    event.preventDefault();
    if (document.defaultView?.history && document.defaultView.location) {
      document.defaultView.history.replaceState(null, '', `${document.defaultView.location.pathname}${document.defaultView.location.search}#construction-entered`);
    }
    enter();
  });
}