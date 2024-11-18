import { React, useEffect, useState } from 'react';
import { Text, TextInput, View, Pressable, ScrollView, Linking, Switch } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { NetworkInfo } from 'react-native-network-info';

import { useRecoilState, useResetRecoilState } from 'recoil';
import { settingsAtom } from '../atoms';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faSave, faRotateLeft, faMobile } from '@fortawesome/pro-solid-svg-icons';

import * as Utils from '../utilities';
import { css, colors } from '../styles';

export default Settings = (props) => {
    const [settings, setSettings] = useRecoilState(settingsAtom);
    const [accounts, setAccounts] = useState([]);

    const resetSettings = useResetRecoilState(settingsAtom);

    const deviceSettings = () => {
        Linking.openURL('stripe://settings/');
    }

    const getAccounts = async () => {
        const response = await fetch(settings.backendUrl + "/accounts", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const data = await response.json();
        setAccounts(data);
    }

    useEffect(() => {
        getAccounts();
    }, []);

    useEffect(() => {
        const accountCurrency = accounts.find(account => account.id === settings.account)?.currency;
        setSettings({ ...settings, currency: accountCurrency })
    }, [settings.account])

    return (
        <View style={css.container}>
            <ScrollView>
                <Text style={css.label}>Store Name</Text>
                <TextInput
                    style={css.input}
                    inputMode="text"
                    autoCapitalize='words'
                    value={settings?.storeName}
                    onChangeText={value => setSettings({ ...settings, storeName: value })}
                />

                <Text style={css.label}>Order ID Prefix</Text>
                <TextInput
                    style={css.input}
                    inputMode="text"
                    autoCapitalize='characters'
                    value={settings?.orderPrefix}
                    onChangeText={value => setSettings({ ...settings, orderPrefix: value })}
                />

                <Text style={css.label}>Tax Percentage</Text>
                <TextInput
                    style={css.input}
                    inputMode="decimal"
                    value={settings?.taxPercentage}
                    onChangeText={value => setSettings({ ...settings, taxPercentage: value })}
                />

                <Text style={css.label}>Product Filter</Text>
                <TextInput
                    style={css.input}
                    inputMode="text"
                    value={settings?.productFilter}
                    onChangeText={value => setSettings({ ...settings, productFilter: value })}
                />

                <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 0, marginBottom: 20 }}>
                    <Text style={css.label}>Magic Cent Protection</Text>
                    <View style={{ flexDirection: 'row-reverse', flex: 1 }}>
                        <Switch
                            trackColor={{ false: colors.light, true: colors.secondary }}
                            thumbColor={settings?.magicCentProtection ? colors.primary : colors.secondary}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={value => setSettings({ ...settings, magicCentProtection: !settings?.magicCentProtection })}
                            value={settings?.magicCentProtection}
                        />
                    </View>
                </View>

                <Text style={css.label}>Account</Text>
                <RNPickerSelect
                    onValueChange={value => setSettings({ ...settings, account: value })}
                    value={settings.account}
                    items={accounts.map(account => ({ label: account.name + " (" + account.currency?.toUpperCase() + ")", value: account.id }))}
                />

            </ScrollView>

            <Pressable style={[css.floatingIcon, { left: 20, bottom: 20, backgroundColor: colors.primary }]} onPress={resetSettings}>
                <FontAwesomeIcon icon={faRotateLeft} color={'white'} size={18} />
            </Pressable>

            <Pressable style={[css.floatingIcon, { left: 80, bottom: 20, backgroundColor: colors.secondary }]} onPress={deviceSettings}>
                <FontAwesomeIcon icon={faMobile} color={'white'} size={18} />
            </Pressable>

        </View>
    )
}
