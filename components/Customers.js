import { React, useState, useEffect } from 'react';
import { Text, View, Pressable, ScrollView, ActivityIndicator, TextInput } from 'react-native';
import { DataTable } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import { useRecoilState, useRecoilValue } from 'recoil';
import { customersAtom, settingsAtom, currentCustomerAtom } from '../atoms';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPlus, faArrowsRotate, faMagnifyingGlass, faXmark, faXmarkCircle } from '@fortawesome/pro-solid-svg-icons';

import * as Utils from '../utilities';
import { css, colors } from '../styles';

export default Customers = (props) => {
    const navigation = useNavigation();
    const settings = useRecoilValue(settingsAtom);

    const [refreshing, setRefreshing] = useState(false);
    const [customers, setCustomers] = useRecoilState(customersAtom);
    const [currentCustomer, setCurrentCustomer] = useRecoilState(currentCustomerAtom);

    const [searchActive, setSearchActive] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const openSearch = () => {
        setSearchActive(true);
        setSearchTerm('');
    }

    const closeSearch = () => {
        setSearchActive(false);
        setSearchTerm('');
        getCustomers('');
    }

    const getCustomers = async (search) => {
        setRefreshing(true);
        const url = props.showLTV
            ? settings.backendUrl + '/customers/ltv/' + search
            : settings.backendUrl + '/customers/noltv/' + search;
        const response = await fetch(url, {
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
        props.initialLoad
            ? getCustomers('')
            : setCustomers([]);
    }, [props.initialLoad]);

    useEffect(() => {
        setSearchActive(props.search);
    }, [props.search]);

    const customerAction = (customer) => {
        if (props.mode == 'details') {
            navigation.navigate("App", { page: "Customer", id: customer.id })
        }
        else {
            setCurrentCustomer(customer);
            props.onPick();
        }
    }

    const Row = (customer) => {
        return (
            <Pressable key={customer.id} onPress={() => customerAction(customer)}>
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
                    {props.showLTV && <DataTable.Cell numeric style={[css.cell, { flex: 1 }]}>
                        <Text style={css.defaultText}>
                            {Utils.displayPrice(customer.ltv / 100, settings.currency)}
                        </Text>
                    </DataTable.Cell>}
                </DataTable.Row>
            </Pressable >
        )
    }

    return (
        <View style={[css.container, { padding: 0 }]}>
            {searchActive &&
                <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10, marginBottom: -10 }}>
                    <TextInput
                        style={[css.input, { flex: 1, marginBottom: 0 }]}
                        inputMode="tel"
                        value={searchTerm}
                        placeholder="Phone number"
                        onChangeText={text => setSearchTerm(text)}
                        returnKeyType="search"
                        onSubmitEditing={event => getCustomers(event.nativeEvent.text)}
                    />
                    {props.showIcons && <Pressable onPress={closeSearch}>
                        <FontAwesomeIcon icon={faXmarkCircle} size={24} style={{ color: colors.primary, marginLeft: 10 }} />
                    </Pressable>}
                </View>}
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
                    {props.showLTV && <DataTable.Title numeric style={[css.cell, { flex: 1 }]}>
                        <Text style={css.defaultText}>
                            LTV
                        </Text>
                    </DataTable.Title>}
                </DataTable.Header>
                <ScrollView>
                    {customers.length > 0 && customers.map && customers.map((customer) => Row(customer))}
                </ScrollView>
            </DataTable>

            {props.showIcons &&
                <>
                    <Pressable style={[css.floatingIcon, { left: 20, bottom: 20, backgroundColor: colors.secondary }]} onPress={getCustomers}>
                        {refreshing
                            ? <ActivityIndicator size="small" color="white" />
                            : <FontAwesomeIcon icon={faArrowsRotate} color={'white'} size={18} />
                        }
                    </Pressable>
                    <Pressable style={[css.floatingIcon, { left: 80, bottom: 20, backgroundColor: searchActive ? colors.primary : colors.secondary }]} onPress={searchActive ? closeSearch : openSearch}>
                        <FontAwesomeIcon icon={faMagnifyingGlass} color={'white'} size={18} />
                    </Pressable>
                    <Pressable style={[css.floatingIcon, { left: 140, bottom: 20, backgroundColor: colors.primary }]}
                        onPress={() => navigation.navigate("App", { page: "CustomerEntry" })}>
                        <FontAwesomeIcon icon={faPlus} color={'white'} size={18} />
                    </Pressable>
                </>}
        </View>
    )
}
