import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BeerCard } from './src/components/BeerCard';
import { sampleBeers } from './src/data/sampleBeers';

export default function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Null Pint</Text>
          <Text style={styles.subtitle}>
            Track zero alcohol beers you have tried, rate them, and jot quick notes.
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>App stub</Text>
          <Text style={styles.summaryText}>- Local-only sample data</Text>
          <Text style={styles.summaryText}>- Per-beer star rating</Text>
          <Text style={styles.summaryText}>- Free-text tasting notes</Text>
          <Text style={styles.summaryText}>- Ready for storage wiring next</Text>
        </View>

        <View style={styles.list}>
          {sampleBeers.map((beer) => (
            <BeerCard key={beer.id} beer={beer} />
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
    gap: 6,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 15,
    color: '#374151',
  },
  list: {
    gap: 14,
    paddingBottom: 32,
  },
});
