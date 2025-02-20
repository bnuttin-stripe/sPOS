import { React, useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { settingsAtom, transactionAtom, customersAtom, productAtom } from '../atoms';

export default DataLoader = (props) => {
    const backendUrl = process.env.EXPO_PUBLIC_API_URL;
    const settings = useRecoilValue(settingsAtom);
    const [transactions, setTransactions] = useRecoilState(transactionAtom);
    const [customers, setCustomers] = useRecoilState(customersAtom);
    const [products, setProducts] = useRecoilState(productAtom);

    const getTransactions = async () => {
        const response = await fetch(backendUrl + '/transactions', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Account': settings.account
            },
        });
        const data = await response.json();
        setTransactions(data);
    };

    const getCustomers = async () => {
        const response = await fetch(backendUrl + '/customers/ltv/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Account': settings.account
            },
        });
        const data = await response.json();
        setCustomers(data);
    };

    const getProducts = async () => {
        const response = await fetch(backendUrl + '/products/' + settings.currency + "/" + settings.productFilter, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Account': settings.account
            },
        });
        const data = await response.json();
        setProducts(data);
    };

    useEffect(() => {
        getTransactions();
        getCustomers();
        getProducts();
    }, []);

    return (
        <></>
    );
};
