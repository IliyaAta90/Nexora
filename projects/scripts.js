(() => {
  "use strict";

  let currentLang = localStorage.getItem("nexoraLang") || "fa";

  const dom = {
    langBtn: document.getElementById("languageToggle"),
    projectsGrid: document.getElementById("projectsGrid"),
    nav: document.querySelector(".projects-header")
  };

  initLanguage();
  initProjects();
  initNavBehavior(dom.nav);

  function initLanguage() {
    applyLanguage();

    if (dom.langBtn) {
      dom.langBtn.addEventListener("click", () => {
        currentLang = currentLang === "fa" ? "en" : "fa";
        localStorage.setItem("nexoraLang", currentLang);
        applyLanguage();
        initProjects();
      });
    }
  }

  function applyLanguage() {
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === "fa" ? "rtl" : "ltr";

    document.querySelectorAll("[data-fa][data-en]").forEach((el) => {
      el.textContent = el.dataset[currentLang];
    });

    if (dom.langBtn) {
      dom.langBtn.textContent = currentLang === "fa" ? "EN" : "FA";
    }
  }

  async function initProjects() {
    if (!dom.projectsGrid) return;

    try {
      const response = await fetch("projects.json");

      if (!response.ok) {
        throw new Error("Projects JSON not found");
      }

      const projects = await response.json();
      renderProjects(projects);
    } catch (error) {
      dom.projectsGrid.innerHTML = `
        <p class="projects-error">
          ${currentLang === "fa"
            ? "مشکلی در بارگذاری پروژه‌ها پیش آمد."
            : "Something went wrong while loading projects."}
        </p>
      `;
      console.error(error);
    }
  }

  function renderProjects(projects) {
    dom.projectsGrid.innerHTML = "";

    projects.forEach((project, index) => {
      const title = project.title?.[currentLang] || project.title?.en || "";
      const category = project.category?.[currentLang] || project.category?.en || "";
      const description = project.description?.[currentLang] || project.description?.en || "";
      const buttonText = currentLang === "fa" ? "مشاهده پروژه" : "View Project";

      const tags = (project.tags || [])
        .map((tag) => `<span>${tag}</span>`)
        .join("");

      const card = document.createElement("article");
      card.className = "project-card";
      card.style.animationDelay = `${index * 0.12}s`;

      card.innerHTML = `
        <div class="project-image">
          <img src="${project.image}" alt="${title}" loading="lazy">
        </div>

        <div class="project-content">
          <div class="project-category">${category}</div>
          <h3 class="project-title">${title}</h3>
          <p class="project-desc">${description}</p>

          <div class="project-tags">
            ${tags}
          </div>

          <a class="project-btn" href="${project.url}" target="_blank" rel="noopener">
            ${buttonText} →
          </a>
        </div>
      `;

      dom.projectsGrid.appendChild(card);
    });
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
})();