import { React } from 'react';
import { Text, Pressable, ActivityIndicator, Platform, Vibration } from 'react-native';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';

// props:
// action: function to call when pressed
// color: background color
// icon: if specified, icon to show
// text: if specified, text to show
// large: true or false
// refreshing: true or false
// transform: optional
export default Button = (props) => {
    const styles = {
        button: {
            backgroundColor: props.disabled ? props.disabledColor : props.color,
            flexDirection: 'row',
            borderRadius: 100,
            paddingVertical: props.large ? 16 : 16,
            paddingHorizontal: props.large ? 20 : 16,
            alignItems: 'center',
            elevation: 4,
            shadowColor: 'black',
            shadowOffset: { width: 1, height: 1 },
            shadowOpacity: 0.6,
            shadowRadius: 4,
        },
        text: {
            color: 'white',
            fontSize: props.large ? 20 : 16,
            marginVertical: -4,
            marginLeft: 10
        }
    }

    const press = () => {
        Vibration.vibrate(250);
        props.action();
    }

    return (
        <Pressable style={styles.button} onPress={press} disabled={props.disabled} >
            {props?.refreshing && <ActivityIndicator size={Platform.OS == 'android' ? "small" : 18} color="white" />}
            {props.icon && !props?.refreshing && <FontAwesomeIcon icon={props.icon} color={'white'} size={props.large ? 22 : 18} transform={props.transform} />}
            {props.image}
            {props.text && <Text style={[styles.text, props.textStyle]}>{props.text}</Text>}
        </Pressable >
    )
}

