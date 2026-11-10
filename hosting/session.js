(() => {
  function send(type) {
    return new Promise(resolve => {
      const worker = navigator.serviceWorker?.controller;
      if (!worker) return resolve({ok:false});
      const channel = new MessageChannel();
      const timeout = setTimeout(() => { channel.port1.close(); resolve({ok:false}); }, 5000);
      channel.port1.onmessage = event => { clearTimeout(timeout); channel.port1.close(); resolve(event.data); };
      worker.postMessage({type}, [channel.port2]);
    });
  }
  async function checkAccess() {
    const result = await send('status');
    if (result.ok) document.body.style.visibility = 'visible';
    else { document.body.style.visibility = 'hidden'; location.reload(); }
  }
  window.addEventListener('pagehide', () => { document.body.style.visibility = 'hidden'; });
  window.addEventListener('pageshow', checkAccess);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') checkAccess(); });
  navigator.serviceWorker.addEventListener('message', event => { if (event.data?.type === 'locked') checkAccess(); });
  setInterval(checkAccess, 30000);
  const button = document.createElement('button');
  button.textContent = 'Lock demo'; button.type = 'button';
  button.style.cssText = 'position:fixed;bottom:18px;right:18px;z-index:100;padding:10px 18px;border:1px solid currentColor;border-radius:24px;background:white;color:rgb(var(--brand,153 27 27));font:600 14px system-ui;cursor:pointer;box-shadow:0 2px 10px #0001';
  button.onclick = async () => { button.disabled = true; await send('lock'); location.replace('/'); };
  document.body.append(button);
  navigator.serviceWorker.register('/preview-worker.js', {scope:'/', updateViaCache:'none'}).catch(() => {});
})();
