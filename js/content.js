/* ══════════════════════════
   TECHNOSPARK — content.js
   Loads the website content that the admin edits (GET /api/content) and
   paints it into the page. The text that is already written in each HTML file
   stays in place as a fallback, so the site still looks right if the backend
   is switched off.

   Needs config.js (API_BASE_URL) loaded first, and <body data-page="…">
   (home | about | events | team | contact) with data-depth="1" for pages/*.html.
══════════════════════════ */
(function () {
  'use strict';
  if (typeof API_BASE_URL === 'undefined') return;

  var API_ROOT  = API_BASE_URL.replace(/\/api\/?$/, '');
  var PAGE      = document.body.getAttribute('data-page') || '';
  var DEPTH     = document.body.getAttribute('data-depth') === '1' ? 1 : 0;
  var CACHE_KEY = 'ts_content_cache_v1';
  var DEFAULT_NAME = 'TechnoSpark';

  /* ── helpers ── */
  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function arr(v) { return Array.isArray(v) ? v : []; }

  /* Turn a link the admin typed into one that works from the current page.
     Accepts "events.html", "pages/events.html", "../index.html", full URLs, mailto:, #…  */
  function link(url) {
    url = String(url || '').trim();
    if (!url) return '#';
    if (/^(https?:|mailto:|tel:|#)/i.test(url)) return url;
    if (/^[^\s@\/]+@[^\s@\/]+\.[^\s@\/]+$/.test(url)) return 'mailto:' + url;
    if (/^[a-z][a-z0-9+.\-]*:/i.test(url)) return '#';            // javascript:, data:, …
    var name = url.replace(/^(\.\.\/|\.\/|pages\/)+/, '');
    if (/^index\.html([?#].*)?$/.test(name)) return DEPTH ? '../' + name : name;
    if (/^[\w\-]+\.html([?#].*)?$/.test(name)) return DEPTH ? name : 'pages/' + name;
    return url;
  }
  function isExternal(url) { return /^https?:/i.test(String(url || '').trim()); }

  /* Uploaded images come back as "/uploads/site/xyz.jpg" — they live on the backend */
  function asset(url) {
    url = String(url || '').trim();
    if (/^https?:\/\//i.test(url)) return url;
    if (url.charAt(0) === '/') return API_ROOT + url;
    return '';
  }

  var SOCIAL_ICONS = {
    instagram: '📸', linkedin: '💼', github: '💻', twitter: '🐦', facebook: '📘',
    youtube: '▶️', whatsapp: '💬', email: '✉️', website: '🌐'
  };
  function socialLink(item, extraAttrs) {
    var icon = SOCIAL_ICONS[item.type] || '🔗';
    var url = link(item.url);
    var ext = isExternal(item.url) ? ' target="_blank" rel="noopener noreferrer"' : '';
    return '<a href="' + esc(url) + '"' + ext + ' aria-label="' + esc(item.type || 'link') + '"' + (extraAttrs || '') + '>' + icon + '</a>';
  }

  var GRADIENTS = {
    'default': '',
    magenta: 'linear-gradient(135deg,#FF006E,#8800FF)',
    teal:    'linear-gradient(135deg,#00D4FF,#00AA99)',
    blue:    'linear-gradient(135deg,#00D4FF,#006AFF)',
    sunset:  'linear-gradient(135deg,#FF006E,#FF6600)',
    mint:    'linear-gradient(135deg,#00D4FF,#00FF88)',
    purple:  'linear-gradient(135deg,#8800FF,#FF006E)',
    ocean:   'linear-gradient(135deg,#00D4FF,#0066FF)',
    lime:    'linear-gradient(135deg,#00FF88,#00D4FF)',
    orange:  'linear-gradient(135deg,#FF6600,#FF006E)'
  };
  function gradientStyle(key) {
    var g = GRADIENTS[key];
    return g ? ' style="background:' + g + ';"' : '';
  }

  function initials(name) {
    var parts = String(name || '').trim().split(/\s+/).filter(Boolean);
    return ((parts[0] || '').charAt(0) + (parts.length > 1 ? parts[parts.length - 1].charAt(0) : '')).toUpperCase();
  }

  function setHtml(el, html) { if (el) el.innerHTML = html; }

  function renderHero(h) {
    var el = $('.page-hero');
    if (!el) return;
    el.innerHTML =
      '<p class="section-eyebrow">' + esc(h.eyebrow) + '</p>' +
      '<h1>' + esc(h.title) + (h.accent ? ' <span class="accent-cyan">' + esc(h.accent) + '</span>' : '') + '</h1>' +
      '<p>' + esc(h.text) + '</p>';
  }

  function empty(text) { return '<div class="ts-empty">' + esc(text) + '</div>'; }

  /* ══════════ SHARED: logo, footer, titles ══════════ */
  function renderSite(site) {
    if (!site) return;
    var name = site.clubName || DEFAULT_NAME;

    $$('.nav-logo').forEach(function (el) {
      Array.prototype.slice.call(el.childNodes).forEach(function (n) {
        if (n.nodeType === 3) el.removeChild(n);          // old text, keep the ⚡ span
      });
      el.appendChild(document.createTextNode(name));
    });
    if (name !== DEFAULT_NAME) document.title = document.title.split(DEFAULT_NAME).join(name);

    var tag = $('.footer-brand p');
    if (tag) tag.textContent = site.footerTagline || '';
    var copy = $('.footer-bottom p');
    if (copy) copy.textContent = site.copyright || '';

    var socials = $('.footer-socials');
    if (socials) setHtml(socials, arr(site.footerSocials).map(function (s) { return socialLink(s); }).join(''));

    ['email', 'reg-email'].forEach(function (id) {
      var input = document.getElementById(id);
      if (input && site.emailPlaceholder) input.placeholder = site.emailPlaceholder;
    });
  }

  /* ══════════ HOME ══════════ */
  function renderHome(h) {
    var eyebrow = $('.hero-eyebrow'); if (eyebrow) eyebrow.textContent = h.heroEyebrow || '';
    setHtml($('.hero-title'), esc(h.heroTitleLine1) + '<br /><span class="accent-cyan">' + esc(h.heroTitleAccent) + '</span>');
    setHtml($('.hero-subtitle'), esc(h.heroSubtitleLine1) + '<br />' + esc(h.heroSubtitleLine2));

    var b1 = h.heroButton1 || {}, b2 = h.heroButton2 || {};
    setHtml($('.hero-cta'),
      (b1.label ? '<a href="' + esc(link(b1.link)) + '" class="btn btn-primary">' + esc(b1.label) + '</a>' : '') +
      (b2.label ? '<a href="' + esc(link(b2.link)) + '" class="btn btn-outline">' + esc(b2.label) + '</a>' : ''));

    setHtml($('.hero-stats'), arr(h.stats).map(function (s) {
      return '<div class="stat"><span class="stat-num">' + esc(s.num) + '</span><span class="stat-label">' + esc(s.label) + '</span></div>';
    }).join('<div class="stat-divider"></div>'));

    /* ticker — items are listed twice so the -50% scroll animation loops seamlessly */
    var ticker = $('.events-ticker');
    var items = arr(h.ticker).filter(function (t) { return t.title || t.text; });
    if (ticker) {
      ticker.style.display = items.length ? '' : 'none';
      var labelEl = $('.ticker-label');
      if (labelEl) {
        var dot = labelEl.querySelector('.ticker-dot');
        labelEl.textContent = '';
        if (dot) labelEl.appendChild(dot);
        labelEl.appendChild(document.createTextNode(' ' + (h.tickerLabel || '')));
      }
      var one = items.map(function (t) {
        return '<div class="ticker-item">' + (t.emoji ? esc(t.emoji) + ' ' : '') +
               (t.title ? '<strong>' + esc(t.title) + '</strong> ' : '') + esc(t.text) + '</div>';
      }).join('');
      setHtml($('#ticker-track'), one + one);
    }

    var what = $('#what');
    if (what) {
      var eb = $('.section-eyebrow', what); if (eb) eb.textContent = h.domainsEyebrow || '';
      var tt = $('.section-title', what);   if (tt) tt.textContent = h.domainsTitle || '';
      setHtml($('.cards-grid', what), arr(h.domains).map(function (d) {
        return '<div class="card card-hover"><div class="card-icon">' + esc(d.icon) + '</div><h3>' + esc(d.title) + '</h3><p>' + esc(d.text) + '</p></div>';
      }).join(''));
    }

    var teaser = $('.event-teaser');
    if (teaser) {
      teaser.style.display = h.teaserShow === false ? 'none' : '';
      var badge = $('.teaser-badge', teaser);     if (badge) badge.textContent = h.teaserBadge || '';
      var title = $('.teaser-title', teaser);     if (title) title.textContent = h.teaserTitle || '';
      var date  = $('.teaser-date', teaser);      if (date)  date.textContent  = h.teaserDate || '';
      var desc  = $('.teaser-desc', teaser);      if (desc)  desc.textContent  = h.teaserText || '';
      var btn   = $('a.btn', teaser);
      var tb = h.teaserButton || {};
      if (btn) { btn.textContent = tb.label || ''; btn.href = link(tb.link); btn.style.display = tb.label ? '' : 'none'; }
    }
  }

  /* ══════════ ABOUT ══════════ */
  function renderAbout(a) {
    renderHero({ eyebrow: a.heroEyebrow, title: a.heroTitle, accent: a.heroAccent, text: a.heroText });

    var statColors = ['cyan', 'magenta', 'cyan', 'magenta'];
    var who = $('#about-who');
    if (who) {
      var btn = a.whoButton || {};
      setHtml(who,
        '<div class="about-text">' +
          '<p class="section-eyebrow">' + esc(a.whoEyebrow) + '</p>' +
          '<h2>' + esc(a.whoTitle) + (a.whoAccent ? ' <span class="accent-cyan">' + esc(a.whoAccent) + '</span>' : '') + '</h2>' +
          arr(a.whoParagraphs).map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') +
          (btn.label ? '<a href="' + esc(link(btn.link)) + '" class="btn btn-primary" style="margin-top:12px;">' + esc(btn.label) + '</a>' : '') +
        '</div>' +
        '<div class="about-visual fade-in visible">' +
          '<div class="big-num">' + esc(a.bigNumber) + '</div>' +
          '<p>' + esc(a.bigNumberLabel) + '</p>' +
          '<div style="margin-top:32px; display:grid; grid-template-columns:1fr 1fr; gap:16px; text-align:left;">' +
            arr(a.stats).map(function (s, i) {
              return '<div style="background:var(--navy);border-radius:8px;padding:16px;">' +
                '<div style="font-family:var(--font-display);font-size:1.6rem;color:var(--' + statColors[i % 4] + ');font-weight:900;">' + esc(s.num) + '</div>' +
                '<div style="font-size:0.8rem;color:var(--slate);margin-top:4px;">' + esc(s.label) + '</div></div>';
            }).join('') +
          '</div>' +
        '</div>');
    }

    var values = $('#about-values');
    if (values) {
      setHtml(values,
        '<p class="section-eyebrow fade-in visible">' + esc(a.valuesEyebrow) + '</p>' +
        '<h2 class="section-title fade-in visible" style="margin-bottom:24px;">' + esc(a.valuesTitle) + '</h2>' +
        '<div class="values-grid">' +
          arr(a.values).map(function (v) {
            return '<div class="value-item fade-in visible"><h4>' + esc(v.title) + '</h4><p>' + esc(v.text) + '</p></div>';
          }).join('') +
        '</div>');
    }

    var tl = $('#about-timeline');
    if (tl) {
      var rows = arr(a.timeline);
      tl.style.display = (rows.length || a.timelineTitle) ? '' : 'none';
      setHtml($('#about-timeline-body', tl),
        '<p class="section-eyebrow fade-in visible">' + esc(a.timelineEyebrow) + '</p>' +
        '<h2 class="section-title fade-in visible">' + esc(a.timelineTitle) + '</h2>' +
        '<div style="max-width:640px;">' +
          rows.map(function (r, i) {
            var last = i === rows.length - 1;
            return '<div class="fade-in visible" style="display:flex;gap:24px;' + (last ? '' : 'margin-bottom:36px;') + '">' +
              '<div style="min-width:64px;font-family:var(--font-display);color:var(--' + (last ? 'magenta' : 'cyan') + ');font-weight:700;">' + esc(r.year) + '</div>' +
              '<div><strong style="color:var(--white);">' + esc(r.title) + '</strong>' +
              '<p style="margin-top:4px;font-size:0.88rem;">' + esc(r.text) + '</p></div></div>';
          }).join('') +
        '</div>');
    }
  }

  /* ══════════ EVENTS ══════════ */
  function eventCard(ev) {
    var past = ev.status === 'past';
    var tagClass = ev.status === 'open' ? 'tag-open' : past ? 'tag-past' : 'tag-upcoming';
    var action = '';
    if (ev.registrationOpen && !past) {
      action = '<button type="button" class="btn btn-magenta" style="font-size:0.7rem;padding:10px 20px;" data-register="' + esc(ev.title) + '">Register</button>';
    } else if (ev.buttonLabel) {
      action = '<a href="' + esc(link(ev.buttonLink)) + '"' + (isExternal(ev.buttonLink) ? ' target="_blank" rel="noopener noreferrer"' : '') +
               ' class="btn btn-outline" style="font-size:0.7rem;padding:10px 20px;">' + esc(ev.buttonLabel) + '</a>';
    }
    var img = asset(ev.image);
    return '<div class="event-card fade-in visible">' +
      '<div class="event-date-box"' + gradientStyle(ev.gradient) + '><div class="day">' + esc(ev.day) + '</div><div class="month">' + esc(ev.month) + '</div></div>' +
      '<div class="event-info"><h3>' + esc(ev.title) + '</h3>' +
        '<p class="event-meta">' + esc(ev.meta) + '</p>' +
        (img ? '<img class="event-image" src="' + esc(img) + '" alt="' + esc(ev.title) + '" loading="lazy" />' : '') +
        '<p>' + esc(ev.description) + '</p></div>' +
      '<div>' + (ev.statusLabel ? '<span class="event-tag ' + tagClass + '" style="display:block;margin-bottom:12px;">' + esc(ev.statusLabel) + '</span>' : '') + action + '</div>' +
    '</div>';
  }

  function renderEvents(e) {
    renderHero({ eyebrow: e.heroEyebrow, title: e.heroTitle, accent: '', text: e.heroText });

    var items = arr(e.items);
    var upcoming = items.filter(function (i) { return i.status !== 'past'; });
    var past = items.filter(function (i) { return i.status === 'past'; });

    var eb = $('#events-eyebrow'); if (eb) eb.textContent = e.upcomingEyebrow || '';
    var tt = $('#events-title');   if (tt) tt.textContent = e.upcomingTitle || '';
    setHtml($('#events-list'), upcoming.length ? upcoming.map(eventCard).join('') : empty(e.emptyText));

    var pastSection = $('#past-events-section');
    if (pastSection) {
      pastSection.style.display = past.length ? '' : 'none';
      var peb = $('#past-events-eyebrow'); if (peb) peb.textContent = e.pastEyebrow || '';
      var ptt = $('#past-events-title');   if (ptt) ptt.textContent = e.pastTitle || '';
      setHtml($('#past-events-list'), past.map(eventCard).join(''));
    }

    $$('[data-register]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (typeof window.openRegisterModal === 'function') window.openRegisterModal(btn.getAttribute('data-register'));
      });
    });
  }

  /* ══════════ TEAM ══════════ */
  function teamCard(m) {
    var photo = asset(m.photo);
    var socials = arr(m.socials).filter(function (s) { return s.url; });
    return '<div class="team-card fade-in visible">' +
      '<div class="member-avatar"' + gradientStyle(m.gradient) + '>' +
        (photo ? '<img src="' + esc(photo) + '" alt="' + esc(m.name) + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" loading="lazy" />' : esc(initials(m.name))) +
      '</div>' +
      '<h3>' + esc(m.name) + '</h3>' +
      '<p class="role">' + esc(m.role) + '</p>' +
      '<p class="dept">' + esc(m.dept) + '</p>' +
      (socials.length ? '<div class="socials">' + socials.map(function (s) { return socialLink(s); }).join('') + '</div>' : '') +
    '</div>';
  }

  function renderTeam(t) {
    renderHero({ eyebrow: t.heroEyebrow, title: t.heroTitle, accent: t.heroAccent, text: t.heroText });

    var core = arr(t.core), members = arr(t.members);
    var setText = function (id, v) { var el = document.getElementById(id); if (el) el.textContent = v || ''; };
    setText('team-core-eyebrow', t.coreEyebrow);
    setText('team-core-title', t.coreTitle);
    setText('team-members-eyebrow', t.membersEyebrow);
    setText('team-members-title', t.membersTitle);

    setHtml($('#team-core-grid'), core.length ? core.map(teamCard).join('') : empty(t.emptyText));
    setHtml($('#team-members-grid'), members.length ? members.map(teamCard).join('') : empty(t.emptyText));

    var cta = $('#team-cta');
    if (cta) {
      cta.style.display = t.ctaShow === false ? 'none' : '';
      var b = t.ctaButton || {};
      setHtml($('.event-teaser-inner', cta),
        '<h2 class="teaser-title">' + esc(t.ctaTitle) + '</h2>' +
        '<p class="teaser-desc">' + esc(t.ctaText) + '</p>' +
        (b.label ? '<a href="' + esc(link(b.link)) + '" class="btn btn-primary">' + esc(b.label) + '</a>' : ''));
    }
  }

  /* ══════════ CONTACT ══════════ */
  function renderContact(c) {
    renderHero({ eyebrow: c.heroEyebrow, title: c.heroTitle, accent: c.heroAccent, text: c.heroText });

    setHtml($('#contact-connect'),
      '<h2 style="font-family:var(--font-display);font-size:1.4rem;color:var(--white);margin-bottom:16px;">' + esc(c.connectTitle) + '</h2>' +
      '<p style="font-size:0.95rem;line-height:1.8;margin-bottom:36px;">' + esc(c.connectText) + '</p>');

    function detail(icon, label, valueHtml) {
      return '<div class="contact-detail fade-in visible"><div class="contact-icon">' + icon + '</div><div><h4>' + esc(label) + '</h4><p>' + valueHtml + '</p></div></div>';
    }
    var socials = arr(c.socials).filter(function (s) { return s.label; });
    setHtml($('#contact-details'),
      detail('📧', 'Email', esc(c.email)) +
      detail('📍', 'Location', esc(c.location)) +
      detail('🕐', 'Club Hours', esc(c.hours)) +
      (socials.length ? detail('📱', c.socialsLabel || 'Social Media', socials.map(function (s, i) {
        return '<a href="' + esc(link(s.url)) + '"' + (isExternal(s.url) ? ' target="_blank" rel="noopener noreferrer"' : '') +
               ' style="color:var(--cyan);' + (i < socials.length - 1 ? 'margin-right:12px;' : '') + '">' + esc(s.label) + '</a>';
      }).join('')) : ''));

    var select = document.getElementById('reason');
    if (select) {
      var keep = select.value;
      setHtml(select, '<option value="">Select a reason</option>' +
        arr(c.reasons).filter(Boolean).map(function (r) { return '<option>' + esc(r) + '</option>'; }).join(''));
      select.value = keep;
    }

    var faq = arr(c.faq);
    setHtml($('#contact-faq'),
      '<p class="section-eyebrow fade-in visible">' + esc(c.faqEyebrow) + '</p>' +
      '<h2 class="section-title fade-in visible">' + esc(c.faqTitle) + '</h2>' +
      faq.map(function (f) {
        return '<div class="fade-in visible" style="margin-bottom:20px;background:var(--navy);border-radius:var(--radius);padding:24px;border:1px solid rgba(0,212,255,0.1);">' +
          '<h4 style="font-family:var(--font-display);color:var(--white);font-size:0.9rem;margin-bottom:8px;">' + esc(f.q) + '</h4>' +
          '<p style="font-size:0.88rem;">' + esc(f.a) + '</p></div>';
      }).join(''));
    var faqSection = $('#contact-faq-section');
    if (faqSection) faqSection.style.display = faq.length ? '' : 'none';
  }

  /* ══════════ APPLY ══════════ */
  var RENDERERS = { home: renderHome, about: renderAbout, events: renderEvents, team: renderTeam, contact: renderContact };

  function apply(content) {
    if (!content) return;
    try { renderSite(content.site); } catch (e) { console.error('Site content error', e); }
    var fn = RENDERERS[PAGE];
    if (fn && content[PAGE]) {
      try { fn(content[PAGE]); } catch (e) { console.error('Page content error', e); }
    }
  }

  // 1) paint the last known content straight away (no flash of old text)
  var cachedRaw = null;
  try { cachedRaw = localStorage.getItem(CACHE_KEY); } catch (e) {}
  if (cachedRaw) { try { apply(JSON.parse(cachedRaw)); } catch (e) {} }

  // 2) then fetch the latest and repaint only if something changed
  fetch(API_BASE_URL + '/content', { cache: 'no-store' })
    .then(function (res) { if (!res.ok) throw new Error('HTTP ' + res.status); return res.text(); })
    .then(function (text) {
      if (text === cachedRaw) return;
      apply(JSON.parse(text));
      try { localStorage.setItem(CACHE_KEY, text); } catch (e) {}
    })
    .catch(function (err) { console.warn('TechnoSpark: using built-in page content (' + err.message + ')'); });
})();
