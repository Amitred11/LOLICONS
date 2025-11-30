// screens/auth/ForgotPasswordScreen.js

// Import necessary modules from React, React Native, and third-party libraries.
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
    TouchableOpacity,
    Platform,
    StatusBar,
    Keyboard
} from 'react-native';
import { Colors } from '@config/Colors';
import StyledInput from '@components/ui/StyledInput';
import StyledButton from '@components/ui/StyledButton';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    withSpring,
    Easing,
    withRepeat,
    withSequence,
    interpolate,
} from 'react-native-reanimated';
import AnimatedShape from './components/AnimatedShape';

// --- CONFIGURABLE VALUE ---
// The amount (in pixels) the content should shift up when the keyboard is open.
const KEYBOARD_SHIFT = -110;

/**
 * Screen for users to request a password reset link.
 * Features a dynamic layout, keyboard avoidance, and a smooth transition to a success state.
 */
const ForgotPasswordScreen = ({ navigation }) => {
    // State for the form inputs and UI status.
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false); // Tracks if the email has been "sent".
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);

    // Animation values for UI elements.
    const headerOpacity = useSharedValue(0);
    const headerTranslateY = useSharedValue(40);
    const formOpacity = useSharedValue(0);
    const formTranslateY = useSharedValue(40);
    const footerOpacity = useSharedValue(0);
    const footerTranslateY = useSharedValue(40);
    const formShake = useSharedValue(0); // For validation error feedback.
    const contentTranslateY = useSharedValue(0); // For keyboard avoidance.
    // A single shared value to drive the transition between the form and the success message.
    const formSuccessTransition = useSharedValue(0); // 0 = form visible, 1 = success visible.

    // Effect for the initial "cascade in" animation when the screen loads.
    useEffect(() => {
        const springConfig = { damping: 18, stiffness: 100 };
        headerOpacity.value = withDelay(200, withTiming(1));
        headerTranslateY.value = withDelay(200, withSpring(0, springConfig));
        formOpacity.value = withDelay(400, withTiming(1));
        formTranslateY.value = withDelay(400, withSpring(0, springConfig));
        footerOpacity.value = withDelay(600, withTiming(1));
        footerTranslateY.value = withDelay(600, withSpring(0, springConfig));
    }, []);

    // Effect to set up and tear down keyboard visibility listeners.
    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    // Effect to animate UI elements based on keyboard visibility.
    useEffect(() => {
        const timingConfig = { duration: 300, easing: Easing.out(Easing.ease) };
        const springConfig = { damping: 18, stiffness: 120 };
        if (isKeyboardVisible) {
            headerOpacity.value = withTiming(0, timingConfig);
            headerTranslateY.value = withTiming(-50, timingConfig);
            contentTranslateY.value = withSpring(KEYBOARD_SHIFT, springConfig);
        } else {
            headerOpacity.value = withTiming(1, timingConfig);
            headerTranslateY.value = withTiming(0, timingConfig);
            contentTranslateY.value = withSpring(0, springConfig);
        }
    }, [isKeyboardVisible]);

    // This effect triggers the animation from the form to the success message.
    useEffect(() => {
        formSuccessTransition.value = withTiming(isSent ? 1 : 0, { duration: 400 });
    }, [isSent]);


    // Handles the form submission.
    const handleSendLink = () => {
        setError('');
        // Basic email validation.
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            setError('Please enter a valid email address.');
            // Trigger a shake animation for invalid input.
            formShake.value = withSequence(withTiming(-10, { duration: 50 }), withRepeat(withTiming(10, { duration: 100 }), 3, true), withTiming(0, { duration: 50 }));
            return;
        }
        setIsLoading(true);
        // --- Simulate an API call to send the reset link ---
        setTimeout(() => {
            setIsLoading(false);
            setIsSent(true); // Setting this to true will trigger the success animation.
            Keyboard.dismiss();
        }, 1500);
    };

    // Placeholder function for the resend link action.
    const handleResendLink = () => {
        console.log("Resend link logic would go here.");
        // Could add a small feedback message like "Link resent!"
    };

    // --- Animated Style Definitions ---
    const headerAnimatedStyle = useAnimatedStyle(() => ({ opacity: headerOpacity.value, transform: [{ translateY: headerTranslateY.value }] }));
    const formContainerAnimatedStyle = useAnimatedStyle(() => ({ opacity: formOpacity.value, transform: [{ translateY: formTranslateY.value }, {translateX: formShake.value}] }));
    const footerAnimatedStyle = useAnimatedStyle(() => ({ opacity: footerOpacity.value, transform: [{ translateY: footerTranslateY.value }] }));
    const contentAnimatedStyle = useAnimatedStyle(() => ({ transform: [{ translateY: contentTranslateY.value }] }));

    // Animate the form inputs out of view.
    const formViewAnimatedStyle = useAnimatedStyle(() => ({
        opacity: interpolate(formSuccessTransition.value, [0, 0.5], [1, 0]),
        transform: [{ translateY: interpolate(formSuccessTransition.value, [0, 1], [0, -30]) }],
    }));

    // Animate the success message into view.
    const successViewAnimatedStyle = useAnimatedStyle(() => ({
        opacity: formSuccessTransition.value,
        transform: [{ translateY: interpolate(formSuccessTransition.value, [0, 1], [30, 0]) }],
    }));

    return (
        <LinearGradient colors={[Colors.background, '#1a1a2e']} style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="light-content" />
                {/* Background animated shapes */}
                <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
                    <AnimatedShape size={280} color={Colors.secondary} initialX={-150} initialY={-80} delay={0} rotation />
                    <AnimatedShape size={250} color={Colors.primary} initialX={180} initialY={400} delay={300} />
                </View>

                {/* Back button */}
                <Animated.View style={[styles.backButtonContainer, headerAnimatedStyle]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={28} color={Colors.text} />
                    </TouchableOpacity>
                </Animated.View>

                {/* Main content container that shifts for the keyboard and uses space-between */}
                <Animated.View style={[styles.contentContainer, contentAnimatedStyle]}>
                    {/* Header section (empty view for spacing if needed) */}
                    <View />
                    
                    <Animated.View style={formContainerAnimatedStyle}>
                        {/* Header section */}
                        <Animated.View style={[styles.header, headerAnimatedStyle]}>
                            <View style={styles.iconBackground}>
                                <Ionicons name="mail-outline" size={40} color={Colors.primary} />
                            </View>
                            <Text style={styles.title}>Forgot Password?</Text>
                            <Text style={styles.subtitle}>Enter your email to receive a reset link.</Text>
                        </Animated.View>

                        {/* Form area that contains both the input form and the success message */}
                        <View style={styles.formArea}>
                            {/* Input form view (animates out) */}
                            <Animated.View style={[styles.formView, formViewAnimatedStyle]} pointerEvents={isSent ? 'none' : 'auto'}>
                                <StyledInput label="Email Address" icon="at" placeholder="you@example.com" value={email} onChangeText={setEmail} autoCapitalize="none" error={error} keyboardType="email-address"/>
                                {isLoading
                                    ? <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
                                    : <StyledButton title="Send Reset Link" onPress={handleSendLink} disabled={!email || isLoading} style={{ marginTop: 10 }} />
                                }
                            </Animated.View>

                            {/* Success message view (animates in) */}
                            <Animated.View style={[styles.successView, successViewAnimatedStyle]} pointerEvents={isSent ? 'auto' : 'none'}>
                               <Ionicons name="checkmark-circle-outline" size={60} color={Colors.secondary} />
                               <Text style={styles.successText}>Reset link sent!</Text>
                               <Text style={styles.successSubText}>Please check your inbox (and spam folder) for further instructions.</Text>
                               <TouchableOpacity onPress={handleResendLink} style={styles.resendButton}>
                                    <Text style={styles.resendText}>Didn't receive it? Resend link</Text>
                               </TouchableOpacity>
                            </Animated.View>
                        </View>
                    </Animated.View>
                    
                    {/* Footer section */}
                    <Animated.View style={[styles.footer, footerAnimatedStyle]}>
                        <Text style={styles.footerText}>Remember your password? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.linkText}>Log In</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </Animated.View>
            </SafeAreaView>
        </LinearGradient>
    );
};

// Styles for the component.
const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    backButtonContainer: { position: 'absolute', top: Platform.OS === 'ios' ? 60 : 40, left: 20, zIndex: 10 },
    backButton: { padding: 5 },
    contentContainer: {
        flex: 1,
        justifyContent: 'space-between', // Pushes header to top, footer to bottom
        paddingHorizontal: 30,
        paddingVertical: 40,
    },
    header: { alignItems: 'center', marginBottom: 30 },
    iconBackground: {
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)',
        marginBottom: 20,
    },
    title: { fontSize: 34, fontFamily: 'Poppins_700Bold', color: Colors.text, textAlign: 'center' },
    subtitle: { fontSize: 16, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, textAlign: 'center', marginTop: 8 },
    formArea: { minHeight: 180, justifyContent: 'center' }, // Container for both form and success views
    formView: { width: '100%' }, // Form view that animates out
    successView: {
        ...StyleSheet.absoluteFillObject, // Overlay on top of the form view
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 10,
    },
    loader: { height: 58, justifyContent: 'center' },
    successText: { fontFamily: 'Poppins_600SemiBold', fontSize: 24, color: Colors.text, marginTop: 15 },
    successSubText: { fontFamily: 'Poppins_400Regular', fontSize: 15, color: Colors.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 22 },
    resendButton: { marginTop: 20, padding: 10 },
    resendText: { fontFamily: 'Poppins_500Medium', color: Colors.secondary, fontSize: 14, textDecorationLine: 'underline' },
    footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    footerText: { color: Colors.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 15 },
    linkText: { color: Colors.secondary, fontFamily: 'Poppins_600SemiBold', fontSize: 15 },
});

export default ForgotPasswordScreen;