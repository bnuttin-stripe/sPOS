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

export default Checkout = (props) => {
    const navigation = useNavigation();
    const settings = useRecoilValue(settingsAtom);

    const cart = useRecoilValue(cartAtom);
    const uniqueCart = [...new Set(cart)];
    const resetCart = useResetRecoilState(cartAtom);
    const resetCurrentCustomer = useResetRecoilState(currentCustomerAtom);
    const currentCustomer = useRecoilValue(currentCustomerAtom);

    const [modalVisible, setModalVisible] = useState(false);

    const closeModal = () => {
        setModalVisible(false);
    }

    const numInCart = (product) => {
        return cart.filter(x => (x == product)).length;
    }

    const getCartTotal = (cart) => {
        return cart.reduce((a, b) => a + b.default_price.unit_amount / 100, 0);
    }

    const pay = () => {
        if (cart.length == 0) return;
        const payload = {
            amount: getCartTotal(cart) * 100,
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
        props.pay(payload, goBackAndReset);
    }

    const goBack = () => {
        navigation.navigate("App", { page: "Products" });
    }

    const goBackAndReset = () => {
        resetCart();
        goBack();
    }

    const Row = (product) => {
        return (
            <View key={product.id} style={{ flexDirection: 'row' }}>
                <View style={{ flex: 2 }}>
                    <Text style={css.spacedText}>{product.name}</Text>
                </View>
                <View style={{ flex: 1, flexDirection: 'row-reverse' }}>
                    <Text style={css.spacedText}>{numInCart(product)} x {Utils.displayPrice(product.default_price.unit_amount / 100, settings.currency)}</Text>
                </View>
            </View>
        )
    }

    return (
        <View style={[css.container]}>
            <ScrollView>
                <Text style={{ fontSize: 20, marginBottom: 10, fontWeight: 'bold' }}>Cart</Text>
                {uniqueCart.length > 0 && uniqueCart.map && uniqueCart.map((product) => Row(product))}
                {cart.length == 0 && <Text style={{ color: colors.primary, textAlign: 'center', margin: 40 }}>Cart is empty.</Text>}

                <Text style={{ fontSize: 20, marginTop: 20, marginBottom: 10, fontWeight: 'bold' }}>Customer</Text>
                {currentCustomer.id
                    ? <View style={{ flexDirection: 'row' }}>
                        <View style={{ flex: 1 }}>
                            <Text style={css.spacedText}>{currentCustomer.name}</Text>
                        </View>
                        <View style={{ flex: 1, flexDirection: 'row-reverse' }}>
                            <Text style={css.spacedText}>{currentCustomer.email}</Text>
                        </View>
                    </View>
                    : <View style={{ flexDirection: 'row' }}>
                        <View style={{ flex: 1 }}>
                            <Text style={css.spacedText}>Guest</Text>
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
                    <View style={[css.modalView, { height: '40%', padding: 10 }]}>
                        <Customers
                            mode="pick"
                            showIcons={false}
                            showLTV={false}
                            search={true}
                            onPick={closeModal}
                        />
                        <Pressable style={[css.floatingIcon, { left: 20, bottom: 20, backgroundColor: colors.primary, elevation: 0 }]} onPress={closeModal}>
                            <FontAwesomeIcon icon={faXmark} color={'white'} size={18} />
                        </Pressable>
                        <Pressable style={[css.floatingIcon, { left: 80, bottom: 20, backgroundColor: colors.primary }]}
                            onPress={() => navigation.navigate("App", { page: "CustomerEntry", origin: "Checkout"})}>
                            <FontAwesomeIcon icon={faPlus} color={'white'} size={18} />
                        </Pressable>
                    </View>
                </View>
            </Modal>

            <Pressable style={[css.floatingIcon, { left: 20, bottom: 20, backgroundColor: colors.secondary, flexDirection: 'row' }]} onPress={goBack}>
                <FontAwesomeIcon icon={faChevronLeft} color={'white'} size={20} />
            </Pressable>

            {currentCustomer.id
                ? <Pressable style={[css.floatingIcon, { left: 80, bottom: 20, backgroundColor: colors.primary, flexDirection: 'row' }]} onPress={resetCurrentCustomer}>
                    <FontAwesomeIcon icon={faUserCheck} color={'white'} size={20} />
                </Pressable>
                : <Pressable style={[css.floatingIcon, { left: 80, bottom: 20, backgroundColor: colors.secondary, flexDirection: 'row' }]} onPress={() => setModalVisible(true)}>
                    <FontAwesomeIcon icon={faUserPlus} color={'white'} size={20} />
                </Pressable>}

            <Pressable style={[css.floatingIcon, { left: 140, bottom: 20, backgroundColor: colors.primary, flexDirection: 'row' }]} onPress={pay}>
                <FontAwesomeIcon icon={faCartShopping} color={'white'} size={20} />
                <Text style={{ color: 'white', fontSize: 16, marginLeft: 5 }}>{Utils.displayPrice(getCartTotal(cart), settings.currency)}</Text>
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