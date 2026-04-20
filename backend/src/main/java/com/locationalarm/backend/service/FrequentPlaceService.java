package com.locationalarm.backend.service;

import com.locationalarm.backend.dto.FrequentPlaceResponse;
import com.locationalarm.backend.entity.LocationHistory;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class FrequentPlaceService {

    private static final double CLUSTER_DISTANCE_METERS = 100.0;
    private static final int MIN_VISITS = 3;

    public List<FrequentPlaceResponse> findFrequentPlaces(List<LocationHistory> samples) {
        List<Cluster> clusters = new ArrayList<>();

        for (LocationHistory sample : samples) {
            boolean addedToCluster = false;

            for (Cluster cluster : clusters) {
                double distance = calculateDistanceInMeters(
                        sample.getLatitude(),
                        sample.getLongitude(),
                        cluster.centerLat,
                        cluster.centerLon
                );

                if (distance <= CLUSTER_DISTANCE_METERS) {
                    cluster.addSample(sample);
                    addedToCluster = true;
                    break;
                }
            }

            if (!addedToCluster) {
                clusters.add(new Cluster(sample));
            }
        }

        List<FrequentPlaceResponse> result = new ArrayList<>();

        clusters.sort((a, b) -> Integer.compare(b.samples.size(), a.samples.size()));

        int index = 1;
        for (Cluster cluster : clusters) {
            if (cluster.samples.size() >= MIN_VISITS) {
                result.add(new FrequentPlaceResponse(
                        "Frequent Place " + index,
                        cluster.centerLat,
                        cluster.centerLon,
                        cluster.getRepresentativeAddress(),
                        cluster.samples.size()
                ));
                index++;
            }
        }

        return result;
    }

    private double calculateDistanceInMeters(double lat1, double lon1, double lat2, double lon2) {
        double R = 6371000;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1))
                * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2)
                * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private static class Cluster {
        private final List<LocationHistory> samples = new ArrayList<>();
        private double centerLat;
        private double centerLon;

        Cluster(LocationHistory firstSample) {
            addSample(firstSample);
        }

        void addSample(LocationHistory sample) {
            samples.add(sample);
            recomputeCenter();
        }

        void recomputeCenter() {
            double latSum = 0;
            double lonSum = 0;

            for (LocationHistory sample : samples) {
                latSum += sample.getLatitude();
                lonSum += sample.getLongitude();
            }

            centerLat = latSum / samples.size();
            centerLon = lonSum / samples.size();
        }

        String getRepresentativeAddress() {
            Map<String, Integer> counts = new HashMap<>();

            for (LocationHistory sample : samples) {
                if (sample.getAddress() != null && !sample.getAddress().isBlank()) {
                    counts.put(sample.getAddress(), counts.getOrDefault(sample.getAddress(), 0) + 1);
                }
            }

            return counts.entrySet().stream()
                    .max(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey)
                    .orElse("Unknown location");
        }
    }
}