import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Dimensions,
    BackAndroid,
    Platform,
    ToastAndroid,
    StatusBar,
    WebView,
    PixelRatio
} from 'react-native';

export default class LoadingPage extends Component{
    constructor(props){
        super(props);
    }

    render(){
        return(
            <View style={styles.loading}>
                <Text style={styles.loadingText}>正在加载...</Text>
            </View>
        );
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    loading: {
        height: Dimensions.get('window').height,
        width: Dimensions.get('window').width,
        justifyContent: 'center',
        alignItems: 'center'
    },
    loadingText: {
        textAlign: 'center',
        fontSize: 20,
    },
});