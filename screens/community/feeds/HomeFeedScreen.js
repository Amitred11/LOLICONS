import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { PostCard, SearchInput } from '../components/CommunityUI';
import { Colors } from '../../../constants/Colors';

const HomeFeedScreen = ({ posts, scrollHandler, headerHeight, searchQuery, onSearchChange }) => {
    return (
        <Animated.FlatList
            data={posts}
            keyExtractor={(item) => item.id}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            contentContainerStyle={{ paddingTop: headerHeight + 10, paddingBottom: 100 }}
            ListHeaderComponent={
                <View style={styles.searchWrapper}>
                    <SearchInput 
                        value={searchQuery} 
                        onChangeText={onSearchChange} 
                        placeholder="Search discussions..." 
                    />
                </View>
            }
            renderItem={({ item, index }) => (
                <PostCard item={item} index={index} showCommunityInfo={true} />
            )}
            showsVerticalScrollIndicator={false}
        />
    );
};

const styles = StyleSheet.create({
    searchWrapper: { paddingBottom: 10 }
});

export default HomeFeedScreen;