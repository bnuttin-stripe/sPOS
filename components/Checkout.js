import { React, useState, useEffect } from 'react';
import { Text, View, Pressable, ScrollView, Modal, Image, StyleSheet } from 'react-native';
import { DataTable, TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import { useRecoilState, useRecoilValue, useResetRecoilState } from 'recoil';
import { cartAtom, settingsAtom, currentCustomerAtom } from '../atoms';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronLeft, faCartShopping, faXmark, faUserPlus, faUserCheck, faPlus, faCreditCard, faUserMagnifyingGlass, faMagnifyingGlass } from '@fortawesome/pro-solid-svg-icons';

import Customers from './Customers';
import Button from './Button';

import * as Utils from '../utilities';
import { css, themeColors } from '../styles';

export default Checkout = (props) => {
    const navigation = useNavigation();
    const settings = useRecoilValue(settingsAtom);
    const colors = themeColors[settings.theme];

    const cart = useRecoilValue(cartAtom);
    const uniqueCart = [...new Map(cart.map(item => [item['id'], item])).values()]
    const resetCart = useResetRecoilState(cartAtom);
    const currentCustomer = useRecoilValue(currentCustomerAtom);
    const resetCurrentCustomer = useResetRecoilState(currentCustomerAtom);

    const [modalVisible, setModalVisible] = useState(false);

    const closeModal = () => {
        setModalVisible(false);
    }

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

    const resetCartAndCustomer = () => {
        resetCart();
        resetCurrentCustomer();
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
        if (currentCustomer.id) payload.customer = currentCustomer.id;
        props.pay(payload, resetCartAndCustomer);
    }

    const goBack = () => {
        navigation.navigate("App", { page: "Products" });
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
        <View style={css.container}>
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

                <Text style={{ fontSize: 20, marginTop: 20, marginBottom: 10, fontWeight: 'bold' }}>Customer</Text>
                {currentCustomer.id
                    ? <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View>
                            <Text style={css.defaultText}>{currentCustomer.name}</Text>
                        </View>
                        <View style={{ flex: 1, flexDirection: 'row-reverse' }}>
                            <Pressable onPress={resetCurrentCustomer}>
                                <FontAwesomeIcon icon={faXmark} color={colors.primary} size={20} />
                            </Pressable>
                        </View>
                    </View>
                    : <View style={{ flexDirection: 'row' }}>
                        <View style={{ flex: 1 }}>
                            <Text style={css.defaultText}>Guest</Text>
                        </View>
                        <View style={{ flex: 1, flexDirection: 'row-reverse' }}>
                            <Pressable onPress={() => setModalVisible(true)}>
                                <FontAwesomeIcon icon={faMagnifyingGlass} color={colors.primary} size={20} />
                            </Pressable>
                        </View>
                    </View>}
            </ScrollView>

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(false);
                }}>
                <View style={css.centeredView}>
                    <View style={[css.modalView, css.shadow, { height: '40%', padding: 10 }]}>
                        <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontWeight: 'bold', fontSize: 20 }}>Search Customers</Text>
                            </View>
                            <View style={{ flex: 1, flexDirection: 'row-reverse' }}>
                                <Pressable onPress={closeModal}>
                                    <FontAwesomeIcon icon={faXmark} color={colors.primary} size={18} />
                                </Pressable>
                            </View>
                        </View>
                        <Customers
                            mode="pick"
                            showIcons={false}
                            showLTV={false}
                            search={true}
                            onPick={closeModal}
                        />
                        <Pressable style={[css.floatingIcon, css.shadow, { left: 20, bottom: 20, backgroundColor: colors.primary, flexDirection: 'row' }]}
                            onPress={() => navigation.navigate("App", { page: "CustomerEntry", origin: "Checkout" })}>
                            <FontAwesomeIcon icon={faPlus} color={'white'} size={18} />
                            <Text style={{ color: 'white', fontSize: 16, marginLeft: 5 }}>New</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            <View style={css.floatingMenu}>
                <View style={css.buttons}>
                    <Button
                        action={goBack}
                        color={colors.secondary}
                        icon={faChevronLeft}
                        // text="Close"
                        large={false}
                    />
                    <Button
                        action={pay}
                        color={colors.primary}
                        icon={faCreditCard}
                        text={"Collect " + Utils.displayPrice(getCartTotal(cart).total / 100, settings.currency)}
                        large={false}
                    />
                </View>
            </View>
        </View>
    )
}
