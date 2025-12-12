// EXIMIA - Centralized Chat Widget
// Injects the LeadConnector chat widget into any page where this script is included.
(function () {
    // Check if widget is already loaded to avoid duplicates
    if (document.querySelector('script[data-widget-id="69028b7e66091b91d9592a2c"]')) {
        return;
    }

    var script = document.createElement('script');
    script.src = "https://widgets.leadconnectorhq.com/loader.js";
    script.setAttribute('data-resources-url', "https://widgets.leadconnectorhq.com/chat-widget/loader.js");
    script.setAttribute('data-widget-id', "69028b7e66091b91d9592a2c");
    document.body.appendChild(script);

    console.log('EXIMIA Chat Widget Loaded');
})();
