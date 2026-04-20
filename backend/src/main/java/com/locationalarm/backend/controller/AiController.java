package com.locationalarm.backend.controller;

import com.locationalarm.backend.dto.FrequentPlaceResponse;
import com.locationalarm.backend.entity.LocationHistory;
import com.locationalarm.backend.entity.User;
import com.locationalarm.backend.repository.LocationHistoryRepository;
import com.locationalarm.backend.repository.UserRepository;
import com.locationalarm.backend.service.FrequentPlaceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final LocationHistoryRepository locationHistoryRepository;
    private final UserRepository userRepository;
    private final FrequentPlaceService frequentPlaceService;

    public AiController(LocationHistoryRepository locationHistoryRepository,
                        UserRepository userRepository,
                        FrequentPlaceService frequentPlaceService) {
        this.locationHistoryRepository = locationHistoryRepository;
        this.userRepository = userRepository;
        this.frequentPlaceService = frequentPlaceService;
    }

    @GetMapping("/frequent-places")
    public ResponseEntity<?> getFrequentPlaces(Authentication authentication) {
        String email = authentication.getName();

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }

        List<LocationHistory> samples = locationHistoryRepository.findByUser(user);
        List<FrequentPlaceResponse> places = frequentPlaceService.findFrequentPlaces(samples);

        return ResponseEntity.ok(places);
    }
}