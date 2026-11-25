let currentButton = null;

const QUOTE_LIST_LINK = '<a href="cart.html">عرض قائمة التسعير</a>';

// Quotation list kept in this browser until a backend stores it
const QuoteList = (function () {
    const STORAGE_KEY = 'taseerQuoteList';

    function read() {
        try {
            const list = JSON.parse(localStorage.getItem(STORAGE_KEY));
            return Array.isArray(list) ? list.filter(item => item && item.key && item.name && item.quantity > 0) : [];
        } catch (error) {
            return [];
        }
    }

    // Returns true only when the list was really stored
    function write(list) {
        try {
            const value = JSON.stringify(list);
            localStorage.setItem(STORAGE_KEY, value);
            if (localStorage.getItem(STORAGE_KEY) !== value) return false;
        } catch (error) {
            return false;
        }
        renderCount();
        return true;
    }

    function clean(element) {
        return element ? element.textContent.replace(/\s+/g, ' ').trim() : '';
    }

    // data-product-id wins when the backend provides it
    function readProduct(card) {
        if (!card) return null;
        const name = clean(card.querySelector('h3, h5'));
        const number = clean(card.querySelector('.upload-text .title-color'));
        const key = card.dataset.productId || number || name;
        return name && key ? { key, name, number } : null;
    }

    function add(items) {
        if (!items.length || items.some(item => !item.product)) return false;
        const list = read();
        items.forEach(({ product, quantity }) => {
            const existing = list.find(item => item.key === product.key);
            if (existing) existing.quantity += quantity;
            else list.push({ ...product, quantity });
        });
        return write(list);
    }

    function setQuantity(key, quantity) {
        const list = read();
        const item = list.find(entry => entry.key === key);
        if (!item || !Number.isInteger(quantity) || quantity < 1) return false;
        item.quantity = quantity;
        return write(list);
    }

    function remove(key) {
        return write(read().filter(item => item.key !== key));
    }

    function renderCount() {
        const count = read().length;
        document.querySelectorAll('[data-quote-count]').forEach(badge => {
            badge.textContent = count;
            badge.classList.toggle('d-none', count === 0);
            badge.closest('a')?.setAttribute('aria-label', count ? `قائمة التسعير، عدد المنتجات ${count}` : 'قائمة التسعير');
        });
    }

    renderCount();
    // Keep the badge right after using the back button or another tab
    window.addEventListener('pageshow', renderCount);
    window.addEventListener('storage', renderCount);

    return { read, add, setQuantity, remove, readProduct };
})();

function showQuoteError() {
    Swal.fire({
        title: 'تعذر حفظ المنتج في قائمة التسعير، حاول مرة أخرى',
        icon: 'error',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 5000,
    });
}

const pricingModalEl = document.getElementById('pricingModal');
const confirmPricingBtn = document.getElementById('confirmPricingBtn');

// Track which button opened the modal
pricingModalEl?.addEventListener('show.bs.modal', function (event) {
    currentButton = event.relatedTarget;
});

// Handle the confirm button click
confirmPricingBtn?.addEventListener('click', function () {
    const quantity = Number(document.getElementById('quantityInput').value);

    // Validate quantity
    if (!Number.isInteger(quantity) || quantity < 1) {
        Swal.fire({
            title: 'الرجاء إدخال كمية صحيحة',
            icon: 'error',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: false,
            iconColor: 'error',
            background: '#ffffff'
        });
        return;
    }


    // Close the modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('pricingModal'));
    modal.hide();

    // Save before reporting success
    const card = currentButton?.closest('.product-card');
    if (!QuoteList.add([{ product: QuoteList.readProduct(card), quantity }])) {
        showQuoteError();
        return;
    }

    // Change button text
    if (currentButton) {
        currentButton.innerHTML = `تمت الاضافة
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"
                        fill="none">
                        <path
                            d="M8.58984 0C10.4153 -1.13241e-05 11.8493 -0.000118482 12.9688 0.150391C14.1159 0.304632 15.0261 0.62762 15.7412 1.34277C16.4564 2.05793 16.7794 2.96804 16.9336 4.11523C17.0841 5.23471 17.084 6.66865 17.084 8.49414V8.58984C17.084 10.4153 17.0841 11.8493 16.9336 12.9688C16.7794 14.1159 16.4564 15.0261 15.7412 15.7412C15.0261 16.4564 14.1159 16.7794 12.9688 16.9336C11.8493 17.0841 10.4153 17.084 8.58984 17.084H8.49414C6.66865 17.084 5.23471 17.0841 4.11523 16.9336C2.96804 16.7794 2.05793 16.4564 1.34277 15.7412C0.62762 15.0261 0.304632 14.1159 0.150391 12.9688C-0.000118482 11.8493 -1.13241e-05 10.4153 0 8.58984V8.49414C-1.13241e-05 6.66865 -0.000118444 5.23471 0.150391 4.11523C0.304632 2.96804 0.627619 2.05793 1.34277 1.34277C2.05793 0.627619 2.96804 0.304632 4.11523 0.150391C5.23471 -0.000118444 6.66865 -1.13241e-05 8.49414 0H8.58984ZM8.54199 1.25C6.65854 1.25 5.30877 1.25167 4.28223 1.38965C3.27362 1.52525 2.67077 1.78236 2.22656 2.22656C1.78236 2.67077 1.52525 3.27362 1.38965 4.28223C1.25167 5.30877 1.25 6.65854 1.25 8.54199C1.25 10.4254 1.25167 11.7752 1.38965 12.8018C1.52525 13.8104 1.78236 14.4132 2.22656 14.8574C2.67077 15.3016 3.27362 15.5587 4.28223 15.6943C5.30877 15.8323 6.65854 15.834 8.54199 15.834C10.4254 15.834 11.7752 15.8323 12.8018 15.6943C13.8104 15.5587 14.4132 15.3016 14.8574 14.8574C15.3016 14.4132 15.5587 13.8104 15.6943 12.8018C15.8323 11.7752 15.834 10.4254 15.834 8.54199C15.834 6.65854 15.8323 5.30877 15.6943 4.28223C15.5587 3.27362 15.3016 2.67077 14.8574 2.22656C14.4132 1.78236 13.8104 1.52525 12.8018 1.38965C11.7752 1.25167 10.4254 1.25 8.54199 1.25ZM6.45898 9.58398C6.80401 9.58416 7.08398 9.86391 7.08398 10.209V11.875C7.08398 12.2201 6.80401 12.4998 6.45898 12.5C6.11381 12.5 5.83398 12.2202 5.83398 11.875V10.209C5.83398 9.86381 6.11381 9.58398 6.45898 9.58398ZM4.375 10.417C4.72018 10.417 5 10.6968 5 11.042C5 11.3872 4.72018 11.667 4.375 11.667H3.54199C3.19681 11.667 2.91699 11.3872 2.91699 11.042C2.91699 10.6968 3.19681 10.417 3.54199 10.417H4.375ZM13.542 10.417C13.8872 10.417 14.167 10.6968 14.167 11.042C14.167 11.3872 13.8872 11.667 13.542 11.667H8.54199C8.19681 11.667 7.91699 11.3872 7.91699 11.042C7.91699 10.6968 8.19681 10.417 8.54199 10.417H13.542ZM8.54199 4.58398C8.88717 4.58398 9.16699 4.86381 9.16699 5.20898V6.875C9.16699 7.22018 8.88717 7.5 8.54199 7.5C8.19681 7.5 7.91699 7.22018 7.91699 6.875V5.20898C7.91699 4.86381 8.19681 4.58398 8.54199 4.58398ZM10.625 4.58398C10.9702 4.58398 11.25 4.86381 11.25 5.20898V6.875C11.25 7.22018 10.9702 7.5 10.625 7.5C10.28 7.49982 10 7.22007 10 6.875V5.20898C10 4.86391 10.28 4.58416 10.625 4.58398ZM6.45898 5.41699C6.80401 5.41717 7.08398 5.69692 7.08398 6.04199C7.08398 6.38706 6.80401 6.66682 6.45898 6.66699H3.54199C3.19681 6.66699 2.91699 6.38717 2.91699 6.04199C2.91699 5.69681 3.19681 5.41699 3.54199 5.41699H6.45898ZM13.542 5.41699C13.8872 5.41699 14.167 5.69681 14.167 6.04199C14.167 6.38717 13.8872 6.66699 13.542 6.66699H12.709C12.3638 6.66699 12.084 6.38717 12.084 6.04199C12.084 5.69681 12.3638 5.41699 12.709 5.41699H13.542Z"
                            fill="white"></path>
                    </svg>`;
        currentButton.classList.remove('btn-custom-dark');
        currentButton.classList.add('btn-custom-light');
        currentButton.disabled = true;
    }

    // Show SweetAlert (modern toast)
    Swal.fire({
        title: 'تمت الإضافة بنجاح',
        footer: QUOTE_LIST_LINK,
        icon: 'success',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: false,
    });


    // Reset quantity input
    document.getElementById('quantityInput').value = '1';
});

const selectAllBtn = document.querySelector('.select-all');

selectAllBtn?.addEventListener('click', function () {
    const checkedBoxes = document.querySelectorAll('.card-check:checked');

    // ❌ أقل من منتجين
    if (checkedBoxes.length < 2) {
        Swal.fire({
            toast: true,
            position: 'top',
            icon: 'warning',
            title: ' من فضلك اختر منتجين على الأقل',
            showConfirmButton: false,
            timer: 3000,
            customClass: {
                popup: 'swal-top-center'
            }
        });
        return;
    }

    // Save before reporting success
    const items = [...checkedBoxes]
        .filter(cb => !cb.disabled)
        .map(cb => ({ product: QuoteList.readProduct(cb.closest('.product-card')), quantity: 1 }));

    if (!QuoteList.add(items)) {
        showQuoteError();
        return;
    }

    // ✅ التعامل مع كل card مختارة
    checkedBoxes.forEach(cb => {
        const card = cb.closest('.product-card');
        const pricingBtn = card.querySelector('.pricing-request .main-btn');

        // تغيير زر "طلب تسعير"
        pricingBtn.innerHTML = `
            تمت الإضافة
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
                viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17L4 12"
                    stroke="white" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;

        pricingBtn.classList.remove('btn-custom-dark');
        pricingBtn.classList.add('btn-custom-light');
        pricingBtn.disabled = true;
        pricingBtn.removeAttribute('data-bs-toggle');
        pricingBtn.removeAttribute('data-bs-target');

        // تعطيل checkbox
        cb.disabled = true;
    });

    // 🎉 SweetAlert نجاح
    Swal.fire({
        toast: true,
        position: 'top',
        icon: 'success',
        title: 'تمت إضافة المنتجات إلى السلة بنجاح',
        footer: QUOTE_LIST_LINK,
        showConfirmButton: false,
        timer: 5000,
        customClass: {
            popup: 'swal-top-center'
        }
    });
});


