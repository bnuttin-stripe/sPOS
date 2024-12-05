import { React, useEffect } from 'react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { settingsAtom } from '../atoms';

// This component calls the backend with the reader's serial number to get details about the account - including its default currency
export default SettingsHandler = (props) => {
    const [settings, setSettings] = useRecoilState(settingsAtom);
    const backendUrl = process.env.EXPO_PUBLIC_API_URL;

    const defaultSettings = {
        storeName: 'Stripe Press',
        orderPrefix: 'STP-',
        taxPercentage: '10',
        productFilter: '',
        magicCentProtection: true
    };

    const getAccount = async () => {
        props.setInfoMsg("Getting account details");
        if (props.serial == undefined) return;
        try {
            const response = await fetch(backendUrl + "/account/" + props.serial, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            });
            const data = await response.json();
            setSettings({ ...defaultSettings, account: data.id, country: data.country, currency: data.default_currency });
        } catch (error) {
            console.error('Error getting account details:', error);
            props.setInfoMsg("Error getting account details");
        }
    }

    useEffect(() => {
        getAccount();
    }, [props.serial]);

    return (
        <></>
    )
}
