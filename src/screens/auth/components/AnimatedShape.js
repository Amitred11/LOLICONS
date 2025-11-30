import React, { useEffect } from 'react';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    withRepeat,
    withSequence,
    Easing,
} from 'react-native-reanimated';

/**
 * A reusable component for creating floating, animated background shapes.
 * 
 * @param {number} size - Width and height of the shape.
 * @param {string} color - Background color of the shape.
 * @param {number} initialX - Starting X position.
 * @param {number} initialY - Starting Y position.
 * @param {number} delay - Delay in ms before animation starts.
 * @param {boolean} rotation - If true, the shape will rotate continuously.
 * @param {boolean} isRandom - If true, applies slightly more chaotic movement (used in WelcomeScreen).
 */
const AnimatedShape = ({ size, color, initialX, initialY, delay, rotation, isRandom = false }) => {
    // Shared values for animating position, scale, and rotation.
    const translateX = useSharedValue(initialX);
    const translateY = useSharedValue(initialY);
    const scale = useSharedValue(1);
    const rotate = useSharedValue(0);

    useEffect(() => {
        // Determine animation parameters based on randomness
        const durationX = isRandom ? 4000 : 8000;
        const durationY = isRandom ? 3500 : 7000;
        const moveAmount = isRandom ? 40 : 20; // Random mode moves further

        // Animate X position (Loop: Right -> Left -> Center)
        translateX.value = withDelay(delay, withRepeat(withSequence(
            withTiming(initialX + moveAmount, { duration: durationX, easing: Easing.inOut(Easing.quad) }),
            withTiming(initialX - moveAmount, { duration: durationX, easing: Easing.inOut(Easing.quad) }),
            withTiming(initialX, { duration: durationX, easing: Easing.inOut(Easing.quad) })
        ), -1, true));

        // Animate Y position (Loop: Down -> Up -> Center)
        translateY.value = withDelay(delay, withRepeat(withSequence(
            withTiming(initialY + moveAmount, { duration: durationY, easing: Easing.inOut(Easing.quad) }),
            withTiming(initialY - moveAmount, { duration: durationY, easing: Easing.inOut(Easing.quad) }),
            withTiming(initialY, { duration: durationY, easing: Easing.inOut(Easing.quad) })
        ), -1, true));

        // Animate Scale (Breathing effect)
        scale.value = withDelay(delay, withRepeat(withSequence(
            withTiming(isRandom ? 1.2 : 1.1, { duration: 10000, easing: Easing.inOut(Easing.quad) }),
            withTiming(1, { duration: 10000, easing: Easing.inOut(Easing.quad) })
        ), -1, true));

        // Animate Rotation if enabled
        if (rotation) {
            rotate.value = withDelay(delay, withRepeat(withTiming(360, { duration: isRandom ? 20000 : 30000, easing: Easing.linear }), -1, false));
        }
    }, []);

    // Create the animated style object
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
};

export default AnimatedShape;