function decodeEmail(email) {
	return email.replace(/ \[dot\] /g, '.').replace(/ \[at\] /g, '@');
}

function formatNameParts(name) {
	var parts = name.trim().split(/\s+/);
	if (parts.length <= 1) {
		return { first: name, rest: '' };
	}
	return {
		first: parts.slice(0, -1).join(' '),
		rest: parts[parts.length - 1]
	};
}

function formatNameHtml(name) {
	return '<span class="font-weight-bold">' + name + '</span>';
}

function getVenueAbbr(paper) {
	if (!paper.venue) {
		return paper.status || 'Paper';
	}
	var match = paper.venue.match(/\(([A-Z]+(?:\s[A-Z]+)*\s\d{4})\)/);
	if (match) {
		return match[1];
	}
	var words = paper.venue.split(/\s+/).slice(0, 2);
	return words.join(' ');
}

function initAbstractToggles() {
	document.querySelectorAll('a.abstract').forEach(function(link) {
		if (link.dataset.bound) return;
		link.dataset.bound = 'true';
		link.addEventListener('click', function(event) {
			event.preventDefault();
			var scope = link.closest('.links');
			if (scope && scope.parentElement) {
				scope = scope.parentElement;
			} else {
				scope = link.closest('li, .col-sm-8, .col-sm-12') || link.parentElement;
			}
			var panel = scope.querySelector('.abstract.hidden');
			if (panel) {
				scope.querySelectorAll('.abstract.hidden.open').forEach(function(openPanel) {
					if (openPanel !== panel) openPanel.classList.remove('open');
				});
				panel.classList.toggle('open');
			}
		});
	});
}

document.addEventListener('DOMContentLoaded', function() {
	fetch('data/all.json')
		.then(function(res) { return res.json(); })
		.then(function(data) {
			if (document.getElementById('profile-name')) populateProfile(data.profile);
			if (document.getElementById('news-content')) populateNews(data.news);
			if (document.getElementById('education-content')) populateEducation(data.education);
			if (document.getElementById('research-content')) populateResearch(data.research);
			if (document.getElementById('work-experience-content')) populateWorkExperience(data.work);
			if (document.getElementById('projects-content')) populateProjects(data.projects);
			if (document.getElementById('talks-content')) populateTalks(data.talks);
			if (document.getElementById('skills-content')) populateSkills(data.skills);
			if (document.getElementById('achievements-content')) populateAchievements(data.achievements);
			if (document.getElementById('coursework-content')) populateCoursework(data.coursework);
			initAbstractToggles();
		})
		.catch(function(error) {
			console.error('Error loading data:', error);
		});
});

function populateNews(news) {
	var months = {
		"January": 0, "February": 1, "March": 2, "April": 3, "May": 4, "June": 5,
		"July": 6, "August": 7, "September": 8, "October": 9, "November": 10, "December": 11
	};

	news.sort(function(a, b) {
		var partsA = a.date.split(' ');
		var partsB = b.date.split(' ');
		var dateA = new Date(parseInt(partsA[1], 10), months[partsA[0]]);
		var dateB = new Date(parseInt(partsB[1], 10), months[partsB[0]]);
		return dateB - dateA;
	});

	news = news.slice(0, 10);

	var html = '<div class="news-list" style="margin-top: 2rem;">';
	news.forEach(function(item) {
		html += '<div class="news-item" style="display: flex; margin-bottom: 1rem; align-items: flex-start;">';
		html += '<div class="news-date" style="min-width: 120px; margin-right: 1rem;">';
		html += '<span class="badge rounded" style="background-color: var(--global-theme-color, #4274D9); color: white; display: block; padding: 0.4em; text-align: center; font-size: 0.85rem;">' + item.date + '</span>';
		html += '</div>';
		html += '<div class="news-content" style="flex: 1;">';
		if (item.link) {
			html += '<a class="news-title" href="' + item.link + '" target="_blank" rel="external nofollow noopener"><strong>' + item.title + '</strong></a> — ';
		} else {
			html += '<strong>' + item.title + '</strong> — ';
		}
		html += item.description;
		html += '</div></div>';
	});
	html += '</div>';
	document.getElementById('news-content').innerHTML = html;
}

function populateProfile(profile) {
	document.getElementById('profile-name').innerHTML = formatNameHtml(profile.name);
	document.getElementById('navbar-brand').innerHTML = formatNameHtml(profile.name);
	document.getElementById('profile-subtitle').textContent = profile.title;

	if (profile.image) {
		document.getElementById('profile-image').src = profile.image;
	}

	if (profile.imagecaption) {
		document.getElementById('profile-image').alt = profile.imagecaption;
		document.getElementById('profile-more-info').innerHTML =
			'<p style="font-size: 0.75rem; margin-bottom: 0.2rem; text-align: center;"><em>' + profile.imagecaption + '</em></p>';
	} else {
		document.getElementById('profile-more-info').innerHTML = '';
	}

	if (profile.location) {
		document.getElementById('profile-more-info').innerHTML +=
			'<p style="font-size: 0.9rem; text-align: center;"><i class="fas fa-map-marker-alt" style="color: var(--global-theme-color);"></i> ' + profile.location + '</p>';
	}

	var bioHtml = '';

	if (profile.phdNotice) {
		bioHtml += '<blockquote class="block-tip phd-notice"><p><strong>' + profile.phdNotice + '</strong></p></blockquote>';
	}

	if (profile.researchInterests && profile.researchInterests.length > 0) {
		bioHtml += '<div class="research-interests">';
		bioHtml += '<strong>Major Research Interests</strong>';
		bioHtml += '<ul>';
		profile.researchInterests.forEach(function(interest) {
			bioHtml += '<li>' + interest + '</li>';
		});
		bioHtml += '</ul></div>';
	}

	bioHtml += '<p>' + profile.bio + '</p>';

	if (profile.facultySites && profile.facultySites.length > 0) {
		bioHtml += '<p>Working as a <strong>Lecturer at Brac University CSE Department.</strong> ';
		profile.facultySites.forEach(function(site, i) {
			bioHtml += '<a href="' + site.url + '" target="_blank" rel="external nofollow noopener">(' + site.label + ')</a>';
			if (i < profile.facultySites.length - 1) bioHtml += ' ';
		});
		bioHtml += '</p>';
	}

	document.getElementById('profile-bio-content').innerHTML = bioHtml;

	var email = decodeEmail(profile.email);
	var socialHtml = '<div class="contact-icons">';
	if (profile.cv) {
		socialHtml += '<a href="' + profile.cv + '" target="_blank" title="CV"><i class="ai ai-cv"></i></a>';
	}
	socialHtml += '<a href="mailto:' + email + '" title="Email"><i class="fa-solid fa-envelope"></i></a>';
	socialHtml += '<a href="' + profile.github + '" target="_blank" rel="external nofollow noopener" title="GitHub"><i class="fa-brands fa-github"></i></a>';
	socialHtml += '<a href="' + profile.linkedin + '" target="_blank" rel="external nofollow noopener" title="LinkedIn"><i class="fa-brands fa-linkedin"></i></a>';
	socialHtml += '<a href="' + profile.googlescholar + '" target="_blank" rel="external nofollow noopener" title="Google Scholar"><i class="ai ai-google-scholar"></i></a>';
	socialHtml += '</div>';
	socialHtml += '<div class="contact-note">' + email + '</div>';
	document.getElementById('profile-social').innerHTML = socialHtml;
}

function populateEducation(education) {
	var html = '<div class="education-list" style="margin-top: 2rem;">';
	education.forEach(function(edu) {
		html += '<div class="education-entry" style="margin-bottom: 1.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--global-divider-color, #eee);">';
		html += '<div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.2rem;">';
		html += '<h5 style="margin: 0; font-weight: bold; color: var(--global-theme-color, #4274D9);">' + edu.degree + '</h5>';
		html += '<span class="badge rounded" style="background-color: var(--global-bg-color, #fff); color: var(--global-text-color); border: 1px solid var(--global-text-color); padding: 0.3em 0.6em;">' + edu.year + '</span>';
		html += '</div>';
		html += '<div class="institution" style="font-style: italic; margin-bottom: 0.5rem;">' + edu.institution + ', ' + edu.location + '</div>';
		if (edu.details) {
			html += '<div class="details"><span class="badge rounded" style="background-color: var(--global-theme-color, #4274D9); color: white; padding: 0.4em 0.8em; font-size: 0.9rem;">' + edu.details + '</span></div>';
		}
		if (edu.coursework) {
			html += '<div class="coursework mt-2" style="font-size: 0.9rem; color: #6c757d;"><em>Coursework: ' + edu.coursework + '</em></div>';
		}
		html += '</div>';
	});
	html += '</div>';
	document.getElementById('education-content').innerHTML = html;
}

function populateResearch(research) {
	var html = '';
	var counter = 0;
	var sections = [
		{ key: 'conferencePapers', label: 'Conference Publications' },
		{ key: 'journalPapers', label: 'Journal Publications' },
		{ key: 'manuscriptsUnderReview', label: 'Manuscripts Under Review' },
		{ key: 'manuscriptsUnderPreparation', label: 'Manuscripts Under Preparation' },
		{ key: 'preprints', label: 'Preprints' }
	];

	sections.forEach(function(section) {
		var papers = research[section.key];
		if (!papers || papers.length === 0) return;

		html += '<h3 class="bibliography">' + section.label + '</h3>';
		html += '<ol class="bibliography">';
		papers.forEach(function(paper) {
			html += buildPaperItem(paper, counter++);
		});
		html += '</ol>';
	});

	document.getElementById('research-content').innerHTML = html;

	document.getElementById('research-wordcloud').innerHTML =
		'<div class="wordcloud-wrap">' +
		'<p>To portray the core themes of my research, here is a wordcloud generated from the introductions of my peer-reviewed papers and arXiv preprints.</p>' +
		'<img src="img/research_wordcloud.png" alt="Research Wordcloud" class="z-depth-1 rounded">' +
		'</div>';
}

function buildPaperItem(paper, index) {
	var paperId = 'paper_' + index;
	var abbr = getVenueAbbr(paper);
	var html = '<li><div class="row">';

	html += '<div class="col col-sm-2 abbr">';
	html += '<abbr class="badge rounded w-100"><div>' + abbr + '</div></abbr>';
	html += '</div>';

	html += '<div id="' + paperId + '" class="col-sm-8">';

	if (paper.paperLink) {
		html += '<div class="title"><a href="' + paper.paperLink + '" target="_blank" rel="external nofollow noopener">' + paper.title + '</a></div>';
	} else {
		html += '<div class="title">' + paper.title + '</div>';
	}

	html += '<div class="author">' + paper.authors + '</div>';

	if (paper.venue) {
		html += '<div class="periodical">' + paper.venue;
		if (paper.status) {
			// html += ' — <strong>' + paper.status + '</strong>';
		}
		html += '</div>';
	} else if (paper.status) {
		// html += '<div class="periodical"><strong>' + paper.status + '</strong></div>';
	}

	html += '<div class="links">';
	if (paper.description) {
		html += '<a class="abstract btn btn-sm z-depth-0" role="button">Abs</a>';
	}
	if (paper.codeLink) {
		html += ' <a href="' + paper.codeLink + '" class="btn btn-sm z-depth-0" role="button" target="_blank" rel="external nofollow noopener">Code</a>';
	}
	if (paper.paperLink) {
		html += ' <a href="' + paper.paperLink + '" class="btn btn-sm z-depth-0" role="button" target="_blank" rel="external nofollow noopener">Paper</a>';
	}
	html += '</div>';

	if (paper.description) {
		html += '<div class="abstract hidden"><p>' + paper.description + '</p></div>';
	}

	html += '</div></div></li>';
	return html;
}

function populateWorkExperience(work) {
	var html = '<div class="work-list" style="margin-top: 2rem;">';
	work.forEach(function(job) {
		html += '<div class="work-entry" style="margin-bottom: 2.5rem;">';
		
		html += '<div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.2rem;">';
		html += '<h4 style="margin: 0; font-weight: bold;">' + job.title + '</h4>';
		html += '<span class="badge rounded" style="background-color: var(--global-bg-color, #fff); color: var(--global-text-color); border: 1px solid var(--global-text-color); padding: 0.4em 0.8em;">' + job.duration + '</span>';
		html += '</div>';

		html += '<div class="company" style="margin-bottom: 1rem; font-size: 1.1rem; color: var(--global-theme-color, #4274D9);">';
		if (job.companyLink) {
			html += '<a href="' + job.companyLink + '" target="_blank" rel="external nofollow noopener" style="font-weight: bold; color: inherit;">' + job.company + '</a>';
		} else {
			html += '<span style="font-weight: bold;">' + job.company + '</span>';
		}
		html += ', ' + job.department;
		html += '</div>';

		if (job.courses && job.courses.length > 0) {
			html += '<div style="margin-top: 1rem; font-weight: bold;">Courses Currently Teaching and Previously Taught</div>';
			html += '<div class="courses-list" style="margin-top: 0.5rem; display: flex; flex-direction: column; gap: 0.5rem;">';
			job.courses.forEach(function(course) {
				html += '<div class="course-item" style="padding: 0.75rem; background-color: rgba(66, 116, 217, 0.05); border-left: 4px solid var(--global-theme-color, #4274D9); border-radius: 4px;">';
				html += '<div style="margin-bottom: 0.25rem;"><strong>' + course.code + ': ' + course.name + '</strong> <span class="badge rounded" style="background-color: #6c757d; color: white; margin-left: 0.5rem; font-weight: normal;">' + course.type + '</span></div>';
				var semHtml = course.semesters.map(function(s) {
					return '<span class="badge rounded" style="background-color: #e9ecef; color: #495057; border: 1px solid #ced4da; margin-right: 0.3rem; margin-top: 0.3rem; font-weight: normal;">' + s + '</span>';
				}).join('');
				html += '<div><span style="font-size: 0.85rem; font-weight: bold; margin-right: 0.5rem; color: #495057;">Semesters:</span>' + semHtml + '</div>';
				html += '</div>';
			});
			html += '</div>';
		}

		if (job.responsibilities && job.responsibilities.length > 0) {
			html += '<div style="margin-top: 1rem; font-weight: bold;">Responsibilities</div><ul style="margin-top: 0.5rem; padding-left: 1.5rem;">';
			job.responsibilities.forEach(function(resp) {
				html += '<li style="margin-bottom: 0.25rem;">' + resp + '</li>';
			});
			html += '</ul>';
		}

		if (!job.courses && job.description) {
			html += '<p style="margin-top: 1rem;">' + job.description + '</p>';
		}

		html += '</div>';
	});
	html += '</div>';
	document.getElementById('work-experience-content').innerHTML = html;
}

function populateProjects(projects) {
	var html = '<ul class="project-list" style="margin-top: 2rem; list-style-type: disc; padding-left: 1.5rem; list-style-position: outside;">';
	projects.forEach(function(project, index) {
		var projectId = 'project_' + index;
		html += '<li><div class="project-item">';
		html += '<div class="title">' + project.name;
		if (project.technologies && project.technologies.length > 0) {
			html += ' <span class="periodical">(' + project.technologies.join(', ') + ')</span>';
		}
		html += '</div>';
		html += '<div class="links">';
		html += '<a class="abstract btn btn-sm z-depth-0" role="button">Summary</a>';
		if (project.githubLink) {
			html += ' <a href="' + project.githubLink + '" class="btn btn-sm z-depth-0" role="button" target="_blank" rel="external nofollow noopener">GitHub</a>';
		}
		html += '</div>';
		html += '<div class="abstract hidden"><p>' + project.description + '</p></div>';
		html += '</div></li>';
	});
	html += '</ul>';
	document.getElementById('projects-content').innerHTML = html;
}

function populateTalks(talks) {
	var html = '<ul class="talk-list" style="margin-top: 2rem;">';
	talks.forEach(function(talk) {
		html += '<li><strong>' + talk.title + '</strong>';
		if (talk.venue) {
			html += ' — ' + talk.venue;
		}
		html += '<div class="links" style="margin-top: 0.25rem;">';
		if (talk.videoLink) {
			html += '<a href="' + talk.videoLink + '" class="btn btn-sm z-depth-0" role="button" target="_blank" rel="external nofollow noopener">Video</a> ';
		}
		if (talk.slidesLink) {
			html += '<a href="' + talk.slidesLink + '" class="btn btn-sm z-depth-0" role="button" target="_blank" rel="external nofollow noopener">Slides</a> ';
		}
		if (talk.paperLink) {
			html += '<a href="' + talk.paperLink + '" class="btn btn-sm z-depth-0" role="button" target="_blank" rel="external nofollow noopener">Paper</a> ';
		}
		html += '</div></li>';
	});
	html += '</ul>';
	document.getElementById('talks-content').innerHTML = html;
}

function populateSkills(skills) {
	var html = '<div class="skills-container" style="margin-top: 2rem; display: flex; flex-direction: column; gap: 1.8rem;">';

	if (skills.technicalSkills) {
		for (var category in skills.technicalSkills) {
			if (skills.technicalSkills.hasOwnProperty(category)) {
				html += '<div class="skill-category">';
				html += '<h5 style="margin-bottom: 0.8rem; font-family: inherit; font-weight: bold; color: var(--global-theme-color, #4274D9); border-bottom: 2px solid var(--global-theme-color, #4274D9); padding-bottom: 0.3rem; display: inline-block;">' + category + '</h5>';
				html += '<div style="display: flex; flex-wrap: wrap; gap: 0.6rem;">';
				skills.technicalSkills[category].forEach(function(skill) {
					html += '<span class="badge rounded" style="background-color: var(--global-bg-color, #fff); color: var(--global-text-color); border: 1px solid var(--global-text-color); padding: 0.4em 0.8em; font-family: inherit; font-size: 0.95rem; font-weight: normal; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">' + skill + '</span>';
				});
				html += '</div></div>';
			}
		}
	}

	if (skills.spokenLanguages) {
		html += '<div class="skill-category">';
		html += '<h5 style="margin-bottom: 0.8rem; font-family: inherit; font-weight: bold; color: var(--global-theme-color, #4274D9); border-bottom: 2px solid var(--global-theme-color, #4274D9); padding-bottom: 0.3rem; display: inline-block;">Spoken Languages</h5>';
		html += '<div style="display: flex; flex-wrap: wrap; gap: 0.6rem;">';
		skills.spokenLanguages.forEach(function(lang) {
			html += '<span class="badge rounded" style="background-color: var(--global-bg-color, #fff); color: var(--global-text-color); border: 1px solid var(--global-text-color); padding: 0.4em 0.8em; font-family: inherit; font-size: 0.95rem; font-weight: normal; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">' + lang + '</span>';
		});
		html += '</div></div>';
	}

	html += '</div>';
	document.getElementById('skills-content').innerHTML = html;
}

function populateAchievements(achievements) {
	var html = '<ul class="award-list" style="margin-top: 2rem;">';
	achievements.forEach(function(item) {
		html += '<li>' + item + '</li>';
	});
	html += '</ul>';
	document.getElementById('achievements-content').innerHTML = html;
}

function populateCoursework(coursework) {
	document.getElementById('coursework-content').textContent = coursework.join(', ') + '.';
}
