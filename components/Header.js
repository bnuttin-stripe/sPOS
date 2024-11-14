import { React } from 'react';
import { Text, Image, View, Pressable, Vibration } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useRecoilValue } from 'recoil';
import { settingsAtom, cartAtom, currentCustomerAtom } from '../atoms';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCalculator, faGrid, faList, faUser, faGear, faBox } from '@fortawesome/pro-solid-svg-icons';

import * as Utils from '../utilities';
import { css, colors } from '../styles';

import BatteryIndicator from './BatteryIndicator';

export default Header = (props) => {
    const navigation = useNavigation();
    const currentCustomer = useRecoilValue(currentCustomerAtom);

    const goTo = (page) => {
        // Vibration.vibrate(250);
        navigation.navigate('App', { page: page })
    }

    return (
        <>
            <View style={styles.topBanner}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Image source={require('../assets/logo.png')} style={[styles.logo, { width: 180, marginTop: 10 }]} />
                    <Text style={{color: 'white'}}>Customer: {currentCustomer?.name}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                    <Text style={{ color: colors.white, fontSize: 12 }}>Powered by</Text>
                    <Image source={require('../assets/stripe.png')} style={{width: 80, height: 20, marginLeft: -18, marginRight: -20, marginBottom: -3, resizeMode: 'contain'}} />
                </View>
                <BatteryIndicator />
            </View>
            <View style={styles.header}>
                <Pressable style={props.page == 'Calculator' ? styles.tabSelected : styles.tab} onPress={() => goTo('Calculator')}>
                    <FontAwesomeIcon icon={faCalculator} style={styles.icon} size={22} />
                    <Text style={styles.title}>Calculator</Text>
                </Pressable>
                <Pressable style={props.page == 'Products' ? styles.tabSelected : styles.tab} onPress={() => goTo('Products')}>
                    <FontAwesomeIcon icon={faBox} style={styles.icon} size={22} />
                    <Text style={styles.title}>Products</Text>
                </Pressable>
                <Pressable style={props.page == 'Transactions' ? styles.tabSelected : styles.tab} onPress={() => goTo('Transactions')}>
                    <FontAwesomeIcon icon={faList} style={styles.icon} size={22} />
                    <Text style={styles.title}>Transactions</Text>
                </Pressable>
                <Pressable style={props.page == 'Customers' ? styles.tabSelected : styles.tab} onPress={() => goTo('Customers')}>
                    <FontAwesomeIcon icon={faUser} style={styles.icon} size={22} />
                    <Text style={styles.title}>Customers</Text>
                </Pressable>
                <Pressable style={props.page == 'Settings' ? styles.tabSelected : styles.tab} onPress={() => goTo('Settings')}>
                    <FontAwesomeIcon icon={faGear} style={styles.icon} size={22} />
                    <Text style={styles.title}>Settings</Text>
                </Pressable>
            </View>
        </>
    )
}

const styles = {
    topBanner: {
        flexDirection: 'column',
        backgroundColor: colors.primary,
        height: 100,
        padding: 10,
        width: '100%',
    },
    logo: {
        flex: 1,
        resizeMode: 'contain',
        // backgroundColor: colors.white,
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
    },
    icon: {
        marginBottom: 10,
        color: colors.primary,
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
    title: {
        color: colors.primary,
    },
};
