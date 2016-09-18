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
    WebView
} from 'react-native';

import Camera from 'react-native-camera';
import WebViewBridge from 'react-native-webview-bridge';
import ErrorPage from './ErrorPage';
import LoadingPage from './LoadingPage';
import Qiniu,{Auth,ImgOps,Conf,Rs,Rpc} from 'react-native-qiniu';
import Example from './Example';


export default class ExamplePage extends Component {
    constructor(props){
        super(props);

        this.state = {};
    }

    render(){
        return <Example />;
    }
}