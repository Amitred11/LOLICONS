import React, { useEffect } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay } from 'react-native-reanimated';

const AnimatedSection = ({ children, index }) => {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(30);

    useEffect(() => {
        opacity.value = withDelay(index * 150, withTiming(1, { duration: 400 }));
        translateY.value = withDelay(index * 150, withTiming(0, { duration: 400 }));
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));

    return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};

export default AnimatedSection;