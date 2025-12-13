document.addEventListener("DOMContentLoaded", function () {
    const navbarContainer = document.getElementById("navbar");

    if (navbarContainer) {
        // Inject Navbar HTML with checkbox hack for iOS compatibility
        navbarContainer.innerHTML = `
        <input type="checkbox" id="menu-toggle" class="menu-toggle-checkbox">
        <div class="container">
            <div class="nav-content">
                <div class="logo">
                     <a href="index.html"><img src="logo.png" alt="EXIMIA"></a>
                </div>

                <ul class="nav-links" id="navLinks">
                    <li><a href="index.html" data-page="home">Inicio</a></li>
                    <li><a href="index.html#planes" data-page="planes">Planes</a></li>
                    <li><a href="crm.html" data-page="crm">CRM</a></li>
                    <li><a href="marketing.html" data-page="marketing">Marketing</a></li>
                    <li><a href="dev.html" data-page="dev">Dev</a></li>
                    <li><a href="voice-demo.html" data-page="demo">AI Demo</a></li>
                    <li><a href="contacto.html" data-page="contact">Contáctanos</a></li>
                </ul>

                <div class="nav-cta">
                    <a href="https://crm.eximia.agency/" class="btn btn-primary">Sign In</a>
                </div>

                <label for="menu-toggle" class="hamburger" aria-label="Toggle menu">
                    <span></span>
                    <span></span>
                    <span></span>
                </label>
            </div>
        </div>
        `;

        // Set Active Link
        setActiveLink();

        // Close menu when clicking on nav links
        const navLinksItems = document.querySelectorAll('.nav-links a');
        const menuToggle = document.getElementById('menu-toggle');

        navLinksItems.forEach(link => {
            link.addEventListener('click', function () {
                if (menuToggle) menuToggle.checked = false;
            });
        });

        // Navbar initialized
    }
});

// Helper: Set Active Link
function setActiveLink() {
    const path = window.location.pathname;
    const page = path.split("/").pop();
    const links = document.querySelectorAll('.nav-links a');

    links.forEach(link => {
        link.classList.remove('active');
    });

    if (page.includes("marketing")) document.querySelector('a[data-page="marketing"]')?.classList.add("active");
    if (page.includes("dev")) document.querySelector('a[data-page="dev"]')?.classList.add("active");
    if (page.includes("voice-demo")) document.querySelector('a[data-page="demo"]')?.classList.add("active");
    if (page.includes("contacto")) document.querySelector('a[data-page="contact"]')?.classList.add("active");
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
