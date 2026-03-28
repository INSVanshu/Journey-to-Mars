'use strict';

let mouseX = 0, mouseY = 0;
let cursorX = 0, cursorY = 0;
let trailX = 0, trailY = 0;
let earthScene, earthCamera, earthRenderer, earthMesh;
let marsScene, marsCamera, marsRenderer, marsMesh;
let starsCtx, starsCanvas;
let starLayers = [];
let scrollY = 0;
let clockInterval = null;
let elapsedSeconds = 0;
let countersAnimated = false;

function initLoader() {
  const messages = [
    'INITIALIZING SYSTEMS…',
    'CALIBRATING THRUSTERS…',
    'LOADING STAR CHARTS…',
    'CALCULATING TRAJECTORY…',
    'ALL SYSTEMS GO.',
  ];
  const ring = document.querySelector('.progress-ring');
  const circumference = 2 * Math.PI * 54;
  ring.style.strokeDasharray = circumference;
  ring.style.strokeDashoffset = circumference;

  let progress = 0;
  let msgIndex = 0;
  const msgEl = document.getElementById('loader-msg');
  const barEl = document.getElementById('loader-bar');

  const interval = setInterval(() => {
    progress += Math.random() * 4 + 1;
    if (progress > 100) progress = 100;

    const offset = circumference * (1 - progress / 100);
    ring.style.strokeDashoffset = offset;
    barEl.style.width = progress + '%';

    const newMsgIndex = Math.floor((progress / 100) * messages.length);
    if (newMsgIndex !== msgIndex && newMsgIndex < messages.length) {
      msgIndex = newMsgIndex;
      msgEl.style.opacity = '0';
      setTimeout(() => {
        msgEl.textContent = messages[msgIndex];
        msgEl.style.opacity = '1';
      }, 200);
    }

    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(hideLoader, 600);
    }
  }, 60);
}

function hideLoader() {
  const loader = document.getElementById('loader');
  gsap.to(loader, {
    opacity: 0,
    duration: 0.8,
    ease: 'power2.inOut',
    onComplete: () => {
      loader.style.display = 'none';
      onLoaderComplete();
    }
  });
}

function onLoaderComplete() {
  gsap.to('.launch-content', {
    opacity: 1,
    y: 0,
    duration: 1.2,
    ease: 'power3.out',
  });

  gsap.to('#earth-canvas', {
    opacity: 1,
    x: 0,
    duration: 1.5,
    ease: 'power3.out',
    delay: 0.3,
  });

  startMissionClock();
  initCountdown();
}

function initCursor() {
  const cursor = document.getElementById('cursor');
  const trail = document.getElementById('cursor-trail');

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top = mouseY + 'px';
  });

  function animateCursor() {
    trailX += (mouseX - trailX) * 0.12;
    trailY += (mouseY - trailY) * 0.12;
    trail.style.left = trailX + 'px';
    trail.style.top = trailY + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  const hoverTargets = document.querySelectorAll('button, .explore-card, .stat-card, .nav-dot, .tfact');
  hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
}

function startMissionClock() {
  const clockEl = document.getElementById('mission-clock');
  if (!clockEl) return;
  clockInterval = setInterval(() => {
    elapsedSeconds++;
    const h = String(Math.floor(elapsedSeconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((elapsedSeconds % 3600) / 60)).padStart(2, '0');
    const s = String(elapsedSeconds % 60).padStart(2, '0');
    clockEl.textContent = `T+ ${h}:${m}:${s}`;
  }, 1000);
}

function initCountdown() {
  const launch = new Date();
  launch.setHours(launch.getHours() + 72);

  function update() {
    const now = new Date();
    const diff = launch - now;
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    document.getElementById('cd-d').textContent = String(d).padStart(2, '0');
    document.getElementById('cd-h').textContent = String(h).padStart(2, '0');
    document.getElementById('cd-m').textContent = String(m).padStart(2, '0');
    document.getElementById('cd-s').textContent = String(s).padStart(2, '0');
  }
  update();
  setInterval(update, 1000);
}

function initStars() {
  starsCanvas = document.getElementById('stars-bg');
  starsCtx = starsCanvas.getContext('2d');
  resize();

  starLayers = [
    createStarLayer(80, 1.5, 2.5, 0.6),
    createStarLayer(200, 0.8, 1.5, 0.4),
    createStarLayer(400, 0.3, 0.8, 0.25),
  ];

  animateStars();
  window.addEventListener('resize', resize);
}

function resize() {
  starsCanvas.width = window.innerWidth;
  starsCanvas.height = window.innerHeight;
}

function createStarLayer(count, minR, maxR, opacity) {
  const stars = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random(),
      y: Math.random(),
      r: minR + Math.random() * (maxR - minR),
      opacity: opacity * (0.5 + Math.random() * 0.5),
      twinkle: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.01 + Math.random() * 0.03,
    });
  }
  return stars;
}

function animateStars() {
  const W = starsCanvas.width;
  const H = starsCanvas.height;
  starsCtx.clearRect(0, 0, W, H);

  const parallaxSpeeds = [0.05, 0.03, 0.01];
  const scrollFactor = window.scrollY / document.body.scrollHeight;

  starLayers.forEach((layer, li) => {
    layer.forEach(star => {
      star.twinkle += star.twinkleSpeed;
      const twinkleFactor = 0.7 + 0.3 * Math.sin(star.twinkle);
      const offsetY = scrollFactor * parallaxSpeeds[li] * H;

      const sx = star.x * W;
      const sy = (((star.y * H) - scrollFactor * parallaxSpeeds[li] * 600) % H + H) % H;

      starsCtx.beginPath();
      starsCtx.arc(sx, sy, star.r, 0, Math.PI * 2);
      starsCtx.fillStyle = `rgba(232, 244, 255, ${star.opacity * twinkleFactor})`;
      starsCtx.fill();

      if (star.r > 1.8) {
        const grd = starsCtx.createRadialGradient(sx, sy, 0, sx, sy, star.r * 3);
        grd.addColorStop(0, `rgba(200,230,255,${0.15 * twinkleFactor})`);
        grd.addColorStop(1, 'rgba(200,230,255,0)');
        starsCtx.beginPath();
        starsCtx.arc(sx, sy, star.r * 3, 0, Math.PI * 2);
        starsCtx.fillStyle = grd;
        starsCtx.fill();
      }
    });
  });

  requestAnimationFrame(animateStars);
}

function generateEarthTexture() {
  const W = 1024, H = 512;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');

  const ocean = ctx.createLinearGradient(0, 0, W, H);
  ocean.addColorStop(0, '#0a2f5a');
  ocean.addColorStop(0.5, '#1a6fa0');
  ocean.addColorStop(1, '#0a2f5a');
  ctx.fillStyle = ocean;
  ctx.fillRect(0, 0, W, H);


  ctx.fillStyle = '#3a7d44';
  const landmasses = [
    { x: 190, y: 185, rx: 95, ry: 80 },
    { x: 220, y: 250, rx: 60, ry: 70 },
    { x: 280, y: 330, rx: 50, ry: 95 },
    { x: 510, y: 175, rx: 55, ry: 50 },
    { x: 530, y: 295, rx: 60, ry: 115 },
    { x: 700, y: 165, rx: 160, ry: 115 },
    { x: 790, y: 290, rx: 40, ry: 35 },
    { x: 800, y: 355, rx: 70, ry: 55 },
  ];
  landmasses.forEach(({ x, y, rx, ry }) => {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, Math.random() * 0.4, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = '#4a8a54';
  ctx.beginPath();
  ctx.ellipse(340, 130, 50, 40, 0.3, 0, Math.PI * 2);
  ctx.fill();


  const antGrad = ctx.createLinearGradient(0, H - 70, 0, H);
  antGrad.addColorStop(0, 'rgba(220,240,255,0)');
  antGrad.addColorStop(1, 'rgba(220,240,255,0.95)');
  ctx.fillStyle = antGrad;
  ctx.fillRect(0, H - 70, W, 70);

  const northGrad = ctx.createLinearGradient(0, 0, 0, 70);
  northGrad.addColorStop(0, 'rgba(220,240,255,0.9)');
  northGrad.addColorStop(1, 'rgba(220,240,255,0)');
  ctx.fillStyle = northGrad;
  ctx.fillRect(0, 0, W, 70);

  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  const cloudBlobs = 40;
  for (let i = 0; i < cloudBlobs; i++) {
    const cx = Math.random() * W;
    const cy = Math.random() * H;
    const cr = 15 + Math.random() * 70;
    ctx.beginPath();
    ctx.ellipse(cx, cy, cr, cr * 0.45, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  const nightGrad = ctx.createLinearGradient(0, 0, W * 0.4, 0);
  nightGrad.addColorStop(0, 'rgba(0,5,20,0.65)');
  nightGrad.addColorStop(1, 'rgba(0,5,20,0)');
  ctx.fillStyle = nightGrad;
  ctx.fillRect(0, 0, W, H);

  return new THREE.CanvasTexture(c);
}

function generateMarsTexture() {
  const W = 1024, H = 512;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');

  const base = ctx.createLinearGradient(0, 0, W, H);
  base.addColorStop(0, '#7a2000');
  base.addColorStop(0.35, '#b83010');
  base.addColorStop(0.65, '#c1440e');
  base.addColorStop(1, '#7a2000');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, W, H);

  for (let i = 0; i < 300; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const r = 5 + Math.random() * 90;
    const dark = Math.random() > 0.5;
    ctx.fillStyle = dark
      ? `rgba(60,10,0,${Math.random() * 0.35})`
      : `rgba(200,90,30,${Math.random() * 0.25})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < 30; i++) {
    const x = Math.random() * W;
    const y = 40 + Math.random() * (H - 80);
    const r = 4 + Math.random() * 28;
  
    ctx.strokeStyle = 'rgba(200,80,20,0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
  
    ctx.fillStyle = 'rgba(40,8,0,0.55)';
    ctx.fill();
  
    if (r < 15) {
      ctx.fillStyle = 'rgba(180,70,20,0.4)';
      ctx.beginPath();
      ctx.arc(x, y, r * 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.strokeStyle = 'rgba(30,5,0,0.75)';
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(W * 0.28, H * 0.46);
  ctx.bezierCurveTo(W * 0.42, H * 0.42, W * 0.58, H * 0.5, W * 0.76, H * 0.44);
  ctx.stroke();
  ctx.lineWidth = 5;
  ctx.strokeStyle = 'rgba(60,10,0,0.5)';
  ctx.stroke();

  const olyGrad = ctx.createRadialGradient(W * 0.22, H * 0.36, 0, W * 0.22, H * 0.36, 80);
  olyGrad.addColorStop(0, 'rgba(210,100,40,0.8)');
  olyGrad.addColorStop(0.5, 'rgba(180,70,20,0.4)');
  olyGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = olyGrad;
  ctx.beginPath();
  ctx.arc(W * 0.22, H * 0.36, 80, 0, Math.PI * 2);
  ctx.fill();

  const northPolar = ctx.createLinearGradient(0, 0, 0, H * 0.18);
  northPolar.addColorStop(0, 'rgba(240,230,220,0.95)');
  northPolar.addColorStop(1, 'rgba(240,230,220,0)');
  ctx.fillStyle = northPolar;
  ctx.fillRect(0, 0, W, H * 0.18);

  const southPolar = ctx.createLinearGradient(0, H - H * 0.14, 0, H);
  southPolar.addColorStop(0, 'rgba(240,230,220,0)');
  southPolar.addColorStop(1, 'rgba(240,230,220,0.85)');
  ctx.fillStyle = southPolar;
  ctx.fillRect(0, H - H * 0.14, W, H * 0.14);

  return new THREE.CanvasTexture(c);
}

function initEarth() {
  const canvas = document.getElementById('earth-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const size = Math.min(window.innerWidth * 0.6, 700);
  canvas.width = size;
  canvas.height = size;

  earthRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  earthRenderer.setSize(size, size);
  earthRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  earthScene = new THREE.Scene();

  earthCamera = new THREE.PerspectiveCamera(40, 1, 0.1, 1000);
  earthCamera.position.z = 2.8;

  const geo = new THREE.SphereGeometry(1, 64, 64);
  const tex = generateEarthTexture();
  const mat = new THREE.MeshPhongMaterial({
    map: tex,
    specular: new THREE.Color(0x4488ff),
    shininess: 20,
  });
  earthMesh = new THREE.Mesh(geo, mat);
  earthScene.add(earthMesh);

  const atmGeo = new THREE.SphereGeometry(1.06, 48, 48);
  const atmMat = new THREE.MeshPhongMaterial({
    color: 0x4488ff,
    transparent: true,
    opacity: 0.12,
    side: THREE.FrontSide,
  });
  earthScene.add(new THREE.Mesh(atmGeo, atmMat));

  const glowGeo = new THREE.SphereGeometry(1.15, 48, 48);
  const glowMat = new THREE.MeshPhongMaterial({
    color: 0x2266cc,
    transparent: true,
    opacity: 0.05,
    side: THREE.FrontSide,
  });
  earthScene.add(new THREE.Mesh(glowGeo, glowMat));

  const cloudGeo = new THREE.SphereGeometry(1.02, 48, 48);
  const cloudMat = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.18,
  });
  const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
  earthScene.add(cloudMesh);

  earthScene.add(new THREE.AmbientLight(0x223355, 0.8));
  const sun = new THREE.DirectionalLight(0xfff8ee, 2.5);
  sun.position.set(5, 2, 5);
  earthScene.add(sun);
  const rim = new THREE.DirectionalLight(0x2244cc, 0.4);
  rim.position.set(-5, 0, -5);
  earthScene.add(rim);

  function animateEarth() {
    requestAnimationFrame(animateEarth);
    earthMesh.rotation.y += 0.0025;
    cloudMesh.rotation.y += 0.0018;
    cloudMesh.rotation.x = Math.sin(Date.now() * 0.00005) * 0.02;

    const targetX = (mouseX / window.innerWidth - 0.5) * 0.3;
    const targetY = (mouseY / window.innerHeight - 0.5) * 0.2;
    earthMesh.rotation.x += (targetY - earthMesh.rotation.x) * 0.02;

    earthRenderer.render(earthScene, earthCamera);
  }
  animateEarth();

  window.addEventListener('resize', () => {
    const s = Math.min(window.innerWidth * 0.6, 700);
    earthRenderer.setSize(s, s);
    canvas.width = s;
    canvas.height = s;
  });
}

function initMars() {
  const canvas = document.getElementById('mars-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const size = Math.min(window.innerWidth * 0.65, 750);
  canvas.width = size;
  canvas.height = size;

  marsRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  marsRenderer.setSize(size, size);
  marsRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  marsScene = new THREE.Scene();

  marsCamera = new THREE.PerspectiveCamera(38, 1, 0.1, 1000);
  marsCamera.position.z = 2.8;

  const geo = new THREE.SphereGeometry(1, 64, 64);
  const tex = generateMarsTexture();
  const mat = new THREE.MeshPhongMaterial({
    map: tex,
    specular: new THREE.Color(0x441100),
    shininess: 5,
  });
  marsMesh = new THREE.Mesh(geo, mat);
  marsScene.add(marsMesh);

  const dustGeo = new THREE.SphereGeometry(1.04, 48, 48);
  const dustMat = new THREE.MeshPhongMaterial({
    color: 0xc84820,
    transparent: true,
    opacity: 0.08,
  });
  marsScene.add(new THREE.Mesh(dustGeo, dustMat));

  const hazeGeo = new THREE.SphereGeometry(1.12, 32, 32);
  const hazeMat = new THREE.MeshPhongMaterial({
    color: 0x993300,
    transparent: true,
    opacity: 0.04,
  });
  marsScene.add(new THREE.Mesh(hazeGeo, hazeMat));

  marsScene.add(new THREE.AmbientLight(0x441100, 0.6));
  const sun = new THREE.DirectionalLight(0xfff0e0, 2.0);
  sun.position.set(4, 2, 4);
  marsScene.add(sun);
  const rim = new THREE.DirectionalLight(0x660000, 0.3);
  rim.position.set(-4, 0, -4);
  marsScene.add(rim);

  function animateMars() {
    requestAnimationFrame(animateMars);
    marsMesh.rotation.y += 0.003;
    marsMesh.rotation.x = Math.sin(Date.now() * 0.0001) * 0.03;
    marsRenderer.render(marsScene, marsCamera);
  }
  animateMars();
}

function createExhaustParticle() {
  const container = document.getElementById('exhaust');
  if (!container) return;

  const p = document.createElement('div');
  p.style.cssText = `
    position: absolute;
    bottom: ${Math.random() * 20}px;
    left: ${40 + (Math.random() - 0.5) * 30}px;
    width: ${4 + Math.random() * 8}px;
    height: ${4 + Math.random() * 8}px;
    border-radius: 50%;
    background: hsl(${20 + Math.random() * 30}, 100%, ${50 + Math.random() * 30}%);
    pointer-events: none;
    opacity: 1;
  `;
  container.appendChild(p);

  gsap.to(p, {
    y: 80 + Math.random() * 120,
    x: (Math.random() - 0.5) * 60,
    opacity: 0,
    scale: 0.1,
    duration: 0.8 + Math.random() * 0.6,
    ease: 'power1.out',
    onComplete: () => p.remove(),
  });
}

setInterval(createExhaustParticle, 80);

function initScrollAnimations() {
  gsap.registerPlugin(ScrollTrigger);

  ScrollTrigger.create({
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: self => {
      const pct = Math.round(self.progress * 100);
      document.getElementById('mission-progress-bar').style.width = pct + '%';
      document.getElementById('progress-label').textContent = pct + '% COMPLETE';
    }
  });

  const sections = ['launch', 'ascent', 'traverse', 'arrival', 'exploration'];
  sections.forEach(id => {
    ScrollTrigger.create({
      trigger: '#' + id,
      start: 'top 55%',
      end: 'bottom 45%',
      onToggle: self => {
        document.querySelectorAll('.nav-dot').forEach(d => d.classList.remove('active'));
        if (self.isActive) {
          const dot = document.querySelector(`.nav-dot[data-section="${id}"]`);
          if (dot) dot.classList.add('active');
        }
      }
    });
  });

  gsap.to('.launch-content', {
    y: -60,
    opacity: 0,
    scrollTrigger: {
      trigger: '#launch',
      start: 'top top',
      end: '80% top',
      scrub: 1.5,
    }
  });

  gsap.to('#earth-canvas', {
    scale: 0.6,
    x: 120,
    opacity: 0,
    scrollTrigger: {
      trigger: '#launch',
      start: 'top top',
      end: '100% top',
      scrub: 2,
    }
  });

  gsap.to('.launch-data', {
    y: -40,
    opacity: 0,
    scrollTrigger: {
      trigger: '#launch',
      start: '20% top',
      end: '80% top',
      scrub: 1,
    }
  });

  gsap.fromTo('.ascent-left', { opacity: 0, x: -60 }, {
    opacity: 1, x: 0,
    duration: 1,
    scrollTrigger: {
      trigger: '#ascent',
      start: 'top 75%',
      toggleActions: 'play none none reverse',
    }
  });

  gsap.to('#rocket-wrap', {
    y: -120,
    scrollTrigger: {
      trigger: '#ascent',
      start: 'top bottom',
      end: 'bottom top',
      scrub: 2,
    }
  });

  ScrollTrigger.create({
    trigger: '#ascent',
    start: 'top 60%',
    onEnter: () => {
      const fill = document.getElementById('alt-fill');
      const label = document.getElementById('alt-label');
      if (!fill) return;
      let pct = 0;
      const interval = setInterval(() => {
        pct += 0.8;
        if (pct > 100) { pct = 100; clearInterval(interval); }
        fill.style.height = pct + '%';
        label.textContent = Math.round(pct * 4000) + ' km';
      }, 30);
    }
  });

  gsap.from('.astat', {
    opacity: 0,
    y: 20,
    stagger: 0.15,
    duration: 0.7,
    scrollTrigger: {
      trigger: '#ascent',
      start: 'top 60%',
      toggleActions: 'play none none reverse',
    }
  });

  gsap.from('.phase-tag', {
    opacity: 0,
    x: -20,
    stagger: 0.1,
    duration: 0.5,
    scrollTrigger: {
      trigger: '#ascent',
      start: 'top 50%',
      toggleActions: 'play none none reverse',
    }
  });

  gsap.to('.traverse-header', {
    y: 0, opacity: 1,
    scrollTrigger: {
      trigger: '#traverse',
      start: 'top 80%',
      toggleActions: 'play none none reverse',
    }
  });

  ScrollTrigger.create({
    trigger: '.stats-grid',
    start: 'top 80%',
    onEnter: () => {
      gsap.to('.stat-card', {
        opacity: 1,
        y: 0,
        stagger: 0.12,
        duration: 0.8,
        ease: 'power3.out',
      });
      animateCounters();
    }
  });

  ScrollTrigger.create({
    trigger: '.traverse-facts',
    start: 'top 80%',
    onEnter: () => {
      gsap.to('.tfact', {
        opacity: 1,
        y: 0,
        stagger: 0.15,
        duration: 0.7,
        ease: 'power3.out',
      });
    }
  });

  ScrollTrigger.create({
    trigger: '.mission-timeline',
    start: 'top 80%',
    end: 'bottom 20%',
    scrub: 1,
    onUpdate: self => {
      const prog = document.getElementById('tl-progress');
      if (prog) prog.style.width = (self.progress * 100) + '%';

      const nodes = document.querySelectorAll('.tl-node');
      nodes.forEach(node => {
        const leftPct = parseFloat(node.style.left);
        if (self.progress * 100 >= leftPct) {
          node.classList.add('active');
        } else {
          node.classList.remove('active');
        }
      });
    }
  });

  gsap.fromTo('.arrival-content', { opacity: 0, x: -80 }, {
    opacity: 1, x: 0,
    duration: 1.2,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '#arrival',
      start: 'top 70%',
      toggleActions: 'play none none reverse',
    }
  });

  gsap.fromTo('#mars-canvas', { opacity: 0, x: 100, scale: 0.7 }, {
    opacity: 1, x: 0, scale: 1,
    duration: 1.5,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '#arrival',
      start: 'top 70%',
      toggleActions: 'play none none reverse',
    }
  });

  ScrollTrigger.create({
    trigger: '.mars-specs',
    start: 'top 80%',
    onEnter: () => {
      document.querySelectorAll('.spec-bar').forEach(bar => {
        const target = bar.style.getPropertyValue('--pct');
        bar.style.width = target;
      });
    }
  });

  gsap.fromTo('.orbit-overlay', { opacity: 0 }, {
    opacity: 1,
    duration: 2,
    scrollTrigger: {
      trigger: '#arrival',
      start: 'top 60%',
      toggleActions: 'play none none reverse',
    }
  });

  gsap.to('#mars-canvas', {
    y: -80,
    scrollTrigger: {
      trigger: '#arrival',
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1.5,
    }
  });

  gsap.from('.explore-card', {
    opacity: 0,
    y: 60,
    stagger: 0.12,
    duration: 0.9,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.explore-grid',
      start: 'top 80%',
      toggleActions: 'play none none reverse',
    }
  });

  gsap.from('.mission-end', {
    opacity: 0,
    y: 40,
    duration: 1,
    scrollTrigger: {
      trigger: '.mission-end',
      start: 'top 85%',
      toggleActions: 'play none none reverse',
    }
  });
}

function animateCounters() {
  if (countersAnimated) return;
  countersAnimated = true;

  document.querySelectorAll('.counter').forEach(el => {
    const target = parseInt(el.dataset.target, 10);
    const duration = 2000;
    const start = Date.now();

    function tick() {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(ease * target);
      el.textContent = current.toLocaleString();
      if (progress < 1) requestAnimationFrame(tick);
    }
    tick();
  });
}

function initNav() {
  document.querySelectorAll('.nav-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      const id = dot.dataset.section;
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

function initButtons() {
  const launchBtn = document.getElementById('btn-launch');
  if (launchBtn) {
    launchBtn.addEventListener('click', () => {
      const ascent = document.getElementById('ascent');
      if (ascent) ascent.scrollIntoView({ behavior: 'smooth' });

      gsap.fromTo(launchBtn, { scale: 1 }, {
        scale: 0.95, duration: 0.1, yoyo: true, repeat: 1,
      });
    });
  }

  const restartBtn = document.getElementById('btn-restart');
  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

function initMouseParallax() {
  const arrival = document.getElementById('arrival');
  if (!arrival) return;

  arrival.addEventListener('mousemove', (e) => {
    const rect = arrival.getBoundingClientRect();
    const cx = (e.clientX - rect.left - rect.width / 2) / rect.width;
    const cy = (e.clientY - rect.top - rect.height / 2) / rect.height;

    if (marsMesh) {
      gsap.to(marsMesh.rotation, {
        x: cy * 0.3,
        duration: 1,
        ease: 'power2.out',
      });
    }

    gsap.to('.orbit-overlay', {
      x: cx * 20,
      y: cy * 10,
      duration: 1,
      ease: 'power2.out',
    });
  });
}

function addScanlines() {
  const el = document.createElement('div');
  el.style.cssText = `
    position: fixed; inset: 0;
    background: repeating-linear-gradient(
      to bottom,
      transparent 0px,
      transparent 3px,
      rgba(0,0,0,0.03) 3px,
      rgba(0,0,0,0.03) 4px
    );
    pointer-events: none;
    z-index: 9990;
  `;
  document.body.appendChild(el);
}

function initCardInteractions() {
  document.querySelectorAll('.explore-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      gsap.to(card, { y: -8, duration: 0.3, ease: 'power2.out' });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { y: 0, duration: 0.3, ease: 'power2.out' });
    });
  });

  document.querySelectorAll('.stat-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      gsap.to(card.querySelector('.stat-icon'), {
        scale: 1.3,
        color: '#ff8c42',
        duration: 0.3,
        ease: 'back.out(2)',
      });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card.querySelector('.stat-icon'), {
        scale: 1,
        duration: 0.3,
      });
    });
  });
}

function initAsteroids() {
  const section = document.getElementById('traverse');
  if (!section) return;

  for (let i = 0; i < 20; i++) {
    const a = document.createElement('div');
    const size = 1 + Math.random() * 3;
    a.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      background: rgba(200,180,160,${0.2 + Math.random() * 0.4});
      border-radius: 50%;
      top: ${Math.random() * 100}%;
      left: ${Math.random() * 100}%;
      pointer-events: none;
    `;
    section.appendChild(a);

    gsap.to(a, {
      x: (Math.random() - 0.5) * 200,
      y: (Math.random() - 0.5) * 100,
      opacity: 0,
      duration: 8 + Math.random() * 12,
      repeat: -1,
      yoyo: true,
      ease: 'none',
      delay: Math.random() * 8,
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initLoader();

  initStars();

  initCursor();

  addScanlines();

  initNav();
  initButtons();

  
  setTimeout(() => {
    initEarth();
    initMars();
    initScrollAnimations();
    initMouseParallax();
    initCardInteractions();
    initAsteroids();
  }, 500);

  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
  }, { passive: true });
});
