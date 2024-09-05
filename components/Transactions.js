import { React, useState, useEffect } from 'react';
import { Text, View, Pressable, ScrollView, RefreshControl, Vibration } from 'react-native';
import * as Utils from '../utilities';
import { DataTable } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useRecoilState, useRecoilValue } from 'recoil';
import { transactionAtom, settingsAtom } from '../atoms';
import { css, colors } from '../styles';

const Row = (pi, navigation) => {
    return (
        <Pressable key={pi.id} onPress={() => navigation.navigate("App", { page: "Transaction", pi: pi })}>
            <DataTable.Row>
                <DataTable.Cell style={{ flex: 0.8 }}>{pi.metadata?.orderNumber}</DataTable.Cell>
                <DataTable.Cell style={{ flex: 0.7 }} numeric>
                    <Text style={pi.latest_charge.amount_refunded > 0 ? { textDecorationLine: 'line-through' } : {}}>{Utils.displayPrice(pi.amount / 100, 'usd')}</Text><Text>     </Text>
                </DataTable.Cell>
                <DataTable.Cell style={{ flex: 1.2 }}>{Utils.displayDateTimeShort(pi.latest_charge.created)}</DataTable.Cell>
                <DataTable.Cell style={{ flex: 1 }}>
                    {/* {Utils.capitalize(pi.latest_charge.payment_method_details.card_present.brand)} {pi.latest_charge.payment_method_details.card_present.last4} - {pi.latest_charge.payment_method_details.card_present.exp_month}/{pi.latest_charge.payment_method_details.card_present.exp_year?.toString().slice(-2)} */}
                    {Utils.capitalize(pi.latest_charge.payment_method_details.card_present.brand)} {pi.latest_charge.payment_method_details.card_present.last4}
                </DataTable.Cell>
            </DataTable.Row>
        </Pressable >
    )
}

export default Transactions = (props) => {
    const [transactions, setTransactions] = useRecoilState(transactionAtom);
    const settings = useRecoilValue(settingsAtom);
    const navigation = useNavigation();
    const [refreshing, setRefreshing] = useState(false);

    const getTransactions = async () => {
        setRefreshing(true);
        const response = await fetch(settings.backendUrl + '/transactions', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const data = await response.json();
        setTransactions(data);
        setRefreshing(false);
    };

    useEffect(() => {
        getTransactions();
    }, []);

    return (
        <View style={[css.container, {padding: 0}]}>
            <DataTable>
                <DataTable.Header style={css.tableHeader}>
                    <DataTable.Title style={{ flex: 0.8 }}>Order ID</DataTable.Title>
                    <DataTable.Title style={{ flex: 0.7 }} numeric>Amount     </DataTable.Title>
                    <DataTable.Title style={{ flex: 1.2 }}>Date</DataTable.Title>
                    <DataTable.Title style={{ flex: 1 }}>Payment Method</DataTable.Title>
                </DataTable.Header>
                <ScrollView 
                    refreshControl={
                        <RefreshControl
                          refreshing={refreshing}
                          onRefresh={getTransactions}
                          progressViewOffset={150}
                          colors={['white']}
                          progressBackgroundColor={colors.slate}
                        />
                      }
                    >
                    {transactions.length > 0 && transactions.map && transactions.map((pi) => Row(pi, navigation))}
                </ScrollView> 
            </DataTable>
        </View>

    )
}
