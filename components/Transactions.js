import { React, useState, useEffect } from 'react';
import { Text, View, Pressable, ScrollView, RefreshControl, Modal, ActivityIndicator } from 'react-native';
import { DataTable } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import { useRecoilState, useRecoilValue } from 'recoil';
import { transactionAtom, settingsAtom } from '../atoms';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowsRotate, faXmark, faArrowRightArrowLeft, faBoxCheck, faCheck, faBan, faMagnifyingGlass } from '@fortawesome/pro-solid-svg-icons';

import * as Utils from '../utilities';
import { css, themeColors } from '../styles';

export default Transactions = (props) => {
    const navigation = useNavigation();
    const settings = useRecoilValue(settingsAtom);
    const colors = themeColors[settings.theme];
    const backendUrl = process.env.EXPO_PUBLIC_API_URL;

    const [refreshing, setRefreshing] = useState(true);
    const [transactions, setTransactions] = useRecoilState(transactionAtom);

    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [verificationPM, setVerificationPM] = useState(null);
    const [verificationSuccessful, setVerificationSuccessful] = useState(false);
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
        setVerificationSuccessful(false);
        setVerificationPM(null);
    }

    useEffect(() => {
        getTransactions();
    }, []);

    const checkCard = async () => {
        const pm = await props.setup();
        // console.log("checkCard", pm);
        setVerificationPM(pm);
    }

    useEffect(() => {
        // console.log("verificationPM", verificationPM);
        if (verificationPM != null) {
            // console.log("verificationPM", verificationPM)
            // console.log(verificationPM?.card_present?.payment_account_reference);
            // console.log(verificationPM?.card_present?.fingerprint);
            // console.log(selectedTransaction?.latest_charge?.payment_method_details?.card.fingerprint);
            // // console.log("selectedTransaction", selectedTransaction)
            setVerificationSuccessful(cardValid());
        }
    }, [verificationPM, selectedTransaction]);

    const cardValid = () => {
        // console.log("cardValid", verificationPM?.card_present?.fingerprint, selectedTransaction?.latest_charge?.payment_method_details?.card.fingerprint)
        if (verificationPM == null) return false;
        return verificationPM?.card_present?.fingerprint == selectedTransaction?.latest_charge?.payment_method_details?.card.fingerprint ||
            verificationPM?.card_present?.payment_account_reference == selectedTransaction?.latest_charge?.payment_method_details?.card.payment_account_reference
    }

    const Row = (pi) => {
        return (
            <Pressable key={pi.id} onPress={() => showTransaction(pi)}>
                <DataTable.Row>
                    <DataTable.Cell style={[css.cell, { flex: 2 }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={css.defaultText}>{pi.metadata?.orderNumber}</Text>
                            {pi.metadata?.bopis == 'pending' && <FontAwesomeIcon icon={faBoxCheck} color={colors.warning} style={{ marginLeft: 10 }} size={20} />}
                            {pi.metadata?.bopis == 'done' && <FontAwesomeIcon icon={faBoxCheck} color={colors.success} style={{ marginLeft: 10 }} size={20} />}
                        </View>
                    </DataTable.Cell>
                    <DataTable.Cell style={[css.cell, { flex: 1 }]}>
                        <Text style={pi.latest_charge.amount_refunded > 0 ? css.crossedText : css.defaultText}>{Utils.displayPrice(pi.amount / 100, settings.currency)}</Text>
                    </DataTable.Cell>
                    <DataTable.Cell style={[css.cell, { flex: 2 }]}>
                        <Text style={css.defaultText}>{Utils.displayDateTimeShort(pi.latest_charge.created)}</Text>
                    </DataTable.Cell>
                    {/* <DataTable.Cell style={[css.cell, { flex: 0.8 }]}>
                        <Text style={css.defaultText}>{Utils.capitalize(pi.latest_charge.payment_method_details.card_present.brand)} {pi.latest_charge.payment_method_details.card_present.last4}</Text>
                    </DataTable.Cell> */}
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
                    {/* <DataTable.Title style={[css.cell, { flex: 0.8 }]}>
                        <Text style={css.defaultText}>Card</Text>
                    </DataTable.Title> */}
                </DataTable.Header>
                <ScrollView>
                    {transactions.length > 0 && transactions.map && transactions.map((pi) => Row(pi, navigation))}
                </ScrollView>
            </DataTable>

            <Pressable style={[css.floatingIcon, { left: 20, bottom: 20, backgroundColor: colors.secondary }]} onPress={getTransactions}>
                {refreshing
                    ? <ActivityIndicator size="small" color="white" />
                    : <FontAwesomeIcon icon={faArrowsRotate} color={'white'} size={18} />
                }
            </Pressable>

            {/* <Pressable style={[css.floatingIcon, { left: 80, bottom: 20, backgroundColor: colors.primary }]} onPress={searchTransactions}>
                <FontAwesomeIcon icon={faBoxCheck} color={'white'} size={18} />
            </Pressable> */}

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}>
                <View style={css.centeredView}>
                    <View style={css.modalView}>
                        <View style={{ flexDirection: 'row', paddingLeft: 40, paddingRight: 40 }}>
                            <View style={{ flexDirection: 'column'}}>
                                <Text style={css.spacedText}>Order ID</Text>
                                <Text style={css.spacedText}>Date</Text>
                                <Text style={css.spacedText}>Status</Text>
                                <Text style={css.spacedText}>Amount</Text>
                                <Text style={css.spacedText}>Channel</Text>
                                <Text style={css.spacedText}>Card</Text>
                                {selectedTransaction?.customer?.id && <Text style={css.spacedText}>Customer</Text>}
                                {selectedTransaction?.metadata?.bopis && <Text style={css.spacedText}>BOPIS</Text>}
                                {selectedTransaction?.metadata?.cart && <Text style={css.spacedText}>Items</Text>}
                            </View>
                            <View style={{ flexDirection: 'column', width: 20}}></View>
                            <View style={{ flexDirection: 'column' }}>
                                {selectedTransaction && <>
                                    <Text style={css.spacedText}>{selectedTransaction?.metadata?.orderNumber}</Text>
                                    <Text style={css.spacedText}>{Utils.displayDateTime(selectedTransaction?.created)}</Text>
                                    <Text style={css.spacedText}>{status(selectedTransaction)}</Text>
                                    <Text style={css.spacedText}>{Utils.displayPrice(selectedTransaction?.amount_received / 100, settings.currency)}</Text>
                                    <Text style={css.spacedText}>{Utils.capitalize(selectedTransaction?.metadata?.channel)}</Text>
                                    <Text style={css.spacedText}>{
                                        selectedTransaction?.latest_charge?.payment_method_details?.card
                                            ? Utils.capitalize(selectedTransaction?.latest_charge?.payment_method_details?.card?.brand) + " - " + selectedTransaction?.latest_charge?.payment_method_details?.card?.last4
                                            : Utils.capitalize(selectedTransaction?.latest_charge?.payment_method_details?.card_present?.brand) + " - " + selectedTransaction?.latest_charge?.payment_method_details?.card_present?.last4
                                    }</Text>
                                    {selectedTransaction?.customer?.id && <Text style={css.spacedText}>{selectedTransaction?.customer?.name}</Text>}
                                    {selectedTransaction?.metadata?.bopis && <Text style={css.spacedText}>{Utils.capitalize(selectedTransaction?.metadata?.bopis)}</Text>}
                                    {selectedTransaction?.metadata?.cart && <Text style={css.spacedText}>* {selectedTransaction?.metadata?.cart?.split("\n").join("\n* ")}</Text>}
                                </>}
                            </View>
                        </View>

                        <Pressable style={[css.floatingIcon, { left: 20, bottom: 20, backgroundColor: colors.primary, elevation: 0 }]} onPress={closeModal}>
                            <FontAwesomeIcon icon={faXmark} color={'white'} size={18} />
                        </Pressable>
                        {selectedTransaction && status(selectedTransaction) == 'Succeeded' &&
                            <Pressable style={[css.floatingIcon, { left: 80, bottom: 20, backgroundColor: colors.warning, flexDirection: 'row', elevation: 0 }]} onPress={refundTransaction}>
                                {isRefunding
                                    ? <ActivityIndicator size="small" color="white" />
                                    : <FontAwesomeIcon icon={faArrowRightArrowLeft} color={'white'} style={{ transform: [{ rotateZ: '90deg' }] }} size={18} />
                                }
                            </Pressable>
                        }
                        {selectedTransaction?.metadata?.bopis == 'pending' &&
                            <>
                                <Pressable style={[css.floatingIcon, { left: 140, bottom: 20, backgroundColor: colors.warning, elevation: 0 }]} onPress={bopisDone}>
                                    {isPickingUp
                                        ? <ActivityIndicator size="small" color="white" />
                                        : <FontAwesomeIcon icon={faBoxCheck} color={'white'} size={18} />
                                    }
                                </Pressable>
                                <Pressable style={[css.floatingIcon, {
                                    left: 200, bottom: 20,
                                    backgroundColor: verificationPM ? verificationSuccessful ? colors.success : colors.danger : colors.warning, elevation: 0
                                }]}
                                    onPress={checkCard}>
                                    <FontAwesomeIcon icon={verificationPM ? verificationSuccessful ? faCheck : faBan : faMagnifyingGlass} color={'white'} size={18} />
                                </Pressable>
                            </>
                        }
                    </View>
                </View>
            </Modal>
        </View>
    )
}
