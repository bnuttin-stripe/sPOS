import { React, useEffect, useState } from 'react';
import { Text, View, Pressable, Image, FlatList, Dimensions, useWindowDimensions } from 'react-native';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import { useRecoilValue, useRecoilState, useResetRecoilState } from 'recoil';
import { settingsAtom, productAtom, cartAtom } from '../atoms';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCreditCard, faPlusCircle, faArrowLeft, faCheckCircle } from '@fortawesome/pro-solid-svg-icons';

import * as Utils from '../utilities';
import { css, themeColors } from '../styles';

export default Kiosk = (props) => {
    const navigation = useNavigation();
    const settings = useRecoilValue(settingsAtom);
    const colors = themeColors[settings.theme];
    const backendUrl = process.env.EXPO_PUBLIC_API_URL;

    const { height, width } = useWindowDimensions();

    const [refreshing, setRefreshing] = useState(true);
    const [products, setProducts] = useRecoilState(productAtom);
    const [cart, setCart] = useRecoilState(cartAtom);
    const resetCart = useResetRecoilState(cartAtom);

    const numInCart = (product) => {
        return cart.filter(x => (x.id == product.id)).length;
    }

    const getCartTotal = (cart) => {
        return cart.reduce((a, b) => a + b.default_price.unit_amount / 100, 0);
    }

    const addToCart = (product) => {
        setCart([...cart, product]);
    }

    const removeFromCart = (product) => {
        var arr = [...cart];
        let idx = cart.findIndex(x => x.id == product.id);
        arr.splice(idx, 1);
        setCart(arr);
    }

    const handleItemPress = (product) => {
        numInCart(product) == 0
        ? addToCart(product)
        : removeFromCart(product);
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
        navigation.navigate("App", { page: "KioskCheckout" });
    }

    useEffect(() => {
        getProducts();
    }, []);

    const ProductCard = ({ item }) => {
        return (
            <Pressable style={styles.item} onPress={() => handleItemPress(item)}>
                <View>
                    <Image
                        style={styles.productImage}
                        source={{ uri: item.images[0] }} />
                </View>
                <View style={{ flexDirection: 'row', padding: 5 }}>
                    <View style={{ flexDirection: 'column', flex: 1 }}>
                        <Text numberOfLines={2} ellipsizeMode='tail'>{item.name}</Text>
                        <Text style={{fontSize: 18, fontWeight: 'bold', marginTop: 10}}>{Utils.displayPrice(item.default_price.unit_amount / 100, settings.currency)}</Text>
                    </View>
                    <View>
                        {numInCart(item) == 0
                            ? <FontAwesomeIcon icon={faPlusCircle} style={{ color: '#36455A' }} size={22} />
                            : <FontAwesomeIcon icon={faCheckCircle} style={{ color: colors.success }} size={22} />
                        }
                    </View>
                </View>
            </Pressable>
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
        kiosk: {
            flex: 4,
            marginHorizontal: "auto",
            // width: '90%',
        },
        productImage: {
            height: 120,
            width: 120,
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
            height: '10%',
            padding: 10,
            width: '40%',
            justifyContent: 'flex-end',
            marginHorizontal: "auto",
        },
        buttons: {
            flexDirection: 'row',
            marginHorizontal: "auto",
            justifyContent: 'space-between',
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
            <View style={styles.kiosk}>
                {!refreshing && <FlatList
                    data={products}
                    numColumns={props.columns}
                    renderItem={ProductCard}
                    keyExtractor={(product) => product.id}
                />}
            </View>
            <View style={styles.footer}>
                <View style={styles.buttons}>
                    <Button mode="contained" onPress={resetCart} style={{ backgroundColor: colors.primary, marginLeft: 10, marginRight: 10 }}>
                        Reset Cart
                    </Button>
                    <Button mode="contained" onPress={goToCheckout} style={{ backgroundColor: colors.primary, marginLeft: 10, marginRight: 10 }}>
                        Go to Checkout
                    </Button>
                </View>
            </View>
        </View>
    )
}
