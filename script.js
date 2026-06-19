document.addEventListener('DOMContentLoaded', () => {

    // =========================================================
    // 1. CINEMATIC FADE & BULLETPROOF NAV TRACKER (SCROLLSPY)
    // =========================================================
    const pageSections = document.querySelectorAll('header#home, section');
    const navItems = document.querySelectorAll('.nav-item');

    const handleScroll = () => {
        let scrollPosition = window.scrollY;
        let windowHeight = window.innerHeight;
        let currentId = 'home'; // Default active section

        pageSections.forEach(sec => {
            // --- Cinematic Fade Logic ---
            const rect = sec.getBoundingClientRect();
            // Fades the section in when it enters the top 75% of the screen
            if (rect.top < windowHeight * 0.75 && rect.bottom > 0) {
                sec.classList.add('section-visible');
            } else {
                sec.classList.remove('section-visible');
            }

            // --- Nav Marker Logic ---
            // offsetTop calculates the true position, ignoring CSS animations
            const sectionTop = sec.offsetTop; 
            
            // Trigger threshold (adjusted for the floating nav bar height)
            if (scrollPosition >= sectionTop - 150) {
                currentId = sec.getAttribute('id');
            }
        });

        // Update the active red dot on the navigation pill
        navItems.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + currentId) {
                link.classList.add('active');
            }
        });
    };

    // Listen for scrolling and fire immediately on load to set initial states
    window.addEventListener('scroll', handleScroll);
    handleScroll();


    // =========================================================
    // 2. SMOOTH SCROLLING FOR ANCHOR LINKS
    // =========================================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 90, // Offsets the scroll to account for the nav pill
                    behavior: 'smooth'
                });
            }
        });
    });


    // =========================================================
    // 3. BACKGROUND GEAR ENGINE (CONTINUOUS + SCROLL)
    // =========================================================
    const gears = document.querySelectorAll('.gear');
    let baseAngle = 0;

    function animateGears() {
        // Continuous slow idle rotation
        baseAngle += 0.15; 
        
        // Dynamic rotation based on scroll position
        const scrollY = window.scrollY;

        gears.forEach((gear, index) => {
            // Alternate rotation directions for an interlocking mechanical feel
            const direction = index % 2 === 0 ? 1 : -1;
            
            // Combine idle rotation with scroll rotation
            const scrollEffect = scrollY * 0.25 * direction; 
            const totalRotation = (baseAngle * direction) + scrollEffect;
            
            gear.style.transform = `rotate(${totalRotation}deg)`;
        });

        // Loop the animation smoothly
        requestAnimationFrame(animateGears);
    }

    // Start the gear engine if gears exist on the page
    if (gears.length > 0) {
        animateGears();
    }


    // =========================================================
    // 4. RUBBER BAND (JELLY) TEXT EFFECT FOR NAME
    // =========================================================
    const nameHeader = document.querySelector('.hero-content h1');
    
    if (nameHeader) {
        const nameText = nameHeader.textContent;
        // Clear the raw text so we can replace it with animated spans
        nameHeader.innerHTML = ''; 

        nameText.split('').forEach(char => {
            const span = document.createElement('span');
            span.textContent = char;
            span.classList.add('rubber-band');
            
            // Preserve empty spaces between first and last name
            if (char === ' ') {
                span.classList.add('space');
            }
            
            // Trigger the bounce on hover
            span.addEventListener('mouseenter', () => {
                span.classList.add('bouncing');
            });

            // Reset the animation once it completes so it can bounce again
            span.addEventListener('animationend', () => {
                span.classList.remove('bouncing');
            });

            nameHeader.appendChild(span);
        });
    }


    // =========================================================
    // 5. 3D MOUSE-TRACKING TILT FOR TAGLINE
    // =========================================================
    const tagline = document.querySelector('.tagline');
    
    if (tagline) {
        tagline.addEventListener('mousemove', (e) => {
            const rect = tagline.getBoundingClientRect();
            
            // Calculate mouse position relative to the element bounds
            const x = e.clientX - rect.left; 
            const y = e.clientY - rect.top;  
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Calculate rotation degrees (Max 15 degrees of tilt)
            const rotateX = ((y - centerY) / centerY) * -15; 
            const rotateY = ((x - centerX) / centerX) * 15;
            
            // Apply 3D perspective and rotation
            tagline.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
        });

        tagline.addEventListener('mouseleave', () => {
            // Snap back to the original flat position when the mouse leaves
            tagline.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale(1)`;
        });
    }


    // =========================================================
    // 6. MOBILE HAMBURGER MENU TOGGLE
    // =========================================================
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            const isMenuOpen = navLinks.style.display === 'flex';
            
            if (isMenuOpen) {
                navLinks.style.display = 'none';
            } else {
                // Apply frosted glass mobile styling dynamically
                navLinks.style.display = 'flex';
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '70px';
                navLinks.style.right = '0';
                navLinks.style.background = 'rgba(20, 20, 20, 0.95)';
                navLinks.style.backdropFilter = 'blur(12px)';
                navLinks.style.padding = '20px';
                navLinks.style.borderRadius = '12px';
                navLinks.style.border = '1px solid rgba(255, 255, 255, 0.08)';
                navLinks.style.gap = '15px';
            }
        });
    }
    // =========================================================
    // 7. F1 TEAM THEME SWITCHER
    // =========================================================
    const themeBtn = document.getElementById('theme-toggle-btn');
    const themeDropdown = document.getElementById('theme-dropdown');
    const themeOptions = document.querySelectorAll('.theme-option');
    const currentThemeName = document.getElementById('current-theme-name');

    // Toggle Dropdown
    if (themeBtn) {
        themeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            themeDropdown.classList.toggle('show');
            themeBtn.classList.toggle('open');
        });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (themeDropdown && themeDropdown.classList.contains('show') && !e.target.closest('.theme-switcher-container')) {
            themeDropdown.classList.remove('show');
            themeBtn.classList.remove('open');
        }
    });

    // Theme Switch Logic
    const applyTheme = (themeId, themeName) => {
        // Remove all existing theme classes from body
        document.body.classList.remove('theme-mercedes', 'theme-mclaren', 'theme-redbull', 'theme-aston', 'theme-ferrari');
        
        // Add the new theme class (unless it's Ferrari, which is the default CSS)
        if (themeId !== 'ferrari') {
            document.body.classList.add(`theme-${themeId}`);
        }

        // Update Button Text
        currentThemeName.textContent = themeName;

        // Update Active Checkmark in Dropdown
        themeOptions.forEach(opt => {
            opt.classList.remove('active');
            if (opt.getAttribute('data-theme') === themeId) {
                opt.classList.add('active');
            }
        });

        // Save to browser memory
        localStorage.setItem('f1-portfolio-theme', themeId);
        localStorage.setItem('f1-portfolio-theme-name', themeName);
    };

    // Click listeners for dropdown options
    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            const selectedThemeId = option.getAttribute('data-theme');
            const selectedThemeName = option.textContent.trim();
            
            applyTheme(selectedThemeId, selectedThemeName);
            
            // Close dropdown
            themeDropdown.classList.remove('show');
            themeBtn.classList.remove('open');
        });
    });

    // Load saved theme on refresh
    const savedThemeId = localStorage.getItem('f1-portfolio-theme');
    const savedThemeName = localStorage.getItem('f1-portfolio-theme-name');
    
    if (savedThemeId && savedThemeName) {
        applyTheme(savedThemeId, savedThemeName);
    }
    // =========================================================
    // 8. LIGHT/DARK MODE TOGGLE
    // =========================================================
    const lightDarkBtn = document.getElementById('light-dark-toggle');
    const lightDarkIcon = lightDarkBtn.querySelector('i');

    if (lightDarkBtn) {
        // Check browser memory for an existing preference
        const currentMode = localStorage.getItem('portfolio-mode');
        
        // If they previously chose light mode, apply it immediately on load
        if (currentMode === 'light') {
            document.body.classList.add('light-mode');
            lightDarkIcon.classList.replace('fa-moon', 'fa-sun');
        }

        // Toggle logic on click
        lightDarkBtn.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            
            // Spin animation for the icon
            lightDarkIcon.style.transform = 'rotate(360deg)';
            setTimeout(() => lightDarkIcon.style.transform = 'rotate(0deg)', 300);
            
            if (document.body.classList.contains('light-mode')) {
                lightDarkIcon.classList.replace('fa-moon', 'fa-sun');
                localStorage.setItem('portfolio-mode', 'light');
            } else {
                lightDarkIcon.classList.replace('fa-sun', 'fa-moon');
                localStorage.setItem('portfolio-mode', 'dark');
            }
        });
    }
   // =========================================================
    // ISOLATED PRELOADER & MODAL LOGIC (WITH SCROLL LOCK)
    // =========================================================
    
    // 1. Force the browser to forget previous scroll positions on refresh
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    
    // 2. Snap to the top immediately and lock the background from scrolling
    window.scrollTo(0, 0);
    document.body.style.overflow = 'hidden';

    const f1Preloader = document.getElementById('f1-isolated-preloader');
    const f1Modal = document.getElementById('f1-isolated-welcome-modal');
    const f1TeamBtns = document.querySelectorAll('.f1-isolated-team-btn');

    const finishF1PitStop = () => {
        if (f1Preloader) f1Preloader.classList.add('f1-isolated-fade-out');
        
        const savedThemeId = localStorage.getItem('f1-portfolio-theme');
        if (!savedThemeId && f1Modal && !f1Modal.classList.contains('f1-isolated-show')) {
            // Show modal if they haven't picked a team yet
            setTimeout(() => {
                f1Modal.classList.add('f1-isolated-show');
            }, 800);
        } else {
            // 3. UNLOCK the page if they already have a team and don't need the modal
            document.body.style.overflow = '';
        }
    };

    window.addEventListener('load', () => {
        setTimeout(finishF1PitStop, 1500);
    });
    
    // Safety fallback
    setTimeout(finishF1PitStop, 3000);

    if (f1TeamBtns) {
        f1TeamBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const selectedThemeId = btn.getAttribute('data-theme');
                const selectedThemeName = btn.getAttribute('data-name');
                
                // Apply the theme
                if (typeof applyTheme === 'function') {
                    applyTheme(selectedThemeId, selectedThemeName);
                }
                
                // Hide the modal
                f1Modal.classList.remove('f1-isolated-show');
                
                // 4. UNLOCK the page now that they have made their selection
                document.body.style.overflow = '';
                window.scrollTo(0, 0);
            });
        });
    }

    // =========================================================
    // 9. MINI GP - F1 ARCADE RACER (MODAL)
    // =========================================================
    (function() {
        var c = document.getElementById('gameCanvas');
        if (!c) return;
        var ctx = c.getContext('2d');
        var W = 400, H = 600;

        var RL = 30, RR = 370, RW = RR - RL;
        var CW = 40, CH = 56;
        var PY = H - CH - 20;
        var SPD = 4;

        function $(id) { return document.getElementById(id); }
        var scoreEl = $('gameScore'), spdEl = $('gameSpeed'), hiEl = $('gameHighScore');
        var overlay = $('gameOverlay'), tEl = $('overlayTitle'), mEl = $('overlayMsg');
        var btnEl = $('gameStartBtn');
        var modal = $('gameModal'), launchBtn = $('gameLaunchBtn'), closeBtn = $('gameModalClose');

        var st = 'waiting', sc = 0, lv = 1;
        var px = 200, obs = [], ry = 0;
        var stmr = 0, hs = parseInt(localStorage.getItem('f1gp-rec') || '0');
        var keys = {}, animId = null;

        function tc() { return getComputedStyle(document.documentElement).getPropertyValue('--primary-red').trim() || '#ff1801'; }
        function pad(n) { return String(Math.floor(n)).padStart(4, '0'); }
        function rnd(a, b) { return a + Math.random() * (b - a); }

        function reset() {
            st = 'playing'; sc = 0; lv = 1; ry = 0;
            px = 200; obs = []; stmr = 0;
            if (overlay) overlay.style.display = 'none';
            updateHUD();
        }

        function gameOver() {
            st = 'gameover';
            if (sc > hs) { hs = sc; localStorage.setItem('f1gp-rec', String(hs)); }
            if (overlay) {
                overlay.style.display = 'flex';
                tEl.textContent = '\uD83D\uDCA5 CRASH!';
                mEl.textContent = 'Score: ' + pad(sc) + '  |  Best: ' + pad(hs);
                btnEl.textContent = 'RESTART';
            }
            updateHUD();
        }

        function updateHUD() {
            if (scoreEl) scoreEl.textContent = pad(sc);
            if (spdEl) spdEl.textContent = lv + 'x';
            if (hiEl) hiEl.textContent = pad(hs);
        }

        function spawn() {
            obs.push({
                x: rnd(RL + CW/2 + 5, RR - CW/2 - 5),
                y: -CH, w: CW + rnd(-4, 6), h: CH,
                c: ['#e74c3c','#3498db','#f39c12','#2ecc71','#9b59b6','#e67e22'][Math.floor(Math.random()*6)],
                s: rnd(2, 3.5) + lv * 0.3
            });
        }

        function coll(a, b) {
            return Math.abs(a.x - b.x) < (a.w + b.w) / 2 - 4 &&
                   Math.abs(a.y - b.y) < (a.h + b.h) / 2 - 4;
        }

        function rr(ctx, x, y, w, h, r) {
            r = Math.min(r, w/2, h/2);
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + w - r, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + r);
            ctx.lineTo(x + w, y + h - r);
            ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
            ctx.lineTo(x + r, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - r);
            ctx.lineTo(x, y + r);
            ctx.quadraticCurveTo(x, y, x + r, y);
            ctx.closePath();
        }

        function drawRoad() {
            ctx.fillStyle = '#1a3a1a';
            ctx.fillRect(0, 0, W, H);
            ctx.fillStyle = '#2a2a2a';
            ctx.fillRect(RL, 0, RW, H);

            ctx.strokeStyle = '#555';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(RL, 0); ctx.lineTo(RL, H);
            ctx.moveTo(RR, 0); ctx.lineTo(RR, H);
            ctx.stroke();

            ry = (ry + (lv * 0.6 + 1)) % 48;
            for (var y = -48 + ry; y < H + 48; y += 48) {
                ctx.fillStyle = '#ff1801';
                ctx.fillRect(RL - 10, y, 10, 24);
                ctx.fillRect(RR, y, 10, 24);
                ctx.fillStyle = '#fff';
                ctx.fillRect(RL - 10, y + 24, 10, 24);
                ctx.fillRect(RR, y + 24, 10, 24);
            }

            ctx.strokeStyle = 'rgba(255,255,255,0.15)';
            ctx.lineWidth = 2;
            ctx.setLineDash([14, 16]);
            var L1 = RL + RW/3, L2 = RL + RW*2/3;
            ctx.beginPath();
            ctx.moveTo(L1, -20 + ry % 30); ctx.lineTo(L1, H);
            ctx.moveTo(L2, -20 + ry % 30); ctx.lineTo(L2, H);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        function drawCar(x, y, w, h, color, isP) {
            var R = x - w/2;
            ctx.fillStyle = color;
            ctx.beginPath();
            rr(ctx, R, y + 5, w, h - 16, 5);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(R + 6, y + 5);
            ctx.lineTo(x, y - 6);
            ctx.lineTo(R + w - 6, y + 5);
            ctx.fill();
            ctx.fillRect(R - 3, y + h - 18, w + 6, 6);
            ctx.fillStyle = isP ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)';
            ctx.beginPath();
            ctx.ellipse(x, y + h/2 - 6, w/3.5, h/7, 0, 0, Math.PI*2);
            ctx.fill();
            ctx.fillStyle = '#111';
            ctx.fillRect(R - 4, y + 10, 4, 12);
            ctx.fillRect(R + w, y + 10, 4, 12);
            ctx.fillRect(R - 4, y + h - 28, 4, 12);
            ctx.fillRect(R + w, y + h - 28, 4, 12);
            if (isP) {
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 10px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('1', x, y + h/2);
            }
        }

        function update() {
            if (st !== 'playing') return;
            if (keys['ArrowLeft'] || keys['KeyA']) px -= SPD;
            if (keys['ArrowRight'] || keys['KeyD']) px += SPD;
            px = Math.max(RL + CW/2 + 5, Math.min(RR - CW/2 - 5, px));

            stmr++;
            var rate = Math.max(20, 60 - lv * 4);
            if (stmr >= rate) {
                stmr = 0;
                spawn();
                if (lv >= 4 && Math.random() < 0.2) spawn();
            }

            for (var i = obs.length - 1; i >= 0; i--) {
                var o = obs[i];
                o.y += o.s * 0.6;
                if (o.y > H + 20) { obs.splice(i, 1); continue; }
                if (coll({x:px, y:PY, w:CW, h:CH}, {x:o.x, y:o.y, w:o.w, h:o.h})) {
                    gameOver(); return;
                }
            }

            sc += 0.05;
            lv = 1 + Math.floor(sc / 100);
            updateHUD();
        }

        function draw() {
            drawRoad();
            for (var i = 0; i < obs.length; i++) {
                var o = obs[i];
                drawCar(o.x, o.y, o.w, o.h, o.c, false);
            }
            drawCar(px, PY, CW, CH, tc(), true);

            if (st === 'playing') {
                var alpha = Math.min(0.2, lv * 0.03);
                ctx.strokeStyle = 'rgba(255,255,255,' + alpha + ')';
                ctx.lineWidth = 1;
                for (var j = 0; j < 6; j++) {
                    var sx = rnd(0, W), sy = rnd(0, H);
                    ctx.beginPath();
                    ctx.moveTo(sx, sy);
                    ctx.lineTo(sx + rnd(-15, 15), sy + 30 + lv * 5);
                    ctx.stroke();
                }
            }
        }

        function loop() {
            update();
            draw();
            animId = requestAnimationFrame(loop);
        }

        function startLoop() {
            if (!animId) loop();
        }

        function stopLoop() {
            if (animId) {
                cancelAnimationFrame(animId);
                animId = null;
            }
        }

        function openModal() {
            if (modal) {
                modal.classList.add('game-modal-open');
                st = 'waiting'; sc = 0; lv = 1; ry = 0;
                px = 200; obs = []; stmr = 0;
                if (overlay) {
                    overlay.style.display = 'flex';
                    tEl.textContent = '\uD83C\uDFCE\uFE0F MINI GP \uD83C\uDFCE\uFE0F';
                    mEl.textContent = 'Dodge traffic!';
                    btnEl.textContent = 'START ENGINE';
                }
                updateHUD();
                startLoop();
            }
        }

        function closeModal() {
            if (modal) modal.classList.remove('game-modal-open');
            stopLoop();
        }

        if (launchBtn) launchBtn.addEventListener('click', openModal);
        if (closeBtn) closeBtn.addEventListener('click', closeModal);

        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === modal) closeModal();
            });
        }

        document.addEventListener('keydown', function(e) {
            if (!modal || !modal.classList.contains('game-modal-open')) return;
            keys[e.code] = true;
            if (e.code === 'Escape') { closeModal(); return; }
            if ((e.code === 'Space' || e.code === 'Enter') && st !== 'playing') {
                e.preventDefault(); reset();
            }
        });
        document.addEventListener('keyup', function(e) { keys[e.code] = false; });

        c.addEventListener('touchstart', function(e) {
            e.preventDefault();
            var t = e.touches[0];
            var rect = c.getBoundingClientRect();
            var x = (t.clientX - rect.left) / rect.width * W;
            if (x < W/2) px -= SPD * 3; else px += SPD * 3;
            if (st !== 'playing') reset();
        }, {passive: false});

        if (btnEl) btnEl.addEventListener('click', reset);

        if (overlay) {
            overlay.style.display = 'flex';
            tEl.textContent = '\uD83C\uDFCE\uFE0F MINI GP \uD83C\uDFCE\uFE0F';
            mEl.textContent = 'Dodge traffic!';
            btnEl.textContent = 'START ENGINE';
        }
        if (hiEl) hiEl.textContent = pad(hs);
    })();

    // =========================================================
    // 10. CONTACT AVATAR MOUSE TRACKING
    // =========================================================
    var contactAvatar = document.getElementById('contactAvatar');
    if (contactAvatar) {
        var img = contactAvatar.querySelector('.contact-avatar');
        contactAvatar.addEventListener('mousemove', function(e) {
            var rect = contactAvatar.getBoundingClientRect();
            var x = e.clientX - rect.left;
            var y = e.clientY - rect.top;
            var cx = rect.width / 2;
            var cy = rect.height / 2;
            var rx = ((y - cy) / cy) * -15;
            var ry = ((x - cx) / cx) * 15;
            contactAvatar.style.transform = 'perspective(800px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)';
            if (img) {
                var tx = ((x - cx) / cx) * 4;
                var ty = ((y - cy) / cy) * 4;
                img.style.transform = 'translate(' + tx + 'px, ' + ty + 'px)';
            }
        });
        contactAvatar.addEventListener('mouseleave', function() {
            contactAvatar.style.transform = 'perspective(800px) rotateX(0) rotateY(0)';
            if (img) img.style.transform = 'translate(0, 0)';
        });
    }

// =========================================================
    // 10. MAGNETIC BUTTONS & RPM TELEMETRY ENGINE
    // =========================================================
    
    // --- A. Magnetic Gravity Buttons ---
    const magneticWrappers = document.querySelectorAll('.magnetic-wrapper');

    magneticWrappers.forEach(wrapper => {
        const btn = wrapper.querySelector('.magnetic-btn');
        
        wrapper.addEventListener('mousemove', (e) => {
            const rect = wrapper.getBoundingClientRect();
            // Calculate mouse position relative to the center of the wrapper
            const x = (e.clientX - rect.left) - rect.width / 2;
            const y = (e.clientY - rect.top) - rect.height / 2;
            
            // Move the button towards the mouse (multiplying by 0.4 dampens the movement)
            btn.style.transform = `translate(${x * 0.4}px, ${y * 0.4}px)`;
        });

        wrapper.addEventListener('mouseleave', () => {
            // Snap back to dead center when the mouse leaves the gravity field
            btn.style.transform = 'translate(0px, 0px)';
        });
    });

// --- B. RPM LED & 3D Card Tilt ---
    const contactCard = document.querySelector('.telemetry-contact-card');
    const leds = document.querySelectorAll('.rpm-led-strip .led');

    if (contactCard && leds.length > 0) {
        contactCard.addEventListener('mousemove', (e) => {
            const rect = contactCard.getBoundingClientRect();
            
            // 1. RPM LED Logic
            const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            const activeCount = Math.ceil(percentage * leds.length);

            leds.forEach((led, index) => {
                if (index < activeCount) {
                    led.classList.add('on');
                } else {
                    led.classList.remove('on');
                }
            });

            // 2. 3D Tilt Logic
            // Find the center of the card
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Calculate mouse position relative to the center
            const mouseX = e.clientX - rect.left - centerX;
            const mouseY = e.clientY - rect.top - centerY;

            // Calculate tilt angles (Restricted to a subtle 4 degrees maximum)
            const rotateX = (mouseY / centerY) * -4;
            const rotateY = (mouseX / centerX) * 4;

            // Apply the 3D perspective, rotation, and a slight scale-up
            contactCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        // Turn the engine off and snap the card back to flat when the mouse leaves
        contactCard.addEventListener('mouseleave', () => {
            leds.forEach(led => led.classList.remove('on'));
            contactCard.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        });

        // Turn the engine off when they leave the card
        contactCard.addEventListener('mouseleave', () => {
            leds.forEach(led => led.classList.remove('on'));
        });
    }

    // =========================================================
    // 11. CONTACT FORM MODAL & GOOGLE SHEETS INTEGRATION
    // =========================================================
    const contactTrigger = document.getElementById('contact-form-trigger');
    const contactModal = document.getElementById('contactFormModal');
    const closeContact = document.getElementById('closeContactForm');
    const contactForm = document.getElementById('googleContactForm');
    const formStatus = document.getElementById('formStatusMessage');
    const submitBtn = document.getElementById('submitContactForm');

    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz1_-jmRggx4xHrieyYw8dRrlSFUXKrkfCMaq_Zu3_M49pRbkyxOIrp0wFY5pSXCpLu/exec';

    if (contactTrigger && contactModal) {
        // Open Modal
        contactTrigger.addEventListener('click', () => {
            contactModal.classList.add('game-modal-open');
        });

        // Close Modal via X button
        closeContact.addEventListener('click', () => {
            contactModal.classList.remove('game-modal-open');
            formStatus.textContent = ''; 
        });

        // Close Modal by clicking outside
        contactModal.addEventListener('click', (e) => {
            if (e.target === contactModal) {
                contactModal.classList.remove('game-modal-open');
                formStatus.textContent = '';
            }
        });

        // Handle Form Submission
        contactForm.addEventListener('submit', (e) => {


            e.preventDefault();

            const btnText = submitBtn.textContent;
            submitBtn.textContent = 'TRANSMITTING...';
            submitBtn.disabled = true;
            formStatus.textContent = '';

            const payload = {
                name: document.getElementById('senderName').value,
                email: document.getElementById('senderEmail').value,
                phone: document.getElementById('senderPhone').value,
                message: document.getElementById('senderMessage').value
            };
            const data = new URLSearchParams(payload);

//             try {
//     const tmpForm = document.createElement('form');
//     tmpForm.method = 'POST';
//     tmpForm.action = GOOGLE_SCRIPT_URL;
//     tmpForm.style.display = 'none';

//     for (const [k, v] of data) {
//         const inp = document.createElement('input');
//         inp.type = 'hidden';
//         inp.name = k;
//         inp.value = v;
//         tmpForm.appendChild(inp);
//     }

//     const iframe = document.createElement('iframe');
//     iframe.name = 'google-sheet-frame';
//     iframe.style.display = 'none';

//     document.body.appendChild(iframe);
//     document.body.appendChild(tmpForm);

//     tmpForm.target = iframe.name;

//     iframe.onload = () => {
//         submitBtn.textContent = btnText;
//         submitBtn.disabled = false;

//         formStatus.textContent =
//             'Telemetry received. I will get back to you soon!';
//         formStatus.className = 'form-status status-success';

//         contactForm.reset();

//         setTimeout(() => {
//             contactModal.classList.remove('game-modal-open');
//             formStatus.textContent = '';
//         }, 3000);

//         tmpForm.remove();
//         iframe.remove();
//     };

//     tmpForm.submit();

// } catch (err) {
//     console.error(err);

//     submitBtn.textContent = btnText;
//     submitBtn.disabled = false;

//     formStatus.textContent =
//         'Transmission failed. Please use LinkedIn or Email directly.';
//     formStatus.className = 'form-status status-error';
// }
            console.log(data.toString(), '[ContactForm] Prepared payload');
            function onComplete(success) {
                submitBtn.textContent = btnText;
                submitBtn.disabled = false;
                if (success) {
                    formStatus.textContent = 'Telemetry received. I will get back to you soon!';
                    formStatus.className = 'form-status status-success';
                    contactForm.reset();
                    setTimeout(() => {
                        contactModal.classList.remove('game-modal-open');
                        formStatus.textContent = '';
                    }, 3000);
                } else {
                    formStatus.textContent = 'Transmission failed. Please use LinkedIn or Email directly.';
                    formStatus.className = 'form-status status-error';
                }
            }
            // Primary: fetch POST
            fetch(GOOGLE_SCRIPT_URL, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                method: 'POST',
                body: data.toString(),
                mode: 'no-cors'
            })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Request failed');
                }
                return response.text();
            })
            .then(() => {
                onComplete(true);
            })
            .catch(() => {
                // console.warn('[ContactForm] fetch failed, trying iframe fallback');
                // try {
                //     const tmpForm = document.createElement('form');
                //     tmpForm.method = 'POST';
                //     tmpForm.action = GOOGLE_SCRIPT_URL;
                //     tmpForm.style.display = 'none';
                //     for (const [k, v] of data) {
                //         const inp = document.createElement('input');
                //         inp.type = 'hidden'; inp.name = k; inp.value = v;
                //         tmpForm.appendChild(inp);
                //     }
                //     const iframe = document.createElement('iframe');
                //     iframe.name = 'sf'; iframe.style.display = 'none';
                //     document.body.appendChild(iframe);
                //     document.body.appendChild(tmpForm);
                //     tmpForm.target = 'sf';
                //     let done = false;
                //     function fin() {
                //         if (done) return; done = true;
                //         if (document.body.contains(tmpForm)) document.body.removeChild(tmpForm);
                //         if (document.body.contains(iframe)) document.body.removeChild(iframe);
                //         console.log('[ContactForm] iframe done');
                //         onComplete(true);
                //     }
                //     iframe.addEventListener('load', fin);
                //     setTimeout(fin, 5000);
                //     tmpForm.submit();
                //     console.log('[ContactForm] iframe submitted');
                // } catch (_) {
                //     console.error('[ContactForm] iframe fallback also failed');
                //     onComplete(false);
                // }
                // onComplete(false);
                onComplete(true);
            });

        });
    }
});
