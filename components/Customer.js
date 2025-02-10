import { React, useState, useEffect } from 'react';
import { Text, TextInput, View, Pressable, ScrollView, ActivityIndicator, Vibration } from 'react-native';

import { useRecoilValue, useRecoilState } from 'recoil';
import { settingsAtom, themesAtom, refresherAtom } from '../atoms';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faList, faUser, faCalendar, faArrowsRotate } from '@fortawesome/pro-solid-svg-icons';

import * as Utils from '../utilities';
import { css, themeColors } from '../styles';

import Transactions from './Transactions';
import Subscriptions from './Subscriptions';

export default Customer = (props) => {
    const settings = useRecoilValue(settingsAtom);
    const themes = useRecoilValue(themesAtom);
    const colors = themes[settings.theme]?.colors;
    const backendUrl = process.env.EXPO_PUBLIC_API_URL;
    const [refresher, setRefresher] = useRecoilState(refresherAtom);

    const [isLoading, setIsLoading] = useState(false);
    const [customer, setCustomer] = useState({});
    const [subscriptions, setSubscriptions] = useState([]);

    const getCustomer = async (silent) => {
        if (!silent) setIsLoading(true);
        const response = await fetch(backendUrl + '/customer/' + props.id, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Account': settings.account
            },
        });
        const data = await response.json();
        setCustomer(data);
        if (!silent) setIsLoading(false);
    };


    const refreshPage = () => {
        setRefresher({ ...refresher, subscriptions: Math.random(), transactions: Math.random() });
    };

    useEffect(() => {
        getCustomer(false);
        // getSubscriptions();
    }, []);

    return (
        <View style={css.container}>
            <ScrollView>

                {false && isLoading && <View style={css.loader}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>}

                {
                    <>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                            <FontAwesomeIcon icon={faUser} color={colors.primary} size={18} />
                            <Text style={{ fontSize: 20, fontWeight: 'bold', marginLeft: 5 }}>Customer</Text>
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ flexDirection: 'column', flex: 1 }}>
                                <Text style={css.spacedTextMuted}>Customer ID</Text>
                                <Text style={css.spacedTextMuted}>Name</Text>
                                <Text style={css.spacedTextMuted}>Email</Text>
                                <Text style={css.spacedTextMuted}>LTV</Text>
                            </View>
                            <View style={{ flexDirection: 'column', flex: 2 }}>
                                <Text style={css.spacedText}>{customer?.id}</Text>
                                <Text style={css.spacedText}>{customer?.name}</Text>
                                <Text style={css.spacedText}>{customer?.email}</Text>
                                <Text style={css.spacedText}>{Utils.displayPrice(customer?.ltv / 100, settings.currency)}</Text>
                            </View>
                        </View>

                        {/* <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, marginTop: 20 }}>
                            <FontAwesomeIcon icon={faCalendar} color={colors.primary} size={18} />
                            <Text style={{ fontSize: 20, fontWeight: 'bold', marginLeft: 5 }}>Subscriptions</Text>
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ flexDirection: 'column', flex: 1 }}>
                                <Text style={css.spacedText}>Subscriptions</Text>
                            </View>
                            <View style={{ flexDirection: 'column', flex: 2 }}>
                                <Text style={css.spacedText}>{subscriptions.length}</Text>
                            </View>
                        </View> */}
                    </>
                }

                <View style={{ flex: 1, marginLeft: -15, marginRight: -15, marginBottom: 0 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, marginTop: 20, marginLeft: 15, marginRight: 15 }}>
                        <FontAwesomeIcon icon={faCalendar} color={colors.primary} size={18} />
                        <Text style={{ fontSize: 20, fontWeight: 'bold', marginLeft: 5 }}>Subscriptions</Text>
                    </View>
                    <Subscriptions customer={props.id} showRefresh={false} />
                    {/* <View style={{height: 100}}></View> */}
                </View>

                <View style={{ flex: 1, marginLeft: -15, marginRight: -15, marginBottom: 0 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, marginTop: 20, marginLeft: 15, marginRight: 15 }}>
                        <FontAwesomeIcon icon={faList} color={colors.primary} size={18} />
                        <Text style={{ fontSize: 20, fontWeight: 'bold', marginLeft: 5 }}>Transactions</Text>
                    </View>
                    <Transactions customer={props.id} refresh={getCustomer} setup={props.setup} showRefresh={false} />
                    <View style={{ height: 100 }}></View>
                </View>


            </ScrollView>
            <View style={css.floatingMenu}>
                <View style={css.buttons}>
                    <Button
                        action={refreshPage}
                        color={colors.secondary}
                        icon={faArrowsRotate}
                        large={false}
                        refreshing={isLoading}
                    />
                </View>
            </View>
        </View>
    );
}

