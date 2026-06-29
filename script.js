(() => {
  'use strict';

  const dom = {
    cursor: document.getElementById('cursor'),
    cursorRing: document.getElementById('cursor-ring'),
    canvas: document.getElementById('particle-canvas'),
    nav: document.querySelector('nav'),
    logoPath: document.getElementById('logo-path'),
    logoFill: document.getElementById('logo-path-fill'),
    logoGlow: document.getElementById('logo-glow')
  };

  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  if (hasGsap) {
    gsap.registerPlugin(ScrollTrigger);
  }

  initCustomCursor(dom);
  initParticles(dom.canvas);
  initAnimations(dom, hasGsap);
  initNavBehavior(dom.nav);

  function initCustomCursor({ cursor, cursorRing }) {
    if (!cursor || !cursorRing) return;

    const useCustomCursor = window.matchMedia('(pointer:fine)').matches;
    if (!useCustomCursor) {
      cursor.style.display = 'none';
      cursorRing.style.display = 'none';
      return;
    }

    document.body.style.cursor = 'none';

    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;

    document.addEventListener('mousemove', (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
    });

    const animateCursor = () => {
      cursor.style.left = `${mouseX}px`;
      cursor.style.top = `${mouseY}px`;

      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      cursorRing.style.left = `${ringX}px`;
      cursorRing.style.top = `${ringY}px`;

      requestAnimationFrame(animateCursor);
    };
    animateCursor();

    document.querySelectorAll('button, a, .feature-card').forEach((element) => {
      element.addEventListener('mouseenter', () => {
        cursor.style.transform = 'translate(-50%,-50%) scale(2)';
        cursorRing.style.transform = 'translate(-50%,-50%) scale(1.5)';
        cursorRing.style.borderColor = 'rgba(139,92,246,0.7)';
      });

      element.addEventListener('mouseleave', () => {
        cursor.style.transform = 'translate(-50%,-50%) scale(1)';
        cursorRing.style.transform = 'translate(-50%,-50%) scale(1)';
        cursorRing.style.borderColor = 'rgba(0,212,255,0.5)';
      });
    });
  }

  function initParticles(canvas) {
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    let width = 0;
    let height = 0;
    const particles = [];
    const particleCount = 120;
    const maxConnectionDistance = 100;
    const maxConnectionDistanceSquared = maxConnectionDistance * maxConnectionDistance;

    const resizeCanvas = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.life = Math.random();
        this.size = Math.random() * 2 + 0.5;
        this.color = Math.random() > 0.6 ? '#00d4ff' : '#8b5cf6';
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= 0.003;

        if (this.life <= 0 || this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
          this.reset();
        }
      }

      draw() {
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        context.fillStyle = this.color;
        context.globalAlpha = this.life * 0.6;
        context.fill();
      }
    }

    for (let index = 0; index < particleCount; index += 1) {
      particles.push(new Particle());
    }

    const drawConnections = () => {
      for (let i = 0; i < particles.length; i += 1) {
        for (let j = i + 1; j < particles.length; j += 1) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distanceSquared = dx * dx + dy * dy;

          if (distanceSquared < maxConnectionDistanceSquared) {
            const distance = Math.sqrt(distanceSquared);
            context.beginPath();
            context.moveTo(particles[i].x, particles[i].y);
            context.lineTo(particles[j].x, particles[j].y);
            context.strokeStyle = '#00d4ff';
            context.globalAlpha = (1 - distance / maxConnectionDistance) * 0.08;
            context.lineWidth = 0.5;
            context.stroke();
          }
        }
      }
    };

    const animateParticles = () => {
      context.clearRect(0, 0, width, height);
      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });
      drawConnections();
      context.globalAlpha = 1;
      requestAnimationFrame(animateParticles);
    };
    animateParticles();
  }

  function initAnimations(domRefs, canAnimateWithGsap) {
    if (!canAnimateWithGsap) {
      showStaticFallback();
      return;
    }

    animateHero();
    animateStats();
    animateFeatures();
    animateLogoDraw(domRefs);
    animateProcess();
    animateTestimonial();
    animateCta();
    animateHeroParallax();
  }

  function animateHero() {
    const heroTimeline = gsap.timeline({ delay: 0.3 });
    heroTimeline
      .to('.hero-tag', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' })
      .to('.hero-headline .word', { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' }, '-=0.2')
      .to('.hero-sub', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.3')
      .to('.hero-cta-group', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.3')
      .to('.scroll-indicator', { opacity: 0.6, duration: 0.6 }, '-=0.2');
  }

  function animateStats() {
    ScrollTrigger.create({
      trigger: '#stats',
      start: 'top 80%',
      onEnter: () => {
        gsap.to('.stat-item', { opacity: 1, y: 0, stagger: 0.12, duration: 0.7, ease: 'power2.out' });
        document.querySelectorAll('.stat-num').forEach((element) => {
          const target = Number.parseFloat(element.dataset.target || '0');
          const isDecimal = target % 1 !== 0;
          let current = 0;
          const step = target / 60;

          const timer = setInterval(() => {
            current = Math.min(current + step, target);
            element.textContent = isDecimal ? current.toFixed(2) : String(Math.floor(current));
            if (current >= target) clearInterval(timer);
          }, 16);
        });
      }
    });
  }

  function animateFeatures() {
    gsap.to('#features .section-tag', {
      opacity: 1,
      x: 0,
      duration: 0.6,
      scrollTrigger: { trigger: '#features', start: 'top 75%' }
    });

    gsap.to('#features .section-headline', {
      opacity: 1,
      y: 0,
      duration: 0.7,
      delay: 0.1,
      scrollTrigger: { trigger: '#features', start: 'top 75%' }
    });

    gsap.to('.feature-card', {
      opacity: 1,
      y: 0,
      stagger: 0.1,
      duration: 0.6,
      ease: 'power2.out',
      scrollTrigger: { trigger: '.features-grid', start: 'top 75%' }
    });
  }

  function animateLogoDraw({ logoPath, logoFill, logoGlow }) {
    gsap.to('#logo-container', {
      opacity: 1,
      scale: 1,
      duration: 1,
      ease: 'power2.out',
      scrollTrigger: { trigger: '#logo-draw', start: 'top 70%' }
    });

    ScrollTrigger.create({
      trigger: '#logo-draw',
      start: 'top 60%',
      end: 'bottom 40%',
      scrub: true,
      onUpdate: ({ progress }) => {
        const pathOffset = 800 - 800 * progress;
        if (logoPath) logoPath.style.strokeDashoffset = String(pathOffset);

        if (progress > 0.85) {
          const revealOpacity = ((progress - 0.85) / 0.15).toString();
          if (logoFill) logoFill.style.opacity = revealOpacity;
          if (logoGlow) logoGlow.style.opacity = revealOpacity;
        }
      }
    });

    gsap.to('#logo-draw .section-tag', {
      opacity: 1,
      x: 0,
      duration: 0.6,
      scrollTrigger: { trigger: '#logo-draw', start: 'top 80%' }
    });

    gsap.to('#logo-draw .section-headline', {
      opacity: 1,
      y: 0,
      duration: 0.7,
      scrollTrigger: { trigger: '#logo-draw', start: 'top 80%' }
    });
  }

  function animateProcess() {
    gsap.to('#process .section-tag', {
      opacity: 1,
      x: 0,
      duration: 0.6,
      scrollTrigger: { trigger: '#process', start: 'top 80%' }
    });

    gsap.to('#process .section-headline', {
      opacity: 1,
      y: 0,
      duration: 0.7,
      scrollTrigger: { trigger: '#process', start: 'top 80%' }
    });

    gsap.to('.process-step', {
      opacity: 1,
      x: 0,
      stagger: 0.15,
      duration: 0.7,
      ease: 'power2.out',
      scrollTrigger: { trigger: '.process-steps', start: 'top 75%' },
      onComplete: () => {
        document.querySelectorAll('.step-visual-bar').forEach((bar) => {
          bar.style.width = `${bar.dataset.width}%`;
        });
      }
    });
  }

  function animateTestimonial() {
    const quoteTimeline = gsap.timeline({
      scrollTrigger: { trigger: '#testimonial', start: 'top 70%' }
    });

    quoteTimeline
      .to('.quote-mark', { opacity: 0.2, scale: 1, duration: 0.5, ease: 'back.out(1.7)' })
      .to('.quote-text', { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, '-=0.2')
      .to('.quote-author', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.3');
  }

  function animateCta() {
    const ctaTimeline = gsap.timeline({
      scrollTrigger: { trigger: '#cta-final', start: 'top 70%' }
    });

    ctaTimeline
      .to('.cta-headline', { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' })
      .to('.cta-sub', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.3')
      .to('.cta-button-wrap', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.3');
  }

  function animateHeroParallax() {
    gsap.to('.hero-orb-1', {
      y: -120,
      scrollTrigger: { trigger: '#hero', scrub: 1, end: 'bottom top' }
    });

    gsap.to('.hero-orb-2', {
      y: -80,
      x: 40,
      scrollTrigger: { trigger: '#hero', scrub: 1.5, end: 'bottom top' }
    });

    gsap.to('.hero-orb-3', {
      y: -60,
      x: -30,
      scrollTrigger: { trigger: '#hero', scrub: 2, end: 'bottom top' }
    });
  }

  function showStaticFallback() {
    const animatedElementsSelector = [
      '.hero-tag',
      '.hero-headline .word',
      '.hero-sub',
      '.hero-cta-group',
      '.scroll-indicator',
      '.stat-item',
      '#features .section-tag',
      '#features .section-headline',
      '.feature-card',
      '#logo-container',
      '#logo-draw .section-tag',
      '#logo-draw .section-headline',
      '#process .section-tag',
      '#process .section-headline',
      '.process-step',
      '.quote-mark',
      '.quote-text',
      '.quote-author',
      '.cta-headline',
      '.cta-sub',
      '.cta-button-wrap'
    ].join(', ');

    document.querySelectorAll(animatedElementsSelector).forEach((element) => {
      element.style.opacity = '1';
      element.style.transform = 'none';
    });

    document.querySelectorAll('.step-visual-bar').forEach((bar) => {
      bar.style.width = `${bar.dataset.width || '100'}%`;
    });
  }

  function initNavBehavior(navElement) {
    if (!navElement) return;

    let lastScrollY = 0;
    window.addEventListener(
      'scroll',
      () => {
        const currentScrollY = window.scrollY;
        navElement.style.transform =
          currentScrollY > lastScrollY && currentScrollY > 100 ? 'translateY(-100%)' : 'translateY(0)';
        navElement.style.transition = 'transform 0.4s ease';
        lastScrollY = currentScrollY;
      },
      { passive: true }
    );
  }
})();

let currentLang = "en";

function applyLanguage() {
  document.querySelectorAll("[data-en]").forEach(el => {
    el.textContent = el.getAttribute("data-" + currentLang);
  });

  document.documentElement.lang = currentLang;
  document.documentElement.dir = currentLang === "fa" ? "rtl" : "ltr";

  const btn = document.getElementById("langBtn");
  if (btn) {
    btn.textContent = currentLang === "en" ? "فارسی" : "English";
  }
}

function toggleLanguage() {
  currentLang = currentLang === "en" ? "fa" : "en";
  applyLanguage();
}

window.addEventListener("DOMContentLoaded", () => {
  currentLang = "en";
  applyLanguage();
});
document.getElementById("viewWorkBtn")?.addEventListener("click", () => {
    window.location.href = "projects/projects.html";
});