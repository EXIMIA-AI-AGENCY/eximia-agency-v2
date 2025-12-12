// Services Accordion Functionality
document.addEventListener('DOMContentLoaded', function () {
    const serviceItems = document.querySelectorAll('.service-item');

    serviceItems.forEach(item => {
        const header = item.querySelector('.service-header');
        const toggle = item.querySelector('.service-toggle');

        const toggleService = () => {
            // Close all other items
            serviceItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });

            // Toggle current item
            item.classList.toggle('active');
        };

        header.addEventListener('click', toggleService);
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleService();
        });
    });
});
