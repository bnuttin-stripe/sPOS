import { React, useEffect, useState } from 'react';
import { Platform, Text, View, Pressable, useWindowDimensions, Image } from 'react-native';

import { useRecoilValue, useRecoilState } from 'recoil';
import { settingsAtom, themesAtom } from '../atoms';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCreditCard, faXmark, faDeleteLeft } from '@fortawesome/pro-solid-svg-icons';

import * as Utils from '../utilities';
import { css, themeColors } from '../styles';

export default Calculator = (props) => {
    const settings = useRecoilValue(settingsAtom);
    const themes = useRecoilValue(themesAtom);
    const colors = themes[settings.theme]?.colors;

    const [amount, setAmount] = useState(0);
    const { height, width } = useWindowDimensions();

    const reset = () => {
        setAmount(0);
    };

    const addDigit = (digit) => {
        let newAmount = amount + digit;
        if (!isNaN(newAmount)) {
            setAmount(newAmount == 0 ? +digit : +newAmount);
        }
    };

    const pay = () => {
        const payload = {
            amount: amount,
            currency: settings.currency,
            paymentMethodTypes: ['card_present'],
            captureMethod: 'automatic',
            metadata: {
                app: 'sPOS',
                channel: 'calculator',
                orderNumber: Utils.generateOrderNumber(settings.orderPrefix)
            }
        };
        if (['cny', 'aud', 'cad', 'eur', 'gbp', 'hkd', 'jpy', 'sgd', 'usd', 'dkk', 'nok', 'sek', 'chf'].includes(settings.currency)) {
            payload.paymentMethodTypes.push('wechat_pay');
        }
        props.pay(payload, reset);
    };

    const styles = {
        amount: {
            alignSelf: 'flex-end',
            marginRight: 10,
            // marginBottom: 20,
            height: '20%',
            // backgroundColor: 'pink'
        },
        largest: {
            fontSize: 70,
            color: colors.text
        },
        large: {
            fontSize: 40,
            color: colors.text
        },
        medium: {
            fontSize: 30,
            color: 'white'
        },
        row: {
            flexDirection: 'row',
            height: '16%',
        },
        tile: {
            width: '33%',
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 7,
            borderColor: 'white',
            borderRadius: 15,
            backgroundColor: colors.light
        }
    };

    return (
        <View style={css.container}>
            <View style={styles.amount}>
                <Text style={styles.largest}>{Utils.displayPrice(amount / 100, settings.currency)}</Text>
            </View>
            <View style={styles.row}>
                <Pressable style={styles.tile} onPress={() => addDigit("1")}><Text style={styles.large}>1</Text></Pressable>
                <Pressable style={styles.tile} onPress={() => addDigit("2")}><Text style={styles.large}>2</Text></Pressable>
                <Pressable style={styles.tile} onPress={() => addDigit("3")}><Text style={styles.large}>3</Text></Pressable>
            </View>
            <View style={styles.row}>
                <Pressable style={styles.tile} onPress={() => addDigit("4")}><Text style={styles.large}>4</Text></Pressable>
                <Pressable style={styles.tile} onPress={() => addDigit("5")}><Text style={styles.large}>5</Text></Pressable>
                <Pressable style={styles.tile} onPress={() => addDigit("6")}><Text style={styles.large}>6</Text></Pressable>
            </View>
            <View style={styles.row}>
                <Pressable style={styles.tile} onPress={() => addDigit("7")}><Text style={styles.large}>7</Text></Pressable>
                <Pressable style={styles.tile} onPress={() => addDigit("8")}><Text style={styles.large}>8</Text></Pressable>
                <Pressable style={styles.tile} onPress={() => addDigit("9")}><Text style={styles.large}>9</Text></Pressable>
            </View>
            <View style={styles.row}>
                <Pressable style={styles.tile} onPress={() => addDigit("0")}><Text style={styles.large}>0</Text></Pressable>
                <Pressable style={[styles.tile, { width: '67%' }]} onPress={() => addDigit("00")}><Text style={styles.large}>.00</Text></Pressable>
            </View>
            <View style={styles.row}>
                <Pressable style={[styles.tile, { backgroundColor: colors.secondary }]} onPress={reset}>
                    <FontAwesomeIcon icon={faDeleteLeft} color={'white'} size={24} />
                </Pressable>
                <Pressable onPress={pay} style={[styles.tile, styles.large, { width: '67%', flexDirection: 'row', backgroundColor: colors.primary }]}>
                    {/* <FontAwesomeIcon icon={faCreditCard} color={'white'} size={24} /> */}
                    <Image source={require('../assets/contactless.png')} style={{ width: 24, height: 24 }} />
                    <Text style={{ color: 'white', fontSize: Platform.OS == 'ios' ? 16 : 18, fontWeight: Platform.OS == 'ios' ? 600 : 400, marginLeft: 10 }}>
                        {Platform.OS == 'ios'
                            ? "Tap to Pay on iPhone"
                            : "Pay"}</Text>
                </Pressable>
            </View>
        </View>
    );
}


