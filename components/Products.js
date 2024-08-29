import { React, useState, useEffect } from 'react';
import { Text, View, Pressable, ScrollView, RefreshControl, Vibration } from 'react-native';
import * as Utils from '../utilities';
import { DataTable } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useRecoilState, useRecoilValue } from 'recoil';
import { cartAtom, productAtom, settingsAtom } from '../atoms';
import { css, colors } from '../styles';
import CartDrawer from './CartDrawer';

export default Products = (props) => {
    const navigation = useNavigation();
    const [refreshing, setRefreshing] = useState(false);
    const [products, setProducts] = useRecoilState(productAtom);
    const [cart, setCart] = useRecoilState(cartAtom);
    const settings = useRecoilValue(settingsAtom);

    const numInCart = (product) => {
        return cart.filter(x => (x == product)).length;
    }

    const Row = (product) => {
        return (
            <Pressable key={product.id} onPress={() => setCart([...cart, product])}>
                <DataTable.Row>
                    <DataTable.Cell style={{ flex: 6, paddingRight: 5 }}>
                        <Text style={{ fontWeight: numInCart(product) > 0 ? 'bold' : 'normal' }}>
                            {product.name}
                        </Text>
                    </DataTable.Cell>
                    <DataTable.Cell style={{ flex: 1 }} numeric>
                        <Text style={{ fontWeight: numInCart(product) > 0 ? 'bold' : 'normal' }}>
                            {Utils.displayPrice(product.default_price.unit_amount / 100, 'usd')}
                        </Text>
                    </DataTable.Cell>
                    <DataTable.Cell style={{ flex: 1 }} numeric>
                        <Text style={{ fontWeight: numInCart(product) > 0 ? 'bold' : 'normal' }}>
                            {numInCart(product)}
                        </Text>
                    </DataTable.Cell>
                </DataTable.Row>
            </Pressable >
        )
    }

    const getProducts = async () => {
        setRefreshing(true);
        const response = await fetch(settings.backendUrl + '/products', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const data = await response.json();
        setProducts(data);
        setRefreshing(false);
    };

    useEffect(() => {
        getProducts();
    }, []);

    return (
        <View style={[css.container, { padding: 0 }]}>
            <DataTable style={{ flex: 1 }}>
                <DataTable.Header style={css.tableHeader}>
                    <DataTable.Title style={{ flex: 5 }}>Product</DataTable.Title>
                    <DataTable.Title style={{ flex: 1 }} numeric>Price</DataTable.Title>
                    <DataTable.Title style={{ flex: 1 }} numeric>In Cart</DataTable.Title>
                </DataTable.Header>
                <ScrollView
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={getProducts}
                            progressViewOffset={150}
                            colors={['white']}
                            progressBackgroundColor={'#425466'}
                        />
                    }
                >
                    {products.length > 0 && products.map && products.map((product) => Row(product))}
                </ScrollView>
            </DataTable>
            <CartDrawer />
        </View>
    )
}
