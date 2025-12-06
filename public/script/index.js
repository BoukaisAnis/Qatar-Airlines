// Hamburger menu toggle
document.addEventListener("DOMContentLoaded", function () {
  const hamburger = document.querySelector(".hamburger");
  const navGroups = document.querySelector(".nav-groups");

  if (hamburger) {
    hamburger.addEventListener("click", function () {
      hamburger.classList.toggle("active");
      navGroups.classList.toggle("active");
    });
  }

  // Close menu when a link is clicked
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link) => {
    link.addEventListener("click", function () {
      if (hamburger) {
        hamburger.classList.remove("active");
        navGroups.classList.remove("active");
      }
    });
  });
});

// Navbar scroll effect - transparent to white
document.addEventListener("scroll", function () {
  const navbar = document.querySelector(".navbar");
  if (window.scrollY > 50) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});
