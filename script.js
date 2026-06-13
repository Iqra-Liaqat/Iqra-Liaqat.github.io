/* ============================================================
   Iqra Liaqat — Portfolio Script
   ============================================================ */

document.documentElement.classList.remove('no-js');

/* ── ENVIRONMENT CHECKS ── */
const isCoarsePointer = matchMedia('(pointer: coarse)').matches;
const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isLowPower = isCoarsePointer || prefersReducedMotion || navigator.hardwareConcurrency <= 4;

/* ── CURSOR (skip entirely on touch) ── */
if (!isCoarsePointer) {
  const curEl = document.getElementById('cur'), cur2El = document.getElementById('cur2');
  let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    curEl.style.left = mx + 'px'; curEl.style.top = my + 'px';
  });
  (function tc() {
    rx += (mx - rx) * .11; ry += (my - ry) * .11;
    cur2El.style.left = Math.round(rx) + 'px'; cur2El.style.top = Math.round(ry) + 'px';
    requestAnimationFrame(tc);
  })();
  document.querySelectorAll('button,a,.proj-card,.svc-card,.contact-link').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
  });
}

/* ── MOBILE NAV TOGGLE ── */
const nav = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
if (navToggle) {
  navToggle.addEventListener('click', () => {
    const open = nav.classList.toggle('nav-open');
    navToggle.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  nav.querySelectorAll('.n-links .nb').forEach(el => el.addEventListener('click', () => {
    if (nav.classList.contains('nav-open')) {
      nav.classList.remove('nav-open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  }));
  document.addEventListener('click', ev => {
    if (!nav.contains(ev.target) && nav.classList.contains('nav-open')) {
      nav.classList.remove('nav-open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav.classList.contains('nav-open')) {
      nav.classList.remove('nav-open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.focus();
    }
  });
}

/* ── LOADER ── */
let prog = 0;
const lbar = document.getElementById('l-bar'), lpct = document.getElementById('l-pct');
const li = setInterval(() => {
  prog += Math.random() * 7 + 2; if (prog > 100) prog = 100;
  lbar.style.width = prog + '%'; lpct.textContent = Math.round(prog) + '%';
  if (prog >= 100) {
    clearInterval(li);
    setTimeout(() => {
      const l = document.getElementById('load');
      l.classList.add('out');
      setTimeout(() => l.remove(), 900);
    }, 300);
  }
}, 45);

/* ── THREE.JS BACKGROUND SCENE — LAZY LOADED ──
   The three.js library (~600KB) is no longer loaded eagerly. We load it
   only after the page has painted and the browser is idle, so it never
   competes with first-contentful-paint or interaction readiness.
   Throttling for low-power / touch / reduced-motion devices is preserved:
   - Far fewer particles
   - Capped frame rate (~24fps instead of uncapped rAF)
   - Pointer-drag interaction disabled on touch (handled natively)         */
function loadThreeAndInitScene() {
  if (prefersReducedMotion) return; // CSS already hides #c3; skip entirely

  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  script.onload = initScene;
  document.body.appendChild(script);
}

if ('requestIdleCallback' in window) {
  window.addEventListener('load', () => requestIdleCallback(loadThreeAndInitScene, { timeout: 2000 }));
} else {
  window.addEventListener('load', () => setTimeout(loadThreeAndInitScene, 1000));
}

function initScene() {
  if (typeof THREE === 'undefined') return;

  const canvas = document.getElementById('c3');
  if (!canvas) return;

  // Full skip for reduced-motion users — CSS already hides #c3
  if (prefersReducedMotion) return;

  const scaleFactor = isLowPower ? 0.18 : 1; // ~18% particle density on low-power devices
  const targetFPS = isLowPower ? 24 : 60;
  const frameInterval = 1000 / targetFPS;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isLowPower, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, isLowPower ? 1 : 2));
  renderer.setSize(innerWidth, innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 10000);
  camera.position.set(0, 0, 30);

  // BACKGROUND STARS
  (() => {
    const N = Math.round(6000 * scaleFactor);
    const g = new THREE.BufferGeometry();
    const p = new Float32Array(N * 3), c = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1), r = 400;
      p[i*3] = r*Math.sin(ph)*Math.cos(th); p[i*3+1] = r*Math.sin(ph)*Math.sin(th); p[i*3+2] = r*Math.cos(ph);
      const t = Math.random(); c[i*3] = .4+t*.2; c[i*3+1] = .5+t*.2; c[i*3+2] = .8+t*.2;
    }
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    g.setAttribute('color', new THREE.BufferAttribute(c, 3));
    scene.add(new THREE.Points(g, new THREE.PointsMaterial({ size: .8, vertexColors: true, transparent: true, opacity: .4 })));
  })();

  // NEBULA CLOUD
  (() => {
    const N = Math.round(3000 * scaleFactor);
    const g = new THREE.BufferGeometry();
    const p = new Float32Array(N * 3), c = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      p[i*3] = (Math.random()-.5)*80; p[i*3+1] = (Math.random()-.5)*60; p[i*3+2] = (Math.random()-.5)*100-50;
      const rnd = Math.random(); c[i*3]=.4+rnd*.3; c[i*3+1]=.1+rnd*.15; c[i*3+2]=.6+rnd*.3;
    }
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    g.setAttribute('color', new THREE.BufferAttribute(c, 3));
    scene.add(new THREE.Points(g, new THREE.PointsMaterial({ size: .15, vertexColors: true, transparent: true, opacity: .25 })));
  })();

  // MAIN GALAXY
  const galaxy = (() => {
    const N = Math.round(4000 * scaleFactor);
    const g = new THREE.BufferGeometry();
    const p = new Float32Array(N * 3), c = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const arm = (i % 4) / 4 * Math.PI * 2, r = 0.3 + Math.random() * 12;
      const spin = r * .8, th = arm + spin + (Math.random()-.5)*.8;
      const s = (Math.random()-.5)*r*.15;
      p[i*3] = Math.cos(th)*r+s; p[i*3+1] = (Math.random()-.5)*.5; p[i*3+2] = Math.sin(th)*r+s;
      const t = Math.pow(r/12, .5); c[i*3]=t*.3; c[i*3+1]=.5+t*.35; c[i*3+2]=.95+t*.05;
    }
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    g.setAttribute('color', new THREE.BufferAttribute(c, 3));
    const m = new THREE.Points(g, new THREE.PointsMaterial({ size: .08, vertexColors: true, transparent: true, opacity: .6 }));
    scene.add(m); return m;
  })();

  // ORBITING PARTICLES — skip entirely on low-power (cheap visual win, costly per-frame update)
  let orbitMesh = null, orbits = [];
  if (!isLowPower) {
    for (let o = 0; o < 5; o++) {
      const orbitRadius = 15 + o * 4, orbitSpeed = 0.002 + o * 0.0005;
      const particles = [];
      for (let i = 0; i < 150; i++) {
        const angle = Math.random() * Math.PI * 2;
        particles.push({
          pos: new THREE.Vector3(Math.cos(angle)*orbitRadius, (Math.random()-.5)*2, Math.sin(angle)*orbitRadius),
          angle, orbitRadius, orbitSpeed, phase: Math.random() * Math.PI * 2
        });
      }
      orbits.push(particles);
    }
    const positions = [], colors = [];
    orbits.forEach(orbit => orbit.forEach(p => {
      positions.push(p.pos.x, p.pos.y, p.pos.z);
      colors.push(.5+Math.random()*.3, .4+Math.random()*.2, .8+Math.random()*.2);
    }));
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
    orbitMesh = new THREE.Points(g, new THREE.PointsMaterial({ size: .06, vertexColors: true, transparent: true, opacity: .7 }));
    scene.add(orbitMesh);
  }

  // GEOMETRIC SHAPES
  const ico = new THREE.Mesh(new THREE.IcosahedronGeometry(2.5, 2), new THREE.MeshBasicMaterial({ color: 0x64d2ff, wireframe: true, transparent: true, opacity: .08 }));
  ico.position.set(8, -5, 10); scene.add(ico);

  const oct = new THREE.Mesh(new THREE.OctahedronGeometry(3, 1), new THREE.MeshBasicMaterial({ color: 0xa78bfa, wireframe: true, transparent: true, opacity: .06 }));
  oct.position.set(-12, 8, -15); scene.add(oct);

  const tori = [];
  if (!isLowPower) {
    [[0,0,0,.8],[15,-8,20,.5],[-18,5,-10,.6]].forEach(([x,y,z,s]) => {
      const m = new THREE.Mesh(new THREE.TorusKnotGeometry(s,.1,50,8,2,3), new THREE.MeshBasicMaterial({ color: 0x7c3aed, wireframe: true, transparent: true, opacity: .05 }));
      m.position.set(x,y,z); scene.add(m); tori.push(m);
    });
  }

  // COMETS — skip on low-power
  let comets = [], cometMesh = null;
  if (!isLowPower) {
    for (let i = 0; i < 3; i++) {
      comets.push({
        x: (Math.random()-.5)*100, y: (Math.random()-.5)*80, z: (Math.random()-.5)*100,
        vx: (Math.random()-.5)*0.5, vy: (Math.random()-.5)*0.3, vz: (Math.random()-.5)*0.5,
        trail: []
      });
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(0), 3));
    cometMesh = new THREE.Line(g, new THREE.LineBasicMaterial({ color: 0x64d2ff, transparent: true, opacity: .4 }));
    scene.add(cometMesh);
  }

  // LIGHTING
  scene.add(new THREE.AmbientLight(0x050015, 1.5));
  const pl1 = new THREE.PointLight(0x64d2ff, 1.2, 80); pl1.position.set(15,10,20); scene.add(pl1);
  const pl2 = new THREE.PointLight(0xa78bfa, 0.8, 60); pl2.position.set(-20,-10,-15); scene.add(pl2);
  scene.add(new THREE.PointLight(0x34d399, 0.5, 50)).position.set(0,20,-30);

  // INTERACTION (mouse drag — desktop only)
  let isDragging = false, prevX = 0, prevY = 0, velX = 0, velY = 0, rotX = 0, rotY = 0, zoom = 30, targetZoom = 30;
  if (!isCoarsePointer) {
    canvas.addEventListener('mousedown', e => { isDragging = true; prevX = e.clientX; prevY = e.clientY; });
    window.addEventListener('mouseup', () => isDragging = false);
    window.addEventListener('mousemove', e => {
      if (!isDragging) return;
      velX += (e.clientX - prevX) * .0008; velY += (e.clientY - prevY) * .0008;
      prevX = e.clientX; prevY = e.clientY;
    });
    window.addEventListener('wheel', e => { targetZoom = Math.max(8, Math.min(80, targetZoom + e.deltaY * .015)); });
  }

  let t = 0, lastFrame = 0;
  function loop(now) {
    requestAnimationFrame(loop);
    if (now - lastFrame < frameInterval) return;
    lastFrame = now;
    t += .004;

    velX *= .92; velY *= .92;
    rotY += velX; rotX += velY;
    rotX = Math.max(-.6, Math.min(.6, rotX));
    zoom += (targetZoom - zoom) * .08;

    galaxy.rotation.y = t * .015 + rotY * .3;
    galaxy.rotation.x = rotX * .15 + Math.sin(t * .001) * .1;

    ico.rotation.y += .003; ico.rotation.x += .002; ico.rotation.z += .001;
    oct.rotation.y -= .0025; oct.rotation.x -= .0015; oct.rotation.z += .0008;

    tori.forEach((m, i) => { m.rotation.y += .004 + i*.001; m.rotation.z += .003 - i*.0005; });

    pl1.position.x = Math.sin(t*.2)*25+15;
    pl1.position.y = Math.cos(t*.15)*15+10;
    pl1.position.z = Math.sin(t*.18)*20+20;
    pl2.position.x = Math.cos(t*.14)*30-20;
    pl2.position.y = Math.sin(t*.12)*20-10;

    if (orbitMesh) {
      const positions = [];
      orbits.forEach(orbit => orbit.forEach(p => {
        const angle = p.angle + p.orbitSpeed * t * 500 + p.phase;
        p.pos.x = Math.cos(angle) * p.orbitRadius;
        p.pos.z = Math.sin(angle) * p.orbitRadius;
        positions.push(p.pos.x, p.pos.y, p.pos.z);
      }));
      orbitMesh.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
      orbitMesh.geometry.attributes.position.needsUpdate = true;
    }

    if (cometMesh) {
      const trailPositions = [];
      comets.forEach(comet => {
        comet.x += comet.vx; comet.y += comet.vy; comet.z += comet.vz;
        if (Math.abs(comet.x) > 80) comet.vx *= -1;
        if (Math.abs(comet.y) > 60) comet.vy *= -1;
        if (Math.abs(comet.z) > 100) comet.vz *= -1;
        comet.trail.push({ x: comet.x, y: comet.y, z: comet.z });
        if (comet.trail.length > 80) comet.trail.shift();
        comet.trail.forEach(p => trailPositions.push(p.x, p.y, p.z));
      });
      cometMesh.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(trailPositions), 3));
      cometMesh.geometry.attributes.position.needsUpdate = true;
    }

    const camDist = Math.sin(t * .0002) * 5 + zoom;
    camera.position.x = Math.sin(rotY) * camDist * .4 + Math.sin(t * .0001) * 3;
    camera.position.y = Math.sin(rotX) * camDist * .25 + Math.cos(t * .00008) * 2;
    camera.position.z = Math.cos(rotY) * camDist * .6 + Math.cos(t * .0001) * 4 + 5;
    camera.lookAt(Math.sin(t * .0001) * 5, Math.cos(t * .00012) * 3, -5);

    renderer.render(scene, camera);
  }
  requestAnimationFrame(loop);

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
    }, 150);
  });
}

/* ── PANEL CONTENT ── */
const PANELS = {
  about: {
    label: 'About',
    html: `
      <div class="p-eyebrow">Who I am</div>
      <h2 class="p-title">AI Engineer &<br>Creative Technologist</h2>
      <div class="p-body">
        <p>I'm <strong>Iqra Liaqat</strong> — an AI engineer, full-stack developer, and creative technologist building at the frontier of intelligent systems and modern software architecture.</p>
        <p>With <strong>2+ years</strong> of hands-on experience, I work across the full spectrum — from engineering AI pipelines and deploying ML models, to building scalable web applications and designing SEO strategies that drive measurable growth.</p>
        <p>My edge: the rare combination of <strong>AI engineering depth, full-stack capability, and strategic content thinking</strong> — letting me build products that are powerful, purposeful, and built to last.</p>
      </div>
      <div class="stats-grid">
        <div class="stat-card"><div class="val">2+</div><div class="lbl">Years active</div></div>
        <div class="stat-card"><div class="val">15+</div><div class="lbl">Projects shipped</div></div>
        <div class="stat-card"><div class="val">8+</div><div class="lbl">AI systems built</div></div>
        <div class="stat-card"><div class="val">180%</div><div class="lbl">Avg traffic growth</div></div>
      </div>
      <div class="terminal">
        <div><span class="prompt">$ </span><span class="cmd">whoami</span></div>
        <div>iqra_liaqat — AI engineer &amp; full-stack dev</div>
        <div><span class="prompt">$ </span><span class="cmd">location</span></div>
        <div>Pakistan · Remote-Ready · GMT+5</div>
        <div><span class="prompt">$ </span><span class="cmd">status</span></div>
        <div>AVAILABLE — open to freelance &amp; remote roles</div>
      </div>`
  },

  skills: {
    label: 'Skills',
    html: `
      <div class="p-eyebrow">Capabilities</div>
      <h2 class="p-title">Tech Stack</h2>
      <div class="p-body">
        <div class="skill-group">
          <h3 class="skill-group-title">AI &amp; Machine Learning</h3>
          <ul class="tags">
            <li class="tag">Python</li><li class="tag">TensorFlow</li><li class="tag">PyTorch</li><li class="tag">Scikit-learn</li><li class="tag">NLP</li><li class="tag">LangChain</li><li class="tag">LLM APIs</li><li class="tag">RAG Systems</li><li class="tag">OpenAI API</li><li class="tag">Hugging Face</li><li class="tag">Pandas</li><li class="tag">NumPy</li>
          </ul>
        </div>
        <div class="skill-bar">
          <div class="sb-row"><span class="sb-name">AI / ML</span><span class="sb-pct">88%</span></div>
          <div class="sb-track"><div class="sb-fill" style="width:88%" role="img" aria-label="Proficiency 88 percent"></div></div>
        </div>
        <div class="skill-group">
          <h3 class="skill-group-title">Full-Stack Web</h3>
          <ul class="tags">
            <li class="tag pink">React.js</li><li class="tag pink">Node.js</li><li class="tag pink">Express.js</li><li class="tag pink">FastAPI</li><li class="tag pink">MongoDB</li><li class="tag pink">MySQL</li><li class="tag pink">REST APIs</li><li class="tag pink">TypeScript</li><li class="tag pink">Tailwind CSS</li>
          </ul>
        </div>
        <div class="skill-bar">
          <div class="sb-row"><span class="sb-name">Full-Stack</span><span class="sb-pct">85%</span></div>
          <div class="sb-track"><div class="sb-fill" style="width:85%" role="img" aria-label="Proficiency 85 percent"></div></div>
        </div>
        <div class="skill-group">
          <h3 class="skill-group-title">SEO &amp; Content Strategy</h3>
          <ul class="tags">
            <li class="tag violet">Technical SEO</li><li class="tag violet">Keyword Research</li><li class="tag violet">On-Page SEO</li><li class="tag violet">Content Strategy</li><li class="tag violet">Copywriting</li><li class="tag violet">Schema Markup</li><li class="tag violet">Core Web Vitals</li><li class="tag violet">Ahrefs</li><li class="tag violet">GA4</li>
          </ul>
        </div>
        <div class="skill-bar">
          <div class="sb-row"><span class="sb-name">SEO &amp; Content</span><span class="sb-pct">90%</span></div>
          <div class="sb-track"><div class="sb-fill" style="width:90%" role="img" aria-label="Proficiency 90 percent"></div></div>
        </div>
        <div class="skill-group">
          <h3 class="skill-group-title">CS Foundations</h3>
          <ul class="tags">
            <li class="tag amber">OOP</li><li class="tag amber">DSA</li><li class="tag amber">DBMS</li><li class="tag amber">Networks</li><li class="tag amber">Software Engineering</li><li class="tag amber">Git / GitHub</li><li class="tag amber">Linux</li>
          </ul>
        </div>
      </div>`
  },

  proj: {
    label: 'Projects',
    html: `
      <div class="p-eyebrow">Selected work</div>
      <h2 class="p-title">Projects</h2>
      <div class="p-body">
        <ul style="list-style:none">
        <li class="proj-card">
          <img class="proj-thumb" src="emotion-recognition.png" alt="Emotion Recognition System interface showing a live webcam feed with detected facial emotion labels" loading="lazy" width="640" height="360"/>
          <div class="proj-cat">AI · Computer Vision</div>
          <h3 class="proj-name">Emotion Recognition System</h3>
          <p class="proj-desc">Real-time facial emotion recognition using OpenCV and deep learning. Includes training scripts, a lightweight demo, and pre-trained model checkpoints.</p>
          <ul class="proj-tags"><li class="proj-tag">Python</li><li class="proj-tag">OpenCV</li><li class="proj-tag">TensorFlow</li><li class="proj-tag">CNN</li><li class="proj-tag">Flask</li></ul>
          <div class="proj-links">
            <a href="https://emotionrecognitionsystem-6yfcsnmziuwu67vh74sk3t.streamlit.app/" target="_blank" rel="noopener" class="proj-link">↗ Live Demo</a>
            <a href="https://github.com/Iqra-Liaqat/Emotion_Recognition_System.git" target="_blank" rel="noopener" class="proj-link">↗ GitHub</a>
          </div>
        </li>
        <li class="proj-card">
          <img class="proj-thumb" src="image generation.png" alt="Text to Image Bot interface showing a text prompt and a generated image output" loading="lazy" width="640" height="360"/>
          <div class="proj-cat">AI · Generative</div>
          <h3 class="proj-name">Text to Image Bot</h3>
          <p class="proj-desc">Generative image bot converting text prompts into images via diffusion models and custom inference pipelines. Includes bot integration and prompt recipes.</p>
          <ul class="proj-tags"><li class="proj-tag">Python</li><li class="proj-tag">Stable Diffusion</li><li class="proj-tag">FastAPI</li><li class="proj-tag">HuggingFace</li></ul>
          <div class="proj-links">
            <a href="https://huggingface.co/spaces/Iqrakhan01/Text_to_Image_Bot" target="_blank" rel="noopener" class="proj-link">↗ Live Demo</a>
            <a href="https://github.com/Iqra-Liaqat/Text_to_Image_Bot.git" target="_blank" rel="noopener" class="proj-link">↗ GitHub</a>
          </div>
        </li>
        <li class="proj-card">
          <img class="proj-thumb" src="assets/projects/seo-growth.jpg" alt="Analytics dashboard showing organic traffic growth chart trending upward" loading="lazy" width="640" height="360"/>
          <div class="proj-cat">SEO · Growth</div>
          <h3 class="proj-name">0 → 25k Organic Traffic</h3>
          <p class="proj-desc">Full technical SEO audit and content strategy for a tech blog. Schema markup, Core Web Vitals, topic clusters. Grew organic traffic from zero to 25,000 monthly visitors in 6 months.</p>
          <ul class="proj-tags"><li class="proj-tag">Technical SEO</li><li class="proj-tag">Content Strategy</li><li class="proj-tag">Ahrefs</li><li class="proj-tag">GA4</li></ul>
          <div class="proj-links"><span class="proj-link disabled">Case study available on request</span></div>
        </li>
        <li class="proj-card">
          <img class="proj-thumb" src="Rag-Chatbot.png" alt="DocuBot chat interface showing a PDF document alongside a question-and-answer conversation" loading="lazy" width="640" height="360"/>
          <div class="proj-cat">AI · Automation</div>
          <h3 class="proj-name">DocuBot — Document Q&amp;A</h3>
          <p class="proj-desc">Upload any PDF and chat with it. Built with LangChain + FAISS vector store + GPT-4. Supports multi-document context, source citations, and conversation history.</p>
          <ul class="proj-tags"><li class="proj-tag">Python</li><li class="proj-tag">LangChain</li><li class="proj-tag">FAISS</li><li class="proj-tag">GPT-4</li><li class="proj-tag">Streamlit</li></ul>
          <div class="proj-links"><a class="proj-link" href="https://rag-chatbot-production-d22d.up.railway.app/app" target="_blank" rel="noopener">Live Demo</a><a class="proj-link" href="https://github.com/Iqra-Liaqat/Rag-Chatbot.git" target="_blank" rel="noopener">GitHub</a></div>
        </li>
        </ul>
      </div>`
  },

  exp: {
    label: 'Experience',
    html: `
      <div class="p-eyebrow">Career</div>
      <h2 class="p-title">Experience</h2>
      <div class="p-body">
        <ol style="list-style:none">
        <li class="tl-item">
          <div class="tl-date">2024 — Present</div>
          <h3 class="tl-role">Freelance AI Dev &amp; Full-Stack Engineer</h3>
          <div class="tl-place">Self-directed · Remote</div>
          <p class="tl-desc">Building full-stack applications and integrating AI features for clients globally. 10+ projects including e-commerce platforms, AI-powered tools, and intelligent dashboards.</p>
          <ul class="tags"><li class="tag">React</li><li class="tag">Node.js</li><li class="tag">AI APIs</li><li class="tag">LangChain</li></ul>
        </li>
        <li class="tl-item">
          <div class="tl-date">2023 — 2024</div>
          <h3 class="tl-role">SEO Content Strategist</h3>
          <div class="tl-place">Digital Agency · Part-time</div>
          <p class="tl-desc">Produced SEO-optimised technical articles for SaaS clients. Grew average client organic traffic by 180% through data-driven content architecture and keyword clustering.</p>
          <ul class="tags"><li class="tag violet">SEO Writing</li><li class="tag violet">Keyword Research</li><li class="tag violet">Ahrefs</li></ul>
        </li>
        <li class="tl-item">
          <div class="tl-date">2022 — 2023</div>
          <h3 class="tl-role">Junior Developer · Internship</h3>
          <div class="tl-place">Tech Startup · Pakistan</div>
          <p class="tl-desc">Built React frontend components, integrated REST APIs, and contributed UX improvements in a live production environment using agile sprints and Git workflows.</p>
          <ul class="tags"><li class="tag pink">React</li><li class="tag pink">REST APIs</li><li class="tag pink">Git</li><li class="tag pink">Agile</li></ul>
        </li>
        <li class="tl-item">
          <div class="tl-date">2022 — 2026 (Expected)</div>
          <h3 class="tl-role">BSc Computer Science</h3>
          <div class="tl-place">University · 6th Semester</div>
          <p class="tl-desc">Coursework spanning AI, ML, Data Science, Web Engineering, Operating Systems, DBMS, Software Engineering, and Computer Networks — applied daily to real-world projects.</p>
          <ul class="tags"><li class="tag amber">AI/ML</li><li class="tag amber">Data Science</li><li class="tag amber">Algorithms</li></ul>
        </li>
        </ol>
      </div>`
  },

  svc: {
    label: 'Services',
    html: `
      <div class="p-eyebrow">What I offer</div>
      <h2 class="p-title">Services</h2>
      <div class="p-body">
        <ul class="svc-grid">
          <li class="svc-card"><div class="svc-num">01</div><h3 class="svc-title">Full-Stack Dev</h3><div class="svc-line"></div><p class="svc-desc">End-to-end web apps — schema design, RESTful APIs, responsive performant frontends. React, Node, MongoDB.</p></li>
          <li class="svc-card"><div class="svc-num">02</div><h3 class="svc-title">AI Integration</h3><div class="svc-line"></div><p class="svc-desc">LLM APIs, RAG pipelines, NLP systems, fine-tuned models — intelligence embedded into your product's core.</p></li>
          <li class="svc-card"><div class="svc-num">03</div><h3 class="svc-title">Technical SEO</h3><div class="svc-line"></div><p class="svc-desc">Full audits, Core Web Vitals, structured data, and topic-cluster content architecture that ranks and converts.</p></li>
          <li class="svc-card"><div class="svc-num">04</div><h3 class="svc-title">Content Writing</h3><div class="svc-line"></div><p class="svc-desc">Technical blogs, product docs, UX copy, and AI-assisted content strategies that educate and drive growth.</p></li>
          <li class="svc-card"><div class="svc-num">05</div><h3 class="svc-title">ML / Data</h3><div class="svc-line"></div><p class="svc-desc">Custom ML models, data pipelines, dashboards, and predictive analytics — from EDA to deployment-ready.</p></li>
          <li class="svc-card"><div class="svc-num">06</div><h3 class="svc-title">Chatbot &amp; Agents</h3><div class="svc-line"></div><p class="svc-desc">Intelligent chatbots, document Q&amp;A systems, and autonomous AI agents using LangChain and function-calling.</p></li>
        </ul>
      </div>`
  },

  contact: {
    label: 'Contact',
    html: `
      <div class="p-eyebrow">Let's connect</div>
      <h2 class="p-title">Get in Touch</h2>
      <div class="p-body">
        <p>Available for freelance projects, internships, and remote roles. Response within 24 hours.</p>
        <div style="margin: 1.2rem 0 1.6rem">
          <a class="contact-link" href="mailto:i8858201@gmail.com"><span class="contact-icon" aria-hidden="true">@</span>i8858201@gmail.com</a>
          <a class="contact-link" href="https://www.linkedin.com/in/iqra-liaqat-8b19923a8" target="_blank" rel="noopener"><span class="contact-icon" aria-hidden="true">in</span>linkedin.com/in/iqra-liaqat-8b19923a8</a>
          <a class="contact-link" href="https://github.com/Iqra-Liaqat" target="_blank" rel="noopener"><span class="contact-icon" aria-hidden="true">gh</span>github.com/Iqra-Liaqat</a>
          <div class="contact-link" style="cursor:default"><span class="contact-icon" aria-hidden="true">◎</span>Remote · Freelance · Open to opportunities</div>
        </div>
        <form id="contact-form" novalidate action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
          <label class="form-label" for="fn">Your name</label>
          <input class="form-field" type="text" id="fn" name="name" required autocomplete="name"/>
          <label class="form-label" for="fe">Your email</label>
          <input class="form-field" type="email" id="fe" name="email" required autocomplete="email"/>
          <label class="form-label" for="fs">Service type</label>
          <select class="form-field" id="fs" name="service" required>
            <option value="" disabled selected>Select service type</option>
            <option>AI / ML Integration</option>
            <option>Full-Stack Web Development</option>
            <option>Technical SEO</option>
            <option>Content Writing</option>
            <option>Chatbot / AI Agent</option>
            <option>Other / Let's Talk</option>
          </select>
          <label class="form-label" for="fm">Message</label>
          <textarea class="form-field" id="fm" name="message" required placeholder="Describe your project or opportunity..."></textarea>
          <input type="hidden" name="_subject" value="New portfolio inquiry"/>
          <button class="form-submit" type="submit" id="fsub">Send Message</button>
          <div class="form-ok" id="fok" role="status"></div>
          <div class="form-err" id="ferr" role="alert"></div>
        </form>
      </div>`
  }
};

const dkeys = ['about','skills','proj','exp','svc','contact'];
const nmap  = { about:'a', skills:'sk', proj:'p', exp:'e', svc:'sv', contact:'c' };

let lastFocused = null;

function openPanel(k) {
  const d = PANELS[k]; if (!d) return;
  lastFocused = document.activeElement;

  document.getElementById('p-id').textContent = d.label;
  document.getElementById('p-scroll').innerHTML = d.html;
  document.getElementById('panel').classList.add('open');
  document.getElementById('panel').setAttribute('aria-hidden', 'false');
  document.getElementById('p-scroll').scrollTop = 0;

  document.querySelectorAll('.nb').forEach(b => b.classList.remove('act'));
  const nb = document.getElementById('n' + nmap[k]); if (nb) nb.classList.add('act');
  document.querySelectorAll('.dot').forEach((el, i) => el.classList.toggle('act', dkeys[i] === k));

  // wire up dynamic content: cursor hover + contact form
  document.querySelectorAll('.proj-card,.svc-card,.contact-link').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
  });

  // Project thumbnails: if the image 404s, hide the broken-icon glyph and
  // fall back to the styled gradient placeholder defined in CSS.
  document.querySelectorAll('.proj-thumb').forEach(img => {
    img.addEventListener('error', () => img.classList.add('broken'), { once: true });
  });

  const form = document.getElementById('contact-form');
  if (form) form.addEventListener('submit', handleContactSubmit);

  // focus the close button for keyboard users
  const closeBtn = document.getElementById('p-close');
  if (closeBtn) closeBtn.focus();
}

function closePanel() {
  document.getElementById('panel').classList.remove('open');
  document.getElementById('panel').setAttribute('aria-hidden', 'true');
  document.querySelectorAll('.nb,.dot').forEach(b => b.classList.remove('act'));
  if (lastFocused) lastFocused.focus();
}

/* ── CONTACT FORM — Formspree ──
   Replace YOUR_FORM_ID below with the ID from https://formspree.io
   (create a free account, create a form, copy the endpoint ID).        */
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mbdepwdy';

async function handleContactSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const n = document.getElementById('fn').value.trim();
  const em = document.getElementById('fe').value.trim();
  const s = document.getElementById('fs').value;
  const m = document.getElementById('fm').value.trim();
  const err = document.getElementById('ferr'), ok = document.getElementById('fok');
  const submitBtn = document.getElementById('fsub');

  err.style.display = 'none';
  ok.style.display = 'none';

  if (!n || !em || !s || !m) {
    err.textContent = 'Please fill in all fields before sending.';
    err.style.display = 'block';
    setTimeout(() => { err.style.display = 'none'; }, 4000);
    return;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(em)) {
    err.textContent = 'Please enter a valid email address.';
    err.style.display = 'block';
    setTimeout(() => { err.style.display = 'none'; }, 4000);
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending…';

  try {
    const res = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: new FormData(form)
    });

    if (res.ok) {
      ok.textContent = "Message sent — I'll reply within 24 hours.";
      ok.style.display = 'block';
      form.reset();
    } else {
      throw new Error('Form submission failed');
    }
  } catch {
    err.textContent = 'Something went wrong. Please email me directly at i8858201@gmail.com.';
    err.style.display = 'block';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Message';
  }
}

/* Focus trap for the side panel */
document.addEventListener('keydown', e => {
  const panel = document.getElementById('panel');
  if (!panel.classList.contains('open')) return;

  if (e.key === 'Escape') { closePanel(); return; }

  if (e.key === 'Tab') {
    const focusables = panel.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (!focusables.length) return;
    const first = focusables[0], last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});

document.addEventListener('keydown', e => {
  if (document.getElementById('panel').classList.contains('open')) return; // don't fire while panel open
  const km = {'1':'about','2':'skills','3':'proj','4':'exp','5':'svc','6':'contact'};
  if (km[e.key]) openPanel(km[e.key]);
});

setTimeout(() => { const h = document.getElementById('scroll-hint'); if (h) h.style.opacity = '0'; }, 4500);