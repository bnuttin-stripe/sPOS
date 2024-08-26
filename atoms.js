import { atom, useRecoilState } from 'recoil';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use the following effect to persist anything to session storage
const localStorageEffect = key => ({ setSelf, onSet }) => {
    const savedValue = AsyncStorage.getItem(key);
    // console.log("Cetting savedValue");
    // console.log("Saved value: ", savedValue);
    if (savedValue != null) {
        // console.log("Saved value: ", savedValue);
        //setSelf(JSON.parse(savedValue));
        setSelf(savedValue);
    }

    onSet((newValue, _, isReset) => {
        if (isReset){
            // console.log("Removing key");
            AsyncStorage.removeItem(key)
        }
        else{
            //console.log("Setting key", newValue);
            AsyncStorage.setItem(key, JSON.stringify(newValue));
        }
    });
};

// export const paymentMethodsGlobalAtom = atom({
//     key: 'paymentMethodsGlobalAtom',
//     default: [],
//     effects: [
//         ({ onSet }) => {
//             onSet(data => {
//                 console.log(data.length + " payment methods");
//             });
//         },
//     ]
// });

export const transactionAtom = atom({
    key: 'transactionAtom',
    default: [],
    effects: [
        localStorageEffect('transactions'),
    ]
});
