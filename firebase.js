import { initializeApp }  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, updatePassword }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, doc, getDocs, getDoc, setDoc, addDoc,
  updateDoc, deleteDoc, query, where, orderBy, serverTimestamp }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export const firebaseConfig = {
  apiKey:            "AIzaSyBKlsuYCWuCKzTuzHliIRONZIKWz_Q2f6w",
  authDomain:        "studycaseportal-1b584.firebaseapp.com",
  projectId:         "studycaseportal-1b584",
  storageBucket:     "studycaseportal-1b584.firebasestorage.app",
  messagingSenderId: "704493714973",
  appId:             "1:704493714973:web:7247ed7fbf195ee87710f4"
};

const app  = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);

export { onAuthStateChanged, signOut, updatePassword,
  collection, doc, getDocs, getDoc, setDoc, addDoc,
  updateDoc, deleteDoc, query, where, orderBy, serverTimestamp };

// ── Utils ──────────────────────────────────────────────────────
export const $   = id => document.getElementById(id);
export const esc = s  => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
export const fmt = ts => {
  if(!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('ru-RU',{day:'2-digit',month:'2-digit',year:'numeric'})
    + ' ' + d.toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'});
};

export function animOnce(el, keyframes, opts){
  if(!el) return;
  if(opts && !isFinite(opts.delay)) opts = {...opts, delay:0};
  el.getAnimations().forEach(a => a.cancel());
  el.animate(keyframes, opts);
}

export function animCard(parent, el, delay=0){
  parent.appendChild(el);
  animOnce(el,
    [{opacity:'0',transform:'translateY(12px)'},{opacity:'1',transform:'none'}],
    {duration:260, delay:(isFinite(delay)?delay:0)*1000, easing:'ease', fill:'both'}
  );
}

export function toast(msg, type=''){
  const t = document.createElement('div');
  t.className = 'toast ' + (type==='ok'?'tok':type==='err'?'terr':'tinfo');
  t.textContent = msg;
  document.body.appendChild(t);
  animOnce(t,[{opacity:'0',transform:'translateX(16px)'},{opacity:'1',transform:'none'}],{duration:200,easing:'ease',fill:'both'});
  setTimeout(()=>{
    animOnce(t,[{opacity:'1'},{opacity:'0'}],{duration:200,easing:'ease',fill:'both'});
    setTimeout(()=>t.remove(), 200);
  }, 3200);
}

export function mshow(id){
  const el = $(id); if(!el) return;
  el.classList.remove('hidden');
  animOnce(el,[{opacity:'0'},{opacity:'1'}],{duration:180,easing:'ease',fill:'both'});
  const box = el.querySelector('.mbox');
  if(box) animOnce(box,
    [{opacity:'0',transform:'translateY(18px) scale(.97)'},{opacity:'1',transform:'none'}],
    {duration:240,easing:'cubic-bezier(.34,1.56,.64,1)',fill:'both'}
  );
}
export function mhide(id){ $(id)?.classList.add('hidden'); }

export function makeCollapsibleSection(dotClass, labelText, count, startOpen=false){
  const wrapper = document.createElement('div');
  const hdr = document.createElement('div'); hdr.className='gj-section-hdr';
  hdr.innerHTML=`<span class="gj-dot ${dotClass}"></span>${labelText}<span class="gj-count">${count}</span><span class="gj-arrow${startOpen?' open':''}">▶</span>`;
  const body = document.createElement('div'); body.className='gj-body';
  body.style.maxHeight = startOpen ? '9999px' : '0';
  hdr.addEventListener('click',()=>{
    const arrow = hdr.querySelector('.gj-arrow');
    const isOpen = arrow.classList.toggle('open');
    body.style.maxHeight = isOpen ? body.scrollHeight+'px' : '0';
    if(isOpen) setTimeout(()=>{ if(arrow.classList.contains('open')) body.style.maxHeight='9999px'; },300);
  });
  wrapper.appendChild(hdr); wrapper.appendChild(body);
  return {wrapper, body};
}

export function gradeChip(g, big=false){
  if(!g) return '';
  const color = g.color||'#64748B';
  return `<span class="grade-chip${big?' gsize-big':''}" style="background:${color}22;color:${color};border-color:${color}44">
    <span class="grade-circle" style="background:${color}"></span>${esc(g.label||g)}</span>`;
}

export function buildEmbed(raw){
  const wrap = document.createElement('div');
  const u = raw.trim(); if(!u){ wrap.classList.add('hidden'); return wrap; }
  if(u.startsWith('<iframe')){
    wrap.className='vifwrap'; wrap.innerHTML=u;
    const f=wrap.querySelector('iframe');
    if(f){f.style.width='100%';f.style.height='320px';f.removeAttribute('width');f.removeAttribute('height');}
    return wrap;
  }
  wrap.className='vwrap';
  const yt = u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if(yt){ wrap.innerHTML=`<iframe src="https://www.youtube.com/embed/${yt[1]}" frameborder="0" allowfullscreen></iframe>`; return wrap; }
  const vk = u.match(/video(-?\d+)_(\d+)/);
  if(vk){ wrap.innerHTML=`<iframe src="https://vk.com/video_ext.php?oid=${vk[1]}&id=${vk[2]}&hd=2" frameborder="0" allowfullscreen></iframe>`; return wrap; }
  if(u.match(/\.(mp4|webm|ogg)(\?|$)/i)){ wrap.innerHTML=`<video controls style="width:100%"><source src="${esc(u)}"/></video>`; return wrap; }
  wrap.className='';
  wrap.innerHTML=`<div class="vlink"><div class="vlico">▶</div><a class="btn bp" href="${esc(u)}" target="_blank">Открыть видео</a></div>`;
  return wrap;
}

// ── Shared state store ─────────────────────────────────────────
// Используем sessionStorage чтобы передавать данные между страницами
export const State = {
  get: k  => { try{ return JSON.parse(sessionStorage.getItem('scp_'+k)); }catch{ return null; } },
  set: (k,v) => sessionStorage.setItem('scp_'+k, JSON.stringify(v)),
  del: k  => sessionStorage.removeItem('scp_'+k)
};

// ── Site settings & footer ────────────────────────────────────
export let SITE_SETTINGS = {vk:'',tg:'',link:'',linkLabel:'',logoNav:true,logoLogin:true};

export async function loadSiteSettings(){
  try{
    const snap = await getDoc(doc(db,'settings','site'));
    if(snap.exists()) SITE_SETTINGS = {...SITE_SETTINGS,...snap.data()};
  }catch(e){}
  applyLogoVisibility();
  renderFooter();
}

export function applyLogoVisibility(){
  const navOk   = SITE_SETTINGS.logoNav   !== false;
  const loginOk = SITE_SETTINGS.logoLogin !== false;
  document.querySelectorAll('#app-nav .logo-img').forEach(e=>{e.style.display=(navOk&&e.dataset.loaded)?'block':'none';});
  document.querySelectorAll('#app-nav .logo-text').forEach(e=>{e.style.display=(navOk&&e.dataset.hasLogo)?'none':'';});
  document.querySelectorAll('.llogo .logo-img').forEach(e=>{e.style.display=(loginOk&&e.dataset.loaded)?'block':'none';});
  document.querySelectorAll('.llogo .logo-text').forEach(e=>{e.style.display=(loginOk&&e.dataset.hasLogo)?'none':'';});
}

export function renderFooter(){
  const soc = document.getElementById('footer-socials'); if(!soc) return;
  soc.innerHTML='';
  if(SITE_SETTINGS.vk){
    const a=document.createElement('a');a.className='fsocial fsocial-vk';a.href=SITE_SETTINGS.vk;a.target='_blank';
    a.innerHTML='<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12.785 16.241s.288-.032.436-.194c.136-.148.132-.427.132-.427s-.02-1.304.585-1.496c.598-.19 1.365 1.26 2.179 1.818.615.422 1.082.33 1.082.33l2.175-.03s1.137-.07.598-1.023c-.044-.075-.314-.662-1.616-1.872-1.364-1.266-1.182-1.062.462-3.253.999-1.333 1.398-2.146 1.272-2.494-.12-.332-.855-.244-.855-.244l-2.447.015s-.181-.025-.316.056c-.132.079-.217.262-.217.262s-.387 1.035-.903 1.913c-1.088 1.85-1.523 1.949-1.7 1.835-.414-.267-.31-1.075-.31-1.648 0-1.793.272-2.54-.529-2.733-.266-.065-.461-.107-1.141-.114-.872-.01-1.61.002-2.028.208-.278.136-.492.439-.361.456.161.022.526.099.72.362.25.338.241 1.099.241 1.099s.144 2.11-.335 2.372c-.329.18-.78-.187-1.748-1.865-.497-.858-.873-1.808-.873-1.808s-.072-.176-.202-.271c-.157-.115-.376-.151-.376-.151l-2.325.015s-.349.01-.477.162c-.113.135-.009.414-.009.414s1.822 4.265 3.882 6.415c1.89 1.974 4.037 1.843 4.037 1.843h.972z"/></svg> ВКонтакте';
    soc.appendChild(a);
  }
  if(SITE_SETTINGS.tg){
    const a=document.createElement('a');a.className='fsocial fsocial-tg';a.href=SITE_SETTINGS.tg;a.target='_blank';
    a.innerHTML='<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z"/></svg> Telegram';
    soc.appendChild(a);
  }
  if(SITE_SETTINGS.link){
    const a=document.createElement('a');a.className='fsocial fsocial-link';a.href=SITE_SETTINGS.link;a.target='_blank';
    a.textContent=SITE_SETTINGS.linkLabel||SITE_SETTINGS.link;soc.appendChild(a);
  }
}

// ── Nav ────────────────────────────────────────────────────────
export function initNav(role, currentPage){
  const nav = document.getElementById('app-nav');
  if(!nav) return;
  nav.classList.remove('hidden');

  // Mobile toggle
  const toggle = document.getElementById('nav-toggle');
  const links  = document.getElementById('nav-links');
  if(toggle && links){
    toggle.addEventListener('click', () => links.classList.toggle('open'));
    document.addEventListener('click', e => { if(!e.target.closest('#app-nav')) links.classList.remove('open'); });
  }

  // Scroll shadow
  window.addEventListener('scroll', ()=>{
    nav.classList.toggle('scrolled', window.scrollY > 10);
  });

  // Mark active link
  nav.querySelectorAll('.nbtn[data-page]').forEach(btn=>{
    btn.classList.toggle('active', btn.dataset.page === currentPage);
  });

  // Show/hide by role
  nav.querySelectorAll('.nbtn[data-roles]').forEach(btn=>{
    const roles = btn.dataset.roles.split(',');
    btn.classList.toggle('hidden', !roles.includes(role));
  });
}

// ── Logo loader ────────────────────────────────────────────────
export function tryLogo(names, i=0){
  if(i>=names.length) return;
  const img=new Image();
  img.onload=()=>{
    document.querySelectorAll('.logo-img').forEach(e=>{ e.src=names[i]; e.dataset.loaded='1'; });
    document.querySelectorAll('.logo-text').forEach(e=>e.dataset.hasLogo='1');
    applyLogoVisibility();
  };
  img.onerror=()=>tryLogo(names,i+1);
  img.src=names[i]+'?t='+Date.now();
}

// ── Auth guard — redirect to login if not logged in ───────────
export async function requireAuth(){
  return new Promise(resolve=>{
    const unsub = onAuthStateChanged(auth, async user=>{
      unsub();
      if(!user){ window.location.href='index.html'; return; }
      const snap = await getDoc(doc(db,'users',user.uid));
      if(!snap.exists()){ await signOut(auth); window.location.href='index.html'; return; }
      let UP = snap.data();
      // Apply pending password change
      if(UP.pendingPassword){
        try{
          await updatePassword(user, UP.pendingPassword);
          await updateDoc(doc(db,'users',user.uid),{pendingPassword:''});
          UP.pendingPassword='';
        }catch(e){}
      }
      resolve({user, UP});
    });
  });
}

// ── Group tabs helper ──────────────────────────────────────────
export function buildGroupTabs(tabsId, listId, GROUPS, allStudents, checkedSet, filterFn, searchId=null){
  const tabsEl = document.getElementById(tabsId); tabsEl.innerHTML='';
  const listEl = document.getElementById(listId);
  const accessMap = new Map();
  allStudents.forEach(([uid])=>{ accessMap.set(uid, checkedSet.has(uid)); });
  const activeGroups = new Set();
  let searchFilter = '';

  function render(){
    listEl.innerHTML='';
    let shown=0;
    allStudents.forEach(([uid,u])=>{
      if(!filterFn(uid)) return;
      if(activeGroups.size>0 && !activeGroups.has(u.groupId||'')) return;
      if(searchFilter){
        const q=searchFilter.toLowerCase();
        if(!((u.name||'').toLowerCase().includes(q)||(u.email||'').toLowerCase().includes(q))) return;
      }
      shown++;
      const row=document.createElement('div'); row.className='arow';
      const grp=u.groupName?` <span class="grptag">${esc(u.groupName)}</span>`:'';
      const checked=accessMap.get(uid)?'checked':'';
      row.innerHTML=`<label class="albl"><input type="checkbox" data-uid="${uid}" ${checked}/>
        <span class="aname">${esc(u.name||u.email)}${grp}</span>
        <small>${esc(u.email)}</small></label>`;
      row.querySelector('input').addEventListener('change',function(){ accessMap.set(uid,this.checked); });
      listEl.appendChild(row);
    });
    if(!shown) listEl.innerHTML='<p class="empty" style="padding:1rem">Нет студентов</p>';
  }

  if(searchId){
    const si=document.getElementById(searchId);
    if(si) si.oninput=function(){ searchFilter=this.value.trim(); render(); };
  }

  const allBtn=document.createElement('button');allBtn.className='gtab active';allBtn.textContent='Все';
  allBtn.addEventListener('click',()=>{
    activeGroups.clear();
    tabsEl.querySelectorAll('.gtab').forEach(x=>x.classList.remove('active'));
    allBtn.classList.add('active'); render();
  });
  tabsEl.appendChild(allBtn);

  GROUPS.forEach(g=>{
    const btn=document.createElement('button');btn.className='gtab';btn.textContent=g.name;
    btn.addEventListener('click',()=>{
      if(activeGroups.has(g.id)){ activeGroups.delete(g.id); btn.classList.remove('active'); }
      else{ activeGroups.add(g.id); btn.classList.add('active'); }
      if(activeGroups.size===0) allBtn.classList.add('active');
      else allBtn.classList.remove('active');
      render();
    });
    tabsEl.appendChild(btn);
  });

  const selAll=document.createElement('button');selAll.className='gtab';selAll.textContent='☑ Все';selAll.style.marginLeft='auto';
  selAll.addEventListener('click',()=>{
    listEl.querySelectorAll('input[type=checkbox]').forEach(cb=>{ cb.checked=true; accessMap.set(cb.dataset.uid,true); });
  });
  tabsEl.appendChild(selAll);
  render();
  return accessMap;
}
