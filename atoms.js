import { atom } from 'recoil';
import AsyncStorage from '@react-native-async-storage/async-storage';

const localStorageEffect = (key, defaultValue) => ({ setSelf, onSet }) => {
    setSelf(AsyncStorage.getItem(key).then(savedValue => {
        return savedValue != null
            ? JSON.parse(savedValue)
            : defaultValue
    }
    ));

    onSet((newValue, _, isReset) => {
        isReset
            ? AsyncStorage.removeItem(key)
            : AsyncStorage.setItem(key, JSON.stringify(newValue));
    });
};

export const transactionAtom = atom({
    key: 'transactionAtom',
    default: []
});

export const settingsAtom = atom({
    key: 'settingsAtom',
    default: {},
    effects: [
        // localStorageEffect('settings', defaultSettings),
    ]
});

export const cartAtom = atom({
    key: 'cartAtom',
    default: [],
});

const adjustFinalAmount = (amount) => {
    let output = 0;
    const decimal = amount.toString().slice(-2);
    if (['01', '02', '03', '05', '40', '55', '65', '75'].includes(decimal)) {
        output = 100 - parseInt(decimal);
    }
    return output;
}

const getCartTotal = (items) => {
    const subtotal = items.reduce((a, b) => a + b.default_price.unit_amount, 0);
    const taxes = Math.round(subtotal * 0.10);
    const adjustment = adjustFinalAmount(subtotal + taxes);
    const total = subtotal + taxes + adjustment;
    return {
        subtotal: subtotal,
        taxes: taxes,
        adjustment: adjustment,
        total: total
    }
}

export const newCartAtom = atom({
    key: 'newCartAtom',
    default: {
        items: [],
        number: 0,
        subtotal: 0,
        taxes: 0,
        adjustment: 0,
        total: 0
    },
    effects: [
        ({ onSet, setSelf }) => {
            onSet(newValue => {
                const totals = getCartTotal(newValue.items);
                setSelf({...newValue, 
                    number: newValue.items.length,
                    subtotal: totals.subtotal,
                    taxes: totals.taxes,
                    adjustment: totals.adjustment,
                    total: totals.total
                });
            });
        }
    ]
});

export const productAtom = atom({
    key: 'productAtom',
    default: [],
});

export const customersAtom = atom({
    key: 'customersAtom',
    default: []
});

export const searchedCustomersAtom = atom({
    key: 'searchedCustomersAtom',
    default: []
});

export const currentCustomerAtom = atom({
    key: 'currentCustomerAtom',
    default: {}
});

export const logAtom = atom({
    key: 'logAtom',
    default: [],
});
