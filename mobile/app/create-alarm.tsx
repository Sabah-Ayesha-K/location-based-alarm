import { useRef, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { BASE_URL } from '../constants/config';
import * as Location from 'expo-location';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';

export default function CreateAlarmScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView | null>(null);

  const [title, setTitle] = useState('');
  const [radius, setRadius] = useState('');

  // Destination chosen by tapping the map
  const [destination, setDestination] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // User's current device location
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [region, setRegion] = useState<Region>({
    latitude: 12.9716,
    longitude: 77.5946,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const [address, setAddress] = useState<string | null>(null);

  const handleMapPress = async (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;

    setDestination({ latitude, longitude });

    try {
        const result = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
        });

        if (result.length > 0) {
        const place = result[0];

        const formattedAddress = [
            place.name,
            place.street,
            place.city,
            place.region,
        ]
            .filter(Boolean)
            .join(', ');

        setAddress(formattedAddress);
        }
    } catch (error) {
        console.log('Reverse geocode error:', error);
        setAddress(null);
    }
  };

  const centerOnCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const nextRegion: Region = {
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      setCurrentLocation({ latitude, longitude });
      setRegion(nextRegion);
      mapRef.current?.animateToRegion(nextRegion, 1000);
    } catch (error) {
      console.log('Location error:', error);
      Alert.alert('Error', 'Could not get current location');
    }
  };

  const handleCreateAlarm = async () => {
    try {
      if (!destination) {
        Alert.alert('Select destination', 'Please tap on the map to choose a destination.');
        return;
      }

      if (!title.trim()) {
        Alert.alert('Missing title', 'Please enter an alarm title.');
        return;
      }

      if (!radius.trim()) {
        Alert.alert('Missing radius', 'Please enter a trigger radius.');
        return;
      }

      const token = await AsyncStorage.getItem('token');

      if (!token) {
        Alert.alert('Error', 'No token found. Please login again.');
        router.replace('/login');
        return;
      }

      const response = await fetch(`${BASE_URL}/api/alarms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          latitude: destination.latitude,
          longitude: destination.longitude,
          radius: Number(radius),
          active: true,
          address: address,
        }),
      });

      const data = await response.text();

      if (response.ok) {
        Alert.alert('Success', data);
        router.replace('/alarms');
      } else {
        Alert.alert('Error', data);
      }
    } catch (error) {
      console.log('Create alarm error:', error);
      Alert.alert('Error', 'Could not connect to backend');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Create Alarm</Text>

      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={region}
        onPress={handleMapPress}
        showsUserLocation
        showsMyLocationButton
      >
        {destination && (
          <Marker
            coordinate={destination}
            title="Alarm Destination"
            pinColor="red"
          />
        )}

        {currentLocation && (
          <Marker
            coordinate={currentLocation}
            title="Current Location"
            pinColor="blue"
          />
        )}
      </MapView>

      <TouchableOpacity style={styles.secondaryButton} onPress={centerOnCurrentLocation}>
        <Text style={styles.secondaryButtonText}>Center on My Location</Text>
      </TouchableOpacity>

      <TextInput
        placeholder="Alarm Title"
        style={styles.input}
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        placeholder="Radius (meters)"
        style={styles.input}
        value={radius}
        onChangeText={setRadius}
        keyboardType="numeric"
      />

      <View style={styles.infoBox}>
        <Text style={styles.infoHeading}>Selected Destination</Text>

        {destination ? (
            <>
            <Text>{address || 'Fetching address...'}</Text>
            <Text style={{ fontSize: 12, color: '#666' }}>
                {destination.latitude}, {destination.longitude}
            </Text>
            </>
        ) : (
            <Text>Tap on the map to choose a destination</Text>
        )}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleCreateAlarm}>
        <Text style={styles.buttonText}>Save Alarm</Text>
      </TouchableOpacity>
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
    textAlign: 'center',
    color: '#111',
  },
  map: {
    width: '100%',
    height: 260,
    borderRadius: 12,
    marginBottom: 12,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#111',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  secondaryButtonText: {
    color: '#111',
    fontSize: 15,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    color: '#111',
  },
  infoBox: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  infoHeading: {
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#111',
  },
  button: {
    backgroundColor: '#111',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});