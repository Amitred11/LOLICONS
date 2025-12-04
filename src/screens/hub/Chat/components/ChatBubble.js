import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@config/Colors';

const ChatBubble = ({ message, isMe, showSender, onLongPress }) => {
  
  const renderContent = () => {
    // 1. IMAGE TYPE
    if (message.type === 'image') {
      return (
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: message.imageUri }} 
            style={[styles.mediaImage, message.pending && { opacity: 0.5 }]} 
            resizeMode="cover"
          />
          {message.pending && <View style={styles.pendingOverlay}><Text style={styles.pendingText}>Sending...</Text></View>}
        </View>
      );
    } 
    
    // 2. DOCUMENT TYPE
    else if (message.type === 'document') {
        return (
            <TouchableOpacity 
                style={styles.docContainer} 
                onPress={() => Alert.alert("Download", "Opening file viewer...")}
            >
                <View style={styles.docIcon}>
                    <Ionicons name="document-text" size={24} color={isMe ? Colors.primary : '#FFF'} />
                </View>
                <View style={{flex: 1}}>
                    <Text style={[styles.docText, isMe ? {color:'#FFF'} : {color: Colors.text}]} numberOfLines={1}>
                        {message.text || 'Document'}
                    </Text>
                    <Text style={[styles.docSize, isMe ? {color:'rgba(255,255,255,0.7)'} : {color:Colors.textSecondary}]}>
                        PDF • 2.4 MB
                    </Text>
                </View>
            </TouchableOpacity>
        );
    }

    // 3. TEXT TYPE
    return <Text style={isMe ? styles.textMe : styles.textThem}>{message.text}</Text>;
  };

  return (
    <TouchableOpacity 
        activeOpacity={0.8}
        onLongPress={onLongPress} 
        style={[styles.wrapper, isMe ? styles.wrapperMe : styles.wrapperThem]}
    >
      {!isMe && showSender && (
        <View style={styles.avatarContainer}>
           <Image source={{ uri: 'https://i.pravatar.cc/100' }} style={styles.avatar} /> 
        </View>
      )}
      
      <View style={{ maxWidth: '75%' }}>
        {isMe ? (
          <LinearGradient
            colors={[Colors.primary, '#2E86DE']}
            style={[styles.bubble, styles.bubbleMe, (message.type === 'image' || message.type === 'document') && styles.bubbleMedia]}
          >
            {renderContent()}
          </LinearGradient>
        ) : (
          <View style={[styles.bubble, styles.bubbleThem, (message.type === 'image' || message.type === 'document') && styles.bubbleMedia]}>
             {renderContent()}
          </View>
        )}
        
        <Text style={[styles.time, isMe ? { textAlign: 'right' } : { textAlign: 'left' }]}>
            {message.time} {isMe && message.pending && '🕒'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 16 },
  wrapperMe: { justifyContent: 'flex-end' },
  wrapperThem: { justifyContent: 'flex-start' },
  avatarContainer: { marginRight: 10 },
  avatar: { width: 30, height: 30, borderRadius: 12, backgroundColor: '#333' },
  
  bubble: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20, minWidth: 60 },
  bubbleMedia: { padding: 4, borderRadius: 16 }, // tighter padding for media
  bubbleMe: { borderBottomRightRadius: 4, elevation: 2 },
  bubbleThem: { backgroundColor: Colors.surface, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  
  textMe: { color: '#FFF', fontSize: 15 },
  textThem: { color: Colors.text, fontSize: 15 },
  time: { color: 'rgba(255,255,255,0.3)', fontSize: 10, marginTop: 4, marginHorizontal: 5 },
  
  imageContainer: { width: 220, height: 160, borderRadius: 14, overflow: 'hidden' },
  mediaImage: { width: '100%', height: '100%' },
  pendingOverlay: { position: 'absolute', bottom:0, right:0, left:0, backgroundColor:'rgba(0,0,0,0.4)', padding: 4, alignItems:'center' },
  pendingText: { color:'white', fontSize: 10 },

  // Document Styles
  docContainer: { flexDirection: 'row', alignItems: 'center', width: 200, padding: 8 },
  docIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  docText: { fontSize: 14, fontWeight: '600' },
  docSize: { fontSize: 10, marginTop: 2 }
});

export default ChatBubble;