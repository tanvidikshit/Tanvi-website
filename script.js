(function () {
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  var reduceMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Nav: hide with animation when user scrolls down past the hero */
  var heroSection = document.getElementById("top");
  var siteHeader = document.querySelector(".site-header");
  if (heroSection && siteHeader) {
    var navScrollTicking = false;
    function syncNavToHero() {
      navScrollTicking = false;
      var bottom = heroSection.getBoundingClientRect().bottom;
      var pastHero = bottom <= 72;
      siteHeader.classList.toggle("header--nav-hidden", pastHero);
    }
    function onScrollNav() {
      if (!navScrollTicking) {
        navScrollTicking = true;
        requestAnimationFrame(syncNavToHero);
      }
    }
    window.addEventListener("scroll", onScrollNav, { passive: true });
    syncNavToHero();
  }

  /* Scroll reveal */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if (revealEls.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) e.target.classList.add("is-visible");
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* Subtle 3D tilt on gallery cards and contact cards */
  function bindTilt(selector, maxDeg) {
    if (reduceMotion) return;
    maxDeg = maxDeg || 8;
    var nodes = document.querySelectorAll(selector);
    nodes.forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        var rx = -py * maxDeg * 2;
        var ry = px * maxDeg * 2;
        el.style.transform =
          "perspective(900px) rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg) translateZ(6px)";
      });
      el.addEventListener("mouseleave", function () {
        el.style.transform = "";
      });
    });
  }

  bindTilt("[data-tilt]", 6);

  /* Hero profile subtle parallax tilt */
  var heroWrap = document.querySelector("[data-tilt-wrap]");
  if (heroWrap && !reduceMotion) {
    heroWrap.addEventListener("mousemove", function (e) {
      var frame = heroWrap.querySelector(".hero-profile-frame");
      if (!frame) return;
      var r = heroWrap.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      frame.style.transform =
        "translateZ(40px) rotateY(" + (-4 + px * 8).toFixed(2) + "deg) rotateX(" + (2 + py * 6).toFixed(2) + "deg)";
    });
    heroWrap.addEventListener("mouseleave", function () {
      var frame = heroWrap.querySelector(".hero-profile-frame");
      if (frame) frame.style.transform = "";
    });
  }

  var motionWrap = document.querySelector("#motion [data-tilt-wrap]");
  if (motionWrap && !reduceMotion) {
    motionWrap.addEventListener("mousemove", function (e) {
      var stage = motionWrap.querySelector(".motion-frame");
      if (!stage) return;
      var r = motionWrap.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      stage.style.transform =
        "rotateX(" + (4 + py * 6).toFixed(2) + "deg) rotateY(" + (px * 6).toFixed(2) + "deg)";
    });
    motionWrap.addEventListener("mouseleave", function () {
      var stage = motionWrap.querySelector(".motion-frame");
      if (stage) stage.style.transform = "";
    });
  }

  /* Motion video: show first frame as preview (no static poster image) */
  var motionVideo = document.querySelector(".motion-video");
  if (motionVideo) {
    motionVideo.addEventListener("loadeddata", function () {
      try {
        if (motionVideo.readyState >= 2 && motionVideo.currentTime < 0.01) {
          motionVideo.currentTime = 0.001;
        }
      } catch (err) {
        /* ignore seek errors */
      }
    });
    motionVideo.addEventListener("loadedmetadata", function () {
      try {
        motionVideo.currentTime = 0.001;
      } catch (err) {
        /* ignore */
      }
    });
  }

  /* Portfolio lightbox */
  var lightbox = document.getElementById("lightbox");
  var gallery = document.getElementById("gallery");
  if (lightbox && gallery) {
    var lightboxImg = lightbox.querySelector(".lightbox-img");
    var lightboxTitle = lightbox.querySelector(".lightbox-title");
    var lightboxSub = lightbox.querySelector(".lightbox-sub");
    var lightboxClose = lightbox.querySelector(".lightbox-close");
    var lightboxBackdrop = lightbox.querySelector(".lightbox-backdrop");
    var lightboxPrev = lightbox.querySelector(".lightbox-prev");
    var lightboxNext = lightbox.querySelector(".lightbox-next");
    var cards = Array.prototype.slice.call(gallery.querySelectorAll(".gallery-card"));
    var currentLbIndex = 0;
    var lastFocus = null;

    function cardIndex(card) {
      var i = cards.indexOf(card);
      return i >= 0 ? i : 0;
    }

    function updateLightboxSlide() {
      var card = cards[currentLbIndex];
      if (!card || !lightboxImg) return;
      var img = card.querySelector(".gallery-img-wrap img");
      var titleEl = card.querySelector(".gallery-cap h3");
      var subEl = card.querySelector(".gallery-cap p");
      if (img) {
        lightboxImg.src = img.src;
        lightboxImg.alt = titleEl ? titleEl.textContent : "Portfolio photograph";
      }
      if (lightboxTitle) lightboxTitle.textContent = titleEl ? titleEl.textContent : "";
      if (lightboxSub) lightboxSub.textContent = subEl ? subEl.textContent : "";
    }

    function openLightbox(index) {
      if (!cards.length) return;
      lastFocus = document.activeElement;
      currentLbIndex = Math.max(0, Math.min(index, cards.length - 1));
      updateLightboxSlide();
      lightbox.removeAttribute("hidden");
      document.body.classList.add("lightbox-open");
      if (lightboxClose) {
        requestAnimationFrame(function () {
          lightboxClose.focus();
        });
      }
    }

    function closeLightbox() {
      lightbox.setAttribute("hidden", "");
      document.body.classList.remove("lightbox-open");
      if (lastFocus && typeof lastFocus.focus === "function") {
        lastFocus.focus();
      }
      lastFocus = null;
    }

    function stepLightbox(delta) {
      if (!cards.length) return;
      currentLbIndex = (currentLbIndex + delta + cards.length) % cards.length;
      updateLightboxSlide();
    }

    gallery.addEventListener("click", function (e) {
      var card = e.target.closest(".gallery-card");
      if (!card || !gallery.contains(card)) return;
      openLightbox(cardIndex(card));
    });

    gallery.addEventListener("keydown", function (e) {
      if (e.key !== "Enter" && e.key !== " ") return;
      var card = e.target.closest(".gallery-card");
      if (!card || !gallery.contains(card)) return;
      e.preventDefault();
      openLightbox(cardIndex(card));
    });

    if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
    if (lightboxBackdrop) lightboxBackdrop.addEventListener("click", closeLightbox);
    if (lightboxPrev) lightboxPrev.addEventListener("click", function () { stepLightbox(-1); });
    if (lightboxNext) lightboxNext.addEventListener("click", function () { stepLightbox(1); });

    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener("keydown", function (e) {
      if (lightbox.hasAttribute("hidden")) return;
      if (e.key === "Escape") {
        e.preventDefault();
        closeLightbox();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        stepLightbox(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        stepLightbox(1);
      }
    });
  }
})();
