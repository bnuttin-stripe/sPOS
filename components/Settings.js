import { React, useState, useEffect } from 'react';
import { Text, TextInput, View, KeyboardAvoidingView, Pressable, ScrollView, Linking, ActivityIndicator } from 'react-native';
import * as Utils from '../utilities';
import { useRecoilState, useResetRecoilState } from 'recoil';
import { settingsAtom } from '../atoms';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faSave, faDeleteLeft, faMobile } from '@fortawesome/pro-light-svg-icons';
import { css, colors } from '../styles';

export default Settings = (props) => {
    const [settings, setSettings] = useRecoilState(settingsAtom);

    const resetSettings = useResetRecoilState(settingsAtom);

    const deviceSettings = () => {
        Linking.openURL('stripe://settings/');
    }

    return (
        <ScrollView style={css.container}>
            <KeyboardAvoidingView behavior='height'>
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

                <View style={css.row}>
                    <Pressable style={[css.button, { backgroundColor: colors.yellow, color: 'white' }]} onPress={resetSettings}>
                        <FontAwesomeIcon icon={faDeleteLeft} color={'white'} size={24} />
                        <Text style={css.buttonText}>Reset to Defaults</Text>
                    </Pressable>
                    <Pressable style={[css.button, { backgroundColor: colors.slate, color: 'white' }]} onPress={deviceSettings}>
                        <FontAwesomeIcon icon={faMobile} color={'white'} size={24} />
                        <Text style={css.buttonText}>Device Settings</Text>
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </ScrollView>
    )
}

const styles = {

}
