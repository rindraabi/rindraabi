document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Header Background Change on Scroll ---
    const header = document.querySelector('header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // --- 2. Mobile Menu Toggle Logic ---
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const links = document.querySelectorAll('.nav-links li a');

    if(menuToggle) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('is-active');
        });
    }

    // --- 3. Close Menu When a Link is Clicked ---
    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            if(menuToggle) menuToggle.classList.remove('is-active');
        });
    });

// --- 4. Active Link Highlighter on Scroll (SAFE for multi-page) ---
const sections = document.querySelectorAll('section');

window.addEventListener('scroll', () => {
    // Hanya jalankan highlighter kalau halaman ini punya section dengan id (biasanya index.html)
    if (!sections || sections.length === 0) return;

    let current = '';
    sections.forEach(section => {
        const id = section.getAttribute('id');
        if (!id) return;

        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.pageYOffset >= (sectionTop - sectionHeight / 3)) {
            current = id;
        }
    });

    // Hanya aktifkan untuk link yang mengarah ke anchor (#id) atau (index.html#id)
    links.forEach(link => {
        const href = (link.getAttribute('href') || '').trim();
        link.classList.remove('active');

        if (!current) return;

        // Match "#about" atau "index.html#about"
        if (href === `#${current}` || href.endsWith(`#${current}`)) {
            link.classList.add('active');
        }
    });
});



    // --- 5. Lanyard DRAG, SWING & STRETCH PHYSICS ---
    const lanyardWrapper = document.querySelector('.lanyard-wrapper');
    const rope = document.querySelector('.rope');
    
    if(lanyardWrapper && rope) {
        let isDragging = false;
        let startX = 0;
        let startY = 0;
        const initialRopeHeight = 150; 

        const startDrag = (e) => {
            isDragging = true;
            startX = e.pageX || e.touches[0].pageX;
            startY = e.pageY || e.touches[0].pageY;
            lanyardWrapper.style.transition = 'none'; 
            rope.style.transition = 'none';
            lanyardWrapper.style.cursor = 'grabbing';
        };

        const onDrag = (e) => {
            if (!isDragging) return;
            const currentX = e.pageX || e.touches[0].pageX;
            const currentY = e.pageY || e.touches[0].pageY;
            const diffX = currentX - startX;
            const diffY = currentY - startY;

            let rotate = diffX / 15; 
            if (rotate > 60) rotate = 60;
            if (rotate < -60) rotate = -60;

            let stretch = diffY > 0 ? diffY : 0; 
            if (stretch > 300) stretch = 300;

            lanyardWrapper.style.transform = `rotate(${rotate}deg)`;
            rope.style.height = `${initialRopeHeight + stretch}px`;
        };

        const endDrag = () => {
            if (!isDragging) return;
            isDragging = false;
            const elastic = '1s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            lanyardWrapper.style.transition = `transform ${elastic}`;
            rope.style.transition = `height ${elastic}`;
            lanyardWrapper.style.transform = 'rotate(0deg)'; 
            rope.style.height = `${initialRopeHeight}px`;
            lanyardWrapper.style.cursor = 'grab';
        };

        lanyardWrapper.addEventListener('mousedown', startDrag);
        window.addEventListener('mousemove', onDrag);
        window.addEventListener('mouseup', endDrag);

        lanyardWrapper.addEventListener('touchstart', startDrag);
        window.addEventListener('touchmove', onDrag);
        window.addEventListener('touchend', endDrag);
    }

    // --- 6. BACKGROUND FLOATING IMAGES LOGIC (FIXED) ---
    const bgContainer = document.getElementById('bgAnimation');
    
    const bgImages = [
        'images/tungtungsahur.png',
        'images/tralalelotralala.png',
        'images/capuchinoasesino.png'
    ];

    const createFloatingImages = () => {
        bgContainer.innerHTML = ''; // Clean start
        const count = 20; // Number of floating items
        
        for (let i = 0; i < count; i++) {
            const img = document.createElement('img');
            
            const randomImg = bgImages[Math.floor(Math.random() * bgImages.length)];
            img.src = randomImg;
            img.alt = "Floating Icon";
            img.classList.add('bg-icon');
            
            const randomLeft = Math.floor(Math.random() * 95);
            img.style.left = `${randomLeft}%`;
            
            const randomSize = Math.floor(Math.random() * 40) + 60;
            img.style.width = `${randomSize}px`;

            const randomDuration = Math.floor(Math.random() * 15) + 10;
            img.style.animation = `floatUp ${randomDuration}s linear infinite`;
            
            const randomDelay = Math.floor(Math.random() * 20);
            img.style.animationDelay = `-${randomDelay}s`; 

            bgContainer.appendChild(img);
        }
    };

    if(bgContainer) {
        createFloatingImages();
    }

    // =================================================
    //  HELPER: DETEKSI WAKTU & ENVIRONMENT PENGGUNA
    // =================================================
    const pad = (n) => String(n).padStart(2, '0');

    const getEnvironmentInfo = () => {
        const ua = navigator.userAgent || '';
        let deviceType = /Mobi|Android|iPhone|iPad/i.test(ua) ? 'Mobile' : 'Desktop/Laptop';

        let os = 'Unknown';
        if (/Windows NT/i.test(ua)) os = 'Windows';
        else if (/Android/i.test(ua)) os = 'Android';
        else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
        else if (/Mac OS X/i.test(ua)) os = 'macOS';
        else if (/Linux/i.test(ua)) os = 'Linux';

        let browser = 'Unknown';
        if (/Edg\//.test(ua)) browser = 'Microsoft Edge';
        else if (/OPR\/|Opera/i.test(ua)) browser = 'Opera';
        else if (/Chrome\//.test(ua) && !/Edg\//.test(ua) && !/OPR\/|Opera/i.test(ua)) browser = 'Chrome';
        else if (/Firefox\//.test(ua)) browser = 'Firefox';
        else if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) browser = 'Safari';

        let app = 'Browser biasa';
        if (/Instagram/i.test(ua)) app = 'Instagram In-App Browser';
        else if (/FBAN|FBAV/i.test(ua)) app = 'Facebook In-App Browser';
        else if (/WhatsApp/i.test(ua)) app = 'WhatsApp In-App Browser';
        else if (/Line/i.test(ua)) app = 'LINE In-App Browser';
        else if (/Telegram/i.test(ua)) app = 'Telegram In-App Browser';

        const now = new Date();
        const timeStr = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())} WIB`;

        return { ua, deviceType, os, browser, app, timeStr };
    };

    // --- 7. KIRIM FORM CONTACT LANGSUNG KE TELEGRAM (FRONTEND ONLY) ---

    const TELEGRAM_BOT_TOKEN = '7012606431:AAHfdAqqQjEFPb7Zb3jaQcenXV4E5vhM2eQ';
    const TELEGRAM_CHAT_ID   = '7662797643';

    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const name    = document.getElementById('Name').value.trim();
            const email   = document.getElementById('Email').value.trim();
            const number  = document.getElementById('Number').value.trim();
            const message = document.getElementById('Message').value.trim();

            const { ua, deviceType, os, browser, app, timeStr } = getEnvironmentInfo();

            const textLines = [
                '📩 Portofolio Contact Form',
                '====================',
                `👤 Nama: ${name || '-'}`,
                `✉️ Email: ${email || '-'}`,
                `📱 Nomor: ${number || '-'}`,
                '📝 Pesan:',
                message || '-',
                '====================',
                `⏰ Waktu: ${timeStr}`,
                `🖥 Device: ${deviceType} (${os})`,
                `🌐 Browser: ${browser}`,
                `📱 App: ${app}`,
                '🔍 User Agent:',
                ua
            ];

            const text = textLines.join('\n');

            const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage` +
                        `?chat_id=${TELEGRAM_CHAT_ID}&text=${encodeURIComponent(text)}`;

            fetch(url, { method: 'GET', mode: 'no-cors' })
                .finally(() => {
                    contactForm.reset();
                });
        });
    }

});


