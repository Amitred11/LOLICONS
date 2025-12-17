import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, TextInput, Linking, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@config/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useModal } from '@context/other/ModalContext';
import Animated, { useSharedValue, useAnimatedStyle, interpolate, Extrapolate, useAnimatedScrollHandler } from 'react-native-reanimated';
import { ProfileAPI } from '@api/MockProfileService';
// IMPORTS
import { FaqItem, TopicCard } from '../../components/settings/HelpComponents';

const HEADER_HEIGHT = 250;
const COLLAPSED_HEADER_HEIGHT = 60;
const SCROLL_DISTANCE = HEADER_HEIGHT - COLLAPSED_HEADER_HEIGHT;

const HelpScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { show: showModal } = useModal(); 
    
    const [isLoading, setIsLoading] = useState(true);
    const [faqs, setFaqs] = useState([]);
    const [filteredFaqs, setFilteredFaqs] = useState([]);
    const [contactTopics, setContactTopics] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    
    const scrollY = useSharedValue(0);
    const isSearching = searchQuery.length > 0;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [faqRes, topicsRes] = await Promise.all([
                    ProfileAPI.getFAQ(),
                    ProfileAPI.getContactTopics()
                ]);
                
                if (faqRes.success) { setFaqs(faqRes.data); setFilteredFaqs(faqRes.data); }
                if (topicsRes.success) { setContactTopics(topicsRes.data); }
            } catch (error) {
                console.error("HelpScreen fetch error:", error);
                Alert.alert("Error", "An unexpected error occurred.");
            } finally { setIsLoading(false); }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (isSearching) {
            setFilteredFaqs(faqs.filter(faq => 
                faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
                faq.a.toLowerCase().includes(searchQuery.toLowerCase())
            ));
        } else { setFilteredFaqs(faqs); }
    }, [searchQuery, faqs]);

    const handleTopicAction = (action) => {
        if (!action) return;
        switch (action.type) {
            case 'modal': showModal(action.modalName, action.modalProps); break;
            case 'link': Linking.openURL(action.url); break;
            case 'email': Linking.openURL(`mailto:${action.email}`); break;
            default: console.warn("Unknown action type:", action.type);
        }
    };
    
    const scrollHandler = useAnimatedScrollHandler((event) => { scrollY.value = event.contentOffset.y; });
    const animatedHeaderStyle = useAnimatedStyle(() => ({ height: interpolate(scrollY.value, [0, SCROLL_DISTANCE], [insets.top + HEADER_HEIGHT, insets.top + COLLAPSED_HEADER_HEIGHT], Extrapolate.CLAMP) }));
    const animatedLargeHeaderStyle = useAnimatedStyle(() => ({
        opacity: interpolate(scrollY.value, [0, SCROLL_DISTANCE / 2], [1, 0], Extrapolate.CLAMP),
        transform: [{ translateY: interpolate(scrollY.value, [0, SCROLL_DISTANCE], [0, -30], Extrapolate.CLAMP) }]
    }));
    const animatedSearchBarStyle = useAnimatedStyle(() => {
        const translateY = interpolate(scrollY.value, [0, SCROLL_DISTANCE], [0, -75], Extrapolate.CLAMP);
        return { transform: [{ translateY }] };
    });

    return (
        <LinearGradient colors={[Colors.background, '#1a1a2e']} style={styles.container}>
            <StatusBar barStyle="light-content" />
            
            <Animated.View style={[styles.header, animatedHeaderStyle]}>
                 <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
                 <View style={[styles.headerContent, { paddingTop: insets.top }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { top: insets.top + 5 }]}><Ionicons name="arrow-back" size={24} color={Colors.text} /></TouchableOpacity>
                    <View style={styles.headerTitleWrapper}>
                        <Animated.View style={[styles.largeHeaderContent, animatedLargeHeaderStyle]} pointerEvents="none">
                            <View style={styles.iconContainer}><Ionicons name="help-buoy-outline" size={40} color={Colors.secondary} /></View>
                            <Text style={styles.supportTitle}>How can we help?</Text>
                        </Animated.View>
                        <Animated.View style={[styles.searchBarWrapper, animatedSearchBarStyle]}>
                            <View style={styles.searchBarContainer}>
                                <Ionicons name="search" size={20} color={Colors.textSecondary} />
                                <TextInput placeholder="Search help articles..." placeholderTextColor={Colors.textSecondary} style={styles.searchInput} value={searchQuery} onChangeText={setSearchQuery} />
                                {isSearching && <TouchableOpacity style={styles.clearButton} onPress={() => setSearchQuery('')}><Ionicons name="close-circle" size={20} color={Colors.textSecondary} /></TouchableOpacity>}
                            </View>
                        </Animated.View>
                    </View>
                 </View>
            </Animated.View>

            <Animated.ScrollView onScroll={scrollHandler} scrollEventThrottle={16} contentContainerStyle={{ paddingTop: insets.top + HEADER_HEIGHT, paddingBottom: insets.bottom + 20 }}>
                {isLoading ? (
                    <View style={styles.loadingContainer}><ActivityIndicator size="large" color={Colors.secondary} /></View>
                ) : (
                    <View style={styles.content}>
                        <Text style={styles.sectionTitle}>{isSearching ? `Results for "${searchQuery}"` : "Frequently Asked Questions"}</Text>
                        <View style={styles.card}>
                            {filteredFaqs.length > 0 ? (
                                filteredFaqs.map((item, index) => <FaqItem key={index} item={item} />)
                            ) : (
                                <View style={styles.emptyStateContainer}><Ionicons name="sad-outline" size={40} color={Colors.textSecondary}/><Text style={styles.emptyStateText}>No results found.</Text></View>
                            )}
                        </View>
                        
                        {!isSearching && contactTopics.length > 0 && (
                            <>
                                <Text style={styles.sectionTitle}>Contact & Legal</Text>
                                <View style={styles.topicGrid}>
                                    {contactTopics.map(item => <TopicCard key={item.label} item={item} onPress={() => handleTopicAction(item.action)} />)}
                                </View>
                            </>
                        )}
                    </View>
                )}
            </Animated.ScrollView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1, overflow: 'hidden', borderBottomWidth: StyleSheet.hairlineWidth, borderColor: Colors.surface + '80' },
    headerContent: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
    backButton: { position: 'absolute', left: 15, padding: 10, zIndex: 10 },
    headerTitleWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' },
    largeHeaderContent: { alignItems: 'center', marginBottom: 20 },
    iconContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    supportTitle: { fontFamily: 'Poppins_700Bold', color: Colors.text, fontSize: 28, textAlign: 'center' },
    searchBarWrapper: { width: '90%' },
    searchBarContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 22, height: 44, paddingHorizontal: 15 },
    searchInput: { flex: 1, color: Colors.text, fontFamily: 'Poppins_400Regular', fontSize: 14, top: 3, left: 10 },
    clearButton: { paddingLeft: 5 },
    loadingContainer: { padding: 40, justifyContent: 'center', alignItems: 'center' },
    content: { padding: 20, gap: 20 },
    sectionTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.textSecondary, fontSize: 14, textTransform: 'uppercase', marginBottom: -5, marginLeft: 5 },
    card: { borderRadius: 16, overflow: 'hidden', backgroundColor: 'rgba(28,28,30,0.7)', borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.surface + '80' },
    emptyStateContainer: { padding: 30, alignItems: 'center', gap: 10 },
    emptyStateText: { fontFamily: 'Poppins_500Medium', color: Colors.textSecondary, fontSize: 16 },
    topicGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
});

export default HelpScreen;