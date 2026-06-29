(() => {
  "use strict";

  let currentLang = localStorage.getItem("nexoraLang") || "fa";

  const dom = {
    cursor: document.getElementById("cursor"),
    cursorRing: document.getElementById("cursor-ring"),
    langBtn: document.getElementById("languageToggle"),
    projectsGrid: document.getElementById("projectsGrid"),
    nav: document.querySelector(".projects-header")
  };

  initCustomCursor(dom);
  initLanguage();
  initProjects();
  initNavBehavior(dom.nav);

  function initCustomCursor({ cursor, cursorRing }) {
    if (!cursor || !cursorRing) return;

    const useCustomCursor = window.matchMedia("(pointer:fine)").matches;

    if (!useCustomCursor) {
      cursor.style.display = "none";
      cursorRing.style.display = "none";
      return;
    }

    document.body.style.cursor = "none";

    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;

    document.addEventListener("mousemove", (event) => {
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

    const hoverElements = "a, button, .project-card";

    document.addEventListener("mouseover", (event) => {
      if (!event.target.closest(hoverElements)) return;

      cursor.style.transform = "translate(-50%,-50%) scale(2)";
      cursorRing.style.transform = "translate(-50%,-50%) scale(1.5)";
      cursorRing.style.borderColor = "rgba(139,92,246,0.7)";
    });

    document.addEventListener("mouseout", (event) => {
      if (!event.target.closest(hoverElements)) return;

      cursor.style.transform = "translate(-50%,-50%) scale(1)";
      cursorRing.style.transform = "translate(-50%,-50%) scale(1)";
      cursorRing.style.borderColor = "rgba(0,212,255,0.5)";
    });
  }

  function initLanguage() {
    applyLanguage();

    if (!dom.langBtn) return;

    dom.langBtn.addEventListener("click", () => {
      currentLang = currentLang === "fa" ? "en" : "fa";
      localStorage.setItem("nexoraLang", currentLang);

      applyLanguage();
      initProjects();
    });
  }

  function applyLanguage() {
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === "fa" ? "rtl" : "ltr";

    document.querySelectorAll("[data-fa][data-en]").forEach((element) => {
      element.textContent = element.dataset[currentLang];
    });

    if (dom.langBtn) {
      dom.langBtn.textContent = currentLang === "fa" ? "EN" : "FA";
    }
  }

  async function initProjects() {
    if (!dom.projectsGrid) return;

    showLoading();

    try {
      const response = await fetch("projects.json");

      if (!response.ok) {
        throw new Error("Projects JSON not found");
      }

      const projects = await response.json();

      renderProjects(projects);
    } catch (error) {
      showError();
      console.error(error);
    }
  }

  function showLoading() {
    dom.projectsGrid.innerHTML = `
      <article class="project-card project-skeleton"></article>
      <article class="project-card project-skeleton"></article>
      <article class="project-card project-skeleton"></article>
    `;
  }

  function showError() {
    dom.projectsGrid.innerHTML = `
      <p class="projects-error">
        ${
          currentLang === "fa"
            ? "مشکلی در بارگذاری پروژه‌ها پیش آمد."
            : "Something went wrong while loading projects."
        }
      </p>
    `;
  }

  function renderProjects(projects) {
    dom.projectsGrid.innerHTML = "";

    projects.forEach((project, index) => {
      const title = project.title?.[currentLang] || project.title?.en || "";
      const category = project.category?.[currentLang] || project.category?.en || "";
      const description = project.description?.[currentLang] || project.description?.en || "";
      const buttonText = currentLang === "fa" ? "مشاهده پروژه" : "View Project";

      const tags = (project.tags || [])
        .map((tag) => `<span>${escapeHTML(tag)}</span>`)
        .join("");

      const card = document.createElement("article");
      card.className = "project-card";
      card.style.transitionDelay = `${index * 0.08}s`;

      card.innerHTML = `
        <div class="project-image">
          <img src="${escapeHTML(project.image)}" alt="${escapeHTML(title)}" loading="lazy">
        </div>

        <div class="project-content">
          <div class="project-category">${escapeHTML(category)}</div>

          <h3 class="project-title">${escapeHTML(title)}</h3>

          <p class="project-desc">${escapeHTML(description)}</p>

          <div class="project-tags">
            ${tags}
          </div>

          <a class="project-btn" href="${escapeHTML(project.url)}" target="_blank" rel="noopener">
            ${escapeHTML(buttonText)} <span class="btn-arrow">→</span>
          </a>
        </div>
      `;

      dom.projectsGrid.appendChild(card);
    });

    initScrollReveal();
  }

  function initScrollReveal() {
    const cards = document.querySelectorAll(".project-card:not(.project-skeleton)");

    if (!("IntersectionObserver" in window)) {
      cards.forEach((card) => card.classList.add("show"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("show");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -40px 0px"
      }
    );

    cards.forEach((card) => observer.observe(card));
  }

  function initNavBehavior(navElement) {
    if (!navElement) return;

    let lastScrollY = 0;

    window.addEventListener(
      "scroll",
      () => {
        const currentScrollY = window.scrollY;

        navElement.style.transform =
          currentScrollY > lastScrollY && currentScrollY > 100
            ? "translateY(-100%)"
            : "translateY(0)";

        navElement.style.transition = "transform 0.4s ease";

        lastScrollY = currentScrollY;
      },
      { passive: true }
    );
  }

  function escapeHTML(value = "") {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
})();