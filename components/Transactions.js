import { React, useState, useEffect } from 'react';
import { Text, Image, View, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import * as Utils from '../utilities';
import { DataTable } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

const Row = (pi, navigation) => {
    return (
        <Pressable key={pi.id} onPress={() => navigation.navigate("App", { page: "Transaction", pi: pi})}>
            <DataTable.Row style={styles.row}>
                <DataTable.Cell style={{ flex: 0.8 }}>{pi.metadata?.orderNumber}</DataTable.Cell>
                <DataTable.Cell style={{ flex: 0.7 }}>
                    <Text style={pi.latest_charge.amount_refunded > 0 ? {textDecorationLine: 'line-through'} : {}}>{Utils.displayPrice(pi.amount / 100, 'usd')}</Text>
                </DataTable.Cell>
                <DataTable.Cell style={{ flex: 1.2 }}>{Utils.displayDateTimeShort(pi.latest_charge.created)}</DataTable.Cell>
                <DataTable.Cell style={{ flex: 1.2 }}>
                    {Utils.capitalize(pi.latest_charge.payment_method_details.card_present.brand)} {pi.latest_charge.payment_method_details.card_present.last4} - {pi.latest_charge.payment_method_details.card_present.exp_month}/{pi.latest_charge.payment_method_details.card_present.exp_year?.toString().slice(-2)}
                </DataTable.Cell>
            </DataTable.Row>
        </Pressable >
    )
}

export default Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigation = useNavigation();
    
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
                <DataTable>
                    <DataTable.Header style={styles.header}>
                        <DataTable.Title style={{ flex: 0.8 }}>Order ID</DataTable.Title>
                        <DataTable.Title style={{ flex: 0.7 }}>Amount</DataTable.Title>
                        <DataTable.Title style={{ flex: 1.2 }}>Date</DataTable.Title>
                        <DataTable.Title style={{ flex: 1.2 }}>Payment Method</DataTable.Title>
                    </DataTable.Header>
                    <ScrollView style={styles.list}
                    // onScroll={(event) => {
                    //     const scrolling = event.nativeEvent.contentOffset.y;
                    //     if (scrolling == 0) getTransactions();
                    // }}
                    // scrollEventThrottle={16}
                    >
                        {transactions.map((pi) => Row(pi, navigation))}
                    </ScrollView>
                </DataTable>
            }
        </View>

    )
}

const styles = {
    loader: {
        justifyContent: 'center',
        flexDirection: 'column',
        height: '100%'
    },
    list: {
        width: '100%',
        flex: 1
    },
    container: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-start',
        // marginTop: 20,
    },
    header: {
        borderBottomWidth: 2,
    },
    row: {
        // alignSelf: 'baseline',
        // fontSize: 14,
        // flex: 1,
        // borderWidth: 1
        // justifyContent: 'center',
        // flexDirection: 'row',
        // alignItems: 'flex-end',

    }

}
