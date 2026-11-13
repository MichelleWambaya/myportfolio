/* Thumbnail pop up viewer.
   Works with .thumb, .g-item, .pg-item and .sg-item on any page.
   Optional attributes on each item:
     data-title   project name (falls back to the image alt text)
     data-meta    short line such as "Poster, Canva"
     data-desc    one or two sentences about the project
     data-full    large image to open (falls back to the thumbnail)
     data-images  comma separated extra images for the "More from this project" strip
*/
(function () {
  var all = [].slice.call(document.querySelectorAll('.thumb,.g-item,.pg-item,.sg-item'));
  if (!all.length) return;

  var lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.setAttribute('aria-label', 'Project viewer');
  lb.innerHTML =
    '<div class="lb-panel">' +
      '<div class="lb-img">' +
        '<button type="button" class="lb-nav lb-prev" aria-label="Previous project">&#8249;</button>' +
        '<img alt="">' +
        '<button type="button" class="lb-nav lb-next" aria-label="Next project">&#8250;</button>' +
      '</div>' +
      '<div class="lb-info">' +
        '<button type="button" class="lb-close" aria-label="Close viewer">&times;</button>' +
        '<h3 class="lb-title"></h3>' +
        '<p class="lb-meta mono"></p>' +
        '<p class="lb-desc"></p>' +
        '<p class="lb-more mono">More from this project</p>' +
        '<div class="lb-strip"></div>' +
      '</div>' +
    '</div>';
  document.body.appendChild(lb);

  var big = lb.querySelector('.lb-img img');
  var title = lb.querySelector('.lb-title');
  var meta = lb.querySelector('.lb-meta');
  var desc = lb.querySelector('.lb-desc');
  var more = lb.querySelector('.lb-more');
  var strip = lb.querySelector('.lb-strip');
  var closeBtn = lb.querySelector('.lb-close');
  var current = -1, lastFocus = null;

  function visible() {
    return all.filter(function (el) { return !el.classList.contains('hide'); });
  }

  function info(el) {
    var img = el.querySelector('img');
    var cap = el.querySelector('.g-cap,.pg-cap,.sg-tag,.t-label');
    var main = el.getAttribute('data-full') || (img && img.currentSrc) || (img && img.src) || '';
    var extra = (el.getAttribute('data-images') || '').split(',')
      .map(function (x) { return x.trim(); }).filter(Boolean);
    return {
      title: el.getAttribute('data-title') || (img && img.alt) || 'Project',
      meta: el.getAttribute('data-meta') || (cap ? cap.textContent.replace(/\s+/g, ' ').trim() : ''),
      desc: el.getAttribute('data-desc') || '',
      images: [main].concat(extra),
      alt: (img && img.alt) || ''
    };
  }

  function show(src, alt) { big.src = src; big.alt = alt; }

  function render(el) {
    var d = info(el);
    title.textContent = d.title;
    meta.textContent = d.meta;
    desc.textContent = d.desc;
    show(d.images[0], d.alt || d.title);
    strip.textContent = '';
    var many = d.images.length > 1;
    strip.style.display = more.style.display = many ? '' : 'none';
    if (many) {
      d.images.forEach(function (src, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', 'Show image ' + (i + 1) + ' of ' + d.images.length);
        b.setAttribute('aria-current', i === 0 ? 'true' : 'false');
        var im = document.createElement('img');
        im.src = src; im.alt = '';
        b.appendChild(im);
        b.addEventListener('click', function () {
          show(src, d.title);
          [].forEach.call(strip.children, function (c) { c.setAttribute('aria-current', 'false'); });
          b.setAttribute('aria-current', 'true');
        });
        strip.appendChild(b);
      });
    }
  }

  function open(el) {
    lastFocus = document.activeElement;
    current = visible().indexOf(el);
    render(el);
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function close() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function step(n) {
    var v = visible();
    if (!v.length) return;
    current = (current + n + v.length) % v.length;
    render(v[current]);
  }

  all.forEach(function (el) {
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');
    el.addEventListener('click', function (e) { e.preventDefault(); open(el); });
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(el); }
    });
  });

  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
  closeBtn.addEventListener('click', close);
  lb.querySelector('.lb-prev').addEventListener('click', function () { step(-1); });
  lb.querySelector('.lb-next').addEventListener('click', function () { step(1); });
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'ArrowRight') step(1);
  });
})();
