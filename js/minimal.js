/* Renderer: builds the top bar, footer and the per-page content from
   data/all.json. Single source of truth = the JSON. */

var NAV = [
  { id: 'news', label: 'News', href: 'news.html' },
  { id: 'research', label: 'Publications', href: 'research.html' },
  { id: 'work', label: 'Experience', href: 'work.html' },
  { id: 'education', label: 'Education', href: 'education.html' },
  { id: 'projects', label: 'Projects', href: 'projects.html' },
  { id: 'talks', label: 'Talks', href: 'talks.html' },
  { id: 'services', label: 'Service', href: 'services.html' },
  { id: 'skills', label: 'Skills', href: 'skills.html' },
  { id: 'awards', label: 'Awards', href: 'awards.html' }
];

var RECENT_NEWS = 6; // shown before "More News"

var MONTHS = {
  January: 0, February: 1, March: 2, April: 3, May: 4, June: 5, July: 6,
  August: 7, September: 8, October: 9, November: 10, December: 11
};

/* Half-filled circle: one icon that reads the same in both themes. */
var THEME_ICON = '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">' +
  '<circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor"/>' +
  '<path fill="currentColor" d="M8 1.5a6.5 6.5 0 0 1 0 13z"/></svg>';

function decodeEmail(email) {
  return email.replace(/ \[dot\] /g, '.').replace(/ \[at\] /g, '@');
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function extLink(href, text) {
  return '<a href="' + href + '" target="_blank" rel="noopener">' + text + '</a>';
}

function highlightAuthor(authors, me) {
  return authors.split(',').map(function (a) {
    var name = a.trim();
    var equal = name.slice(-1) === '*'; // trailing * marks equal contribution
    if (equal) name = name.slice(0, -1);
    return (name === me ? '<span class="me">' + name + '</span>' : name) + (equal ? '<sup>*</sup>' : '');
  }).join(', ');
}

function getVenueAbbr(paper) {
  var abbr = '';
  if (paper.venue) {
    var m = paper.venue.match(/\(([A-Z][A-Za-z]*(?:\s[A-Z][A-Za-z]*)*\s\d{4})\)/);
    if (m) return m[1]; // already contains year e.g. "ICSME 2026"
    abbr = paper.venue.split(/\s+/).slice(0, 2).join(' ');
  } else {
    return paper.status || 'Paper';
  }
  if (paper.year && !/\d{4}$/.test(abbr)) abbr += ' ' + paper.year;
  return abbr;
}

/* "October 2026" -> "10.2026" */
function shortDate(d) {
  var p = d.split(' ');
  if (p.length !== 2 || !(p[0] in MONTHS)) return d;
  var m = MONTHS[p[0]] + 1;
  return (m < 10 ? '0' : '') + m + '.' + p[1];
}

function sortNews(news) {
  return news.slice().sort(function (a, b) {
    var pa = a.date.split(' '), pb = b.date.split(' ');
    return new Date(+pb[1], MONTHS[pb[0]]) - new Date(+pa[1], MONTHS[pa[0]]);
  });
}

document.addEventListener('DOMContentLoaded', function () {
  fetch('data/all.json')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      var page = (document.querySelector('section[data-page]') || { dataset: {} }).dataset.page;
      buildTopbar(data.profile, page);
      buildFooter(data.profile);
      if (document.getElementById('about-content')) renderHome(data);
      if (document.getElementById('news-content')) document.getElementById('news-content').innerHTML = newsList(data.news);
      if (document.getElementById('education-content')) document.getElementById('education-content').innerHTML = educationTimeline(data.education);
      if (document.getElementById('research-content')) renderResearch(data.research, data.profile.name);
      if (document.getElementById('work-content')) document.getElementById('work-content').innerHTML = workTimeline(data.work, true);
      if (document.getElementById('projects-content')) renderProjects(data.projects, data.opensource);
      if (document.getElementById('talks-content')) renderTalks(data.talks);
      if (document.getElementById('services-content')) renderServices(data.services);
      if (document.getElementById('skills-content')) renderSkills(data.skills);
      if (document.getElementById('awards-content')) renderAwards(data.achievements);
      initToggles();
    })
    .catch(function (err) { console.error('Error loading data:', err); });
});

/* ------------------------------------------------------------- top bar + footer */

function buildTopbar(profile, active) {
  var bar = document.getElementById('topbar');
  if (!bar) return;

  var html = '<div class="topbar-inner"><a class="brand" href="index.html">' + esc(profile.name) + '</a>';
  html += '<nav class="site-nav" aria-label="Main"><ul>';
  NAV.forEach(function (n) {
    html += '<li><a href="' + n.href + '"' + (n.id === active ? ' class="active" aria-current="page"' : '') + '>' + n.label + '</a></li>';
  });
  if (profile.cv) html += '<li><a href="' + profile.cv + '" target="_blank">CV</a></li>';
  html += '</ul></nav>';
  html += '<button class="theme-toggle" id="theme-toggle" type="button" aria-label="Toggle dark mode">' + THEME_ICON + '</button></div>';
  bar.innerHTML = html;

  var toggle = document.getElementById('theme-toggle');
  updateThemeTitle(toggle);
  toggle.addEventListener('click', function () {
    var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) { }
    updateThemeTitle(toggle);
  });
}

function updateThemeTitle(btn) {
  var dark = document.documentElement.getAttribute('data-theme') === 'dark';
  btn.setAttribute('title', dark ? 'Switch to light mode' : 'Switch to dark mode');
}

function buildFooter(profile) {
  var footer = document.getElementById('site-footer');
  if (!footer) return;
  var email = decodeEmail(profile.email);
  footer.innerHTML = '<p>' + esc(profile.name) + ' · ' + new Date().getFullYear() +
    ' · <a href="mailto:' + email + '">' + esc(email) + '</a></p>';
}

/* ------------------------------------------------------------- home */

function renderHome(data) {
  var profile = data.profile;
  document.getElementById('about-content').innerHTML =
    '<div class="home">' + profileColumn(profile) +
    '<div class="content">' +
    '<section id="about">' + aboutText(profile) + '</section>' +
    '<section id="news"><h2 class="with-pill">News' +
    (data.news.length > RECENT_NEWS ? ' <button class="pill-btn" type="button" data-news-toggle="news-list">More News</button>' : '') +
    '</h2>' + newsList(data.news, RECENT_NEWS) + '</section>' +
    '<section id="publications"><h2>Selected Publications</h2>' + selectedPubs(data.research, profile.name) + '</section>' +
    '<section id="experience"><h2>Experience</h2>' + workTimeline(data.work, false) + '</section>' +
    '<section id="education"><h2>Education</h2>' + educationTimeline(data.education) + '</section>' +
    '</div></div>';
}

function profileColumn(profile) {
  var parts = (profile.title || '').split('|').map(function (s) { return s.trim(); });
  var role = parts[0] || '';
  var aff = [parts[1], profile.location].filter(Boolean).map(esc).join('<br>');
  var email = decodeEmail(profile.email);

  var html = '<aside class="profile">';
  if (profile.image) {
    var webp = profile.image.replace(/\.(jpe?g|png)$/i, '.webp');
    html += '<div class="photo"><picture><source srcset="' + webp + '" type="image/webp">' +
      '<img src="' + profile.image + '" alt="' + esc(profile.name) + '" width="400" height="480" fetchpriority="high"></picture>';
    if (profile.imagecaption) html += '<p class="caption">' + esc(profile.imagecaption) + '</p>';
    html += '</div>';
  }
  html += '<h1>' + esc(profile.name) + '</h1>';
  html += '<div class="role"><span class="role-title">' + esc(role) + '</span><span class="role-aff">' + aff + '</span></div>';

  html += '<ul class="plain-list">';
  html += '<li class="email"><span class="email-label">Email</span><a href="mailto:' + email + '">' + esc(email) + '</a></li>';
  if (profile.cv) html += '<li><a href="' + profile.cv + '" target="_blank">Curriculum vitae</a></li>';
  if (profile.googlescholar) html += '<li>' + extLink(profile.googlescholar, 'Google Scholar') + '</li>';
  if (profile.github) html += '<li>' + extLink(profile.github, 'GitHub') + '</li>';
  if (profile.linkedin) html += '<li>' + extLink(profile.linkedin, 'LinkedIn') + '</li>';
  if (profile.facultySites && profile.facultySites.length) {
    html += '<li>' + extLink(profile.facultySites[0].url, 'BRAC University profile') + '</li>';
  }
  html += '</ul>';
  return html + '</aside>';
}

function aboutText(profile) {
  var html = '<p class="bio">' + profile.bio + '</p>';
  if (profile.researchInterests && profile.researchInterests.length) {
    html += '<p class="interests"><strong>Research interests:</strong> ' + profile.researchInterests.map(esc).join(', ') + '.</p>';
  }
  if (profile.phdNotice) {
    var m = profile.phdNotice.match(/^([^!]+)!\s*(.*)$/); // "Title! Body"
    var title = m ? m[1] : 'Openings';
    var body = m ? m[2] : profile.phdNotice;
    body = esc(body).replace(/(Fall \d{4})/, '<strong>$1</strong>');
    html += '<div class="note"><div class="note-title">' + esc(title) + '</div><p>' + body + '</p></div>';
  }
  return html;
}

/* ------------------------------------------------------------- news */

/* Link the quoted paper title in a description, unless it already has a link. */
function newsText(item) {
  var d = item.description;
  if (!item.link || /<a\s/i.test(d)) return d;
  var linked = d.replace(/'([^']{8,})'/, function (_, t) { return '‘' + extLink(item.link, t) + '’'; });
  return linked !== d ? linked : extLink(item.link, esc(item.title)) + '. ' + d;
}

function newsList(news, limit) {
  var html = '<ul class="news" id="news-list">';
  sortNews(news).forEach(function (item, i) {
    html += '<li' + (limit && i >= limit ? ' class="extra"' : '') + '><span class="date">' +
      shortDate(item.date) + '</span>' + newsText(item) + '</li>';
  });
  return html + '</ul>';
}

/* ------------------------------------------------------------- publications */

var PEER_REVIEWED = ['conferencePapers', 'journalPapers', 'workshopPapers'];

function selectedPubs(research, me) {
  var peer = [], venues = [];
  PEER_REVIEWED.forEach(function (k) {
    (research[k] || []).forEach(function (p) {
      peer.push(p);
      var v = getVenueAbbr(p).replace(/\s*\d{4}$/, '');
      if (k !== 'workshopPapers' && venues.indexOf(v) < 0) venues.push(v);
    });
  });
  var html = '<div class="pubsum"><div class="note-title">Highlights</div><div class="pubsum-stats">' +
    '<span><b>' + peer.length + '</b> peer-reviewed papers</span></div>' +
    '<p class="pubsum-note">Published at ' + venuesSentence(venues) +
    '. Full list on the <a href="research.html">publications page</a>.</p></div>';

  return html + pubGroup('Peer-reviewed', peer, 'peer', me);
}

function venuesSentence(v) {
  if (v.length < 2) return v.join('');
  return v.slice(0, -1).join(', ') + ', and ' + v[v.length - 1];
}

function pubGroup(title, papers, key, me) {
  var html = '<div class="pubgroup"><h3 class="pubgroup-title">' + esc(title) + '</h3><ol class="bibliography">';
  papers.forEach(function (p, i) { html += paperItem(p, key + '_' + i, me); });
  return html + '</ol></div>';
}

function paperItem(p, id, me) {
  var body = '<div class="pub-title">' + (p.Link ? extLink(p.Link, esc(p.title)) : esc(p.title)) + '</div>';
  body += '<div class="pub-authors">' + highlightAuthor(p.authors, me) + '</div>';
  if (p.venue) body += '<div class="pub-venue">' + esc(p.venue) + '</div>';
  body += '<div class="pub-links">';
  if (p.Link) body += extLink(p.Link, /arxiv\.org/.test(p.Link) ? 'arXiv' : 'paper');
  if (p.pdfLink) body += extLink(p.pdfLink, 'pdf');
  if (p.preprintLink && p.preprintLink !== p.Link) body += extLink(p.preprintLink, 'arXiv');
  if (p.codeLink) body += extLink(p.codeLink, 'code');
  if (p.bibtex) body += '<button class="link-btn" type="button" data-abstract="' + id + '" aria-expanded="false">bibtex</button>';
  body += '</div>';
  if (p.bibtex) {
    body += '<div class="bibtex" id="' + id + '" hidden>' +
      '<button class="copy-btn" type="button" data-copy="' + id + '">copy</button>' +
      '<pre>' + esc(p.bibtex) + '</pre></div>';
  }
  return '<li><div class="pub"><div class="pub-abbr">' + esc(getVenueAbbr(p)) + '</div><div>' + body + '</div></div></li>';
}

function renderResearch(research, me) {
  var sections = [
    { key: 'conferencePapers', label: 'Conference Papers' },
    { key: 'journalPapers', label: 'Journal Papers' },
    { key: 'workshopPapers', label: 'Workshop Papers' },
    { key: 'manuscriptsUnderReview', label: 'Under Review' },
    { key: 'manuscriptsUnderPreparation', label: 'In Preparation' },
    { key: 'preprints', label: 'Preprints' }
  ];
  var html = '<p class="pub-note"><sup>*</sup> Equal contribution</p>';
  sections.forEach(function (sec) {
    var papers = research[sec.key];
    if (!papers || !papers.length) return;
    html += '<h2 class="page-section-title">' + sec.label + '</h2><ol class="bibliography">';
    papers.forEach(function (p, i) { html += paperItem(p, sec.key + '_' + i, me); });
    html += '</ol>';
  });
  document.getElementById('research-content').innerHTML = html;
}

/* ------------------------------------------------------------- timelines */

function workTimeline(work, full) {
  var html = '<ul class="timeline">';
  work.forEach(function (job) {
    html += '<li><b>' + esc(job.title) + '</b> <span class="yrs">' + esc(job.duration) + '</span><br>';
    html += job.companyLink ? extLink(job.companyLink, esc(job.company)) : esc(job.company);
    if (job.department) html += ', ' + esc(job.department);
    if (full) {
      if (job.courses && job.courses.length) {
        html += '<div class="tl-sub">Courses taught</div><ul class="tl-list">';
        job.courses.forEach(function (c) {
          html += '<li>' + esc(c.code) + ': ' + esc(c.name) + ' (' + esc(c.type) + ') <span class="faint">' +
            c.semesters.map(esc).join(', ') + '</span></li>';
        });
        html += '</ul>';
      }
      if (job.responsibilities && job.responsibilities.length) {
        html += '<div class="tl-sub">Responsibilities</div><ul class="tl-list">';
        job.responsibilities.forEach(function (r) { html += '<li>' + esc(r) + '</li>'; });
        html += '</ul>';
      }
      if (!(job.courses && job.courses.length) && job.description) {
        html += '<p class="tl-text">' + job.description + '</p>';
      }
    }
    html += '</li>';
  });
  return html + '</ul>';
}

function educationTimeline(education) {
  var html = '<ul class="timeline">';
  education.forEach(function (edu) {
    html += '<li><b>' + esc(edu.degree) + '</b> <span class="yrs">' + esc(edu.year) + '</span><br>' +
      esc(edu.institution) + ', ' + esc(edu.location);
    if (edu.details) html += '<br>' + esc(edu.details);
    html += '</li>';
  });
  return html + '</ul>';
}

/* ------------------------------------------------------------- other pages */

function row(label, body) {
  return '<li class="row"><div class="row-label">' + esc(label) + '</div><div class="row-body">' + body + '</div></li>';
}

/* Projects page: personal projects, then open source contributions. */
function renderProjects(projects, opensource) {
  var html = '';

  if (projects && projects.length) {
    html += '<h2 class="page-section-title">Personal Projects</h2>';
    projects.forEach(function (pr) {
      html += '<div class="proj"><h3 class="proj-name">' +
        (pr.githubLink ? extLink(pr.githubLink, esc(pr.name)) : esc(pr.name)) + '</h3>';
      var meta = [];
      if (pr.technologies && pr.technologies.length) meta.push('<strong>' + pr.technologies.map(esc).join(', ') + '</strong>');
      if (pr.githubLink) meta.push(extLink(pr.githubLink, 'GitHub'));
      if (meta.length) html += '<p class="proj-meta">' + meta.join(' <span class="sep">·</span> ') + '</p>';
      if (pr.description) html += '<p class="proj-desc">' + esc(pr.description) + '</p>';
      html += '</div>';
    });
  }

  /* Only merged PRs are shown; open ones stay in data/opensource.json until merged. */
  var shown = (opensource || []).map(function (o) {
    return { o: o, prs: o.contributions.filter(function (c) { return c.status === 'merged'; }) };
  }).filter(function (x) { return x.prs.length; });

  if (shown.length) {
    html += '<h2 class="page-section-title">Open Source Contributions</h2>';
    shown.forEach(function (x) {
      html += '<div class="proj"><h3 class="proj-name">' + extLink(x.o.url, esc(x.o.repo)) + '</h3>';
      if (x.o.description) html += '<p class="proj-desc">' + esc(x.o.description) + '</p>';
      html += '<ul class="proj-list">';
      x.prs.forEach(function (c) {
        var refs = c.issue
          ? 'reported in ' + extLink(c.issueUrl, 'issue #' + c.issue) + ', fixed in ' + extLink(c.url, 'PR #' + c.pr)
          : extLink(c.url, 'PR #' + c.pr);
        html += '<li>' + esc(c.text) + ' (' + refs + ')</li>';
      });
      html += '</ul></div>';
    });
  }

  document.getElementById('projects-content').innerHTML = html;
}

function renderTalks(talks) {
  var html = '<ul class="rows">';
  talks.forEach(function (t) {
    var body = '<div class="row-title">' + esc(t.title) + '</div><div class="pub-links">';
    if (t.videoLink) body += extLink(t.videoLink, 'video');
    if (t.slidesLink) body += extLink(t.slidesLink, 'slides');
    if (t.preprintLink) body += extLink(t.preprintLink, 'paper');
    html += row(t.venue || '', body + '</div>');
  });
  document.getElementById('talks-content').innerHTML = html + '</ul>';
}

function renderServices(services) {
  var target = document.getElementById('services-content');
  var keys = services && typeof services === 'object' ? Object.keys(services) : [];
  var rows = '';
  keys.forEach(function (category) {
    var entries = services[category];
    if (!Array.isArray(entries) || !entries.length) return;
    var label = category.replace(/([A-Z])/g, ' $1').replace(/^./, function (c) { return c.toUpperCase(); });
    rows += row(label, entries.map(function (item) {
      var role = item.role ? esc(item.role) : '';
      return '<div>' + (item.link ? extLink(item.link, role) : role) + '</div>';
    }).join(''));
  });
  target.innerHTML = rows ? '<ul class="rows">' + rows + '</ul>' : '<p>No services listed yet.</p>';
}

function renderSkills(skills) {
  var html = '<ul class="rows">';
  if (skills.technicalSkills) {
    Object.keys(skills.technicalSkills).forEach(function (cat) {
      html += row(cat, skills.technicalSkills[cat].map(esc).join(', '));
    });
  }
  if (skills.spokenLanguages) html += row('Spoken Languages', skills.spokenLanguages.map(esc).join(', '));
  document.getElementById('skills-content').innerHTML = html + '</ul>';
}

function renderAwards(achievements) {
  var html = '<ul class="plain">';
  achievements.forEach(function (a) { html += '<li>' + esc(a) + '</li>'; });
  document.getElementById('awards-content').innerHTML = html + '</ul>';
}

/* ------------------------------------------------------------- toggles */

function initToggles() {
  document.querySelectorAll('[data-abstract]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var panel = document.getElementById(btn.getAttribute('data-abstract'));
      panel.hidden = !panel.hidden;
      btn.setAttribute('aria-expanded', String(!panel.hidden));
    });
  });
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = document.getElementById(btn.getAttribute('data-copy')).querySelector('pre').textContent;
      var done = function () {
        btn.textContent = 'copied';
        setTimeout(function () { btn.textContent = 'copy'; }, 1500);
      };
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, function () { });
    });
  });
  document.querySelectorAll('[data-news-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var list = document.getElementById(btn.getAttribute('data-news-toggle'));
      var open = list.classList.toggle('open');
      btn.textContent = open ? 'Less News' : 'More News';
    });
  });
}
