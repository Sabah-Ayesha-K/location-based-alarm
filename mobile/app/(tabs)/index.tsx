import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function HomeScreen() {
  const [message, setMessage] = useState('Tap the button to test backend connection');

  const testBackend = async () => {
    try {
      const response = await fetch('http://192.168.0.3:8080/api/test');
      const data = await response.text();
      setMessage(data);
    } catch (error) {
      setMessage('Failed to connect to backend');
      console.log('Backend connection error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Location Alarm App</Text>
      <Text style={styles.subtitle}>{message}</Text>

      <TouchableOpacity style={styles.button} onPress={testBackend}>
        <Text style={styles.buttonText}>Test Backend</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111111',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#444444',
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    width: '80%',
    backgroundColor: '#111111',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});