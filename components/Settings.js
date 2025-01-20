import { React, useEffect, useState } from 'react';
import { Platform, Text, TextInput, View, Pressable, ScrollView, Linking, Switch, Modal, TouchableOpacity } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { NetworkInfo } from 'react-native-network-info';
import { useNavigation } from '@react-navigation/native';

import { useRecoilState, useRecoilValue, useResetRecoilState } from 'recoil';
import { settingsAtom, themesAtom } from '../atoms';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCircleQuestion, faXmark, faMobile, faAlignJustify, faLink } from '@fortawesome/pro-solid-svg-icons';

import Button from './Button';
import TTPIEducation from './TTPIEducation';

import * as Utils from '../utilities';
import { css, themeColors } from '../styles';

export default Settings = (props) => {
    const [settings, setSettings] = useRecoilState(settingsAtom);
    const themes = useRecoilValue(themesAtom);
    const colors = themes[settings.theme]?.colors;
    const navigation = useNavigation();

    const [modalVisible, setModalVisible] = useState(false);

    const deviceSettings = () => {
        Linking.openURL('stripe://settings/');
    };

    return (
        <View style={css.container}>
            {Platform.OS == 'ios' &&
                <View style={{ borderWidth: 1, padding: 20, borderRadius: 10, marginBottom: 20, backgroundColor: 'whitesmoke' }}>
                    <Text style={{ fontSize: 16, marginBottom: 20 }}>This app leverages Tap to Pay on iPhone for easy and secure payments</Text>
                    <Pressable onPress={() => setModalVisible(true)}>
                        <Text style={{ color: 'blue', fontWeight: 'bold', fontSize: 16, marginHorizontal: 'auto' }}>Learn more about Tap to Pay on iPhone</Text>
                    </Pressable>
                </View>}
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
                    onValueChange={value => setSettings({ ...settings, theme: value, productFilter: themes[value].productFilter })}
                    items={Object.keys(themes).map(key => ({ label: themes[key]['display'], value: key }))
                }
                />
            </ScrollView>

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}>
                <View style={css.centeredView}>
                    <View style={[css.modalView, css.shadow, { marginTop: 40, height: '80%' }]}>
                        <TTPIEducation setModalVisible={setModalVisible} />
                    </View>
                </View>
            </Modal>

            {!props.hideMenu && <View style={css.floatingMenu}>
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
            </View>}

        </View>
    );
};
