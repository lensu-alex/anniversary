(() => {
  'use strict';
  const config = window.HUNT_CONFIG;
  const byId = (id) => document.getElementById(id);
  const setText = (id, text) => { byId(id).textContent = text || ''; };
  const show = (id) => { byId(id).hidden = false; };
  const hide = (id) => { byId(id).hidden = true; };
  const normalize = (value) => String(value || '').normalize('NFKC').trim().toLocaleLowerCase('en');

  if (!config || !Array.isArray(config.chapters)) {
    console.error('Missing or invalid config.js');
    show('waiting-panel');
    return;
  }

  setText('site-tagline', config.littleTagline);
  setText('footer-message', config.footerMessage);
  setText('couple-name', config.coupleName);

  const token = new URLSearchParams(window.location.search).get('key');
  const chapter = config.chapters.find((item) => item.key === token && token);

  // No QR token (or a made-up token) means no password form and no story content.
  if (!chapter) {
    show('waiting-panel');
    return;
  }

  document.body.classList.add(chapter.number === '02' ? 'chapter-two' : 'chapter-one');
  setText('chapter-label', `chapter ${chapter.number} / 02`);
  byId(chapter.number === '02' ? 'dot-2' : 'dot-1').classList.add('active');
  setText('locked-heading', chapter.lockedHeading);
  setText('locked-text', chapter.lockedText);
  setText('unlocked-eyebrow', chapter.unlockedEyebrow);
  setText('unlocked-heading', chapter.unlockedHeading);
  setText('unlocked-message', chapter.unlockedMessage);
  setText('photo-caption', chapter.photoCaption);
  setText('clue-title', chapter.clueTitle);
  setText('clue-text', chapter.clue);
  byId('photo').src = chapter.photo;
  byId('photo').alt = chapter.photoAlt || 'Our favorite photo';
  document.title = `Part ${chapter.number} | Anniversary hunt`;

  show('locked-panel');

  const form = byId('password-form');
  const input = byId('secret-password');
  const error = byId('password-error');
  const toggle = byId('toggle-password');

  toggle.addEventListener('click', () => {
    const reveal = input.type === 'password';
    input.type = reveal ? 'text' : 'password';
    toggle.textContent = reveal ? 'hide' : 'show';
    toggle.setAttribute('aria-label', reveal ? 'Hide password' : 'Show password');
    toggle.setAttribute('aria-pressed', String(reveal));
    input.focus();
  });

  input.addEventListener('input', () => {
    error.textContent = '';
    byId('password-form').classList.remove('shake');
    input.setAttribute('aria-invalid', 'false');
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (normalize(input.value) === normalize(chapter.password) && normalize(chapter.password)) {
      hide('locked-panel');
      show('unlocked-panel');
      byId('unlocked-panel').classList.add('appear');
      byId('unlocked-heading').setAttribute('tabindex', '-1');
      byId('unlocked-heading').focus({ preventScroll: true });
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches === false) {
        window.scrollTo({ top: Math.max(0, byId('unlocked-panel').getBoundingClientRect().top + window.scrollY - 70), behavior: 'smooth' });
      }
    } else {
      error.textContent = 'Not quite. Try again.';
      input.setAttribute('aria-invalid', 'true');
      form.classList.remove('shake');
      // Restart the short feedback animation without refreshing the page.
      void form.offsetWidth;
      form.classList.add('shake');
      input.focus();
    }
  });
})();
