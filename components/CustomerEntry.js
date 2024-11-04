import { React, useState, useEffect, useRef } from 'react';
import { Text, TextInput, View, KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, Linking, ActivityIndicator } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import RNPickerSelect from 'react-native-picker-select';
import * as Utils from '../utilities';
import { useRecoilState, useResetRecoilState } from 'recoil';
import { settingsAtom } from '../atoms';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBarcodeRead, faXmark, faChevronRight, faSave, faIdCard, faMobile } from '@fortawesome/pro-solid-svg-icons';
import { css, colors } from '../styles';
import { Camera, useCameraPermission, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';

export default CustomerEntry = (props) => {
    const [settings, setSettings] = useRecoilState(settingsAtom);
    const [customer, setCustomer] = useState({});

    const device = useCameraDevice('back');

    const [scannerOpen, setScannerOpen] = useState(false);
    const [foundCode, setFoundCode] = useState(false);

    const openScanner = () => {
        setScannerOpen(false);
    }

    const closeScanner = () => {
        setScannerOpen(true);
    }

    const saveCustomer = () => {
    }

    const codeScanner = useCodeScanner({
        codeTypes: ['pdf-417'],
        onCodeScanned: (codes) => {
            const payload = codes[0].value;
            console.log(payload);
            const lastNameRegex = /(?:\nDCS)(.*)(?:\n)/;
            const firstNameRegex = /(?:\nDAC)(.*)(?:\n)/;
            const addressLine1Regex = /(?:\nDAG)(.*)(?:\n)/;
            const addressLine2Regex = /(?:\nDAH)(.*)(?:\n)/;
            const addressCityRegex = /(?:\nDAI)(.*)(?:\n)/;
            const addressStateRegex = /(?:\nDAJ)(.*)(?:\n)/;
            const addressPostalCodeRegex = /(?:\nDAK)(.*)(?:\n)/;
            setCustomer({
                firstName: firstNameRegex.exec(payload)[1],
                lastName: lastNameRegex.exec(payload)[1],
                addressLine1: addressLine1Regex.exec(payload)[1],
                addressLine2: addressLine2Regex.exec(payload)[1],
                city: addressCityRegex.exec(payload)[1],
                state: addressStateRegex.exec(payload)[1],
                postalCode: addressPostalCodeRegex.exec(payload)[1]
            });
            setScannerOpen(false);
            return;
        }
    })

    const lastNameRef = useRef(null);
    const emailRef = useRef(null);
    const addressLine1Ref = useRef(null);
    const addressLine2Ref = useRef(null);
    const cityRef = useRef(null);
    const stateRef = useRef(null);
    const postalCodeRef = useRef(null);

    return (
        <View style={css.container}>
            <View style={{ flexDirection: 'row' }}>
                <Text style={css.title}>Add Customer</Text>

                {settings.currency == 'usd' && <>
                    {scannerOpen && <Pressable style={[css.floatingIcon, { right: 60, top: -5, backgroundColor: colors.slate }]} onPress={openScanner}>
                        <FontAwesomeIcon icon={faXmark} color={'white'} size={24} />
                    </Pressable>}
                    {!scannerOpen && <Pressable style={[css.floatingIcon, { right: 60, top: -5, backgroundColor: colors.slate }]} onPress={closeScanner}>
                        <FontAwesomeIcon icon={faIdCard} color={'white'} size={24} />
                    </Pressable>}
                </>
                }
                <Pressable style={[css.floatingIcon, { right: 0, top: -5, backgroundColor: colors.blurple, color: 'white' }]} onPress={saveCustomer}>
                    <FontAwesomeIcon icon={faSave} color={'white'} size={24} />
                </Pressable>
            </View>
            <ScrollView>
                {scannerOpen && <>
                    <View style={styles.cameraPreview}>
                        <Camera
                            style={StyleSheet.absoluteFill}
                            device={device}
                            isActive={!foundCode}
                            photo={true}
                            resizeMode="cover"
                            codeScanner={codeScanner}
                        />
                    </View>
                </>}

                <Text style={css.label}>First Name</Text>
                <TextInput
                    style={css.input}
                    inputMode="text"
                    autoCapitalize='words'
                    value={customer.firstName}
                    onChangeText={text => setCustomer({ ...customer, firstName: text })}
                    returnKeyType="next"
                    onSubmitEditing={() => { lastNameRef.current.focus(); }}
                />

                <Text style={css.label}>Last Name</Text>
                <TextInput
                    style={css.input}
                    inputMode="text"
                    autoCapitalize='words'
                    value={customer.lastName}
                    onChangeText={text => setCustomer({ ...customer, lastName: text })}
                    ref={lastNameRef}
                    returnKeyType="next"
                    onSubmitEditing={() => { emailRef.current.focus(); }}
                />

                <Text style={css.label}>Email</Text>
                <TextInput
                    style={css.input}
                    inputMode="email"
                    value={customer.email}
                    onChangeText={text => setCustomer({ ...customer, email: text })}
                    ref={emailRef}
                    returnKeyType="next"
                    onSubmitEditing={() => { addressLine1Ref.current.focus(); }}
                />

                <Text style={css.label}>Address Line 1</Text>
                <TextInput
                    style={css.input}
                    inputMode="text"
                    value={customer.addressLine1}
                    onChangeText={text => setCustomer({ ...customer, addressLine1: text })}
                    ref={addressLine1Ref}
                    returnKeyType="next"
                    onSubmitEditing={() => { addressLine1Ref.current.focus(); }}
                />

                <Text style={css.label}>Address Line 2</Text>
                <TextInput
                    style={css.input}
                    inputMode="text"
                    value={customer.addressLine2}
                    onChangeText={text => setCustomer({ ...customer, addressLine2: text })}
                    ref={addressLine2Ref}
                    returnKeyType="next"
                    onSubmitEditing={() => { cityRef.current.focus(); }}
                />

                <Text style={css.label}>City</Text>
                <TextInput
                    style={css.input}
                    inputMode="text"
                    value={customer.city}
                    onChangeText={text => setCustomer({ ...customer, city: text })}
                    ref={cityRef}
                    returnKeyType="next"
                    onSubmitEditing={() => { stateRef.current.focus(); }}
                />

                <Text style={css.label}>State</Text>
                <TextInput
                    style={css.input}
                    inputMode="text"
                    value={customer.state}
                    autoCapitalize='characters'
                    onChangeText={text => setCustomer({ ...customer, state: text })}
                    ref={stateRef}
                    returnKeyType="next"
                    onSubmitEditing={() => { postalCodeRef.current.focus(); }}
                />

                <Text style={css.label}>Postal Code</Text>
                <TextInput
                    style={css.input}
                    inputMode="text"
                    value={customer.postalCode}
                    onChangeText={text => setCustomer({ ...customer, postalCode: text })}
                    ref={postalCodeRef}
                />
                
            </ScrollView>
        </View>
    )
}

const styles = {
    cameraPreview: {
        // margin: 10,
        height: 150,
        width: '100%',
        // borderWidth: 2,
        // borderColor: colors.slate,
        top: 10,
        position: 'absolute',
        zIndex: 100,
        shadownColor: 'black',
        elevation: 8,
    },

}