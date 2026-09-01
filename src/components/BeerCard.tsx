import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Beer } from '../types/beer';

type BeerCardProps = {
  beer: Beer;
  onPress: () => void;
};

export function BeerCard({ beer, onPress }: BeerCardProps) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.card}>
      <View style={styles.imageWrap}>
        <Image source={beer.localImage} style={styles.image} resizeMode="contain" />
        <View style={[styles.statusDot, beer.log.drunk ? styles.statusDotDone : styles.statusDotTodo]}>
          <Text style={styles.statusDotText}>{beer.log.rating > 0 ? beer.log.rating : ''}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text numberOfLines={2} style={styles.name}>
          {beer.name}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
    width: '48%',
  },
  imageWrap: {
    height: 150,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  statusDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    minWidth: 24,
    height: 24,
    paddingHorizontal: 6,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDotDone: {
    backgroundColor: '#111827',
  },
  statusDotTodo: {
    backgroundColor: '#d1d5db',
  },
  statusDotText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  body: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  name: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    color: '#111827',
  },
});
