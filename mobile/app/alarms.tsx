import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert , Switch} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { BASE_URL } from '../constants/config';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { calculateDistanceInMeters } from '../utils/distance';

type Alarm = {
  id: number;
  title: string;
  latitude: number;
  longitude: number;
  radius: number;
  active: boolean;
  address?: string;
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function AlarmsScreen() {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const router = useRouter();
  const triggeredAlarmIds = useRef<Set<number>>(new Set());
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const [alarmDistances, setAlarmDistances] = useState<Record<number, number>>({});

  const fetchAlarms = async () => {
    try {
      const token = await AsyncStorage.getItem('token');

      if (!token) {
        Alert.alert('Error', 'No token found. Please login again.');
        router.replace('/login');
        return;
      }

      const response = await fetch(`${BASE_URL}/api/alarms`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        Alert.alert('Error', errorText || 'Failed to fetch alarms');
        return;
      }

      const data = await response.json();
      setAlarms(data);
    } catch (error) {
      console.log('Fetch alarms error:', error);
      Alert.alert('Error', 'Could not connect to backend');
    }
  };

  const handleDeleteAlarm = async (id: number) => {
    try {
      const token = await AsyncStorage.getItem('token');

      if (!token) {
        Alert.alert('Error', 'No token found. Please login again.');
        router.replace('/login');
        return;
      }

      const response = await fetch(`${BASE_URL}/api/alarms/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.text();

      if (response.ok) {
        Alert.alert('Success', data);
        triggeredAlarmIds.current.delete(id);
        fetchAlarms();
      } else {
        Alert.alert('Error', data);
      }
    } catch (error) {
      console.log('Delete alarm error:', error);
      Alert.alert('Error', 'Could not connect to backend');
    }
  };

  const handleToggleAlarm = async (item: Alarm) => {
    try {
        const token = await AsyncStorage.getItem('token');

        if (!token) {
        Alert.alert('Error', 'No token found. Please login again.');
        router.replace('/login');
        return;
        }

        const response = await fetch(`${BASE_URL}/api/alarms/${item.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            title: item.title,
            latitude: item.latitude,
            longitude: item.longitude,
            radius: item.radius,
            active: !item.active,
        }),
    });

    const data = await response.text();
        if (response.ok) {
        fetchAlarms();
        } else {
        Alert.alert('Error', data);
        }
    } catch (error) {
        console.log('Toggle alarm error:', error);
        Alert.alert('Error', 'Could not connect to backend');
    }
  };

  const confirmDelete = (id: number) => {
    Alert.alert(
      'Delete Alarm',
      'Are you sure you want to delete this alarm?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => handleDeleteAlarm(id) },
      ]
    );
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
    Alert.alert('Logged out', 'You have been logged out successfully.');
    router.replace('/login');
  };

  const requestNotificationPermission = async () => {
    const settings = await Notifications.getPermissionsAsync();
    if (!settings.granted) {
      await Notifications.requestPermissionsAsync();
    }
  };

  const triggerAlarmNotification = async (alarm: Alarm, distance: number) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Location Alarm Triggered',
        body: `You are near ${alarm.title}. Distance: ${Math.round(distance)} meters`,
        sound: true,
      },
      trigger: null,
    });
  };

  const startLocationTracking = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to trigger alarms.');
        return;
      }

      await requestNotificationPermission();

      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }

      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        async (location) => {
          const currentLat = location.coords.latitude;
          const currentLon = location.coords.longitude;

          const updatedDistances: Record<number, number> = {};

          for (const alarm of alarms) {
            if (!alarm.active) continue;

            const distance = calculateDistanceInMeters(
                currentLat,
                currentLon,
                alarm.latitude,
                alarm.longitude
            );

            updatedDistances[alarm.id] = distance;

            const isInsideRadius = distance <= alarm.radius;
            const alreadyTriggered = triggeredAlarmIds.current.has(alarm.id);

            if (isInsideRadius && !alreadyTriggered) {
                triggeredAlarmIds.current.add(alarm.id);

                await triggerAlarmNotification(alarm, distance);
                Alert.alert(
                'Alarm Triggered',
                `You are near ${alarm.title} (${Math.round(distance)} meters away)`
                );
            }

            if (!isInsideRadius && alreadyTriggered) {
                triggeredAlarmIds.current.delete(alarm.id);
            }
          }

          setAlarmDistances(updatedDistances);
        }
      );
    } catch (error) {
      console.log('Location tracking error:', error);
      Alert.alert('Error', 'Could not start location tracking');
    }
  };

  useEffect(() => {
    fetchAlarms();
  }, []);

  useEffect(() => {
    if (alarms.length > 0) {
      startLocationTracking();
    }

    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
        locationSubscription.current = null;
      }
    };
  }, [alarms]);

  const renderItem = ({ item }: { item: Alarm }) => (
  <View style={[styles.card, !item.active && styles.inactiveCard]}>
    <View style={styles.cardHeader}>
      <Text style={styles.title}>{item.title}</Text>
      <Switch value={item.active} onValueChange={() => handleToggleAlarm(item)} />
    </View>

    {item.address ? (
        <Text style={styles.addressText}>{item.address}</Text>
    ) : (
        <Text style={styles.addressText}>No address available</Text>
    )}

    <Text>Latitude: {item.latitude}</Text>
    <Text>Longitude: {item.longitude}</Text>
    <Text>Radius: {item.radius} meters</Text>
    <Text>Status: {item.active ? 'Active' : 'Inactive'}</Text>

    <Text>
      Distance: {alarmDistances[item.id] !== undefined
        ? `${Math.round(alarmDistances[item.id])} meters`
        : 'Calculating...'}
    </Text>

    <Text style={{ color: alarmDistances[item.id] !== undefined && alarmDistances[item.id] <= item.radius ? 'green' : 'black' }}>
      {alarmDistances[item.id] !== undefined && alarmDistances[item.id] <= item.radius
        ? 'Inside trigger radius'
        : 'Outside trigger radius'}
    </Text>

    <View style={styles.actionRow}>
      <TouchableOpacity
        style={styles.editButton}
        onPress={() =>
          router.push({
            pathname: '/edit-alarm',
            params: {
              id: item.id.toString(),
              title: item.title,
              latitude: item.latitude.toString(),
              longitude: item.longitude.toString(),
              radius: item.radius.toString(),
              active: item.active ? 'true' : 'false',
              address: item.address || '',
            },
          })
        }
      >
        <Text style={styles.editButtonText}>Edit</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => confirmDelete(item.id)}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  </View>
);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>My Alarms</Text>
      <Text style={styles.subHeading}>Manage your destination-based alerts</Text>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/create-alarm')}>
        <Text style={styles.buttonText}>Create Alarm</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={fetchAlarms}>
        <Text style={styles.secondaryButtonText}>Refresh</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      <FlatList
        data={alarms}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
            <View style={styles.emptyStateBox}>
                <Text style={styles.emptyText}>No alarms yet</Text>
                <Text style={styles.emptySubtext}>Create your first location alarm to get started.</Text>
            </View>
        }        
        contentContainerStyle={alarms.length === 0 ? styles.emptyContainer : undefined}
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
  button: {
    backgroundColor: '#111',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#111',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: '#111',
    fontSize: 15,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#b00020',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
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
  deleteButton: {
    marginTop: 12,
    backgroundColor: '#d32f2f',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    },
    editButton: {
    marginTop: 12,
    backgroundColor: '#1976d2',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    },
    editButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
    inactiveCard: {
    opacity: 0.6,
  },
  emptyStateBox: {
    alignItems: 'center',
  },
  emptySubtext: {
    color: '#777',
    marginTop: 6,
    textAlign: 'center',
  },
  subHeading: {
    color: '#555',
    marginBottom: 16,
  },
  addressText: {
    color: '#444',
    marginBottom: 8,
  },
});