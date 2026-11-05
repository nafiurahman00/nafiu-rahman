/* Renderer: builds the top bar, footer and the per-page content from
   data/all.json. Single source of truth = the JSON. */

var NAV = [
  { id: 'about', label: 'About', href: 'index.html' },
  { id: 'news', label: 'News', href: 'news.html' },
  { id: 'research', label: 'Publications', href: 'research.html' },
  { id: 'education', label: 'Education', href: 'education.html' },
  { id: 'work', label: 'Work', href: 'work.html' },
  { id: 'projects', label: 'Projects', href: 'projects.html' },
  { id: 'talks', label: 'Talks', href: 'talks.html' },
  { id: 'services', label: 'Services', href: 'services.html' },
  { id: 'skills', label: 'Skills', href: 'skills.html' },
  { id: 'awards', label: 'Awards', href: 'awards.html' }
];

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

/* The site's one list layout: a label in the margin, the content beside it. */
function row(label, body, id) {
  return '<li class="row"><div class="row-label">' + esc(label) + '</div>' +
    '<div class="row-body"' + (id ? ' id="' + id + '"' : '') + '>' + body + '</div></li>';
}

function abstractToggle(label) {
  return '<button class="abstract-toggle" type="button" aria-expanded="false">' + label + '</button>';
}

function abstractPanel(text) {
  return '<div class="abstract" hidden><p>' + esc(text) + '</p></div>';
}

function highlightAuthor(authors, me) {
  if (!me) return authors;
  return authors.split(',').map(function (a) {
    var name = a.trim();
    var equal = name.slice(-1) === '*'; // trailing * marks equal contribution
    if (equal) name = name.slice(0, -1);
    return (name === me ? '<strong>' + name + '</strong>' : name) + (equal ? '<sup>*</sup>' : '');
  }).join(', ');
}

function getVenueAbbr(paper) {
  var abbr = '';
  if (paper.venue) {
    var m = paper.venue.match(/\(([A-Z][A-Za-z]*(?:\s[A-Z][A-Za-z]*)*\s\d{4})\)/);
    if (m) return m[1]; // already contains year e.g. "ICSME 2026"
    abbr = paper.venue.split(/\s+/).slice(0, 2).join(' ');
  } else if (/arxiv/i.test(paper.Link || '')) {
    abbr = 'arXiv';
  }
  if (paper.year && !/\d{4}$/.test(abbr)) abbr += ' ' + paper.year;
  return abbr || paper.status || 'Paper';
}

document.addEventListener('DOMContentLoaded', function () {
  fetch('data/all.json')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      var page = (document.querySelector('section[data-page]') || { dataset: {} }).dataset.page;
      buildTopbar(data.profile, page);
      buildFooter(data.profile, page);
      if (document.getElementById('about-content')) renderAbout(data.profile);
      if (document.getElementById('recent-news')) renderNews(data.news, 'recent-news', RECENT_NEWS);
      if (document.getElementById('news-content')) renderNews(data.news, 'news-content');
      if (document.getElementById('education-content')) renderEducation(data.education);
      if (document.getElementById('research-content')) renderResearch(data.research, data.profile.name);
      if (document.getElementById('work-content')) renderWork(data.work);
      if (document.getElementById('projects-content')) renderProjects(data.projects);
      if (document.getElementById('talks-content')) renderTalks(data.talks);
      if (document.getElementById('services-content')) renderServices(data.services);
      if (document.getElementById('skills-content')) renderSkills(data.skills);
      if (document.getElementById('awards-content')) renderAwards(data.achievements);
      initAbstractToggles();
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

function profileLinks(profile) {
  var html = '';
  if (profile.cv) html += '<a href="' + profile.cv + '" target="_blank">CV</a>';
  html += '<a href="mailto:' + decodeEmail(profile.email) + '">Email</a>';
  if (profile.github) html += extLink(profile.github, 'GitHub');
  if (profile.linkedin) html += extLink(profile.linkedin, 'LinkedIn');
  if (profile.googlescholar) html += extLink(profile.googlescholar, 'Google Scholar');
  return html;
}

function contactLine(profile) {
  return [profile.location, decodeEmail(profile.email)].filter(Boolean).map(esc).join(' · ');
}

/* The home page shows the links and contact line at the top instead. */
function buildFooter(profile, active) {
  var footer = document.getElementById('site-footer');
  if (!footer) return;
  var html = '';
  if (active !== 'about') {
    html += '<p class="slashed">' + profileLinks(profile) + '</p>' +
      '<p>' + esc(profile.title) + ' · ' + contactLine(profile) + '</p>';
  }
  footer.innerHTML = html + '<p>&copy; ' + new Date().getFullYear() + ' ' + esc(profile.name) + '</p>';
}

/* ------------------------------------------------------------- pages */

function renderAbout(profile) {
  var text = '<h1 class="site-name">' + esc(profile.name) + '</h1>';
  text += '<p class="site-role">' + esc(profile.title) + '</p>';
  text += '<p class="site-role">' + contactLine(profile) + '</p>';
  text += '<p class="site-links slashed">' + profileLinks(profile) + '</p>';

  if (profile.phdNotice) text += '<p class="notice">' + esc(profile.phdNotice) + '</p>';
  text += '<p>' + profile.bio + '</p>';
  if (profile.researchInterests && profile.researchInterests.length) {
    text += '<p><strong>Major Research Interests:</strong> ' + profile.researchInterests.map(esc).join(', ') + '</p>';
  }
  if (profile.facultySites && profile.facultySites.length) {
    text += '<p>Working as a <strong>Lecturer at BRAC University, CSE Department.</strong> ';
    text += profile.facultySites.map(function (s) {
      return '<span class="nowrap">' + extLink(s.url, '(' + esc(s.label) + ')') + '</span>';
    }).join(' ');
    text += '</p>';
  }
  text += '<p>All my publications can be seen <a href="research.html">here</a>.</p>';

  var photo = '';
  if (profile.image) {
    var webp = profile.image.replace(/\.(jpe?g|png)$/i, '.webp');
    var alt = esc(profile.imagecaption || profile.name);
    photo = '<figure class="portrait"><picture>' +
      '<source srcset="' + webp + '" type="image/webp">' +
      '<img src="' + profile.image + '" alt="' + alt +
      '" width="400" height="403" loading="eager" decoding="async" fetchpriority="high">' +
      '</picture>';
    if (profile.imagecaption) photo += '<figcaption>' + esc(profile.imagecaption) + '</figcaption>';
    photo += '</figure>';
  }

  document.getElementById('about-content').innerHTML =
    '<div class="about"><div class="about-text">' + text + '</div>' + photo + '</div>' +
    '<h2 class="section-title">Recent News</h2><div id="recent-news"></div>' +
    '<p class="more"><a href="news.html">All news</a></p>';
}

var RECENT_NEWS = 4; // items shown on the home page

function renderNews(news, targetId, limit) {
  var months = {
    January: 0, February: 1, March: 2, April: 3, May: 4, June: 5, July: 6,
    August: 7, September: 8, October: 9, November: 10, December: 11
  };
  news.sort(function (a, b) {
    var pa = a.date.split(' '), pb = b.date.split(' ');
    return new Date(+pb[1], months[pb[0]]) - new Date(+pa[1], months[pa[0]]);
  });

  var html = '<ul class="rows">';
  news.slice(0, limit).forEach(function (item) {
    var title = item.link ? extLink(item.link, esc(item.title)) : esc(item.title);
    html += row(item.date, '<p class="entry-text"><strong>' + title + '</strong> — ' + item.description + '</p>');
  });
  html += '</ul>';
  document.getElementById(targetId).innerHTML = html;
}

function renderEducation(education) {
  var html = '<ul class="rows">';
  education.forEach(function (edu) {
    var body = '<h2 class="entry-title">' + esc(edu.degree) + '</h2>';
    body += '<p class="entry-sub">' + esc(edu.institution) + ', ' + esc(edu.location) + '</p>';
    if (edu.details) body += '<p class="entry-sub">' + esc(edu.details) + '</p>';
    html += row(edu.year, body);
  });
  html += '</ul>';
  document.getElementById('education-content').innerHTML = html;
}

function renderResearch(research, me) {
  var sections = [
    { key: 'conferencePapers', label: 'Conference Publications' },
    { key: 'workshopPapers', label: 'Workshop Publications' },
    { key: 'journalPapers', label: 'Journal Publications' },
    { key: 'manuscriptsUnderReview', label: 'Manuscripts Under Review' },
    { key: 'manuscriptsUnderPreparation', label: 'Manuscripts Under Preparation' },
    { key: 'preprints', label: 'Preprints' }
  ];
  var html = '<p class="pub-status"><sup>*</sup> Equal contribution</p>';
  sections.forEach(function (sec) {
    var papers = research[sec.key];
    if (!papers || !papers.length) return;
    html += '<h2 class="section-title">' + sec.label + '</h2><ol class="rows pubs">';
    papers.forEach(function (p, i) { html += paperItem(p, sec.key + '_' + i, me); });
    html += '</ol>';
  });
  document.getElementById('research-content').innerHTML = html;

  // var wc = document.getElementById('research-wordcloud');
  // if (wc) {
  //   wc.innerHTML = '<div class="wordcloud"><h2 class="section-title">Research Themes</h2>' +
  //     '<p>A wordcloud generated from the introductions of my peer-reviewed papers and arXiv preprints.</p>' +
  //     '<img src="img/research_wordcloud.png" alt="Research wordcloud"></div>';
  // }
}

function paperItem(p, id, me) {
  var body = '<div class="entry-title">' + (p.Link ? extLink(p.Link, esc(p.title)) : esc(p.title)) + '</div>';
  body += '<p class="entry-sub">' + highlightAuthor(p.authors, me) + '</p>';
  if (p.venue) {
    body += '<p class="entry-sub venue">' + esc(p.venue) + '</p>';
  } else if (p.status) {
    body += '<p class="entry-sub venue">' + esc(p.status) + '</p>';
  }
  body += '<div class="entry-links slashed">';
  if (p.description) body += abstractToggle('Abstract');
  if (p.codeLink) body += extLink(p.codeLink, 'Code');
  if (p.pdfLink) body += extLink(p.pdfLink, 'PDF');
  if (p.preprintLink) body += extLink(p.preprintLink, 'Preprint');
  body += '</div>';
  if (p.description) body += abstractPanel(p.description);
  return row(getVenueAbbr(p), body, id);
}

function renderWork(work) {
  var html = '<ul class="rows">';
  work.forEach(function (job) {
    var body = '<h2 class="entry-title">' + esc(job.title) + '</h2>';
    body += '<p class="entry-sub">' + (job.companyLink ? extLink(job.companyLink, esc(job.company)) : esc(job.company));
    if (job.department) body += ', ' + esc(job.department);
    body += '</p>';

    if (job.courses && job.courses.length) {
      body += '<div class="entry-subhead">Courses Taught</div><ul class="plain courses">';
      job.courses.forEach(function (c) {
        body += '<li>' + esc(c.code) + ': ' + esc(c.name) + ' · ' + esc(c.type) +
          '<p class="entry-sub">' + c.semesters.map(esc).join(', ') + '</p></li>';
      });
      body += '</ul>';
    }
    if (job.responsibilities && job.responsibilities.length) {
      body += '<div class="entry-subhead">Responsibilities</div><ul class="entry-list">';
      job.responsibilities.forEach(function (r) { body += '<li>' + esc(r) + '</li>'; });
      body += '</ul>';
    }
    if (!(job.courses && job.courses.length) && job.description) {
      body += '<p class="entry-text">' + job.description + '</p>';
    }
    html += row(job.duration, body);
  });
  html += '</ul>';
  document.getElementById('work-content').innerHTML = html;
}

function renderProjects(projects) {
  var html = '<ul class="rows">';
  projects.forEach(function (pr) {
    var body = '<div class="entry-title">' + esc(pr.name) + '</div><div class="entry-links slashed">';
    if (pr.description) body += abstractToggle('Summary');
    if (pr.githubLink) body += extLink(pr.githubLink, 'GitHub');
    body += '</div>';
    if (pr.description) body += abstractPanel(pr.description);
    html += row((pr.technologies || []).join(', '), body);
  });
  html += '</ul>';
  document.getElementById('projects-content').innerHTML = html;
}

function renderTalks(talks) {
  var html = '<ul class="rows">';
  talks.forEach(function (t) {
    var body = '<div class="entry-title">' + esc(t.title) + '</div><div class="entry-links slashed">';
    if (t.videoLink) body += extLink(t.videoLink, 'Video');
    if (t.slidesLink) body += extLink(t.slidesLink, 'Slides');
    if (t.preprintLink) body += extLink(t.preprintLink, 'Paper');
    body += '</div>';
    html += row(t.venue || '', body);
  });
  html += '</ul>';
  document.getElementById('talks-content').innerHTML = html;
}

function renderServices(services) {
  if (!services || typeof services !== 'object') {
    document.getElementById('services-content').innerHTML = '<p>No services listed yet.</p>';
    return;
  }

  var keys = Object.keys(services);
  if (!keys.length) {
    document.getElementById('services-content').innerHTML = '<p>No services listed yet.</p>';
    return;
  }

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

  document.getElementById('services-content').innerHTML =
    rows ? '<ul class="rows">' + rows + '</ul>' : '<p>No services listed yet.</p>';
}

function renderSkills(skills) {
  var html = '<ul class="rows">';
  if (skills.technicalSkills) {
    Object.keys(skills.technicalSkills).forEach(function (cat) {
      html += row(cat, skills.technicalSkills[cat].map(esc).join(', '));
    });
  }
  if (skills.spokenLanguages) {
    html += row('Spoken Languages', skills.spokenLanguages.map(esc).join(', '));
  }
  html += '</ul>';
  document.getElementById('skills-content').innerHTML = html;
}

function renderAwards(achievements) {
  var html = '<ul class="plain">';
  achievements.forEach(function (a) { html += '<li>' + esc(a) + '</li>'; });
  html += '</ul>';
  document.getElementById('awards-content').innerHTML = html;
}

/* ------------------------------------------------------------- abstract toggle */

function initAbstractToggles() {
  document.querySelectorAll('.abstract-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var panel = btn.closest('li').querySelector('.abstract');
      panel.hidden = !panel.hidden;
      btn.setAttribute('aria-expanded', String(!panel.hidden));
    });
  });
}
