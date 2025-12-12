document.addEventListener("DOMContentLoaded", function () {
    const navbarContainer = document.getElementById("navbar");

    if (navbarContainer) {
        // 1. Inyectar el HTML del menú maestro
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

        // 2. Marcar la opción activa basada en la URL actual
        setActiveLink();

        // 3. Inicializar la lógica del menú (móvil, scroll, etc.)
        initDynamicNavigation();
    }
});

function setActiveLink() {
    const path = window.location.pathname;
    const page = path.split("/").pop(); // Obtiene el nombre del archivo (ej. marketing.html)

    const links = document.querySelectorAll('.nav-links a');

    links.forEach(link => {
        // Eliminar active de todos primero
        link.classList.remove('active');

        // Lógica simple de coincidencia
        const href = link.getAttribute('href');

        // Caso especial para home/root
        if ((path === '/' || path.endsWith('index.html')) && href.includes('index.html')) {
            // No marcamos 'Planes' como activo globalmente a menos que estemos en la sección, 
            // pero por defecto en home no marcamos nada o marcamos el primero.
            // Dejaremos esto simple por ahora.
        }
        else if (page === href) {
            link.classList.add('active');
        }
    });

    // Manejo específico para highlight visual si se desea
    if (page.includes("marketing")) document.querySelector('a[data-page="marketing"]')?.classList.add("active");
    if (page.includes("dev")) document.querySelector('a[data-page="dev"]')?.classList.add("active");
    if (page.includes("voice-demo")) document.querySelector('a[data-page="demo"]')?.classList.add("active");
    if (page.includes("contacto")) document.querySelector('a[data-page="contact"]')?.classList.add("active");
}

function initDynamicNavigation() {
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    // Sticky navbar with blur on scroll
    window.addEventListener('scroll', function () {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function () {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
            document.body.classList.toggle('no-scroll');
        });

        // Close menu when clicking on a link
        const navLinksItems = navLinks.querySelectorAll('a');
        navLinksItems.forEach(link => {
            link.addEventListener('click', function () {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.classList.remove('no-scroll');
            });
        });
    }
}
