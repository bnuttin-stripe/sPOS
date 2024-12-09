import { React, useState, useEffect } from 'react';
import { Text, View, Pressable, ScrollView, Modal, Image, StyleSheet } from 'react-native';
import { DataTable, TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import { useRecoilState, useRecoilValue, useResetRecoilState } from 'recoil';
import { cartAtom, productAtom, settingsAtom, currentCustomerAtom } from '../atoms';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronLeft, faCartShopping, faXmark, faUserPlus, faUserCheck, faPlus } from '@fortawesome/pro-solid-svg-icons';

import Customers from './Customers';

import * as Utils from '../utilities';
import { css, colors } from '../styles';

export default CheckoutKiosk = (props) => {
    const navigation = useNavigation();
    const settings = useRecoilValue(settingsAtom);

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
                channel: 'catalog',
                orderNumber: Utils.generateOrderNumber(settings.orderPrefix),
                cart: cart.map(x => x.name).join('\n')
            }
        }
        props.pay(payload, resetCart);
    }

    const goBack = () => {
        navigation.navigate("App", { page: "Kiosk" });
    }

    const Row = (product) => {
        return (
            <View key={product.id} style={{ flexDirection: 'row' }}>
                <View style={{ flex: 2 }}>
                    <Text style={css.spacedText}>{product.name}</Text>
                </View>
                <View style={{ flex: 1, flexDirection: 'row-reverse' }}>
                    <Text style={css.spacedText}>{numInCart(product)} x {Utils.displayPrice(product.default_price.unit_amount / 100, product.default_price.currency)}</Text>
                </View>
            </View>
        )
    }

    return (
        <View style={[css.container]}>
            <ScrollView>
                <Text style={{ fontSize: 20, marginBottom: 10, fontWeight: 'bold' }}>Cart</Text>
                {cart.length == 0
                    ? <Text style={{ color: colors.primary, textAlign: 'center', margin: 40 }}>Cart is empty.</Text>
                    : <>
                        {uniqueCart.map && uniqueCart.map((product) => Row(product))}

                        <View style={{ flexDirection: 'row', borderTopWidth: 1, borderStyle: 'dashed', paddingTop: 8 }}>
                            <View style={{ flex: 2 }}>
                                <Text style={css.spacedText}>Subtotal</Text>
                            </View>
                            <View style={{ flex: 1, flexDirection: 'row-reverse' }}>
                                <Text style={css.spacedText}>{Utils.displayPrice(getCartTotal(cart).subtotal / 100, settings.currency)}</Text>
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ flex: 2 }}>
                                <Text style={css.spacedText}>Tax</Text>
                            </View>
                            <View style={{ flex: 1, flexDirection: 'row-reverse' }}>
                                <Text style={css.spacedText}>{Utils.displayPrice(getCartTotal(cart).taxes / 100, settings.currency)}</Text>
                            </View>
                        </View>

                        {getCartTotal(cart).adjustment > 0 && <View style={{ flexDirection: 'row' }}>
                            <View style={{ flex: 2 }}>
                                <Text style={css.spacedText}>Round up for charity</Text>
                            </View>
                            <View style={{ flex: 1, flexDirection: 'row-reverse' }}>
                                <Text style={css.spacedText}>{Utils.displayPrice(getCartTotal(cart).adjustment / 100, settings.currency)}</Text>
                            </View>
                        </View>}

                        <View style={{ flexDirection: 'row', borderTopWidth: 1, borderStyle: 'dashed', paddingTop: 8 }}>
                            <View style={{ flex: 2 }}>
                                <Text style={[css.spacedText, css.bold]}>Total</Text>
                            </View>
                            <View style={{ flex: 1, flexDirection: 'row-reverse' }}>
                                <Text style={[css.spacedText, css.bold]}>{Utils.displayPrice(getCartTotal(cart).total / 100, settings.currency)}</Text>
                            </View>
                        </View>
                    </>
                }
            </ScrollView>

            <Pressable style={[css.floatingIcon, { left: 20, bottom: 20, backgroundColor: colors.secondary, flexDirection: 'row' }]} onPress={goBack}>
                <FontAwesomeIcon icon={faChevronLeft} color={'white'} size={20} />
            </Pressable>

            <Pressable style={[css.floatingIcon, { left: 140, bottom: 20, backgroundColor: colors.primary, flexDirection: 'row' }]} onPress={pay}>
                <FontAwesomeIcon icon={faCartShopping} color={'white'} size={20} />
                <Text style={{ color: 'white', fontSize: 16, marginLeft: 5 }}>{Utils.displayPrice(getCartTotal(cart).total / 100, settings.currency)}</Text>
            </Pressable>

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