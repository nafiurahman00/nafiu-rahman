/* Minimal-theme renderer: builds the sidebar (navbar + profile) and the
   per-page content from data/all.json. Single source of truth = the JSON. */

var NAV = [
  { id: 'about',     label: 'About',     href: 'index.html' },
  { id: 'news',      label: 'News',      href: 'news.html' },
  { id: 'education', label: 'Education', href: 'education.html' },
  { id: 'research',  label: 'Research',  href: 'research.html' },
  { id: 'work',      label: 'Work',      href: 'work.html' },
  { id: 'projects',  label: 'Projects',  href: 'projects.html' },
  { id: 'talks',     label: 'Talks',     href: 'talks.html' },
  { id: 'skills',    label: 'Skills',    href: 'skills.html' },
  { id: 'awards',    label: 'Awards',    href: 'awards.html' }
];

/* Inline SVG icons — replaces the FontAwesome + Academicons web-font CDNs so
   the page needs no render-blocking icon stylesheets or font downloads. */
var ICON_PATHS = {
  location: ['0 0 384 512', 'M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z'],
  envelope: ['0 0 512 512', 'M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48L48 64zM0 176L0 384c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-208L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z'],
  github:   ['0 0 496 512', 'M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3 .3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5 .3-6.2 2.3zm44.2-1.7c-2.9 .7-4.9 2.6-4.6 4.9 .3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8z'],
  linkedin: ['0 0 448 512', 'M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z'],
  scholar:  ['0 0 512 512', 'M256 411.12L0 202.667 256 0l256 202.667zM256 444.44L93.07 313.78v98.99c0 35.41 72.96 64.13 162.93 64.13s162.93-28.72 162.93-64.13v-98.99z'],
  cv:       ['0 0 384 512', 'M64 0C28.7 0 0 28.7 0 64L0 448c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-288-128 0c-17.7 0-32-14.3-32-32L224 0 64 0zM256 0l0 128 128 0L256 0zM112 256l160 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-160 0c-8.8 0-16-7.2-16-16s7.2-16 16-16zm0 64l160 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-160 0c-8.8 0-16-7.2-16-16s7.2-16 16-16zm0 64l160 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-160 0c-8.8 0-16-7.2-16-16s7.2-16 16-16z'],
  sun:      ['0 0 512 512', 'M361.5 1.2c5 2.1 8.6 6.6 9.6 11.9L391 121l108 19.9c5.3 1 9.8 4.6 11.9 9.6s1.5 10.7-1.6 15.2L446.9 256l62.3 90.3c3.1 4.5 3.7 10.2 1.6 15.2s-6.6 8.6-11.9 9.6L391 391 371.1 499c-1 5.3-4.6 9.8-9.6 11.9s-10.7 1.5-15.2-1.6L256 446.9l-90.3 62.3c-4.5 3.1-10.2 3.7-15.2 1.6s-8.6-6.6-9.6-11.9L121 391 13 371.1c-5.3-1-9.8-4.6-11.9-9.6s-1.5-10.7 1.6-15.2L65.1 256 2.8 165.7c-3.1-4.5-3.7-10.2-1.6-15.2s6.6-8.6 11.9-9.6L121 121 140.9 13c1-5.3 4.6-9.8 9.6-11.9s10.7-1.5 15.2 1.6L256 65.1 346.3 2.8c4.5-3.1 10.2-3.7 15.2-1.6zM160 256a96 96 0 1 1 192 0 96 96 0 1 1 -192 0z'],
  moon:     ['0 0 384 512', 'M223.5 32C100 32 0 132.3 0 256S100 480 223.5 480c60.6 0 115.5-24.2 155.8-63.4 5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6-96.9 0-175.5-78.8-175.5-176 0-65.8 36-123.1 89.3-153.3 6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8z']
};

function icon(name) {
  var p = ICON_PATHS[name];
  if (!p) return '';
  return '<svg class="icon" viewBox="' + p[0] + '" aria-hidden="true" focusable="false">' +
         '<path fill="currentColor" d="' + p[1] + '"/></svg>';
}

function decodeEmail(email) {
  return email.replace(/ \[dot\] /g, '.').replace(/ \[at\] /g, '@');
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function highlightAuthor(authors, me) {
  if (!me) return authors;
  return authors.split(',').map(function (a) {
    return a.trim() === me ? '<strong>' + a.trim() + '</strong>' : a.trim();
  }).join(', ');
}

function getVenueAbbr(paper) {
  var abbr = '';
  if (paper.venue) {
    var m = paper.venue.match(/\(([A-Z][A-Za-z]*(?:\s[A-Z][A-Za-z]*)*\s\d{4})\)/);
    if (m) return m[1]; // already contains year e.g. "ICSME 2026"
    abbr = paper.venue.split(/\s+/).slice(0, 2).join(' ');
  } else if (/arxiv/i.test(paper.paperLink || '')) {
    abbr = 'arXiv';
  }
  if (paper.year && !/\d{4}$/.test(abbr)) abbr += ' ' + paper.year;
  return abbr || paper.status || 'Paper';
}

document.addEventListener('DOMContentLoaded', function () {
  fetch('data/all.json')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      buildSidebar(data.profile);
      var page = (document.querySelector('section[data-page]') || {}).dataset;
      if (document.getElementById('about-content'))   renderAbout(data.profile);
      if (document.getElementById('news-content'))    renderNews(data.news);
      if (document.getElementById('education-content')) renderEducation(data.education);
      if (document.getElementById('research-content')) renderResearch(data.research, data.profile.name);
      if (document.getElementById('work-content'))    renderWork(data.work);
      if (document.getElementById('projects-content')) renderProjects(data.projects);
      if (document.getElementById('talks-content'))   renderTalks(data.talks);
      if (document.getElementById('skills-content'))  renderSkills(data.skills);
      if (document.getElementById('awards-content'))  renderAwards(data.achievements);
      initAbstractToggles();
    })
    .catch(function (err) { console.error('Error loading data:', err); });
});

/* ------------------------------------------------------------- sidebar */

function buildSidebar(profile) {
  var sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  var active = (document.querySelector('section[data-page]') || { dataset: {} }).dataset.page;
  var email = decodeEmail(profile.email);

  var html = '';
  if (profile.image) {
    var webp = profile.image.replace(/\.(jpe?g|png)$/i, '.webp');
    var alt = esc(profile.imagecaption || profile.name);
    html += '<picture>' +
            '<source srcset="' + webp + '" type="image/webp">' +
            '<img class="profile-photo" src="' + profile.image + '" alt="' + alt +
            '" width="400" height="403" loading="eager" decoding="async" fetchpriority="high">' +
            '</picture>';
  }
  if (profile.imagecaption) {
    html += '<p class="photo-caption">' + esc(profile.imagecaption) + '</p>';
  }
  html += '<h1 class="site-title"><a href="index.html">' + esc(profile.name) + '</a></h1>';
  html += '<p class="tagline">' + esc(profile.title) + '</p>';
  if (profile.location) {
    html += '<p class="location">' + icon('location') + esc(profile.location) + '</p>';
  }

  html += '<nav class="site-nav"><ul>';
  NAV.forEach(function (n) {
    html += '<li><a href="' + n.href + '"' + (n.id === active ? ' class="active"' : '') + '>' + n.label + '</a></li>';
  });
  html += '</ul></nav>';

  html += '<div class="social-links">';
  if (profile.cv)            html += '<a href="' + profile.cv + '" target="_blank" title="CV">' + icon('cv') + '</a>';
  html += '<a href="mailto:' + email + '" title="Email">' + icon('envelope') + '</a>';
  if (profile.github)        html += '<a href="' + profile.github + '" target="_blank" rel="noopener" title="GitHub">' + icon('github') + '</a>';
  if (profile.linkedin)      html += '<a href="' + profile.linkedin + '" target="_blank" rel="noopener" title="LinkedIn">' + icon('linkedin') + '</a>';
  if (profile.googlescholar) html += '<a href="' + profile.googlescholar + '" target="_blank" rel="noopener" title="Google Scholar">' + icon('scholar') + '</a>';
  html += '<button class="theme-toggle" id="theme-toggle" type="button" title="Toggle dark mode" aria-label="Toggle dark mode"></button>';
  html += '</div>';
  html += '<div class="contact-note">' + esc(email) + '</div>';

  html += '<div class="sidebar-footer">&copy; ' + new Date().getFullYear() + ' ' + esc(profile.name) +
          '<br>Styled after the <a href="https://github.com/pages-themes/minimal" target="_blank" rel="noopener">minimal</a> theme.</div>';

  sidebar.innerHTML = html;

  var toggle = document.getElementById('theme-toggle');
  if (toggle) {
    updateThemeIcon(toggle);
    toggle.addEventListener('click', function () {
      var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      updateThemeIcon(toggle);
    });
  }
}

function updateThemeIcon(btn) {
  var dark = document.documentElement.getAttribute('data-theme') === 'dark';
  btn.innerHTML = dark ? icon('sun') : icon('moon');
  btn.setAttribute('title', dark ? 'Switch to light mode' : 'Switch to dark mode');
}

/* ------------------------------------------------------------- pages */

function renderAbout(profile) {
  var html = '';
  if (profile.phdNotice) {
    html += '<blockquote><p><strong>' + esc(profile.phdNotice) + '</strong></p></blockquote>';
  }
  if (profile.researchInterests && profile.researchInterests.length) {
    html += '<h3>Major Research Interests</h3><ul>';
    profile.researchInterests.forEach(function (i) { html += '<li>' + esc(i) + '</li>'; });
    html += '</ul>';
  }
  html += '<p>' + profile.bio + '</p>';
  if (profile.facultySites && profile.facultySites.length) {
    html += '<p>Working as a <strong>Lecturer at BRAC University, CSE Department.</strong> ';
    html += profile.facultySites.map(function (s) {
      return '<a href="' + s.url + '" target="_blank" rel="noopener">(' + esc(s.label) + ')</a>';
    }).join(' ');
    html += '</p>';
  }
  document.getElementById('about-content').innerHTML = html;
}

function renderNews(news) {
  var months = { January:0, February:1, March:2, April:3, May:4, June:5, July:6,
                 August:7, September:8, October:9, November:10, December:11 };
  news.sort(function (a, b) {
    var pa = a.date.split(' '), pb = b.date.split(' ');
    return new Date(+pb[1], months[pb[0]]) - new Date(+pa[1], months[pa[0]]);
  });

  var html = '<div class="news-list">';
  news.forEach(function (item) {
    html += '<div class="news-item">';
    html += '<div class="news-date"><span class="badge">' + esc(item.date) + '</span></div>';
    html += '<div class="news-body">';
    if (item.link) {
      html += '<a href="' + item.link + '" target="_blank" rel="noopener"><strong>' + esc(item.title) + '</strong></a> — ';
    } else {
      html += '<strong>' + esc(item.title) + '</strong> — ';
    }
    html += item.description + '</div></div>';
  });
  html += '</div>';
  document.getElementById('news-content').innerHTML = html;
}

function renderEducation(education) {
  var html = '';
  education.forEach(function (edu) {
    html += '<div class="edu-entry">';
    html += '<div class="edu-head"><h3 class="edu-degree">' + esc(edu.degree) + '</h3>' +
            '<span class="badge outline">' + esc(edu.year) + '</span></div>';
    html += '<div class="edu-inst">' + esc(edu.institution) + ', ' + esc(edu.location) + '</div>';
    if (edu.details) html += '<div class="edu-detail"><span class="badge">' + esc(edu.details) + '</span></div>';
    html += '</div>';
  });
  document.getElementById('education-content').innerHTML = html;
}

function renderResearch(research, me) {
  var sections = [
    { key: 'conferencePapers',           label: 'Conference Publications' },
    { key: 'journalPapers',              label: 'Journal Publications' },
    { key: 'manuscriptsUnderReview',     label: 'Manuscripts Under Review' },
    { key: 'manuscriptsUnderPreparation', label: 'Manuscripts Under Preparation' },
    { key: 'preprints',                  label: 'Preprints' }
  ];
  var html = '';
  sections.forEach(function (sec) {
    var papers = research[sec.key];
    if (!papers || !papers.length) return;
    html += '<h2 class="section-title">' + sec.label + '</h2><ol class="pub-list">';
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
  var html = '<li class="pub-item">';
  html += '<div class="pub-abbr"><span class="badge">' + esc(getVenueAbbr(p)) + '</span></div>';
  html += '<div class="pub-main" id="' + id + '">';
  html += '<div class="pub-title">' + (p.paperLink
    ? '<a href="' + p.paperLink + '" target="_blank" rel="noopener">' + esc(p.title) + '</a>'
    : esc(p.title)) + '</div>';
  html += '<div class="pub-authors">' + highlightAuthor(p.authors, me) + '</div>';
  if (p.venue) {
    html += '<div class="pub-venue">' + esc(p.venue) + '</div>';
  } else if (p.status) {
    html += '<div class="pub-venue">' + esc(p.status) + '</div>';
  }
  html += '<div class="pub-links">';
  if (p.description) html += '<a class="btn abstract-toggle" role="button">Abstract</a>';
  if (p.codeLink)    html += '<a class="btn" href="' + p.codeLink + '" target="_blank" rel="noopener">Code</a>';
  if (p.paperLink)   html += '<a class="btn" href="' + p.paperLink + '" target="_blank" rel="noopener">Paper</a>';
  html += '</div>';
  if (p.description) html += '<div class="abstract hidden"><p>' + esc(p.description) + '</p></div>';
  html += '</div></li>';
  return html;
}

function renderWork(work) {
  var html = '';
  work.forEach(function (job) {
    html += '<div class="work-entry">';
    html += '<div class="work-head"><h3 class="work-title">' + esc(job.title) + '</h3>' +
            '<span class="badge outline">' + esc(job.duration) + '</span></div>';
    html += '<div class="work-company">';
    html += job.companyLink
      ? '<a href="' + job.companyLink + '" target="_blank" rel="noopener">' + esc(job.company) + '</a>'
      : '<strong>' + esc(job.company) + '</strong>';
    if (job.department) html += ', ' + esc(job.department);
    html += '</div>';

    if (job.courses && job.courses.length) {
      html += '<div class="work-subhead">Courses Taught</div>';
      job.courses.forEach(function (c) {
        html += '<div class="course-item"><div class="course-name"><strong>' + esc(c.code) + ': ' +
                esc(c.name) + '</strong> <span class="tag tag-muted">' + esc(c.type) + '</span></div>';
        html += '<div class="tag-row">' + c.semesters.map(function (s) {
          return '<span class="tag">' + esc(s) + '</span>';
        }).join('') + '</div></div>';
      });
    }
    if (job.responsibilities && job.responsibilities.length) {
      html += '<div class="work-subhead">Responsibilities</div><ul>';
      job.responsibilities.forEach(function (r) { html += '<li>' + esc(r) + '</li>'; });
      html += '</ul>';
    }
    if (!(job.courses && job.courses.length) && job.description) {
      html += '<p>' + job.description + '</p>';
    }
    html += '</div>';
  });
  document.getElementById('work-content').innerHTML = html;
}

function renderProjects(projects) {
  var html = '<ul class="project-list">';
  projects.forEach(function (pr, i) {
    html += '<li><span class="proj-title">' + esc(pr.name) + '</span>';
    if (pr.technologies && pr.technologies.length) {
      html += ' <span class="proj-tech">(' + pr.technologies.map(esc).join(', ') + ')</span>';
    }
    html += '<div class="pub-links">';
    if (pr.description) html += '<a class="btn abstract-toggle" role="button">Summary</a>';
    if (pr.githubLink)  html += '<a class="btn" href="' + pr.githubLink + '" target="_blank" rel="noopener">GitHub</a>';
    html += '</div>';
    if (pr.description) html += '<div class="abstract hidden"><p>' + esc(pr.description) + '</p></div>';
    html += '</li>';
  });
  html += '</ul>';
  document.getElementById('projects-content').innerHTML = html;
}

function renderTalks(talks) {
  var html = '<ul class="talk-list">';
  talks.forEach(function (t) {
    html += '<li><strong>' + esc(t.title) + '</strong>';
    if (t.venue) html += ' — ' + esc(t.venue);
    html += '<div class="pub-links">';
    if (t.videoLink)  html += '<a class="btn" href="' + t.videoLink + '" target="_blank" rel="noopener">Video</a>';
    if (t.slidesLink) html += '<a class="btn" href="' + t.slidesLink + '" target="_blank" rel="noopener">Slides</a>';
    if (t.paperLink)  html += '<a class="btn" href="' + t.paperLink + '" target="_blank" rel="noopener">Paper</a>';
    html += '</div></li>';
  });
  html += '</ul>';
  document.getElementById('talks-content').innerHTML = html;
}

function renderSkills(skills) {
  var html = '';
  if (skills.technicalSkills) {
    Object.keys(skills.technicalSkills).forEach(function (cat) {
      html += '<div class="skill-group"><h3>' + esc(cat) + '</h3><div class="tag-row">';
      skills.technicalSkills[cat].forEach(function (s) { html += '<span class="tag">' + esc(s) + '</span>'; });
      html += '</div></div>';
    });
  }
  if (skills.spokenLanguages) {
    html += '<div class="skill-group"><h3>Spoken Languages</h3><div class="tag-row">';
    skills.spokenLanguages.forEach(function (l) { html += '<span class="tag">' + esc(l) + '</span>'; });
    html += '</div></div>';
  }
  document.getElementById('skills-content').innerHTML = html;
}

function renderAwards(achievements) {
  var html = '<ul class="award-list">';
  achievements.forEach(function (a) { html += '<li>' + esc(a) + '</li>'; });
  html += '</ul>';
  document.getElementById('awards-content').innerHTML = html;
}

/* ------------------------------------------------------------- abstract toggle */

function initAbstractToggles() {
  document.querySelectorAll('a.abstract-toggle').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var item = link.closest('.pub-main, li');
      var panel = item && item.querySelector('.abstract');
      if (panel) panel.classList.toggle('open');
    });
  });
}
