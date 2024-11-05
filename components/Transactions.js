import { React, useState, useEffect } from 'react';
import { Text, View, Pressable, ScrollView, RefreshControl, Modal, ActivityIndicator } from 'react-native';
import * as Utils from '../utilities';
import { DataTable } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTurnLeft, faXmark, faArrowRightArrowLeft, faArrowUp } from '@fortawesome/pro-solid-svg-icons';
import { useRecoilState, useRecoilValue } from 'recoil';
import { transactionAtom, settingsAtom } from '../atoms';
import { css, colors } from '../styles';



export default Transactions = (props) => {
    const [transactions, setTransactions] = useRecoilState(transactionAtom);
    const settings = useRecoilValue(settingsAtom);
    const navigation = useNavigation();
    const [refreshing, setRefreshing] = useState(true);

    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [isRefunding, setIsRefunding] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    const getTransactions = async () => {
        setRefreshing(true);
        const response = await fetch(settings.backendUrl + '/transactions', {
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
        setModalVisible(!modalVisible);
        setSelectedTransaction(pi);
    }

    const closeModal = () => {
        // getTransactions();
        setModalVisible(false);
    }

    const Row = (pi) => {
        return (
            <Pressable key={pi.id} onPress={() => showTransaction(pi)}>
                <DataTable.Row>
                    <DataTable.Cell style={{ flex: 0.8 }}>{pi.metadata?.orderNumber}</DataTable.Cell>
                    <DataTable.Cell style={{ flex: 0.7 }} numeric>
                        <Text style={pi.latest_charge.amount_refunded > 0 ? { textDecorationLine: 'line-through' } : {}}>{Utils.displayPrice(pi.amount / 100, 'usd')}</Text><Text>     </Text>
                    </DataTable.Cell>
                    <DataTable.Cell style={{ flex: 1.4 }}>{Utils.displayDateTimeShort(pi.latest_charge.created)}</DataTable.Cell>
                    <DataTable.Cell style={{ flex: 0.8 }}>
                        {Utils.capitalize(pi.latest_charge.payment_method_details.card_present.brand)} {pi.latest_charge.payment_method_details.card_present.last4}
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

    useEffect(() => {
        getTransactions();
    }, []);

    return (
        <View style={[css.container, { padding: 0, backgroundColor: modalVisible ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0)' }]}>
            <DataTable>
                <DataTable.Header style={css.tableHeader}>
                    <DataTable.Title style={{ flex: 0.8 }}>Order ID</DataTable.Title>
                    <DataTable.Title style={{ flex: 0.7 }} numeric>Amount     </DataTable.Title>
                    <DataTable.Title style={{ flex: 1.4 }}>Date</DataTable.Title>
                    <DataTable.Title style={{ flex: 0.8 }}>Card</DataTable.Title>
                </DataTable.Header>
                <ScrollView
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={getTransactions}
                            progressViewOffset={150}
                            colors={['white']}
                            progressBackgroundColor={colors.slate}
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
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ flexDirection: 'column', flex: 1 }}>
                                <Text style={css.label}>Order ID</Text>
                                <Text style={css.label}>Date</Text>
                                <Text style={css.label}>Status</Text>
                                <Text style={css.label}>Amount</Text>
                            </View>
                            <View style={{ flexDirection: 'column', flex: 2 }}>
                                {selectedTransaction && <>
                                    <Text style={css.text}>{selectedTransaction?.metadata?.orderNumber}</Text>
                                    <Text style={css.text}>{Utils.displayDateTime(selectedTransaction?.created)}</Text>
                                    <Text style={css.text}>{status(selectedTransaction)}</Text>
                                    <Text style={css.text}>{Utils.displayPrice(selectedTransaction?.amount_received / 100, 'usd')}</Text>
                                </>}
                            </View>
                        </View>
                        {/* <Pressable
                            style={[styles.button, styles.buttonClose]}
                            onPress={() => setModalVisible(!modalVisible)}>
                            <Text style={styles.textStyle}>Hide Modal</Text>
                        </Pressable> */}

                        <Pressable style={[css.floatingIcon, { left: 20, bottom: 20, backgroundColor: colors.slate, elevation: 0 }]} onPress={closeModal}>
                            <FontAwesomeIcon icon={faXmark} color={'white'} size={18} />
                        </Pressable>
                        {selectedTransaction && status(selectedTransaction) == 'Succeeded' &&
                            <Pressable style={[css.floatingIcon, { left: 80, bottom: 20, backgroundColor: colors.yellow, flexDirection: 'row', elevation: 0 }]} onPress={refundTransaction}>
                                {!isRefunding && <>
                                    <FontAwesomeIcon icon={faArrowRightArrowLeft} color={'white'} size={18} />
                                    {/* <Text style={css.buttonText}>Refund</Text> */}
                                </>}
                                {isRefunding &&
                                    <ActivityIndicator size="small" color="white" />
                                }
                            </Pressable>
                        }
                    </View>
                </View>
            </Modal>
        </View>

    )
}

const styles = {
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalView: {
        width: '70%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        // shadowColor: '#000',
        // shadowOffset: {
        //     width: 0,
        //     height: 2,
        // },
        // shadowOpacity: 0.25,
        // shadowRadius: 4,
        // elevation: 5,
        paddingBottom: 100,
        marginTop: 120
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
    },
};
