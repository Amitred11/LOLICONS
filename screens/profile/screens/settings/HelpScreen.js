// screens/profile/HelpScreen.js

// Import essential modules from React, React Native, and third-party libraries.
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, TextInput, Linking, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { faqData, contactTopics } from '../../../../constants/mockData';
import { useModal } from '../../../../context/ModalContext';
// Import necessary functions and components from Reanimated for animations.
import Animated, { useSharedValue, useAnimatedStyle, withTiming, measure, runOnUI, interpolate, Extrapolate, useAnimatedScrollHandler, useAnimatedRef } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

// --- Animation Constants ---
// Define the dimensions for the collapsible header animation.
const HEADER_HEIGHT = 250; // The fully expanded height of the header.
const COLLAPSED_HEADER_HEIGHT = 60; // The height of the header when collapsed.
const SCROLL_DISTANCE = HEADER_HEIGHT - COLLAPSED_HEADER_HEIGHT; // The scroll distance over which the animation occurs.

/**
 * A component representing a single, expandable FAQ item.
 * @param {object} props - The component props.
 * @param {object} props.item - The FAQ data object containing a question 'q' and an answer 'a'.
 */
const FaqItem = ({ item }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    // Shared values to animate the answer's height and the chevron icon's rotation.
    const answerHeight = useSharedValue(0);
    const animatedRotation = useSharedValue(0);
    // An animated ref is used to measure the layout of the answer text on the UI thread.
    const answerRef = useAnimatedRef();

    // Toggles the accordion, animating it open or closed.
    const toggle = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (isExpanded) {
            // If expanded, collapse it by animating height to 0.
            animatedRotation.value = withTiming(0);
            answerHeight.value = withTiming(0);
        } else {
            // If collapsed, expand it by measuring the content and animating to that height.
            animatedRotation.value = withTiming(180);
            // `runOnUI` and `measure` work together to get the dynamic height of the answer content.
            runOnUI(() => { 'worklet'; answerHeight.value = withTiming(measure(answerRef).height); })();
        }
        setIsExpanded(!isExpanded);
    };

    // Animated styles that are driven by the shared values.
    const animatedAnswerStyle = useAnimatedStyle(() => ({ height: answerHeight.value, opacity: answerHeight.value > 0 ? 1 : 0 }));
    const animatedIconStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${animatedRotation.value}deg` }] }));

    return (
        <View style={styles.rowBorder}>
            <TouchableOpacity onPress={toggle} style={styles.row}>
                <Text style={styles.rowLabel}>{item.q}</Text>
                <Animated.View style={animatedIconStyle}><Ionicons name="chevron-down" size={20} color={Colors.textSecondary} /></Animated.View>
            </TouchableOpacity>
            <Animated.View style={[styles.answerContainer, animatedAnswerStyle]}>
                {/* The answer text is positioned absolutely so it can be measured without affecting the layout. */}
                <View ref={answerRef} style={{ position: 'absolute' }}><Text style={styles.answerText}>{item.a}</Text></View>
            </Animated.View>
        </View>
    );
};

/** A simple, styled card for the "Contact & Legal" section. */
const TopicCard = ({ item, onPress }) => (
    <TouchableOpacity onPress={onPress} style={styles.topicCard}>
        <BlurView intensity={25} tint="dark" style={styles.glassEffect} />
        <Ionicons name={item.icon} size={28} color={Colors.secondary} />
        <Text style={styles.topicLabel}>{item.label}</Text>
    </TouchableOpacity>
);


/**
 * The main "Help & Support" screen, featuring a collapsible header, search, and FAQ list.
 */
const HelpScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredFaqs, setFilteredFaqs] = useState(faqData);
    const scrollY = useSharedValue(0);
    const isSearching = searchQuery.length > 0;
    const { show: showModal } = useModal(); 

    // This effect filters the FAQ data whenever the search query changes.
    useEffect(() => {
        if (isSearching) {
            setFilteredFaqs(faqData.filter(faq => faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || faq.a.toLowerCase().includes(searchQuery.toLowerCase())));
        } else {
            setFilteredFaqs(faqData);
        }
    }, [searchQuery]);

    const handleTopicAction = (action) => {
        if (!action) return;

        switch (action.type) {
            case 'modal':
                // If the type is 'modal', call the showModal function with the provided details.
                showModal(action.modalName, action.modalProps);
                break;
            case 'link':
                // If the type is 'link', use the Linking API to open the URL.
                Linking.openURL(action.url);
                break;
            default:
                console.warn("Unknown action type:", action.type);
        }
    };
    
    // An animated scroll handler to track the user's scroll position.
    const scrollHandler = useAnimatedScrollHandler((event) => { scrollY.value = event.contentOffset.y; });

    // --- Animation Styles ---
    // Interpolates the scroll position to control the header's height.
    const animatedHeaderStyle = useAnimatedStyle(() => ({ height: interpolate(scrollY.value, [0, SCROLL_DISTANCE], [insets.top + HEADER_HEIGHT, insets.top + COLLAPSED_HEADER_HEIGHT], Extrapolate.CLAMP) }));
    // Fades out the large header title as the user scrolls up.
    const animatedLargeHeaderStyle = useAnimatedStyle(() => ({
        opacity: interpolate(scrollY.value, [0, SCROLL_DISTANCE / 2], [1, 0], Extrapolate.CLAMP),
        transform: [{ translateY: interpolate(scrollY.value, [0, SCROLL_DISTANCE], [0, -30], Extrapolate.CLAMP) }]
    }));
    // Moves the search bar up, creating the illusion that it's sticking to the top as the header collapses.
    const animatedSearchBarStyle = useAnimatedStyle(() => {
        const translateY = interpolate(scrollY.value, [0, SCROLL_DISTANCE], [0, -75], Extrapolate.CLAMP);
        return { transform: [{ translateY }] };
    });

    return (
        <LinearGradient colors={[Colors.background, '#1a1a2e']} style={styles.container}>
            <StatusBar barStyle="light-content" />
            
            {/* The animated header that sits on top of the scrollable content. */}
            <Animated.View style={[styles.header, animatedHeaderStyle]}>
                 <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
                 <View style={[styles.headerContent, { paddingTop: insets.top }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { top: insets.top + 5 }]}><Ionicons name="arrow-back" size={24} color={Colors.text} /></TouchableOpacity>
                    <View style={styles.headerTitleWrapper}>
                        {/* The large, disappearing title section */}
                        <Animated.View style={[styles.largeHeaderContent, animatedLargeHeaderStyle]} pointerEvents="none">
                            <View style={styles.iconContainer}><Ionicons name="help-buoy-outline" size={40} color={Colors.secondary} /></View>
                            <Text style={styles.supportTitle}>How can we help?</Text>
                        </Animated.View>

                        {/* The search bar that animates into its collapsed position */}
                        <Animated.View style={[styles.searchBarWrapper, animatedSearchBarStyle]}>
                            <View style={styles.searchBarContainer}>
                                <Ionicons name="search" size={20} color={Colors.textSecondary} />
                                <TextInput placeholder="Search help articles..." placeholderTextColor={Colors.textSecondary} style={styles.searchInput} value={searchQuery} onChangeText={setSearchQuery}/>
                                {isSearching && <TouchableOpacity style={styles.clearButton} onPress={() => setSearchQuery('')}><Ionicons name="close-circle" size={20} color={Colors.textSecondary} /></TouchableOpacity>}
                            </View>
                        </Animated.View>
                    </View>
                 </View>
            </Animated.View>

            {/* The main scrollable content of the screen. */}
            <Animated.ScrollView onScroll={scrollHandler} scrollEventThrottle={16} contentContainerStyle={{ paddingTop: insets.top + HEADER_HEIGHT, paddingBottom: insets.bottom + 20 }}>
                <View style={styles.content}>
                    <Text style={styles.sectionTitle}>{isSearching ? `Results for "${searchQuery}"` : "Frequently Asked Questions"}</Text>
                    <View style={styles.card}>
                        {filteredFaqs.length > 0 ? (
                            filteredFaqs.map((item, index) => <FaqItem key={index} item={item} />)
                        ) : (
                            <View style={styles.emptyStateContainer}><Ionicons name="sad-outline" size={40} color={Colors.textSecondary}/><Text style={styles.emptyStateText}>No results found.</Text></View>
                        )}
                    </View>
                    
                    {/* The "Contact & Legal" section is hidden when the user is actively searching. */}
                    {!isSearching && (
                        <>
                            <Text style={styles.sectionTitle}>Contact & Legal</Text>
                            <View style={styles.topicGrid}>
                                {contactTopics.map(item => <TopicCard key={item.label} item={item} onPress={() => handleTopicAction(item.action)} />)}
                            </View>
                        </>
                    )}
                </View>
            </Animated.ScrollView>
        </LinearGradient>
    );
};

// --- Stylesheet ---
const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1, overflow: 'hidden', borderBottomWidth: StyleSheet.hairlineWidth, borderColor: Colors.surface + '80' },
    headerContent: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
    backButton: { position: 'absolute', left: 15, padding: 10 },
    headerTitleWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' },
    largeHeaderContent: { alignItems: 'center', marginBottom: 20 },
    iconContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    supportTitle: { fontFamily: 'Poppins_700Bold', color: Colors.text, fontSize: 28, textAlign: 'center' },
    searchBarWrapper: { width: '90%' },
    searchBarContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 22, height: 44, paddingHorizontal: 15 },
    searchInput: { flex: 1, color: Colors.text, fontFamily: 'Poppins_400Regular', fontSize: 16 },
    clearButton: { paddingLeft: 5 },
    content: { padding: 20, gap: 20 },
    sectionTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.textSecondary, fontSize: 14, textTransform: 'uppercase', marginBottom: -5, marginLeft: 5 },
    card: { borderRadius: 16, overflow: 'hidden', backgroundColor: 'rgba(28,28,30,0.7)', borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.surface + '80' },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15 },
    rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.1)' },
    rowLabel: { fontFamily: 'Poppins_500Medium', color: Colors.text, fontSize: 16, flex: 1, marginRight: 10 },
    answerContainer: { overflow: 'hidden' },
    answerText: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 15, lineHeight: 22, paddingHorizontal: 15, paddingBottom: 15 },
    emptyStateContainer: { padding: 30, alignItems: 'center', gap: 10 },
    emptyStateText: { fontFamily: 'Poppins_500Medium', color: Colors.textSecondary, fontSize: 16 },
    topicGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    topicCard: { width: '48.5%', aspectRatio: 1, borderRadius: 16, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.surface + '80', marginBottom: '3%', justifyContent: 'center', alignItems: 'center', padding: 15, gap: 10 },
    glassEffect: { ...StyleSheet.absoluteFillObject },
    topicLabel: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 15, textAlign: 'center' },
});

export default HelpScreen;