import React, { useEffect, memo } from 'react';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    withRepeat,
    withSequence,
    Easing,
    cancelAnimation
} from 'react-native-reanimated';

/**
 * Optimized Shape component.
 * Wrapped in React.memo to prevent re-renders when parent state (like TextInput) changes.
 */
const AnimatedShape = memo(({ size, color, initialX, initialY, delay, rotation, isRandom = false }) => {
    const translateX = useSharedValue(initialX);
    const translateY = useSharedValue(initialY);
    const scale = useSharedValue(1);
    const rotate = useSharedValue(0);

    useEffect(() => {
        const durationX = isRandom ? 4000 : 8000;
        const durationY = isRandom ? 3500 : 7000;
        const moveAmount = isRandom ? 40 : 20;

        translateX.value = withDelay(delay, withRepeat(withSequence(
            withTiming(initialX + moveAmount, { duration: durationX, easing: Easing.inOut(Easing.quad) }),
            withTiming(initialX - moveAmount, { duration: durationX, easing: Easing.inOut(Easing.quad) }),
            withTiming(initialX, { duration: durationX, easing: Easing.inOut(Easing.quad) })
        ), -1, true));

        translateY.value = withDelay(delay, withRepeat(withSequence(
            withTiming(initialY + moveAmount, { duration: durationY, easing: Easing.inOut(Easing.quad) }),
            withTiming(initialY - moveAmount, { duration: durationY, easing: Easing.inOut(Easing.quad) }),
            withTiming(initialY, { duration: durationY, easing: Easing.inOut(Easing.quad) })
        ), -1, true));

        scale.value = withDelay(delay, withRepeat(withSequence(
            withTiming(isRandom ? 1.2 : 1.1, { duration: 10000, easing: Easing.inOut(Easing.quad) }),
            withTiming(1, { duration: 10000, easing: Easing.inOut(Easing.quad) })
        ), -1, true));

        if (rotation) {
            rotate.value = withDelay(delay, withRepeat(withTiming(360, { duration: isRandom ? 20000 : 30000, easing: Easing.linear }), -1, false));
        }

        // Cleanup animations on unmount
        return () => {
            cancelAnimation(translateX);
            cancelAnimation(translateY);
            cancelAnimation(scale);
            cancelAnimation(rotate);
        };
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: scale.value },
            { rotate: `${rotate.value}deg` }
        ],
        position: 'absolute',
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: size / 2,
        opacity: 0.15,
    }));

    return <Animated.View style={animatedStyle} />;
});

export default AnimatedShape;