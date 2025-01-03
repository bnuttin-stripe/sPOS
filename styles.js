import { text } from "@fortawesome/fontawesome-svg-core";

export const themeColors = {
    wick:{
        primary: '#36455A',
        // primary: 'red',
        secondary: '#999C9B',
        tertiary: '#FFBB00',
        success: '#00C851',
        danger: '#ff4444',
        warning: '#ffbb33',
        info: '#33b5e5',
        light: '#F2F5F9',
    },
    boba:{
        primary: '#FFBB00',
        secondary: '#36455A',
        tertiary: '#999C9B',
        success: '#00C851',
        danger: '#ff4444',
        warning: '#ffbb33',
        info: '#33b5e5',
        light: '#F2F5F9',
    }
}

export const defaults = {
    fontSize: 16,
}

export const css = {
    app: {
        flex: 1,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'flex-start',
        flexDirection: 'column',
        backgroundColor: 'white',
    },
    container: {
        flex: 1,
        width: '100%',
        padding: 20,
    },
    defaultText: {
        fontSize: defaults.fontSize,
    },
    crossedText: {
        fontSize: defaults.fontSize,
        textDecorationLine: 'line-through',
    },
    cell: {
        paddingRight: 5,
    },
    cameraPreview: {
        height: '40%',
        zIndex: 100,
    },
    row: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        padding: 10,
    },
    spacedText: {
        marginBottom: 12,
        fontSize: defaults.fontSize + 1,
    },
    spacedTextMuted: {
        marginBottom: 12,
        fontSize: defaults.fontSize + 1,
        fontWeight: '300'
    },
    bold: {
        fontWeight: 'bold'
    },
    input: {
        marginBottom: 16,
        borderColor: "gray",
        width: "100%",
        borderWidth: 1,
        borderRadius: 5,
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 5,
        paddingBottom: 5,
        fontSize: defaults.fontSize,
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalView: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        paddingBottom: 100,
        marginTop: 120,
        elevation: 20,
        borderWidth: 1,
        borderColor: "lightgray",
    },
    title: {
        fontSize: 20,
        marginBottom: 20,
        marginTop: 10,
        fontWeight: 'bold',
        color: '#36455A'
    },
    floatingIcon: {
        position: 'absolute',
        color: 'white',
        minWidth: 50,
        padding: 15,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 25,
        shadownColor: 'black',
        elevation: 8,
    },
    smallRoundIcon:{
        color: 'white',
        minWidth: 34,
        padding: 5,
        height: 34,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 17,
        shadownColor: 'black',
        elevation: 8,
    },
    inlineButton: {
        color: 'white', 
        width: 70, 
        borderRadius: 20, 
        paddingLeft: 10, 
        paddingRight: 10, 
        paddingTop: 6, 
        paddingBottom: 6, 
        fontSize: 10,
        textAlign: 'center',
        marginTop: -3
    }
};

