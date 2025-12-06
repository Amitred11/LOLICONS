// screens/auth/RegisterScreen.js

import React, { useState, useEffect } from 'react';
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
    withRepeat, withSpring, Easing,
} from 'react-native-reanimated';
import AnimatedShape from './components/AnimatedShape';

const KEYBOARD_SHIFT = -110;

const RegisterScreen = ({ navigation }) => {
    const { register, isLoading } = useAuth();
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({}); 
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);

    // --- NEW STATE ---
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
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
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

    const validateForm = () => {
        const newErrors = {};
        if (!name) newErrors.name = 'Name is required.';
        if (!email) newErrors.email = 'Email is required.';
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid.';
        if (!password) newErrors.password = 'Password is required.';
        else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = () => {
        if (validateForm()) {
            if (register) {
                register({ name, email, password });
            }
        } else {
            formShake.value = withSequence(withTiming(-10, { duration: 50 }), withRepeat(withTiming(10, { duration: 100 }), 3, true), withTiming(0, { duration: 50 }));
        }
    };

    const handleInputChange = (field, value, setter) => {
        setter(value);
        if (errors[field]) {
            const newErrors = { ...errors };
            delete newErrors[field];
            setErrors(newErrors);
        }
    };

    const headerAnimatedStyle = useAnimatedStyle(() => ({ opacity: headerOpacity.value, transform: [{ translateY: headerTranslateY.value }] }));
    const formAnimatedStyle = useAnimatedStyle(() => ({ opacity: formOpacity.value, transform: [{ translateY: formTranslateY.value }, { translateX: formShake.value }] }));
    const footerAnimatedStyle = useAnimatedStyle(() => ({ opacity: footerOpacity.value, transform: [{ translateY: footerTranslateY.value }] }));
    const contentAnimatedStyle = useAnimatedStyle(() => ({ transform: [{ translateY: contentTranslateY.value }] }));

    const isFormIncomplete = !name || !email || !password;

    return (
        <LinearGradient colors={[Colors.background, '#1a1a2e']} style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="light-content" />
                <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
                    <AnimatedShape size={250} color={Colors.primary} initialX={200} initialY={-80} delay={0} rotation />
                    <AnimatedShape size={300} color={Colors.secondary} initialX={-120} initialY={450} delay={500} />
                    <AnimatedShape size={180} color={Colors.primary} initialX={50} initialY={200} delay={1000} rotation />
                </View>

                <Animated.View style={[styles.backButtonContainer, headerAnimatedStyle]}>
                    <TouchableOpacity onPress={() => navigation.navigate('Welcome')} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={28} color={Colors.text} />
                    </TouchableOpacity>
                </Animated.View>

                <Animated.View style={[styles.contentContainer, contentAnimatedStyle]}>
                    <Animated.View style={[styles.header, headerAnimatedStyle]}>
                        <View style={styles.iconBackground}>
                            <Ionicons name="person-add-outline" size={40} color={Colors.primary} />
                        </View>
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>Let's get you started!</Text>
                    </Animated.View>

                    <Animated.View style={[styles.formContainer, formAnimatedStyle]}>
                        <StyledInput label="Full Name" icon="person-outline" placeholder="John Doe" value={name} onChangeText={(text) => handleInputChange('name', text, setName)} error={errors.name} />
                        <StyledInput label="Email Address" icon="at" placeholder="you@example.com" value={email} onChangeText={(text) => handleInputChange('email', text, setEmail)} keyboardType="email-address" autoCapitalize="none" error={errors.email} />
                        
                        {/* --- PASSWORD INPUT UPDATED --- */}
                        <StyledInput 
                            label="Password" 
                            icon="lock-closed-outline" 
                            placeholder="Minimum 6 characters" 
                            value={password} 
                            onChangeText={(text) => handleInputChange('password', text, setPassword)} 
                            secureTextEntry={!isPasswordVisible}
                            rightIcon={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
                            onRightIconPress={() => setPasswordVisible(!isPasswordVisible)}
                            error={errors.password} 
                        />
                        {/* ----------------------------- */}

                        {isLoading
                            ? <ActivityIndicator size="large" color={Colors.primary} style={{ height: 58, justifyContent: 'center' }}/>
                            : <StyledButton title="Sign Up" onPress={handleRegister} disabled={isFormIncomplete || isLoading} style={{ marginTop: 10 }} />
                        }
                    </Animated.View>

                    <Animated.View style={[styles.footer, footerAnimatedStyle]}>
                        <Text style={styles.footerText}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.linkText}>Log In</Text>
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
    contentContainer: { flex: 1, justifyContent: 'center', paddingHorizontal: 30, gap: 25 },
    header: { alignItems: 'center' },
    iconBackground: {
        width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', marginBottom: 20,
    },
    title: { fontSize: 36, fontFamily: 'Poppins_700Bold', color: Colors.text, textAlign: 'center' },
    subtitle: { fontSize: 16, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, textAlign: 'center', marginTop: 8 },
    formContainer: {},
    footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    footerText: { color: Colors.textSecondary, fontFamily: 'Poppins_400Regular', fontSize: 15 },
    linkText: { color: Colors.secondary, fontFamily: 'Poppins_600SemiBold', fontSize: 15 },
});

export default RegisterScreen;