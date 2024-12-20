import { React, useState, useEffect } from 'react';
import { Text, View, Pressable, ScrollView, Modal, Image, StyleSheet, useWindowDimensions } from 'react-native';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import SunmiPrinter, { AlignValue } from '@heasy/react-native-sunmi-printer';

import { useRecoilState, useRecoilValue, useResetRecoilState } from 'recoil';
import { cartAtom, productAtom, settingsAtom, currentCustomerAtom } from '../atoms';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCircleCheck, faCartShopping, faXmark, faUserPlus, faUserCheck, faPlus } from '@fortawesome/pro-solid-svg-icons';

import Customers from './Customers';

import * as Utils from '../utilities';
import { css, themeColors } from '../styles';

export default KioskCheckout = (props) => {
    const navigation = useNavigation();
    const settings = useRecoilValue(settingsAtom);
    const colors = themeColors[settings.theme];
    const [paymentDone, setPaymentDone] = useState(false);

    const { height, width } = useWindowDimensions();

    const cart = useRecoilValue(cartAtom);
    const uniqueCart = [...new Map(cart.map(item => [item['id'], item])).values()]
    const resetCart = useResetRecoilState(cartAtom);

    const numInCart = (product) => {
        return cart.filter(x => (x.id == product.id)).length;
    }

    const getCartTotal = (cart) => {
        const subtotal = cart.reduce((a, b) => a + b.default_price.unit_amount, 0);
        const taxes = Math.round(subtotal * settings.taxPercentage / 100);
        const adjustment = adjustFinalAmount(subtotal + taxes);
        const total = subtotal + taxes + adjustment;
        return {
            subtotal: subtotal,
            taxes: taxes,
            adjustment: adjustment,
            total: total
        }
    }

    const adjustFinalAmount = (amount) => {
        let output = 0;
        if (!settings.magicCentProtection) return 0;
        const decimal = amount.toString().slice(-2);
        if (['01', '02', '03', '05', '40', '55', '65', '75'].includes(decimal)) {
            output = 100 - parseInt(decimal);
        }
        return output;
    }

    const pay = () => {
        if (cart.length == 0) return;
        const payload = {
            amount: getCartTotal(cart).total,
            currency: settings.currency,
            captureMethod: 'automatic',
            metadata: {
                app: 'sPOS',
                channel: 'kiosk',
                orderNumber: Utils.generateOrderNumber(settings.orderPrefix),
                cart: cart.map(x => x.name).join('\n')
            }
        }
        props.pay(payload, setLastStep);
    }

    const goBack = () => {
        navigation.navigate("App", { page: "Kiosk" });
    }

    const newTransaction = () => {
        resetCart();
        goBack();
    }

    const setLastStep = (pi) => {
        setPaymentDone(pi.status == 'succeeded');
    }

    const printReceipt = async () => {
        SunmiPrinter.printerInit();
        SunmiPrinter.setFontWeight(false);
        SunmiPrinter.setFontSize(30);
        SunmiPrinter.printerText('Thank you for shopping with us!\n\n');
        SunmiPrinter.setFontSize(24);
        SunmiPrinter.printerText('Your items: \n');
        cart.map(item => {
            SunmiPrinter.printColumnsText([item.name, Utils.displayPrice(item.default_price.unit_amount / 100, settings.currency)], [30, 15], [AlignValue.LEFT, AlignValue.RIGHT]);
        })
        SunmiPrinter.setFontWeight(true);
        SunmiPrinter.printColumnsText(['Subtotal: ', Utils.displayPrice(getCartTotal(cart).subtotal / 100, settings.currency)], [30, 15], [AlignValue.LEFT, AlignValue.RIGHT]);
        SunmiPrinter.printColumnsText(['Tax: ', Utils.displayPrice(getCartTotal(cart).taxes / 100, settings.currency)], [30, 15], [AlignValue.LEFT, AlignValue.RIGHT]);
        SunmiPrinter.printColumnsText(['Total: ', Utils.displayPrice(getCartTotal(cart).total / 100, settings.currency)], [30, 15], [AlignValue.LEFT, AlignValue.RIGHT]);
        SunmiPrinter.setFontWeight(false);

        SunmiPrinter.printerText('\nFind our more about Stripe Terminal:\n\n');
        SunmiPrinter.printQRCode('https://stripe.com/industries/retail', 8, 0);
        SunmiPrinter.lineWrap(5);
    }

    const Row = (product) => {
        return (
            <View key={product.id} style={{ flexDirection: 'row' }}>
                <View style={{ flex: 2 }}>
                    <Text style={[css.spacedText, styles.largeText]}>{product.name}</Text>
                </View>
                <View style={{ flex: 1, flexDirection: 'row-reverse' }}>
                    <Text style={[css.spacedText, styles.largeText]}>{numInCart(product)} x {Utils.displayPrice(product.default_price.unit_amount / 100, product.default_price.currency)}</Text>
                </View>
            </View>
        )
    }

    const styles = {
        header: {
            flexDirection: 'column',
            height: '10%',
            padding: 10,
            width: '100%',
        },
        logo: {
            flex: 1,
            resizeMode: 'contain',
        },
        cart: {
            width: '100%',
            marginHorizontal: "auto",
            padding: 20
        },
        productImage: {
            height: 140,
            width: 140,
            marginBottom: 10,
        },
        item: {
            flexDirection: 'column',
            justifyContent: 'center',
            height: 240,
            alignItems: "center",
            padding: 20,
            margin: 20,
            borderColor: colors.primary,
            width: width / props.columns - 50,
            backgroundColor: colors.light,
            borderRadius: 10,
        },
        footer: {
            flexDirection: 'column',
            height: '20%',
            padding: 10,
            width: '40%',
            justifyContent: 'flex-end',
            marginHorizontal: "auto",
        },
        buttons: {
            flexDirection: 'row',
            marginHorizontal: "auto",
            justifyContent: 'space-between',
        },
        largeText: {
            fontSize: 22
        }
    };

    return (
        <View style={css.container}>
            <View style={styles.header}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    {settings.theme == 'wick' && <Image source={require('../assets/logoblack.png')} style={styles.logo} />}
                    {settings.theme == 'boba' && <Image source={require('../assets/logoBoba.png')} style={styles.logo} />}
                </View>
            </View>
            <ScrollView style={styles.cart}>
                <Text style={{ fontSize: 20, marginBottom: 10, fontWeight: 'bold' }}>Cart</Text>
                {cart.length == 0
                    ? <Text style={{ color: colors.primary, textAlign: 'center', margin: 40 }}>Cart is empty.</Text>
                    : <>
                        {uniqueCart.map && uniqueCart.map((product) => Row(product))}

                        <View style={{ flexDirection: 'row', borderTopWidth: 1, borderStyle: 'dashed', paddingTop: 8 }}>
                            <View style={{ flex: 2 }}>
                                <Text style={[css.spacedText, { fontSize: 22 }]}>Subtotal</Text>
                            </View>
                            <View style={{ flex: 1, flexDirection: 'row-reverse' }}>
                                <Text style={[css.spacedText, { fontSize: 22 }]}>{Utils.displayPrice(getCartTotal(cart).subtotal / 100, settings.currency)}</Text>
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ flex: 2 }}>
                                <Text style={[css.spacedText, styles.largeText]}>Tax</Text>
                            </View>
                            <View style={{ flex: 1, flexDirection: 'row-reverse' }}>
                                <Text style={[css.spacedText, styles.largeText]}>{Utils.displayPrice(getCartTotal(cart).taxes / 100, settings.currency)}</Text>
                            </View>
                        </View>

                        {getCartTotal(cart).adjustment > 0 && <View style={{ flexDirection: 'row' }}>
                            <View style={{ flex: 2 }}>
                                <Text style={[css.spacedText, styles.largeText]}>Round up for charity</Text>
                            </View>
                            <View style={{ flex: 1, flexDirection: 'row-reverse' }}>
                                <Text style={[css.spacedText, styles.largeText]}>{Utils.displayPrice(getCartTotal(cart).adjustment / 100, settings.currency)}</Text>
                            </View>
                        </View>}

                        <View style={{ flexDirection: 'row', borderTopWidth: 1, borderStyle: 'dashed', paddingTop: 8 }}>
                            <View style={{ flex: 2 }}>
                                <Text style={[css.spacedText, css.bold, styles.largeText]}>Total</Text>
                            </View>
                            <View style={{ flex: 1, flexDirection: 'row-reverse' }}>
                                <Text style={[css.spacedText, css.bold, styles.largeText]}>{Utils.displayPrice(getCartTotal(cart).total / 100, settings.currency)}</Text>
                            </View>
                        </View>
                    </>
                }
            </ScrollView>
            <View style={styles.footer}>
                {paymentDone && <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 30}}>
                    <FontAwesomeIcon icon={faCircleCheck} color={colors.success} size={30} />
                    <Text style={{fontSize: 26, marginLeft: 20}}>Thank you for your purchase!</Text>
                </View>}
                <View style={styles.buttons}>
                    {!paymentDone
                        ? <>
                            <Button mode="contained" style={{ backgroundColor: colors.primary, marginLeft: 10, marginRight: 10 }} onPress={goBack}>
                                Go Back
                            </Button>
                            <Button mode="contained" style={{ backgroundColor: colors.primary, marginLeft: 10, marginRight: 10 }} onPress={pay}>
                                Pay {Utils.displayPrice(getCartTotal(cart).total / 100, settings.currency)} now
                            </Button>
                        </>
                        : <>
                            <Button mode="contained" style={{ backgroundColor: colors.primary, marginLeft: 10, marginRight: 10 }} onPress={printReceipt}>
                                Print Receipt
                            </Button>
                            <Button mode="contained" style={{ backgroundColor: colors.primary, marginLeft: 10, marginRight: 10 }} onPress={newTransaction}>
                                New Transaction
                            </Button>
                        </>}
                </View>
            </View>
        </View>
    )
}

const styles = {
    numInCart: {
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        borderRadius: 15,
    },
    productImage: {
        width: 50,
        height: 50,
    }
}