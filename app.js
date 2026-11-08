/* Portfolio / CV: content comes from a Google Sheet (or fallback.js), pages open as overlays. */
(function (root) {
  'use strict';

  /* ------------------------------------------------------------------ UI text */
  var T = {
    th: {
      about: 'เกี่ยวกับ', works: 'ผลงาน', experience: 'ประสบการณ์', education: 'การศึกษาและทักษะ', contact: 'ติดต่อ', cv: 'CV',
      close: 'ปิด', back: function (l) { return 'กลับไป' + l; }, all: 'ทั้งหมด', filter: 'กรองตามประเภท',
      readOriginal: 'อ่านต้นฉบับ', gpa: 'เกรดเฉลี่ย', present: 'ปัจจุบัน', skills: 'ทักษะ', educationH: 'การศึกษา',
      details: 'ข้อมูลส่วนตัว', profile: 'โปรไฟล์', portfolio: 'พอร์ตโฟลิโอ', selected: 'ผลงานที่คัดมา', contactH: 'ติดต่อ',
      saveCv: 'บันทึก CV เป็น PDF', saveHint: 'ปุ่มนี้เปิดหน้าต่างพิมพ์ของเบราว์เซอร์ เลือกเครื่องพิมพ์เป็น “บันทึกเป็น PDF” (Save as PDF) แล้วกดบันทึก',
      cvLang: 'CV จะออกเป็นภาษาไทย สลับภาษาด้านบนถ้าต้องการฉบับอังกฤษ', empty: 'ยังไม่มีผลงานให้แสดง', emptyCat: 'ไม่มีผลงานในประเภทนี้',
      language: 'ภาษา', sections: 'ส่วนต่างๆ ของเว็บ', copyright: function (y, n) { return '© ' + y + ' ' + n; },
      cat: { interview: 'สัมภาษณ์', news: 'ข่าว', article: 'บทความ' },
      type: { freelance: 'ฟรีแลนซ์', training: 'ฝึกงาน', work: '' },
      monthsShort: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'],
      monthsLong: ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']
    },
    en: {
      about: 'About', works: 'Works', experience: 'Experience', education: 'Education and skills', contact: 'Contact', cv: 'CV',
      close: 'Close', back: function (l) { return 'Back to ' + l; }, all: 'All', filter: 'Filter by type',
      readOriginal: 'Read the original', gpa: 'GPA', present: 'present', skills: 'Skills', educationH: 'Education',
      details: 'Details', profile: 'Profile', portfolio: 'Portfolio', selected: 'Selected writing', contactH: 'Contact',
      saveCv: 'Save CV as PDF', saveHint: 'This opens your browser’s print window. Choose “Save as PDF” as the printer, then save.',
      cvLang: 'The CV is in English. Switch the language above for the Thai version.', empty: 'No works to show yet.', emptyCat: 'No works of this type.',
      language: 'Language', sections: 'Sections', copyright: function (y, n) { return '© ' + y + ' ' + n; },
      cat: { interview: 'Interview', news: 'News', article: 'Article' },
      type: { freelance: 'Freelance', training: 'Training', work: '' },
      monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      monthsLong: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    }
  };
  var ROUTES = ['about', 'works', 'experience', 'education', 'contact', 'cv'];
  var TABS = ['profile', 'details', 'contact', 'experience', 'education', 'skills', 'works', 'categories'];
  var REQUIRED = {
    profile: ['key', 'en'], details: ['key', 'value_en'], contact: ['key', 'value_en'], experience: ['org_en', 'start'],
    education: ['school_en', 'degree_en'], skills: ['name_en', 'group_en'], works: ['title_en', 'category'], categories: ['category', 'label_en']
  };
  var CACHE_KEY = 'cv-cache-v1';

  /* ------------------------------------------------------------------ pure helpers */
  function parseCSV(text) {
    text = String(text || '').replace(/^﻿/, '');
    var rows = [], row = [], cell = '', q = false, i, c;
    for (i = 0; i < text.length; i++) {
      c = text.charAt(i);
      if (q) {
        if (c === '"') { if (text.charAt(i + 1) === '"') { cell += '"'; i++; } else { q = false; } }
        else { cell += c; }
      } else if (c === '"') { q = true; }
      else if (c === ',') { row.push(cell); cell = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && text.charAt(i + 1) === '\n') i++;
        row.push(cell); rows.push(row); row = []; cell = '';
      } else { cell += c; }
    }
    if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
    return rows;
  }

  function rowsToObjects(rows) {
    if (!rows.length) return [];
    var heads = rows[0].map(function (h) { return String(h).trim().toLowerCase(); });
    var out = [];
    for (var i = 1; i < rows.length; i++) {
      var o = {}, any = false;
      for (var j = 0; j < heads.length; j++) {
        if (!heads[j]) continue;
        var v = rows[i][j] == null ? '' : String(rows[i][j]).trim();
        if (v) any = true;
        o[heads[j]] = v;
      }
      if (any) out.push(o);
    }
    return out;
  }

  function hasHeaders(rows, tab) {
    if (!rows.length) return false;
    var heads = rows[0].map(function (h) { return String(h).trim().toLowerCase(); });
    return (REQUIRED[tab] || []).every(function (h) { return heads.indexOf(h) !== -1; });
  }

  function flag(v) {
    var s = String(v == null ? '' : v).trim().toLowerCase();
    return !(s === 'no' || s === 'n' || s === 'false' || s === '0' || s === 'hide' || s === 'ซ่อน' || s === 'ไม่');
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // Google Drive share links (file/d/ID/view, open?id=ID, uc?id=ID) become direct image links.
  function driveId(u) {
    var m = /^https?:\/\/(?:drive|docs)\.google\.com\/(?:file\/d\/|open\?(?:[^#]*&)?id=|uc\?(?:[^#]*&)?id=|thumbnail\?(?:[^#]*&)?id=)([A-Za-z0-9_-]{10,})/i.exec(u);
    return m ? m[1] : '';
  }
  function imageUrl(u) {
    u = String(u || '').trim();
    var id = driveId(u);
    return id ? 'https://drive.google.com/thumbnail?id=' + id + '&sz=w1600' : safeUrl(u);
  }
  function imageList(v) {
    return String(v || '').split(/[\s,;]+/).map(imageUrl).filter(Boolean);
  }

  function safeUrl(u) {
    u = String(u || '').trim();
    if (!u || /^\/\//.test(u)) return '';
    var m = /^([a-z][a-z0-9+.-]*):/i.exec(u);
    if (m) return /^(https?|mailto|tel)$/i.test(m[1]) ? u : '';
    return u;
  }

  function isExternal(u) { return /^https?:/i.test(u) && !(root.location && u.indexOf(root.location.origin) === 0); }

  function linkAttrs(u) { return isExternal(u) ? ' target="_blank" rel="noopener noreferrer"' : ''; }

  // tiny, safe inline formatting: **bold**, *italic*, [text](https://link). Everything is escaped first.
  function inline(s) {
    var t = esc(s);
    t = t.replace(/\[([^\]\n]+)\]\(([^)\s]+)\)/g, function (m, a, u) {
      var url = safeUrl(u.replace(/&amp;/g, '&'));
      return url ? '<a href="' + esc(url) + '"' + linkAttrs(url) + '>' + a + '</a>' : a;
    });
    t = t.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
    t = t.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
    return t.replace(/\n/g, '<br>');
  }

  function paragraphs(s) {
    return String(s || '').split(/\n\s*\n/).map(function (p) { return p.trim(); }).filter(Boolean)
      .map(function (p) { return '<p>' + inline(p) + '</p>'; }).join('');
  }

  function parseMonth(s) {
    s = String(s || '').trim();
    var m;
    if (!s) return null;
    if (/^(present|now|current|ปัจจุบัน)$/i.test(s)) return { present: true };
    if ((m = /^(\d{4})(?:[-\/](\d{1,2}))?(?:[-\/]\d{1,2})?$/.exec(s))) return { y: +m[1], m: m[2] ? +m[2] : null };
    if ((m = /^(\d{1,2})[\/-](\d{4})$/.exec(s))) return { y: +m[2], m: +m[1] };
    if ((m = /^([A-Za-z]{3,9})\.?\s+(\d{4})$/.exec(s))) {
      var idx = T.en.monthsShort.map(function (x) { return x.toLowerCase(); }).indexOf(m[1].slice(0, 3).toLowerCase());
      if (idx > -1) return { y: +m[2], m: idx + 1 };
    }
    return { raw: s };
  }

  function yr(y, lang, be) { return (be && lang === 'th') ? y + 543 : y; }

  function fmtMonth(s, lang, be) {
    var p = parseMonth(s), t = T[lang];
    if (!p) return '';
    if (p.present) return t.present;
    if (p.raw) return p.raw;
    return (p.m && p.m >= 1 && p.m <= 12 ? t.monthsShort[p.m - 1] + ' ' : '') + yr(p.y, lang, be);
  }

  function fmtRange(start, end, lang, be) {
    var a = fmtMonth(start, lang, be), b = fmtMonth(end, lang, be);
    if (a && b && a !== b) return a + ' – ' + b;
    return a || b;
  }

  function sortKey(s, isEnd) {
    var p = parseMonth(s);
    if (!p) return 0;
    if (p.present) return 999999;
    if (p.raw) return 0;
    return p.y * 100 + (p.m || (isEnd ? 12 : 1));
  }

  function sortByDate(rows) {
    return rows.map(function (r, i) { return { r: r, i: i }; }).sort(function (a, b) {
      var ea = sortKey(a.r.end || a.r.start, true), eb = sortKey(b.r.end || b.r.start, true);
      if (ea !== eb) return eb - ea;
      var sa = sortKey(a.r.start, false), sb = sortKey(b.r.start, false);
      if (sa !== sb) return sb - sa;
      return a.i - b.i;
    }).map(function (x) { return x.r; });
  }

  function parseDob(s) {
    var m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(String(s || '').trim());
    return m ? { y: +m[1], m: +m[2], d: +m[3] } : null;
  }

  function calcAge(dob, now) {
    var d = parseDob(dob);
    if (!d) return '';
    now = now || new Date();
    var age = now.getFullYear() - d.y;
    var md = (now.getMonth() + 1) * 100 + now.getDate();
    if (md < d.m * 100 + d.d) age--;
    return age >= 0 && age < 130 ? String(age) : '';
  }

  function fmtDob(dob, lang, be) {
    var d = parseDob(dob);
    if (!d || d.m < 1 || d.m > 12) return '';
    return d.d + ' ' + T[lang].monthsLong[d.m - 1] + ' ' + yr(d.y, lang, be);
  }

  function pick(row, base, lang) {
    if (!row) return '';
    var other = lang === 'th' ? 'en' : 'th';
    return row[base + '_' + lang] || row[base + '_' + other] || row[base] || '';
  }

  function profileMap(rows, lang) {
    var o = {};
    (rows || []).forEach(function (r) { if (r.key) o[r.key] = (r[lang] || r[lang === 'th' ? 'en' : 'th'] || '').trim(); });
    return o;
  }

  function fillTokens(str, profile, lang, be) {
    var s = String(str || '');
    if (s.indexOf('{') === -1) return s;
    var out = s.replace(/\{age\}/g, function () {
      var a = calcAge(profile.dob);
      return a ? (lang === 'th' ? a + ' ปี' : a + ' years') : '';
    }).replace(/\{dob\}/g, function () { return fmtDob(profile.dob, lang, be); });
    return out.trim();
  }

  function slug(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9-_]+/g, '-').replace(/^-+|-+$/g, ''); }

  function workId(row, i) { return slug(row.id) || 'w' + (i + 1); }

  // [[route|label]] becomes a link; everything else is escaped plain text
  function hubHTML(text, lang) {
    var out = '', last = 0, n = 0, re = /\[\[([a-z]+)\|([^\]]+)\]\]/g, m;
    text = String(text || '');
    while ((m = re.exec(text))) {
      out += esc(text.slice(last, m.index));
      if (ROUTES.indexOf(m[1]) !== -1) {
        out += '<a class="mark" style="--i:' + (n++) + '" href="#/' + m[1] + '" data-route>' + esc(m[2]) + '</a>';
      } else { out += esc(m[2]); }
      last = m.index + m[0].length;
    }
    return out + esc(text.slice(last));
  }

  function parseRoute(hash) {
    var h = String(hash || '').replace(/^#\/?/, '').split('/').filter(Boolean);
    var l1 = ROUTES.indexOf(h[0]) !== -1 ? h[0] : null;
    return { l1: l1, l2: l1 === 'works' && h[1] ? decodeURIComponent(h[1]) : null };
  }

  var lib = {
    parseCSV: parseCSV, rowsToObjects: rowsToObjects, hasHeaders: hasHeaders, flag: flag, esc: esc, safeUrl: safeUrl, imageUrl: imageUrl, imageList: imageList, inline: inline,
    paragraphs: paragraphs, parseMonth: parseMonth, fmtMonth: fmtMonth, fmtRange: fmtRange, sortByDate: sortByDate, calcAge: calcAge,
    fmtDob: fmtDob, pick: pick, catLabel: catLabel, orderCats: orderCats, fillTokens: fillTokens, hubHTML: hubHTML, parseRoute: parseRoute, slug: slug, T: T
  };
  if (typeof module !== 'undefined' && module.exports) { module.exports = lib; }
  if (typeof document === 'undefined') return;

  /* ------------------------------------------------------------------ app state */
  var cfg = root.CV_CONFIG || {};
  var BE = !!cfg.buddhistYear;
  var state = { lang: 'th', data: null, route: { l1: null, l2: null }, filter: 'all', version: 0, lastFocus: null };
  var $ = function (id) { return document.getElementById(id); };
  var els = {};

  function readStore(k) { try { return root.localStorage.getItem(k); } catch (e) { return null; } }
  function writeStore(k, v) { try { root.localStorage.setItem(k, v); } catch (e) { /* private mode */ } }

  function initialLang() {
    var q = /[?&]lang=(th|en)\b/.exec(root.location.search);
    if (q) return q[1];
    var s = readStore('cv-lang');
    if (s === 'th' || s === 'en') return s;
    return cfg.defaultLang === 'en' ? 'en' : 'th';
  }

  /* ------------------------------------------------------------------ data */
  function tabUrl(name) {
    if (cfg.tabUrls && cfg.tabUrls[name]) return cfg.tabUrls[name];
    if (cfg.sheetId) {
      return 'https://docs.google.com/spreadsheets/d/' + encodeURIComponent(cfg.sheetId) + '/gviz/tq?tqx=out:csv&headers=1&sheet=' + encodeURIComponent(name);
    }
    return null;
  }

  function fetchTab(name) {
    var url = tabUrl(name);
    if (!url) return Promise.reject(new Error('no url'));
    var ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = ctl ? setTimeout(function () { ctl.abort(); }, 9000) : null;
    return fetch(url, { cache: 'no-store', signal: ctl ? ctl.signal : undefined }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.text();
    }).then(function (txt) {
      var rows = parseCSV(txt);
      if (!hasHeaders(rows, name)) throw new Error('tab "' + name + '" is missing or has unexpected headers');
      return rowsToObjects(rows);
    }).then(function (v) { if (timer) clearTimeout(timer); return v; }, function (e) { if (timer) clearTimeout(timer); throw e; });
  }

  function cloneData(d) { return JSON.parse(JSON.stringify(d)); }

  function loadCache() {
    var raw = readStore(CACHE_KEY);
    if (!raw) return null;
    try { var c = JSON.parse(raw); return c && c.data ? c : null; } catch (e) { return null; }
  }

  function refreshFromSheet() {
    if (!cfg.sheetId && !(cfg.tabUrls && Object.keys(cfg.tabUrls).length)) return Promise.resolve();
    var cache = loadCache();
    var ttl = (cfg.cacheMinutes == null ? 5 : cfg.cacheMinutes) * 60000;
    if (cache && Date.now() - cache.t < ttl) return Promise.resolve();
    return Promise.all(TABS.map(function (t) {
      return fetchTab(t).then(function (rows) { return { t: t, rows: rows }; }, function (e) {
        if (root.console) console.warn('[cv] ' + t + ': ' + e.message);
        return null;
      });
    })).then(function (res) {
      var changed = false;
      res.forEach(function (x) { if (x) { state.data[x.t] = x.rows; changed = true; } });
      if (changed) {
        writeStore(CACHE_KEY, JSON.stringify({ t: Date.now(), data: state.data }));
        state.version++;
        renderAll();
      }
    });
  }

  /* ------------------------------------------------------------------ builders */
  function ctx() {
    var d = state.data, lang = state.lang;
    return { lang: lang, t: T[lang], d: d, p: profileMap(d.profile, lang), pAll: profileMap(d.profile, 'en') };
  }

  function visible(rows, key) { return (rows || []).filter(function (r) { return flag(r[key]); }); }

  function factRows(rows, c, key, withUrl) {
    return visible(rows, key).map(function (r) {
      var v = fillTokens(pick(r, 'value', c.lang), c.p, c.lang, BE);
      var label = pick(r, 'label', c.lang);
      if (!v) return null;
      var url = withUrl ? safeUrl(r.url) : '';
      return { label: label, value: v, url: url, key: r.key };
    }).filter(Boolean);
  }

  function displayName(c) {
    var name = c.p.name || c.pAll.name || '';
    var nick = c.p.nickname || c.pAll.nickname || '';
    return { name: name, nick: nick, full: name + (nick ? ' (' + nick + ')' : '') };
  }

  function photoSrc(c) { return safeUrl(c.p.photo) || 'assets/portrait.jpg'; }

  // Optional "categories" tab: names a category in both languages and sets the order of the filter buttons.
  function catRow(c, cat) {
    var k = String(cat).toLowerCase(), rows = (c.d && c.d.categories) || [];
    for (var i = 0; i < rows.length; i++) { if (String(rows[i].category || '').trim().toLowerCase() === k) return rows[i]; }
    return null;
  }
  function catLabel(c, cat) {
    var r = catRow(c, cat), fromTab = r ? pick(r, 'label', c.lang) : '';
    return fromTab || c.t.cat[String(cat).toLowerCase()] || cat;
  }
  function orderCats(c, cats) {
    var known = ((c.d && c.d.categories) || []).map(function (r) { return String(r.category || '').trim().toLowerCase(); });
    return cats.map(function (k, i) { var at = known.indexOf(k); return { k: k, o: at === -1 ? known.length + i : at }; })
      .sort(function (a, b) { return a.o - b.o; }).map(function (x) { return x.k; });
  }

  function tagHTML(text) { return text ? '<span class="tag">' + esc(text) + '</span>' : ''; }

  function aboutSection(c) {
    var n = displayName(c);
    var facts = factRows(c.d.details, c, 'web', false);
    var h = '<div class="about"><img class="about-photo" src="' + esc(photoSrc(c)) + '" alt="" width="240" height="240">' +
      '<div class="about-text"><h1 id="sheet-title" class="display">' + esc(n.full) + '</h1>' +
      '<p class="sub">' + esc([c.p.role, c.p.location].filter(Boolean).join(c.lang === 'th' ? ' ' : ', ')) + '</p>' +
      '<div class="prose-body">' + paragraphs(c.p.bio) + '</div></div></div>';
    if (facts.length) {
      h += '<h2 class="h2">' + esc(c.t.details) + '</h2><dl class="facts">' + facts.map(function (f) {
        return '<div><dt>' + esc(f.label) + '</dt><dd>' + esc(f.value) + '</dd></div>';
      }).join('') + '</dl>';
    }
    return { title: c.t.about, html: h };
  }

  function worksSection(c) {
    var rows = visible(c.d.works, 'web').map(function (r, i) { r._id = workId(r, i); return r; });
    var cats = [];
    rows.forEach(function (r) { var k = String(r.category || '').toLowerCase(); if (k && cats.indexOf(k) === -1) cats.push(k); });
    cats = orderCats(c, cats);
    if (state.filter !== 'all' && cats.indexOf(state.filter) === -1) state.filter = 'all';
    var h = '<h1 id="sheet-title" class="display">' + esc(c.t.works) + '</h1>';
    if (!rows.length) return { title: c.t.works, html: h + '<p class="empty">' + esc(c.t.empty) + '</p>' };
    if (cats.length > 1) {
      h += '<div class="chips" role="group" aria-label="' + esc(c.t.filter) + '">' +
        ['all'].concat(cats).map(function (k) {
          var on = state.filter === k;
          return '<button type="button" class="chip" data-filter="' + esc(k) + '" aria-pressed="' + on + '">' + esc(k === 'all' ? c.t.all : catLabel(c, k)) + '</button>';
        }).join('') + '</div>';
    }
    var shown = rows.filter(function (r) { return state.filter === 'all' || String(r.category).toLowerCase() === state.filter; });
    var groups = [], map = {};
    shown.forEach(function (r) {
      var g = pick(r, 'project', c.lang) || '';
      if (!map[g]) { map[g] = []; groups.push(g); }
      map[g].push(r);
    });
    if (!shown.length) h += '<p class="empty">' + esc(c.t.emptyCat) + '</p>';
    groups.forEach(function (g) {
      h += '<section class="proj">' + (g ? '<h2 class="h2">' + esc(g) + '</h2>' : '') + '<ul class="works-list">' +
        map[g].map(function (r) {
          var meta = [r.year, r.publisher].filter(Boolean).map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('');
          var sum = pick(r, 'summary', c.lang);
          return '<li><a class="work" href="#/works/' + esc(r._id) + '" data-route>' +
            '<span class="work-title">' + esc(pick(r, 'title', c.lang)) + '</span>' +
            '<span class="work-meta">' + tagHTML(catLabel(c, r.category)) + meta + '</span>' +
            (sum ? '<span class="work-sum">' + esc(sum) + '</span>' : '') + '</a></li>';
        }).join('') + '</ul></section>';
    });
    return { title: c.t.works, html: h };
  }

  function findWork(c, id) {
    var rows = visible(c.d.works, 'web');
    for (var i = 0; i < rows.length; i++) { if (workId(rows[i], i) === id) return rows[i]; }
    return null;
  }

  function readSection(c, r) {
    var url = safeUrl(r.url), cover = imageUrl(r.cover), pics = imageList(r.images), sum = pick(r, 'summary', c.lang), body = pick(r, 'body', c.lang);
    var meta = [r.year, r.publisher].filter(Boolean).map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('');
    var h = '<article class="read"><p class="work-meta">' + tagHTML(catLabel(c, r.category)) + meta + '</p>' +
      '<h1 id="sheet-title" class="display">' + esc(pick(r, 'title', c.lang)) + '</h1>' +
      (sum ? '<p class="read-sum">' + esc(sum) + '</p>' : '') +
      (cover ? '<img class="read-cover" src="' + esc(cover) + '" alt="" referrerpolicy="no-referrer">' : '') +
      pics.map(function (src) { return '<img class="read-pic" src="' + esc(src) + '" alt="" loading="lazy" referrerpolicy="no-referrer">'; }).join('') +
      (body ? '<div class="read-body">' + paragraphs(body) + '</div>' : '') +
      (url ? '<p><a class="btn" href="' + esc(url) + '"' + linkAttrs(url) + '>' + esc(c.t.readOriginal) + '</a></p>' : '') + '</article>';
    return { title: pick(r, 'title', c.lang), html: h };
  }

  function experienceSection(c) {
    var rows = sortByDate(visible(c.d.experience, 'web'));
    var h = '<h1 id="sheet-title" class="display">' + esc(c.t.experience) + '</h1><ol class="timeline">' + rows.map(function (r) {
      var when = fmtRange(r.start, r.end, c.lang, BE), type = c.t.type[String(r.type || '').toLowerCase()];
      var note = pick(r, 'note', c.lang);
      return '<li><div class="when">' + esc(when) + '</div><div class="what"><h2 class="org">' + esc(pick(r, 'org', c.lang)) + '</h2>' +
        '<p class="role">' + esc(pick(r, 'role', c.lang)) + (type ? ' ' + tagHTML(type) : '') + '</p>' +
        (note ? '<p class="note">' + esc(note) + '</p>' : '') + '</div></li>';
    }).join('') + '</ol>';
    return { title: c.t.experience, html: h };
  }

  function skillGroups(c, key) {
    var groups = [], map = {};
    visible(c.d.skills, key).forEach(function (r) {
      var g = pick(r, 'group', c.lang), n = pick(r, 'name', c.lang);
      if (!n) return;
      if (!map[g]) { map[g] = []; groups.push(g); }
      map[g].push(n);
    });
    return groups.map(function (g) { return { name: g, items: map[g] }; });
  }

  function educationSection(c) {
    var edu = sortByDate(visible(c.d.education, 'web'));
    var h = '<h1 id="sheet-title" class="display">' + esc(c.t.education) + '</h1>';
    if (edu.length) {
      h += '<h2 class="h2">' + esc(c.t.educationH) + '</h2><ol class="timeline">' + edu.map(function (r) {
        var deg = [pick(r, 'degree', c.lang), pick(r, 'field', c.lang)].filter(Boolean).join(c.lang === 'th' ? ' ' : ', ');
        if (pick(r, 'degree', c.lang) && pick(r, 'field', c.lang) && c.lang === 'th') deg = pick(r, 'degree', c.lang) + ' สาขา' + pick(r, 'field', c.lang);
        return '<li><div class="when">' + esc(fmtRange(r.start, r.end, c.lang, BE)) + '</div><div class="what"><h3 class="org">' + esc(pick(r, 'school', c.lang)) + '</h3>' +
          '<p class="role">' + esc(deg) + '</p>' + (r.gpa ? '<p class="note">' + esc(c.t.gpa + ' ' + r.gpa) + '</p>' : '') + '</div></li>';
      }).join('') + '</ol>';
    }
    var sk = skillGroups(c, 'web');
    if (sk.length) {
      h += '<h2 class="h2">' + esc(c.t.skills) + '</h2>' + sk.map(function (g) {
        return '<div class="skill-group"><h3 class="h3">' + esc(g.name) + '</h3><ul class="skills">' +
          g.items.map(function (n) { return '<li>' + esc(n) + '</li>'; }).join('') + '</ul></div>';
      }).join('');
    }
    return { title: c.t.education, html: h };
  }

  function contactSection(c) {
    var rows = factRows(c.d.contact, c, 'web', true);
    var h = '<h1 id="sheet-title" class="display">' + esc(c.t.contact) + '</h1><ul class="contact-list">' + rows.map(function (r) {
      var v = r.url ? '<a href="' + esc(r.url) + '"' + linkAttrs(r.url) + '>' + esc(r.value) + '</a>' : esc(r.value);
      return '<li><span class="c-label">' + esc(r.label) + '</span><span class="c-value">' + v + '</span></li>';
    }).join('') + '</ul>' +
      '<p><a class="btn" href="#/cv" data-route>' + esc(c.t.saveCv) + '</a></p>';
    return { title: c.t.contact, html: h };
  }

  function cvPaper(c) {
    var n = displayName(c), t = c.t;
    var contact = factRows(c.d.contact, c, 'print', true);
    var details = factRows(c.d.details, c, 'print', false);
    var skills = skillGroups(c, 'print');
    var exp = sortByDate(visible(c.d.experience, 'print'));
    var edu = sortByDate(visible(c.d.education, 'print'));
    var works = visible(c.d.works, 'print');
    var site = /^https?:/.test(root.location.protocol) ? root.location.origin + root.location.pathname.replace(/index\.html$/, '') : '';
    var left = '';
    if (contact.length || site) {
      left += '<section><h2>' + esc(t.contactH) + '</h2><ul class="p-list">' + contact.map(function (r) {
        return '<li><span>' + esc(r.label) + '</span>' + esc(r.value) + '</li>';
      }).join('') + (site ? '<li><span>' + esc(t.portfolio) + '</span>' + esc(site.replace(/^https?:\/\//, '')) + '</li>' : '') + '</ul></section>';
    }
    if (details.length) {
      left += '<section><h2>' + esc(t.details) + '</h2><ul class="p-list">' + details.map(function (r) {
        return '<li><span>' + esc(r.label) + '</span>' + esc(r.value) + '</li>';
      }).join('') + '</ul></section>';
    }
    if (skills.length) {
      left += '<section><h2>' + esc(t.skills) + '</h2>' + skills.map(function (g) {
        return '<h3>' + esc(g.name) + '</h3><ul class="p-plain">' + g.items.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>';
      }).join('') + '</section>';
    }
    var right = '';
    if (c.p.bio) right += '<section><h2>' + esc(t.profile) + '</h2><div class="p-bio">' + paragraphs(c.p.bio) + '</div></section>';
    if (exp.length) {
      right += '<section><h2>' + esc(t.experience) + '</h2>' + exp.map(function (r) {
        var note = pick(r, 'note', c.lang), type = t.type[String(r.type || '').toLowerCase()];
        return '<div class="p-item"><div class="p-row"><strong>' + esc(pick(r, 'org', c.lang)) + '</strong><span>' + esc(fmtRange(r.start, r.end, c.lang, BE)) + '</span></div>' +
          '<div class="p-sub">' + esc(pick(r, 'role', c.lang)) + (type ? ' (' + esc(type) + ')' : '') + (note ? ', ' + esc(note) : '') + '</div></div>';
      }).join('') + '</section>';
    }
    if (edu.length) {
      right += '<section><h2>' + esc(t.educationH) + '</h2>' + edu.map(function (r) {
        var sub = [pick(r, 'degree', c.lang), pick(r, 'field', c.lang)].filter(Boolean).join(c.lang === 'th' ? ' ' : ', ');
        return '<div class="p-item"><div class="p-row"><strong>' + esc(pick(r, 'school', c.lang)) + '</strong><span>' + esc(fmtRange(r.start, r.end, c.lang, BE)) + '</span></div>' +
          '<div class="p-sub">' + esc(sub) + (r.gpa ? ', ' + esc(t.gpa + ' ' + r.gpa) : '') + '</div></div>';
      }).join('') + '</section>';
    }
    if (works.length) {
      right += '<section><h2>' + esc(t.selected) + '</h2>' + works.map(function (r) {
        return '<div class="p-item"><div class="p-row"><strong>' + esc(pick(r, 'title', c.lang)) + '</strong><span>' + esc(r.year || '') + '</span></div>' +
          '<div class="p-sub">' + esc([catLabel(c, r.category), r.publisher].filter(Boolean).join(', ')) + '</div></div>';
      }).join('') + '</section>';
    }
    return '<article class="paper"><header class="p-head"><div><h1>' + esc(n.name) + (n.nick ? ' <em>(' + esc(n.nick) + ')</em>' : '') + '</h1>' +
      '<p>' + esc([c.p.role, c.p.location].filter(Boolean).join(c.lang === 'th' ? ' ' : ', ')) + '</p></div>' +
      '<img src="' + esc(photoSrc(c)) + '" alt="" width="96" height="96"></header>' +
      '<div class="p-cols"><aside>' + left + '</aside><div class="p-main">' + right + '</div></div></article>';
  }

  function cvSection(c) {
    var h = '<h1 id="sheet-title" class="display">' + esc(c.t.cv) + '</h1>' +
      '<div class="cv-tools"><button type="button" class="btn" id="print-btn">' + esc(c.t.saveCv) + '</button>' +
      '<p class="hint">' + esc(c.t.saveHint) + ' ' + esc(c.t.cvLang) + '</p></div>' +
      '<div class="cv-stage" id="cv-stage"><div class="cv-scale" id="cv-scale">' + cvPaper(c) + '</div></div>';
    return { title: c.t.cv, html: h };
  }

  var BUILD = { about: aboutSection, works: worksSection, experience: experienceSection, education: educationSection, contact: contactSection, cv: cvSection };

  /* ------------------------------------------------------------------ rendering */
  function renderHub() {
    var c = ctx(), n = displayName(c);
    $('who-name').textContent = n.full;
    $('who-role').textContent = [c.p.role, c.p.location].filter(Boolean).join(c.lang === 'th' ? ' ' : ', ');
    $('portrait').src = photoSrc(c);
    $('hub-prose').innerHTML = hubHTML(c.p.hub || '', c.lang);
    $('hub-nav').setAttribute('aria-label', c.t.sections);
    $('hub-nav').innerHTML = ['about', 'works', 'experience', 'education', 'contact'].map(function (k) {
      return '<a href="#/' + k + '" data-route>' + esc(c.t[k]) + '</a>';
    }).join('');
    $('cv-link').textContent = c.t.saveCv;
    $('lang-group').setAttribute('aria-label', c.t.language);
    Array.prototype.forEach.call(document.querySelectorAll('[data-lang]'), function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === c.lang));
    });
    $('hub-foot').textContent = c.t.copyright(new Date().getFullYear(), n.name);
    $('print-root').innerHTML = cvPaper(c);
    document.documentElement.lang = c.lang;
  }

  function fillSheet(level, built) {
    var sheet = els['sheet' + level], scroller = sheet.querySelector('.sheet-scroll'), top = scroller.scrollTop;
    var c = ctx();
    sheet.querySelector('.sheet-inner').innerHTML = built.html;
    sheet.querySelector('.sheet-crumb').textContent = built.title;
    var heading = sheet.querySelector('#sheet-title');
    if (heading) heading.id = 'sheet' + level + '-title';
    sheet.setAttribute('aria-labelledby', 'sheet' + level + '-title');
    sheet.querySelector('.sheet-close').textContent = c.t.close;
    var back = sheet.querySelector('.sheet-back');
    if (back) back.textContent = c.t.back(c.t.works);
    scroller.scrollTop = top;
    sheet.dataset.key = state.lang + '|' + state.version + '|' + (state.route.l1 || '') + '|' + (state.route.l2 || '');
  }

  function renderSheets(opts) {
    opts = opts || {};
    var r = state.route, c = ctx();
    var l1 = r.l1 ? BUILD[r.l1](c) : null;
    var work = r.l2 ? findWork(c, r.l2) : null;
    var wasOpen = els.sheet1.classList.contains('open');

    if (l1) {
      var k1 = state.lang + '|' + state.version + '|' + r.l1;
      var fresh1 = els.sheet1.dataset.k1 !== k1;
      if (fresh1) els.sheet1.querySelector('.sheet-scroll').scrollTop = 0;
      fillSheet(1, l1);
      els.sheet1.dataset.k1 = k1;
    }
    if (work) {
      var k2 = state.lang + '|' + state.version + '|' + r.l2;
      if (els.sheet2.dataset.k2 !== k2) els.sheet2.querySelector('.sheet-scroll').scrollTop = 0;
      fillSheet(2, readSection(c, work));
      els.sheet2.dataset.k2 = k2;
    }
    var open1 = !!l1, open2 = !!work;
    if (open1 && !wasOpen) state.lastFocus = document.activeElement;

    els.sheet1.classList.toggle('open', open1);
    els.sheet2.classList.toggle('open', open2);
    els.sheet1.classList.toggle('under', open2);
    els.scrim.classList.toggle('on', open1);
    els.hub.inert = open1;
    els.sheet1.inert = !open1 || open2;
    els.sheet2.inert = !open2;
    els.sheet1.setAttribute('aria-hidden', String(!open1 || open2));
    els.sheet2.setAttribute('aria-hidden', String(!open2));
    document.documentElement.classList.toggle('locked', open1);

    var name = displayName(c).name;
    document.title = (open2 ? pick(work, 'title', c.lang) : l1 ? l1.title : displayName(c).full + (c.p.role ? ' – ' + c.p.role : '')) + (open1 ? ' – ' + name : '');

    if (!opts.keepFocus) {
      if (open2) els.sheet2.focus({ preventScroll: true });
      else if (open1 && !wasOpen) els.sheet1.focus({ preventScroll: true });
      else if (open1 && !open2 && opts.fromL2) els.sheet1.focus({ preventScroll: true });
      else if (!open1 && wasOpen) {
        var f = state.lastFocus;
        if (f && document.contains(f) && f.focus) f.focus({ preventScroll: true }); else $('hub-prose').focus({ preventScroll: true });
      }
    }
    if (r.l1 === 'cv') { fitCv(); }
  }

  function fitCv() {
    var stage = $('cv-stage'), scale = $('cv-scale');
    if (!stage || !scale) return;
    var paper = scale.firstElementChild;
    var apply = function () {
      var w = stage.clientWidth, base = 793.7, s = Math.min(1, w / base);
      scale.style.transform = 'scale(' + s + ')';
      stage.style.height = Math.ceil(paper.offsetHeight * s) + 'px';
    };
    apply();
    if (root.requestAnimationFrame) root.requestAnimationFrame(apply);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(apply);
  }

  function renderAll() {
    renderHub();
    renderSheets({ keepFocus: true });
  }

  function applyRoute() {
    var before = state.route;
    state.route = parseRoute(root.location.hash);
    renderSheets({ fromL2: !!before.l2 && !state.route.l2 });
  }

  /* ------------------------------------------------------------------ navigation */
  function go(route) {
    var hash = '#' + route;
    if (root.location.hash === hash) return;
    root.history.pushState({ app: 1 }, '', hash);
    applyRoute();
  }

  function closeTop() {
    var r = state.route;
    if (!r.l1) return;
    var parent = r.l2 ? '#/works' : '#/';
    if (root.history.state && root.history.state.app) { root.history.back(); return; }
    root.history.replaceState({ app: 1 }, '', root.location.pathname + root.location.search + parent);
    applyRoute();
  }

  function closeAll() {
    if (!state.route.l1) return;
    root.history.pushState({ app: 1 }, '', root.location.pathname + root.location.search + '#/');
    applyRoute();
  }

  function setLang(l) {
    if (l === state.lang) return;
    state.lang = l;
    writeStore('cv-lang', l);
    try {
      var u = new URL(root.location.href);
      u.searchParams.set('lang', l);
      root.history.replaceState(root.history.state, '', u.pathname + u.search + u.hash);
    } catch (e) { /* file:// or old browser */ }
    renderAll();
  }

  function bind() {
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var t = e.target.closest ? e.target.closest('a[data-route], button, [data-close]') : null;
      if (!t) return;
      if (t.tagName === 'A' && t.hasAttribute('data-route')) {
        e.preventDefault();
        var href = t.getAttribute('href');
        if (root.location.hash !== href) { root.history.pushState({ app: 1 }, '', href); applyRoute(); }
        return;
      }
      if (t.hasAttribute('data-lang')) { setLang(t.getAttribute('data-lang')); return; }
      if (t.hasAttribute('data-filter')) { state.filter = t.getAttribute('data-filter'); renderSheets({ keepFocus: true }); var again = els.sheet1.querySelector('[data-filter="' + state.filter + '"]'); if (again) again.focus({ preventScroll: true }); return; }
      if (t.id === 'print-btn') { root.print(); return; }
      if (t.classList.contains('sheet-back')) { closeTop(); return; }
      if (t.classList.contains('sheet-close')) { if (t.closest('#sheet2')) closeAll(); else closeTop(); return; }
    });
    els.scrim.addEventListener('click', closeTop);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && state.route.l1) { e.preventDefault(); closeTop(); } });
    root.addEventListener('popstate', applyRoute);
    root.addEventListener('hashchange', applyRoute);
    root.addEventListener('resize', function () { if (state.route.l1 === 'cv') fitCv(); });
    root.addEventListener('beforeprint', function () { $('print-root').innerHTML = cvPaper(ctx()); });
  }

  /* ------------------------------------------------------------------ start */
  function start() {
    ['hub', 'scrim', 'sheet1', 'sheet2'].forEach(function (id) { els[id] = $(id); });
    state.lang = initialLang();
    var cache = loadCache();
    state.data = cache ? Object.assign(cloneData(root.CV_FALLBACK || {}), cache.data) : cloneData(root.CV_FALLBACK || {});
    TABS.forEach(function (t) { if (!state.data[t]) state.data[t] = []; });
    bind();
    state.route = parseRoute(root.location.hash);
    renderHub();
    renderSheets({});
    document.documentElement.classList.add('ready');
    refreshFromSheet();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})(typeof window !== 'undefined' ? window : globalThis);
