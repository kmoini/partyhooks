(function () {
  'use strict';

  var form = document.getElementById('hookForm');
  var input = document.getElementById('occasionInput');
  var btn = document.getElementById('generateBtn');
  var btnLabel = document.getElementById('btnLabel');
  var btnSpinner = document.getElementById('btnSpinner');
  var formError = document.getElementById('formError');
  var resultsSection = document.getElementById('results');
  var hookCards = document.getElementById('hookCards');

  // Pre-fill occasion from body data attribute (occasion landing pages)
  var presetOccasion = document.body.dataset.presetOccasion;
  if (presetOccasion) input.value = presetOccasion;

  // Occasion chips
  document.querySelectorAll('.chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      input.value = chip.dataset.occasion;
      input.focus();
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var occasion = input.value.trim();
    if (!occasion) return;
    generate(occasion);
  });

  function setLoading(loading) {
    btn.disabled = loading;
    btnLabel.textContent = loading ? 'Generating…' : 'Get Party Hooks';
    btnSpinner.hidden = !loading;
    formError.hidden = true;
  }

  function showError(msg) {
    formError.textContent = msg;
    formError.hidden = false;
  }

  function generate(occasion) {
    setLoading(true);
    resultsSection.hidden = true;

    fetch('/api/hooks/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ niche: occasion + ' party reel' }),
    })
      .then(function (res) {
        return res.json().then(function (data) {
          if (!res.ok) throw new Error(data.error || 'Server error');
          return data;
        });
      })
      .then(function (data) {
        setLoading(false);
        renderHooks(data.hooks, occasion);
      })
      .catch(function (err) {
        setLoading(false);
        showError(err.message || 'Something went wrong. Please try again.');
      });
  }

  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderHooks(hooks, occasion) {
    hookCards.innerHTML = '';

    hooks.forEach(function (hook, i) {
      var card = document.createElement('div');
      card.className = 'hook-card';

      var generateUrl = hook.template
        ? 'https://snapdance.app/dance/' + encodeURIComponent(hook.template.id)
        : 'https://snapdance.app';

      var videoHtml = '';
      if (hook.template && hook.template.thumbnailVideo) {
        videoHtml =
          '<video src="' + esc(hook.template.thumbnailVideo) + '" autoplay muted loop playsinline></video>' +
          '<div class="template-name-badge">' + esc(hook.template.name) + '</div>';
      } else {
        videoHtml = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#333;font-size:12px;">No preview</div>';
      }

      card.innerHTML =
        '<div class="hook-card-body">' +
          '<div>' +
            '<div class="hook-number">Hook ' + (i + 1) + '</div>' +
            '<div class="hook-text">' + esc(hook.text) + '</div>' +
            (hook.explainer ? '<div class="hook-explainer">' + esc(hook.explainer) + '</div>' : '') +
          '</div>' +
          '<div class="hook-actions">' +
            '<button class="btn-copy" data-hook="' + esc(hook.text) + '">Copy hook</button>' +
            '<a class="btn-generate" href="' + esc(generateUrl) + '" target="_blank" rel="noopener">' +
              'Add a dance to your reel →' +
            '</a>' +
          '</div>' +
        '</div>' +
        '<div class="hook-card-preview">' + videoHtml + '</div>';

      hookCards.appendChild(card);
    });

    // Copy buttons
    hookCards.querySelectorAll('.btn-copy').forEach(function (copyBtn) {
      copyBtn.addEventListener('click', function () {
        var text = copyBtn.dataset.hook;
        navigator.clipboard.writeText(text).then(function () {
          copyBtn.textContent = 'Copied!';
          copyBtn.classList.add('copied');
          setTimeout(function () {
            copyBtn.textContent = 'Copy hook';
            copyBtn.classList.remove('copied');
          }, 2000);
        });
      });
    });

    // Copy buttons on occasion pages
    document.querySelectorAll('.btn-copy-small').forEach(function (copyBtn) {
      copyBtn.addEventListener('click', function () {
        var text = copyBtn.dataset.hook;
        navigator.clipboard.writeText(text).then(function () {
          copyBtn.textContent = 'Copied!';
          copyBtn.classList.add('copied');
          setTimeout(function () {
            copyBtn.textContent = 'Copy';
            copyBtn.classList.remove('copied');
          }, 2000);
        });
      });
    });

    resultsSection.hidden = false;
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Copy buttons on occasion pages (outside generator)
  document.querySelectorAll('.btn-copy-small').forEach(function (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var text = copyBtn.dataset.hook;
      navigator.clipboard.writeText(text).then(function () {
        copyBtn.textContent = 'Copied!';
        copyBtn.classList.add('copied');
        setTimeout(function () {
          copyBtn.textContent = 'Copy';
          copyBtn.classList.remove('copied');
        }, 2000);
      });
    });
  });
})();
