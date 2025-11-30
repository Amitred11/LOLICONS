import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@config/Colors';

const { width } = Dimensions.get('window');

const MainEventCard = ({ item, onPress }) => (
    <TouchableOpacity 
        style={styles.container} 
        activeOpacity={0.9} 
        onPress={onPress}
    >
        <ImageBackground 
            source={item.image} 
            style={styles.imageBackground} 
            imageStyle={{ borderRadius: 24 }}
        >
            <LinearGradient 
                colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.9)']} 
                style={styles.overlay}
            >
                <View style={styles.contentContainer}>
                    {/* Top Section: Badge */}
                    <View style={styles.topRow}>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>NEXT EVENT</Text>
                        </View>
                        <View style={styles.iconCircle}>
                            <Ionicons name="calendar-outline" size={16} color="#FFF" />
                        </View>
                    </View>

                    {/* Bottom Section: Info & Action */}
                    <View style={styles.bottomRow}>
                        <View style={styles.textContainer}>
                            <Text style={styles.eventDate}>{item.date}</Text>
                            <Text style={styles.eventTitle} numberOfLines={2}>{item.title}</Text>
                        </View>
                        
                        <View style={styles.arrowButton}>
                            <Ionicons name="arrow-forward" size={20} color={Colors.background} />
                        </View>
                    </View>
                </View>
            </LinearGradient>
            
            {/* Glass Border Effect */}
            <View style={styles.borderOverlay} />
        </ImageBackground>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: {
        width: width - 40, // Full width minus padding
        height: 200,       // Taller to look like a main feature
        borderRadius: 24,
        alignSelf: 'center', // Centers it within the parent view
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 5,
        marginBottom: 10,
    },
    imageBackground: {
        flex: 1,
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: '#1a1a1a',
    },
    overlay: {
        flex: 1,
        padding: 20,
        justifyContent: 'space-between',
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'space-between',
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    badge: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    badgeText: {
        fontFamily: 'Poppins_700Bold',
        color: '#FFF',
        fontSize: 10,
        letterSpacing: 1,
    },
    iconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    bottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    textContainer: {
        flex: 1,
        paddingRight: 10,
    },
    eventDate: {
        fontFamily: 'Poppins_600SemiBold',
        color: Colors.secondary,
        fontSize: 13,
        marginBottom: 2,
    },
    eventTitle: {
        fontFamily: 'Poppins_700Bold',
        color: '#fff',
        fontSize: 20,
        lineHeight: 26,
    },
    arrowButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    borderOverlay: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        pointerEvents: 'none',
    },
});

export default MainEventCard;