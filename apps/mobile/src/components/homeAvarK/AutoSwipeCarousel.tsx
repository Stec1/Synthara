import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, NativeScrollEvent, NativeSyntheticEvent, useWindowDimensions, View } from 'react-native';

import { useTheme } from '../../ui';

type AutoSwipeCarouselProps<T> = {
  items: T[];
  renderItem: ({ item, index }: { item: T; index: number }) => React.ReactElement;
};

const AUTO_INTERVAL = 7000;
const MANUAL_PAUSE = 8000;

export function AutoSwipeCarousel<T>({ items, renderItem }: AutoSwipeCarouselProps<T>) {
  const { width } = useWindowDimensions();
  const { theme } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoResumeAt, setAutoResumeAt] = useState(Date.now() + AUTO_INTERVAL);
  const flatListRef = useRef<FlatList<T>>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const itemSpacing = theme.spacing.md;
  const itemWidth = useMemo(() => width - theme.spacing.lg * 2, [width, theme.spacing.lg]);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (items.length <= 1) {
      return;
    }

    const now = Date.now();
    const delay = now < autoResumeAt ? autoResumeAt - now : AUTO_INTERVAL;

    timerRef.current = setTimeout(() => {
      const nextIndex = (currentIndex + 1) % items.length;
      const offset = nextIndex * (itemWidth + itemSpacing);
      flatListRef.current?.scrollToOffset({ offset, animated: true });
      setCurrentIndex(nextIndex);
      setAutoResumeAt(Date.now() + AUTO_INTERVAL);
    }, delay);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [autoResumeAt, currentIndex, items.length, itemSpacing, itemWidth]);

  if (items.length === 0) {
    return null;
  }

  const handleMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / (itemWidth + itemSpacing));
    setCurrentIndex(newIndex);
    setAutoResumeAt(Date.now() + MANUAL_PAUSE);
  };

  return (
    <View>
      <FlatList
        ref={flatListRef}
        data={items}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={itemWidth + itemSpacing}
        snapToAlignment="start"
        disableIntervalMomentum
        renderItem={({ item, index }) => (
          <View style={{ width: itemWidth, marginRight: index === items.length - 1 ? 0 : itemSpacing }}>
            {renderItem({ item, index })}
          </View>
        )}
        contentContainerStyle={{ paddingRight: theme.spacing.lg }}
        keyExtractor={(_, index) => `slide-${index}`}
        onMomentumScrollEnd={handleMomentumEnd}
        onScrollBeginDrag={() => setAutoResumeAt(Date.now() + MANUAL_PAUSE)}
      />
      <View
        style={{
          flexDirection: 'row',
          alignSelf: 'center',
          gap: theme.spacing.xs,
          marginTop: theme.spacing.sm,
        }}
      >
        {items.map((_, index) => {
          const active = index === currentIndex;
          return (
            <View
              key={index}
              style={{
                width: active ? 22 : 8,
                height: 8,
                borderRadius: 8,
                backgroundColor: active ? theme.colors.primary : 'rgba(255,255,255,0.25)',
              }}
            />
          );
        })}
      </View>
    </View>
  );
}
