import { text } from "@fortawesome/fontawesome-svg-core";

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
        fontSize: defaults.fontSize,
    },
    spacedTextMuted: {
        marginBottom: 12,
        fontSize: defaults.fontSize,
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
    shadow: {
        elevation: 8,
        shadowColor: 'black',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.6,
        shadowRadius: 4,
    },
    modalView: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        paddingBottom: 100,
        marginTop: 120,
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
    buttons: {
        flexDirection: 'row',
        gap: 16,
        padding: 8
    },
    floatingMenu: {
        position: 'absolute',
        bottom: 10,
        left: 20,
        gap: 20,
        marginRight: -20
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
    },
    smallRoundIcon: {
        color: 'white',
        minWidth: 34,
        padding: 5,
        height: 34,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 17,
    },
    inlineButton: {
        color: 'white',
        width: 80,
        borderRadius: 20,
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 6,
        paddingBottom: 6,
        fontSize: 10,
        textAlign: 'center',
        marginTop: -3,
    }
};

