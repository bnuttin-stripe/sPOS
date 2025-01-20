import { React, useEffect, useState } from 'react';
import { Platform, Text, TextInput, View, Pressable, ScrollView, Linking, Switch } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { NetworkInfo } from 'react-native-network-info';
import { useNavigation } from '@react-navigation/native';

import { useRecoilState, useRecoilValue, useResetRecoilState } from 'recoil';
import { settingsAtom, themesAtom, logAtom } from '../atoms';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faSave, faChevronLeft, faMobile, faTrash } from '@fortawesome/pro-solid-svg-icons';

import AsyncStorage from '@react-native-async-storage/async-storage';

import * as Utils from '../utilities';
import { css, themeColors } from '../styles';

export default LogViewer = (props) => {
    const log = useRecoilValue(logAtom);
    const resetLog = useResetRecoilState(logAtom);
    const settings = useRecoilValue(settingsAtom);
    const themes = useRecoilValue(themesAtom);
    const colors = themes[settings.theme]?.colors;
    const navigation = useNavigation();

    return (
        <View style={css.container}>
            <ScrollView>
                {log.toReversed().map(row => (
                    <View key={row.time} style={{ marginBottom: 10 }}>
                        <View>
                            <Text style={{ fontWeight: 'bold' }}>{Utils.displayDateTime(row.time / 1000)} - {row.title}</Text>
                        </View>
                        <View style={{}}>
                            <Text style={{ fontFamily: Platform.OS == 'ios' ? 'Courier New' : 'monospace', fontSize: 14 }}>{row.body}</Text>
                        </View>
                    </View>
                ))}
            </ScrollView>

            <Pressable style={[css.floatingIcon, css.shadow, { left: 20, bottom: 20, backgroundColor: colors.secondary, flexDirection: 'row' }]} onPress={() => navigation.navigate("App", { page: "Settings" })}>
                <FontAwesomeIcon icon={faChevronLeft} color={'white'} size={20} />
            </Pressable>

            <Pressable style={[css.floatingIcon, css.shadow, { left: 80, bottom: 20, backgroundColor: colors.secondary, flexDirection: 'row' }]} onPress={resetLog}>
                <FontAwesomeIcon icon={faTrash} color={'white'} size={20} />
                <Text style={{ color: 'white', fontSize: 16, marginLeft: 5 }}>Empty Log</Text>
            </Pressable>
        </View>
    );
};
