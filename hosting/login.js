(() => {
  const form=document.getElementById('unlock'),button=document.getElementById('submit'),error=document.getElementById('error');
  let registration;
  const ready=(async()=>{
    if(!('serviceWorker'in navigator)||!window.crypto?.subtle)throw new Error('Open this preview in a current browser over HTTPS.');
    registration=await navigator.serviceWorker.register('/preview-worker.js',{scope:'/',updateViaCache:'none'});
    await navigator.serviceWorker.ready;
    if(!navigator.serviceWorker.controller)await new Promise(resolve=>navigator.serviceWorker.addEventListener('controllerchange',resolve,{once:true}));
  })();
  ready.catch(e=>{error.textContent=e.message;button.disabled=true;});
  form.addEventListener('submit',async event=>{
    event.preventDefault();button.disabled=true;button.textContent='Opening…';error.textContent='';
    try{
      await ready;
      const channel=new MessageChannel();
      const result=new Promise((resolve,reject)=>{
        const timeout=setTimeout(()=>reject(new Error('The preview did not respond. Reload and try again.')),30000);
        channel.port1.onmessage=event=>{clearTimeout(timeout);resolve(event.data);};
      });
      navigator.serviceWorker.controller.postMessage({type:'unlock',password:form.passphrase.value},[channel.port2]);
      const response=await result;
      if(!response.ok)throw new Error(response.error||'That passphrase did not match.');
      form.passphrase.value='';location.reload();
    }catch(e){error.textContent=e.message;button.disabled=false;button.textContent='Open ISAMO';}
  });
})();
