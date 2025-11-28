import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, Image, ScrollView, Alert, Keyboard
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { userData } from '../../constants/mockData';

const CreatePostScreen = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();

    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [images, setImages] = useState([]);
    const [community, setCommunity] = useState('General Chat');

    const hasContent = title.trim().length > 0 && body.trim().length > 0;

    const pickImages = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Access Needed', 'Please allow access to your photos to upload images.');
            return;
        }
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            selectionLimit: 4,
            quality: 0.8,
        });
        if (!result.canceled) {
            const newUris = result.assets.map(asset => asset.uri);
            setImages(prev => [...prev, ...newUris]);
        }
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Camera Access', 'Please allow camera access to take a photo.');
            return;
        }
        let result = await ImagePicker.launchCameraAsync({
            quality: 0.8,
        });
        if (!result.canceled) {
            setImages(prev => [...prev, result.assets[0].uri]);
        }
    };

    const removeImage = (indexToRemove) => {
        setImages(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handlePost = () => {
        if (!hasContent) return;
        const newPost = {
            id: Date.now().toString(),
            title: title.trim(),
            content: body.trim(),
            images: images,
            community: community,
            user: userData,
            timestamp: 'Just now'
        };
        navigation.navigate('Community', { newPost });
    };

    return (
        <View style={styles.container}>
            {/* 1. Status Bar Spacer (Keeps header safe) */}
            <View style={{ height: insets.top, backgroundColor: Colors.background }} />

            {/* 2. Header (Fixed at top, outside KAV) */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelButton}>
                    <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>New Post</Text>
                <TouchableOpacity 
                    onPress={handlePost} 
                    disabled={!hasContent}
                    style={[styles.postButton, !hasContent && styles.postButtonDisabled]}
                >
                    <Text style={styles.postButtonText}>Post</Text>
                </TouchableOpacity>
            </View>

            {/* 3. Keyboard Handling Wrapper */}
            <KeyboardAvoidingView 
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                {/* 4. Inner Flex Container to distribute space */}
                <View style={{ flex: 1, flexDirection: 'column' }}>
                    
                    {/* Scrollable Content */}
                    <ScrollView 
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* User Info */}
                        <View style={styles.userRow}>
                            <Image source={{ uri: userData.avatarUrl }} style={styles.avatar} />
                            <View>
                                <Text style={styles.userName}>{userData.name}</Text>
                                <TouchableOpacity style={styles.communitySelector}>
                                    <Text style={styles.communityText}>in {community}</Text>
                                    <Ionicons name="chevron-down" size={12} color={Colors.secondary} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Title Input */}
                        <TextInput
                            placeholder="Title your story..."
                            placeholderTextColor={Colors.textSecondary}
                            style={styles.titleInput}
                            value={title}
                            onChangeText={setTitle}
                            maxLength={100}
                        />
                        
                        {/* Body Input */}
                        <TextInput
                            placeholder="Share your thoughts..."
                            placeholderTextColor={Colors.textSecondary}
                            style={styles.bodyInput}
                            value={body}
                            onChangeText={setBody}
                            multiline
                            scrollEnabled={false} 
                        />

                        {/* Images */}
                        {images.length > 0 && (
                            <View style={styles.imagePreviewContainer}>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    {images.map((uri, index) => (
                                        <View key={index} style={styles.imageWrapper}>
                                            <Image source={{ uri }} style={styles.previewImage} />
                                            {index === 0 && (
                                                <View style={styles.coverBadge}>
                                                    <Text style={styles.coverBadgeText}>Cover</Text>
                                                </View>
                                            )}
                                            <TouchableOpacity onPress={() => removeImage(index)} style={styles.removeBtn}>
                                                <Ionicons name="close" size={14} color="#fff" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </ScrollView>
                            </View>
                        )}
                    </ScrollView>

                    {/* 5. Accessory Bar (Fixed at bottom of flex container) */}
                    <View style={[styles.accessoryBar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
                        <TouchableOpacity style={styles.accessoryBtn} onPress={pickImages}>
                            <Ionicons name="images-outline" size={24} color={Colors.secondary} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.accessoryBtn} onPress={takePhoto}>
                            <Ionicons name="camera-outline" size={24} color={Colors.secondary} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.accessoryBtn}>
                            <Ionicons name="link-outline" size={24} color={Colors.textSecondary} />
                        </TouchableOpacity>
                        
                        <View style={{ flex: 1 }} />
                        
                        <Text style={[styles.charCount, title.length > 80 && { color: Colors.primary }]}>
                            {title.length}/100
                        </Text>
                        
                        <TouchableOpacity style={styles.hideKeyBtn} onPress={Keyboard.dismiss}>
                            <Ionicons name="chevron-down" size={20} color={Colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    
    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        height: 50,
        backgroundColor: Colors.background,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.surface,
        zIndex: 10,
    },
    cancelButton: { padding: 8 },
    cancelText: { fontFamily: 'Poppins_400Regular', color: Colors.text, fontSize: 16 },
    headerTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 16 },
    postButton: { backgroundColor: Colors.secondary, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
    postButtonDisabled: { backgroundColor: Colors.surface, opacity: 0.7 },
    postButtonText: { fontFamily: 'Poppins_600SemiBold', color: '#fff', fontSize: 14 },

    // Scroll Area
    scrollView: { flex: 1 },
    scrollContent: { padding: 20, paddingBottom: 40 }, // Added padding bottom so content isn't hidden behind bar

    // User Row
    userRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12, backgroundColor: Colors.surface },
    userName: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 15 },
    communitySelector: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
    communityText: { fontFamily: 'Poppins_500Medium', color: Colors.secondary, fontSize: 13, marginRight: 4 },

    // Inputs
    titleInput: {
        fontFamily: 'Poppins_700Bold',
        fontSize: 22,
        color: Colors.text,
        marginBottom: 15,
        textAlignVertical: 'center'
    },
    bodyInput: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 16,
        color: Colors.text,
        minHeight: 100,
        textAlignVertical: 'top',
        lineHeight: 24,
        marginBottom: 20
    },

    // Images
    imagePreviewContainer: { marginTop: 10, height: 120, marginBottom: 20 },
    imageWrapper: { marginRight: 10, width: 100, height: 100, position: 'relative' },
    previewImage: { width: '100%', height: '100%', borderRadius: 12 },
    removeBtn: {
        position: 'absolute', top: -5, right: -5,
        backgroundColor: 'rgba(0,0,0,0.7)',
        width: 22, height: 22, borderRadius: 11,
        alignItems: 'center', justifyContent: 'center'
    },
    coverBadge: {
        position: 'absolute', bottom: 5, left: 5,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 6, paddingVertical: 2,
        borderRadius: 4
    },
    coverBadgeText: { color: '#fff', fontSize: 10, fontFamily: 'Poppins_600SemiBold' },

    // Accessory Bar
    accessoryBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 12,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: Colors.surface,
        backgroundColor: Colors.background,
    },
    accessoryBtn: { marginRight: 24, padding: 4 },
    charCount: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 12, marginRight: 15 },
    hideKeyBtn: { padding: 4 }
});

export default CreatePostScreen;