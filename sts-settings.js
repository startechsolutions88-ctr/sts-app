

/**
 * STS Settings Library v3.2
 * Handles Dark Mode, Language Translation, Currency Formatting, Data Saver
 * Includes professional modal and toast notifications
 */

(function() {
    'use strict';

    // ========== CONFIGURATION ==========
    const CONFIG = {
        DEFAULT_LANGUAGE: 'en',
        DEFAULT_CURRENCY: 'ZMW',
        DEFAULT_DARK_MODE: false,
        DEFAULT_DATA_SAVER: false,
        CURRENCY_SYMBOLS: {
            'ZMW': 'K', 'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥', 
            'CNY': '¥', 'INR': '₹', 'RUB': '₽', 'CAD': 'C$', 'AUD': 'A$',
            'CHF': 'Fr', 'HKD': 'HK$', 'SGD': 'S$', 'NZD': 'NZ$', 'KRW': '₩',
            'ZAR': 'R', 'NGN': '₦', 'KES': 'KSh', 'GHS': '₵', 'UGX': 'USh',
            'TZS': 'TSh', 'RWF': 'FRw', 'MZN': 'MT', 'BWP': 'P', 'MWK': 'MK',
            'AOA': 'Kz', 'XOF': 'CFA', 'XAF': 'FCFA', 'MAD': 'د.م.', 'EGP': 'E£',
            'ETB': 'Br', 'ZWL': 'Z$', 'LSL': 'L', 'NAD': 'N$', 'SZL': 'E'
        },
        EXCHANGE_RATES: {
            'ZMW': 1,
            'USD': 0.05, 'EUR': 0.046, 'GBP': 0.04, 'JPY': 7.5, 'CNY': 0.36,
            'INR': 4.15, 'RUB': 4.6, 'CAD': 0.068, 'AUD': 0.075, 'CHF': 0.045,
            'HKD': 0.39, 'SGD': 0.067, 'NZD': 0.081, 'KRW': 66.5,
            'ZAR': 0.95, 'NGN': 65, 'KES': 6.8, 'GHS': 0.58, 'UGX': 190,
            'TZS': 125, 'RWF': 62, 'MZN': 3.2, 'BWP': 0.68, 'MWK': 52,
            'AOA': 42, 'XOF': 30, 'XAF': 30, 'MAD': 0.5, 'EGP': 1.55,
            'ETB': 2.8, 'ZWL': 16, 'LSL': 0.95, 'NAD': 0.95, 'SZL': 0.95
        }
    };

    // Load translations from external file
    let TRANSLATIONS = {};
    if (typeof window.STS_TRANSLATIONS !== 'undefined') {
        TRANSLATIONS = window.STS_TRANSLATIONS;
    } else {
        console.warn('STS Translations not loaded. Please include sts-translations.js before sts-settings.js');
    }

    // ========== PROFESSIONAL MODAL ==========
    // Create modal HTML if it doesn't exist
    function createModal() {
        if (document.getElementById('sts-confirm-modal')) return;

        const modalHTML = `
            <div id="sts-confirm-modal" class="sts-modal-overlay">
                <div class="sts-modal-box">
                    <div class="sts-modal-icon"><i class="fas fa-exclamation-triangle"></i></div>
                    <h3 class="sts-modal-title">Confirm Action</h3>
                    <p id="sts-modal-msg" class="sts-modal-msg">Are you sure you want to proceed?</p>
                    <div class="sts-modal-buttons">
                        <button class="sts-btn-no" id="sts-modal-cancel">CANCEL</button>
                        <button class="sts-btn-yes" id="sts-modal-confirm">PROCEED</button>
                    </div>
                </div>
            </div>
        `;

        const modalStyles = `
            <style>
                .sts-modal-overlay {
                    visibility: hidden;
                    position: fixed;
                    top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(11, 43, 79, 0.95);
                    display: flex; align-items: center; justify-content: center;
                    z-index: 3000; opacity: 0; transition: 0.3s;
                }
                .sts-modal-overlay.show { visibility: visible; opacity: 1; }

                .sts-modal-box {
                    background: #1e293b;
                    width: 85%; max-width: 320px;
                    padding: 25px; border-radius: 20px;
                    text-align: center; border: 1px solid #fbbf24;
                }
                .sts-modal-icon { font-size: 40px; color: #fbbf24; margin-bottom: 15px; }
                .sts-modal-title { color: white; margin: 0 0 10px 0; }
                .sts-modal-msg { color: #94a3b8; margin: 0 0 20px 0; line-height: 1.5; }
                .sts-modal-buttons { display: flex; gap: 10px; margin-top: 20px; }

                .sts-btn-no {
                    flex: 1; padding: 12px; border-radius: 10px;
                    border: 1px solid #94a3b8; background: transparent;
                    color: #94a3b8; font-weight: bold; cursor: pointer;
                }
                .sts-btn-yes {
                    flex: 1; padding: 12px; border-radius: 10px;
                    border: none; background: #fbbf24;
                    color: #0B2B4F; font-weight: 800; cursor: pointer;
                }
                .sts-btn-no:hover, .sts-btn-yes:hover {
                    transform: translateY(-2px);
                    transition: 0.2s;
                }
            </style>
        `;

        // Add styles if not already present
        if (!document.getElementById('sts-modal-styles')) {
            const styleTag = document.createElement('style');
            styleTag.id = 'sts-modal-styles';
            styleTag.textContent = modalStyles.split('<style>')[1].split('</style>')[0];
            document.head.appendChild(styleTag);
        }

        // Add modal HTML
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer.firstElementChild);
    }

    // Show confirm modal
    window.sts_showConfirm = function(message, onConfirm, onCancel) {
        createModal();

        const modal = document.getElementById('sts-confirm-modal');
        const msgEl = document.getElementById('sts-modal-msg');
        const cancelBtn = document.getElementById('sts-modal-cancel');
        const confirmBtn = document.getElementById('sts-modal-confirm');

        // Set message
        msgEl.textContent = message;

        // Show modal
        modal.classList.add('show');

        // Remove previous event listeners by cloning and replacing buttons
        const newCancel = cancelBtn.cloneNode(true);
        const newConfirm = confirmBtn.cloneNode(true);
        cancelBtn.parentNode.replaceChild(newCancel, cancelBtn);
        confirmBtn.parentNode.replaceChild(newConfirm, confirmBtn);

        // Add new event listeners
        newCancel.addEventListener('click', function() {
            modal.classList.remove('show');
            if (onCancel) onCancel();
        });

        newConfirm.addEventListener('click', function() {
            modal.classList.remove('show');
            if (onConfirm) onConfirm();
        });
    };

    // ========== PROFESSIONAL TOAST ==========
    window.sts_showToast = function(message, duration = 3000) {
        const oldToast = document.getElementById('sts-toast');
        if (oldToast) oldToast.remove();

        const toast = document.createElement('div');
        toast.id = 'sts-toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            background: #1e293b;
            color: white;
            padding: 12px 24px;
            border-radius: 30px;
            font-size: 14px;
            z-index: 10000;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            border: 1px solid #fbbf24;
            animation: stsFadeIn 0.3s, stsFadeOut 0.3s ${duration-300}ms;
            opacity: 0;
        `;

        // Add animation keyframes if not present
        if (!document.getElementById('sts-toast-styles')) {
            const style = document.createElement('style');
            style.id = 'sts-toast-styles';
            style.textContent = `
                @keyframes stsFadeIn {
                    from { opacity: 0; transform: translate(-50%, 20px); }
                    to { opacity: 1; transform: translate(-50%, 0); }
                }
                @keyframes stsFadeOut {
                    from { opacity: 1; transform: translate(-50%, 0); }
                    to { opacity: 0; transform: translate(-50%, 20px); }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(toast);
        
        setTimeout(() => toast.style.opacity = '1', 10);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    };

    // ========== INITIALISATION ==========
    function init() {
        if (localStorage.getItem('sts_dark_mode') === null)
            localStorage.setItem('sts_dark_mode', CONFIG.DEFAULT_DARK_MODE);
        if (localStorage.getItem('sts_language') === null)
            localStorage.setItem('sts_language', CONFIG.DEFAULT_LANGUAGE);
        if (localStorage.getItem('sts_currency') === null)
            localStorage.setItem('sts_currency', CONFIG.DEFAULT_CURRENCY);
        if (localStorage.getItem('sts_data_saver') === null)
            localStorage.setItem('sts_data_saver', CONFIG.DEFAULT_DATA_SAVER);

        applyDarkMode();
        translatePage();
        formatAllPrices();
        applyDataSaver();

        window.addEventListener('sts_settingChanged', function(e) {
            const { key, value } = e.detail;
            switch(key) {
                case 'dark_mode': applyDarkMode(); break;
                case 'language': translatePage(); break;
                case 'currency':
                    formatAllPrices();
                    if (typeof window.onCurrencyChange === 'function') window.onCurrencyChange();
                    break;
                case 'data_saver': applyDataSaver(); break;
            }
        });

        window.dispatchEvent(new CustomEvent('sts_ready'));
    }

    // ========== DARK MODE ==========
    function applyDarkMode() {
        const isDark = localStorage.getItem('sts_dark_mode') === 'true';
        document.body.classList.toggle('dark-mode', isDark);
        window.dispatchEvent(new CustomEvent('sts_darkModeChanged', { detail: { enabled: isDark } }));
    }

    window.sts_setDarkMode = function(enabled) {
        localStorage.setItem('sts_dark_mode', enabled);
        applyDarkMode();
        window.dispatchEvent(new CustomEvent('sts_settingChanged', { detail: { key: 'dark_mode', value: enabled } }));
    };

    window.sts_toggleDarkMode = function() {
        const current = localStorage.getItem('sts_dark_mode') === 'true';
        window.sts_setDarkMode(!current);
    };

    window.sts_isDarkMode = function() {
        return localStorage.getItem('sts_dark_mode') === 'true';
    };

    // ========== LANGUAGE ==========
    window.sts_getLanguage = function() {
        return localStorage.getItem('sts_language') || CONFIG.DEFAULT_LANGUAGE;
    };

    window.sts_setLanguage = function(langCode) {
        localStorage.setItem('sts_language', langCode);
        translatePage();
        window.dispatchEvent(new CustomEvent('sts_settingChanged', { detail: { key: 'language', value: langCode } }));
        window.dispatchEvent(new CustomEvent('sts_languageChanged', { detail: { language: langCode } }));
    };

    window.sts_translate = function(key, defaultValue = '') {
        const lang = window.sts_getLanguage();
        if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
            return TRANSLATIONS[lang][key];
        } else if (TRANSLATIONS.en && TRANSLATIONS.en[key]) {
            return TRANSLATIONS.en[key];
        }
        return defaultValue || key;
    };

    function translatePage() {
        const lang = window.sts_getLanguage();
        
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    if (el.type === 'button' || el.type === 'submit') {
                        el.value = TRANSLATIONS[lang][key];
                    } else {
                        el.placeholder = TRANSLATIONS[lang][key];
                    }
                } else {
                    el.textContent = TRANSLATIONS[lang][key];
                }
            } else if (TRANSLATIONS.en && TRANSLATIONS.en[key]) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    if (el.type === 'button' || el.type === 'submit') {
                        el.value = TRANSLATIONS.en[key];
                    } else {
                        el.placeholder = TRANSLATIONS.en[key];
                    }
                } else {
                    el.textContent = TRANSLATIONS.en[key];
                }
            }
        });
        
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
                el.placeholder = TRANSLATIONS[lang][key];
            } else if (TRANSLATIONS.en && TRANSLATIONS.en[key]) {
                el.placeholder = TRANSLATIONS.en[key];
            }
        });
        
        document.querySelectorAll('[data-i18n-value]').forEach(el => {
            const key = el.getAttribute('data-i18n-value');
            if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
                el.value = TRANSLATIONS[lang][key];
            } else if (TRANSLATIONS.en && TRANSLATIONS.en[key]) {
                el.value = TRANSLATIONS.en[key];
            }
        });
        
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
                el.title = TRANSLATIONS[lang][key];
            } else if (TRANSLATIONS.en && TRANSLATIONS.en[key]) {
                el.title = TRANSLATIONS.en[key];
            }
        });
        
        document.querySelectorAll('[data-i18n-alt]').forEach(el => {
            const key = el.getAttribute('data-i18n-alt');
            if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
                el.alt = TRANSLATIONS[lang][key];
            } else if (TRANSLATIONS.en && TRANSLATIONS.en[key]) {
                el.alt = TRANSLATIONS.en[key];
            }
        });
    }

    // ========== CURRENCY ==========
    window.sts_getCurrency = function() {
        return localStorage.getItem('sts_currency') || CONFIG.DEFAULT_CURRENCY;
    };

    window.sts_setCurrency = function(currCode) {
        localStorage.setItem('sts_currency', currCode);
        formatAllPrices();
        window.dispatchEvent(new CustomEvent('sts_settingChanged', { detail: { key: 'currency', value: currCode } }));
        window.dispatchEvent(new CustomEvent('sts_currencyChanged', { detail: { currency: currCode } }));
    };

    window.sts_formatPrice = function(amountInZMW, decimals = 2, currency = null) {
        const curr = currency || window.sts_getCurrency();
        const rate = CONFIG.EXCHANGE_RATES[curr] || 1;
        const symbol = CONFIG.CURRENCY_SYMBOLS[curr] || '';
        const converted = amountInZMW * rate;
        const formatted = converted.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        
        if (['USD', 'CAD', 'AUD', 'NZD', 'HKD', 'SGD'].includes(curr)) {
            return symbol + formatted;
        } else if (['EUR', 'GBP'].includes(curr)) {
            return symbol + formatted;
        } else if (['JPY', 'CNY'].includes(curr)) {
            return symbol + Math.round(converted).toLocaleString();
        } else if (curr === 'ZMW') {
            return 'K' + formatted;
        } else {
            return symbol + formatted;
        }
    };

    window.sts_convertPrice = function(amount, fromCurrency = 'ZMW', toCurrency = null) {
        const target = toCurrency || window.sts_getCurrency();
        let inZMW = amount;
        if (fromCurrency !== 'ZMW') {
            const rateToZMW = 1 / (CONFIG.EXCHANGE_RATES[fromCurrency] || 1);
            inZMW = amount * rateToZMW;
        }
        const rate = CONFIG.EXCHANGE_RATES[target] || 1;
        return inZMW * rate;
    };

    function formatAllPrices() {
        document.querySelectorAll('[data-price]').forEach(el => {
            const amount = parseFloat(el.getAttribute('data-price'));
            const decimals = parseInt(el.getAttribute('data-price-decimals') || '2');
            if (!isNaN(amount)) {
                el.textContent = window.sts_formatPrice(amount, decimals);
            }
        });
        
        document.querySelectorAll('[data-price-zmw]').forEach(el => {
            const amount = parseFloat(el.getAttribute('data-price-zmw'));
            const decimals = parseInt(el.getAttribute('data-price-decimals') || '2');
            if (!isNaN(amount)) {
                el.textContent = window.sts_formatPrice(amount, decimals);
            }
        });
    }

    // ========== DATA SAVER ==========
    function applyDataSaver() {
        const enabled = window.sts_isDataSaverEnabled();
        if (enabled) {
            document.body.setAttribute('data-saver', 'true');
        } else {
            document.body.removeAttribute('data-saver');
        }
        window.dispatchEvent(new CustomEvent('sts_dataSaverChanged', { detail: { enabled: enabled } }));
    }

    window.sts_isDataSaverEnabled = function() {
        return localStorage.getItem('sts_data_saver') === 'true';
    };

    window.sts_setDataSaver = function(enabled) {
        localStorage.setItem('sts_data_saver', enabled);
        applyDataSaver();
        window.dispatchEvent(new CustomEvent('sts_settingChanged', { detail: { key: 'data_saver', value: enabled } }));
    };

    window.sts_toggleDataSaver = function() {
        const current = window.sts_isDataSaverEnabled();
        window.sts_setDataSaver(!current);
    };

    // ========== UTILITIES ==========
    window.sts_getAllSettings = function() {
        return {
            darkMode: window.sts_isDarkMode(),
            language: window.sts_getLanguage(),
            currency: window.sts_getCurrency(),
            dataSaver: window.sts_isDataSaverEnabled()
        };
    };

    window.sts_resetToDefaults = function() {
        localStorage.setItem('sts_dark_mode', CONFIG.DEFAULT_DARK_MODE);
        localStorage.setItem('sts_language', CONFIG.DEFAULT_LANGUAGE);
        localStorage.setItem('sts_currency', CONFIG.DEFAULT_CURRENCY);
        localStorage.setItem('sts_data_saver', CONFIG.DEFAULT_DATA_SAVER);
        
        applyDarkMode();
        translatePage();
        formatAllPrices();
        applyDataSaver();
        
        window.dispatchEvent(new CustomEvent('sts_reset'));
    };

    window.sts_exportSettings = function() {
        return JSON.stringify(window.sts_getAllSettings());
    };

    window.sts_importSettings = function(jsonString) {
        try {
            const settings = JSON.parse(jsonString);
            if (settings.darkMode !== undefined) window.sts_setDarkMode(settings.darkMode);
            if (settings.language) window.sts_setLanguage(settings.language);
            if (settings.currency) window.sts_setCurrency(settings.currency);
            if (settings.dataSaver !== undefined) window.sts_setDataSaver(settings.dataSaver);
            return true;
        } catch (e) {
            console.error('Failed to import settings:', e);
            return false;
        }
    };

    // ========== AUTO-INIT ON DOM READY ==========
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();


//chat
(function() {
    alert("GitHub Script is Working!"); // This will show a popup when the app opens
    var tidioScript = document.createElement('script');
    tidioScript.src = "//code.tidio.co/eydu7mnqfvzdlxbpd7nvlvdvn6aooydi.js";
    tidioScript.async = true;
    document.head.appendChild(tidioScript);
})();
