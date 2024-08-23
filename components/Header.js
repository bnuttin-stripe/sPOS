import { React, useState, useEffect } from 'react';
import { Text, Image, View, Pressable } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCreditCard } from '@fortawesome/pro-light-svg-icons';
import { faCalculator, faGrid, faList, faUser, faGear } from '@fortawesome/pro-solid-svg-icons';
import { faStripe } from '@fortawesome/free-brands-svg-icons';
import * as Utils from '../utilities';
import { useStripeTerminal } from '@stripe/stripe-terminal-react-native';
import { useNavigation } from '@react-navigation/native';

export default Header = (props) => {
    const navigation = useNavigation();

    return (
        <>
            <View style={styles.topBanner}>
                <Image source={require('../assets/stripe.png')} style={styles.logo} />
            </View>
            <View style={styles.header}>
                <Pressable style={styles.tab} onPress={() => navigation.navigate('App', { page: 'Calculator' })}>
                    <FontAwesomeIcon icon={faCalculator} style={styles.icon} size={26} />
                    <Text style={styles.title}>Calculator</Text>
                </Pressable>
                <View style={styles.tab}>
                    <FontAwesomeIcon icon={faGrid} style={styles.icon} size={26} />
                    <Text style={styles.title}>Catalog</Text>
                </View>
                <Pressable style={styles.tab} onPress={() => navigation.navigate('App', { page: 'Transactions' })}>
                    <FontAwesomeIcon icon={faList} style={styles.icon} size={26} />
                    <Text style={styles.title}>Transactions</Text>
                </Pressable>
                <View style={styles.tab}>
                    <FontAwesomeIcon icon={faUser} style={styles.icon} size={26} />
                    <Text style={styles.title}>Customers</Text>
                </View>
                <View style={styles.tab}>
                    <FontAwesomeIcon icon={faGear} style={styles.icon} size={26} />
                    <Text style={styles.title}>Settings</Text>
                </View>

                {/* <View style={styles.row}>
                <Pressable onPress={collectPM} style={[styles.tile, styles.large, { width: '100%', flexDirection: 'row', backgroundColor: '#FFBB00' }]}>
                    <FontAwesomeIcon icon={faCreditCard } color={'white'} size={26} />
                </Pressable>
            </View> */}

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
        width: 50,
        height: 50,
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
    title: {
        // fontSize: 20,
        color: '#425466',
    }

};
