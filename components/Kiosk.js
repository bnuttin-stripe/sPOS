import { React, useEffect, useState } from 'react';
import { Text, View, Pressable, Image, FlatList, ScrollView, Dimensions, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useRecoilValue, useRecoilState, useResetRecoilState } from 'recoil';
import { settingsAtom, productAtom, cartAtom } from '../atoms';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCreditCard, faPlusCircle, faArrowLeft, faCheckCircle } from '@fortawesome/pro-solid-svg-icons';

import * as Utils from '../utilities';
import { css, colors } from '../styles';
import { Header } from 'react-native-elements/dist/header/Header';
import { Button } from 'react-native-paper';

export default Kiosk = (props) => {
    const navigation = useNavigation();
    const settings = useRecoilValue(settingsAtom);
    const backendUrl = process.env.EXPO_PUBLIC_API_URL;

    const { height, width } = useWindowDimensions();
    // console.log(height, width);

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
        navigation.navigate("App", { page: "CheckoutKiosk" });
    }

    useEffect(() => {
        getProducts();
    }, []);

    const ProductCard = ({ item }) => {
        return (
            <Pressable style={styles.item} onPress={() => setCart([...cart, item])}>
                <View>
                    <Image
                        style={styles.productImage}
                        source={{ uri: item.images[0] }} />
                </View>
                <View style={{ flexDirection: 'row', padding: 5 }}>
                    <View style={{ flexDirection: 'column', flex: 1 }}>
                        <Text numberOfLines={2} ellipsizeMode='tail'>{item.name}</Text>
                        <Text>{Utils.displayPrice(item.default_price.unit_amount / 100, settings.currency)}</Text>
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
            // backgroundColor: 'red'
        },
        kiosk: {
            flex: 1,
            marginLeft: -20,
            marginRight: -20,
            // // marginHorizontal: "auto",
            // flexDirection: "column",
            // flexWrap: "wrap"
        },
        productImage: {
            // height: width/ props.columns,
            height: width / (props.columns + 1),
            width: width / (props.columns + 1),
            marginBottom: 10
            // flex: 1,
            // resizeMode: 'contain',
        },
        item: {
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'flex-start',
            height: width / (props.columns + 1) + 80,
            alignItems: "center",
            // padding: 10,
            margin: 10,
            // borderColor: colors.primary,
            // borderWidth: 1,
        },
        footer: {
            flexDirection: 'column',
            justifyContent: 'flex-end',
            height: '10%',
            padding: 10,
            width: '100%',
            marginBottom: 0,
            borderWdith: 2,
            borderColor: colors.primary,
        },
    };

    return (
        <View style={css.container}>
            <View style={styles.header}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Image source={require('../assets/logoblack.png')} style={styles.logo} />
                </View>
            </View>
            <View style={styles.kiosk}>
                {!refreshing && <FlatList
                    data={products}
                    numColumns={2}
                    renderItem={ProductCard}
                    keyExtractor={(product) => product.id}
                />}
            </View>
            <View style={styles.footer}>
                <Button mode="contained" onPress={goToCheckout} style={{ width: '100%', backgroundColor: colors.primary }}>
                    Pay {Utils.displayPrice(getCartTotal(cart), settings.currency)} now
                </Button>
            </View>
        </View>
    )
}

