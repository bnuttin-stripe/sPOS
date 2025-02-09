import { React, useState, useEffect } from 'react';
import { Text, View, Pressable, ScrollView, RefreshControl, Modal, ActivityIndicator } from 'react-native';
import { DataTable } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import { useRecoilState, useRecoilValue } from 'recoil';
import { subscriptionAtom, settingsAtom, themesAtom, refresherAtom } from '../atoms';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowsRotate, faXmark, faArrowRightArrowLeft, faBoxCheck, faBox, faCircleCheck, faCircleExclamation, faBan, faMagnifyingGlass } from '@fortawesome/pro-solid-svg-icons';

import Button from './Button';

import * as Utils from '../utilities';
import { css, themeColors } from '../styles';

export default Subscriptions = (props) => {
    const navigation = useNavigation();
    const settings = useRecoilValue(settingsAtom);
    const themes = useRecoilValue(themesAtom);
    const colors = themes[settings.theme]?.colors;
    const refresher = useRecoilValue(refresherAtom);

    const backendUrl = process.env.EXPO_PUBLIC_API_URL;

    const [refreshing, setRefreshing] = useState(true);
    const [subscriptions, setSubscriptions] = useRecoilState(subscriptionAtom);

    const [selectedSubscription, setSelectedSubscription] = useState(null);

    const [modalVisible, setModalVisible] = useState(false);

    const showSubscription = (sub) => {
        setModalVisible(true);
        setSelectedSubscription(sub);
    };

    const closeModal = () => {
        // if (props.refresh) props.refresh(true);
        setModalVisible(false);
    };

    const getSubscriptions = async () => {
        setRefreshing(true);
        const response = await fetch(backendUrl + '/subscriptions/' + props.customer, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Account': settings.account
            },
        });
        const data = await response.json();
        setSubscriptions(data);
        setRefreshing(false);
    };


    useEffect(() => {
        getSubscriptions();
    }, [refresher.subscriptions]);

    const Row = (sub) => {
        return (
            <Pressable key={sub.id} onPress={() => showSubscription(sub)}>
                <DataTable.Row>
                    <DataTable.Cell style={[css.cell]}>
                        <Text style={css.defaultText}>{sub.products}</Text>
                    </DataTable.Cell>
                    {/* <DataTable.Cell style={[css.cell]}>
                        <Text style={css.defaultText}>{sub.latest_invoice.number}</Text>
                    </DataTable.Cell> */}
                    <DataTable.Cell style={[css.cell]}>
                        <Text style={css.defaultText}>{Utils.displayDate(sub.current_period_end)}</Text>
                    </DataTable.Cell>
                </DataTable.Row>
            </Pressable >
        );
    };

    return (
        <View style={[css.container, { padding: 0 }]}>
            <DataTable>
                <DataTable.Header style={css.tableHeader}>
                    <DataTable.Title style={[css.cell]}>
                        <Text style={css.defaultText}>Items</Text>
                    </DataTable.Title>
                    {/* <DataTable.Title style={[css.cell]}>
                        <Text style={css.defaultText}>Latest invoice</Text>
                    </DataTable.Title> */}
                    <DataTable.Title style={[css.cell]}>
                        <Text style={css.defaultText}>Next invoice</Text>
                    </DataTable.Title>
                </DataTable.Header>
                <ScrollView>
                    {subscriptions.length > 0 && subscriptions.map && subscriptions.map((sub) => Row(sub, navigation))}
                    {subscriptions.length == 0 && <Text style={[css.defaultText, { marginLeft: 20, marginTop: 10 }]}>No data</Text>}
                </ScrollView>
            </DataTable>

            {props.showRefresh && <View style={css.floatingMenu}>
                <View style={css.buttons}>
                    <Button
                        action={getSubscriptions}
                        color={colors.secondary}
                        icon={faArrowsRotate}
                        // text="Next"
                        large={false}
                        refreshing={refreshing}
                    />
                </View>
            </View>}

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}>
                <View style={css.centeredView}>
                    <View style={[css.modalView, css.shadow, {height: '30%'} ]}>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ flexDirection: 'column', flex: 3 }}>
                                <Text style={css.spacedTextMuted}>Items</Text>
                                <Text style={css.spacedTextMuted}>Current period start</Text>
                                <Text style={css.spacedTextMuted}>Current period end</Text>
                            </View>
                            {/* <View style={{ flexDirection: 'column', flex: 0.5 }}></View> */}
                            <View style={{ flexDirection: 'column', flex: 3 }}>
                                {selectedSubscription && <>
                                    <Text style={css.spacedText}>{selectedSubscription?.products}</Text>
                                    <Text style={css.spacedText}>{Utils.displayDate(selectedSubscription?.current_period_start)}</Text>
                                    <Text style={css.spacedText}>{Utils.displayDate(selectedSubscription?.current_period_end)}</Text>
                                </>}
                            </View>
                        </View>

                        <Pressable style={[css.floatingIcon, css.shadow, { right: 0, top: 0, elevation: 0, shadowRadius: 0 }]} onPress={closeModal}>
                            <FontAwesomeIcon icon={faXmark} color={colors.primary} size={18} />
                        </Pressable>

                        {/* <View style={css.floatingMenu}>
                            <View style={css.buttons}>
                            {selectedTransaction && status(selectedTransaction) == 'Succeeded' &&
                                <Button
                                    action={refundTransaction}
                                    color={colors.primary}
                                    icon={faArrowRightArrowLeft}
                                    text="Refund"
                                    large={false}
                                    refreshing={isRefunding}
                                    transform="rotate-90"
                                />
                            }
                            </View>
                        </View> */}

                    </View>
                </View>
            </Modal>
        </View>
    );
};
