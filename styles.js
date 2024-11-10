export const colors = {
    blurple: '#635BFF',
    paleblurple: '#7A73FF',
    yellow: '#FFBB00',
    slate: '#425466',
    white: '#fff',
    //primary: '#0D1E15',
    primary: '#36455A',
    secondary: '#999C9B',
    tertiary: '#FFBB00',
    success: '#00C851',
    danger: '#ff4444',
    warning: '#ffbb33',
    info: '#33b5e5',
    light: '#F2F5F9',
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
        width: '80%',
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
    button: {
        height: 50,
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 5,
        margin: -10,
        marginTop: 10,
        paddingLeft: 20,
        paddingRight: 20,
        marginRight: 20
    },
    smallButton: {
        height: 30,
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 5,
        margin: -10,
        marginTop: 10,
        paddingLeft: 20,
        paddingRight: 20,
        marginRight: 20
    },
    buttonText: {
        color: 'white',
        marginLeft: 10
    },
    loader: {
        justifyContent: 'center',
        flexDirection: 'column',
        height: '100%'
    },
    tableHeader:{
        borderBottomWidth: 2,
    },
    title: {
        fontSize: 20,
        marginBottom:20,
        marginTop: 10,
        fontWeight: 'bold',
        color: colors.slate
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
};

