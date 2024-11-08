import { React, useState, useEffect } from 'react';
import { Text, View, Pressable, ScrollView, RefreshControl, Modal, ActivityIndicator } from 'react-native';
import { DataTable } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import { useRecoilState, useRecoilValue } from 'recoil';
import { transactionAtom, settingsAtom } from '../atoms';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTurnLeft, faXmark, faArrowRightArrowLeft, faBoxCheck } from '@fortawesome/pro-solid-svg-icons';

import * as Utils from '../utilities';
import { css, colors } from '../styles';

export default Transactions = (props) => {
    const navigation = useNavigation();
    const settings = useRecoilValue(settingsAtom);

    const [refreshing, setRefreshing] = useState(true);
    const [transactions, setTransactions] = useRecoilState(transactionAtom);

    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [isRefunding, setIsRefunding] = useState(false);

    const [modalVisible, setModalVisible] = useState(false);

    const getTransactions = async () => {
        setRefreshing(true);
        const url = props.customer ? settings.backendUrl + '/transactions/' + props.customer : settings.backendUrl + '/transactions';
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const data = await response.json();
        setTransactions(data);
        setRefreshing(false);
    };

    const refundTransaction = async () => {
        setIsRefunding(true);
        const response = await fetch(settings.backendUrl + '/refund', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
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
    }, []);

    const Row = (pi) => {
        return (
            <Pressable key={pi.id} onPress={() => showTransaction(pi)}>
                <DataTable.Row>
                    <DataTable.Cell style={[css.cell, { flex: 0.8 }]}>
                        <Text style={css.defaultText}>{pi.metadata?.orderNumber}</Text>
                    </DataTable.Cell>
                    <DataTable.Cell style={[css.cell, { flex: 0.8, paddingRight: 10 }]} numeric>
                        <Text style={pi.latest_charge.amount_refunded > 0 ? css.crossedText : css.defaultText}>{Utils.displayPrice(pi.amount / 100, 'usd')}</Text>
                    </DataTable.Cell>
                    <DataTable.Cell style={[css.cell, { flex: 1.4 }]}>
                        <Text style={css.defaultText}>{Utils.displayDateTimeShort(pi.latest_charge.created)}</Text>
                    </DataTable.Cell>
                    <DataTable.Cell style={[css.cell, { flex: 0.8 }]}>
                        <Text style={css.defaultText}>{Utils.capitalize(pi.latest_charge.payment_method_details.card_present.brand)} {pi.latest_charge.payment_method_details.card_present.last4}</Text>
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
                    <DataTable.Title style={[css.cell, { flex: 0.8 }]}>
                        <Text style={css.defaultText}>Order ID</Text>
                    </DataTable.Title>
                    <DataTable.Title style={[css.cell, { flex: 0.8, paddingRight: 10 }]} numeric>
                        <Text style={css.defaultText}>Amount</Text>
                    </DataTable.Title>
                    <DataTable.Title style={[css.cell, { flex: 1.4 }]}>
                        <Text style={css.defaultText}>Date</Text>
                    </DataTable.Title>
                    <DataTable.Title style={[css.cell, { flex: 0.8 }]}>
                        <Text style={css.defaultText}>Card</Text>
                    </DataTable.Title>
                </DataTable.Header>
                <ScrollView
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={getTransactions}
                            progressViewOffset={150}
                            colors={['white']}
                            progressBackgroundColor={colors.primary}
                        />
                    }
                >
                    {transactions.length > 0 && transactions.map && transactions.map((pi) => Row(pi, navigation))}
                </ScrollView>
            </DataTable>

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}>
                <View style={css.centeredView}>
                    <View style={css.modalView}>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ flexDirection: 'column', flex: 1 }}>
                                <Text style={css.spacedText}>Order ID</Text>
                                <Text style={css.spacedText}>Date</Text>
                                <Text style={css.spacedText}>Status</Text>
                                <Text style={css.spacedText}>Amount</Text>
                            </View>
                            <View style={{ flexDirection: 'column', flex: 2 }}>
                                {selectedTransaction && <>
                                    <Text style={css.spacedText}>{selectedTransaction?.metadata?.orderNumber}</Text>
                                    <Text style={css.spacedText}>{Utils.displayDateTime(selectedTransaction?.created)}</Text>
                                    <Text style={css.spacedText}>{status(selectedTransaction)}</Text>
                                    <Text style={css.spacedText}>{Utils.displayPrice(selectedTransaction?.amount_received / 100, 'usd')}</Text>
                                </>}
                            </View>
                        </View>

                        <Pressable style={[css.floatingIcon, { left: 20, bottom: 20, backgroundColor: colors.primary, elevation: 0 }]} onPress={closeModal}>
                            <FontAwesomeIcon icon={faXmark} color={'white'} size={18} />
                        </Pressable>
                        <Pressable style={[css.floatingIcon, { left: 80, bottom: 20, backgroundColor: colors.primary, elevation: 0 }]} onPress={closeModal}>
                            <FontAwesomeIcon icon={faBoxCheck} color={'white'} size={18} />
                        </Pressable>
                        {selectedTransaction && status(selectedTransaction) == 'Succeeded' &&
                            <Pressable style={[css.floatingIcon, { left: 140, bottom: 20, backgroundColor: colors.warning, flexDirection: 'row', elevation: 0 }]} onPress={refundTransaction}>
                                {isRefunding
                                    ? <ActivityIndicator size="small" color="white" />
                                    : <FontAwesomeIcon icon={faArrowRightArrowLeft} color={'white'} size={18} />
                                }
                            </Pressable>
                        }
                    </View>
                </View>
            </Modal>
        </View>
    )
}
