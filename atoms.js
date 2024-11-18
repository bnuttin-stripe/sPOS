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

const defaultSettings = {
    backendUrl: 'https://western-honey-chamomile.glitch.me',
    storeName: 'sPOS',
    orderPrefix: 'STP-',
    taxPercentage: '10',
    currency: 'usd',
    productFilter: '',
    magicCentProtection: true,
    account: 'acct_1O7Pg4FyN0fE9mUH'
};

export const settingsAtom = atom({
    key: 'settingsAtom',
    default: defaultSettings,
    effects: [
        localStorageEffect('settings', defaultSettings),
    ]
});

export const cartAtom = atom({
    key: 'cartAtom',
    default: [],
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