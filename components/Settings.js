import { React, useState, useEffect } from 'react';
import { Text, TextInput, View, KeyboardAvoidingView, Pressable, ScrollView, Linking, ActivityIndicator } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import * as Utils from '../utilities';
import { useRecoilState, useResetRecoilState } from 'recoil';
import { settingsAtom } from '../atoms';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faSave, faRotateLeft, faMobile } from '@fortawesome/pro-solid-svg-icons';
import { css, colors } from '../styles';

export default Settings = (props) => {
    const [settings, setSettings] = useRecoilState(settingsAtom);

    const resetSettings = useResetRecoilState(settingsAtom);

    const deviceSettings = () => {
        Linking.openURL('stripe://settings/');
    }

    return (
        <View style={css.container}>
            <ScrollView>
                {/* <KeyboardAvoidingView behavior='height'> */}
                    <Text style={css.label}>Backend URL</Text>
                    <TextInput
                        style={css.input}
                        inputMode="url"
                        value={settings?.backendUrl}
                        onChangeText={text => setSettings({ ...settings, backendUrl: text })}
                    />

                    <Text style={css.label}>Store Name</Text>
                    <TextInput
                        style={css.input}
                        inputMode="text"
                        autoCapitalize='words'
                        value={settings?.storeName}
                        onChangeText={text => setSettings({ ...settings, storeName: text })}
                    />

                    <Text style={css.label}>Order ID Prefix</Text>
                    <TextInput
                        style={css.input}
                        inputMode="text"
                        autoCapitalize='characters'
                        value={settings?.orderPrefix}
                        onChangeText={text => setSettings({ ...settings, orderPrefix: text })}
                    />

                    <Text style={css.label}>Tax Percentage</Text>
                    <TextInput
                        style={css.input}
                        inputMode="decimal"
                        value={settings?.taxPercentage}
                        onChangeText={text => setSettings({ ...settings, taxPercentage: text })}
                    />

                    <Text style={css.label}>Product Filter</Text>
                    <TextInput
                        style={css.input}
                        inputMode="text"
                        value={settings?.productFilter}
                        onChangeText={text => setSettings({ ...settings, productFilter: text })}
                    />

                    <Text style={css.label}>Currency</Text>
                    <RNPickerSelect
                        onValueChange={(value) => setSettings({ ...settings, currency: value })}
                        value={settings.currency}
                        items={[
                            { label: 'USD', value: 'usd' },
                            { label: 'EUR', value: 'eur' },
                            { label: 'AUD', value: 'aud' },
                            { label: 'GBP', value: 'gbp' },
                        ]}
                    />

                {/* </KeyboardAvoidingView> */}
                <View style={{height: 50}}></View>
            </ScrollView>

            <Pressable style={[css.floatingIcon, { left: 20, bottom: 20, backgroundColor: colors.yellow }]} onPress={resetSettings}>
                <FontAwesomeIcon icon={faRotateLeft} color={'white'} size={18} />
            </Pressable>
            <Pressable style={[css.floatingIcon, { left: 80, bottom: 20, backgroundColor: colors.blurple }]} onPress={deviceSettings}>
                <FontAwesomeIcon icon={faMobile} color={'white'} size={18} />
            </Pressable>

            {/* <View style={[css.row, { paddingBottom: 50 }]}>
                    <Pressable style={[css.button, { backgroundColor: colors.yellow, color: 'white' }]} onPress={resetSettings}>
                        <FontAwesomeIcon icon={faDeleteLeft} color={'white'} size={24} />
                        <Text style={css.buttonText}>Reset to Defaults</Text>
                    </Pressable>
                    <Pressable style={[css.button, { backgroundColor: colors.slate, color: 'white' }]} onPress={deviceSettings}>
                        <FontAwesomeIcon icon={faMobile} color={'white'} size={24} />
                        <Text style={css.buttonText}>Device Settings</Text>
                    </Pressable>
                </View> */}

        </View>
    )
}

const styles = {

}
