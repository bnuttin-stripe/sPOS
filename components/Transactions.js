import { React, useState, useEffect } from 'react';
import { Text, Image, View, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCreditCard, faDeleteLeft } from '@fortawesome/pro-light-svg-icons';
import { faStripe } from '@fortawesome/free-brands-svg-icons';
import * as Utils from '../utilities';
import { useStripeTerminal } from '@stripe/stripe-terminal-react-native';
import { height, width } from '@fortawesome/free-brands-svg-icons/fa42Group';
import Spinner from 'react-native-loading-spinner-overlay';

const row = (pi) => {
    return (
        <View style={styles.row} key={pi.id}>
            <Text style={styles.rowText}>{pi.id} {pi.status}</Text>
        </View>
    )
}

export default Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const getTransactions = async () => {
        setIsLoading(true);
        const response = await fetch(`https://western-honey-chamomile.glitch.me/transactions`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const data = await response.json();
        setTransactions(data);
        setIsLoading(false);
    };

    useEffect(() => {
        getTransactions();
    }, []);

    return (
        <View style={styles.container}>
            {isLoading && <View style={styles.loader}>
                <ActivityIndicator size="large" color="#425466" />
            </View>}
            {!isLoading &&
                <ScrollView>
                    {transactions.map((pi) => row(pi))}
                </ScrollView>}
        </View>

    )
}

const styles = {
    loader: {
        justifyContent: 'center',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    row: {
        justifyContent: 'flex-end',
        alignItems: 'flex-start',
        width: '100%',
        height: 20,
        marginBottom: 4,
        borderWidth: 1,
        borderRadius: 5,
    },
    rowText: {
        fontSize: 18
    }
}
