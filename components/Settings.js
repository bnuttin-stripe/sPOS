import { React, useEffect, useState } from 'react';
import { Text, TextInput, View, Pressable, ScrollView, Linking, Switch } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { NetworkInfo } from 'react-native-network-info';
import { useNavigation } from '@react-navigation/native';

import { useRecoilState, useResetRecoilState } from 'recoil';
import { settingsAtom } from '../atoms';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faSave, faRotateLeft, faMobile, faAlignJustify, faLink } from '@fortawesome/pro-solid-svg-icons';

import Button from './Button';

import * as Utils from '../utilities';
import { css, themeColors } from '../styles';

export default Settings = (props) => {
    const [settings, setSettings] = useRecoilState(settingsAtom);
    const colors = themeColors[settings.theme];
    const navigation = useNavigation();

    const deviceSettings = () => {
        Linking.openURL('stripe://settings/');
    }

    return (
        <View style={css.container}>
            <ScrollView>
                <Text style={css.label}>Order ID prefix</Text>
                <TextInput
                    style={css.input}
                    inputMode="text"
                    autoCapitalize='characters'
                    value={settings?.orderPrefix}
                    onChangeText={value => setSettings({ ...settings, orderPrefix: value })}
                />

                <Text style={css.label}>Tax percentage</Text>
                <TextInput
                    style={css.input}
                    inputMode="decimal"
                    value={settings?.taxPercentage}
                    onChangeText={value => setSettings({ ...settings, taxPercentage: value })}
                />

                <Text style={css.label}>Product filter</Text>
                <TextInput
                    style={css.input}
                    inputMode="text"
                    value={settings?.productFilter}
                    autoCapitalize='none'
                    onChangeText={value => setSettings({ ...settings, productFilter: value })}
                />

                <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 0, marginBottom: 20 }}>
                    <Text style={css.label}>Magic cent protection</Text>
                    <View style={{ flexDirection: 'row-reverse', flex: 1 }}>
                        <Switch
                            trackColor={{ false: colors.light, true: colors.secondary }}
                            thumbColor={settings?.magicCentProtection ? colors.primary : colors.secondary}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={() => setSettings({ ...settings, magicCentProtection: !settings?.magicCentProtection })}
                            value={settings?.magicCentProtection}
                        />
                    </View>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 0, marginBottom: 20 }}>
                    <Text style={css.label}>Enable 2% surcharging</Text>
                    <View style={{ flexDirection: 'row-reverse', flex: 1 }}>
                        <Switch
                            trackColor={{ false: colors.light, true: colors.secondary }}
                            thumbColor={settings?.enableSurcharging ? colors.primary : colors.secondary}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={() => setSettings({ ...settings, enableSurcharging: !settings?.enableSurcharging })}
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
                        { label: "David's Bridal", value: "davids" },
                        { label: "Roastery", value: "roastery" },
                    ]}
                />

            </ScrollView>

            <View style={css.floatingMenu}>
                <View style={css.buttons}>
                    <Button
                        action={() => navigation.navigate("App", { page: "Log" })}
                        color={colors.secondary}
                        icon={faAlignJustify}
                        text="Logs"
                        large={false}
                    />
                    <Button
                        action={props.reconnectReader}
                        color={colors.secondary}
                        icon={faLink}
                        text="Reconnect"
                        large={false}
                    />
                
                    {settings.isAOD && <Button
                        action={deviceSettings}
                        color={colors.secondary}
                        icon={faMobile}
                        text="Device"
                        large={false}
                    />}
                </View>
            </View>

        </View>
    )
}
