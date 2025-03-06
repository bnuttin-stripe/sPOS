import { React, useEffect } from 'react';
import { getSerialNumber, isTablet, getModel } from 'react-native-device-info';

import { useRecoilState, useRecoilValue } from 'recoil';
import { settingsAtom, themesAtom } from '../atoms';

// This component calls the backend with the reader's serial number to get details about the account - including its default currency
export default SettingsHandler = (props) => {
    const [settings, setSettings] = useRecoilState(settingsAtom);
    const [themes, setThemes] = useRecoilState(themesAtom);
    const backendUrl = process.env.EXPO_PUBLIC_API_URL;
    // const backendUrl = 'https://fog-climbing-currant.glitch.me';

    const defaultSettings = {
        storeName: 'Stripe Press',
        orderPrefix: 'STP-',
        taxPercentage: '10',
        productFilter: 'press',
        magicCentProtection: true,
        theme: 'default',
        enableSurcharging: false,
        isAOD: false,
        model: 'unknown',
        showCalculator: true,
        ttpLocation: ''
    };

    const getAccount = async () => {
        const isAOD = props.serial.substring(0, 3) == 'STR';
        const model = getModel();
        props.setInfoMsg("Getting account details");

        if (props.serial == undefined) return;

        try {
            const response = await fetch(backendUrl + "/account/" + props.serial + '/' + props.deviceId, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            });
            const data = await response.json();
            setSettings({ 
                ...defaultSettings, 
                account: data.id, 
                country: data.country, 
                currency: data.default_currency, 
                isAOD: isAOD, 
                model: model,
                ttpLocation: data.ttp_location
            });
        } catch (error) {
            console.error('Error getting account details:', error);
            props.setInfoMsg("Error getting account details" + JSON.stringify(error));
        }
    };

    const getThemes = async () => {
        try {
            const response = await fetch(backendUrl + "/themes", {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            });
            const data = await response.json();
            // console.log(data);
            setThemes(data);
        } catch (error) {
            console.error('Error getting themes:', error);
        }
    };

    useEffect(() => {
        getAccount();
        getThemes();
    }, [props.serial]);

    return (
        <></>
    );
};
