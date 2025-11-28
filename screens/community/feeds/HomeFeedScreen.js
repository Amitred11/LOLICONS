import React from 'react';
import { View, StyleSheet, FlatList} from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PostCard, SearchInput } from '../components/CommunityUI';
import { Colors } from '../../../constants/Colors';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const HomeFeedScreen = ({ posts, scrollHandler, headerHeight, searchQuery, onSearchChange }) => {
    const insets = useSafeAreaInsets();

    return (
        <View style={styles.container}>
            <AnimatedFlatList
                data={posts}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => <PostCard item={item} index={index} />}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                contentContainerStyle={{ 
                    paddingTop: headerHeight,
                    paddingBottom: insets.bottom + 80,
                }}
                ListHeaderComponent={
                    <SearchInput
                        value={searchQuery}
                        onChangeText={onSearchChange}
                        placeholder="Search community posts..."
                    />
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.darkBackground }
});

export default HomeFeedScreen;