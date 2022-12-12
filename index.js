// Register service worker to control making site work offline
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/blogpost/sw.js').then(() => { console.log('Service Worker Registered'); });
}

var lastScrollTop = 0;
var last_shown_blog_idx = 0;
var processing = false;
var going_to_toc = false;
var matches = [];

window.addEventListener('DOMContentLoaded', (event) => {
	document.body.append(blogposts[0])
	hook_toc()
	document.body.style.opacity = 1;
});

document.addEventListener("scroll", scroll_handler)
function scroll_handler () {
	if (processing) return;
	if (going_to_toc) {
		going_to_toc = false;
		return;
	}
	
	processing = true;
	let body_height = document.body.scrollHeight;
	let screen_height = window.innerHeight;
	let current_top_y = window.scrollY;
	let current_bottom_y = screen_height + current_top_y;

	if (current_top_y > lastScrollTop){
		let y_till_end = body_height - current_bottom_y;
		if (y_till_end < screen_height*2) {
			for (let idx = last_shown_blog_idx; idx < blogposts.length; idx++) {
				let el = blogposts[idx]
				if (el.offsetHeight === 0) {
					document.body.append(el)
					last_shown_blog_idx = idx;
					if (blogposts[idx-4]) {
						blogposts[idx-4].remove()
					}
					break;
				}
			}
		}
	} else {
		let y_till_top = current_top_y
		if (y_till_top < screen_height*2) {
			for (let idx = last_shown_blog_idx-1; idx >= 0; idx--) {
				let el = blogposts[idx]
				if (el.offsetHeight === 0) {
					document.body.prepend(el)
					last_shown_blog_idx = idx;
					if (blogposts[idx+4]) {
						blogposts[idx+4].remove()
					}
					break;
				}
			}
		}
	}

	lastScrollTop = current_top_y <= 0 ? 0 : current_top_y;
	processing = false
}

function hook_toc() {
	Array.from(blogposts[0].getElementsByTagName('a')).map(a => {
		a.addEventListener('click', e => {
			let selected_post_idx;
			blogposts.map((el, idx) => {
				let anchor_id = e.target.getAttribute('href').slice(1)
				if(anchor_id == el.id) {
					if (blogposts[idx-1]) {
						document.body.append(blogposts[idx-1])
					}
					document.body.append(el)
					selected_post_idx = idx
					last_shown_blog_idx = idx;
					if (blogposts[idx+1]) {
						document.body.append(blogposts[idx+1])
						last_shown_blog_idx = idx;
					}
					el.scrollIntoView()
				} else {
					if (selected_post_idx && idx == selected_post_idx + 1) return
					el.remove()
				}
			})
		})
	})
}

document.getElementById('goto_toc').addEventListener('click', goto_toc)
function goto_toc() {
	going_to_toc = true;
	blogposts.map(el => el.remove());
	document.body.append(blogposts[0]);
	last_shown_blog_idx = 0;
}

var current_match;
var text;
document.getElementById('search').addEventListener('click', search);
function search(e) {
	e.preventDefault();
	text = prompt("إبحث: ");
	if (!text) {
		return
	}
	
	matches = blogposts.map((el, idx) => ([el, idx])).filter(([el, idx]) => el.textContent.replace(/َ|ً|ُ|ٌ|ِ|ٍ|\ْ/g, '').indexOf(text) > -1);
	
	if (matches.length === 0) {
		alert('لم يتم العثور على نص مطابق');
		text = undefined;
		return
	}
	
	blogposts.map(el => el.remove());
	
	current_match = 0;
	document.body.append(matches[current_match][0]);
	last_shown_blog_idx = matches[current_match][1]
	
	window.find(text)
}

document.getElementById('next').addEventListener('click', next);
function next(e) {
	e.preventDefault();
	if (!text) return
	if (!window.find(text)) {
		current_match++;
		if (current_match > matches.length - 1) { current_match = 0 }
		blogposts.map(el => el.remove());
		document.body.append(matches[current_match][0]);
		last_shown_blog_idx = matches[current_match][1]
		
		window.find(text)
		going_to_toc = true;
	}
}

document.getElementById('previous').addEventListener('click', previous);
function previous(e) {
	e.preventDefault();
	if (!text) return
	if (!window.find(text, false, true)) {
		current_match--;
		if (current_match < 0) { current_match = matches.length - 1 }
		blogposts.map(el => el.remove());
		document.body.append(matches[current_match][0]);
		last_shown_blog_idx = matches[current_match][1]
		
		matches[current_match][0].innerHTML += "<span id='to_delete'>TODELETE<span>"
		window.find("TODELETE")
			
		window.find(text, false, true)
		document.getElementById('to_delete').remove()
		going_to_toc = true;
	}
}

var deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevents the default mini-infobar or install dialog from appearing on mobile
  e.preventDefault();
  // Save the event because you'll need to trigger it later.
  deferredPrompt = e;
  // Show your customized install prompt for your PWA
  // Your own UI doesn't have to be a single element, you
  // can have buttons in different locations, or wait to prompt
  // as part of a critical journey.
  showInAppInstallPromotion();
});

function showInAppInstallPromotion() {
	document.getElementById('install').addEventListener("click", (e) => {
		deferredPrompt.prompt();
	})
	document.getElementById('install').style.display = "block";
}