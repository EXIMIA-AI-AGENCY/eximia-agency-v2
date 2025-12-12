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

                <button class="hamburger" id="hamburger" aria-label="Toggle menu">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
        </div>
        `;

        // 2. Set Active Link
        setActiveLink();

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

        // Simple logic for active state
        if ((path === '/' || path.endsWith('index.html')) && href.includes('index.html')) {
            // Home logic (optional)
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

// 3. Event Delegation for Robust Interaction
document.addEventListener('click', function (e) {
    // Mobile Menu Toggle
    const hamburgerRef = e.target.closest('#hamburger');
    if (hamburgerRef) {
        const hamburger = document.getElementById('hamburger');
        const navLinks = document.getElementById('navLinks');

        if (hamburger && navLinks) {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
            document.body.classList.toggle('no-scroll');
            console.log("Hamburger toggled via delegation");
        }
    }

    // Close Menu on Link Click
    if (e.target.closest('.nav-links a')) {
        const hamburger = document.getElementById('hamburger');
        const navLinks = document.getElementById('navLinks');

        if (hamburger && navLinks && navLinks.classList.contains('active')) {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.classList.remove('no-scroll');
        }
    }
});

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
