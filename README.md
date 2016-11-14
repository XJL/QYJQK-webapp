#注意点

##1. 使用了React-Native-WebView-Bridge组件，有些部分需要修改。

###a. node_modules/react-native-webview-bridge/webview-bridge/index.android.js。
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
      
    (4) React.findNodeHandle改为 findNodeHandle
      
###b. node_modules/react-native-webview-bridge/webview-bridge/index.ios.js。
    (1) 修改头部
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
        NativeModules: {
          WebViewBridgeManager
        },
        findNodeHandle,
      }  = require('react-native');
    (2) 中间修改 findNodeHandle前面的React类去掉
      getWebViewBridgeHandle: function(): any {
        return findNodeHandle(this.refs[RCT_WEBVIEWBRIDGE_REF]);
      },
      
###c. node_modules/react-native-webview-bridge/android/src/main/java/com/github/alinz/reactnativewebviewbridge/WebViewBridgeManager.java
    整个改为：
package com.github.alinz.reactnativewebviewbridge;

import android.webkit.WebView;

import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.views.webview.ReactWebViewManager;
import com.facebook.react.views.webview.WebViewConfig;

import java.util.Map;

import javax.annotation.Nullable;

public class WebViewBridgeManager extends ReactWebViewManager {
  private static final String REACT_CLASS = "RCTWebViewBridge";

  public static final int COMMAND_INJECT_BRIDGE_SCRIPT = 100;
  public static final int COMMAND_SEND_TO_BRIDGE = 101;

  private boolean initializedBridge;

  public WebViewBridgeManager() {
    super();
    initializedBridge = false;
  }

  public WebViewBridgeManager(WebViewConfig webViewConfig) {
    super(webViewConfig);
    initializedBridge = false;
  }

  @Override
  public String getName() {
    return REACT_CLASS;
  }

  @Override
  public @Nullable Map<String, Integer> getCommandsMap() {
    Map<String, Integer> commandsMap = super.getCommandsMap();

    commandsMap.put("injectBridgeScript", COMMAND_INJECT_BRIDGE_SCRIPT);
    commandsMap.put("sendToBridge", COMMAND_SEND_TO_BRIDGE);

    return commandsMap;
  }

  @Override
  public void receiveCommand(WebView root, int commandId, @Nullable ReadableArray args) {
    super.receiveCommand(root, commandId, args);

    switch (commandId) {
      case COMMAND_INJECT_BRIDGE_SCRIPT:
        injectBridgeScript(root);
        break;
      case COMMAND_SEND_TO_BRIDGE:
        sendToBridge(root, args.getString(0));
        break;
      default:
        //do nothing!!!!
    }
  }

  private void sendToBridge(WebView root, String message) {
    //root.loadUrl("javascript:(function() {\n" + script + ";\n})();");
    String script = "WebViewBridge.onMessage('" + message + "');";
    WebViewBridgeManager.evaluateJavascript(root, script);
  }

  private void injectBridgeScript(WebView root) {
    //this code needs to be called once per context
    if (!initializedBridge) {
      root.addJavascriptInterface(new JavascriptBridge((ReactContext) root.getContext()), "WebViewBridgeAndroid");
      initializedBridge = true;
      root.reload();
    }

    // this code needs to be executed everytime a url changes.
    WebViewBridgeManager.evaluateJavascript(root, ""
            + "(function() {"
            + "if (window.WebViewBridge) return;"
            + "var customEvent = document.createEvent('Event');"
            + "var WebViewBridge = {"
            + "send: function(message) { WebViewBridgeAndroid.send(message); },"
            + "onMessage: function() {}"
            + "};"
            + "window.WebViewBridge = WebViewBridge;"
            + "customEvent.initEvent('WebViewBridge', true, true);"
            + "document.dispatchEvent(customEvent);"
            + "}());");
  }

  static private void evaluateJavascript(WebView root, String javascript) {
    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.KITKAT) {
      root.evaluateJavascript(javascript, null);
    } else {
      root.loadUrl("javascript:" + javascript);
    }
  }
}
      
    
