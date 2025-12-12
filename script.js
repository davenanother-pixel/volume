// script.js
// Global volume controller for audio/video elements on the page.

(function () {
  const slider = document.getElementById('globalSlider');
  const volLabel = document.getElementById('volLabel');
  const lower10Btn = document.getElementById('lower10');
  const raise10Btn = document.getElementById('raise10');
  const muteBtn = document.getElementById('mute');
  const restoreBtn = document.getElementById('restore');
  const fade5Btn = document.getElementById('fade5');
  const fade15Btn = document.getElementById('fade15');
  const fadeCustomBtn = document.getElementById('fadeCustom');
  const fadeDurationInput = document.getElementById('fadeDuration');
  const bookmarkletEl = document.getElementById('bookmarklet');

  let savedVolumes = new Map();
  let lastVolume = 1;

  // utility: find all audio/video elements
  function getMediaElements() {
    const els = Array.from(document.querySelectorAll('audio, video'));
    return els;
  }

  // apply volume (0..1) to all media elements
  function applyVolumeToAll(v) {
    lastVolume = Math.max(0, Math.min(1, v));
    volLabel.textContent = Math.round(lastVolume * 100) + '%';
    slider.value = Math.round(lastVolume * 100);

    const media = getMediaElements();
    media.forEach(el => {
      try {
        // store original if not stored
        if (!savedVolumes.has(el)) {
          savedVolumes.set(el, el.volume ?? 1);
        }
        // set direct volume property (works for most elements)
        if (typeof el.volume === 'number') {
          el.volume = lastVolume;
        }

        // attempt WebAudio fallback: connect element to an AudioContext gain node
        if (!el._lowerVolGain) {
          try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const source = ctx.createMediaElementSource(el);
            const gain = ctx.createGain();
            gain.gain.value = lastVolume;
            source.connect(gain);
            gain.connect(ctx.destination);
            el._lowerVolGain = gain;
            el._lowerVolContext = ctx;
          } catch (e) {
            // context creation might fail for cross-origin media or restrictions
          }
        } else {
          el._lowerVolGain.gain.value = lastVolume;
        }
      } catch (e) {
        console.warn('Could not set volume for element', el, e);
      }
    });
  }

  // fade from current to target over seconds
  function fadeTo(target, seconds=5) {
    target = Math.max(0, Math.min(1, target));
    const start = lastVolume;
    const diff = target - start;
    const steps = Math.ceil(seconds * 30); // 30 fps
    if (steps <= 0) return;

    let i = 0;
    const interval = setInterval(() => {
      i++;
      const t = i / steps;
      const v = start + diff * t;
      applyVolumeToAll(v);
      if (i >= steps) clearInterval(interval);
    }, 1000/30);
  }

  // Basic actions
  slider.addEventListener('input', (e) => {
    applyVolumeToAll(e.target.value / 100);
  });

  lower10Btn.addEventListener('click', () => {
    fadeTo(Math.max(0, lastVolume - 0.10), 0.4);
  });
  raise10Btn.addEventListener('click', () => {
    fadeTo(Math.min(1, lastVolume + 0.10), 0.4);
  });
  muteBtn.addEventListener('click', () => {
    applyVolumeToAll(0);
  });
  restoreBtn.addEventListener('click', () => {
    // restore saved volumes if possible, otherwise to full
    const media = getMediaElements();
    if (media.length && savedVolumes.size) {
      media.forEach(el => {
        const orig = savedVolumes.get(el);
        if (typeof orig === 'number') {
          try { el.volume = orig; } catch {}
          if (el._lowerVolGain) el._lowerVolGain.gain.value = orig;
        }
      });
      const first = media[0];
      const v = (first && typeof first.volume === 'number') ? first.volume : 1;
      applyVolumeToAll(v);
    } else {
      applyVolumeToAll(1);
    }
  });

  fade5Btn.addEventListener('click', () => fadeTo(0, 5));
  fade15Btn.addEventListener('click', () => fadeTo(0, 15));
  fadeCustomBtn.addEventListener('click', () => {
    const s = Math.max(1, Number(fadeDurationInput.value) || 8);
    fadeTo(0, s);
  });

  // keyboard shortcut: Ctrl+ArrowDown to lower 10, Ctrl+ArrowUp to raise 10
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && !e.shiftKey && !e.altKey) {
      if (e.key === 'ArrowDown') { e.preventDefault(); lower10Btn.click(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); raise10Btn.click(); }
    }
  });

  // initialize with existing media elements
  document.addEventListener('DOMContentLoaded', () => {
    const media = getMediaElements();
    const initial = media.length ? (media[0].volume ?? 1) : 1;
    applyVolumeToAll(initial);
  });

  // Expose a global API in case user wants to call from console or bookmarklet
  window.LowerVolume = {
    set: (n) => applyVolumeToAll(Math.max(0, Math.min(1, n))),
    fadeTo: (n, s) => fadeTo(Math.max(0, Math.min(1, n)), s || 5),
    getMedia: getMediaElements
  };

  // Create a bookmarklet snippet for users to run this code on other pages
  // This bookmarklet simply injects a small loader that will fetch the hosted script URL.
  // If you host script.js on your GitHub pages, replace LOC with your URL and drag the bookmarklet to your bar.
  const placeholder = "javascript:(function(){/* Replace LOC with the URL where you host script.js (raw). Example: https://username.github.io/repo/script.js */var s=document.createElement('script');s.src='LOC';document.head.appendChild(s);})();";
  bookmarkletEl.title = "Drag this to bookmarks bar; edit LOC to point at your hosted raw script.js";
  bookmarkletEl.dataset.snippet = placeholder;
  // Make it easy to copy
  bookmarkletEl.addEventListener('click', () => {
    navigator.clipboard?.writeText(placeholder.replace('LOC', window.location.origin + '/script.js'))
      .then(()=> alert('Bookmarklet snippet copied to clipboard (edit LOC if needed).'))
      .catch(()=> alert('Copy failed — select and copy the snippet manually.'));
  });

})();
