import { React } from 'react';
import { Text, Image, View, Pressable, Vibration } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useRecoilValue } from 'recoil';
import { settingsAtom, cartAtom } from '../atoms';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCalculator, faGrid, faList, faUser, faGear, faBox } from '@fortawesome/pro-solid-svg-icons';

import * as Utils from '../utilities';
import { css, colors } from '../styles';

import BatteryIndicator from './BatteryIndicator';

export default Header = (props) => {
    const navigation = useNavigation();

    const goTo = (page) => {
        // Vibration.vibrate(250);
        navigation.navigate('App', { page: page })
    }

    return (
        <>
            <View style={styles.topBanner}>
                <View style={{ flex: 2, justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                    <Image source={require('../assets/logo.png')} style={[styles.logo, { width: 100, marginLeft: 15 }]} />
                </View>
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end', marginRight: -15 }}>
                    <Text style={{ color: colors.white }}>Powered by</Text>
                    <Image source={require('../assets/stripe.png')} style={[styles.logo, { height: 24, marginBottom: -3, marginLeft: -10 }]} />
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
        flexDirection: 'row',
        backgroundColor: colors.primary,
        height: 100,
        padding: 10,
    },
    logo: {
        flex: 1,
        resizeMode: 'contain'
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
