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

export default class ErrorPage extends Component{
    constructor(props){
        super(props);
    }

    render(){
        return(
            <View style={styles.container}>
                <View style={styles.bar}>
                    <Text style={styles.backText} onPress={()=>this.onBack()}>{'返回'}</Text>
                </View>
                <View style={styles.content}>
                    <Text style={styles.contentText} onPress={()=>this.onReload()}>{this.props.errorText}</Text>
                </View>
            </View>
        );
    }
    
    onBack(){
        this.props.onBack && this.props.onBack();
    }

    onReload(){
        this.props.onReload && this.props.onReload();
    }


}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    bar: {
        height: 55,
        justifyContent: 'center',
        borderBottomWidth: 1/PixelRatio.get()
    },
    backText: {
        fontSize: 20,
        marginLeft: 20,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    contentText: {
        fontSize: 20
    }
});