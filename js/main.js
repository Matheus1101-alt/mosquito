(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.remove('no-js');
  root.classList.add('js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', function () {
    var header = document.querySelector('.site-header');
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.getElementById('menu-principal');
    var navLinks = nav ? nav.querySelectorAll('a') : [];

    /* Header: fundo sólido após rolar ---------------------------------- */
    function onScroll() {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    /* Menu mobile ------------------------------------------------------ */
    function setMenu(open) {
      header.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    }

    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        var open = toggle.getAttribute('aria-expanded') !== 'true';
        setMenu(open);
        if (open && navLinks[0]) navLinks[0].focus();
      });

      navLinks.forEach(function (link) {
        link.addEventListener('click', function () { setMenu(false); });
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
          setMenu(false);
          toggle.focus();
        }
      });

      document.addEventListener('click', function (e) {
        if (header.classList.contains('is-open') && !header.contains(e.target)) setMenu(false);
      });

      window.matchMedia('(min-width: 1280px)').addEventListener('change', function (mq) {
        if (mq.matches) setMenu(false);
      });
    }

    /* Âncoras: foco acompanha o scroll (teclado / leitor de tela) ------- */
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var id = link.getAttribute('href').slice(1);
        var target = id && document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
        history.pushState(null, '', '#' + id);
      });
    });

    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal, .card, .combo').forEach(function (el) { el.classList.add('is-visible'); });
      document.getElementById('sticky-cta').classList.add('is-visible');
      return;
    }

    /* Revelar elementos ao entrar na tela ------------------------------ */
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.15 });

    document.querySelectorAll('.reveal, .combo').forEach(function (el) { revealObserver.observe(el); });

    /* Destacar o link da seção atual no menu --------------------------- */
    var linkById = {};
    navLinks.forEach(function (link) {
      var href = link.getAttribute('href');
      if (href && href.charAt(0) === '#') linkById[href.slice(1)] = link;
    });

    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = linkById[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          navLinks.forEach(function (l) { l.removeAttribute('aria-current'); });
          link.setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    Object.keys(linkById).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) sectionObserver.observe(section);
    });

    /* CTA fixo no mobile: some quando um CTA principal está visível ---- */
    var sticky = document.getElementById('sticky-cta');
    var watched = [document.getElementById('hero-cta'), document.getElementById('final-cta')].filter(Boolean);
    var visibleCtas = new Set();

    var ctaObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) visibleCtas.add(entry.target);
        else visibleCtas.delete(entry.target);
      });
      sticky.classList.toggle('is-visible', visibleCtas.size === 0);
    });

    watched.forEach(function (el) { ctaObserver.observe(el); });
  });
})();
