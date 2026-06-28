/* ============================================
   BUREAU OF CREATIVE WRITING — main.js
   ============================================ */

let allPosts = [];
let lang = localStorage.getItem('bcw-lang') || 'en';

const SUPABASE_URL = 'https://oyqktknmskosttwkktng.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95cWt0a25tc2tvc3R0d2trdG5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NDg5MDcsImV4cCI6MjA5ODIyNDkwN30.FgNLX-2-QZ1jMxBFeSLLIKQ-ocfWfdyGLnqfQlOITy0';

async function loadPosts() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/posts?order=date.desc`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });
  allPosts = await res.json();
  renderPostList();
}



// ---- UTILS ----

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  if (lang === 'ka') {
    const months = ['იანვარი','თებერვალი','მარტი','აპრილი','მაისი','ივნისი',
                    'ივლისი','აგვისტო','სექტემბერი','ოქტომბერი','ნოემბერი','დეკემბერი'];
    return `${d.getDate()} ${months[d.getMonth()]}, ${d.getFullYear()}`;
  }
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function t(en, ka) { return lang === 'ka' ? ka : en; }

function nextId() {
  if (!allPosts.length) return '0001';
  const max = Math.max(...allPosts.map(p => parseInt(p.id, 10)));
  return String(max + 1).padStart(4, '0');
}

// ---- LOAD ----

// async function loadPosts() {
//   try {
//     const res = await fetch('./data/posts.json');
//     if (!res.ok) throw new Error('HTTP ' + res.status);
//     allPosts = await res.json();
//     allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
//     renderPostList();
//   } catch (err) {
//     document.getElementById('post-list').innerHTML =
//       `<p style="color:var(--muted);font-size:0.8rem;padding:2rem 0;">
//         ${t('Posts could not be loaded.','პოსტები ვერ ჩაიტვირთა.')} (${err.message})<br>
//         <em>${t('Run with a local server — see README.','გაუშვით ლოკალური სერვერით — იხ. README.')}</em>
//       </p>`;
//   }
// }

// ---- RENDER LIST ----

function renderPostList() {
  const list = document.getElementById('post-list');
   const filtered = allPosts.filter(p => p.lang.toLowerCase() === lang);
  if (!filtered.length) {
    list.innerHTML = `<p style="color:var(--muted);font-size:0.8rem;padding:2rem 0;">
      ${t('No documents filed. Check if there are any in the other language. We could tell you if we tried but we don\'t really care.','დოკუმენტები არ არის. შეამოწმეთ, არის თუ არა რაიმე სხვა ენაზე. ჩვენ შეგვიძლია გითხრათ, რომ ვეცადოთ, მაგრამ არ გვადარდებს.')}
    </p>`;
    return;
  }
  list.innerHTML = filtered.map(post => {
    // const p = post[lang] || post['en'];
    // take only the first 200 characters of the content for the excerpt
    var excerpt = post.content.length > 200 ? post.content.slice(0, 200) + '...' : post.content;
return `
  <article class="post-card" onclick="showPost('${post.id}')">
    <div class="post-id">№${post.id}</div>
    <div>
      <div class="post-date">${formatDate(post.date)}</div>
      <h2 class="post-title">${post.title}</h2>
      <p class="post-excerpt">${excerpt}</p>
    </div>
  </article>`;
  }).join('');
}

// ---- SHOW POST ----

function showPost(id) {
  const post = allPosts.find(p => String(p.id) === String(id));

  if (!post) return;
  // const p = post[lang] || post['en'];

  hide('home-view'); hide('write-view');
  const view = document.getElementById('post-view');
  view.style.display = 'block';
  view.innerHTML = `
    <div class="post-view-header">
      <a class="back-link" onclick="showHome()">← ${t('Back to registry','სიაში დაბრუნება')}</a>
      <div class="post-view-id">${t('Filed','შეტანილია')} ${formatDate(post.date)} — №${post.id}</div>
      <h1 class="post-view-title">${post.title}</h1>
    </div>
    <div class="post-view-body">${post.content}</div>
  `;
  setActiveNav(null);
  scrollTop();
}

// ---- SHOW HOME ----

function showHome() {
  hide('post-view'); hide('write-view');
  show('home-view');
  setActiveNav('nav-home');
  scrollTop();
}

// ---- SHOW WRITE ----

function showWrite() {
  hide('post-view'); hide('home-view');
  const view = document.getElementById('write-view');
  view.style.display = 'block';
  renderWriteForm();
  setActiveNav('nav-write');
  scrollTop();
}

function renderWriteForm() {
  const view = document.getElementById('write-view');
  view.innerHTML = `
    <div style="margin-bottom:2rem;">
      <div class="form-group">
        <label class="form-label" for="post-title">${t('Title', 'სათაური')}</label>
        <input class="form-input" id="post-title" type="text" placeholder="${t('Your title', 'სათაური')}" />
      </div>
      <div class="form-group">
        <label class="form-label" for="post-content">${t('Full story', 'სრული ტექსტი')}</label>
        <textarea class="form-textarea" id="post-content" placeholder="${t('Write your story here. Line breaks are preserved.', 'დაწერეთ ისტორია აქ...')}"></textarea>
      </div>
      <div class="form-group">
        <label class="form-label" for="post-date">${t('Date', 'თარიღი')}</label>
        <input class="form-input" id="post-date" type="date" value="${new Date().toISOString().slice(0,10)}" style="max-width:200px;" />
      </div>
    </div>
    <div class="form-actions">
      <button class="btn btn-primary" onclick="submitStory()">${t('Save story', 'შენახვა')}</button>
      <button class="btn" onclick="showHome()">${t('Cancel', 'გაუქმება')}</button>
    </div>
    <div id="form-success" class="form-success"></div>
  `;
}

async function submitStory() {
  const title   = document.getElementById('post-title').value.trim();
  const content = document.getElementById('post-content').value.trim();
  const date      = document.getElementById('post-date').value;


  if (!title || !content) {
    alert(t('Please fill in a title and story.','შეავსეთ მინიმუმ ქართული სათაური და ტექსტი.'));
    return;
  }

  const newPost = {
    id: nextId(),
    date,
    title: title,
    content: content,
    lang: lang
  };

  const res = await fetch(`${SUPABASE_URL}/rest/v1/posts`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${localStorage.getItem('bcw-token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newPost)
  });



  if (res.ok) {
    allPosts.unshift(newPost);
    renderPostList();
    showHome();
  } else {
    const err = await res.json();
    alert('Error: ' + err.message);
  }

  // Persist in localStorage
  // const stored = JSON.parse(localStorage.getItem('bcw-local-posts') || '[]');
  // stored.unshift(newPost);
  // localStorage.setItem('bcw-local-posts', JSON.stringify(stored));

  // // Show success + JSON export
  
}

// ---- LANG ----

function setLang(l) {
  lang = l;
  localStorage.setItem('bcw-lang', l);
  document.querySelectorAll('.lang-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === l);
  });
  updateStaticStrings();
  renderPostList(); // refetch filtered by new lang


  // // Re-render current view
  const homeVisible  = document.getElementById('home-view').style.display !== 'none';
  const postVisible  = document.getElementById('post-view').style.display !== 'none';
  const writeVisible = document.getElementById('write-view').style.display !== 'none';

  if (homeVisible)  renderPostList();
  if (postVisible)  { showHome(); }
  if (writeVisible) renderWriteForm();
}

function refreshPostView() {
  // Extract id from the view's content
  const idEl = document.querySelector('.post-view-id');
  if (!idEl) return;
  const match = idEl.textContent.match(/№(\d+)/);
  if (match) showPost(match[1]);
}

function updateStaticStrings() {
  const subtitles = {
    en: 'Official repository of random stories, observations, and minor incidents',
    ka: 'შემთხვევითი ისტორიების, დაკვირვებებისა და მცირე ინციდენტების ოფიციალური საცავი '
  };
  const el = document.querySelector('.site-subtitle');
  if (el) el.textContent = subtitles[lang];

  const eyebrow = document.querySelector('#home-view .section-eyebrow');
  if (eyebrow) eyebrow.textContent = t(
    'All filed documents — sorted by date of submission',
    'ყველა შეტანილი დოკუმენტი — თარიღის მიხედვით'
  );

  const footer = document.querySelector('.site-footer');
  if (footer) footer.innerHTML = {
    en: '<span>This footer is required. Its purpose is unclear.</span>',
    ka: '<span>ეს ქვედა კოლონტიტული აუცილებელია. მისი დანიშნულება გაურკვეველია.</span>'
  }[lang];

  const navHome  = document.getElementById('nav-home');
  const navWrite = document.getElementById('nav-write');
  if (navHome)  navHome.textContent  = t('Registry', 'საცავი');
if (navWrite) navWrite.textContent = t('+ New story', '+ ახალი ისტორია');
}

// ---- HELPERS ----

function hide(id) { document.getElementById(id).style.display = 'none'; }
function show(id) { document.getElementById(id).style.display = 'block'; }
function setActiveNav(activeId) {
  document.querySelectorAll('.site-nav a').forEach(a => a.classList.remove('active'));
  if (activeId) { const el = document.getElementById(activeId); if (el) el.classList.add('active'); }
}
function scrollTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }

// ---- INIT ----

document.addEventListener('DOMContentLoaded', async () => {
  // Clock
  const clockEl = document.getElementById('header-time');
  if (clockEl) {
    const tick = () => clockEl.textContent = new Date().toLocaleTimeString('en-US', { hour12: false });
    tick(); setInterval(tick, 1000);
  }

  // Lang buttons
  document.querySelectorAll('.lang-btn').forEach(b => {
    b.addEventListener('click', () => setLang(b.dataset.lang));
    b.classList.toggle('active', b.dataset.lang === lang);
  });

  // Load from JSON
  await loadPosts();

  // Merge localStorage posts (local-only additions)
  const local = JSON.parse(localStorage.getItem('bcw-local-posts') || '[]');
  local.forEach(lp => {
    if (!allPosts.find(p => p.id === lp.id)) allPosts.unshift(lp);
  });
  allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

  updateStaticStrings();
  renderPostList();
  const navWrite = document.getElementById('nav-write');
  if (navWrite) {
    navWrite.style.display = localStorage.getItem('bcw-token') ? '' : 'none';
  }
});
