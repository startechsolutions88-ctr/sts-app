/**
 * STS Settings Library v3.0
 * Handles Dark Mode, Language Translation, Currency Formatting, and Data Saver
 * Include in all pages: <script src="sts-settings.js"></script>
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
            // Major currencies
            'ZMW': 'K', 'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥', 
            'CNY': '¥', 'INR': '₹', 'RUB': '₽', 'CAD': 'C$', 'AUD': 'A$',
            'CHF': 'Fr', 'HKD': 'HK$', 'SGD': 'S$', 'NZD': 'NZ$', 'KRW': '₩',
            
            // African currencies
            'ZAR': 'R', 'NGN': '₦', 'KES': 'KSh', 'GHS': '₵', 'UGX': 'USh',
            'TZS': 'TSh', 'RWF': 'FRw', 'MZN': 'MT', 'BWP': 'P', 'MWK': 'MK',
            'AOA': 'Kz', 'XOF': 'CFA', 'XAF': 'FCFA', 'MAD': 'د.م.', 'EGP': 'E£',
            'ETB': 'Br', 'ZWL': 'Z$', 'LSL': 'L', 'NAD': 'N$', 'SZL': 'E',
            'SCR': 'SR', 'MUR': '₨', 'CVE': '$', 'GNF': 'FG', 'SRD': '$',
            'GYD': '$', 'HTG': 'G', 'HNL': 'L', 'HUF': 'Ft', 'ISK': 'kr',
            'IDR': 'Rp', 'IRR': '﷼', 'IQD': 'ع.د', 'JMD': 'J$', 'JOD': 'د.ا',
            'KZT': '₸', 'KWD': 'د.ك', 'KGS': 'сом', 'LAK': '₭', 'LBP': 'ل.ل',
            'LRD': 'L$', 'LYD': 'ل.د', 'MOP': 'MOP$', 'MKD': 'ден', 'MGA': 'Ar',
            'MYR': 'RM', 'MVR': 'ރ.', 'MRU': 'UM', 'MXN': '$', 'MDL': 'L',
            'MNT': '₮', 'MMK': 'Ks', 'NPR': '₨', 'NIO': 'C$', 'KPW': '₩',
            'OMR': '﷼', 'PKR': '₨', 'PAB': 'B/.', 'PGK': 'K', 'PYG': '₲',
            'PEN': 'S/', 'PHP': '₱', 'PLN': 'zł', 'QAR': 'ر.ق', 'RSD': 'дин.',
            'SAR': 'ر.س', 'SBD': '$', 'WST': 'T', 'STN': 'Db', 'RSD': 'дин.'
        },
        EXCHANGE_RATES: {
            // Base: ZMW = 1
            'ZMW': 1,
            'USD': 0.05, 'EUR': 0.046, 'GBP': 0.04, 'JPY': 7.5, 'CNY': 0.36,
            'INR': 4.15, 'RUB': 4.6, 'CAD': 0.068, 'AUD': 0.075, 'CHF': 0.045,
            'HKD': 0.39, 'SGD': 0.067, 'NZD': 0.081, 'KRW': 66.5,
            
            // African currencies (approximate rates)
            'ZAR': 0.95, 'NGN': 65, 'KES': 6.8, 'GHS': 0.58, 'UGX': 190,
            'TZS': 125, 'RWF': 62, 'MZN': 3.2, 'BWP': 0.68, 'MWK': 52,
            'AOA': 42, 'XOF': 30, 'XAF': 30, 'MAD': 0.5, 'EGP': 1.55,
            'ETB': 2.8, 'ZWL': 16, 'LSL': 0.95, 'NAD': 0.95, 'SZL': 0.95
        }
    };

    // Load translations from external file if available
    let TRANSLATIONS = {};

    // Try to load translations from sts-translations.js
    if (typeof window.STS_TRANSLATIONS !== 'undefined') {
        TRANSLATIONS = window.STS_TRANSLATIONS;
    } else {
        console.warn('STS Translations not loaded. Please include sts-translations.js');
    }

    // ========== INITIALISATION ==========
    function init() {
        // Set defaults if not present
        if (localStorage.getItem('sts_dark_mode') === null)
            localStorage.setItem('sts_dark_mode', CONFIG.DEFAULT_DARK_MODE);
        if (localStorage.getItem('sts_language') === null)
            localStorage.setItem('sts_language', CONFIG.DEFAULT_LANGUAGE);
        if (localStorage.getItem('sts_currency') === null)
            localStorage.setItem('sts_currency', CONFIG.DEFAULT_CURRENCY);
        if (localStorage.getItem('sts_data_saver') === null)
            localStorage.setItem('sts_data_saver', CONFIG.DEFAULT_DATA_SAVER);

        // Apply dark mode
        applyDarkMode();

        // Translate page
        translatePage();

        // Format prices
        formatAllPrices();

        // Apply data saver settings
        applyDataSaver();

        // Listen for settings changes (from any page)
        window.addEventListener('sts_settingChanged', function(e) {
            const { key, value } = e.detail;
            switch(key) {
                case 'dark_mode':
                    applyDarkMode();
                    break;
                case 'language':
                    translatePage();
                    break;
                case 'currency':
                    formatAllPrices();
                    if (typeof window.onCurrencyChange === 'function') window.onCurrencyChange();
                    break;
                case 'data_saver':
                    applyDataSaver();
                    break;
            }
        });

        // Notify that library is ready
        window.dispatchEvent(new CustomEvent('sts_ready'));
    }

    // ========== DARK MODE ==========
    function applyDarkMode() {
        const isDark = localStorage.getItem('sts_dark_mode') === 'true';
        document.body.classList.toggle('dark-mode', isDark);
        
        // Dispatch event for any custom dark mode handlers
        window.dispatchEvent(new CustomEvent('sts_darkModeChanged', { 
            detail: { enabled: isDark } 
        }));
    }

    window.sts_setDarkMode = function(enabled) {
        localStorage.setItem('sts_dark_mode', enabled);
        applyDarkMode();
        window.dispatchEvent(new CustomEvent('sts_settingChanged', { 
            detail: { key: 'dark_mode', value: enabled } 
        }));
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
        window.dispatchEvent(new CustomEvent('sts_settingChanged', { 
            detail: { key: 'language', value: langCode } 
        }));
        
        // Dispatch language-specific event
        window.dispatchEvent(new CustomEvent('sts_languageChanged', { 
            detail: { language: langCode } 
        }));
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
        
        // Translate text content
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
        
        // Translate placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
                el.placeholder = TRANSLATIONS[lang][key];
            } else if (TRANSLATIONS.en && TRANSLATIONS.en[key]) {
                el.placeholder = TRANSLATIONS.en[key];
            }
        });
        
        // Translate input values (for submit buttons etc.)
        document.querySelectorAll('[data-i18n-value]').forEach(el => {
            const key = el.getAttribute('data-i18n-value');
            if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
                el.value = TRANSLATIONS[lang][key];
            } else if (TRANSLATIONS.en && TRANSLATIONS.en[key]) {
                el.value = TRANSLATIONS.en[key];
            }
        });
        
        // Translate title attributes
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
                el.title = TRANSLATIONS[lang][key];
            } else if (TRANSLATIONS.en && TRANSLATIONS.en[key]) {
                el.title = TRANSLATIONS.en[key];
            }
        });
        
        // Translate alt attributes on images
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
        window.dispatchEvent(new CustomEvent('sts_settingChanged', { 
            detail: { key: 'currency', value: currCode } 
        }));
        
        // Dispatch currency-specific event
        window.dispatchEvent(new CustomEvent('sts_currencyChanged', { 
            detail: { currency: currCode } 
        }));
    };

    window.sts_formatPrice = function(amountInZMW, decimals = 2, currency = null) {
        const curr = currency || window.sts_getCurrency();
        const rate = CONFIG.EXCHANGE_RATES[curr] || 1;
        const symbol = CONFIG.CURRENCY_SYMBOLS[curr] || '';
        const converted = amountInZMW * rate;
        
        // Format with thousand separators
        const formatted = converted.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        
        // Handle different currency symbol positions
        if (['USD', 'CAD', 'AUD', 'NZD', 'HKD', 'SGD'].includes(curr)) {
            return symbol + formatted; // $1,234.56
        } else if (['EUR', 'GBP'].includes(curr)) {
            return symbol + formatted; // €1,234.56 or £1,234.56
        } else if (['JPY', 'CNY'].includes(curr)) {
            return symbol + Math.round(converted).toLocaleString(); // ¥1,235
        } else if (curr === 'ZMW') {
            return 'K' + formatted; // K1,234.56
        } else {
            return symbol + formatted;
        }
    };

    window.sts_convertPrice = function(amount, fromCurrency = 'ZMW', toCurrency = null) {
        const target = toCurrency || window.sts_getCurrency();
        
        // Convert to ZMW first if needed
        let inZMW = amount;
        if (fromCurrency !== 'ZMW') {
            const rateToZMW = 1 / (CONFIG.EXCHANGE_RATES[fromCurrency] || 1);
            inZMW = amount * rateToZMW;
        }
        
        // Now convert to target currency
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
        
        // Format elements with data-price-zmw (for backward compatibility)
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
        
        // Add data-saver attribute to body for CSS targeting
        if (enabled) {
            document.body.setAttribute('data-saver', 'true');
        } else {
            document.body.removeAttribute('data-saver');
        }
        
        // Dispatch event
        window.dispatchEvent(new CustomEvent('sts_dataSaverChanged', { 
            detail: { enabled: enabled } 
        }));
    }

    window.sts_isDataSaverEnabled = function() {
        return localStorage.getItem('sts_data_saver') === 'true';
    };

    window.sts_setDataSaver = function(enabled) {
        localStorage.setItem('sts_data_saver', enabled);
        applyDataSaver();
        window.dispatchEvent(new CustomEvent('sts_settingChanged', { 
            detail: { key: 'data_saver', value: enabled } 
        }));
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
        
        // Apply all settings
        applyDarkMode();
        translatePage();
        formatAllPrices();
        applyDataSaver();
        
        // Dispatch reset event
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