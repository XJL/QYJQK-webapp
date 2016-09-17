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

// const DEFAULT_URL = 'http://www.qyjqk.com/mb/index/exam';

// 测试
const DEFAULT_URL = 'http://www.kaasworld.com/jqk/test/mb/index/exam?param1=6';

// 注入的js方法
const injectScript = `
(function () {
    if (WebViewBridge) {
         if(reactInit){
            reactInit( WebViewBridge );
        }
    }
}());
`;

export default class Home extends Component {
    constructor(props){
        super(props);

        this.state = {
            url: DEFAULT_URL,
            backButtonEnabled: false,
            forwardButtonEnabled: false,
            scalesPageToFit: true,
            showCamera: false
        };
    }

    componentWillMount(){
        // 添加返回键的监听
        if (Platform.OS === 'android') {
            try {
                BackAndroid.addEventListener('hardwareBackPress', this.onBackAndroid.bind(this));
            }
            catch (error) {
                console.log('add event listener error', error.message);
            }
        }
    }

    componentWillUnmount(){
        if(Platform.OS == 'android'){
            try {
                BackAndroid.removeEventListener('hardwareBackPress', this.onBackAndroid.bind(this));
            }
            catch (error){
                console.log('remove event listener error', error.message);
            }
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <StatusBar translucent={true} hidden={true}/>
                <WebViewBridge
                    onBridgeMessage={this.onBridgeMessage.bind(this)}
                    injectedJavaScript={injectScript}
                    ref={webviewbridge=>this.webviewbridge=webviewbridge}
                    source={{uri: DEFAULT_URL}}
                    style={styles.jqkweb}
                    startInLoadingState={true}
                    renderLoading={()=><LoadingPage />}
                    renderError={()=><ErrorPage onBack={()=>this.webviewbridge.goBack()}
                        errorText={"加载失败，点击重试..."} onReload={()=>this.webviewbridge.reload()}/>}
                    onNavigationStateChange={(navState) => this.onNavigationStateChange(navState)}
                    scalesPageToFit={this.state.scalesPageToFit}
                    javaScriptEnabled={true}
                />
                {
                    this.state.showCamera &&
                    <Camera
                        ref={cam => this.camera = cam}
                        captureQuality='low'
                        captureTarget={Camera.constants.CaptureTarget.temp}
                        type="front"
                        style={styles.preview}
                        aspect={Camera.constants.Aspect.fill}
                        playSoundOnCapture={false}
                    />
                }
            </View>
        );
    }

    // webview桥接受msg方法
    onBridgeMessage(message){
        console.log('onBridgeMessage---->');

        if(message){
            this.webviewbridge.sendToBridge(
            ` {
                code: 0,
                obj: {
                   url: ''
                }
              }`
            );
            this.getDataFromMessage(message);
        }

    }

    // 解析网页传过来的msg
    getDataFromMessage(message){
        const jsonObj = eval("("+message+")");
        console.log(jsonObj);

        this.userId = jsonObj.obj.userId,
        this.uptoken = jsonObj.obj.token;
        this.prefix = jsonObj.obj.prefix;

        // code=0打开摄像头
        if(jsonObj.code == 0) {
            this.setState({showCamera: true});

            setTimeout(()=>this.captureAndUploadImage(), 2000);
            // 设置定时器，每隔60s拍一张照
            this.timer = setInterval(async function(){
                this.captureAndUploadImage();
            }.bind(this), 60 * 1000);
        }
    }

    captureAndUploadImage(){
        if(this.camera) {
            this.camera.capture()
                .then((data) => {
                    console.log('capture---->');

                    if(this.uptoken) {
                        const formInput = {
                            file : {uri: data.path, type: 'application/octet-stream',
                                name: `${this.prefix}${Date.now()}.jpg`},
                        };

                        Rpc.uploadFile(data.path, this.uptoken, formInput)
                            .then((response) => {
                                return response.text();
                            })
                            .then((responseText) => {
                                console.log('upload success', responseText);
                            })
                            .catch((error)=> {
                                console.log('upload error', error.message);
                            });
                    }
            })
            .catch((error)=>{
                console.log("capture error", error.message);
            });
        }
    }

    onNavigationStateChange(navState) {
        console.log('url---->', navState.url);

        this.setState({
            url: navState.url,
            backButtonEnabled: navState.canGoBack,
            forwardButtonEnabled: navState.canGoForward,
            scalesPageToFit: true,
            showCamera: false
        });

        // url改变就移除计时器
        if(this.timer){
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    onBackAndroid() {
        // 首页返回键弹出toast
        if(!this.state.backButtonEnabled) {
            // 2秒内连续点击
            if (this.lastBackPressed && (this.lastBackPressed + 2000 >= Date.now())) {
                // 退出应用
                BackAndroid.exitApp();
            }
            // 其他情况
            else {
                ToastAndroid.show('再按一次退出应用', 2000);
                this.lastBackPressed = Date.now();
            }
        }
        // 浏览过程中返回键回到上个页面
        else {
            this.webviewbridge.goBack();
        }
        return true;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    jqkweb: {
        height: Dimensions.get('window').height,
        width: Dimensions.get('window').width,
    },
    preview: {
        position: 'absolute',
        bottom: 10,
        left: 10,
        height: 80,
        width: 70,
        justifyContent: 'flex-end'
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
