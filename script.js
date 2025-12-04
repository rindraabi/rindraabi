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

    // --- 4. Active Link Highlighter on Scroll ---
    const sections = document.querySelectorAll('section');
    
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - sectionHeight / 3)) {
                current = section.getAttribute('id');
            }
        });

        links.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
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
    
    // The images you requested
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
            
            // Randomly pick an image
            const randomImg = bgImages[Math.floor(Math.random() * bgImages.length)];
            img.src = randomImg;
            img.alt = "Floating Icon";
            img.classList.add('bg-icon');
            
            // Random Start Position (Left: 0% to 95%)
            const randomLeft = Math.floor(Math.random() * 95);
            img.style.left = `${randomLeft}%`;
            
            // Random Size (60px to 100px)
            const randomSize = Math.floor(Math.random() * 40) + 60;
            img.style.width = `${randomSize}px`;

            // Random Animation Duration (10s to 25s) - Varying speeds
            const randomDuration = Math.floor(Math.random() * 15) + 10;
            img.style.animation = `floatUp ${randomDuration}s linear infinite`;
            
            // Random Delay so they don't all start at once
            const randomDelay = Math.floor(Math.random() * 20);
            img.style.animationDelay = `-${randomDelay}s`; 

            bgContainer.appendChild(img);
        }
    };

    if(bgContainer) {
        createFloatingImages();
    }
});