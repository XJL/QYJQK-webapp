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
import Qiniu,{Auth,ImgOps,Conf,Rs,Rpc} from 'react-native-qiniu';

// const DEFAULT_URL = 'http://www.qyjqk.com/mb/index/exam';
const DEFAULT_URL = 'http://120.26.55.126/index2.html';

const test = {
    token: 'VEY_f42Tf3lEIpeqkfb_6ZBhTGbkMwb3i39D15Wz:8lzPBRqC8WLLg0HfkhhXhnkByhA=:eyJzY29wZSI6InRlc3RzcGFjZSIsImRlYWRsaW5lIjoxNDczNzQ4NTA4fQ==',
    AK: '',
    SK: '',
};

const injectScript = `
(function () {
    if (WebViewBridge) {

        WebViewBridge.onMessage = function (message) {
            if (message === "hello from react-native") {
                WebViewBridge.send("got the message inside webview");
            }
            alert(message);
        };

        WebViewBridge.send("hello from webview");
    }
}());
`;

export default class Home extends Component {
    constructor(props){
        super(props);

        // 最后一次点击返回键的时间戳
        this.lastBackPressed = null;

        // 考试id
        this.examId = null;
        // 考生id
        this.userId = null;
        // 照片序号
        this.key = 0;


        this.state = {
            url: DEFAULT_URL,
            status: 'No Page Loaded',
            backButtonEnabled: false,
            forwardButtonEnabled: false,
            scalesPageToFit: true,
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

        // 设置定时器，每隔60s拍一张照
        this.timer = setInterval(async function(){
            try{
                if(this.camera){
                    this.camera.capture().then((data) => {
                        console.log('data---->');

                        // const uptoken = test.token;
                        //
                        // this.key++;
                        //
                        // const formInput = {
                        //     key: this.key,
                        //     file : {uri: data.path, type: 'application/octet-stream',
                        //         name: this.examId + '-' + this.userId + '-' + this.key + '.jpg'},
                        // };
                        //
                        // Rpc.uploadFile(data.path, uptoken, formInput)
                        //     .then((response) => {
                        //         console.log('success---->');
                        //         return response.text();
                        //     })
                        //     .then((responseText) => {
                        //         console.log('upload success', responseText);
                        //     })
                        //     .catch((error)=>{
                        //         console.log('upload error', error)
                        //     });

                    });
                }
                else {
                    this.key = 0;
                }
            }
            catch(error){
                console.log('capture error', error);
            }
        }.bind(this), 60000);
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

        // 移除定时器
        if(this.timer){
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    onBridgeMessage(message){
        switch (message) {
            case "hello from webview":
                this.webviewbridge.sendToBridge("hello from react-native");
                break;
            case "got the message inside webview":
                console.log("we have got a message from webview! yeah");
                break;
        }
    }

    // 根据url判断是否显示镜头
    showCamera(url){
        // url里包含exam 和 play的时候开启摄像头
        if((url.indexOf('exam') > -1) && (url.indexOf('play'))> -1){
            return true;
        }
        return false;
    }

    render() {
        return (
            <View style={styles.container}>
                <StatusBar
                    translucent={true}
                    hidden={true}
                />
                <WebViewBridge
                    onBridgeMessage={this.onBridgeMessage.bind(this)}
                    injectedJavaScript={injectScript}
                    ref={webviewbridge=>this.webviewbridge=webviewbridge}
                    source={{uri: DEFAULT_URL}}
                    style={styles.jqkweb}
                    startInLoadingState={true}
                    renderLoading={()=><View style={styles.loading}><Text style={styles.loadingText}>正在加载...</Text></View>}
                    onNavigationStateChange={(navState) => this.onNavigationStateChange(navState)}
                    scalesPageToFit={this.state.scalesPageToFit}
                />
                {
                    this.showCamera(this.state.url) &&
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

    onNavigationStateChange(navState) {
        console.log('url---->', navState.url);
        this.examId = this.getItemName(navState.url, 'exam');
        this.userId = this.getUserId(navState.url);

        this.setState({
            url: navState.url,
            backButtonEnabled: navState.canGoBack,
            forwardButtonEnabled: navState.canGoForward,
            status: navState.title,
            scalesPageToFit: true
        });
    }

    // 获取项目参数
    getItemName(url, itemName){
        const index = url.indexOf(itemName + '/');

        if(index > -1){
            const numStart = index + (itemName.length + 1);
            const numLen = url.substring(numStart).indexOf('/');

            const itemNO = url.substring(numStart, numStart + numLen);

            return itemNO;
        }
        return null;
    }

    // 获取用户的id
    getUserId(url){
        const index = url.indexOf('param2');

        if(index > -1){
            const idStart = index + 'param2='.length;
            let idLen = 0;
            const endIndex = url.substring(idStart).indexOf('&')
            if(endIndex > -1){
                idLen = endIndex;
            }
            else {
                idLen = url.substring(idStart).length;
            }
            const userId = url.substring(idStart, idStart + idLen);

            return userId;
        }
        else {
            return null;
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
