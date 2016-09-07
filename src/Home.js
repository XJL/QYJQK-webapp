import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    Dimensions,
    TouchableHighlight,
    WebView,
    BackAndroid,
    Platform,
    ToastAndroid,
    CookieManager,
    StatusBar
} from 'react-native';

import Camera from 'react-native-camera';

const DEFAULT_URL = 'http://www.qyjqk.com/mb/index/exam';

export default class Home extends Component {
    constructor(props){
        super(props);

        // 最后一次点击返回键的时间戳
        this.lastBackPressed = null;

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
        this.timer = setInterval(() => {
            try{
                if(this.camera) {
                    this.camera.capture()
                        .then((data) => {
                            console.log('data---->', data);
                        });
                }
            }
            catch(error){
                console.log('capture error', error);
            }
        }, 60000);
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

    render() {
        return (
            <View style={styles.container}>
                <StatusBar
                    translucent={true}
                    hidden={true}
                />
                <WebView
                    ref={web=>this.webview=web}
                    source={{uri: DEFAULT_URL}}
                    style={styles.jqkweb}
                    startInLoadingState={true}
                    renderLoading={()=><View style={styles.loading}><Text style={styles.loadingText}>正在加载...</Text></View>}
                    onNavigationStateChange={(navState) => this.onNavigationStateChange(navState)}
                    scalesPageToFit={this.state.scalesPageToFit}
                />
                <Camera
                    ref={cam => this.camera = cam}
                    captureQuality='low'
                    captureTarget={Camera.constants.CaptureTarget.temp}
                    type="front"
                    style={styles.preview}
                    aspect={Camera.constants.Aspect.fill}
                    playSoundOnCapture={false}
                />
            </View>
        );
    }

    onNavigationStateChange(navState) {
        const itemNo = this.getItemName(navState.url, 'exam');
        const userId = this.getUserId(navState.url);

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

            console.log('test-------->', itemNO);
            return itemNO;
        }
        return 0;
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

            console.log('userId-------->',  userId);
            return userId;
        }
        else {
            return 0;
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
            this.webview.goBack();
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
