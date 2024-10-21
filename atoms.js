import { atom } from 'recoil';
import AsyncStorage from '@react-native-async-storage/async-storage';

const localStorageEffect = (key, defaultValue) => ({ setSelf, onSet }) => {
    // const savedValue = AsyncStorage.getItem(key);
    // if (savedValue != null) {
    //     setSelf(JSON.parse(savedValue));
    // }

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
    default: [],
    // effects: [
    //     localStorageEffect('transactions'),
    // ]
});

const defaultSettings = {
    backendUrl: 'https://western-honey-chamomile.glitch.me',
    storeName: 'sPOS',
    orderPrefix: 'STP-',
    taxPercentage: '10',
    currency: 'usd'
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
    effects: [
        //localStorageEffect('products', []),
    ]
});

export const customerAtom = atom({
    key: 'customerAtom',
    default: []
});
