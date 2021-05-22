import React from 'react';
import {View} from 'react-native';

const LableGestureBox = props => {
  const [rootTouch, setRootTouch] = React.useState(null);

  const onMoveShouldSetResponder = evt => {
    // console.log(evt);
    setRootTouch(evt.nativeEvent);
    console.log('Touch started');
    if (props.onMoveEvtStart) props.onMoveEvtStart();
    return true;
  };

  const onStartShouldSetResponder = evt => {
    // console.log(evt);
    // return false;
  };

  const onResponderMove = evt => {
    if (rootTouch == null) return;
    const newTouch = evt.nativeEvent;
    const xDisplacement = rootTouch.locationX - newTouch.locationX;
    console.log(xDisplacement);
    if (props.onMove) props.onMove(xDisplacement);
  };

  const onResponderRelease = evt => {
    setRootTouch(null);
    console.log('Touch ended');
    if (props.onMoveEvtEnd) props.onMoveEvtEnd();
  };
  return (
    <View
      onMoveShouldSetResponder={onMoveShouldSetResponder}
      onResponderMove={onResponderMove}
      onResponderRelease={onResponderRelease}>
      {props.children}
    </View>
  );
};

export default LableGestureBox;
