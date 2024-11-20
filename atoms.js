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