import React, {Component} from 'react';
import {
    AppRegistry,
    PanResponder,
    StyleSheet,
    View,
    processColor,
} from 'react-native';

var DragableOpacity = React.createClass({
    _panResponder: {},
    _previousRight: 0,
    _previousTop: 0,
    _circleStyles: {},
    view: (null : ?{ setNativeProps(props: Object): void }),

    componentWillMount: function() {
        this._panResponder = PanResponder.create({
            onStartShouldSetPanResponder: this._handleStartShouldSetPanResponder,
            onMoveShouldSetPanResponder: this._handleMoveShouldSetPanResponder,
            onPanResponderGrant: this._handlePanResponderGrant,
            onPanResponderMove: this._handlePanResponderMove,
            onPanResponderRelease: this._handlePanResponderEnd,
            onPanResponderTerminate: this._handlePanResponderEnd,
        });
        this._circleStyles = this.props.position ? this.props.position :
                {style: {right: this._previousRight, top: this._previousTop}};
    },

    componentDidMount: function() {
        this._updateNativeStyles();
    },

    render: function() {
        return (
            <View
                ref={(view) => {this.view = view}}
                style={this.props.style ? this.props.style : styles.view}
                {...this._panResponder.panHandlers}
            >
                {this.props.children}
            </View>
        );
    },


    _updateNativeStyles: function() {
        this.view && this.view.setNativeProps(this._circleStyles);
    },

    _handleStartShouldSetPanResponder: function(e: Object, gestureState: Object): boolean {
        return true;
    },

    _handleMoveShouldSetPanResponder: function(e: Object, gestureState: Object): boolean {
        return true;
    },

    // 拖动开始时调用
    _handlePanResponderGrant: function(e: Object, gestureState: Object) {
        
    },

    // 拖动时调用
    _handlePanResponderMove: function(e: Object, gestureState: Object) {
        this._circleStyles.style.right = this._previousRight - gestureState.dx;
        this._circleStyles.style.top = this._previousTop + gestureState.dy;
        this._updateNativeStyles();
    },

    // 拖动结束
    _handlePanResponderEnd: function(e: Object, gestureState: Object) {
        this._previousRight -= gestureState.dx;
        this._previousTop += gestureState.dy;
    },
});

const styles = StyleSheet.create({
    view: {
        height: 80,
        width: 70
    },
});

module.exports = DragableOpacity;