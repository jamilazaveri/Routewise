/**
 * Routewise Frontend - Immersive Cinematic Experience Engine (JS)
 * Features:
 * 1. Multi-layer Parallax & Particle Breeze Canvas
 * 2. 3D Interactive Destination Popups & Dynamic City Atmosphere
 * 3. Scroll Storytelling & Waypoint Progress Track
 * 4. Procedural Ambient Ocean/Breeze Audio (Web Audio API)
 * 5. Desktop Soft Cursor Glow
 * 6. Effects Toggle (On/Off with persistence) & Visibility Pausing
 * 7. PWA Service Worker & Install Prompt Controller
 */

export class ImmersiveExperience {
  constructor() {
    this.effectsEnabled = localStorage.getItem('routewise_effects_enabled') !== 'false';
    this.ambientAudioEnabled = false;
    this.audioCtx = null;
    this.audioGain = null;
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.scrollY = 0;
    this.particles = [];
    this.animFrameId = null;
    this.isTabVisible = true;
    this.deferredPrompt = null;
    this.isMobile = window.innerWidth <= 768;

    this.init();
  }

  init() {
    // 1. Apply Effects State
    this.applyEffectsState();

    // 2. Setup Ambient Cursor Glow (Desktop Only)
    if (!this.isMobile) {
      this.setupCursorGlow();
    }

    // 3. Setup Parallax & Particle Breeze Canvas
    this.setupParallaxAndCanvas();

    // 4. Setup 3D Tilt for Destination Cards
    this.setupDestinationCardTilt();

    // 5. Setup Scroll Storytelling Observer & Progress Line
    this.setupScrollStorytelling();

    // 6. Setup Audio & Effects Toolbar Buttons
    this.setupToolbarControls();

    // 7. Setup Visibility Change Listener (Pause animations when tab is hidden)
    document.addEventListener('visibilitychange', () => {
      this.isTabVisible = !document.hidden;
      if (!this.isTabVisible) {
        if (this.audioCtx && this.audioCtx.state === 'running') {
          this.audioCtx.suspend();
        }
      } else {
        if (this.ambientAudioEnabled && this.audioCtx && this.audioCtx.state === 'suspended') {
          this.audioCtx.resume();
        }
      }
    });

    // 8. Register Service Worker & Setup PWA Install
    this.setupPWA();

    // 9. Attach window helpers
    window.setDestinationMood = (cityName) => this.setDestinationMood(cityName);
    window.toggleEffects = () => this.toggleEffects();
    window.toggleAmbientAudio = () => this.toggleAmbientAudio();
  }

  /* ==========================================================================
     EFFECTS ON/OFF TOGGLE
     ========================================================================== */
  applyEffectsState() {
    if (this.effectsEnabled) {
      document.body.classList.remove('effects-disabled');
    } else {
      document.body.classList.add('effects-disabled');
      if (this.ambientAudioEnabled) {
        this.toggleAmbientAudio(false);
      }
    }

    const toggleBtn = document.getElementById('effectsToggleBtn');
    if (toggleBtn) {
      toggleBtn.classList.toggle('active', this.effectsEnabled);
      const label = toggleBtn.querySelector('.btn-label');
      if (label) {
        label.textContent = this.effectsEnabled ? 'Effects: ON' : 'Effects: OFF';
      }
    }
  }

  toggleEffects(forceState) {
    this.effectsEnabled = typeof forceState === 'boolean' ? forceState : !this.effectsEnabled;
    localStorage.setItem('routewise_effects_enabled', this.effectsEnabled ? 'true' : 'false');
    this.applyEffectsState();
  }

  /* ==========================================================================
     SCENIC PARALLAX & BREEZE CANVAS
     ========================================================================== */
  setupParallaxAndCanvas() {
    const canvas = document.getElementById('scenicBreezeCanvas');
    const hero = document.querySelector('.scenic-hero-container');
    if (!canvas || !hero) return;

    const ctx = canvas.getContext('2d');
    const resizeCanvas = () => {
      canvas.width = hero.clientWidth;
      canvas.height = hero.clientHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth <= 768;
      resizeCanvas();
    }, { passive: true });

    // Initialize Petals & Light Dust Motes
    const count = this.isMobile ? 10 : 28;
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 4 + 2,
        speedX: Math.random() * 0.8 + 0.3,
        speedY: Math.random() * 0.4 + 0.1,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.04,
        type: Math.random() > 0.4 ? 'petal' : 'mote',
        color: Math.random() > 0.5 ? 'rgba(244, 63, 94, 0.45)' : 'rgba(253, 224, 71, 0.55)'
      });
    }

    // Mouse Tracking for Parallax Shift
    window.addEventListener('mousemove', (e) => {
      if (!this.effectsEnabled || this.isMobile) return;
      const x = (e.clientX / window.innerWidth) - 0.5;
      const y = (e.clientY / window.innerHeight) - 0.5;
      this.mouse.targetX = x;
      this.mouse.targetY = y;
    }, { passive: true });

    window.addEventListener('scroll', () => {
      this.scrollY = window.scrollY;
    }, { passive: true });

    // Main 60fps Animation Loop
    const hillsLayer = document.querySelector('.parallax-layer-hills');
    const palmsLayer = document.querySelector('.parallax-layer-palms');
    const fgLayer = document.querySelector('.parallax-layer-foreground');
    const sunGlow = document.querySelector('.scenic-sun-glow');

    const render = () => {
      if (this.effectsEnabled && this.isTabVisible) {
        // Smooth mouse interpolation
        this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.06;
        this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.06;

        // Parallax Transforms
        if (hillsLayer) {
          hillsLayer.style.transform = `translate3d(${this.mouse.x * -14}px, ${this.scrollY * 0.12 + this.mouse.y * -8}px, 0)`;
        }
        if (palmsLayer) {
          palmsLayer.style.transform = `translate3d(${this.mouse.x * -24}px, ${this.scrollY * 0.18 + this.mouse.y * -14}px, 0)`;
        }
        if (fgLayer) {
          fgLayer.style.transform = `translate3d(${this.mouse.x * -36}px, ${this.scrollY * 0.26 + this.mouse.y * -20}px, 0)`;
        }
        if (sunGlow) {
          sunGlow.style.transform = `translate3d(${this.mouse.x * 18}px, ${this.scrollY * 0.08 + this.mouse.y * 12}px, 0)`;
        }

        // Canvas Particle Breeze
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const p of this.particles) {
          p.x += p.speedX;
          p.y += p.speedY;
          p.angle += p.spin;

          if (p.x > canvas.width + 20) p.x = -20;
          if (p.y > canvas.height + 20) p.y = -20;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle);
          ctx.fillStyle = p.color;

          if (p.type === 'petal') {
            ctx.beginPath();
            ctx.ellipse(0, 0, p.size * 1.6, p.size * 0.7, 0, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, p.size * 0.6, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
      }

      this.animFrameId = requestAnimationFrame(render);
    };

    render();
  }

  /* ==========================================================================
     3D DESTINATION CARD TILT
     ========================================================================== */
  setupDestinationCardTilt() {
    const cards = document.querySelectorAll('.destination-popup-card');
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        if (!this.effectsEnabled || this.isMobile) return;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.03, 1.03, 1.03)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      });

      card.addEventListener('click', () => {
        const city = card.getAttribute('data-city');
        if (city) {
          const destInput = document.getElementById('destinationCityInput');
          if (destInput) {
            destInput.value = city;
            destInput.dispatchEvent(new Event('input'));
          }
          this.setDestinationMood(city);
          
          // Smooth scroll to wizard
          const wizard = document.getElementById('wizardCard');
          if (wizard) {
            wizard.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    });
  }

  /* ==========================================================================
     DYNAMIC DESTINATION MOOD CROSSFADE
     ========================================================================== */
  setDestinationMood(cityName) {
    if (!cityName) return;
    const lower = cityName.toLowerCase();
    document.body.classList.remove('mood-chennai', 'mood-pondicherry', 'mood-madurai', 'mood-coimbatore');

    if (lower.includes('pondi')) {
      document.body.classList.add('mood-pondicherry');
    } else if (lower.includes('madurai')) {
      document.body.classList.add('mood-madurai');
    } else if (lower.includes('coimbatore')) {
      document.body.classList.add('mood-coimbatore');
    } else if (lower.includes('chennai')) {
      document.body.classList.add('mood-chennai');
    }
  }

  /* ==========================================================================
     SCROLL STORYTELLING OBSERVER & PROGRESS TRACK
     ========================================================================== */
  setupScrollStorytelling() {
    const cards = document.querySelectorAll('.story-milestone-card');
    const progressLine = document.getElementById('storytellingLineProgress');
    const container = document.querySelector('.storytelling-container');

    if (cards.length > 0) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      }, { threshold: 0.25 });

      cards.forEach(card => observer.observe(card));
    }

    if (progressLine && container) {
      window.addEventListener('scroll', () => {
        const rect = container.getBoundingClientRect();
        const winH = window.innerHeight;
        const total = rect.height;
        const progress = Math.max(0, Math.min(1, (winH * 0.7 - rect.top) / total));
        progressLine.style.height = `${(progress * 100).toFixed(1)}%`;
      }, { passive: true });
    }
  }

  /* ==========================================================================
     PROCEDURAL AMBIENT SOUND GENERATOR (WEB AUDIO API)
     Zero MP3 downloads - 100% synthesized natural coastal breeze and ocean surf
     ========================================================================== */
  toggleAmbientAudio(forceState) {
    this.ambientAudioEnabled = typeof forceState === 'boolean' ? forceState : !this.ambientAudioEnabled;

    const soundBtn = document.getElementById('ambientSoundBtn');
    if (soundBtn) {
      soundBtn.classList.toggle('active', this.ambientAudioEnabled);
      const label = soundBtn.querySelector('.btn-label');
      if (label) {
        label.textContent = this.ambientAudioEnabled ? 'Breeze: Playing' : 'Ambient Breeze';
      }
    }

    if (!this.ambientAudioEnabled) {
      if (this.audioCtx && this.audioGain) {
        this.audioGain.gain.setTargetAtTime(0, this.audioCtx.currentTime, 0.5);
      }
      return;
    }

    // Initialize Web Audio API Synthesizer
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!this.audioCtx) {
        this.audioCtx = new AudioContext();

        // 1. Generate 3-second buffer of Pink Noise (pleasant natural frequency distribution)
        const bufferSize = this.audioCtx.sampleRate * 3;
        const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
          b6 = white * 0.115926;
        }

        const whiteNoise = this.audioCtx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        // 2. Coastal Biquad Filter (Lowpass warm surf filter)
        const filter = this.audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 350;

        // 3. Gentle Low-Frequency Oscillator (LFO) for wave swells (0.14 Hz)
        const lfo = this.audioCtx.createOscillator();
        lfo.frequency.value = 0.14;
        const lfoGain = this.audioCtx.createGain();
        lfoGain.gain.value = 220;
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        // 4. Master Gain Node
        this.audioGain = this.audioCtx.createGain();
        this.audioGain.gain.setValueAtTime(0, this.audioCtx.currentTime);

        whiteNoise.connect(filter);
        filter.connect(this.audioGain);
        this.audioGain.connect(this.audioCtx.destination);

        whiteNoise.start();
        lfo.start();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      // Smooth fade in
      this.audioGain.gain.setTargetAtTime(0.28, this.audioCtx.currentTime, 0.8);
    } catch (err) {
      console.warn("Web Audio API ambient synthesis unavailable:", err);
    }
  }

  /* ==========================================================================
     TOOLBAR CONTROLS SETUP
     ========================================================================== */
  setupToolbarControls() {
    const effectsBtn = document.getElementById('effectsToggleBtn');
    if (effectsBtn) {
      effectsBtn.addEventListener('click', () => this.toggleEffects());
    }

    const soundBtn = document.getElementById('ambientSoundBtn');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => this.toggleAmbientAudio());
    }
  }

  /* ==========================================================================
     DESKTOP SOFT CURSOR GLOW
     ========================================================================== */
  setupCursorGlow() {
    const glow = document.createElement('div');
    glow.className = 'ambient-cursor-glow';
    document.body.appendChild(glow);

    let curX = -200, curY = -200;
    let targetX = -200, targetY = -200;

    window.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
    }, { passive: true });

    const trackCursor = () => {
      if (this.effectsEnabled && !this.isMobile) {
        curX += (targetX - curX) * 0.15;
        curY += (targetY - curY) * 0.15;
        glow.style.transform = `translate3d(${curX}px, ${curY}px, 0)`;
      }
      requestAnimationFrame(trackCursor);
    };
    trackCursor();
  }

  /* ==========================================================================
     PWA SERVICE WORKER & INSTALL PROMPT
     ========================================================================== */
  setupPWA() {
    // 1. Register Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then(reg => {
            console.log('Routewise PWA ServiceWorker registered with scope:', reg.scope);
          })
          .catch(err => {
            console.warn('PWA ServiceWorker registration failed:', err);
          });
      });
    }

    // 2. Capture 'beforeinstallprompt'
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      const banner = document.getElementById('pwaInstallBanner');
      if (banner) {
        banner.classList.add('visible');
      }
    });

    const confirmBtn = document.getElementById('pwaConfirmInstallBtn');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', async () => {
        const banner = document.getElementById('pwaInstallBanner');
        if (banner) banner.classList.remove('visible');

        if (this.deferredPrompt) {
          this.deferredPrompt.prompt();
          const { outcome } = await this.deferredPrompt.userChoice;
          console.log(`User response to PWA install prompt: ${outcome}`);
          this.deferredPrompt = null;
        }
      });
    }

    const dismissBtn = document.getElementById('pwaDismissInstallBtn');
    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => {
        const banner = document.getElementById('pwaInstallBanner');
        if (banner) banner.classList.remove('visible');
      });
    }
  }
}

// Auto-initialize when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.immersiveExp = new ImmersiveExperience();
});
