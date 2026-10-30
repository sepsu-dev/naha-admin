// Configure NProgress immediately
if (typeof NProgress !== 'undefined') {
    NProgress.configure({ showSpinner: false });
    NProgress.start();
}

// Finish on back/forward navigation too.
$(window).on('load pageshow', () => {
    if (typeof NProgress !== 'undefined') {
        NProgress.done();
    }
});

// ECharts loads before this file on dashboard pages. Keep vendor defaults on our palette.
if (typeof echarts !== 'undefined') {
    const styles = getComputedStyle(document.documentElement);
    const token = name => styles.getPropertyValue(`--${name}`).trim();
    echarts.registerTheme('naha', {
        color: [1, 2, 3, 4, 5, 6].map(index => token(`nd-chart-${index}`)),
        textStyle: {
            color: token('nd-text'),
            fontFamily: token('nd-font-sans'),
            fontSize: 12
        },
        legend: { textStyle: { color: token('nd-text-muted') } },
        categoryAxis: {
            axisLabel: { color: token('nd-text-muted') },
            axisLine: { lineStyle: { color: token('nd-border') } }
        },
        valueAxis: {
            axisLabel: { color: token('nd-text-muted') },
            splitLine: { lineStyle: { color: token('nd-border') } }
        },
        pie: { label: { color: token('nd-text') } },
        tooltip: {
            backgroundColor: token('nd-surface'),
            borderColor: token('nd-border'),
            textStyle: { color: token('nd-text') }
        }
    });
}

$(function () {
    const $body = $('body');
    const $content = $('#layoutSidenav_content');
    const $sidebarToggle = $('#sidebarToggle');
    const desktop = window.matchMedia('(min-width: 992px)');

    if ($content.length) {
        $content.attr('tabindex', '-1');
        $('<a class="nd-skip-link" href="#layoutSidenav_content">Skip to content</a>').prependTo($body);
    }

    function updateSidebarState() {
        const toggled = $body.hasClass('nd-sidenav-toggled');
        $sidebarToggle.attr({
            'aria-controls': 'layoutSidenav_nav',
            'aria-expanded': String(desktop.matches ? !toggled : toggled)
        });
        const hidden = desktop.matches ? toggled && !$body.hasClass('nd-sidebar-mini') : !toggled;
        $('#layoutSidenav_nav').prop('inert', hidden);
    }

    // Storage may be unavailable in private or sandboxed browsing.
    try {
        const savedState = localStorage.getItem('nd|sidebar-toggle');
        if (desktop.matches && savedState !== null) {
            $body.toggleClass('nd-sidenav-toggled', savedState === 'true');
        }
    } catch {
        // Keep the layout's initial state when storage is blocked.
    }
    if (!desktop.matches) $body.removeClass('nd-sidenav-toggled');
    updateSidebarState();

    if ($sidebarToggle.length) {
        $sidebarToggle.on('click', function (event) {
            event.preventDefault();
            $body.toggleClass('nd-sidenav-toggled');
            if (desktop.matches) {
                try {
                    localStorage.setItem('nd|sidebar-toggle', $body.hasClass('nd-sidenav-toggled'));
                } catch {
                    // Sidebar still works without persistence.
                }
            }
            updateSidebarState();

            // Dispatch resize event to recalculate charts size
            window.dispatchEvent(new Event('resize'));
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 250);
        });
    }

    desktop.addEventListener('change', () => {
        $body.removeClass('nd-sidenav-toggled');
        updateSidebarState();
    });

    $(document).on('keydown', function (event) {
        if (event.key === 'Escape' && !desktop.matches && $body.hasClass('nd-sidenav-toggled')) {
            $body.removeClass('nd-sidenav-toggled');
            updateSidebarState();
            $sidebarToggle.trigger('focus');
        }
    });

    $content.on('click', function () {
        if (!desktop.matches && $body.hasClass('nd-sidenav-toggled')) {
            $body.removeClass('nd-sidenav-toggled');
            updateSidebarState();
            $sidebarToggle.trigger('focus');
        }
    });

    // ============================================================
    // Dynamic Active Sidebar Menu
    // ============================================================
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';

    // Remove any hardcoded active classes and reset collapses initially
    $('#sidenavAccordion .nav-link').removeClass('active').removeAttr('aria-current');
    $('#sidenavAccordion .collapse').removeClass('show');
    $('#sidenavAccordion [data-bs-toggle="collapse"]').addClass('collapsed').attr('aria-expanded', 'false');

    // Find all nav links and match against current page
    $('#sidenavAccordion .nav-link').each(function () {
        const $link = $(this);
        const href = $link.attr('href');
        const label = $link.find('span').first().text().trim();
        if (label) $link.attr('aria-label', label);

        if (
            !href ||
            href === '#' ||
            href.startsWith('javascript') ||
            href.includes('..') ||
            $link.attr('data-bs-toggle') === 'collapse'
        ) return;

        const linkPage = href.split('/').pop().split('?')[0].split('#')[0];

        // Match exact page or default to index if path is empty
        if (linkPage === page || (page === '' && linkPage === 'index.html')) {
            $link.addClass('active').attr('aria-current', 'page');

            // Expand all parent collapse elements
            $link.parents('.collapse').each(function () {
                const $parentCollapse = $(this);
                $parentCollapse.addClass('show');
                const collapseId = $parentCollapse.attr('id');
                const $trigger = $('[data-bs-target="#' + collapseId + '"]');
                $trigger.removeClass('collapsed').attr('aria-expanded', 'true');
            });
        }
    });

    // Keep native link behavior: modified clicks, downloads, and back/forward.

    // ============================================================
    // Password Visibility Toggle
    // ============================================================
    $(document).on('click', '.toggle-password', function () {
        const $btn = $(this);
        const $input = $btn.closest('.input-group').find('.password-toggle');
        const $icon = $btn.find('i');
        const visible = $input.attr('type') === 'password';
        $btn.attr({
            'aria-label': visible ? 'Hide password' : 'Show password',
            'aria-pressed': String(visible)
        });

        if ($input.attr('type') === 'password') {
            $input.attr('type', 'text');
            $icon.removeClass('ph-eye').addClass('ph-eye-slash');
        } else {
            $input.attr('type', 'password');
            $icon.removeClass('ph-eye-slash').addClass('ph-eye');
        }
    });
});
