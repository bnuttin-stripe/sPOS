import { React, useState, useEffect } from 'react';
import { Text, View, Pressable, ScrollView, RefreshControl } from 'react-native';
import { DataTable } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import { useRecoilState, useRecoilValue } from 'recoil';
import { customerAtom, settingsAtom } from '../atoms';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPlus } from '@fortawesome/pro-solid-svg-icons';

import * as Utils from '../utilities';
import { css, colors } from '../styles';

export default Customers = () => {
    const navigation = useNavigation();
    const settings = useRecoilValue(settingsAtom);

    const [refreshing, setRefreshing] = useState(false);
    const [customers, setCustomers] = useRecoilState(customerAtom);

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

    const Row = (customer) => {
        return (
            <Pressable key={customer.id} onPress={() => navigation.navigate("App", { page: "Customer", id: customer.id })}>
                <DataTable.Row>
                    <DataTable.Cell style={[css.cell, { flex: 1 }]}>
                        <Text style={css.defaultText}>
                            {customer.name}
                        </Text>
                    </DataTable.Cell>
                    <DataTable.Cell style={[css.cell, { flex: 2 }]}>
                        <Text style={css.defaultText}>
                            {customer.email}
                        </Text>
                    </DataTable.Cell>
                    <DataTable.Cell numeric style={[css.cell, { flex: 1 }]}>
                        <Text style={css.defaultText}>
                            {Utils.displayPrice(customer.ltv / 100, 'usd')}
                        </Text>
                    </DataTable.Cell>
                </DataTable.Row>
            </Pressable >
        )
    }

    return (
        <View style={[css.container, { padding: 0 }]}>
            <DataTable>
                <DataTable.Header style={css.tableHeader}>
                    <DataTable.Title style={[css.cell, { flex: 1 }]}>
                        <Text style={css.defaultText}>
                            Name
                        </Text>
                    </DataTable.Title>
                    <DataTable.Title style={[css.cell, { flex: 2 }]}>
                        <Text style={css.defaultText}>
                            Email
                        </Text>
                    </DataTable.Title>
                    <DataTable.Title numeric style={[css.cell, { flex: 1 }]}>
                        <Text style={css.defaultText}>
                            LTV
                        </Text>
                    </DataTable.Title>
                </DataTable.Header>
                <ScrollView
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={getCustomers}
                            progressViewOffset={150}
                            colors={['white']}
                            progressBackgroundColor={colors.primary}
                        />
                    }
                >
                    {customers.length > 0 && customers.map && customers.map((customer) => Row(customer))}
                </ScrollView>
            </DataTable>

            <Pressable style={[css.floatingIcon, { left: 20, bottom: 20, backgroundColor: colors.primary }]}
                onPress={() => navigation.navigate("App", { page: "CustomerEntry" })}>
                <FontAwesomeIcon icon={faPlus} color={'white'} size={18} />
            </Pressable>
        </View>
    )
}
