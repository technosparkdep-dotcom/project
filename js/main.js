/* ══════════════════════════
   TECHNOSPARK — main.js
══════════════════════════ */

/* ── Navbar scroll effect ── */
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
  });
}

/* ── Hamburger menu ── */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('nav-links');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });
  // close on link click
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });
}

/* ── Fade-in on scroll ── */
const fadeEls = document.querySelectorAll('.fade-in');
if (fadeEls.length) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  fadeEls.forEach(el => observer.observe(el));
}

/* ── Circuit-board canvas animation ── */
const canvas = document.getElementById('circuit-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let W, H, nodes = [], lines = [];
  const NODE_COUNT = 55;
  const COLORS = ['#00D4FF', '#FF006E', '#4466FF'];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function initNodes() {
    nodes = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 1,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        pulse: Math.random() * Math.PI * 2,
      });
    }
  }

  function drawFrame() {
    ctx.clearRect(0, 0, W, H);

    // update + draw nodes
    nodes.forEach(n => {
      n.x += n.vx; n.y += n.vy;
      n.pulse += 0.02;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;

      const alpha = 0.5 + 0.5 * Math.sin(n.pulse);
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r + 0.5 * Math.sin(n.pulse), 0, Math.PI * 2);
      ctx.fillStyle = n.color + Math.floor(alpha * 200).toString(16).padStart(2,'0');
      ctx.fill();
    });

    // draw connecting lines (circuit-style — horizontal/vertical segments)
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[j].x - nodes[i].x;
        const dy = nodes[j].y - nodes[i].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 160) {
          const alpha = (1 - dist / 160) * 0.35;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          // L-shaped circuit-board routing
          ctx.lineTo(nodes[i].x, nodes[j].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(0,212,255,${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(drawFrame);
  }

  window.addEventListener('resize', () => { resize(); initNodes(); });
  resize(); initNodes(); drawFrame();
}

/* ── Contact form — saves to localStorage ── */
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();

    // Collect form data
    const message = {
      id: Date.now(),
      date: new Date().toLocaleString(),
      firstName: document.getElementById('fname').value.trim(),
      lastName:  document.getElementById('lname').value.trim(),
      email:     document.getElementById('email').value.trim(),
      department:document.getElementById('department').value,
      reason:    document.getElementById('reason').value,
      message:   document.getElementById('message').value.trim(),
      read: false
    };

    // Save to localStorage
    const existing = JSON.parse(localStorage.getItem('ts_messages') || '[]');
    existing.push(message);
    localStorage.setItem('ts_messages', JSON.stringify(existing));

    // Show sending animation
    const btn = this.querySelector('.btn');
    btn.textContent = 'Sending…';
    btn.disabled = true;

    setTimeout(() => {
      this.style.display = 'none';
      const success = document.getElementById('form-success');
      if (success) { success.style.display = 'block'; }
    }, 1400);
  });
}

/* ── Active nav link highlight on inner pages ── */
const currentPage = window.location.pathname.split('/').pop();
document.querySelectorAll('.nav-links a').forEach(a => {
  if (a.getAttribute('href').endsWith(currentPage)) {
    a.classList.add('active');
  }
});
