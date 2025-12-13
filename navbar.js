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
                    <li class="nav-dropdown">
                        <a href="#" class="dropdown-toggle" data-page="productos">
                            Productos
                            <svg class="dropdown-arrow" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M6 9l6 6 6-6"/>
                            </svg>
                        </a>
                        <ul class="dropdown-menu">
                            <li><a href="voice-demo.html" data-page="ai">🤖 AI Demo</a></li>
                            <li><a href="crm.html" data-page="crm">📊 CRM + AI</a></li>
                            <li><a href="marketing.html" data-page="marketing">📈 Marketing</a></li>
                            <li><a href="dev.html" data-page="dev">💻 Dev</a></li>
                        </ul>
                    </li>
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

        // Dropdown toggle for mobile - more robust implementation
        const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
        dropdownToggles.forEach(toggle => {
            // Handle both click and touch events
            toggle.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                const parent = this.closest('.nav-dropdown');

                // Close other dropdowns first
                document.querySelectorAll('.nav-dropdown.active').forEach(dropdown => {
                    if (dropdown !== parent) {
                        dropdown.classList.remove('active');
                    }
                });

                // Toggle current dropdown
                parent.classList.toggle('active');
            });
        });

        // Close dropdown when clicking on dropdown links (for mobile)
        const dropdownLinks = document.querySelectorAll('.dropdown-menu a');
        dropdownLinks.forEach(link => {
            link.addEventListener('click', function () {
                // Close the menu
                if (menuToggle) menuToggle.checked = false;
                // Close dropdown
                const dropdown = this.closest('.nav-dropdown');
                if (dropdown) dropdown.classList.remove('active');
            });
        });

        // Close dropdown when clicking outside (for desktop)
        document.addEventListener('click', function (e) {
            if (!e.target.closest('.nav-dropdown')) {
                document.querySelectorAll('.nav-dropdown.active').forEach(dropdown => {
                    dropdown.classList.remove('active');
                });
            }
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
