import { React, useEffect, useState } from 'react';
import { Text, View, Pressable, Image, FlatList, Modal, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useRecoilValue, useRecoilState, useResetRecoilState } from 'recoil';
import { settingsAtom, themesAtom, productAtom, cartAtom } from '../atoms';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCreditCard, faPlusCircle, faXmark, faCheckCircle, faTrash } from '@fortawesome/pro-solid-svg-icons';

import Button from './Button';
import Settings from './Settings';

import * as Utils from '../utilities';
import { css, themeColors } from '../styles';

export default Kiosk = (props) => {
    const navigation = useNavigation();
    const settings = useRecoilValue(settingsAtom);
    const themes = useRecoilValue(themesAtom);
    const colors = themes[settings.theme]?.colors;

    const backendUrl = process.env.EXPO_PUBLIC_API_URL;

    const { height, width } = useWindowDimensions();
    const [modalVisible, setModalVisible] = useState(false);

    const [refreshing, setRefreshing] = useState(true);
    const [products, setProducts] = useRecoilState(productAtom);
    const [cart, setCart] = useRecoilState(cartAtom);
    const resetCart = useResetRecoilState(cartAtom);

    const numInCart = (product) => {
        return cart.filter(x => (x.id == product.id)).length;
    };

    const addToCart = (product) => {
        setCart([...cart, product]);
    };

    const removeFromCart = (product) => {
        var arr = [...cart];
        let idx = cart.findIndex(x => x.id == product.id);
        arr.splice(idx, 1);
        setCart(arr);
    };

    const handleItemPress = (product) => {
        numInCart(product) == 0
            ? addToCart(product)
            : removeFromCart(product);
    };

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
    };

    useEffect(() => {
        getProducts();
    }, [settings.productFilter]);

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
                        <Text numberOfLines={2} ellipsizeMode='tail' style={{ fontSize: settings?.model == 'K2_A13' ? 22 : 14 }}>{item.name}</Text>
                        <Text style={{ fontSize: settings?.model == 'K2_A13' ? 22 : 18, fontWeight: 'bold', marginTop: 10 }}>{Utils.displayPrice(item.default_price.unit_amount / 100, settings.currency)}</Text>
                    </View>
                    <View>
                        {numInCart(item) == 0
                            ? <FontAwesomeIcon icon={faPlusCircle} style={{ color: '#36455A' }} size={22} />
                            : <FontAwesomeIcon icon={faCheckCircle} style={{ color: colors.success }} size={22} />
                        }
                    </View>
                </View>
            </Pressable>
        );
    };

    const styles = {
        header: {
            flexDirection: 'column',
            height: '15%',
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
            justifyContent: 'flex-end',
            marginHorizontal: "auto",
        }
    };

    return (
        <View style={css.container}>
            <Pressable delayLongPress={2000} onLongPress={() => setModalVisible(true)} style={styles.header}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Image
                        style={[styles.logo, { width: 180, marginTop: 10 }]}
                        source={{
                            uri: themes[settings.theme]?.logoDark || 'https://stripe360.stripedemos.com/logos/press_dark.png'
                        }}
                    />
                </View>
            </Pressable>
            <View style={styles.kiosk}>
                {!refreshing && <FlatList
                    data={products}
                    numColumns={props.columns}
                    renderItem={ProductCard}
                    keyExtractor={(product) => product.id}
                />}
            </View>
            <View style={styles.footer}>
                <View style={[css.buttons, { gap: 50 }]}>
                    <Button
                        action={resetCart}
                        color={colors.primary}
                        icon={faTrash}
                        text="Reset Cart"
                        large={true}
                    />
                    <Button
                        action={goToCheckout}
                        color={colors.primary}
                        icon={faCreditCard}
                        text="Go to Checkout"
                        large={true}
                    />
                </View>
            </View>
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}>
                <View style={css.centeredView}>
                    <View style={[css.modalView, css.shadow, { marginTop: 10, height: 480, width: 500, paddingBottom: 0 }]}>
                        <Settings hideMenu={true} />
                        <Pressable style={{ position: 'absolute', right: 10, top: 10 }} onPress={() => setModalVisible(false)}>
                            <FontAwesomeIcon icon={faXmark} color={colors.primary} size={18} />
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    );
};
