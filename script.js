// ============================================
// SMOOTH SCROLLING
// ============================================
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

// ============================================
// SCROLL TO TOP BUTTON
// ============================================
const scrollToTopBtn = document.getElementById("scrollToTop");

if (scrollToTopBtn) {
  window.addEventListener("scroll", () => {
    if (window.pageYOffset > 300) {
      scrollToTopBtn.classList.add("visible");
    } else {
      scrollToTopBtn.classList.remove("visible");
    }
  });

  scrollToTopBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}

// ============================================
// THEME TOGGLE
// ============================================
const themeToggle = document.getElementById("themeToggle");
const body = document.body;

if (themeToggle) {
  // Load saved theme
  const savedTheme = localStorage.getItem("theme") || "light";
  if (savedTheme === "dark") {
    body.classList.add("dark-theme");
    themeToggle.textContent = "☀️";
  }

  themeToggle.addEventListener("click", () => {
    body.classList.toggle("dark-theme");
    const isDark = body.classList.contains("dark-theme");
    themeToggle.textContent = isDark ? "☀️" : "🌙";
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });
}

// ============================================
// GAME FILTER
// ============================================
const filterButtons = document.querySelectorAll(".filter-btn");
const gameCards = document.querySelectorAll(".game-card");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    // Update active button
    filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");

    const filter = button.getAttribute("data-filter");

    // Filter games
    gameCards.forEach((card) => {
      if (filter === "all") {
        card.classList.remove("hidden");
        card.style.display = "block";
      } else {
        const category = card.getAttribute("data-category");
        if (category === filter) {
          card.classList.remove("hidden");
          card.style.display = "block";
        } else {
          card.classList.add("hidden");
          card.style.display = "none";
        }
      }
    });
  });
});

// ============================================
// ANIMATION ON SCROLL
// ============================================
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
    }
  });
}, observerOptions);

// ============================================
// INITIALIZE ON PAGE LOAD
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  // Animate game cards on scroll
  gameCards.forEach((card, index) => {
    card.style.opacity = "0";
    card.style.transform = "translateY(20px)";
    card.style.transition = `opacity 0.5s ease ${
      index * 0.1
    }s, transform 0.5s ease ${index * 0.1}s`;
    observer.observe(card);
  });

  // Add game count
  const totalGames = gameCards.length;
  console.log(`🎮 Mini Games Hub loaded with ${totalGames} games!`);
});

// ============================================
// ACTIVE NAVIGATION STATE
// ============================================
window.addEventListener("scroll", () => {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-links a[href^='#']");

  let current = "";
  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    if (scrollY >= sectionTop - 200) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href").slice(1) === current) {
      link.classList.add("active");
    }
  });
});

// ============================================
// KEYBOARD SHORTCUTS
// ============================================
document.addEventListener("keydown", (e) => {
  // Press 'T' to toggle theme
  if (e.key === "t" || e.key === "T") {
    if (e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
      if (themeToggle) themeToggle.click();
    }
  }

  // Press 'Home' to scroll to top
  if (e.key === "Home") {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});

// ============================================
// PERFORMANCE: Lazy load game thumbnails
// ============================================
if ("IntersectionObserver" in window) {
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const card = entry.target;
        card.classList.add("loaded");
        imageObserver.unobserve(card);
      }
    });
  });

  gameCards.forEach((card) => imageObserver.observe(card));
}
