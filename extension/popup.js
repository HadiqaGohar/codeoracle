document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('analyze-btn');
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].url) {
      const url = new URL(tabs[0].url);
      if (url.hostname === 'github.com') {
        const pathParts = url.pathname.split('/').filter(Boolean);
        if (pathParts.length >= 2) {
          const repoUrl = `https://github.com/${pathParts[0]}/${pathParts[1]}`;
          btn.href = `https://codeoracle-chi.vercel.app/analyze?url=${encodeURIComponent(repoUrl)}`;
          btn.textContent = `Analyze ${pathParts[0]}/${pathParts[1]}`;
        }
      }
    }
  });
});
