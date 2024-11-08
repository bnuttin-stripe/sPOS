import { React } from 'react';
import { Text, TextInput, View, Pressable, ScrollView, Linking } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';

import { useRecoilState, useResetRecoilState } from 'recoil';
import { settingsAtom } from '../atoms';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faSave, faRotateLeft, faMobile } from '@fortawesome/pro-solid-svg-icons';

import * as Utils from '../utilities';
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
                {/* <Text style={css.label}>Backend URL</Text>
                    <TextInput
                        style={css.input}
                        inputMode="url"
                        value={settings?.backendUrl}
                        onChangeText={text => setSettings({ ...settings, backendUrl: text })}
                    /> */}

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

                <Text style={css.label}>Currency</Text>
                <RNPickerSelect
                    onValueChange={value => setSettings({ ...settings, currency: value })}
                    value={settings.currency}
                    items={[
                        { label: 'USD', value: 'usd' },
                        { label: 'EUR', value: 'eur' },
                        { label: 'AUD', value: 'aud' },
                        { label: 'GBP', value: 'gbp' },
                        { label: 'CAD', value: 'cad' },
                    ]}
                />

                {/* <View style={{ height: 50 }}></View> */}
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
