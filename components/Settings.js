import { React, useEffect, useState } from 'react';
import { Platform, Text, TextInput, View, Pressable, ScrollView, Linking, Switch, Modal, StyleSheet } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { NetworkInfo } from 'react-native-network-info';
import { useNavigation } from '@react-navigation/native';

import { useRecoilState, useRecoilValue, useResetRecoilState } from 'recoil';
import { settingsAtom, themesAtom } from '../atoms';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faDownload, faKey, faXmark, faAlignJustify, faLink } from '@fortawesome/pro-solid-svg-icons';

import Button from './Button';
import TTPIEducation from './TTPIEducation';

import * as Utils from '../utilities';
import { css } from '../styles';

export default Settings = (props) => {
    const [settings, setSettings] = useRecoilState(settingsAtom);
    // const themes = useRecoilValue(themesAtom);
    const [themes, setThemes] = useRecoilState(themesAtom);
    const [refreshingThemes, setRefreshingThemes] = useState(false);

    const backendUrl = process.env.EXPO_PUBLIC_API_URL;

    const colors = themes[settings.theme]?.colors || themes['default'].colors;
    const navigation = useNavigation();

    const [modalVisible, setModalVisible] = useState(false);
    const [aboutVisible, setAboutVisible] = useState(false);

    const deviceSettings = () => {
        Linking.openURL('stripe://settings/');
    };

    const getThemes = async () => {
        setRefreshingThemes(true);
        try {
            const response = await fetch(backendUrl + "/themes", {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            });
            const data = await response.json();
            setThemes(data);
            setRefreshingThemes(false);
        } catch (error) {
            console.error('Error getting themes:', error);
        }
    };

    const pickerSelectStyles = StyleSheet.create({
        inputIOS: {
          fontSize: 16,
          paddingVertical: 6,
          paddingHorizontal: 10,
          borderWidth: 1,
          borderColor: 'gray',
          borderRadius: 4,
          color: 'black',
          paddingRight: 30, // to ensure the text is never behind the icon
        },
        inputAndroid: {
          fontSize: 16,
          paddingHorizontal: 10,
          paddingVertical: 8,
          borderWidth: 0.5,
          borderColor: 'purple',
          borderRadius: 8,
          color: 'black',
          paddingRight: 30, // to ensure the text is never behind the icon
        },
      });

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
                            ios_backgroundColor="#f5f5f5"
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
                            ios_backgroundColor="#f5f5f5"
                            onValueChange={() => setSettings({ ...settings, enableSurcharging: !settings?.enableSurcharging })}
                            value={settings?.enableSurcharging}
                        />
                    </View>
                </View>

                <Text>Theme</Text>
                <RNPickerSelect
                    value={settings.theme}
                    onValueChange={value => setSettings({ ...settings, theme: value, productFilter: themes[value].productFilter })}
                    items={Object.keys(themes).map(key => ({ label: themes[key]['display'], value: key }))}
                    style={pickerSelectStyles}
                />

                <Pressable style={{ flex: 1, marginTop: 20 }} onPress={() => setAboutVisible(true)}>
                    <Text style={{ color: 'blue', textDecorationLine: 'underline' }}>About</Text>
                </Pressable>
            </ScrollView>

            {/* ---------------------------- TTPI Education ---------------------------- */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(false);
                }}>
                <View style={css.centeredView}>
                    <View style={[css.modalView, css.shadow, { marginTop: 40, height: '80%' }]}>
                        <TTPIEducation setModalVisible={setModalVisible} />
                    </View>
                </View>
            </Modal>

            {/* ---------------------------- About ---------------------------- */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={aboutVisible}
                onRequestClose={() => {
                    setAboutVisible(false);
                }}>
                <View style={css.centeredView}>
                    <View style={[css.modalView, css.shadow, { marginTop: 60, height: '20%', width: '80%' }]}>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ flexDirection: 'column', flex: 1.8 }}>
                                <Text style={css.spacedTextMuted}>Version</Text>
                                <Text style={css.spacedTextMuted}>Author</Text>
                                <Text style={css.spacedTextMuted}>Info</Text>
                            </View>
                            <View style={{ flexDirection: 'column', flex: 4 }}>
                                <Text style={css.spacedText}>1.0.27</Text>
                                <Text style={css.spacedText}>Benjamin Nuttin</Text>
                                <Text style={css.spacedText}>go/stripe360demo/docs</Text>
                            </View>
                        </View>

                        <Pressable style={[css.floatingIcon, css.shadow, { right: 0, top: 0, elevation: 0, shadowRadius: 0 }]} onPress={() => setAboutVisible(false)}>
                            <FontAwesomeIcon icon={faXmark} color={colors.primary} size={18} />
                        </Pressable>
                    </View>
                </View>
            </Modal>

            {/* ---------------------------- Buttons ---------------------------- */}
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
                        action={getThemes}
                        color={colors.secondary}
                        icon={faDownload}
                        text="Themes"
                        large={false}
                    />

                    {settings.isAOD && <Button
                        action={deviceSettings}
                        color={colors.secondary}
                        icon={faKey}
                        text="Device"
                        large={false}
                    />}
                </View>
            </View>}

        </View>
    );
};
