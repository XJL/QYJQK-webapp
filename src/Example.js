import React from 'react';
import {
    AppRegistry,
    PanResponder,
    StyleSheet,
    View,
    processColor,
} from 'react-native';
var CIRCLE_SIZE = 80;
var CIRCLE_COLOR = 'blue';
var CIRCLE_HIGHLIGHT_COLOR = 'green';
var Example = React.createClass({
    statics: {
        title: 'PanResponder Sample',
        description: 'Shows the use of PanResponder to provide basic gesture handling.',
    },
    _panResponder: {},
    _previousLeft: 0,
    _previousTop: 0,
    _circleStyles: {},
    circle: (null : ?{ setNativeProps(props: Object): void }),
componentWillMount: function() {
    this._panResponder = PanResponder.create({
        onStartShouldSetPanResponder: (evt, gestureState) => true,
        onMoveShouldSetPanResponder: (evt, gestureState) => true,
        onPanResponderGrant: this._handlePanResponderGrant,
        onPanResponderMove: this._handlePanResponderMove,
        onPanResponderRelease: this._handlePanResponderEnd,
        onPanResponderTerminate: this._handlePanResponderEnd,
    });
    this._previousLeft = 20;
    this._previousTop = 84;
    this._circleStyles = {
        style: {
            left: this._previousLeft,
            top: this._previousTop
        }
    };
},
componentDidMount: function() {
    this._updatePosition();
},
render: function() {
    return (
        <View style={styles.container}>
            <View
                ref={(circle) => {
            this.circle = circle;
          }}
                style={styles.circle}
                {...this._panResponder.panHandlers}
            />
        </View>
    );
},
_highlight: function() {
    const circle = this.circle;
    circle && circle.setNativeProps({
        style: {
            backgroundColor: processColor(CIRCLE_HIGHLIGHT_COLOR)
        }
    });
},
_unHighlight: function() {
    const circle = this.circle;
    circle && circle.setNativeProps({
        style: {
            backgroundColor: processColor(CIRCLE_COLOR)
        }
    });
},
_updatePosition: function() {
    console.log('???');
    this.circle && this.circle.setNativeProps(this._circleStyles);
},
_handlePanResponderGrant: function(e: Object, gestureState: Object) {
    this._highlight();
},
_handlePanResponderMove: function(e: Object, gestureState: Object) {
    this._circleStyles.style.left = this._previousLeft + gestureState.dx;
    this._circleStyles.style.top = this._previousTop + gestureState.dy;
    this._updatePosition();
},
_handlePanResponderEnd: function(e: Object, gestureState: Object) {
    this._unHighlight();
    this._previousLeft += gestureState.dx;
    this._previousTop += gestureState.dy;
},
});
var styles = StyleSheet.create({
    circle: {
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        borderRadius: CIRCLE_SIZE / 2,
        backgroundColor: CIRCLE_COLOR,
        position: 'absolute',
        left: 0,
        top: 0,
    },
    container: {
        flex: 1,
        paddingTop: 64,
    },
});


module.exports = Example;