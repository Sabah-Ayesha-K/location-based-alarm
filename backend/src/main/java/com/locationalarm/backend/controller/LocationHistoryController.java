package com.locationalarm.backend.controller;

import com.locationalarm.backend.dto.LocationSampleRequest;
import com.locationalarm.backend.entity.LocationHistory;
import com.locationalarm.backend.entity.User;
import com.locationalarm.backend.repository.LocationHistoryRepository;
import com.locationalarm.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/location-history")
public class LocationHistoryController {

    private final LocationHistoryRepository locationHistoryRepository;
    private final UserRepository userRepository;

    public LocationHistoryController(LocationHistoryRepository locationHistoryRepository,
                                     UserRepository userRepository) {
        this.locationHistoryRepository = locationHistoryRepository;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<?> saveLocationSample(@RequestBody LocationSampleRequest request,
                                                Authentication authentication) {
        String email = authentication.getName();

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }

        LocationHistory sample = new LocationHistory();
        sample.setLatitude(request.getLatitude());
        sample.setLongitude(request.getLongitude());
        sample.setAddress(request.getAddress());
        sample.setTimestamp(LocalDateTime.now());
        sample.setUser(user);

        locationHistoryRepository.save(sample);

        return ResponseEntity.ok("Location sample saved");
    }
}