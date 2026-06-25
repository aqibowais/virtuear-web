const onxrloaded = () => {
  XR8.addCameraPipelineModule(LandingPage.pipelineModule())
  LandingPage.configure({
    mediaSrc: './assets/preview.jpg',
    promptPrefix: 'To view in AR,',
    promptSuffix: 'Scan the QR code or visit this page on your mobile device.',
  })
}
window.XR8 ? onxrloaded() : window.addEventListener('xrloaded', onxrloaded)
