document.addEventListener('DOMContentLoaded', () => {

    function toggleActive(selector) {
        document.querySelectorAll(selector).forEach(btn => {
            btn.addEventListener('click', function () {
                this.classList.toggle('active');
            });
        });
    }
    toggleActive('.fav-btn');

    // Product tabs: show the cards of the chosen platform
    document.querySelectorAll('[data-product-tabs]').forEach(tabs => {
        const grid = document.getElementById(tabs.dataset.productTabs);
        if (!grid) return;

        tabs.addEventListener('click', event => {
            const selected = event.target.closest('.product-tab');
            if (!selected) return;

            tabs.querySelectorAll('.product-tab').forEach(tab => {
                tab.classList.toggle('active', tab === selected);
                tab.setAttribute('aria-pressed', tab === selected);
            });
            grid.querySelectorAll('[data-platform]').forEach(item => {
                const isVisible = selected.dataset.tab === 'all' || item.dataset.platform === selected.dataset.tab;
                item.classList.toggle('d-none', !isVisible);
            });
        });
    });
});
