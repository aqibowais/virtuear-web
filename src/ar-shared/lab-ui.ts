import {
  ComparisonMetrics,
  TEST_CASES,
  type EngineId,
  type TestCaseId,
  saveTrial,
  loadTrials,
  clearTrials,
  deviceLabel,
} from './metrics'

const STYLE = `
#cmp-lab{position:fixed;left:10px;right:10px;bottom:calc(10px + env(safe-area-inset-bottom,0px));z-index:12000;pointer-events:auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}
#cmp-lab .panel{background:rgba(10,14,20,0.88);border:1px solid rgba(255,255,255,0.12);border-radius:16px;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);color:#fff;overflow:hidden}
#cmp-lab .row{display:flex;align-items:center;gap:8px;padding:8px 10px}
#cmp-lab .metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:0 10px 8px}
#cmp-lab .m{background:rgba(255,255,255,0.05);border-radius:10px;padding:6px 8px}
#cmp-lab .m b{display:block;font-size:14px;line-height:1.2}
#cmp-lab .m span{font-size:10px;color:rgba(255,255,255,0.5)}
#cmp-lab button,#cmp-lab select,#cmp-lab textarea{border-radius:10px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.08);color:#fff;font-size:12px;padding:7px 10px}
#cmp-lab .ok{background:#16a34a;border-color:#16a34a}
#cmp-lab .fail{background:#dc2626;border-color:#dc2626}
#cmp-lab .ghost{background:transparent}
#cmp-lab .eng{display:flex;gap:6px}
#cmp-lab .eng button{flex:1;font-weight:700}
#cmp-lab .eng .on{background:#A855F7;border-color:#A855F7}
#cmp-lab textarea{width:100%;min-height:44px;resize:vertical}
#cmp-lab .hidden{display:none}
`

export function switchEngine(engine: EngineId) {
  try {
    if (window.top && window.top !== window) {
      const url = new URL(window.top.location.href)
      url.pathname = '/alpharas'
      url.searchParams.set('engine', engine)
      window.top.location.href = url.toString()
      return
    }
  } catch {
    // fall through
  }
  window.location.href = engine === 'easyar' ? '/ar-easyar/index.html' : '/ar-alpharas/index.html'
}

export function mountComparisonLab(metrics: ComparisonMetrics) {
  if (document.getElementById('cmp-lab')) return
  const style = document.createElement('style')
  style.textContent = STYLE
  document.head.appendChild(style)

  const root = document.createElement('div')
  root.id = 'cmp-lab'
  root.innerHTML = `
    <div class="panel">
      <div class="row">
        <div class="eng">
          <button type="button" data-eng="8thwall">8th Wall</button>
          <button type="button" data-eng="easyar">EasyAR</button>
        </div>
        <button type="button" id="cmp-toggle" class="ghost">Lab</button>
      </div>
      <div class="metrics">
        <div class="m"><b id="cmp-fps">–</b><span>FPS</span></div>
        <div class="m"><b id="cmp-ms">–</b><span>Recog ms</span></div>
        <div class="m"><b id="cmp-jit">–</b><span>Jitter px</span></div>
        <div class="m"><b id="cmp-loss">0</b><span>Losses</span></div>
        <div class="m"><b id="cmp-rec">–</b><span>Recovery ms</span></div>
        <div class="m"><b id="cmp-lux">–</b><span>Brightness</span></div>
      </div>
      <div id="cmp-body">
        <div class="row">
          <select id="cmp-test">${TEST_CASES.map((t) => `<option value="${t.id}">${t.label}</option>`).join('')}</select>
          <button type="button" id="cmp-start">Start trial</button>
        </div>
        <div class="row">
          <button type="button" id="cmp-ok" class="ok">Mark OK</button>
          <button type="button" id="cmp-fail" class="fail">Mark Fail</button>
          <button type="button" id="cmp-export" class="ghost">Export</button>
        </div>
        <div class="row"><textarea id="cmp-notes" placeholder="Notes: jitter, drift, recovery, wrong pose..."></textarea></div>
      </div>
    </div>
  `
  document.body.appendChild(root)

  const setEng = () => {
    root.querySelectorAll<HTMLButtonElement>('[data-eng]').forEach((b) => {
      b.classList.toggle('on', b.dataset.eng === metrics.engine)
    })
  }
  setEng()
  root.querySelectorAll<HTMLButtonElement>('[data-eng]').forEach((b) => {
    b.addEventListener('click', (e) => {
      e.stopPropagation()
      const next = b.dataset.eng as EngineId
      if (next !== metrics.engine) switchEngine(next)
    })
  })

  const body = root.querySelector('#cmp-body') as HTMLElement
  root.querySelector('#cmp-toggle')?.addEventListener('click', () => body.classList.toggle('hidden'))

  root.querySelector('#cmp-start')?.addEventListener('click', (e) => {
    e.stopPropagation()
    metrics.startScan()
  })

  const record = (verdict: 'OK' | 'Fail' | 'Notes') => {
    const testId = (root.querySelector('#cmp-test') as HTMLSelectElement).value as TestCaseId
    const test = TEST_CASES.find((t) => t.id === testId)!
    const notes = (root.querySelector('#cmp-notes') as HTMLTextAreaElement).value
    const snap = metrics.snapshot()
    saveTrial({
      id: `${Date.now()}`,
      engine: metrics.engine,
      testId,
      testLabel: test.label,
      verdict,
      recognitionMs: snap.recognitionMs,
      fpsAvg: snap.fpsAvg,
      trackLosses: snap.trackLosses,
      recoveries: snap.recoveries,
      lastRecoveryMs: snap.lastRecoveryMs,
      jitterPx: snap.jitterPx,
      brightness: snap.brightness,
      notes,
      targetName: snap.targetName,
      device: deviceLabel(),
      createdAt: new Date().toISOString(),
    })
    alert(`Saved ${verdict} for ${test.label} (${metrics.engine})`)
  }
  root.querySelector('#cmp-ok')?.addEventListener('click', (e) => { e.stopPropagation(); record('OK') })
  root.querySelector('#cmp-fail')?.addEventListener('click', (e) => { e.stopPropagation(); record('Fail') })
  root.querySelector('#cmp-export')?.addEventListener('click', (e) => {
    e.stopPropagation()
    const blob = new Blob([JSON.stringify(loadTrials(), null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `alpharas-comparison-${Date.now()}.json`
    a.click()
  })

  setInterval(() => {
    const s = metrics.snapshot()
    const set = (id: string, v: string) => {
      const el = document.getElementById(id)
      if (el) el.textContent = v
    }
    set('cmp-fps', s.fps ? String(s.fps) : '–')
    set('cmp-ms', s.recognitionMs != null ? String(s.recognitionMs) : '–')
    set('cmp-jit', s.jitterPx != null ? String(s.jitterPx) : '–')
    set('cmp-loss', String(s.trackLosses))
    set('cmp-rec', s.lastRecoveryMs != null ? String(s.lastRecoveryMs) : '–')
    set('cmp-lux', s.brightness != null ? String(s.brightness) : '–')
  }, 250)

  return { clearTrials }
}
