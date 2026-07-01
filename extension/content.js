(function() {
  'use strict';

  const CODEORACLE_URL = 'https://codeoracle-chi.vercel.app';

  function getRepoUrl() {
    const parts = window.location.pathname.split('/').filter(Boolean);
    if (parts.length >= 2) {
      return `https://github.com/${parts[0]}/${parts[1]}`;
    }
    return null;
  }

  function addButton() {
    if (document.getElementById('codeoracle-btn')) return;

    const repoUrl = getRepoUrl();
    if (!repoUrl) return;

    const nav = document.querySelector('.ultra-tabs-nav, .pagehead-actions, .file-navigation .d-flex');
    if (!nav) return;

    const btn = document.createElement('li');
    btn.id = 'codeoracle-btn';
    btn.innerHTML = `
      <a href="${CODEORACLE_URL}/analyze?url=${encodeURIComponent(repoUrl)}"
         target="_blank"
         class="btn btn-sm codeoracle-btn"
         title="Analyze with CodeOracle — AI Code Review">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: text-bottom; margin-right: 4px;">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
        Analyze with CodeOracle
      </a>
    `;

    nav.prepend(btn);
  }

  function observeNavigation() {
    const observer = new MutationObserver(() => {
      if (window.location.pathname.split('/').filter(Boolean).length >= 2) {
        addButton();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      addButton();
      observeNavigation();
    });
  } else {
    addButton();
    observeNavigation();
  }
})();
