import { React, useEffect, useState } from 'react';
import { Text, TextInput, View, Pressable, ScrollView, Linking, Switch } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { NetworkInfo } from 'react-native-network-info';

import { useRecoilState, useResetRecoilState } from 'recoil';
import { settingsAtom } from '../atoms';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faSave, faRotateLeft, faMobile, faTrash } from '@fortawesome/pro-solid-svg-icons';

import AsyncStorage from '@react-native-async-storage/async-storage';

import * as Utils from '../utilities';
import { css, themeColors } from '../styles';

export default Settings = (props) => {
    const [settings, setSettings] = useRecoilState(settingsAtom);
    const colors = themeColors[settings.theme];
    const [resettingStorage, setResettingStorage] = useState(false);

    const resetSettings = useResetRecoilState(settingsAtom);

    const deviceSettings = () => {
        Linking.openURL('stripe://settings/');
    }

    const resetLocalStorage = async () => {
        setResettingStorage(true);
        try {
            await AsyncStorage.clear();
            // console.log('Local storage cleared successfully.');
        } catch (error) {
            console.error('Error clearing local storage:', error);
        }
        setResettingStorage(false);
    };

    return (
        <View style={css.container}>
            <ScrollView>
                {/* <Text style={css.label}>Store Name</Text>
                <TextInput
                    style={css.input}
                    inputMode="text"
                    autoCapitalize='words'
                    value={settings?.storeName}
                    onChangeText={value => setSettings({ ...settings, storeName: value })}
                /> */}

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

                <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 0, marginBottom: 20 }}>
                    <Text style={css.label}>Enable 2% Surcharging</Text>
                    <View style={{ flexDirection: 'row-reverse', flex: 1 }}>
                        <Switch
                            trackColor={{ false: colors.light, true: colors.secondary }}
                            thumbColor={settings?.enableSurcharging ? colors.primary : colors.secondary}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={value => setSettings({ ...settings, enableSurcharging: !settings?.enableSurcharging })}
                            value={settings?.enableSurcharging}
                        />
                    </View>
                </View>

                <Text>Theme</Text>
                <RNPickerSelect
                    value={settings.theme}
                    onValueChange={value => setSettings({ ...settings, theme: value })}
                    items={[
                        { label: "Wick & Wool", value: "wick" },
                        { label: "Boba Tea Company", value: "boba" },
                    ]}
                />

                <Pressable style={{ marginTop: 20, marginBottom: 80 }} onPress={deviceSettings}>
                    <Text style={{ color: colors.danger }}>Device Settings</Text>
                </Pressable>

            </ScrollView>

            {/* <Pressable style={[css.floatingIcon, { left: 20, bottom: 20, backgroundColor: colors.primary }]} onPress={resetSettings}>
                <FontAwesomeIcon icon={faRotateLeft} color={'white'} size={18} />
            </Pressable> */}

            {/* <Pressable style={[css.floatingIcon, { left: 20, bottom: 20, backgroundColor: colors.secondary }]} onPress={deviceSettings}>
                <FontAwesomeIcon icon={faMobile} color={'white'} size={18} />
            </Pressable> */}
        </View>
    )
}
