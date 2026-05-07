# 📍Location-Based Alarm Application

A full-stack mobile application that allows users to create alarms based on geographic destinations instead of only time. The app lets users select a destination on a map, store alarms securely, and trigger alerts when the user enters the configured radius around that location.

---

## 🚀 Features

### 🔐 Authentication
- User signup and login
- Password hashing using BCrypt
- JWT-based authentication
- Protected APIs for user-specific data

### ⏰ Alarm Management
- Create alarms
- View user-specific alarms
- Update alarms
- Delete alarms
- Toggle alarms active/inactive

### 📍Location Features
- Google Maps-based destination selection
- Center map on current location
- Reverse geocoding for readable destination address
- Live distance tracking from current location to saved alarm destination
- Foreground location-based triggering
- Reusable trigger logic (alarm resets when user leaves the area and can trigger again on re-entry)

### ⚠️ Security
- JWT token generation and validation
- Spring Security filter chain
- Ownership protection so users can only access their own alarms

### 🤖 AI Feature (Frequent Place Detection)
- Collects user location history
- Applies clustering (DBSCAN-inspired) to detect frequent locations
- Identifies commonly visited places automatically
- Displays intelligent suggestions in the app
- Allows **direct alarm creation from AI-detected places**

---

## 🧠 How the AI Feature Works

1. The app periodically stores user location samples
2. Backend groups nearby points using a distance-based clustering approach
3. Clusters with sufficient visits are identified as frequent places
4. These are returned to the app as suggestions
5. Users can directly create alarms from these suggestions

---

## 🛠️ Tech Stack

### Frontend
- React Native
- Expo
- Expo Router
- react-native-maps
- expo-location
- expo-notifications
- AsyncStorage

### Backend
- Java
- Spring Boot
- Spring Security
- Spring Data JPA
- JWT
- BCrypt

### Database
- MySQL

---

## 🏛️ Architecture Overview

### Mobile App
Responsible for:
- Authentication UI
- Alarm CRUD UI
- Google Maps destination selection
- Foreground location tracking
- Triggering alerts when within alarm radius

### Backend
Responsible for:
- Signup/Login APIs
- JWT authentication
- User-specific alarm CRUD APIs
- Ownership validation

### Database
Stores:
- Users
- Alarms
- Destination coordinates
- Destination address
- Alarm settings
- Location history

---

## 📡 API Endpoints

### Auth
- `POST /api/auth/signup`
- `POST /api/auth/login`

### Alarms
- `GET /api/alarms`
- `POST /api/alarms`
- `PUT /api/alarms/{id}`
- `DELETE /api/alarms/{id}`

### Location History (AI)
- `POST /api/location-history`

### AI Suggestions
- `GET /api/ai/frequent-places`

---

## ⛓ Project Flow

1. User signs up and logs in
2. Backend returns JWT token
3. Mobile app stores token locally
4. User creates an alarm by selecting a destination on the map
5. Destination coordinates and address are stored in MySQL
6. Mobile app tracks current location in foreground
7. Distance is calculated against saved alarm coordinates
8. Alert/notification is triggered when user enters the alarm radius
9. Location samples are stored for AI processing
10. Frequent places are detected and suggested

---

## 👩🏻‍💻 How the Trigger Works

The app uses live device location updates and calculates the distance between:
- Current device location
- Selected alarm destination

If:

`distance <= alarm radius`

the alarm triggers.

The trigger is reusable:
- entering the radius triggers the alert
- leaving the radius resets the state
- re-entering the radius triggers it again

---

## 🔧 Setup Instructions

## 1. Clone the repository

```bash
git clone <your-repo-url>
cd location-based-alarm-app
```

## 2. Run backend

```bash
cd backend
mvn spring-boot:run
```

## 3. Run frontend

```bash
cd mobile
npx expo start -c
```
---

## 👩‍💻 Author

Sabah Ayesha K
