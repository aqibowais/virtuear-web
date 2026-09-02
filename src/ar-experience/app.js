// 8th Wall LandingPage is not loaded — Virtuar draws its own UI.
// Calling LandingPage.pipelineModule() threw on xrloaded and blocked the camera.

window.setTimeout(() => {
  const el = document.getElementById('ar-loading')
  if (!el || el.classList.contains('hidden')) return
  const label = el.querySelector('.ar-loading-label')
  if (label) {
    label.textContent = 'Allow camera access, then reload this page.'
  }
}, 15000)
