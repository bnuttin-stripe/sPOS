import { React, useState, useEffect } from 'react';
import { Platform, Text, View, Pressable, ScrollView, Modal, Image, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import SunmiPrinter, { AlignValue } from '@heasy/react-native-sunmi-printer';
import { receiptBMP } from '../assets/receiptLogo';

import { useRecoilState, useRecoilValue, useResetRecoilState } from 'recoil';
import { cartAtom, settingsAtom, themesAtom, currentCustomerAtom } from '../atoms';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronLeft, faUser, faEnvelope, faXmark, faReceipt, faExclamationTriangle, faExclamation, faArrowRight, faInfoCircle, faPlus, faCalendar, faCartShopping, faMagnifyingGlass } from '@fortawesome/pro-solid-svg-icons';

import Customers from './Customers';
import Button from './Button';

import * as Utils from '../utilities';
import { css } from '../styles';

export default Checkout = (props) => {
    const navigation = useNavigation();

    const settings = useRecoilValue(settingsAtom);
    const backendUrl = process.env.EXPO_PUBLIC_API_URL;
    const themes = useRecoilValue(themesAtom);
    const colors = themes[settings.theme]?.colors || themes['default'].colors;

    const cart = useRecoilValue(cartAtom);
    const cartOneOffItems = cart.filter(item => !item.default_price.recurring);
    const cartSubItems = cart.filter(item => item.default_price.recurring);
    const resetCart = useResetRecoilState(cartAtom);
    const currentCustomer = useRecoilValue(currentCustomerAtom);
    const resetCurrentCustomer = useResetRecoilState(currentCustomerAtom);
    const [subError, setSubError] = useState(null);

    const [modalVisible, setModalVisible] = useState(false);
    const [receiptModalVisible, setReceiptModalVisible] = useState(false);

    const [subStartInProgress, setSubStartInProgress] = useState(false);

    const closeModal = () => {
        setModalVisible(false);
    };

    const numInCart = (product) => {
        return cart.filter(x => (x.id == product.id)).length;
    };

    const getCartTotal = (cart) => {
        const subtotal = cart.reduce((a, b) => a + b.default_price.unit_amount, 0);
        const taxes = Math.round(subtotal * settings.taxPercentage / 100);
        const adjustment = adjustFinalAmount(subtotal + taxes);
        const total = subtotal + taxes + adjustment;
        return {
            subtotal: subtotal,
            taxes: taxes,
            adjustment: adjustment,
            total: total
        };
    };

    const adjustFinalAmount = (amount) => {
        let output = 0;
        if (!settings.magicCentProtection) return 0;
        const decimal = amount.toString().slice(-2);
        if (['01', '02', '03', '05', '40', '55', '65', '75'].includes(decimal)) {
            output = 100 - parseInt(decimal);
        }
        return output;
    };

    const pay = () => {
        // Cart empty - abort
        if (cart.length == 0) return;

        // Cart has some one-off items - we'll process the payment
        if (cartOneOffItems.length > 0) {
            const payload = {
                amount: getCartTotal(cartOneOffItems).total,
                currency: settings.currency,
                captureMethod: 'automatic',
                metadata: {
                    app: 'sPOS',
                    channel: 'catalog',
                    orderNumber: Utils.generateOrderNumber(settings.orderPrefix),
                    cart: cartOneOffItems.map(x => x.name).join('\n')
                }
            };
            // If we have a customer, we attach it to the payment
            if (currentCustomer.id) {
                payload.customer = currentCustomer.id;
                // And if there are subscriptions in the cart, we'll set up future usage on the card 
                if (cartSubItems.length > 0) {
                    payload.setupFutureUsage = 'off_session';
                }
            }
            cartSubItems.length == 0 ? props.pay(payload, showReceiptModal) : props.pay(payload, processSubscription);
        }
        // Cart has only subscriptions
        else {
            if (currentCustomer.id) {
                props.setup(currentCustomer.id, processSubscription);
            }
            else {
                console.log("Error: Customer required for subscriptions");
            }
        }
    };

    // Start subscription if needed. Will get the PaymentIntent that was used for one-off items, OR the pm created from SetupIntent if no one-off items
    const processSubscription = async (obj) => {
        // console.log("startSub", obj);
        if (cartSubItems.length == 0) {
            setReceiptModalVisible(true);
        }
        else {
            setSubStartInProgress(true);
            let payload = {
                cart: cartSubItems,
                customer: currentCustomer.id,
            };
            if (obj.amount) {
                payload.previousPI = obj; // One off items were paid for with that PI - server will query the PI to get the generaterd_card on the latest charge
            }
            else {
                payload.si = obj.si; // No one-off items, so we get the pm directly from the SetupIntent
            }
            await fetch(backendUrl + '/startAODSubscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Account': settings.account
                },
                body: JSON.stringify(payload)
            })
                .then(res => res.json())
                .then(async data => {
                    if (data.error) {
                        setSubError("Card could not be used to pre-authorize the subscription. Please try again.");
                    } else {
                        setSubError(null);
                    }
                    // console.log(data);
                    setSubStartInProgress(false);
                    showReceiptModal();
                });
        }
    };

    const showReceiptModal = () => {
        setReceiptModalVisible(true);

    };

    const newSale = () => {
        resetCart();
        resetCurrentCustomer();
        goBack();
    };

    const cartHasSubscription = () => {
        return cart.some(item => item.default_price.recurring);
    };

    const printReceipt = async () => {
        try {
            SunmiPrinter.printerInit();
            SunmiPrinter.printBitmap(receiptBMP, 200);
            SunmiPrinter.lineWrap(2);
            SunmiPrinter.setFontWeight(false);
            SunmiPrinter.setFontSize(30);
            SunmiPrinter.printerText('Thank you for shopping with us!\n\n');
            SunmiPrinter.setFontSize(24);
            SunmiPrinter.printerText('[ Demo only - your card was NOT charged ]\n\n');
            SunmiPrinter.setFontSize(24);
            SunmiPrinter.printerText('Your items: \n');
            cart.map(item => {
                SunmiPrinter.printColumnsText([item.name, Utils.displayPrice(item.default_price.unit_amount / 100, settings.currency)], [30, 15], [AlignValue.LEFT, AlignValue.RIGHT]);
            });
            SunmiPrinter.setFontWeight(true);
            SunmiPrinter.printColumnsText(['Subtotal: ', Utils.displayPrice(getCartTotal(cart).subtotal / 100, settings.currency)], [30, 15], [AlignValue.LEFT, AlignValue.RIGHT]);
            SunmiPrinter.printColumnsText(['Tax: ', Utils.displayPrice(getCartTotal(cart).taxes / 100, settings.currency)], [30, 15], [AlignValue.LEFT, AlignValue.RIGHT]);
            SunmiPrinter.printColumnsText(['Total: ', Utils.displayPrice(getCartTotal(cart).total / 100, settings.currency)], [30, 15], [AlignValue.LEFT, AlignValue.RIGHT]);
            SunmiPrinter.setFontWeight(false);

            SunmiPrinter.printerText('\nFind our more about Stripe Terminal:\n\n');
            SunmiPrinter.printQRCode('https://stripe.com/industries/retail', 8, 0);
            SunmiPrinter.lineWrap(5);
        } catch (error) {
            console.log("Printer error", error);
        }
    };

    const Row = (product) => {
        return (
            <View key={product.id} style={{ flexDirection: 'row' }}>
                <View style={{ flex: 2 }}>
                    <Text style={css.spacedText}>{product.name}</Text>
                </View>
                <View style={{ flex: 1, flexDirection: 'row-reverse' }}>
                    {/* <Text style={css.spacedText}>{numInCart(product)} x {Utils.displayPrice(product.default_price.unit_amount / 100, product.default_price.currency)}</Text> */}
                    <Text style={css.spacedText}>
                        {Utils.displayPrice(product.default_price.unit_amount / 100, product.default_price.currency)}
                        {product.default_price.recurring && <Text style={{ fontSize: 12, color: colors.text }}>/{product.default_price.recurring.interval}</Text>}
                    </Text>
                </View>
            </View>
        );
    };

    const goBack = () => {
        navigation.navigate("App", { page: "Products" });
    };


    return (
        <View style={css.container}>
            <ScrollView>
                {/* ------------------------- EMPTY CART ------------------------- */}
                {cart.length == 0 && <>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 30 }}>
                        <FontAwesomeIcon icon={faCartShopping} color={colors.primary} size={18} />
                        <Text style={{ fontSize: 20, fontWeight: 'bold', marginLeft: 5 }}>Cart</Text>
                    </View>
                    <Text style={{ color: colors.text, textAlign: 'center', margin: 20 }}>Cart is empty.</Text>
                </>}

                {/* ------------------------- ONE-OFF ITEMS ------------------------- */}
                {cartOneOffItems.length !== 0 && <View style={{ marginBottom: 30 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                        <FontAwesomeIcon icon={faCartShopping} color={colors.primary} size={20} />
                        <Text style={{ fontSize: 20, fontWeight: 'bold', marginLeft: 5 }}>Cart</Text>
                    </View>

                    {cartOneOffItems.map && cartOneOffItems.map((product) => Row(product))}

                    <View style={{ flexDirection: 'row', borderTopWidth: 1, borderStyle: 'dashed', paddingTop: 8 }}>
                        <View style={{ flex: 2 }}>
                            <Text style={css.spacedText}>Subtotal</Text>
                        </View>
                        <View style={{ flex: 1, flexDirection: 'row-reverse' }}>
                            <Text style={css.spacedText}>{Utils.displayPrice(getCartTotal(cartOneOffItems).subtotal / 100, settings.currency)}</Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row' }}>
                        <View style={{ flex: 2 }}>
                            <Text style={css.spacedText}>Tax</Text>
                        </View>
                        <View style={{ flex: 1, flexDirection: 'row-reverse' }}>
                            <Text style={css.spacedText}>{Utils.displayPrice(getCartTotal(cartOneOffItems).taxes / 100, settings.currency)}</Text>
                        </View>
                    </View>

                    {getCartTotal(cart).adjustment > 0 && <View style={{ flexDirection: 'row' }}>
                        <View style={{ flex: 2 }}>
                            <Text style={css.spacedText}>Round up for charity</Text>
                        </View>
                        <View style={{ flex: 1, flexDirection: 'row-reverse' }}>
                            <Text style={css.spacedText}>{Utils.displayPrice(getCartTotal(cartOneOffItems).adjustment / 100, settings.currency)}</Text>
                        </View>
                    </View>}

                    <View style={{ flexDirection: 'row', borderTopWidth: 1, borderStyle: 'dashed', paddingTop: 8 }}>
                        <View style={{ flex: 2 }}>
                            <Text style={[css.spacedText, css.bold]}>Due Now</Text>
                        </View>
                        <View style={{ flex: 1, flexDirection: 'row-reverse' }}>
                            <Text style={[css.spacedText, css.bold]}>{Utils.displayPrice(getCartTotal(cartOneOffItems).total / 100, settings.currency)}</Text>
                        </View>
                    </View>
                </View>}

                {/* ------------------------- SUBSCRIPTIONS ------------------------- */}
                {cartSubItems.length !== 0 && <View style={{ marginBottom: 30 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                        <FontAwesomeIcon icon={faCalendar} color={colors.primary} size={18} />
                        <Text style={{ fontSize: 20, fontWeight: 'bold', marginLeft: 5 }}>Subscriptions</Text>
                    </View>

                    {cartSubItems.map && cartSubItems.map((product) => Row(product))}


                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {!currentCustomer.id
                            ? <>
                                <FontAwesomeIcon icon={faExclamation} color={colors.danger} size={14} style={{ marginRight: 5 }} />
                                <Text style={{ color: colors.danger, fontSize: 14 }}>Customer required to proceed.</Text>
                            </>
                            : <View style={{ flexDirection: 'column' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <FontAwesomeIcon icon={faArrowRight} color={colors.primary} size={14} style={{ marginRight: 5 }} />
                                    <Text style={{ color: colors.primary, fontSize: 14 }}>Subscription will kick off automatically on the card used at checkout.</Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                                    <FontAwesomeIcon icon={faExclamationTriangle} color={colors.warning} size={14} style={{ marginRight: 5 }} />
                                    <Text style={{ color: colors.warning, fontSize: 14 }}>Subscription can only be started with a card physically presented - no Wallet.</Text>
                                </View>
                            </View>
                        }
                    </View>
                </View>}

                {/* ------------------------- CUSTOMER ------------------------- */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                    <FontAwesomeIcon icon={faUser} color={colors.primary} size={18} />
                    <Text style={{ fontSize: 20, fontWeight: 'bold', marginLeft: 5 }}>Customer</Text>
                </View>

                {currentCustomer.id
                    ? <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ paddingVertical: 5 }}>
                            <Text style={css.defaultText}>{currentCustomer.name}</Text>
                        </View>
                        <Pressable onPress={resetCurrentCustomer} style={{ flex: 1, flexDirection: 'row-reverse', padding: 5 }}>
                            <FontAwesomeIcon icon={faXmark} color={colors.primary} size={20} />
                        </Pressable>
                    </View>
                    : <View style={{ flexDirection: 'row' }}>
                        <View style={{ flex: 1, paddingVertical: 5 }}>
                            <Text style={css.defaultText}>Guest</Text>
                        </View>
                        <Pressable onPress={() => setModalVisible(true)} style={{ flex: 1, flexDirection: 'row-reverse', padding: 5 }}>
                            <FontAwesomeIcon icon={faMagnifyingGlass} color={colors.primary} size={20} />
                        </Pressable>
                    </View>
                }
                <View style={{ height: 80 }}></View>
            </ScrollView>

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(false);
                }}>
                <View style={css.centeredView}>
                    <View style={[css.modalView, css.shadow, { height: '40%', padding: 10 }]}>
                        <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontWeight: 'bold', fontSize: 20 }}>Search Customers</Text>
                            </View>
                            <View style={{ flex: 1, flexDirection: 'row-reverse' }}>
                                <Pressable onPress={closeModal}>
                                    <FontAwesomeIcon icon={faXmark} color={colors.primary} size={18} />
                                </Pressable>
                            </View>
                        </View>
                        <Customers
                            mode="pick"
                            showIcons={false}
                            showLTV={false}
                            search={true}
                            onPick={closeModal}
                        />
                        <Pressable style={[css.floatingIcon, css.shadow, { left: 20, bottom: 20, backgroundColor: colors.primary, flexDirection: 'row' }]}
                            onPress={() => navigation.navigate("App", { page: "CustomerEntry", origin: "Checkout" })}>
                            <FontAwesomeIcon icon={faPlus} color={'white'} size={18} />
                            <Text style={{ color: 'white', fontSize: 16, marginLeft: 5 }}>New</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            <Modal
                animationType="fade"
                transparent={true}
                visible={receiptModalVisible}
                onRequestClose={() => {
                    setReceiptModalVisible(false);
                }}>
                <View style={css.centeredView}>
                    <View style={[css.modalView, css.shadow, { height: 320, padding: 20 }]}>
                        <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                            <View>
                                <Text style={{ fontWeight: 'bold', fontSize: 20 }}>Transaction complete</Text>
                            </View>
                            <View style={{ flex: 1, flexDirection: 'row-reverse' }}>
                                <Pressable onPress={() => { setReceiptModalVisible(false); newSale(); }}>
                                    <FontAwesomeIcon icon={faXmark} color={colors.primary} size={18} />
                                </Pressable>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'column', flex: 1, width: '100%', marginBottom: 10 }}>
                            <Text style={[css.label, { marginBottom: 10 }]}>Email Receipt</Text>
                            <TextInput
                                style={css.input}
                                inputMode="email"
                                value={currentCustomer?.email || ""}
                            />
                            {subError && <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                                <FontAwesomeIcon icon={faExclamationTriangle} color={colors.danger} size={14} style={{ marginRight: 5 }} />
                                <Text style={{ color: colors.danger, fontSize: 14 }}>One-off items were processed successfully, but subscriptions can only be started with a card physically presented. Please try again.</Text>
                            </View>}
                        </View>
                        <View style={css.floatingMenu}>
                            <View style={css.buttons}>
                                <Button
                                    action={() => { }}
                                    color={colors.secondary}
                                    icon={faEnvelope}
                                    large={false}
                                />
                                {settings?.model == 'V2sPLUSNC_GL' && <Button
                                    action={printReceipt}
                                    color={colors.secondary}
                                    icon={faReceipt}
                                    large={false}
                                />}
                                <Button
                                    action={newSale}
                                    color={colors.primary}
                                    icon={faPlus}
                                    text="Next Sale"
                                    large={false}
                                />
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>

            <View style={css.floatingMenu}>
                <View style={css.buttons}>
                    <Button
                        action={goBack}
                        color={colors.secondary}
                        icon={faChevronLeft}
                        // text="Close"
                        large={false}
                    />


                    <Button
                        action={pay}
                        color={colors.primary}
                        disabledColor={colors.secondary}
                        // icon={faCreditCard}
                        image={<Image source={require('../assets/contactless.png')} style={{ width: 18, height: 18 }} />}
                        text={Platform.OS == 'ios'
                            ? "Tap to Pay on iPhone"
                            : cartOneOffItems.length == 0
                                ? "Save Card"
                                : "Collect " + Utils.displayPrice(getCartTotal(cartOneOffItems).total / 100, settings.currency)
                        }
                        // textStyle={{ fontSize: Platform.OS == 'ios' ? 16 : 16, fontWeight: Platform.OS == 'ios' ? 600 : 400 }}
                        large={false}
                        disabled={cart.length == 0 || (cartHasSubscription() && !currentCustomer.id)}
                    />
                </View>
            </View>
        </View>
    );
};
