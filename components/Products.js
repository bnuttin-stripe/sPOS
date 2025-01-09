import { React, useState, useEffect, useCallback } from 'react';
import { Text, View, Pressable, ScrollView, RefreshControl, Image, StyleSheet, Modal } from 'react-native';
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import { DataTable } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import { useRecoilState, useRecoilValue, useResetRecoilState } from 'recoil';
import { cartAtom, productAtom, settingsAtom } from '../atoms';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBarcodeRead, faXmark, faChevronRight, faCartShopping, faCartXmark, faPlus, faMinus, faUserMagnifyingGlass, faUserCheck } from '@fortawesome/pro-solid-svg-icons';

import Button from './Button';

import * as Utils from '../utilities';
import { css, themeColors } from '../styles';

export default Products = (props) => {
    const navigation = useNavigation();
    const settings = useRecoilValue(settingsAtom);
    const colors = themeColors[settings.theme];
    const backendUrl = process.env.EXPO_PUBLIC_API_URL;

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

    const addToCart = (product) => {
        setCart([...cart, product]);
    }

    const removeFromCart = (product) => {
        setCart(cart.filter(x => x.id != product.id));
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

    const getProducts = async () => {
        setRefreshing(true);
        const response = await fetch(backendUrl + '/products/' + settings.currency + "/" + settings.productFilter, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Account': settings.account
            },
        });
        const data = await response.json();
        setProducts(data);
        setRefreshing(false);
    };

    const goToCheckout = () => {
        navigation.navigate("App", { page: "Checkout" });
    }

    useEffect(() => {
        getProducts();
    }, []);

    const Row = (product) => {
        return (
            <Pressable key={product.id} >
                <DataTable.Row style={{ paddingTop: 20, paddingBottom: 20 }} >
                    <DataTable.Cell style={{ flex: 1.2, paddingTop: 5, paddingBottom: 5, paddingRight: 0 }}>
                        <Image
                            style={{ width: 80, height: 80, }}
                            source={{
                                uri: product?.images[0]
                            }}
                        />
                    </DataTable.Cell>
                    <DataTable.Cell style={[css.cell, { flex: 2 }]}>
                        <Text style={css.defaultText}>
                            {product.name}
                        </Text>
                    </DataTable.Cell>
                    <DataTable.Cell style={[css.cell, { flex: .8 }]} numeric>
                        <Text style={css.defaultText}>
                            {Utils.displayPrice(product.default_price.unit_amount / 100, product.default_price.currency)}
                        </Text>
                    </DataTable.Cell>
                    <DataTable.Cell style={[css.cell, { flex: .5 }]} numeric>
                        {numInCart(product) == 0
                            ? <Pressable style={[css.smallRoundIcon, { backgroundColor: colors.secondary }]} onPress={() => addToCart(product)}>
                                <FontAwesomeIcon icon={faPlus} color={'white'} size={12} />
                            </Pressable>
                            : <Pressable style={[css.smallRoundIcon, { backgroundColor: colors.primary }]} onPress={() => setCart(cart.filter(x => x.id != product.id))}>
                                <FontAwesomeIcon icon={faMinus} color={'white'} size={12} />
                            </Pressable>
                        }
                    </DataTable.Cell>
                </DataTable.Row>
            </Pressable >
        )
    }

    return (
        <View style={[css.container, { padding: 0 }]}>
            <DataTable style={{ flex: 1 }}>
                {/* <DataTable.Header style={css.tableHeader}>
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
            </DataTable.Header> */}
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
                    <View style={{ height:70 }}></View>
                </ScrollView>
            </DataTable>

            <View style={css.floatingMenu}>
                <View style={css.buttons}>
                    {scannerOpen ?
                        <View style={{ zIndex: 110, flexDirection: 'row', gap: 20 }}>
                            <Button
                                action={() => setScannerOpen(false)}
                                color={colors.secondary}
                                icon={faXmark}
                                // text="Close"
                                large={false}
                            />
                            <Button
                                action={() => setFoundCode(false)}
                                color={colors.primary}
                                icon={faChevronRight}
                                // text="Next"
                                large={false}
                            />
                        </View>
                        : <Button
                            action={() => setScannerOpen(true)}
                            color={colors.secondary}
                            icon={faBarcodeRead}
                            // text="Scan"
                            large={false}
                        />
                    }
                    <Button
                        action={resetCart}
                        color={colors.secondary}
                        icon={faCartXmark}
                        // text="Reset"
                        large={false}
                    />
                    <Button
                        action={goToCheckout}
                        color={colors.primary}
                        icon={faCartShopping}
                        text={Utils.displayPrice(getCartTotal(cart).subtotal / 100, settings.currency)}
                        large={false}
                    />
                </View>
            </View>

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
            </>}
        </View>
    )
}
