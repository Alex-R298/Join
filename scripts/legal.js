/**
 * Navigation script for legal pages (privacy_policy_before.html, legal_notice_before.html)
 */

/**
 * Sets active navigation for before pages
 */
function setActiveNavigationBefore() {
    const currentPage = window.location.pathname.split("/").pop();
    const links = document.querySelectorAll(".sidebar.res a");
    
    links.forEach(link => {
        link.classList.remove("active");
        const href = link.getAttribute("href");
        
        if (href === currentPage) {
            link.classList.add("active");
        }
    });
}

/**
 * Initializes legal pages
 */
function initLegalPages() {
    setActiveNavigationBefore();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initLegalPages);