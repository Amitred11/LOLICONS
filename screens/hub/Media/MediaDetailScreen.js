import React from 'react';
import { View, Text, StyleSheet, ScrollView, ImageBackground, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../../constants/Colors'; // Adjust path
import { mediaData } from '../../../constants/mockData'; // Adjust path

const { width, height } = Dimensions.get('window');
const BACKDROP_HEIGHT = height * 0.5;

// A simple card for the recommendations list
const RecommendationCard = ({ item, onPress }) => (
    <TouchableOpacity onPress={onPress} style={styles.recCard}>
        <ImageBackground source={item.poster} style={styles.recImage} imageStyle={{ borderRadius: 10 }} />
    </TouchableOpacity>
);

const MediaDetailScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { mediaId } = route.params;

    // In a real app, you would fetch this data. Here, we find it in our mock data.
    const mediaItem = mediaData.find(item => item.id === mediaId);

    // This would typically come from a global state/context (like Redux or Zustand)
    // For this example, we'll simulate it with local state.
    const [isFavorite, setIsFavorite] = React.useState(false); 
    
    const handleToggleFavorite = () => {
        setIsFavorite(prev => !prev);
        // In a real app, you would dispatch an action here to update the global state.
    };

    // Find other items of the same type for the "More Like This" section
    const recommendations = mediaData.filter(
        item => item.type === mediaItem?.type && item.id !== mediaItem?.id
    ).slice(0, 5); // Show up to 5 recommendations

    if (!mediaItem) {
        // Fallback for an invalid ID
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Media not found.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Backdrop Image Header */}
                <ImageBackground source={mediaItem.backdrop} style={styles.backdrop}>
                    <LinearGradient
                        colors={['rgba(0,0,0,0.6)', 'transparent', Colors.darkBackground]}
                        style={styles.backdropGradient}
                        locations={[0, 0.6, 1]}
                    />
                    <TouchableOpacity 
                        style={[styles.backButton, { top: insets.top + 10 }]}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                </ImageBackground>

                {/* Content Section */}
                <View style={styles.contentContainer}>
                    <Text style={styles.title}>{mediaItem.title}</Text>
                    
                    {/* Metadata Row */}
                    <View style={styles.metadataRow}>
                        <View style={styles.metadataItem}>
                            <Ionicons name="star" size={14} color={Colors.primary} />
                            <Text style={styles.metadataText}>{mediaItem.rating}</Text>
                        </View>
                        <View style={styles.metadataItem}>
                            <Ionicons name="film-outline" size={14} color={Colors.textSecondary} />
                            <Text style={styles.metadataText}>{mediaItem.type}</Text>
                        </View>
                        {mediaItem.tags.slice(0, 2).map(tag => (
                            <View key={tag} style={styles.tagBadge}>
                                <Text style={styles.tagText}>{tag}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Action Buttons */}
                    <TouchableOpacity style={styles.playButton} activeOpacity={0.8}>
                        <Ionicons name="play" size={20} color={Colors.darkBackground} />
                        <Text style={styles.playButtonText}>Play</Text>
                    </TouchableOpacity>

                    {/* Description */}
                    <Text style={styles.description}>{mediaItem.description}</Text>

                    <TouchableOpacity style={styles.myListButton} onPress={handleToggleFavorite}>
                        <Ionicons name={isFavorite ? "checkmark" : "add"} size={20} color={Colors.text} />
                        <Text style={styles.myListButtonText}>{isFavorite ? "On My List" : "Add to My List"}</Text>
                    </TouchableOpacity>

                    {/* Recommendations */}
                    {recommendations.length > 0 && (
                        <View style={styles.recommendationsContainer}>
                            <Text style={styles.sectionTitle}>More Like This</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {recommendations.map(item => (
                                    <RecommendationCard 
                                        key={item.id} 
                                        item={item} 
                                        onPress={() => navigation.push('MediaDetail', { mediaId: item.id })}
                                    />
                                ))}
                            </ScrollView>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.darkBackground },
    backdrop: { width: width, height: BACKDROP_HEIGHT, justifyContent: 'flex-end' },
    backdropGradient: { ...StyleSheet.absoluteFillObject },
    backButton: { position: 'absolute', left: 15, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    contentContainer: { paddingHorizontal: 20, marginTop: -60 }, // Negative margin pulls content up
    title: { fontFamily: 'Poppins_700Bold', color: Colors.text, fontSize: 32, marginBottom: 10 },
    metadataRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    metadataItem: { flexDirection: 'row', alignItems: 'center', marginRight: 15 },
    metadataText: { fontFamily: 'Poppins_500Medium', color: Colors.textSecondary, fontSize: 14, marginLeft: 5 },
    tagBadge: { backgroundColor: Colors.surface, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, marginRight: 8 },
    tagText: { fontFamily: 'Poppins_500Medium', color: Colors.textSecondary, fontSize: 12 },
    playButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 14, width: '100%', marginBottom: 20 },
    playButtonText: { fontFamily: 'Poppins_600SemiBold', color: Colors.darkBackground, fontSize: 16, marginLeft: 8 },
    description: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 15, lineHeight: 24, marginBottom: 20 },
    myListButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surface, borderRadius: 12, paddingVertical: 14, width: '100%', marginBottom: 30 },
    myListButtonText: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 16, marginLeft: 8 },
    recommendationsContainer: { marginBottom: 30 },
    sectionTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 20, marginBottom: 15 },
    recCard: { width: width * 0.3, height: (width * 0.3) * 1.5, marginRight: 15 },
    recImage: { width: '100%', height: '100%' },
});

export default MediaDetailScreen;