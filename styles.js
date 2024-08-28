export const colors = {
    blurple: '#7A73FF',
    yellow: '#FFBB00',
    slate: '#425466'
}

export const css = {
    app: {
        flex: 1,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
    },
    container: {
        flex: 1,
        width: '100%',
        padding: 20,

    },
    cameraPreview: {
        // margin: 15,
        height: '40%',
        borderWidth: 2,
        borderColor: colors.slate
    },
    row: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        padding: 10,
    },
    label: {
        marginBottom: 8
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
        paddingBottom: 5
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
    buttonText: {
        color: 'white',
        marginLeft: 10
    },
    loader: {
        justifyContent: 'center',
        flexDirection: 'column',
        height: '100%'
    },
    hello: {
        color: 'red',
    }
};

