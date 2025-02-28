import { React, useState, useEffect, useRef } from 'react';
import { Platform, Text, TextInput, View, KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, Linking, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import RNPickerSelect from 'react-native-picker-select';
import { Camera, useCameraPermission, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';

import { useRecoilValue, useRecoilState } from 'recoil';
import { currentCustomerAtom, settingsAtom, themesAtom } from '../atoms';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBarcodeRead, faXmark, faChevronRight, faSave, faIdCard, faMobile } from '@fortawesome/pro-solid-svg-icons';

import * as Utils from '../utilities';
import { css } from '../styles';

export default CustomerEntry = (props) => {
    const navigation = useNavigation();
    const settings = useRecoilValue(settingsAtom);
    const themes = useRecoilValue(themesAtom);
    const colors = themes[settings.theme]?.colors;
    
    const backendUrl = process.env.EXPO_PUBLIC_API_URL;

    const [customer, setCustomer] = useState({});
    const [savingCustomer, setSavingCustomer] = useState(false);
    const [currentCustomer, setCurrentCustomer] = useRecoilState(currentCustomerAtom);
    const [formValid, setFormValid] = useState(false);

    const device = useCameraDevice('back');

    const [scannerOpen, setScannerOpen] = useState(false);
    const [foundCode, setFoundCode] = useState(false);

    const codeScanner = useCodeScanner({
        codeTypes: ['pdf-417'],
        onCodeScanned: (codes) => {
            const payload = codes[0].value;
            // console.log(payload);
            const lastNameRegex = /(?:\nDCS)(.*)(?:\n)/;
            const firstNameRegex = /(?:\nDAC)(.*)(?:\n)/;
            const addressLine1Regex = /(?:\nDAG)(.*)(?:\n)/;
            const addressLine2Regex = /(?:\nDAH)(.*)(?:\n)/;
            const addressCityRegex = /(?:\nDAI)(.*)(?:\n)/;
            const addressStateRegex = /(?:\nDAJ)(.*)(?:\n)/;
            const addressPostalCodeRegex = /(?:\nDAK)(.*)(?:\n)/;
            setCustomer({
                firstName: Utils.capitalizeWords(firstNameRegex.exec(payload)[1]),
                lastName: Utils.capitalizeWords(lastNameRegex.exec(payload)[1]),
                addressLine1: Utils.capitalizeWords(addressLine1Regex.exec(payload)[1]),
                addressLine2: Utils.capitalizeWords(addressLine2Regex.exec(payload)[1]),
                city: Utils.capitalizeWords(addressCityRegex.exec(payload)[1]),
                state: addressStateRegex.exec(payload)[1],
                postalCode: addressPostalCodeRegex.exec(payload)[1].toString().slice(0, 5)
            });
            // setFoundCode(true);
            setScannerOpen(false);
            return;
        }
    })

    const closeScanner = () => {
        setScannerOpen(false);
        // setFoundCode(false);
    }

    const lastNameRef = useRef(null);
    const emailRef = useRef(null);
    const phoneRef = useRef(null);
    const addressLine1Ref = useRef(null);
    const cityRef = useRef(null);
    const stateRef = useRef(null);
    const postalCodeRef = useRef(null);

    const createCustomer = async () => {
        setSavingCustomer(true);
        const response = await fetch(backendUrl + '/customer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Account': settings.account
            },
            body: JSON.stringify({
                name: customer.firstName + ' ' + customer.lastName,
                email: customer.email,
                phone: customer.phone,
                line1: customer.addressLine1,
                city: customer.city,
                state: customer.state,
                postal_code: customer.postalCode,
                country: 'US'
            })
        });

        const newCustomer = await response.json();
        setSavingCustomer(false);
        if (props.origin == 'Checkout') {
            setCurrentCustomer(newCustomer);
            navigation.navigate("App", { page: "Checkout" })
        }
        else {
            navigation.navigate("App", { page: "Customers" });
        }
    }

    useEffect(() => {
        setFormValid(customer.firstName && customer.lastName && customer.email);
    }, [customer]);

    return (
        <View style={css.container}>
            <Text style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 10 }}>New Customer</Text>
            <ScrollView>
                <Text style={css.label}>First Name*</Text>
                <TextInput
                    style={css.input}
                    inputMode="text"
                    autoCapitalize='words'
                    value={customer.firstName}
                    onChangeText={text => setCustomer({ ...customer, firstName: text })}
                    returnKeyType="next"
                    onSubmitEditing={() => { lastNameRef.current.focus(); }}
                />

                <Text style={css.label}>Last Name*</Text>
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

                <Text style={css.label}>Email*</Text>
                <TextInput
                    style={css.input}
                    inputMode="email"
                    value={customer.email}
                    autoCapitalize='none'
                    onChangeText={text => setCustomer({ ...customer, email: text })}
                    ref={emailRef}
                    returnKeyType="next"
                    onSubmitEditing={() => { phoneRef.current.focus(); }}
                />

                <Text style={css.label}>Phone</Text>
                <TextInput
                    style={css.input}
                    inputMode="tel"
                    value={customer.phone}
                    autoCapitalize='none'
                    onChangeText={text => setCustomer({ ...customer, phone: text })}
                    ref={phoneRef}
                    returnKeyType="next"
                    onSubmitEditing={() => { addressLine1Ref.current.focus(); }}
                />

                <Text style={css.label}>Address</Text>
                <TextInput
                    style={css.input}
                    inputMode="text"
                    value={customer.addressLine1}
                    onChangeText={text => setCustomer({ ...customer, addressLine1: text })}
                    ref={addressLine1Ref}
                    returnKeyType="next"
                    onSubmitEditing={() => { cityRef.current.focus(); }}
                />

                {/* <Text style={css.label}>Address Line 2</Text>
                <TextInput
                    style={css.input}
                    inputMode="text"
                    value={customer.addressLine2}
                    onChangeText={text => setCustomer({ ...customer, addressLine2: text })}
                    ref={addressLine2Ref}
                    returnKeyType="next"
                    onSubmitEditing={() => { cityRef.current.focus(); }}
                /> */}

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

                <View style={{ marginBottom: 500 }}></View>

            </ScrollView>


            <View style={css.floatingMenu}>
                <View style={css.buttons}>
                    {scannerOpen && <View style={{ zIndex: 110, flexDirection: 'row', gap: 20 }}>
                        <Button
                            action={closeScanner}
                            color={colors.secondary}
                            icon={faXmark}
                            // text="Refresh"
                            large={false}
                        // refreshing={refreshing}
                        />
                    </View>}
                    {settings.currency == 'usd' && !scannerOpen &&
                        <Button
                            action={() => setScannerOpen(true)}
                            color={colors.primary}
                            icon={faIdCard}
                            text="Scan DL"
                            large={false}
                        />
                    }
                    <Button
                        action={createCustomer}
                        color={colors.primary}
                        icon={faSave}
                        text="Save"
                        large={false}
                        refreshing={savingCustomer}
                        disabled={!formValid}
                        disabledColor={colors.secondary}
                    />
                </View>
            </View>

            {scannerOpen && <>
                <View style={[css.cameraPreview, { margin: -20 }]}>
                    <Camera
                        style={StyleSheet.absoluteFill}
                        device={device}
                        // isActive={!foundCode}
                        isActive={true}
                        photo={true}
                        resizeMode="cover"
                        codeScanner={codeScanner}
                    />
                </View>
            </>}
        </View>
    )
}

