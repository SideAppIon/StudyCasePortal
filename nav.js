// nav.js — вставляет шапку и подвал на страницу
import { auth, signOut, $, State, initNav, tryLogo, loadSiteSettings } from './firebase.js';

export function insertNav(currentPage){
  const adminPages = [
    {href:'courses.html',   label:'📚 Курсы',         page:'courses'},
    {href:'users.html',     label:'👥 Пользователи',  page:'users'},
    {href:'groups.html',    label:'🏫 Группы',         page:'groups'},
    {href:'answers.html',   label:'📝 Ответы',         page:'answers'},
    {href:'journal.html',   label:'📊 Журнал',         page:'journal'},
    {href:'settings.html',  label:'⚙️ Настройки',      page:'settings'},
  ];
  const teacherPages = [
    {href:'answers.html',   label:'📝 Ответы',         page:'answers'},
    {href:'journal.html',   label:'📊 Журнал',         page:'journal'},
  ];
  const studentPages = [
    {href:'my-courses.html',label:'📖 Мои курсы',      page:'my-courses'},
    {href:'my-grades.html', label:'🏅 Оценки',          page:'my-grades'},
    {href:'achievements.html',label:'⭐ Достижения',   page:'achievements'},
  ];

  const UP = State.get('UP') || {};
  const role = UP.role || 'student';

  const pages = role==='admin' ? adminPages : role==='teacher' ? teacherPages : studentPages;
  const roleLabel = role==='admin'?'Администратор':role==='teacher'?'Преподаватель':'Студент';

  const linksHtml = pages.map(p=>
    `<a href="${p.href}" class="nbtn${p.page===currentPage?' active':''}">${p.label}</a>`
  ).join('');

  document.body.insertAdjacentHTML('afterbegin', `
    <nav id="app-nav">
      <div class="nav-inner">
        <a href="${role==='admin'?'courses.html':role==='teacher'?'answers.html':'my-courses.html'}" class="nav-brand">
          <img class="logo-img" src="" alt=""/>
          <span class="logo-text">Study Case Portal</span>
        </a>
        <button class="nav-toggle" id="nav-toggle" aria-label="Меню">☰</button>
        <div class="nav-links" id="nav-links">
          ${linksHtml}
          <button class="nbtn" id="nout">Выйти</button>
        </div>
        <span class="nav-user">
          <span>${esc(UP.name||'')}</span>&nbsp;<span class="nav-rb">${roleLabel}</span>
        </span>
      </div>
    </nav>
  `);

  document.body.insertAdjacentHTML('beforeend', `
    <footer id="site-footer">
      <div class="footer-inner">
        <div class="footer-socials" id="footer-socials"></div>
        <a class="footer-brand" href="https://studycaseplatform.ru" target="_blank">studycaseplatform.ru</a>
      </div>
    </footer>
    <div id="ach-notify" class="hidden"></div>
  `);

  // Mobile toggle
  document.getElementById('nav-toggle').addEventListener('click',()=>{
    document.getElementById('nav-links').classList.toggle('open');
  });
  document.addEventListener('click',e=>{
    if(!e.target.closest('#app-nav')) document.getElementById('nav-links')?.classList.remove('open');
  });
  // Scroll shadow
  window.addEventListener('scroll',()=>{
    document.getElementById('app-nav')?.classList.toggle('scrolled', window.scrollY>10);
  });
  // Logout
  document.getElementById('nout').addEventListener('click', async()=>{
    await signOut(auth);
    State.del('UP'); State.del('UID'); State.del('EMAIL');
    window.location.href='index.html';
  });

  tryLogo(['logo.png','logo.PNG','logo.jpg','logo.JPG']);
  loadSiteSettings();
}

function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
