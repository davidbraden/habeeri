import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Beer } from '../types/beer';

type BeerCardProps = {
  beer: Beer;
};

export function BeerCard({ beer }: BeerCardProps) {
  const [rating, setRating] = useState(beer.initialRating);
  const [comment, setComment] = useState(beer.initialComment);

  const stars = useMemo(() => [1, 2, 3, 4, 5], []);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleBlock}>
          <Text style={styles.name}>{beer.name}</Text>
          <Text style={styles.meta}>
            {beer.brewery} · {beer.style} · {beer.abv}
          </Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Local</Text>
        </View>
      </View>

      <View style={styles.notesRow}>
        {beer.tastingNotes.map((note) => (
          <View key={note} style={styles.notePill}>
            <Text style={styles.noteText}>{note}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Your rating</Text>
        <View style={styles.starRow}>
          {stars.map((star) => {
            const active = star <= rating;
            return (
              <Pressable
                key={star}
                accessibilityRole="button"
                accessibilityLabel={`Rate ${beer.name} ${star} star${star === 1 ? '' : 's'}`}
                onPress={() => setRating(star)}
                style={[styles.starButton, active && styles.starButtonActive]}
              >
                <Text style={[styles.starText, active && styles.starTextActive]}>{active ? '★' : '☆'}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Comment</Text>
        <TextInput
          multiline
          numberOfLines={3}
          placeholder="What did you think?"
          placeholderTextColor="#9ca3af"
          style={styles.input}
          value={comment}
          onChangeText={setComment}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 14,
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
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  meta: {
    fontSize: 14,
    color: '#6b7280',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#ecfccb',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3f6212',
  },
  notesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  notePill: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  noteText: {
    fontSize: 12,
    color: '#4b5563',
    textTransform: 'capitalize',
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  starRow: {
    flexDirection: 'row',
    gap: 8,
  },
  starButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
  },
  starButtonActive: {
    backgroundColor: '#f59e0b',
  },
  starText: {
    fontSize: 22,
    color: '#9ca3af',
  },
  starTextActive: {
    color: '#ffffff',
  },
  input: {
    minHeight: 88,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111827',
    textAlignVertical: 'top',
    backgroundColor: '#fcfcfd',
  },
});
