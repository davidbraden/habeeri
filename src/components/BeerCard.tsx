import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Beer } from '../types/beer';

type BeerCardProps = {
  beer: Beer;
  onPress: () => void;
};

const stars = [1, 2, 3, 4, 5];

export function BeerCard({ beer, onPress }: BeerCardProps) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.card}>
      <View style={styles.imageWrap}>
        <Image source={beer.localImage} style={styles.image} resizeMode="contain" />
        <View style={[styles.drunkBadge, beer.log.drunk ? styles.drunkBadgeDone : styles.drunkBadgeTodo]}>
          <Text style={[styles.drunkBadgeText, beer.log.drunk ? styles.drunkBadgeTextDone : styles.drunkBadgeTextTodo]}>
            {beer.log.drunk ? 'Drunk' : 'To try'}
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.headerRow}>
          <View style={styles.titleBlock}>
            <Text style={styles.name}>{beer.name}</Text>
            <Text style={styles.meta}>
              {beer.brewery} · {beer.style} · {beer.abv}
            </Text>
          </View>
        </View>

        <Text numberOfLines={2} style={styles.description}>
          {beer.description}
        </Text>

        <View style={styles.footerRow}>
          <Text style={styles.packageText}>{beer.package}</Text>
          <View style={styles.ratingRow}>
            {stars.map((star) => (
              <Text key={star} style={[styles.star, star <= beer.log.rating && styles.starActive]}>
                ★
              </Text>
            ))}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  imageWrap: {
    height: 180,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  drunkBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  drunkBadgeDone: {
    backgroundColor: '#dcfce7',
  },
  drunkBadgeTodo: {
    backgroundColor: '#ede9fe',
  },
  drunkBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  drunkBadgeTextDone: {
    color: '#166534',
  },
  drunkBadgeTextTodo: {
    color: '#5b21b6',
  },
  body: {
    padding: 16,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  titleBlock: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  meta: {
    fontSize: 13,
    color: '#6b7280',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4b5563',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  packageText: {
    fontSize: 13,
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 2,
  },
  star: {
    fontSize: 16,
    color: '#d1d5db',
  },
  starActive: {
    color: '#f59e0b',
  },
});
