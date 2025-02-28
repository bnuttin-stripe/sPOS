import { React, useEffect } from 'react';
import { Text, Image, View, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useRecoilValue } from 'recoil';
import { settingsAtom, cartAtom, currentCustomerAtom, themesAtom } from '../atoms';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCalculator, faGrid, faList, faUser, faGear, faBox, faCartShopping, faCartCircleCheck } from '@fortawesome/pro-solid-svg-icons';

import * as Utils from '../utilities';
import { css } from '../styles';

import StatusBar from './StatusBar';

export default Header = (props) => {
    const navigation = useNavigation();
    const settings = useRecoilValue(settingsAtom);
    const themes = useRecoilValue(themesAtom);
    const colors = themes[settings.theme]?.colors || themes['default'].colors;
    const cart = useRecoilValue(cartAtom);
    const page = props.page == undefined
        ? settings.showCalculator ? 'Calculator' : 'Products'
        : props.page;

    const goTo = (page) => {
        navigation.navigate('App', { page: page });
    };

    const styles = {
        topBanner: {
            flexDirection: 'column',
            backgroundColor: colors.banner,
            height: '15%',
            padding: 10,
            width: '100%',
        },
        logo: {
            flex: 1,
            resizeMode: 'contain',
        },
        header: {
            width: '100%',
            paddingTop: 15,
            paddingLeft: 20,
            paddingRight: 20,
            paddingBottom: 10,
            flexDirection: 'row',
            justifyContent: 'space-between',
            borderBottomWidth: 2,
            borderBottomColor: colors.primary,
            height: '10%'
        },
        tab: {
            flexDirection: 'column',
            alignItems: 'center',
        },
        tabSelected: {
            flexDirection: 'column',
            alignItems: 'center',
            borderBottomWidth: 2,
            marginBottom: -10,
            borderBottomColor: colors.primary,
        },
        icon: {
            marginBottom: 10,
            color: colors.textMuted,
        },
        iconActive: {
            marginBottom: 10,
            color: colors.primary,
        },
        title: {
            color: colors.textMuted,
            fontSize: 13,
        },
        titleActive: {
            color: colors.primary,
            fontSize: 13,
        },
    };

    return (
        <>
            <View style={styles.topBanner}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Image
                        style={[styles.logo, { width: 180, marginTop: 10 }]}
                        source={{
                            uri: themes[settings.theme]?.logoLight || themes['default'].logoLight
                        }}
                    />
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                    <Pressable style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }} onPress={() => goTo('Settings')}>
                        <Text style={{ color: colors.bannerText, fontSize: 10, marginTop: 2 }}>Powered by</Text>
                        <Image source={require('../assets/stripe.png')} tintColor={colors.bannerText} style={{ width: 60, height: 19, marginLeft: -12, marginRight: -16, marginBottom: -13, resizeMode: 'contain' }} />
                    </Pressable>
                </View>
                <StatusBar paymentStatus={props.paymentStatus} />
            </View>
            <View style={styles.header}>
                {settings.showCalculator &&
                    <Pressable style={page == 'Calculator' ? styles.tabSelected : styles.tab} onPress={() => goTo('Calculator')}>
                        <FontAwesomeIcon icon={faCalculator} style={page == 'Calculator' ? styles.iconActive : styles.icon} size={22} />
                        <Text style={page == 'Calculator' ? styles.titleActive : styles.title}>Calculator</Text>
                    </Pressable>
                }
                <Pressable style={page == 'Products' ? styles.tabSelected : styles.tab} onPress={() => goTo('Products')}>
                    <FontAwesomeIcon icon={faBox} style={page == 'Products' ? styles.iconActive : styles.icon} size={22} />
                    <Text style={page == 'Products' ? styles.titleActive : styles.title}>Products</Text>
                </Pressable>
                <Pressable style={page == 'Checkout' ? styles.tabSelected : styles.tab} onPress={() => goTo('Checkout')}>
                    <FontAwesomeIcon icon={cart.length > 0 ? faCartCircleCheck : faCartShopping} style={page == 'Checkout' ? styles.iconActive : styles.icon} size={22} />
                    <Text style={page == 'Checkout' ? styles.titleActive : styles.title}>Cart</Text>
                </Pressable>
                <Pressable style={page == 'Transactions' ? styles.tabSelected : styles.tab} onPress={() => goTo('Transactions')}>
                    <FontAwesomeIcon icon={faList} style={page == 'Transactions' ? styles.iconActive : styles.icon} size={22} />
                    <Text style={page == 'Transactions' ? styles.titleActive : styles.title}>Transactions</Text>
                </Pressable>
                <Pressable style={['Customers', 'Customer', 'CustomerEntry'].includes(page) ? styles.tabSelected : styles.tab} onPress={() => goTo('Customers')}>
                    <FontAwesomeIcon icon={faUser} style={page == 'Customers' ? styles.iconActive : styles.icon} size={22} />
                    <Text style={page == 'Customers' ? styles.titleActive : styles.title}>Customers</Text>
                </Pressable>
            </View>
        </>
    );
}


