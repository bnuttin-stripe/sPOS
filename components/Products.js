import { React, useState, useEffect } from 'react';
import { Text, View, Pressable, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import * as Utils from '../utilities';
import { DataTable } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useRecoilState, useRecoilValue } from 'recoil';
import { cartAtom, productAtom, settingsAtom } from '../atoms';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBarcodeRead, faXmark, faChevronRight } from '@fortawesome/pro-light-svg-icons';
import { css, colors } from '../styles';
import CartDrawer from './CartDrawer';
import { Camera, useCameraPermission, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';


export default Products = (props) => {
    const navigation = useNavigation();
    const [refreshing, setRefreshing] = useState(false);
    const [products, setProducts] = useRecoilState(productAtom);
    const [cart, setCart] = useRecoilState(cartAtom);
    const settings = useRecoilValue(settingsAtom);
    const device = useCameraDevice('back');

    const [scannerOpen, setScannerOpen] = useState(false);
    const [foundCode, setFoundCode] = useState(false);

    const codeScanner = useCodeScanner({
        codeTypes: ['qr'],
        onCodeScanned: (codes) => {
            console.log(codes[0].value);
            const foundProduct = products.find(x => x.id == codes[0].value);
            const productInCart = cart.find(x => x.id == codes[0].value);
            if (!productInCart) {
                setCart([...cart, foundProduct]);
                setFoundCode(true);
            }
        }
    })

    const numInCart = (product) => {
        return cart.filter(x => (x == product)).length;
    }

    const Row = (product) => {
        return (
            <Pressable key={product.id} onPress={() => setCart([...cart, product])}>
                <DataTable.Row>
                    <DataTable.Cell style={{ flex: 5, paddingRight: 5 }}>
                        <Text style={{ fontWeight: numInCart(product) > 0 ? 'bold' : 'normal' }}>
                            {product.name}
                        </Text>
                    </DataTable.Cell>
                    <DataTable.Cell style={{ flex: 1 }} numeric>
                        <Text style={{ fontWeight: numInCart(product) > 0 ? 'bold' : 'normal' }}>
                            {Utils.displayPrice(product.default_price.unit_amount / 100, 'usd')}
                        </Text>
                    </DataTable.Cell>
                    <DataTable.Cell style={{ flex: 1 }} numeric>
                        <Text style={{ fontWeight: numInCart(product) > 0 ? 'bold' : 'normal' }}>
                            {numInCart(product)}
                        </Text>
                    </DataTable.Cell>
                </DataTable.Row>
            </Pressable >
        )
    }

    const getProducts = async () => {
        setRefreshing(true);
        const response = await fetch(settings.backendUrl + '/products', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const data = await response.json();
        console.log(products);
        setProducts(data);
        setRefreshing(false);
    };

    useEffect(() => {
        getProducts();
    }, []);

    return (
        <View style={[css.container, { padding: 0 }]}>
            <DataTable style={{ flex: 1 }}>
                <DataTable.Header style={css.tableHeader}>
                    <DataTable.Title style={{ flex: 5 }}>Product</DataTable.Title>
                    <DataTable.Title style={{ flex: 1 }} numeric>Price</DataTable.Title>
                    <DataTable.Title style={{ flex: 1 }} numeric>In Cart</DataTable.Title>
                </DataTable.Header>
                <ScrollView
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={getProducts}
                            progressViewOffset={150}
                            colors={['white']}
                            progressBackgroundColor={colors.slate}
                        />
                    }
                >
                    {products.length > 0 && products.map && products.map((product) => Row(product))}
                </ScrollView>
            </DataTable>
            {scannerOpen && <>
                <View style={styles.cameraPreview}>
                    <Camera
                        style={StyleSheet.absoluteFill}
                        device={device}
                        isActive={!foundCode}
                        photo={true}
                        resizeMode="cover"
                        codeScanner={codeScanner}
                    />
                </View>
                <Pressable style={[styles.floatingIcon, { left: 20, backgroundColor: colors.yellow }]} onPress={() => setScannerOpen(false)}>
                    <FontAwesomeIcon icon={faXmark} color={'white'} size={18} />
                </Pressable>
                <Pressable style={[styles.floatingIcon, { left: 80, backgroundColor: colors.blurple }]} onPress={() => setFoundCode(false)}>
                    <FontAwesomeIcon icon={faChevronRight} color={'white'} size={18} />
                </Pressable>
            </>}
            {!scannerOpen && <>
                <Pressable style={[styles.floatingIcon, { left: 20, backgroundColor: colors.blurple }]} onPress={() => setScannerOpen(true)}>
                    <FontAwesomeIcon icon={faBarcodeRead} color={'white'} size={18} />
                </Pressable>
            </>}
            <CartDrawer />
        </View>
    )
}

const styles = {
    cameraPreview: {
        // margin: 10,
        height: '40%',
        // borderWidth: 2,
        borderColor: colors.slate
    },
    floatingIcon: {
        position: 'absolute',
        color: 'white',
        bottom: 120,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 25,
    }
}