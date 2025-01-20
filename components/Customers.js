import { React, useState, useEffect } from 'react';
import { Text, View, Pressable, ScrollView, ActivityIndicator, TextInput } from 'react-native';
import { DataTable } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import { useRecoilState, useRecoilValue } from 'recoil';
import { settingsAtom, themesAtom, customersAtom, searchedCustomersAtom, currentCustomerAtom } from '../atoms';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPlus, faArrowsRotate, faMagnifyingGlass, faXmark, faXmarkCircle } from '@fortawesome/pro-solid-svg-icons';

import Button from './Button';

import * as Utils from '../utilities';
import { css, themeColors } from '../styles';

export default Customers = (props) => {
    const navigation = useNavigation();
    const settings = useRecoilValue(settingsAtom);
    const themes = useRecoilValue(themesAtom);
    const colors = themes[settings.theme]?.colors;
    
    const backendUrl = process.env.EXPO_PUBLIC_API_URL;

    const [refreshing, setRefreshing] = useState(false);
    const [customers, setCustomers] = useRecoilState(customersAtom);
    const [searchedCustomers, setSearchedCustomers] = useRecoilState(searchedCustomersAtom);
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
            ? backendUrl + '/customers/ltv/' + search
            : backendUrl + '/customers/noltv/' + search;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Account': settings.account
            },
        });
        const data = await response.json();
        props.search
            ? setSearchedCustomers(data)
            : setCustomers(data);
        setRefreshing(false);
    };

    useEffect(() => {
        getCustomers('')
    }, []);

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
                        <Text style={css.defaultText} numberOfLines={1} ellipsizeMode='tail'>
                            {customer.name}
                        </Text>
                    </DataTable.Cell>
                    <DataTable.Cell style={[css.cell, { flex: 1.8 }]}>
                        <Text style={css.defaultText} numberOfLines={1} ellipsizeMode='middle'>
                            {customer.email}
                        </Text>
                    </DataTable.Cell>
                    {props.showLTV && <DataTable.Cell numeric style={[css.cell, { flex: .4 }]}>
                        <Text style={css.defaultText}>
                            {Utils.displayPrice(customer.ltv / 100, settings.currency, true)}
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
                        <FontAwesomeIcon icon={faXmark} size={24} style={{ color: colors.primary, marginLeft: 10 }} />
                    </Pressable>}
                </View>}
            <DataTable>
                {(props.search && searchedCustomers.length > 0 || !props.search) &&
                    <DataTable.Header style={css.tableHeader}>
                        <DataTable.Title style={[css.cell, { flex: 1 }]}>
                            <Text style={css.defaultText}>
                                Name
                            </Text>
                        </DataTable.Title>
                        <DataTable.Title style={[css.cell, { flex: 1.8 }]}>
                            <Text style={css.defaultText}>
                                Email
                            </Text>
                        </DataTable.Title>
                        {props.showLTV && <DataTable.Title numeric style={[css.cell, { flex: 0.4 }]}>
                            <Text style={css.defaultText}>
                                LTV
                            </Text>
                        </DataTable.Title>}
                    </DataTable.Header>
                }
                <ScrollView>
                    {props.search
                        ? searchedCustomers.length > 0 && searchedCustomers.map && searchedCustomers.map((customer) => Row(customer))
                        : customers.length > 0 && customers.map && customers.map((customer) => Row(customer))
                    }
                </ScrollView>
            </DataTable>

            {props.showIcons && <View style={css.floatingMenu}>
                <View style={css.buttons}>
                    <Button
                        action={getCustomers}
                        color={colors.secondary}
                        icon={faArrowsRotate}
                        // text="Refresh"
                        large={false}
                        refreshing={refreshing}
                    />
                    <Button
                        action={searchActive ? closeSearch : openSearch}
                        color={searchActive ? colors.primary : colors.secondary}
                        icon={faMagnifyingGlass}
                        text="Search"
                        large={false}
                    // refreshing={refreshing}
                    />
                    <Button
                        action={() => navigation.navigate("App", { page: "CustomerEntry", origin: "Customers" })}
                        color={colors.primary}
                        icon={faPlus}
                        text="New"
                        large={false}
                    // refreshing={refreshing}
                    />
                </View>
            </View>}
        </View>
    )
}
