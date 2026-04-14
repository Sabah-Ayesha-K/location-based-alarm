import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Location Alarm App</Text>
      <Text style={styles.subtitle}>
        Set alarms based on where you are going.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/login')}
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.buttonSecondary}
        onPress={() => router.push('/signup')}
      >
        <Text style={styles.buttonSecondaryText}>Sign Up</Text>
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
    marginBottom: 14,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSecondary: {
    width: '80%',
    borderWidth: 1,
    borderColor: '#111111',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonSecondaryText: {
    color: '#111111',
    fontSize: 16,
    fontWeight: '600',
  },
});