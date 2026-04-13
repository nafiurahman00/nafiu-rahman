// Toggle abstract/collapsible display
function toggleSection(elementId) {
	var el = document.getElementById(elementId);
	if (el) {
		el.style.display = el.style.display === 'none' ? 'block' : 'none';
	}
}

// Load all data from JSON files
document.addEventListener('DOMContentLoaded', function() {
	Promise.all([
		fetch('data/profile.json').then(res => res.json()),
		fetch('data/research.json').then(res => res.json()),
		fetch('data/projects.json').then(res => res.json()),
		fetch('data/education.json').then(res => res.json()),
		fetch('data/work.json').then(res => res.json()),
		fetch('data/achievements.json').then(res => res.json()),
		fetch('data/skills.json').then(res => res.json()),
		fetch('data/talks.json').then(res => res.json()),
		fetch('data/coursework.json').then(res => res.json())
	]).then(([profile, research, projects, education, work, achievements, skills, talks, coursework]) => {
		populateProfile(profile);
		populateEducation(education);
		populateResearch(research);
		populateWorkExperience(work);
		populateProjects(projects);
		populateTalks(talks);
		populateSkills(skills);
		populateAchievements(achievements);
		populateCoursework(coursework);
	}).catch(error => {
		console.error('Error loading data:', error);
	});
});

// ==================== PROFILE ====================
function populateProfile(profile) {
	document.getElementById('profile-name').textContent = profile.name;

	if (profile.image) {
		document.getElementById('profile-image').src = profile.image;
	}

	var bioHtml = '<p align="justify">';

	// PhD notice (dark blue bold, a.html style)
	if (profile.phdNotice) {
		bioHtml += '<span style="color: darkblue;"><b>' + profile.phdNotice + '</b></span><br><br>';
	}

	// Research interests
	if (profile.researchInterests && profile.researchInterests.length > 0) {
		bioHtml += '<b style="color:#1772d0;">Major Research Interests:</b>';
		bioHtml += '<ul>';
		profile.researchInterests.forEach(function(interest) {
			bioHtml += '<li>' + interest + '</li>';
		});
		bioHtml += '</ul>';
	}

	// Main bio
	bioHtml += profile.bio + '<br>';

	// Lecturer faculty site links
	if (profile.facultySites && profile.facultySites.length > 0) {
		bioHtml += 'Working as a <b>Lecturer here at Brac University CSE Department.</b> <b>';
		profile.facultySites.forEach(function(site, i) {
			bioHtml += '<a href="' + site.url + '" target="_blank">(' + site.label + ')</a>';
			if (i < profile.facultySites.length - 1) bioHtml += ' ';
		});
		bioHtml += '</b>';
	}

	bioHtml += '</p>';
	document.getElementById('profile-bio-content').innerHTML = bioHtml;

	// Build nav-style links
	var linksHtml = '';
	linksHtml += '<a href="mailto:' + profile.email.replace(/ \[dot\] /g, '.').replace(/ \[at\] /g, '@') + '">Email</a> &nbsp/&nbsp ';
	if (profile.cv) {
		linksHtml += '<a href="' + profile.cv + '" target="_blank">Resume</a> &nbsp/&nbsp ';
	}
	linksHtml += '<a href="' + profile.googlescholar + '" target="_blank">Google Scholar</a> <br>';
	linksHtml += '<a href="' + profile.github + '" target="_blank">GitHub</a> &nbsp/&nbsp ';
	linksHtml += '<a href="' + profile.linkedin + '" target="_blank">LinkedIn</a> <br>';
	linksHtml += '<a href="#Education">Education</a> &nbsp/&nbsp ';
	linksHtml += '<a href="#Research">Research</a> &nbsp/&nbsp ';
	linksHtml += '<a href="#Work Experience">Work Experience</a> &nbsp/&nbsp ';
	linksHtml += '<a href="#Technical Skill">Technical Skill</a> <br>';
	linksHtml += '<a href="#Honors &amp; Awards">Honors &amp; Awards</a> &nbsp/&nbsp ';
	linksHtml += '<a href="#Projects">Notable Projects</a> &nbsp/&nbsp ';
	linksHtml += '<a href="#Talks">Talks</a> &nbsp/&nbsp ';
	linksHtml += '<a href="#Relevant Academic Coursework">Coursework</a>';
	document.getElementById('profile-links').innerHTML = linksHtml;
}

// ==================== EDUCATION ====================
function populateEducation(education) {
	var html = '';
	education.forEach(function(edu) {
		html += '<p align="justify">';
		html += '<b>' + edu.degree + '</b>';
		html += ' [' + edu.year + '] <br>';
		html += '<a href="#">' + edu.institution + ', ' + edu.location + '</a> <br>';
		html += edu.details;
		if (edu.coursework) {
			html += '<br><i>Coursework: ' + edu.coursework + '</i>';
		}
		html += '</p>';
	});
	document.getElementById('education-content').innerHTML = html;
}

// ==================== RESEARCH ====================
function populateResearch(research) {
	var html = '';
	var counter = 0;

	// Conference Papers
	if (research.conferencePapers && research.conferencePapers.length > 0) {
		html += '<p align="justify"><b>Conference Publication</b> <br>';
		html += '<ul>';
		research.conferencePapers.forEach(function(paper) {
			html += buildPaperItem(paper, counter++);
		});
		html += '</ul></p>';
	}

	// Journal Papers
	if (research.journalPapers && research.journalPapers.length > 0) {
		html += '<p align="justify"><b>Journal Publication</b> <br>';
		html += '<ul>';
		research.journalPapers.forEach(function(paper) {
			html += buildPaperItem(paper, counter++);
		});
		html += '</ul></p>';
	}

	// Manuscripts Under Review
	if (research.manuscriptsUnderReview && research.manuscriptsUnderReview.length > 0) {
		html += '<p align="justify"><b>Manuscript Under Review</b> <br>';
		html += '<ul>';
		research.manuscriptsUnderReview.forEach(function(paper) {
			html += buildPaperItem(paper, counter++);
		});
		html += '</ul></p>';
	}

	// Manuscripts Under Preparation
	if (research.manuscriptsUnderPreparation && research.manuscriptsUnderPreparation.length > 0) {
		html += '<p align="justify"><b>Manuscript Under Preparation</b> <br>';
		html += '<ul>';
		research.manuscriptsUnderPreparation.forEach(function(paper) {
			html += buildPaperItem(paper, counter++);
		});
		html += '</ul></p>';
	}

	// Preprints
	if (research.preprints && research.preprints.length > 0) {
		html += '<p align="justify"><b>Preprints</b> <br>';
		html += '<ul>';
		research.preprints.forEach(function(paper) {
			html += buildPaperItem(paper, counter++);
		});
		html += '</ul></p>';
	}

	document.getElementById('research-content').innerHTML = html;
}

function buildPaperItem(paper, index) {
	var absId = 'paper_abs_' + index;
	var html = '<li>';

	// Title
	if (paper.paperLink) {
		html += '<b><a href="' + paper.paperLink + '" target="_blank">' + paper.title + '</a></b>';
	} else {
		html += '<b style="color:#1772d0;">' + paper.title + '</b>';
	}
	html += '<br>';

	// Details sub-list
	html += '<ul>';
	html += '<li>' + paper.authors + '</li>';

	if (paper.venue) {
		html += '<li>' + paper.venue;
		if (paper.status) {
			html += ' — <b>' + paper.status + '</b>';
		}
		html += '</li>';
	} else if (paper.status) {
		html += '<li><b>' + paper.status + '</b></li>';
	}

	// Links row
	html += '<li>';
	html += '[<a href="#" onclick="toggleSection(\'' + absId + '\'); return false;">abstract</a>]';
	if (paper.codeLink) {
		html += ' [<a href="' + paper.codeLink + '" target="_blank">code</a>]';
	}
	if (paper.paperLink) {
		html += ' [<a href="' + paper.paperLink + '" target="_blank">paper</a>]';
	}
	html += '</li>';

	html += '</ul>';

	// Abstract
	html += '<div id="' + absId + '" class="abstract-content">';
	html += '<p>' + paper.description + '</p>';
	html += '</div>';

	html += '</li><br>';
	return html;
}

// ==================== WORK EXPERIENCE ====================
function populateWorkExperience(work) {
	var html = '';
	work.forEach(function(job, idx) {
		html += '<p align="justify">';
		html += '<b>' + job.title + ', ' + job.department + '</b> [' + job.duration + '] <br>';
		if (job.companyLink) {
			html += '<b><a href="' + job.companyLink + '">' + job.company + '</a></b> <br><br>';
		} else {
			html += '<b>' + job.company + '</b> <br><br>';
		}

		// Courses with semester detail
		if (job.courses && job.courses.length > 0) {
			html += '<b>Courses Currently Teaching and Previously Taught</b> :';
			html += '<ul>';
			job.courses.forEach(function(course) {
				html += '<li>' + course.code + ' : <b>' + course.name + '</b> [' + course.type + '] <br>';
				html += 'Semesters : ' + course.semesters.join(', ');
				html += '</li>';
			});
			html += '</ul>';
		}

		// Responsibilities
		if (job.responsibilities && job.responsibilities.length > 0) {
			html += '<b>Responsibilities</b> :';
			html += '<ul>';
			job.responsibilities.forEach(function(resp) {
				html += '<li>' + resp + '</li>';
			});
			html += '</ul>';
		}

		// Fallback description (for non-lecturer roles)
		if (!job.courses && job.description) {
			html += job.description;
		}

		html += '</p>';

		// Divider between jobs
		if (idx < work.length - 1) {
			html += '<hr class="section-divider">';
		}
	});
	document.getElementById('work-experience-content').innerHTML = html;
}

// ==================== PROJECTS ====================
function populateProjects(projects) {
	var html = '<p align="justify"><ul>';
	projects.forEach(function(project, index) {
		var summaryId = 'project_summary_' + index;
		html += '<li>';
		html += '<b>' + project.name + '</b>';
		if (project.technologies && project.technologies.length > 0) {
			html += ' (' + project.technologies.join(', ') + ')';
		}
		html += '<br>';
		html += '[<a href="#" onclick="toggleSection(\'' + summaryId + '\'); return false;">Summary</a>]';
		if (project.githubLink) {
			html += ' [<a href="' + project.githubLink + '" target="_blank">GitHub Repository</a>]';
		}
		html += '<div id="' + summaryId + '" class="abstract-content">';
		html += '<p>' + project.description + '</p>';
		html += '</div>';
		html += '</li><br>';
	});
	html += '</ul></p>';
	document.getElementById('projects-content').innerHTML = html;
}

// ==================== TALKS & PRESENTATIONS ====================
function populateTalks(talks) {
	var html = '<p align="justify"><ul>';
	talks.forEach(function(talk) {
		html += '<li>';
		html += '<b>' + talk.title + '</b>';
		if (talk.venue) {
			html += ' — ' + talk.venue;
		}
		html += '<br>';
		if (talk.videoLink) {
			html += '[<a href="' + talk.videoLink + '" target="_blank">Video</a>] ';
		}
		if (talk.slidesLink) {
			html += '[<a href="' + talk.slidesLink + '" target="_blank">Slides</a>] ';
		}
		if (talk.paperLink) {
			html += '[<a href="' + talk.paperLink + '" target="_blank">Paper</a>] ';
		}
		html += '</li><br>';
	});
	html += '</ul></p>';
	document.getElementById('talks-content').innerHTML = html;
}

// ==================== SKILLS ====================
function populateSkills(skills) {
	var html = '<p align="justify"><ul>';

	if (skills.technicalSkills) {
		for (var category in skills.technicalSkills) {
			if (skills.technicalSkills.hasOwnProperty(category)) {
				html += '<li> <b>' + category + '</b> : ' + skills.technicalSkills[category].join(', ') + ' </li>';
			}
		}
	}

	if (skills.spokenLanguages) {
		html += '<li> <b>Spoken Languages</b> : ' + skills.spokenLanguages.join(', ') + ' </li>';
	}

	html += '</ul></p>';
	document.getElementById('skills-content').innerHTML = html;
}

// ==================== ACHIEVEMENTS ====================
function populateAchievements(achievements) {
	var html = '<p align="justify"><ul>';
	achievements.forEach(function(item) {
		html += '<li>' + item + '</li>';
	});
	html += '</ul></p>';
	document.getElementById('achievements-content').innerHTML = html;
}

// ==================== COURSEWORK ====================
function populateCoursework(coursework) {
	document.getElementById('coursework-content').textContent = coursework.join(', ') + '.';
}
