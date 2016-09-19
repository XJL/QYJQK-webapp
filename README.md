#注意点

1. 使用了React-Native-WebView-Bridge组件，有些部分需要修改
  a. node_modules/react-native-webview-bridge/webview-bridge/index.android.js
    (1) 把头部修改成
      import React, { Component } from 'react';
      var invariant = require('invariant');
      var keyMirror = require('keymirror');
      var merge = require('merge');
      var resolveAssetSource = require('react-native/Libraries/Image/resolveAssetSource');
      var {PropTypes} = React;
      var {
          ActivityIndicatorIOS,
          EdgeInsetsPropType,
          StyleSheet,
          Text,
          View,
          WebView,
          requireNativeComponent,
          UIManager,
          DeviceEventEmitter,
          NativeModules: {
              WebViewBridgeManager
          },
          findNodeHandle,
      }  = require('react-native');
      
      var RCT_WEBVIEWBRIDGE_REF = 'webviewbridge';
    (2) WebViewBridge类中添加一个listener对象，并复制给监听对象
      var WebViewBridge = React.createClass({
      listener:null,  <------
      propTypes: {
        ...WebView.propTypes,
    
        /**
         * Will be called once the message is being sent from webview
         */
        onBridgeMessage: PropTypes.func,
      },
      
      ......
      
      componentWillMount: function() {
        this.listener=DeviceEventEmitter.addListener("webViewBridgeMessage", (body) => {  <--------
          const { onBridgeMessage } = this.props;
          const message = body.message;
          if (onBridgeMessage) {
            onBridgeMessage(message);
          }
        });
    
        if (this.props.startInLoadingState) {
          this.setState({viewState: WebViewBridgeState.LOADING});
        }
      },
    (3) 在挂载的时候销毁listener
      componentWillUnmount:function(){
        this.listener.remove();
        this.listener=null;
      },
    
