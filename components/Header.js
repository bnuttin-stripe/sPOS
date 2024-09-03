import { React } from 'react';
import { Text, Image, View, Pressable,  Vibration } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCalculator, faGrid, faList, faUser, faGear, faBarcodeRead } from '@fortawesome/pro-solid-svg-icons';
import { useNavigation } from '@react-navigation/native';
import { useRecoilValue } from 'recoil';
import { settingsAtom, cartAtom } from '../atoms';
import { css, colors } from '../styles';

import BatteryIndicator from './BatteryIndicator';

export default Header = (props) => {
    const navigation = useNavigation();

    const goTo = (page) => {
        Vibration.vibrate(250);
        navigation.navigate('App', { page: page })
    }

    return (
        <>
            <View style={styles.topBanner}>
                <Image source={require('../assets/stripe.png')} style={styles.logo} />
                {/* <BatteryIndicator /> */}
            </View>
            <View style={styles.header}>
                <Pressable style={props.page == 'Calculator' ? styles.tabSelected : styles.tab} onPress={() => goTo('Calculator')}>
                    <FontAwesomeIcon icon={faCalculator} style={styles.icon} size={26} />
                    <Text style={styles.title}>Calculator</Text>
                </Pressable>
                <Pressable  style={props.page == 'Products' ? styles.tabSelected : styles.tab} onPress={() => goTo('Products')}>
                    <FontAwesomeIcon icon={faGrid} style={styles.icon} size={26} />
                    <Text style={styles.title}>Products</Text>
                </Pressable>
                <Pressable style={props.page == 'Transactions' ? styles.tabSelected : styles.tab} onPress={() => goTo('Transactions')}>
                    <FontAwesomeIcon icon={faList} style={styles.icon} size={26} />
                    <Text style={styles.title}>Transactions</Text>
                </Pressable>
                <Pressable  style={props.page == 'Settings' ? styles.tabSelected : styles.tab} onPress={() => goTo('Settings')}>
                    <FontAwesomeIcon icon={faGear} style={styles.icon} size={26} />
                    <Text style={styles.title}>Settings</Text>
                </Pressable>
            </View>
        </>
    )
}

const styles = {
    topBanner: {
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.slate,
        width: '100%',
        height: 60,
    },
    logo: {
        flex: 1,
        height: 42,
        resizeMode: 'contain'
    },
    header: {
        width: '100%',
        paddingTop: 20,
        paddingLeft: 20,
        paddingRight: 20,
        paddingBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 2,
        borderBottomColor: colors.slate,
    },
    icon: {
        marginBottom: 10,
        color: colors.slate,
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
        borderBottomColor: colors.slate,
    },
    title: {
        color: colors.slate,
    },
};
