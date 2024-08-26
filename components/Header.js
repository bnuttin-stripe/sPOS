import { React, useState, useEffect } from 'react';
import { Text, Image, View, Pressable, ActivityIndicator } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCalculator, faGrid, faList, faUser, faGear, faQrcode } from '@fortawesome/pro-solid-svg-icons';
import { useNavigation } from '@react-navigation/native';

export default Header = (props) => {
    const navigation = useNavigation();

    return (
        <>
            <View style={styles.topBanner}>
                <Image source={require('../assets/stripe.png')} style={styles.logo} />
            </View>
            <View style={styles.header}>
                <Pressable style={props.page == 'Calculator' ? styles.tabSelected : styles.tab} onPress={() => navigation.navigate('App', { page: 'Calculator' })}>
                    <FontAwesomeIcon icon={faCalculator} style={styles.icon} size={26} />
                    <Text style={styles.title}>Calculator</Text>
                </Pressable>
                <View  style={props.page == 'Catalog' ? styles.tabSelected : styles.tab} >
                    <FontAwesomeIcon icon={faGrid} style={styles.icon} size={26} />
                    <Text style={styles.title}>Catalog</Text>
                </View>
                <Pressable style={props.page == 'Transactions' ? styles.tabSelected : styles.tab}  onPress={() => navigation.navigate('App', { page: 'Transactions' })}>
                    <FontAwesomeIcon icon={faList} style={styles.icon} size={26} />
                    <Text style={styles.title}>Transactions</Text>
                </Pressable>
                {/* <View  style={props.page == 'Customers' ? styles.tabSelected : styles.tab} >
                    <FontAwesomeIcon icon={faUser} style={styles.icon} size={26} />
                    <Text style={styles.title}>Customers</Text>
                </View>
                <View  style={props.page == 'Settings' ? styles.tabSelected : styles.tab} >
                    <FontAwesomeIcon icon={faGear} style={styles.icon} size={26} />
                    <Text style={styles.title}>Settings</Text>
                </View> */}
                <Pressable  style={props.page == 'Scanner' ? styles.tabSelected : styles.tab}  onPress={() => navigation.navigate('App', { page: 'Scanner' })}>
                    <FontAwesomeIcon icon={faQrcode} style={styles.icon} size={26} />
                    <Text style={styles.title}>Scan</Text>
                </Pressable>
            </View>
        </>
    )
}

const styles = {
    topBanner: {
        // flex: 1,
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#425466',
        width: '100%',
        height: 60
        // padding: 10
    },
    logo: {
        flex: 1,
        // width: 40,
        height: 40,
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
        alignItems: 'top',
        borderTopWidth: 2,
        borderTopColor: '#425466',
        borderBottomWidth: 2,
        borderBottomColor: '#425466',
    },
    icon: {
        marginBottom: 10,
        color: '#425466',
    },
    tab: {
        flexDirection: 'column',
        alignItems: 'center',
    },
    tabSelected: {
        flexDirection: 'column',
        alignItems: 'center',
        borderBottomWidth: 3,
        marginBottom: -10,
        borderBottomColor: '#425466',
    },
    title: {
        // fontSize: 20,
        color: '#425466',
    },
};
