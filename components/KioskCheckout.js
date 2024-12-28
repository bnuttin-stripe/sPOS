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

    const stripeLogo = "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";

    const printReceipt = async () => {
        SunmiPrinter.printerInit();
        SunmiPrinter.printBitmap(stripeLogo, 200);
        SunmiPrinter.lineWrap(2);
        SunmiPrinter.setFontWeight(false);
        SunmiPrinter.setFontSize(30);
        SunmiPrinter.printerText('Thank you for shopping with us!\n\n');
        SunmiPrinter.printerText('[ Demo only - your card was NOT charged ]\n\n');
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