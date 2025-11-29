import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image, ScrollView, Alert, Keyboard } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@config/Colors';
import { userData } from '@config/mockData';

const CreatePostScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const insets = useSafeAreaInsets();

    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [images, setImages] = useState([]);
    
    // Callback from previous screen to update list immediately
    const { onPostCreated } = route.params || {};

    const hasContent = title.trim().length > 0 && body.trim().length > 0;

    const pickImages = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            selectionLimit: 4,
            quality: 0.7,
        });
        if (!result.canceled) {
            setImages(prev => [...prev, ...result.assets.map(a => a.uri)]);
        }
    };

    const handlePost = () => {
        if (!hasContent) return;
        
        const newPost = {
            title: title.trim(),
            snippet: body.trim().substring(0, 100) + '...', // Simple snippet generation
            image: images.length > 0 ? images[0] : null,
        };

        if (onPostCreated) onPostCreated(newPost);
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <View style={{ height: insets.top, backgroundColor: Colors.background }} />

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

            <KeyboardAvoidingView 
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    <View style={styles.userRow}>
                        <Image source={{ uri: userData.avatarUrl }} style={styles.avatar} />
                        <View>
                            <Text style={styles.userName}>{userData.name}</Text>
                            <Text style={styles.communityText}>in General Discussion</Text>
                        </View>
                    </View>

                    <TextInput
                        placeholder="Title your post..."
                        placeholderTextColor={Colors.textSecondary}
                        style={styles.titleInput}
                        value={title}
                        onChangeText={setTitle}
                        maxLength={80}
                    />
                    
                    <TextInput
                        placeholder="Share your thoughts..."
                        placeholderTextColor={Colors.textSecondary}
                        style={styles.bodyInput}
                        value={body}
                        onChangeText={setBody}
                        multiline
                    />

                    {images.length > 0 && (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagePreviewContainer}>
                            {images.map((uri, index) => (
                                <View key={index} style={styles.imageWrapper}>
                                    <Image source={{ uri }} style={styles.previewImage} />
                                    <TouchableOpacity onPress={() => setImages(i => i.filter((_, idx) => idx !== index))} style={styles.removeBtn}>
                                        <Ionicons name="close" size={14} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </ScrollView>
                    )}
                </ScrollView>

                <View style={[styles.accessoryBar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
                    <TouchableOpacity style={styles.accessoryBtn} onPress={pickImages}>
                        <Ionicons name="images-outline" size={26} color={Colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.accessoryBtn}>
                        <Ionicons name="camera-outline" size={26} color={Colors.textSecondary} />
                    </TouchableOpacity>
                    <View style={{ flex: 1 }} />
                    <TouchableOpacity onPress={Keyboard.dismiss}>
                        <Ionicons name="chevron-down" size={24} color={Colors.textSecondary} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 50, borderBottomWidth: 1, borderBottomColor: Colors.surface },
    cancelText: { fontFamily: 'Poppins_400Regular', color: Colors.text, fontSize: 16 },
    headerTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 16 },
    postButton: { backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 6, borderRadius: 20 },
    postButtonDisabled: { backgroundColor: Colors.surface, opacity: 0.7 },
    postButtonText: { fontFamily: 'Poppins_600SemiBold', color: '#fff' },
    scrollContent: { padding: 20 },
    userRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
    userName: { fontFamily: 'Poppins_600SemiBold', color: Colors.text },
    communityText: { color: Colors.textSecondary, fontSize: 12 },
    titleInput: { fontFamily: 'Poppins_700Bold', fontSize: 22, color: Colors.text, marginBottom: 15 },
    bodyInput: { fontFamily: 'Poppins_400Regular', fontSize: 16, color: Colors.text, minHeight: 100, textAlignVertical: 'top' },
    imagePreviewContainer: { marginTop: 20, height: 100 },
    imageWrapper: { marginRight: 10, width: 100, height: 100 },
    previewImage: { width: '100%', height: '100%', borderRadius: 10 },
    removeBtn: { position: 'absolute', top: 5, right: 5, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
    accessoryBar: { flexDirection: 'row', padding: 15, borderTopWidth: 1, borderTopColor: Colors.surface, backgroundColor: Colors.background },
    accessoryBtn: { marginRight: 20 },
});

export default CreatePostScreen;