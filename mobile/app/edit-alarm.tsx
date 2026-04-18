import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BASE_URL } from '../constants/config';

export default function EditAlarmScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [title, setTitle] = useState((params.title as string) || '');
  const [latitude, setLatitude] = useState((params.latitude as string) || '');
  const [longitude, setLongitude] = useState((params.longitude as string) || '');
  const [radius, setRadius] = useState((params.radius as string) || '');
  const [active, setActive] = useState((params.active as string) === 'true');
  const [address, setAddress] = useState((params.address as string) || '');

  const handleUpdateAlarm = async () => {
    try {
      const token = await AsyncStorage.getItem('token');

      if (!token) {
        Alert.alert('Error', 'No token found. Please login again.');
        router.replace('/login');
        return;
      }

      const response = await fetch(`${BASE_URL}/api/alarms/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          latitude: Number(latitude),
          longitude: Number(longitude),
          radius: Number(radius),
          active,
          address,
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
      console.log('Update alarm error:', error);
      Alert.alert('Error', 'Could not connect to backend');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Edit Alarm</Text>

      <TextInput
        placeholder="Alarm Title"
        style={styles.input}
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        placeholder="Latitude"
        style={styles.input}
        value={latitude}
        onChangeText={setLatitude}
        keyboardType="numeric"
      />

      <TextInput
        placeholder="Longitude"
        style={styles.input}
        value={longitude}
        onChangeText={setLongitude}
        keyboardType="numeric"
      />

      <TextInput
        placeholder="Radius (meters)"
        style={styles.input}
        value={radius}
        onChangeText={setRadius}
        keyboardType="numeric"
      />

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Active</Text>
        <Switch value={active} onValueChange={setActive} />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleUpdateAlarm}>
        <Text style={styles.buttonText}>Update Alarm</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    justifyContent: 'center',
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#111',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    color: '#111',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  switchLabel: {
    fontSize: 16,
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