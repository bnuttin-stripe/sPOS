import { React, useEffect, useState } from 'react';
import { Text, View, Pressable, useWindowDimensions } from 'react-native';

import { useRecoilValue, useRecoilState } from 'recoil';
import { settingsAtom } from '../atoms';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCreditCard, faXmark, faArrowLeft } from '@fortawesome/pro-solid-svg-icons';

import * as Utils from '../utilities';
import { css, themeColors } from '../styles';

export default Calculator = (props) => {
    const settings = useRecoilValue(settingsAtom);
    const colors = themeColors[settings.theme];
    const [amount, setAmount] = useState(0);
    const { height, width } = useWindowDimensions();

    const reset = () => {
        setAmount(0);
    }

    const addDigit = (digit) => {
        let newAmount = amount + digit;
        if (!isNaN(newAmount)) {
            setAmount(newAmount == 0 ? +digit : +newAmount);
        }
    }

    const pay = () => {
        const payload = {
            amount: amount,
            currency: settings.currency,
            captureMethod: 'automatic',
            metadata: {
                app: 'sPOS',
                channel: 'calculator',
                orderNumber: Utils.generateOrderNumber(settings.orderPrefix)
            }
        }
        props.pay(payload, reset);
    }

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
            color: colors.primary
        },
        large: {
            fontSize: 40,
            color: colors.primary
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
                <Pressable style={[styles.tile, { backgroundColor: colors.primary }]} onPress={reset}>
                    <FontAwesomeIcon icon={faXmark} color={'white'} size={24} />
                </Pressable>
                <Pressable onPress={pay} style={[styles.tile, styles.large, { width: '67%', flexDirection: 'row', backgroundColor: colors.primary}]}>
                    <FontAwesomeIcon icon={faCreditCard} color={'white'} size={24} />
                    <Text style={{ color: 'white', fontSize: 22, marginLeft: 10 }}>Pay</Text>
                    {/* <Image source={require('../assets/contactless.png')} style={{ width: 48, height: 48, marginLeft: 20 }} /> */}
                </Pressable>
            </View>
        </View>
    )
}


