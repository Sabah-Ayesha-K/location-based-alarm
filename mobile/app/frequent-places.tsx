import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants/config';
import { useRouter } from 'expo-router';

type FrequentPlace = {
  label: string;
  latitude: number;
  longitude: number;
  address: string;
  visitCount: number;
};

export default function FrequentPlacesScreen() {
  const [places, setPlaces] = useState<FrequentPlace[]>([]);
  const router = useRouter();

  const fetchFrequentPlaces = async () => {
    try {
      const token = await AsyncStorage.getItem('token');

      if (!token) {
        Alert.alert('Error', 'No token found. Please login again.');
        router.replace('/login');
        return;
      }

      const response = await fetch(`${BASE_URL}/api/ai/frequent-places`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        Alert.alert('Error', errorText);
        return;
      }

      const data = await response.json();
      setPlaces(data);
    } catch (error) {
      console.log('Fetch frequent places error:', error);
      Alert.alert('Error', 'Could not fetch frequent places');
    }
  };

  useEffect(() => {
    fetchFrequentPlaces();
  }, []);

  const handleCreateAlarmFromPlace = (place: FrequentPlace) => {
    router.push({
      pathname: '/create-alarm',
      params: {
        title: place.label,
        latitude: place.latitude.toString(),
        longitude: place.longitude.toString(),
        address: place.address || '',
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Frequent Places</Text>

      <FlatList
        data={places}
        keyExtractor={(item, index) => `${item.label}-${index}`}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.label}</Text>
            <Text>{item.address}</Text>
            <Text>Visits: {item.visitCount}</Text>
            <Text>{item.latitude}, {item.longitude}</Text>

            <TouchableOpacity
              style={styles.button}
              onPress={() => handleCreateAlarmFromPlace(item)}
            >
              <Text style={styles.buttonText}>Create Alarm from This</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No frequent places detected yet</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#111',
  },
  card: {
    backgroundColor: '#f5f5f5',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  button: {
    marginTop: 12,
    backgroundColor: '#111',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 40,
  },
});