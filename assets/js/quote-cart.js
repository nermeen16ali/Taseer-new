// Shows the saved quotation list in cart.html (QuoteList comes from quont.js)
(function () {
    const body = document.querySelector('[data-quote-rows]');
    if (!body) return;

    const table = body.closest('table');
    const template = document.querySelector('[data-quote-row-template]');

    function createRow(item) {
        const row = template.content.firstElementChild.cloneNode(true);
        const number = row.querySelector('[data-field="number"]');
        const input = row.querySelector('.quote-quantity');
        const button = row.querySelector('.delete-btn');

        row.dataset.quoteKey = item.key;
        row.querySelector('[data-field="name"]').textContent = item.name;
        if (item.number) number.textContent = item.number;
        else number.remove();

        // The attribute keeps the value if DataTables copies the cell on small screens
        input.setAttribute('value', item.quantity);
        input.dataset.quoteKey = item.key;
        input.setAttribute('aria-label', `كمية ${item.name}`);

        button.dataset.quoteKey = item.key;
        button.setAttribute('aria-label', `حذف ${item.name}`);
        return row;
    }

    function renderState() {
        const count = QuoteList.read().length;
        document.querySelectorAll('[data-quote-empty]').forEach(el => el.classList.toggle('d-none', count > 0));
        document.querySelectorAll('[data-quote-filled]').forEach(el => el.classList.toggle('d-none', count === 0));
        document.querySelectorAll('[data-quote-total]').forEach(el => {
            el.textContent = `${count} منتج`;
        });
    }

    function removeRow(key) {
        const row = [...body.querySelectorAll('tr')].find(tr => tr.dataset.quoteKey === key);
        if (!row) return;
        if (window.jQuery && jQuery.fn.dataTable && jQuery.fn.dataTable.isDataTable(table)) {
            jQuery(table).DataTable().row(row).remove().draw(false);
        } else {
            row.remove();
        }
    }

    // Visitors log in before submitting; signed-in clients continue directly
    if (document.body.dataset.authenticated === 'true') {
        const submit = document.querySelector('[data-quote-submit]');
        if (submit) submit.href = submit.dataset.submitUrl;
        document.querySelector('[data-guest-note]')?.remove();
    }

    body.append(...QuoteList.read().map(createRow));
    renderState();

    table.addEventListener('change', event => {
        const input = event.target.closest('.quote-quantity');
        if (!input) return;
        const quantity = Number(input.value);
        if (!QuoteList.setQuantity(input.dataset.quoteKey, quantity)) {
            // Invalid or not saved: show the stored quantity again
            const item = QuoteList.read().find(entry => entry.key === input.dataset.quoteKey);
            if (item) input.value = item.quantity;
        }
    });

    table.addEventListener('click', event => {
        const button = event.target.closest('.delete-btn');
        if (!button || !QuoteList.remove(button.dataset.quoteKey)) return;
        removeRow(button.dataset.quoteKey);
        renderState();
    });
})();
