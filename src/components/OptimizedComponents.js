import React, { memo, useMemo, useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  Animated,
  InteractionManager,
  Modal,
  ScrollView
} from 'react-native';
import { PerformanceManager } from '../services/performance/PerformanceManager';

// Optimized Text Component with reduced re-renders
export const OptimizedText = memo(({ children, style, ...props }) => {
  const memoizedStyle = useMemo(() => style, [JSON.stringify(style)]);
  
  return (
    <Text style={memoizedStyle} {...props}>
      {children}
    </Text>
  );
});

// Optimized TouchableOpacity with debouncing
export const OptimizedTouchableOpacity = memo(({ onPress, children, debounceDelay, ...props }) => {
  const debouncedOnPress = useMemo(() => {
    if (!onPress) return undefined;
    return PerformanceManager.createOptimizedDebounce(onPress, debounceDelay);
  }, [onPress, debounceDelay]);

  return (
    <TouchableOpacity onPress={debouncedOnPress} {...props}>
      {children}
    </TouchableOpacity>
  );
});

// Optimized Image with lazy loading and quality adjustment
export const OptimizedImage = memo(({ source, style, quality, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    // Lazy load images only when they're about to be visible
    const timer = setTimeout(() => setShouldLoad(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const optimizedProps = useMemo(() => {
    const qualitySettings = PerformanceManager.optimizeImageRendering(quality);
    return { ...qualitySettings, ...props };
  }, [quality, props]);

  const memoizedStyle = useMemo(() => [
    style,
    !isLoaded && { opacity: 0 }
  ], [style, isLoaded]);

  if (!shouldLoad) {
    return <View style={[style, { backgroundColor: '#F3F4F6' }]} />;
  }

  return (
    <Image
      source={source}
      style={memoizedStyle}
      onLoad={() => setIsLoaded(true)}
      {...optimizedProps}
    />
  );
});

// Optimized FlatList with performance improvements
export const OptimizedFlatList = memo(({ data, renderItem, keyExtractor, ...props }) => {
  const optimizedProps = useMemo(() => {
    const baseProps = {
      removeClippedSubviews: true,
      maxToRenderPerBatch: 10,
      updateCellsBatchingPeriod: 50,
      initialNumToRender: 10,
      windowSize: 10,
      getItemLayout: props.getItemLayout || undefined,
      ...props
    };

    // Adjust based on device performance
    if (PerformanceManager.settings.renderQuality === 'low') {
      baseProps.maxToRenderPerBatch = 5;
      baseProps.initialNumToRender = 5;
      baseProps.windowSize = 5;
    }

    return baseProps;
  }, [props]);

  const memoizedRenderItem = useCallback((itemData) => {
    return renderItem(itemData);
  }, [renderItem]);

  const memoizedKeyExtractor = useCallback((item, index) => {
    return keyExtractor ? keyExtractor(item, index) : index.toString();
  }, [keyExtractor]);

  return (
    <FlatList
      data={data}
      renderItem={memoizedRenderItem}
      keyExtractor={memoizedKeyExtractor}
      {...optimizedProps}
    />
  );
});

// Optimized Animated Component
export const OptimizedAnimated = memo(({ children, animationType, duration, ...props }) => {
  const [animation] = useState(new Animated.Value(0));

  const optimizedConfig = useMemo(() => {
    const baseConfig = { duration: duration || 300, useNativeDriver: true };
    return PerformanceManager.optimizeAnimationConfig(baseConfig);
  }, [duration]);

  const startAnimation = useCallback(() => {
    if (!PerformanceManager.shouldEnableFeature('animations')) {
      return;
    }

    Animated.timing(animation, {
      toValue: 1,
      ...optimizedConfig
    }).start();
  }, [animation, optimizedConfig]);

  useEffect(() => {
    // Defer animation start until interactions are complete
    InteractionManager.runAfterInteractions(() => {
      startAnimation();
    });
  }, [startAnimation]);

  const animatedStyle = useMemo(() => {
    if (!PerformanceManager.shouldEnableFeature('animations')) {
      return {};
    }

    const animations = {
      fadeIn: { opacity: animation },
      slideUp: { 
        transform: [{ 
          translateY: animation.interpolate({
            inputRange: [0, 1],
            outputRange: [50, 0]
          })
        }]
      },
      scale: {
        transform: [{
          scale: animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0.8, 1]
          })
        }]
      }
    };

    return animations[animationType] || animations.fadeIn;
  }, [animation, animationType]);

  return (
    <Animated.View style={[animatedStyle, props.style]} {...props}>
      {children}
    </Animated.View>
  );
});

// Lazy Loading Container
export const LazyContainer = memo(({ children, delay = 0 }) => {
  const [shouldRender, setShouldRender] = useState(delay === 0);

  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => setShouldRender(true), delay);
      return () => clearTimeout(timer);
    }
  }, [delay]);

  if (!shouldRender) {
    return null;
  }

  return <>{children}</>;
});

// Memory-efficient Modal Component
export const OptimizedModal = memo(({ visible, children, onClose, ...props }) => {
  const [isRendered, setIsRendered] = useState(visible);

  useEffect(() => {
    if (visible) {
      setIsRendered(true);
    } else {
      // Delay unmounting to allow exit animations
      const timer = setTimeout(() => setIsRendered(false), 300);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!isRendered) {
    return null;
  }

  return (
    <Modal visible={visible} onRequestClose={onClose} {...props}>
      {children}
    </Modal>
  );
});

// Performance monitoring HOC
export const withPerformanceMonitoring = (WrappedComponent, componentName) => {
  return memo((props) => {
    useEffect(() => {
      const startTime = Date.now();
      
      return () => {
        const renderTime = Date.now() - startTime;
        if (renderTime > 100) { // Log slow renders
          console.warn(`Slow render detected in ${componentName}: ${renderTime}ms`);
        }
      };
    });

    return <WrappedComponent {...props} />;
  });
};

// Optimized ScrollView with performance settings
export const OptimizedScrollView = memo(({ children, ...props }) => {
  const optimizedProps = useMemo(() => {
    const baseProps = {
      removeClippedSubviews: true,
      scrollEventThrottle: PerformanceManager.settings.throttleDelay,
      ...props
    };

    if (PerformanceManager.settings.renderQuality === 'low') {
      baseProps.scrollEventThrottle = 200;
    }

    return baseProps;
  }, [props]);

  return (
    <ScrollView {...optimizedProps}>
      {children}
    </ScrollView>
  );
});

// All components are already exported individually above