import { React } from 'react';
import { Text, View, Pressable, Image } from 'react-native';
import * as Utils from '../utilities';
import { useNavigation } from '@react-navigation/native';
import { useRecoilState, useRecoilValue, useResetRecoilState } from 'recoil';
import { cartAtom, settingsAtom } from '../atoms';
import { css, colors } from '../styles';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCreditCard, faDeleteLeft } from '@fortawesome/pro-light-svg-icons';

const getCartTotal = (cart) => {
    return cart.reduce((a, b) => a + b.default_price.unit_amount / 100, 0);
}

export default CartDrawer = (props) => {
    const navigation = useNavigation();
    const [cart, setCart] = useRecoilState(cartAtom);
    const resetCart = useResetRecoilState(cartAtom);
    const settings = useRecoilValue(settingsAtom);

    return (
        <View style={styles.cartDrawer}>
            <View style={styles.tile}>
                <Text style={styles.text}>{cart.length}</Text>
            </View>
            <View style={[styles.tile, { flex: 2 }]} >
                <Text style={styles.text}>{Utils.displayPrice(getCartTotal(cart), 'usd')}</Text>
            </View>
            <Pressable style={styles.tile} onPress={resetCart}>
                <FontAwesomeIcon icon={faDeleteLeft} color={'white'} size={32} />
            </Pressable>
            <Pressable style={[styles.tile, { flex: 2 }]} onPress={resetCart}>
                <FontAwesomeIcon icon={faCreditCard} color={'white'} size={32} />
                <Image source={require('../assets/contactless.png')} style={{ width: 32, height: 32, marginLeft: 10 }} />
            </Pressable>
        </View>

    )
}

const styles = {
    cartDrawer: {
        backgroundColor: colors.slate,
        padding: 10,
        height: 100,
        justifyContent: 'center',
        flexDirection: 'row'
    },
    tile: {
        flex: 1,
        borderWidth: 1,
        borderColor: 'white',
        borderRadius: 5,
        flexDirection: 'row',
        margin: 5,
        justifyContent: 'center',
        alignItems: 'center',
        
    },
    text:{
        color: 'white',
        fontSize: 20
    }
}