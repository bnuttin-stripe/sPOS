import { React, useState, useEffect } from 'react';
import { Text, View, Pressable, ScrollView, RefreshControl, Modal, ActivityIndicator } from 'react-native';
import { DataTable } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import { useRecoilState, useRecoilValue } from 'recoil';
import { transactionAtom, settingsAtom, themesAtom, refresherAtom } from '../atoms';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowsRotate, faXmark, faArrowRightArrowLeft, faBoxCheck, faBox, faCircleCheck, faCircleExclamation, faBan, faMagnifyingGlass } from '@fortawesome/pro-solid-svg-icons';

import Button from './Button';

import * as Utils from '../utilities';
import { css, themeColors } from '../styles';
import CardVerifier from './CardVerifier';

export default Transactions = (props) => {
    const navigation = useNavigation();
    const settings = useRecoilValue(settingsAtom);
    const themes = useRecoilValue(themesAtom);
    const colors = themes[settings.theme]?.colors;
    const refresher = useRecoilValue(refresherAtom);
    
    const backendUrl = process.env.EXPO_PUBLIC_API_URL;

    const [refreshing, setRefreshing] = useState(true);
    const [transactions, setTransactions] = useRecoilState(transactionAtom);

    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [isRefunding, setIsRefunding] = useState(false);
    const [isPickingUp, setIsPickingUp] = useState(false);

    const [modalVisible, setModalVisible] = useState(false);

    const getTransactions = async () => {
        setRefreshing(true);
        const url = props.customer ? backendUrl + '/transactions/' + props.customer : backendUrl + '/transactions';
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Account': settings.account
            },
        });
        const data = await response.json();
        setTransactions(data);
        setRefreshing(false);
    };

    const searchTransactions = async () => {
        const pm = await props.setup();
        setRefreshing(true);
        const url = backendUrl + '/transactionsByFingerprint/' + pm;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Account': settings.account
            },
        });
        const data = await response.json();
        setTransactions(data);
        setRefreshing(false);
    }

    const refundTransaction = async () => {
        setIsRefunding(true);
        const response = await fetch(backendUrl + '/refund', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Account': settings.account
            },
            body: JSON.stringify({
                id: selectedTransaction.id
            })
        });
        const data = await response.json();
        setSelectedTransaction(data);
        setIsRefunding(false);
        getTransactions();
    }

    const bopisDone = async () => {
        setIsPickingUp(true);
        const response = await fetch(backendUrl + '/bopis', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Account': settings.account
            },
            body: JSON.stringify({
                id: selectedTransaction.id
            })
        });
        const data = await response.json();
        setSelectedTransaction(data);
        setIsPickingUp(false);
        getTransactions();
    }

    const showTransaction = (pi) => {
        setModalVisible(true);
        setSelectedTransaction(pi);
    }

    const closeModal = () => {
        if (props.refresh) props.refresh(true);
        setModalVisible(false);
    }

    useEffect(() => {
        getTransactions();
    }, [refresherAtom.transactions]);

    const Row = (pi) => {
        return (
            <Pressable key={pi.id} onPress={() => showTransaction(pi)}>
                <DataTable.Row>
                    <DataTable.Cell style={[css.cell, { flex: 2 }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={css.defaultText}>{pi.metadata?.orderNumber || pi.invoice?.number}</Text>
                            {pi.metadata?.bopis == 'pending' && <FontAwesomeIcon icon={faBox} color={colors.primary} style={{ marginLeft: 10 }} size={20} />}
                            {pi.metadata?.bopis == 'done' && <FontAwesomeIcon icon={faBoxCheck} color={colors.success} style={{ marginLeft: 10 }} size={20} />}
                        </View>
                    </DataTable.Cell>
                    <DataTable.Cell style={[css.cell, { flex: 1 }]}>
                        <Text style={pi.latest_charge.amount_refunded > 0 ? css.crossedText : css.defaultText}>{Utils.displayPrice(pi.amount / 100, settings.currency)}</Text>
                    </DataTable.Cell>
                    <DataTable.Cell style={[css.cell, { flex: 2 }]}>
                        <Text style={css.defaultText}>{Utils.displayDateTimeShort(pi.latest_charge.created)}</Text>
                    </DataTable.Cell>
                </DataTable.Row>
            </Pressable >
        )
    }

    const status = (pi) => {
        if (pi.latest_charge.amount_refunded > 0) {
            return 'Refunded';
        } else {
            return 'Succeeded';
        }
    }

    return (
        <View style={[css.container, { padding: 0 }]}>
            <DataTable>
                <DataTable.Header style={css.tableHeader}>
                    <DataTable.Title style={[css.cell, { flex: 2 }]}>
                        <Text style={css.defaultText}>Order ID</Text>
                    </DataTable.Title>
                    <DataTable.Title style={[css.cell, { flex: 1 }]}>
                        <Text style={css.defaultText}>Amount</Text>
                    </DataTable.Title>
                    <DataTable.Title style={[css.cell, { flex: 2 }]}>
                        <Text style={css.defaultText}>Date</Text>
                    </DataTable.Title>
                </DataTable.Header>
                <ScrollView>
                    {transactions.length > 0 && transactions.map && transactions.map((pi) => Row(pi, navigation))}
                    {transactions.length == 0 && <Text style={[css.defaultText, { marginLeft: 20, marginTop: 10 }]}>No data</Text>}
                </ScrollView>
            </DataTable>

            {props.showRefresh && <View style={css.floatingMenu}>
                <View style={css.buttons}>
                    <Button
                        action={getTransactions}
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
                    <View style={[css.modalView, css.shadow]}>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ flexDirection: 'column', flex: 1.8 }}>
                                <Text style={css.spacedTextMuted}>Order ID</Text>
                                <Text style={css.spacedTextMuted}>Date</Text>
                                <Text style={css.spacedTextMuted}>Status</Text>
                                <Text style={css.spacedTextMuted}>Amount</Text>
                                <Text style={css.spacedTextMuted}>Channel</Text>
                                <Text style={css.spacedTextMuted}>Card</Text>
                                {selectedTransaction?.customer?.id && <Text style={css.spacedTextMuted}>Customer</Text>}
                                {selectedTransaction?.metadata?.bopis && <Text style={css.spacedTextMuted}>BOPIS</Text>}
                                {selectedTransaction?.metadata?.cart && <Text style={css.spacedTextMuted}>Items</Text>}
                            </View>
                            {/* <View style={{ flexDirection: 'column', flex: 0.5 }}></View> */}
                            <View style={{ flexDirection: 'column', flex: 4 }}>
                                {selectedTransaction && <>
                                    <Text style={css.spacedText}>{selectedTransaction?.metadata?.orderNumber || selectedTransaction?.invoice.number}</Text>
                                    <Text style={css.spacedText}>{Utils.displayDateTime(selectedTransaction?.created)}</Text>
                                    <Text style={css.spacedText}>{status(selectedTransaction)}</Text>
                                    <Text style={css.spacedText}>{Utils.displayPrice(selectedTransaction?.amount_received / 100, settings.currency)}</Text>
                                    <Text style={css.spacedText}>{Utils.capitalize(selectedTransaction?.metadata?.channel) || "Subscription"}</Text>
                                    <View style={{ flexDirection: 'row' }}>
                                        <Text style={css.spacedText}>{
                                            selectedTransaction?.latest_charge?.payment_method_details?.card
                                                ? Utils.capitalize(selectedTransaction?.latest_charge?.payment_method_details?.card?.brand) + " - " + selectedTransaction?.latest_charge?.payment_method_details?.card?.last4
                                                : Utils.capitalize(selectedTransaction?.latest_charge?.payment_method_details?.card_present?.brand) + " - " + selectedTransaction?.latest_charge?.payment_method_details?.card_present?.last4
                                        }</Text>
                                        <CardVerifier pi={selectedTransaction} setup={props.setup} />
                                    </View>
                                    {selectedTransaction?.customer?.id && <Text style={css.spacedText}>{selectedTransaction?.customer?.name}</Text>}
                                    {selectedTransaction?.metadata?.bopis &&
                                        <View style={{ flexDirection: 'row' }}>
                                            <Text style={css.spacedText}>{Utils.capitalize(selectedTransaction?.metadata?.bopis)}</Text>
                                            {selectedTransaction?.metadata?.bopis == 'pending' && <Pressable onPress={bopisDone} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 12, marginRight: -10, flex: 1 }}>
                                                <Text style={[css.inlineButton, { backgroundColor: colors.primary }]}>Picked Up</Text>
                                            </Pressable>}
                                        </View>}
                                    {selectedTransaction?.metadata?.cart && <Text style={css.spacedText}>* {selectedTransaction?.metadata?.cart?.split("\n").join("\n* ")}</Text>}
                                </>}
                            </View>
                        </View>

                        <Pressable style={[css.floatingIcon, css.shadow, { right: 0, top: 0, elevation: 0, shadowRadius: 0 }]} onPress={closeModal}>
                            <FontAwesomeIcon icon={faXmark} color={colors.primary} size={18} />
                        </Pressable>

                        <View style={css.floatingMenu}>
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
                        </View>

                    </View>
                </View>
            </Modal>
        </View>
    )
}
