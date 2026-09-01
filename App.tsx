import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { BeerCard } from './src/components/BeerCard';
import { sampleBeers } from './src/data/sampleBeers';
import { Beer } from './src/types/beer';

const ratingStars = [1, 2, 3, 4, 5];

type FilterMode = 'all' | 'tried' | 'untried';

export default function App() {
  const [beers, setBeers] = useState<Beer[]>(sampleBeers);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterMode>('all');
  const [selectedBeerId, setSelectedBeerId] = useState<string | null>(null);
  const [onlyRated, setOnlyRated] = useState(false);

  const selectedBeer = beers.find((beer) => beer.id === selectedBeerId) ?? null;

  const filteredBeers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return beers.filter((beer) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [beer.name, beer.brewery, beer.style, beer.description]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesFilter =
        filter === 'all' || (filter === 'tried' ? beer.log.drunk : !beer.log.drunk);

      const matchesRated = !onlyRated || beer.log.rating > 0;

      return matchesQuery && matchesFilter && matchesRated;
    });
  }, [beers, filter, onlyRated, query]);

  const triedCount = beers.filter((beer) => beer.log.drunk).length;
  const ratedCount = beers.filter((beer) => beer.log.rating > 0).length;

  const updateBeer = (updatedBeer: Beer) => {
    setBeers((currentBeers) =>
      currentBeers.map((beer) => (beer.id === updatedBeer.id ? updatedBeer : beer)),
    );
  };

  if (selectedBeer) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <ScrollView contentContainerStyle={styles.container}>
          <Pressable accessibilityRole="button" onPress={() => setSelectedBeerId(null)} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back to beers</Text>
          </Pressable>

          <View style={styles.detailCard}>
            <View style={styles.detailImageWrap}>
              <Image source={selectedBeer.localImage} style={styles.detailImage} resizeMode="contain" />
            </View>

            <View style={styles.detailBody}>
              <View style={styles.detailHeader}>
                <View style={styles.detailHeaderText}>
                  <Text style={styles.detailTitle}>{selectedBeer.name}</Text>
                  <Text style={styles.detailMeta}>
                    {selectedBeer.brewery} · {selectedBeer.style} · {selectedBeer.abv}
                  </Text>
                </View>
                <View style={[styles.statusPill, selectedBeer.log.drunk ? styles.statusPillDone : styles.statusPillTodo]}>
                  <Text style={[styles.statusPillText, selectedBeer.log.drunk ? styles.statusPillTextDone : styles.statusPillTextTodo]}>
                    {selectedBeer.log.drunk ? 'Tried' : 'Not tried yet'}
                  </Text>
                </View>
              </View>

              <Text style={styles.detailDescription}>{selectedBeer.description}</Text>

              <View style={styles.infoRow}>
                <View style={styles.infoChip}>
                  <Text style={styles.infoChipText}>{selectedBeer.package}</Text>
                </View>
                <View style={styles.infoChip}>
                  <Text style={styles.infoChipText}>{selectedBeer.retailer}</Text>
                </View>
                <View style={styles.infoChip}>
                  <Text style={styles.infoChipText}>{selectedBeer.availability}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.editorCard}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleCopy}>
                <Text style={styles.sectionTitle}>Mark as drunk</Text>
                <Text style={styles.sectionHint}>Flip this on once you’ve tried it.</Text>
              </View>
              <Switch
                value={selectedBeer.log.drunk}
                onValueChange={(drunk) =>
                  updateBeer({
                    ...selectedBeer,
                    log: {
                      ...selectedBeer.log,
                      drunk,
                      triedOn: drunk ? selectedBeer.log.triedOn ?? new Date().toISOString().slice(0, 10) : undefined,
                    },
                  })
                }
                trackColor={{ false: '#d1d5db', true: '#86efac' }}
                thumbColor="#ffffff"
              />
            </View>

            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>Your rating</Text>
              <View style={styles.starRow}>
                {ratingStars.map((star) => {
                  const active = star <= selectedBeer.log.rating;
                  return (
                    <Pressable
                      key={star}
                      accessibilityRole="button"
                      accessibilityLabel={`Rate ${selectedBeer.name} ${star} star${star === 1 ? '' : 's'}`}
                      onPress={() =>
                        updateBeer({
                          ...selectedBeer,
                          log: {
                            ...selectedBeer.log,
                            rating: star,
                          },
                        })
                      }
                      style={[styles.starButton, active && styles.starButtonActive]}
                    >
                      <Text style={[styles.starText, active && styles.starTextActive]}>{active ? '★' : '☆'}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>Comment</Text>
              <TextInput
                multiline
                numberOfLines={5}
                placeholder="Taste, texture, what you'd order again…"
                placeholderTextColor="#9ca3af"
                style={styles.input}
                value={selectedBeer.log.comment}
                onChangeText={(comment) =>
                  updateBeer({
                    ...selectedBeer,
                    log: {
                      ...selectedBeer.log,
                      comment,
                    },
                  })
                }
              />
            </View>

            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>Tried on</Text>
              <TextInput
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9ca3af"
                style={styles.singleLineInput}
                value={selectedBeer.log.triedOn ?? ''}
                onChangeText={(triedOn) =>
                  updateBeer({
                    ...selectedBeer,
                    log: {
                      ...selectedBeer.log,
                      triedOn,
                    },
                  })
                }
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Null Pint</Text>
          <Text style={styles.subtitle}>
            Explore the real alcohol-free beer catalog, track what you’ve tried, and keep tasting notes.
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryMetric}>
            <Text style={styles.summaryMetricValue}>{beers.length}</Text>
            <Text style={styles.summaryMetricLabel}>Beers</Text>
          </View>
          <View style={styles.summaryMetric}>
            <Text style={styles.summaryMetricValue}>{triedCount}</Text>
            <Text style={styles.summaryMetricLabel}>Tried</Text>
          </View>
          <View style={styles.summaryMetric}>
            <Text style={styles.summaryMetricValue}>{ratedCount}</Text>
            <Text style={styles.summaryMetricLabel}>Rated</Text>
          </View>
        </View>

        <View style={styles.controlsCard}>
          <TextInput
            placeholder="Search by beer, brewery, style…"
            placeholderTextColor="#9ca3af"
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
          />

          <View style={styles.filterRow}>
            {(['all', 'tried', 'untried'] as FilterMode[]).map((option) => {
              const active = option === filter;
              const label = option === 'all' ? 'All' : option === 'tried' ? 'Drunk' : 'To try';
              return (
                <Pressable
                  key={option}
                  accessibilityRole="button"
                  onPress={() => setFilter(option)}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                >
                  <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{label}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.toggleRowInline}>
            <View>
              <Text style={styles.toggleInlineTitle}>Only rated</Text>
              <Text style={styles.toggleInlineHint}>Hide anything you haven’t scored yet.</Text>
            </View>
            <Switch
              value={onlyRated}
              onValueChange={setOnlyRated}
              trackColor={{ false: '#d1d5db', true: '#fcd34d' }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        <Text style={styles.resultsText}>{filteredBeers.length} beers shown</Text>

        <View style={styles.list}>
          {filteredBeers.map((beer) => (
            <BeerCard key={beer.id} beer={beer} onPress={() => setSelectedBeerId(beer.id)} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f4ee',
  },
  container: {
    padding: 20,
    gap: 16,
    paddingBottom: 32,
  },
  header: {
    gap: 8,
    marginTop: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    color: '#4b5563',
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryMetric: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  summaryMetricValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  summaryMetricLabel: {
    fontSize: 13,
    color: '#6b7280',
  },
  controlsCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 14,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#fcfcfd',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: '#f3f4f6',
  },
  filterChipActive: {
    backgroundColor: '#111827',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  toggleRowInline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  toggleInlineTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  toggleInlineHint: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  resultsText: {
    fontSize: 14,
    color: '#6b7280',
  },
  list: {
    gap: 14,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  detailCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  detailImageWrap: {
    height: 260,
    backgroundColor: '#f8fafc',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailImage: {
    width: '100%',
    height: '100%',
  },
  detailBody: {
    padding: 18,
    gap: 14,
  },
  detailHeader: {
    gap: 12,
  },
  detailHeaderText: {
    gap: 4,
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  detailMeta: {
    fontSize: 15,
    color: '#6b7280',
  },
  statusPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  statusPillDone: {
    backgroundColor: '#dcfce7',
  },
  statusPillTodo: {
    backgroundColor: '#ede9fe',
  },
  statusPillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  statusPillTextDone: {
    color: '#166534',
  },
  statusPillTextTodo: {
    color: '#5b21b6',
  },
  detailDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: '#4b5563',
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  infoChip: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },
  infoChipText: {
    fontSize: 12,
    color: '#374151',
  },
  editorCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 18,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  toggleCopy: {
    flex: 1,
    gap: 4,
  },
  sectionBlock: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  sectionHint: {
    fontSize: 13,
    color: '#6b7280',
  },
  starRow: {
    flexDirection: 'row',
    gap: 8,
  },
  starButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
  },
  starButtonActive: {
    backgroundColor: '#f59e0b',
  },
  starText: {
    fontSize: 24,
    color: '#9ca3af',
  },
  starTextActive: {
    color: '#ffffff',
  },
  input: {
    minHeight: 112,
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
  singleLineInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#fcfcfd',
  },
});
