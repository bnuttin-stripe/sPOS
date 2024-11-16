import { React, useState, useEffect, useCallback } from 'react';
import { Text, View, Pressable, ScrollView, RefreshControl, Image, StyleSheet, Modal } from 'react-native';
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import { DataTable } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import { useRecoilState, useRecoilValue, useResetRecoilState } from 'recoil';
import { cartAtom, productAtom, settingsAtom, currentCustomerAtom } from '../atoms';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBarcodeRead, faXmark, faChevronRight, faCartShopping, faCartXmark, faUserPlus, faUserMagnifyingGlass, faUserCheck } from '@fortawesome/pro-solid-svg-icons';

import Customers from './Customers';

import * as Utils from '../utilities';
import { css, colors } from '../styles';

export default Products = (props) => {
    const navigation = useNavigation();
    const settings = useRecoilValue(settingsAtom);

    const [refreshing, setRefreshing] = useState(true);
    const [products, setProducts] = useRecoilState(productAtom);
    const [cart, setCart] = useRecoilState(cartAtom);
    const resetCart = useResetRecoilState(cartAtom);
    
    const device = useCameraDevice('back');

    const [scannerOpen, setScannerOpen] = useState(false);
    const [foundCode, setFoundCode] = useState(false);

    // Scan QR codes of the product IDs
    const codeScanner = useCodeScanner({
        codeTypes: ['qr'],
        onCodeScanned: (codes) => {
            const foundProduct = products.find(x => x.id == codes[0].value);
            const productInCart = cart.find(x => x.id == codes[0].value);
            if (!productInCart) {
                setCart([...cart, foundProduct]);
                setFoundCode(true);
            }
        }
    })

    const numInCart = (product) => {
        return cart.filter(x => (x.id == product.id)).length;
    }

    const getCartTotal = (cart) => {
        return cart.reduce((a, b) => a + b.default_price.unit_amount / 100, 0);
    }

    const getProducts = async () => {
        setRefreshing(true);
        const response = await fetch(settings.backendUrl + '/products/' + settings.currency + '/' + settings.productFilter, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const data = await response.json();
        setProducts(data);
        setRefreshing(false);
    };

    const pay = () => {
        if (cart.length == 0) return;
        const payload = {
            amount: getCartTotal(cart) * 100,
            currency: settings.currency,
            captureMethod: 'automatic',
            metadata: {
                app: 'sPOS',
                channel: 'catalog',
                orderNumber: Utils.generateOrderNumber(settings.orderPrefix)
            }
        }
        if (currentCustomer.id) payload.customer = currentCustomer.id;
        props.pay(payload, resetCart);
    }

    const goToCheckout = () => {
        navigation.navigate("App", { page: "Checkout" });
    }

    useEffect(() => {
        getProducts();
    }, []);

    const Row = (product) => {
        return (
            <Pressable key={product.id} onPress={() => setCart([...cart, product])}>
                <DataTable.Row style={{ paddingTop: 20, paddingBottom: 20 }} >
                    {/* <DataTable.Cell style={{ flex: 1, paddingTop: 5 , paddingBottom: 5, paddingRight: 5 }}>
                        <Image
                            style={styles.productImage}
                            source={{
                                uri: product?.images[0]
                            }}
                        />
                    </DataTable.Cell> */}
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
                <ScrollView
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={getProducts}
                            progressViewOffset={150}
                            colors={['white']}
                            progressBackgroundColor={colors.primary}
                        />
                    }
                >
                    {products.length > 0 && products.map && products.map((product) => Row(product))}
                    {products.length == 0 && !refreshing && <Text style={{ color: colors.primary, textAlign: 'center', margin: 40 }}>No products found. Make sure you have some products with default prices in the currency set in the Settings page.</Text>}
                    <DataTable.Row></DataTable.Row>
                    <DataTable.Row></DataTable.Row>
                </ScrollView>
            </DataTable>

            {scannerOpen && <>
                <View style={css.cameraPreview}>
                    <Camera
                        style={StyleSheet.absoluteFill}
                        device={device}
                        isActive={!foundCode}
                        photo={true}
                        resizeMode="cover"
                        codeScanner={codeScanner}
                    />
                </View>
                <Pressable style={[css.floatingIcon, { left: 20, bottom: 20, backgroundColor: colors.secondary, zIndex: 110 }]} onPress={() => setScannerOpen(false)}>
                    <FontAwesomeIcon icon={faXmark} color={'white'} size={18} />
                </Pressable>
                <Pressable style={[css.floatingIcon, { left: 80, bottom: 20, backgroundColor: colors.primary, zIndex: 110 }]} onPress={() => setFoundCode(false)}>
                    <FontAwesomeIcon icon={faChevronRight} color={'white'} size={18} />
                </Pressable>
            </>}

            {!scannerOpen && <>
                <Pressable style={[css.floatingIcon, { left: 20, bottom: 20, backgroundColor: colors.secondary }]} onPress={() => setScannerOpen(true)}>
                    <FontAwesomeIcon icon={faBarcodeRead} color={'white'} size={18} />
                </Pressable>
            </>}


            {/* <Modal
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
                    </View>
                </View>
            </Modal> */}

            <Pressable style={[css.floatingIcon, { left: 80, bottom: 20, backgroundColor: colors.secondary, flexDirection: 'row' }]} onPress={resetCart}>
                <FontAwesomeIcon icon={faCartXmark} color={'white'} size={20} />
            </Pressable>

            <Pressable style={[css.floatingIcon, { left: 140, bottom: 20, backgroundColor: colors.primary, flexDirection: 'row' }]} onPress={goToCheckout}>
                <FontAwesomeIcon icon={faChevronRight} color={'white'} size={20} />
                {/* <Text style={{ color: 'white', fontSize: 16, marginLeft: 5 }}>{Utils.displayPrice(getCartTotal(cart), settings.currency)}</Text> */}
            </Pressable>

            {/* <Pressable style={[css.floatingIcon, { left: 140, bottom: 20, backgroundColor: colors.secondary, flexDirection: 'row' }]} onPress={resetCart}>
                <FontAwesomeIcon icon={faCartXmark} color={'white'} size={20} />
            </Pressable>

            <Pressable style={[css.floatingIcon, { left: 200, bottom: 20, backgroundColor: colors.primary, flexDirection: 'row' }]} onPress={pay}>
                <FontAwesomeIcon icon={faCartShopping} color={'white'} size={20} />
                <Text style={{ color: 'white', fontSize: 16, marginLeft: 5 }}>{Utils.displayPrice(getCartTotal(cart), settings.currency)}</Text>
            </Pressable> */}

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