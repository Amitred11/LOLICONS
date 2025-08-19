// Import necessary modules from React, React Native, and third-party libraries.
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image, Alert } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { messagesData } from '../../constants/mockData';
import { BlurView } from 'expo-blur';

// A helper function to format a date object into a simple HH:MM time string.
const formatTime = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

/**
 * A component to render a single message bubble in the chat.
 * It handles styling for the user's own messages vs. others' messages,
 * and groups consecutive messages from the same author.
 * @param {object} props - The component props from FlatList's renderItem.
 * @param {object} props.item - The message object.
 * @param {boolean} props.isFirst - True if this is the first message in a consecutive block by the author.
 * @param {boolean} props.isMine - True if the message was sent by the current user.
 */
const MessageItem = ({ item, isFirst, isMine }) => (
    <View style={[styles.messageRow, isMine && styles.myMessageRow, isFirst && { marginTop: 20 }]}>
        {/* Show avatar only for the first message in a block from another user. */}
        {!isMine && isFirst && <Image source={{ uri: item.avatar }} style={styles.messageAvatar} />}
        <View style={[styles.messageWrapper, isMine ? styles.myMessageWrapper : styles.theirMessageWrapper, isFirst && !isMine && {marginLeft: 42} ]}>
            {/* Show author name and timestamp only for the first message in a block from another user. */}
            {isFirst && !isMine && (
                <View style={styles.messageHeader}>
                    <Text style={styles.messageAuthor}>{item.author}</Text>
                    <Text style={styles.messageTimestamp}>{formatTime(item.timestamp)}</Text>
                </View>
            )}
            <Text style={isMine ? styles.myMessageText : styles.theirMessageText}>{item.content}</Text>
        </View>
    </View>
);

/**
 * The main screen for a single chat conversation.
 */
const ChatScreen = ({ route, navigation }) => {
    const { channelName } = route.params; // Get the channel name from navigation params.
    const insets = useSafeAreaInsets(); // Hook for safe area values.
    
    // Process the messages to add the 'isFirst' flag for message grouping.
    // useMemo prevents this expensive calculation from running on every render.
    const processedMessages = useMemo(() => {
        const messages = messagesData['ch1'] || []; // Get messages for this channel.
        let lastAuthor = null;
        return messages.map((msg) => {
            const isFirst = msg.author !== lastAuthor;
            lastAuthor = msg.author; // Update the last author for the next iteration.
            return { ...msg, isFirst };
        }).reverse(); // Reverse the array for use with an 'inverted' FlatList.
    }, []);

    return (
        <View style={styles.container}>
            {/* Custom Header */}
            <View style={[styles.header, { height: insets.top + 60 }]}>
                <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill}/>
                <View style={[styles.headerContent, { paddingTop: insets.top }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                        <Ionicons name="arrow-back" size={24} color={Colors.text} />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <View style={styles.headerAvatar}/>
                        <Text style={styles.headerTitle}>{channelName}</Text>
                    </View>
                    <TouchableOpacity style={styles.headerButton} onPress={() => Alert.alert("Call", `Calling ${channelName}...`)}>
                        <Ionicons name="call" size={22} color={Colors.text} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Message List */}
            <FlatList
                data={processedMessages}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <MessageItem {...item} isMine={item.author === 'Nexus'} />} // Mocking "my" messages by checking author name.
                inverted // Renders items from bottom to top and starts scrolled at the bottom.
                contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 10, paddingTop: insets.top + 70 }}
            />
            
            {/* Input Bar */}
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                // This offset pushes the input bar up correctly, accounting for the tab bar and safe area.
                keyboardVerticalOffset={Platform.OS === 'ios' ? insets.bottom + 65 : 0} 
            >
                <View style={[styles.inputContainer, { paddingBottom: insets.bottom }]}>
                    <BlurView intensity={50} tint="dark" style={styles.inputBlur}/>
                    <TouchableOpacity style={styles.inputButton}><Ionicons name="add-circle" size={28} color={Colors.textSecondary}/></TouchableOpacity>
                    <TextInput
                        placeholder={`Message ${channelName}`}
                        placeholderTextColor={Colors.textSecondary}
                        style={styles.textInput}
                        multiline
                    />
                    <TouchableOpacity style={styles.inputButton}><Ionicons name="send" size={24} color={Colors.secondary}/></TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

// Styles for the component.
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.surface + '80' },
  headerContent: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerButton: { padding: 15 },
  headerTitleContainer: { flexDirection: 'row', alignItems: 'center' },
  headerAvatar: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.success, marginRight: 10 },
  headerTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 17 },
  
  messageRow: { flexDirection: 'row', marginBottom: 2 },
  myMessageRow: { justifyContent: 'flex-end' },
  messageWrapper: { maxWidth: '80%', borderRadius: 18, padding: 12 },
  myMessageWrapper: { backgroundColor: Colors.secondary, borderBottomRightRadius: 4 },
  theirMessageWrapper: { backgroundColor: Colors.surface, borderBottomLeftRadius: 4 },
  messageAvatar: { position: 'absolute', left: 0, bottom: 0, width: 32, height: 32, borderRadius: 16 },
  messageHeader: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 4 },
  messageAuthor: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 15 },
  messageTimestamp: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 12, marginLeft: 8 },
  myMessageText: { fontFamily: 'Poppins_400Regular', color: Colors.background, fontSize: 15, lineHeight: 22 },
  theirMessageText: { fontFamily: 'Poppins_400Regular', color: Colors.text, fontSize: 15, lineHeight: 22 },
  
  inputContainer: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 10, paddingTop: 10, position: 'absolute', bottom: 0, left: 0, right: 0 },
  inputBlur: { ...StyleSheet.absoluteFillObject },
  textInput: { flex: 1, backgroundColor: Colors.surface + '80', borderRadius: 20, paddingHorizontal: 15, paddingTop: 12, paddingBottom: 12, fontSize: 15, color: Colors.text, maxHeight: 100 },
  inputButton: { padding: 10, paddingBottom: 12 },
});

export default ChatScreen;