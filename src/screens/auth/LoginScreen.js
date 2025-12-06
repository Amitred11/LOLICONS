import React, { useState, useEffect, useMemo } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, ActivityIndicator, TouchableOpacity,
    Platform, StatusBar, Keyboard
} from 'react-native';
import { Colors } from '@config/Colors';
import StyledInput from '@components/ui/StyledInput';
import StyledButton from '@components/ui/StyledButton';
import { useAuth } from '@context/main/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue, useAnimatedStyle, withTiming, withDelay, withSequence,
    withRepeat, withSpring, Easing, interpolate,
} from 'react-native-reanimated';
import AnimatedShape from './components/AnimatedShape';

const KEYBOARD_SHIFT = -97;
const SOCIAL_BUTTONS_HEIGHT = 50;
const DIVIDER_MARGIN_BOTTOM = 20;

const LoginScreen = ({ navigation }) => {
    const { login, isLoading } = useAuth();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    const [socialsExpanded, setSocialsExpanded] = useState(false);
    const [isPasswordVisible, setPasswordVisible] = useState(false);

    // Animation values
    const headerOpacity = useSharedValue(0);
    const headerTranslateY = useSharedValue(40);
    const formOpacity = useSharedValue(0);
    const formTranslateY = useSharedValue(40);
    const footerOpacity = useSharedValue(0);
    const footerTranslateY = useSharedValue(40);
    const formShake = useSharedValue(0); 
    const contentTranslateY = useSharedValue(0);
    const socialVisibility = useSharedValue(0); 

    useEffect(() => {
        const springConfig = { damping: 18, stiffness: 100 };
        headerOpacity.value = withDelay(200, withTiming(1));
        headerTranslateY.value = withDelay(200, withSpring(0, springConfig));
        formOpacity.value = withDelay(400, withTiming(1));
        formTranslateY.value = withDelay(400, withSpring(0, springConfig));
        footerOpacity.value = withDelay(600, withTiming(1));
        footerTranslateY.value = withDelay(600, withSpring(0, springConfig));
    }, []);

    useEffect(() => {
        const show = () => setKeyboardVisible(true);
        const hide = () => setKeyboardVisible(false);
        const k1 = Keyboard.addListener('keyboardDidShow', show);
        const k2 = Keyboard.addListener('keyboardDidHide', hide);
        return () => { k1.remove(); k2.remove(); };
    }, []);

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

    useEffect(() => {
        const config = { duration: 350, easing: Easing.bezier(0.25, 0.1, 0.25, 1) };
        socialVisibility.value = withTiming(socialsExpanded ? 1 : 0, config);
    }, [socialsExpanded]);

    const handleLogin = () => {
        if (!email || !password) {
            setError('Please fill in both fields.');
            formShake.value = withSequence(withTiming(-10, { duration: 50 }), withRepeat(withTiming(10, { duration: 100 }), 3, true), withTiming(0, { duration: 50 }));
        } else {
            setError('');
            login({ email, password });
        }
    };

    const headerAnimatedStyle = useAnimatedStyle(() => ({ opacity: headerOpacity.value, transform: [{ translateY: headerTranslateY.value }] }));
    const formAnimatedStyle = useAnimatedStyle(() => ({ opacity: formOpacity.value, transform: [{ translateY: formTranslateY.value }, { translateX: formShake.value }] }));
    const footerAnimatedStyle = useAnimatedStyle(() => ({ opacity: footerOpacity.value, transform: [{ translateY: footerTranslateY.value }] }));
    const contentAnimatedStyle = useAnimatedStyle(() => ({ transform: [{ translateY: contentTranslateY.value }] }));
    
    const socialButtonsAnimatedStyle = useAnimatedStyle(() => ({
        opacity: socialVisibility.value,
        transform: [{ scale: interpolate(socialVisibility.value, [0, 1], [0.95, 1]) }],
        height: interpolate(socialVisibility.value, [0, 1], [0, SOCIAL_BUTTONS_HEIGHT]),
        overflow: 'hidden',
    }));
    
    const dividerAnimatedStyle = useAnimatedStyle(() => ({
        marginBottom: interpolate(socialVisibility.value, [0, 1], [0, DIVIDER_MARGIN_BOTTOM]),
    }));

    // Memoize backgrounds so they don't re-render when typing
    const backgroundShapes = useMemo(() => (
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
            <AnimatedShape size={300} color={Colors.primary} initialX={-100} initialY={-100} delay={0} rotation />
            <AnimatedShape size={250} color={Colors.secondary} initialX={220} initialY={350} delay={300} />
        </View>
    ), []);

    return (
        <LinearGradient colors={[Colors.background, '#1a1a2e']} style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="light-content" />
                {backgroundShapes}

                <Animated.View style={[styles.backButtonContainer, headerAnimatedStyle]}>
                    <TouchableOpacity onPress={() => navigation.navigate('Welcome')} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={28} color={Colors.text} />
                    </TouchableOpacity>
                </Animated.View>

                <Animated.View style={[styles.contentContainer, contentAnimatedStyle]}>
                    <Animated.View style={[styles.header, headerAnimatedStyle]}>
                        <View style={styles.logoBackground}>
                            <Ionicons name="bonfire-outline" size={40} color={Colors.primary} />
                        </View>
                        <Text style={styles.title}>Welcome Back</Text>
                        <Text style={styles.subtitle}>Log in to continue your journey.</Text>
                    </Animated.View>

                    <Animated.View style={[styles.formContainer, formAnimatedStyle]}>
                        <StyledInput 
                            label="Email Address" 
                            icon="at" 
                            placeholder="you@example.com" 
                            value={email} 
                            onChangeText={setEmail} 
                            autoCapitalize="none" 
                            error={error && !email ? 'Email is required' : null} 
                            onFocus={() => setSocialsExpanded(false)}
                        />
                        <StyledInput 
                            label="Password" 
                            icon="lock-closed-outline" 
                            placeholder="Enter your password" 
                            value={password} 
                            onChangeText={setPassword} 
                            secureTextEntry={!isPasswordVisible}
                            rightIcon={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
                            onRightIconPress={() => setPasswordVisible(!isPasswordVisible)}
                            error={error && !password ? 'Password is required' : null} 
                            onFocus={() => setSocialsExpanded(false)}
                        />

                        <StyledButton 
                            title="Log In" 
                            onPress={handleLogin} 
                            disabled={!email || !password || isLoading} 
                            style={{ marginTop: 5 }} 
                        />
                    </Animated.View>

                    <Animated.View style={formAnimatedStyle}>
                       <TouchableOpacity style={styles.forgotPasswordContainer} onPress={() => navigation.navigate('ForgotPassword')}>
                            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                        </TouchableOpacity>
                    </Animated.View>

                    <View style={styles.socialLoginContainer}>
                        <Animated.View style={dividerAnimatedStyle}>
                           <TouchableOpacity style={styles.dividerContainer} onPress={() => setSocialsExpanded(prev => !prev)}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>
                                    {socialsExpanded ? 'OR' : 'More login options'}
                                </Text>
                                <View style={styles.dividerLine} />
                            </TouchableOpacity>
                        </Animated.View>
                        
                        <Animated.View style={socialButtonsAnimatedStyle}>
                            <View style={styles.socialButtonsContainer}>
                                <TouchableOpacity style={styles.socialButton}><Ionicons name="logo-google" size={24} color={Colors.text} /></TouchableOpacity>
                                <TouchableOpacity style={styles.socialButton}><Ionicons name="logo-github" size={24} color={Colors.text} /></TouchableOpacity>
                                <TouchableOpacity style={styles.socialButton}><Ionicons name="logo-facebook" size={24} color={Colors.text} /></TouchableOpacity>
                            </View>
                        </Animated.View>
                    </View>

                    <Animated.View style={[styles.footer, footerAnimatedStyle]}>
                        <Text style={styles.footerText}>Not a member yet? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                            <Text style={styles.linkText}>Register now</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </Animated.View>
            </SafeAreaView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    backButtonContainer: { position: 'absolute', top: Platform.OS === 'ios' ? 60 : 40, left: 20, zIndex: 10 },
    backButton: { padding: 5 },
    contentContainer: { flex: 1, justifyContent: 'center', paddingHorizontal: 30, gap: 15 },
    header: { alignItems: 'center' },
    logoBackground: {
        width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', marginBottom: 20,
    },
    title: { fontSize: 38, fontFamily: 'Poppins_700Bold', color: Colors.text, textAlign: 'center' },
    subtitle: { fontSize: 16, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, textAlign: 'center', marginTop: 8 },
    formContainer: {},
    forgotPasswordContainer: { alignItems: 'flex-end' },
    forgotPasswordText: { color: Colors.textSecondary, fontFamily: 'Poppins_500Medium', fontSize: 14 },
    socialLoginContainer: {},
    dividerContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
    dividerLine: { flex: 1, height: 1, backgroundColor: Colors.textSecondary, opacity: 0.3 },
    dividerText: { color: Colors.secondary, fontFamily: 'Poppins_500Medium' },
    socialButtonsContainer: { height: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 20 },
    socialButton: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)' },
    footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    footerText: { color: Colors.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 15 },
    linkText: { color: Colors.secondary, fontFamily: 'Poppins_600SemiBold', fontSize: 15 },
});

export default LoginScreen;