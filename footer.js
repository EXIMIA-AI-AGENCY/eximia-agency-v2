/**
 * footer.js - Centralized footer injection for all pages
 * Ensures consistent footer with social icons across the entire site
 */

document.addEventListener("DOMContentLoaded", function () {
    const footerContainer = document.getElementById("site-footer");

    if (footerContainer) {
        footerContainer.innerHTML = `
        <div class="container">
            <div class="footer-grid">
                <!-- Brand Column -->
                <div class="footer-column brand-col">
                    <img src="logo.png" alt="EXIMIA" class="footer-logo">
                    <p class="footer-tagline">El sistema operativo para el crecimiento empresarial moderno.</p>
                    <div class="footer-social">
                        <a href="https://www.facebook.com/eximia.agency" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                        </a>
                        <a href="https://x.com/eximia_ai" target="_blank" rel="noopener noreferrer" aria-label="Twitter/X">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                            </svg>
                        </a>
                        <a href="https://www.instagram.com/eximia.ai/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                            </svg>
                        </a>
                    </div>
                </div>

                <!-- Product Column -->
                <div class="footer-column">
                    <h4>Producto</h4>
                    <ul>
                        <li><a href="index.html#solucion">Solución</a></li>
                        <li><a href="index.html#planes">Planes</a></li>
                        <li><a href="index.html#costos">Costos</a></li>
                        <li><a href="marketing.html">Marketing</a></li>
                    </ul>
                </div>

                <!-- Resources Column -->
                <div class="footer-column">
                    <h4>Recursos</h4>
                    <ul>
                        <li><a href="index.html#casos">Casos de uso</a></li>
                        <li><a href="index.html#faq">FAQ</a></li>
                        <li><a href="contacto.html">Contacto</a></li>
                        <li><a href="agendar.html">Agendar Demo</a></li>
                    </ul>
                </div>

                <!-- Legal Column -->
                <div class="footer-column">
                    <h4>Legal</h4>
                    <ul>
                        <li><a href="privacy-policy.html">Privacidad</a></li>
                        <li><a href="#">Términos</a></li>
                        <li><a href="#">Cookies</a></li>
                    </ul>
                </div>
            </div>

            <div class="footer-payment">
                <p class="payment-label">Métodos de pago aceptados</p>
                <div class="payment-icons">
                    <img src="https://img.shields.io/badge/Visa-1A1F71?style=for-the-badge&logo=visa&logoColor=white" alt="Visa" class="payment-badge">
                    <img src="https://img.shields.io/badge/Mastercard-EB001B?style=for-the-badge&logo=mastercard&logoColor=white" alt="Mastercard" class="payment-badge">
                    <img src="https://img.shields.io/badge/American_Express-006FCF?style=for-the-badge&logo=american-express&logoColor=white" alt="American Express" class="payment-badge">
                    <img src="https://img.shields.io/badge/Discover-FF6000?style=for-the-badge&logo=discover&logoColor=white" alt="Discover" class="payment-badge">
                    <img src="https://img.shields.io/badge/PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white" alt="PayPal" class="payment-badge">
                </div>
            </div>

            <div class="footer-bottom">
                <p>© 2025 EXIMIA LLC. Todos los derechos reservados.</p>
                <p class="footer-note">Hecho Por EXIMIA en Puerto Rico 🇵🇷</p>
            </div>
        </div>
        `;
    }
});
