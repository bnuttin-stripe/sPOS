import { React, useState } from 'react';
import { Text, View, Pressable, Vibration } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCreditCard, faDeleteLeft } from '@fortawesome/pro-solid-svg-icons';
import * as Utils from '../utilities';
import { css, colors } from '../styles';
import { useRecoilValue } from 'recoil';
import { settingsAtom } from '../atoms';


export default Calculator = (props) => {
    const settings = useRecoilValue(settingsAtom);
    const [amount, setAmount] = useState(0);

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
            customer: 'cus_PL6CGSVAibQfIi',
            captureMethod: 'automatic',
            metadata: {
                app: 'sPOS',
                channel: 'calculator',
                orderNumber: Utils.generateOrderNumber(settings.orderPrefix)
            }
        }
        props.pay(payload, reset);
    }
    
    return (
        <View style={css.container}>
            <View style={styles.amount}>
                <Text style={styles.largest}>{Utils.displayPrice(amount / 100, 'usd')}</Text>
            </View>
            <View style={styles.row}>
                <Pressable style={styles.tile} onPress={() => addDigit("7")}><Text style={styles.large}>7</Text></Pressable>
                <Pressable style={styles.tile} onPress={() => addDigit("8")}><Text style={styles.large}>8</Text></Pressable>
                <Pressable style={styles.tile} onPress={() => addDigit("9")}><Text style={styles.large}>9</Text></Pressable>
            </View>
            <View style={styles.row}>
                <Pressable style={styles.tile} onPress={() => addDigit("4")}><Text style={styles.large}>4</Text></Pressable>
                <Pressable style={styles.tile} onPress={() => addDigit("5")}><Text style={styles.large}>5</Text></Pressable>
                <Pressable style={styles.tile} onPress={() => addDigit("6")}><Text style={styles.large}>6</Text></Pressable>
            </View>
            <View style={styles.row}>
                <Pressable style={styles.tile} onPress={() => addDigit("1")}><Text style={styles.large}>1</Text></Pressable>
                <Pressable style={styles.tile} onPress={() => addDigit("2")}><Text style={styles.large}>2</Text></Pressable>
                <Pressable style={styles.tile} onPress={() => addDigit("3")}><Text style={styles.large}>3</Text></Pressable>
            </View>
            <View style={styles.row}>
                <Pressable style={styles.tile} onPress={() => addDigit("0")}><Text style={styles.large}>0</Text></Pressable>
                <Pressable style={[styles.tile, { width: '67%' }]} onPress={() => addDigit("00")}><Text style={styles.large}>.00</Text></Pressable>
            </View>
            <View style={styles.row}>
                <Pressable style={[styles.tile, { backgroundColor: '#425466' }]} onPress={reset}>
                    <FontAwesomeIcon icon={faDeleteLeft} color={'white'} size={32} />
                </Pressable>
                <Pressable onPress={pay} style={[styles.tile, styles.large, { width: '67%', flexDirection: 'row', backgroundColor: '#FFBB00' }]}>
                    <FontAwesomeIcon icon={faCreditCard} color={'white'} size={32} />
                    <Text style={{ color: 'white', fontSize: 22, marginLeft: 10 }}>Pay</Text>
                    {/* <Image source={require('../assets/contactless.png')} style={{ width: 48, height: 48, marginLeft: 20 }} /> */}
                </Pressable>
            </View>
        </View>
    )
}

const styles = {
    amount: {
        alignSelf: 'flex-end',
        marginRight: 5,
        marginBottom: 20
    },
    largest: {
        fontSize: 70,
        color: colors.slate
    },
    large: {
        fontSize: 40,
        color: 'white'
    },
    medium: {
        fontSize: 30,
        color: 'white'
    },
    row: {
        flexDirection: 'row',
        height: 80
    },
    tile: {
        width: '33%',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 7,
        borderColor: 'white',
        borderRadius: 20,
        backgroundColor: '#7A73FF'
    }
};
