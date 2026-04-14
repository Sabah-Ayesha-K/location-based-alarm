import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

        <TextInput
            placeholder="Email"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
       />

        <TextInput
            placeholder="Password"
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={setPassword}
        />
        <TouchableOpacity
            style={styles.button}
            onPress={() => {
                console.log('Email:', email);
                console.log('Password:', password);
            }}
            >
            <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/signup')}>
        <Text style={styles.link}>Don't have an account? Sign up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#111111',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    color: '#111111',
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
  link: {
    marginTop: 16,
    textAlign: 'center',
    color: '#007AFF',
  },
});