export const displayPrice = (amount, currency) => {
    // console.log("Currency: ", currency);
    if (amount === null || isNaN(amount) || currency == undefined) return ' - ';
    return amount.toLocaleString('en-US', {
        style: 'currency',
        currency: currency,
    });
}

export const displayDate = (timestamp) => {
    let date = new Intl.DateTimeFormat('en-US', { year: '2-digit', month: '2-digit', day: '2-digit' }).format(timestamp * 1000)
    return date;
}

export const displayDateTime = (timestamp) => {
    let date = new Intl.DateTimeFormat('en-US', { year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(timestamp * 1000)
    return date;
}

export const displayDateTimeShort = (timestamp) => {
    let date = new Intl.DateTimeFormat('en-US', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(timestamp * 1000)
    return date;
}

export const capitalize = (s) => {
    if (typeof s !== 'string') return ''
    s = s.replace(/_/g, ' ');
    return s.charAt(0).toUpperCase() + s.slice(1)
}

export const capitalizeWords = (s) => {
    return s.split(' ').map(word => word.toLowerCase()).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

}

export const isValidEmail = (email) => {
    if (email === undefined) return false;
    return email.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);
}

export const defaultAddress = {
    line1: '350 N. Orleans St.',
    city: 'Chicago',
    state: 'IL',
    country: 'US',
    postalCode: '60654'
}

export const generateOrderNumber = (prefix) => {
    return (prefix || 'Order-') + Math.floor(Math.random() * 10000);
}

export const getCurrencyFromCountry = (country) => {
    // console.log("Country: ", country);
    switch (country) {
        case 'US':
            return 'usd';
        case 'CA':
            return 'cad';
        case 'GB':
            return 'gbp';
        case 'AU':
            return 'aud';
        case 'IE':
            return 'eur';
        case 'NL':
            return 'eur';
        case 'FR':
            return 'eur';
        case 'FI':
            return 'eur';
        default:
            return 'usd';
    }
}