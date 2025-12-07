import React, { useState, useEffect } from 'react';
import { 
    View, Text, StyleSheet, StatusBar, Image, ScrollView, 
    TouchableOpacity, FlatList, Share, ActivityIndicator , Dimensions
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useAlert } from '@context/other/AlertContext';

// --- MOCK DATA ---
const MOCK_USERS = [
    { id: '1', name: 'You', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop', isHost: true, isReady: true },
    { id: '2', name: 'Sarah', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop', isHost: false, isReady: false },
    { id: '3', name: 'Mike', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop', isHost: false, isReady: true },
];

const Theme = {
    background: '#09090b',
    surface: '#18181b',
    primary: '#E50914',
    text: '#f4f4f5',
    textSecondary: '#a1a1aa',
    textTertiary: '#52525b',
    success: '#22c55e',
};

const WatchPartyLobbyScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const { showAlert } = useAlert();
    
    const { media } = route.params;

    const [participants, setParticipants] = useState([MOCK_USERS[0]]); // Start with just the host
    const [isLoading, setIsLoading] = useState(true);

    // Simulate other users joining the lobby
    useEffect(() => {
        setTimeout(() => setIsLoading(false), 500);

        const joinInterval1 = setTimeout(() => {
            setParticipants(prev => [...prev, MOCK_USERS[1]]);
        }, 2000);

        const joinInterval2 = setTimeout(() => {
            setParticipants(prev => [...prev, MOCK_USERS[2]]);
        }, 4500);

        return () => {
            clearTimeout(joinInterval1);
            clearTimeout(joinInterval2);
        };
    }, []);

    const handleInvite = async () => {
        try {
            await Share.share({
                title: `Join my Watch Party!`,
                message: `Let's watch ${media.title} together! Join my lobby: https://myapp.com/watchparty/12345`
            });
        } catch (error) {
            showAlert({ title: 'Error', message: 'Could not share invitation.', type: 'error' });
        }
    };

    const handleStartParty = () => {
        if (participants.length < 2) return;
        
        showAlert({ title: 'Starting Soon!', message: 'The watch party is about to begin.', type: 'success' });
        
        setTimeout(() => {
            navigation.replace('VideoPlayer', { media });
        }, 1500);
    };
    
    const toggleReadyState = (userId) => {
        setParticipants(prev => 
            prev.map(p => p.id === userId ? { ...p, isReady: !p.isReady } : p)
        );
    };

    const renderParticipant = ({ item, index }) => (
        <Animated.View 
            entering={FadeInDown.duration(500).delay(index * 100)}
            style={styles.participantRow}
        >
            <View style={styles.participantInfo}>
                <Image source={{ uri: item.avatar }} style={styles.avatar} />
                <Text style={styles.participantName}>{item.name}</Text>
                {item.isHost && <View style={styles.hostBadge}><Text style={styles.hostText}>Host</Text></View>}
            </View>
            <TouchableOpacity 
                style={styles.readyButton} 
                onPress={() => toggleReadyState(item.id)}
                disabled={item.id !== '1'} // Only "You" can toggle your own status in this mock
            >
                <MaterialCommunityIcons 
                    name={item.isReady ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"}
                    size={24} 
                    color={item.isReady ? Theme.success : Theme.textTertiary} 
                />
                <Text style={[styles.readyText, { color: item.isReady ? Theme.success : Theme.textTertiary }]}>
                    Ready
                </Text>
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            
            {/* --- Background Media Art --- */}
            <Image source={media.backdrop} style={styles.backdrop} blurRadius={15} />
            <LinearGradient colors={['rgba(9,9,11,0.2)', 'rgba(9,9,11,0.9)', Theme.background]} style={styles.backdropGradient} />

            {/* --- Header --- */}
            <View style={[styles.header, { top: insets.top }]}>
                <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={22} color={Theme.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Watch Party Lobby</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
                {isLoading ? (
                    <ActivityIndicator style={{ marginTop: height * 0.4 }} size="large" color={Theme.primary} />
                ) : (
                    <Animated.View entering={FadeIn.duration(600)}>
                        {/* --- Media Info Header --- */}
                        <View style={styles.mediaHeader}>
                            <Image source={media.poster} style={styles.poster} />
                            <Text style={styles.mediaTitle}>{media.title}</Text>
                            <Text style={styles.mediaMeta}>{`${media.type} • ${media.year}`}</Text>
                        </View>

                        {/* --- Participants List --- */}
                        <View style={styles.participantSection}>
                            <Text style={styles.sectionTitle}>Participants ({participants.length})</Text>
                            <FlatList
                                data={participants}
                                renderItem={renderParticipant}
                                keyExtractor={item => item.id}
                                scrollEnabled={false}
                            />
                        </View>
                    </Animated.View>
                )}
            </ScrollView>

            {/* --- Footer Controls --- */}
            <View style={[styles.footer, { paddingBottom: insets.bottom + 10 }]}>
                <TouchableOpacity style={styles.inviteButton} onPress={handleInvite}>
                    <Ionicons name="share-social-outline" size={20} color={Theme.text} />
                    <Text style={styles.inviteButtonText}>Invite Friends</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.startButton, participants.length < 2 && styles.startButtonDisabled]} 
                    onPress={handleStartParty}
                    disabled={participants.length < 2}
                >
                    <Text style={styles.startButtonText}>Start Watch Party</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Theme.background },
    backdrop: { position: 'absolute', top: 0, left: 0, width: '100%', height: height * 0.5 },
    backdropGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: height * 0.55 },
    header: {
        position: 'absolute', left: 16, right: 16, zIndex: 1,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 44
    },
    headerButton: {
        width: 40, height: 40, borderRadius: 20,
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(24, 24, 27, 0.5)',
    },
    headerTitle: { color: Theme.text, fontSize: 16, fontWeight: '700' },
    mediaHeader: {
        marginTop: height * 0.15,
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 40,
    },
    poster: {
        width: 120,
        height: 180,
        borderRadius: 12,
        resizeMode: 'cover',
        marginBottom: 16,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    mediaTitle: {
        color: Theme.text,
        fontSize: 24,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 4,
    },
    mediaMeta: {
        color: Theme.textSecondary,
        fontSize: 14,
        fontWeight: '500',
    },
    participantSection: { paddingHorizontal: 20 },
    sectionTitle: {
        color: Theme.text,
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 12,
    },
    participantRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Theme.surface,
        padding: 12,
        borderRadius: 10,
        marginBottom: 10,
    },
    participantInfo: { flexDirection: 'row', alignItems: 'center' },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
        backgroundColor: Theme.background
    },
    participantName: { color: Theme.text, fontSize: 15, fontWeight: '600' },
    hostBadge: {
        backgroundColor: Theme.primary,
        borderRadius: 5,
        paddingHorizontal: 6,
        paddingVertical: 2,
        marginLeft: 8,
    },
    hostText: { color: Theme.text, fontSize: 10, fontWeight: 'bold' },
    readyButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    readyText: { fontSize: 14, fontWeight: '600' },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        backgroundColor: Theme.surface,
        borderTopWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    inviteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 16,
        height: 48,
        borderRadius: 8,
        gap: 8,
    },
    inviteButtonText: { color: Theme.text, fontWeight: '700' },
    startButton: {
        flex: 1,
        backgroundColor: Theme.primary,
        height: 48,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 12,
    },
    startButtonDisabled: { backgroundColor: Theme.textTertiary },
    startButtonText: { color: Theme.text, fontSize: 16, fontWeight: '700' },
});

export default WatchPartyLobbyScreen;