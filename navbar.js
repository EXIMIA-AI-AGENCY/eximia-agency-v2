document.addEventListener("DOMContentLoaded", function () {
    const navbarContainer = document.getElementById("navbar");

    if (navbarContainer) {
        // 1. Inject Navbar HTML
        navbarContainer.innerHTML = `
        <div class="container">
            <div class="nav-content">
                <div class="logo">
                     <a href="index.html"><img src="logo.png" alt="EXIMIA"></a>
                </div>

                <ul class="nav-links" id="navLinks">
                    <li><a href="index.html#planes" data-page="home">Planes</a></li>
                    <li><a href="marketing.html" data-page="marketing">Marketing</a></li>
                    <li><a href="dev.html" data-page="dev">Dev</a></li>
                    <li><a href="voice-demo.html" data-page="demo">Demo</a></li>
                    <li><a href="contacto.html" data-page="contact">Contáctanos</a></li>
                </ul>

                <div class="nav-cta">
                    <a href="https://crm.eximia.agency/" class="btn btn-primary">Sign In</a>
                </div>

                <button class="hamburger" id="hamburger" aria-label="Toggle menu" type="button">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
        </div>
        `;

        // 2. Set Active Link
        setActiveLink();

        // 3. Setup mobile menu with TOUCH support for iOS
        setupMobileMenu();

        console.log("Navbar injected successfully");
    }
});

// Helper: Set Active Link
function setActiveLink() {
    const path = window.location.pathname;
    const page = path.split("/").pop();
    const links = document.querySelectorAll('.nav-links a');

    links.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');

        if ((path === '/' || path.endsWith('index.html')) && href.includes('index.html')) {
            // Home logic
        }
        else if (page === href) {
            link.classList.add('active');
        }
    });

    // Explicit highlights
    if (page.includes("marketing")) document.querySelector('a[data-page="marketing"]')?.classList.add("active");
    if (page.includes("dev")) document.querySelector('a[data-page="dev"]')?.classList.add("active");
    if (page.includes("voice-demo")) document.querySelector('a[data-page="demo"]')?.classList.add("active");
    if (page.includes("contacto")) document.querySelector('a[data-page="contact"]')?.classList.add("active");
}

// Setup mobile menu with proper touch support
function setupMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    if (!hamburger || !navLinks) {
        console.error("Hamburger or navLinks not found");
        return;
    }

    // Toggle function
    function toggleMenu(e) {
        e.preventDefault();
        e.stopPropagation();

        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
        document.body.classList.toggle('no-scroll');

        console.log("Menu toggled - active:", navLinks.classList.contains('active'));
    }

    // Close menu function
    function closeMenu() {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.classList.remove('no-scroll');
    }

    // Add both click AND touch events for iOS compatibility
    hamburger.addEventListener('click', toggleMenu);
    hamburger.addEventListener('touchend', function (e) {
        e.preventDefault(); // Prevent ghost click
        toggleMenu(e);
    });

    // Close menu when clicking on nav links
    const navLinksItems = navLinks.querySelectorAll('a');
    navLinksItems.forEach(link => {
        link.addEventListener('click', closeMenu);
        link.addEventListener('touchend', closeMenu);
    });
}

// Sticky Navbar Logic
window.addEventListener('scroll', function () {
    const navbar = document.getElementById('navbar');
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
});
