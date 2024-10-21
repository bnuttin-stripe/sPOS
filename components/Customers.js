import { React, useState, useEffect } from 'react';
import { Text, View, Pressable, ScrollView, RefreshControl, StyleSheet, Alert } from 'react-native';
import * as Utils from '../utilities';
import { DataTable, shadow } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useRecoilState, useRecoilValue } from 'recoil';
import { customerAtom, settingsAtom } from '../atoms';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBarcodeRead, faXmark, faChevronRight, faPlus } from '@fortawesome/pro-light-svg-icons';
import { css, colors } from '../styles';

export default Customers = (props) => {
    const navigation = useNavigation();
    const [refreshing, setRefreshing] = useState(false);
    const [customers, setCustomers] = useRecoilState(customerAtom);
    const settings = useRecoilValue(settingsAtom);

    const Row = (customer) => {
        return (
            <Pressable key={customer.id} onPress={() => console.log(customer)}>
                <DataTable.Row>
                    <DataTable.Cell style={{ flex: 1, paddingTop: 8, paddingBottom: 8, paddingRight: 5 }}>
                        <Text>
                            {customer.name}
                        </Text>
                    </DataTable.Cell>
                    <DataTable.Cell style={{ flex: 1, paddingTop: 8, paddingBottom: 8, paddingRight: 5 }}>
                        <Text>
                            {customer.email}
                        </Text>
                    </DataTable.Cell>
                </DataTable.Row>
            </Pressable >
        )
    }

    const getCustomers = async () => {
        setRefreshing(true);
        const response = await fetch(settings.backendUrl + '/customers', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const data = await response.json();
        setCustomers(data);
        setRefreshing(false);
    };

    useEffect(() => {
        getCustomers();
    }, []);

    return (
        <View style={[css.container, { padding: 0 }]}>
            <DataTable style={{ flex: 1 }}>
                <DataTable.Header style={css.tableHeader}>
                    <DataTable.Title style={{ flex: 1 }}>Name</DataTable.Title>
                    <DataTable.Title style={{ flex: 1 }}>Email</DataTable.Title>
                </DataTable.Header>
                <ScrollView
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={getCustomers}
                            progressViewOffset={150}
                            colors={['white']}
                            progressBackgroundColor={colors.slate}
                        />
                    }
                >
                    {customers.length > 0 && customers.map && customers.map((customer) => Row(customer))}
                </ScrollView>
            </DataTable>

            <Pressable style={[css.floatingIcon, { left: 20, bottom: 20, backgroundColor: colors.yellow }]} onPress={() => navigation.navigate("App", { page: "CustomerEntry" })}>
                <FontAwesomeIcon icon={faPlus} color={'white'} size={18} />
            </Pressable>
        </View>
    )
}

const styles = {

}