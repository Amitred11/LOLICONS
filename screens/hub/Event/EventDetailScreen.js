import React from 'react';
import { View, Text, StyleSheet, ScrollView, ImageBackground, TouchableOpacity } from 'react-native';
import { Colors } from '../../../constants/Colors';
import { eventDetailsData } from '../../../constants/mockData';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const EventDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const { eventId } = route.params;
    const event = eventDetailsData[eventId] || eventDetailsData['spot1']; // Fallback

    return (
        <View style={styles.container}>
            <ScrollView>
                <ImageBackground source={event.image} style={[styles.headerImage, { paddingTop: insets.top }]}>
                    <LinearGradient colors={['rgba(0,0,0,0.6)', 'transparent']} style={styles.headerOverlay}/>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={28} color="#fff"/>
                    </TouchableOpacity>
                </ImageBackground>

                <View style={styles.content}>
                    <Text style={styles.title}>{event.title}</Text>
                    <View style={styles.infoRow}>
                        <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
                        <Text style={styles.infoText}>{event.time}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="person-circle-outline" size={16} color={Colors.textSecondary} />
                        <Text style={styles.infoText}>Hosted by {event.host}</Text>
                    </View>
                    <Text style={styles.description}>{event.description}</Text>
                </View>
            </ScrollView>
            <View style={[styles.footer, { paddingBottom: insets.bottom + 10 }]}>
                <TouchableOpacity style={styles.joinButton}>
                    <Text style={styles.joinButtonText}>RSVP</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.darkBackground },
    headerImage: { height: 300, justifyContent: 'flex-start' },
    headerOverlay: { ...StyleSheet.absoluteFillObject },
    backButton: { marginLeft: 10, marginTop: 10, width: 44, height: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 22 },
    content: { padding: 20 },
    title: { fontFamily: 'Poppins_700Bold', color: Colors.text, fontSize: 28, marginBottom: 15 },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    infoText: { fontFamily: 'Poppins_500Medium', color: Colors.textSecondary, fontSize: 15, marginLeft: 8 },
    description: { fontFamily: 'Poppins_400Regular', color: Colors.text, fontSize: 16, lineHeight: 26, marginTop: 20 },
    footer: { paddingHorizontal: 20, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth, borderColor: Colors.surface, backgroundColor: Colors.darkBackground },
    joinButton: { backgroundColor: Colors.primary, paddingVertical: 15, borderRadius: 16, alignItems: 'center' },
    joinButtonText: { fontFamily: 'Poppins_600SemiBold', color: '#fff', fontSize: 16 },
});

export default EventDetailScreen;