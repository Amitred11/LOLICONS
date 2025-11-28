import React from 'react';
import { View, StyleSheet, Text, FlatList } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { useNavigation } from '@react-navigation/native';
import { CommunityHeader, PostCard } from './components/CommunityUI';
import { communityPostsData } from '../../constants/mockData';

const Tab = createMaterialTopTabNavigator();

// Implemented Posts Feed for the community page
const CommunityPostsFeed = () => (
    <FlatList
        data={communityPostsData.filter(p => p.communityId === 'c1')} // Example filter
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => <PostCard item={item} index={index} showCommunityInfo={false} />}
        contentContainerStyle={{ backgroundColor: Colors.darkBackground }}
    />
);

const CommunityChat = () => <View style={styles.placeholder}><Text style={styles.placeholderText}>Group Chat</Text></View>;
const CommunityMembers = () => <View style={styles.placeholder}><Text style={styles.placeholderText}>Members List</Text></View>;

const CommunityPageScreen = ({ route }) => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <View style={{paddingTop: insets.top, backgroundColor: Colors.darkBackground}}>
                <CommunityHeader 
                    communityInfo={route.params} 
                    onBack={() => navigation.goBack()} 
                />
            </View>

            <Tab.Navigator
                screenOptions={{
                    tabBarActiveTintColor: Colors.primary,
                    tabBarInactiveTintColor: Colors.textSecondary,
                    tabBarIndicatorStyle: { backgroundColor: Colors.primary },
                    tabBarStyle: { backgroundColor: Colors.darkBackground, borderTopWidth: 1, borderTopColor: Colors.surface },
                    tabBarLabelStyle: { fontFamily: 'Poppins_600SemiBold', textTransform: 'none' },
                }}
            >
                <Tab.Screen name="Posts" component={CommunityPostsFeed} />
                <Tab.Screen name="Chat" component={CommunityChat} />
                <Tab.Screen name="Members" component={CommunityMembers} />
            </Tab.Navigator>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.darkBackground },
    placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.darkBackground },
    placeholderText: { color: Colors.text, fontSize: 18 },
});

export default CommunityPageScreen;