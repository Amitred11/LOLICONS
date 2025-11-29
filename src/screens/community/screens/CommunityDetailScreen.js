import React from 'react';
import { View, StyleSheet, Text, FlatList } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';

import { Colors } from '@config/Colors';
import { communityPostsData } from '@config/mockData';
import { CommunityHeader, PostCard } from '../components/CommunityUI';

const Tab = createMaterialTopTabNavigator();

const CommunityPostsFeed = () => (
    <FlatList
        data={communityPostsData}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => <PostCard item={item} index={index} showCommunityInfo={false} />}
        contentContainerStyle={{ backgroundColor: Colors.darkBackground, paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
    />
);

const CommunityChat = () => (
    <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Group Chat (Coming Soon)</Text>
    </View>
);

const CommunityDetailScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    
    // Fallback if no params
    const communityInfo = route.params || { communityName: "Unknown", communityId: "0" };

    return (
        <View style={styles.container}>
            <View style={{ paddingTop: insets.top, backgroundColor: Colors.darkBackground }}>
                <CommunityHeader 
                    communityInfo={communityInfo} 
                    onBack={() => navigation.goBack()} 
                />
            </View>

            <Tab.Navigator
                screenOptions={{
                    tabBarActiveTintColor: Colors.primary,
                    tabBarInactiveTintColor: Colors.textSecondary,
                    tabBarIndicatorStyle: { backgroundColor: Colors.primary, height: 3 },
                    tabBarStyle: { backgroundColor: Colors.darkBackground, borderTopWidth: 0, elevation: 0, shadowOpacity: 0 },
                    tabBarLabelStyle: { fontFamily: 'Poppins_600SemiBold', textTransform: 'capitalize' },
                }}
            >
                <Tab.Screen name="Posts" component={CommunityPostsFeed} />
                <Tab.Screen name="Chat" component={CommunityChat} />
            </Tab.Navigator>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.darkBackground },
    placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.darkBackground },
    placeholderText: { color: Colors.textSecondary, fontSize: 16, fontFamily: 'Poppins_500Medium' },
});

export default CommunityDetailScreen;