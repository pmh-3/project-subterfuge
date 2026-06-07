const React = require('react');

const mockComponent = (name) => {
  const Comp = React.forwardRef(({ children, ...props }, ref) =>
    React.createElement(name, { ...props, ref }, children),
  );
  Comp.displayName = name;
  return Comp;
};

const AnimatedValue = function AnimatedValue(initial) {
  this._value = initial;
  this.interpolate = () => '0%';
};
AnimatedValue.prototype.setValue = function setValue() {};

module.exports = {
  Platform: {
    OS: 'ios',
    select: (obj) => obj.ios ?? obj.default ?? obj.web,
  },
  StyleSheet: {
    create: (styles) => styles,
    flatten: (style) => style,
    absoluteFillObject: {},
    hairlineWidth: 1,
  },
  View: mockComponent('View'),
  Text: mockComponent('Text'),
  TextInput: mockComponent('TextInput'),
  Modal: ({ children, visible }) => (visible ? children : null),
  ScrollView: mockComponent('ScrollView'),
  Pressable: ({ children, onPress, onPressIn, onPressOut, disabled, testID, ...rest }) =>
    React.createElement(
      'Pressable',
      {
        ...rest,
        testID,
        disabled,
        onClick: disabled ? undefined : onPress,
        onMouseDown: disabled ? undefined : onPressIn,
        onMouseUp: disabled ? undefined : onPressOut,
        onTouchStart: disabled ? undefined : onPressIn,
        onTouchEnd: disabled ? undefined : onPressOut,
      },
      children,
    ),
  ActivityIndicator: mockComponent('ActivityIndicator'),
  Animated: {
    Value: AnimatedValue,
    View: mockComponent('Animated.View'),
    timing: (_value, _config) => ({
      start: (callback) => {
        callback?.();
      },
    }),
    sequence: (animations) => ({
      start: (callback) => {
        animations.forEach((a) => a.start?.());
        callback?.();
      },
      stop: () => {},
    }),
    loop: (animation) => ({
      start: () => animation.start?.(),
      stop: () => {},
    }),
  },
  KeyboardAvoidingView: mockComponent('KeyboardAvoidingView'),
  Share: { share: jest.fn() },
  Touchable: { Mixin: {} },
  TouchableOpacity: mockComponent('TouchableOpacity'),
  TouchableWithoutFeedback: mockComponent('TouchableWithoutFeedback'),
};
