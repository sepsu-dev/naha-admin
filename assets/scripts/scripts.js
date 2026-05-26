// Configure NProgress immediately
if (typeof NProgress !== 'undefined') {
    NProgress.configure({ showSpinner: false });
    NProgress.start();
}

// Initialize on page load
$(window).on('load', () => {
    if (typeof NProgress !== 'undefined') {
        setTimeout(() => {
            NProgress.done();
        }, 200);
    }
});

$(function () {
    const $body = $('body');
    const $content = $('#layoutSidenav_content');

    // ============================================================
    // Sidebar Toggle — with icon state (open/close)
    // ============================================================
    const $sidebarToggle = $('#sidebarToggle');

    function updateToggleIcon() {
        const $icon = $sidebarToggle.find('i');
        if (!$icon.length) return;

        const isMobile = window.innerWidth < 992;
        const isToggled = $body.hasClass('kd-sidenav-toggled');

        // Reset classes
        $icon.removeClass('ph-list ph-sidebar-simple ph-x');

        if (isMobile) {
            // Mobile: Toggled means SHOWN
            if (isToggled) {
                $icon.addClass('ph-x');
            } else {
                $icon.addClass('ph-list');
            }
        } else {
            // Desktop: Toggled means COLLAPSED
            if (isToggled) {
                $icon.addClass('ph-list');
            } else {
                $icon.addClass('ph-sidebar-simple');
            }
        }
    }

    // Restore sidebar state from localStorage on page load
    if (localStorage.getItem('kd|sidebar-toggle') === 'true') {
        $body.addClass('kd-sidenav-toggled');
    }
    updateToggleIcon();

    if ($sidebarToggle.length) {
        $sidebarToggle.on('click', function (event) {
            event.preventDefault();
            $body.toggleClass('kd-sidenav-toggled');
            localStorage.setItem('kd|sidebar-toggle', $body.hasClass('kd-sidenav-toggled'));
            updateToggleIcon();
        });
    }

    // Handle window resize to update toggle icon
    $(window).on('resize', updateToggleIcon);

    // ============================================================
    // Add fadeIn on load if not already there
    // ============================================================
    if ($content.length && !$content.hasClass('animate__fadeIn')) {
        $content.addClass('animate__animated animate__fadeIn');
    }

    // ============================================================
    // Dynamic Active Sidebar Menu
    // ============================================================
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';

    // Remove any hardcoded active classes initially
    $('#sidenavAccordion .nav-link').removeClass('active');

    // Find all nav links and match against current page
    $('#sidenavAccordion .nav-link').each(function () {
        const $link = $(this);
        const href = $link.attr('href');

        if (!href || href === '#' || href.startsWith('javascript') || $link.attr('data-bs-toggle') === 'collapse') return;

        const linkPage = href.split('/').pop().split('?')[0].split('#')[0];

        // Match exact page or default to index if path is empty
        if (linkPage === page || (page === '' && linkPage === 'index.html')) {
            $link.addClass('active');

            // Expand all parent collapse elements
            $link.parents('.collapse').each(function () {
                const $parentCollapse = $(this);
                $parentCollapse.addClass('show');
                const collapseId = $parentCollapse.attr('id');
                const $trigger = $('[data-bs-target="#' + collapseId + '"]');
                $trigger.removeClass('collapsed').attr('aria-expanded', 'true');

                // If the trigger has a parent collapse, we might need to show that too (handled by the parents() loop)
            });
        }
    });

    // ============================================================
    // MPA Loading Effect on link click with animate__fadeOut
    // ============================================================
    $(document).on('click', 'a', function (e) {
        const $link = $(this);
        const href = $link.attr('href');
        const target = $link.attr('target');

        // Only transition for internal links that are not toggles or anchors
        if (href &&
            href !== '#' &&
            !href.startsWith('http') &&
            !href.startsWith('javascript') &&
            !href.includes('#') &&
            !$link.attr('data-bs-toggle') &&
            !$link.attr('data-bs-dismiss') &&
            target !== '_blank') {

            e.preventDefault();

            if (typeof NProgress !== 'undefined') {
                NProgress.start();
            }

            if ($content.length) {
                // Ensure the content fade out is fast enough
                $content.css('animation-duration', '400ms');
                $content.removeClass('animate__fadeIn').addClass('animate__fadeOut');

                // Navigate after animation completes
                setTimeout(() => {
                    window.location.href = href;
                }, 350);
            } else {
                window.location.href = href;
            }
        }
    });

    // ============================================================
    // Password Visibility Toggle
    // ============================================================
    $(document).on('click', '.toggle-password', function () {
        const $btn = $(this);
        const $input = $btn.closest('.input-group').find('.password-toggle');
        const $icon = $btn.find('i');

        if ($input.attr('type') === 'password') {
            $input.attr('type', 'text');
            $icon.removeClass('ph-eye').addClass('ph-eye-slash');
        } else {
            $input.attr('type', 'password');
            $icon.removeClass('ph-eye-slash').addClass('ph-eye');
        }
    });

});
