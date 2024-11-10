import { React, useState, useEffect } from 'react';
import { Text, TextInput, View, Pressable, ScrollView, ActivityIndicator, Vibration } from 'react-native';

import { useRecoilValue } from 'recoil';
import { settingsAtom } from '../atoms';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowTurnLeft } from '@fortawesome/pro-solid-svg-icons';

import * as Utils from '../utilities';
import { css, colors } from '../styles';

import Transactions from './Transactions';

export default Customer = (props) => {
    const settings = useRecoilValue(settingsAtom);

    const [isLoading, setIsLoading] = useState(false);
    const [customer, setCustomer] = useState({});

    const getCustomer = async (silent) => {
        if (!silent) setIsLoading(true);
        const response = await fetch(settings.backendUrl + '/customer/' + props.id, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const data = await response.json();
        setCustomer(data);
        if (!silent) setIsLoading(false);
    };

    useEffect(() => {
        getCustomer(false);
    }, []);

    return (
        <View style={css.container}>
            {isLoading && <View style={css.loader}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>}

            {!isLoading &&
                <View style={{ flexDirection: 'row' }}>
                    <View style={{ flexDirection: 'column', flex: 1 }}>
                        <Text style={css.spacedText}>Customer ID</Text>
                        <Text style={css.spacedText}>Name</Text>
                        <Text style={css.spacedText}>Email</Text>
                        <Text style={css.spacedText}>LTV</Text>
                    </View>
                    <View style={{ flexDirection: 'column', flex: 2 }}>
                        <Text style={css.spacedText}>{customer.id}</Text>
                        <Text style={css.spacedText}>{customer.name}</Text>
                        <Text style={css.spacedText}>{customer.email}</Text>
                        <Text style={css.spacedText}>{Utils.displayPrice(customer.ltv / 100, settings.currency)}</Text>
                    </View>
                </View>
            }

            <View style={{ flex: 1, marginTop: 20, marginLeft: -15, marginRight: -15, marginBottom: -20 }}>
                <Transactions customer={props.id} refresh={getCustomer}/>
            </View>

        </View>
    )
}

