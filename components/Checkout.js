import { React, useState, useEffect } from 'react';
import { Text, View, Pressable, ScrollView, Modal, Image, StyleSheet } from 'react-native';
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import { DataTable, TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';


import { useRecoilState, useRecoilValue, useResetRecoilState } from 'recoil';
import { cartAtom, productAtom, settingsAtom } from '../atoms';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBarcodeRead, faUser, faChevronLeft, faCartShopping, faCartXmark } from '@fortawesome/pro-solid-svg-icons';

import * as Utils from '../utilities';
import { css, colors } from '../styles';

export default Checkout = (props) => {
    const navigation = useNavigation();
    const settings = useRecoilValue(settingsAtom);

    const cart = useRecoilValue(cartAtom);
    const uniqueCart = [...new Set(cart)];
    const resetCart = useResetRecoilState(cartAtom);

    const [customer, setCustomer] = useState({});
    const [customers, setCustomers] = useState([]);
    const [telSearch, setTelSearch] = useState('');
    const [modalVisible, setModalVisible] = useState(false);

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
            customer: 'cus_PL6CGSVAibQfIi',
            captureMethod: 'automatic',
            metadata: {
                app: 'sPOS',
                channel: 'catalog',
                orderNumber: Utils.generateOrderNumber(settings.orderPrefix),
                cart: cart.map(x => x.name).join('\n')
            }
        }
        props.pay(payload, goBackAndReset);
    }

    const searchCustomer = async () => {
        const response = await fetch(settings.backendUrl + '/customers/' + telSearch, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const data = await response.json();
        setCustomers(data);
    };

    const goBack = () => {
        navigation.navigate("App", { page: "Products" });
    }

    const goBackAndReset = () => {
        resetCart();
        goBack();
    }

    const Row = (product) => {
        return (
            <Pressable key={product.id}>
                <DataTable.Row style={{ paddingTop: 20, paddingBottom: 20 }} >
                    <DataTable.Cell style={[css.cell, { flex: 3 }]}>
                        <Text style={css.defaultText}>
                            {product.name}
                        </Text>
                    </DataTable.Cell>
                    <DataTable.Cell style={[css.cell, { flex: 1 }]} numeric>
                        <Text style={css.defaultText}>
                            {Utils.displayPrice(product.default_price.unit_amount / 100, settings.currency)}
                        </Text>
                    </DataTable.Cell>
                    <DataTable.Cell style={[css.cell, { flex: 1 }]} numeric>
                        <View style={numInCart(product) > 0 ? [styles.numInCart, { backgroundColor: colors.primary }] : [styles.numInCart, { backgroundColor: colors.secondary }]}>
                            <Text style={[css.defaultText, { color: 'white' }]}>
                                {numInCart(product)}
                            </Text>
                        </View>
                    </DataTable.Cell>
                </DataTable.Row>
            </Pressable >
        )
    }

    return (
        <View style={[css.container, { padding: 0 }]}>
            <DataTable style={{ flex: 1 }}>
                <DataTable.Header style={css.tableHeader}>
                    <DataTable.Title style={{ flex: 4 }}>
                        <Text style={css.defaultText}>
                            Product
                        </Text>
                    </DataTable.Title>
                    <DataTable.Title style={{ flex: 1 }}>
                        <Text style={css.defaultText}>
                            Price
                        </Text>
                    </DataTable.Title>
                    <DataTable.Title style={{ flex: 1 }} numeric>
                        <Text style={css.defaultText}>
                            In Cart
                        </Text>
                    </DataTable.Title>
                </DataTable.Header>
                <ScrollView>
                    {uniqueCart.length > 0 && uniqueCart.map && uniqueCart.map((product) => Row(product))}
                    {cart.length == 0 && <Text style={{ color: colors.primary, textAlign: 'center', margin: 40 }}>Cart is empty.</Text>}
                    <DataTable.Row></DataTable.Row>
                </ScrollView>
            </DataTable>

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(false);
                }}>
                <View style={css.centeredView}>
                    <View style={css.modalView}>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ flexDirection: 'column', flex: 1 }}>
                                <Text style={css.spacedText}>Phone</Text>
                            </View>
                            <View style={{ flexDirection: 'column', flex: 2 }}>
                                <TextInput
                                    style={css.input}
                                    inputMode="tel"
                                    value={telSearch}
                                    autoCapitalize='none'
                                    onChangeText={text => setTelSearch(text)}
                                    onSubmitEditing={searchCustomer}
                                />
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>




            {/* <View style={css.container}>
                <TextInput
                    // style={css.input}
                    inputMode="tel"
                    value={telSearch}
                    autoCapitalize='none'
                    onChangeText={text => setTelSearch(text)}
                    onSubmitEditing={searchCustomer}
                />
            </View> */}

            <Pressable style={[css.floatingIcon, { left: 20, bottom: 20, backgroundColor: colors.secondary, flexDirection: 'row' }]} onPress={goBack}>
                <FontAwesomeIcon icon={faChevronLeft} color={'white'} size={20} />
            </Pressable>
            <Pressable style={[css.floatingIcon, { left: 80, bottom: 20, backgroundColor: colors.secondary, flexDirection: 'row' }]} onPress={() => setModalVisible(true)}>
                <FontAwesomeIcon icon={faUser} color={'white'} size={20} />
            </Pressable>
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