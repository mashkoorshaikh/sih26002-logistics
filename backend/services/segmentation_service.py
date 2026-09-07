"""
MODULAR ROUTE SEGMENTATION & RISK INTELLIGENCE SERVICE
======================================================
Divides transportation corridors into logical waypoints and segments,
calculates segment-specific atmospheric weather conditions and ML risk
predictions, and constructs color-coded map geometries with aggregate
risk summaries.

Designed with pluggable GIS & Historical incident data interfaces.
"""

import os
import math
import logging
import warnings
warnings.filterwarnings("ignore")
from typing import Dict, Any, List, Optional, Tuple
from services.weather_service import weather_service
from services.risk_service import risk_service

logger = logging.getLogger("ner_logistics.segmentation_service")

# Color specifications as requested: GREEN = LOW, YELLOW = MEDIUM, RED = HIGH
RISK_COLORS = {
    "LOW": "#22c55e",      # Green
    "MEDIUM": "#eab308",   # Yellow / Amber
    "HIGH": "#ef4444"      # Red
}

# Pre-indexed geographical milestones for major NER corridors
KNOWN_CORRIDOR_SEGMENTS = {
    ("guwahati", "shillong"): [
        {
            "segment_id": "seg-1",
            "name": "Guwahati to Nongpoh",
            "description": "Khanapara & Burnihat foothills transition into NH6 lower ghats",
            "start_node": "Guwahati",
            "end_node": "Nongpoh",
            "start_coord": [91.7362, 26.1445],
            "end_coord": [91.8807, 25.9036],
            "default_slope": 6.5,
            "elevation_m": 580.0,
            "road_quality": 4.1,
            "historical_incidents": 1,
            "road_type": "national_highway"
        },
        {
            "segment_id": "seg-2",
            "name": "Nongpoh to Umiam (Barapani)",
            "description": "Steep mountain ghat ascent with hairpin bends & landslide vulnerability zones",
            "start_node": "Nongpoh",
            "end_node": "Umiam",
            "start_coord": [91.8807, 25.9036],
            "end_coord": [91.9150, 25.6700],
            "default_slope": 18.2,
            "elevation_m": 1040.0,
            "road_quality": 3.4,
            "historical_incidents": 5,
            "road_type": "national_highway"
        },
        {
            "segment_id": "seg-3",
            "name": "Umiam to Shillong",
            "description": "Highland plateau climb through Mawlai bypass into city center",
            "start_node": "Umiam",
            "end_node": "Shillong",
            "start_coord": [91.9150, 25.6700],
            "end_coord": [91.8933, 25.5788],
            "default_slope": 8.0,
            "elevation_m": 1520.0,
            "road_quality": 3.9,
            "historical_incidents": 1,
            "road_type": "national_highway"
        }
    ],
    ("shillong", "guwahati"): [
        {
            "segment_id": "seg-1",
            "name": "Shillong to Umiam",
            "description": "Descent from Shillong plateau towards Umiam lake corridor",
            "start_node": "Shillong",
            "end_node": "Umiam",
            "start_coord": [91.8933, 25.5788],
            "end_coord": [91.9150, 25.6700],
            "default_slope": 7.5,
            "elevation_m": 1520.0,
            "road_quality": 3.9,
            "historical_incidents": 1,
            "road_type": "national_highway"
        },
        {
            "segment_id": "seg-2",
            "name": "Umiam to Nongpoh",
            "description": "Steep downhill ghat section with heavy vehicle brake stress zones",
            "start_node": "Umiam",
            "end_node": "Nongpoh",
            "start_coord": [91.9150, 25.6700],
            "end_coord": [91.8807, 25.9036],
            "default_slope": 17.5,
            "elevation_m": 1040.0,
            "road_quality": 3.4,
            "historical_incidents": 5,
            "road_type": "national_highway"
        },
        {
            "segment_id": "seg-3",
            "name": "Nongpoh to Guwahati",
            "description": "Lower foothills into Khanapara plain entrance",
            "start_node": "Nongpoh",
            "end_node": "Guwahati",
            "start_coord": [91.8807, 25.9036],
            "end_coord": [91.7362, 26.1445],
            "default_slope": 6.0,
            "elevation_m": 580.0,
            "road_quality": 4.1,
            "historical_incidents": 1,
            "road_type": "national_highway"
        }
    ]
}


class SegmentationService:
    """
    Modular service to segment routes, fetch segment weather, evaluate ML risk,
    and compute aggregate Route Risk Summaries.
    """

    def segment_and_evaluate_route(
        self,
        source_name: str,
        destination_name: str,
        full_coordinates: List[List[float]],
        total_distance_km: float,
        weather_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Decomposes the route into logical segments, evaluates weather and ML risk
        for each segment, and builds the overall Route Risk Summary.
        """
        key = (source_name.lower().strip(), destination_name.lower().strip())

        # Check if corridor has pre-indexed milestones (like Guwahati - Shillong)
        if key in KNOWN_CORRIDOR_SEGMENTS:
            segments = self._build_known_corridor_segments(
                key, full_coordinates, total_distance_km, weather_data
            )
        else:
            segments = self._build_generic_segments(
                source_name, destination_name, full_coordinates, total_distance_km, weather_data
            )

        # Build comprehensive route risk summary
        risk_summary = self._compute_route_risk_summary(segments)

        return {
            "segments": segments,
            "risk_summary": risk_summary
        }

    def _build_known_corridor_segments(
        self,
        key: Tuple[str, str],
        coordinates: List[List[float]],
        total_dist_km: float,
        weather_data: Optional[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Builds calibrated segments for known corridors, slicing full polyline into sub-polylines.
        """
        templates = KNOWN_CORRIDOR_SEGMENTS[key]
        n_segs = len(templates)
        coords_len = len(coordinates)

        segments = []
        for idx, tmpl in enumerate(templates):
            # Slice polyline coordinates for this segment
            start_i = int((idx / n_segs) * coords_len)
            end_i = int(((idx + 1) / n_segs) * coords_len)
            if idx == n_segs - 1:
                end_i = coords_len
            
            # Ensure at least 2 points in polyline
            seg_coords = coordinates[start_i:max(start_i + 2, end_i + 1)]
            if len(seg_coords) < 2:
                seg_coords = [tmpl["start_coord"], tmpl["end_coord"]]

            seg_dist = round(total_dist_km / n_segs, 1)

            # Midpoint for weather lookup
            mid_lat = (tmpl["start_coord"][1] + tmpl["end_coord"][1]) / 2.0
            mid_lon = (tmpl["start_coord"][0] + tmpl["end_coord"][0]) / 2.0

            # Get weather conditions for this segment
            seg_weather = self._get_segment_weather(mid_lat, mid_lon, weather_data, idx)

            # Segment 2 (Nongpoh to Umiam) has extreme ghat slope and higher incident frequency
            slope = tmpl["default_slope"]
            elevation = tmpl["elevation_m"]
            road_quality = tmpl["road_quality"]
            historical_incidents = tmpl["historical_incidents"]

            # Evaluate with trained ML Random Forest model
            ml_pred = risk_service.predict(
                rainfall=seg_weather["rainfall_mm"],
                slope=slope,
                road_quality=road_quality,
                visibility=seg_weather["visibility_km"],
                traffic=50.0,
                historical_incidents=historical_incidents,
                elevation=elevation,
                temperature=seg_weather["temperature_c"],
                wind_speed=seg_weather["wind_speed_kmh"],
                road_type=tmpl["road_type"]
            )

            risk_class = ml_pred["risk"]
            color = RISK_COLORS.get(risk_class, "#22c55e")

            segments.append({
                "segment_id": tmpl["segment_id"],
                "name": tmpl["name"],
                "description": tmpl["description"],
                "start_node": tmpl["start_node"],
                "end_node": tmpl["end_node"],
                "distance_km": seg_dist,
                "weather": seg_weather,
                "risk": risk_class,
                "confidence": ml_pred["confidence"],
                "risk_score": ml_pred["estimated_risk_score"],
                "color": color,
                "slope_degrees": slope,
                "elevation_m": elevation,
                "road_quality": road_quality,
                "historical_incidents": historical_incidents,
                "coordinates": seg_coords
            })

        return segments

    def _build_generic_segments(
        self,
        source_name: str,
        destination_name: str,
        coordinates: List[List[float]],
        total_dist_km: float,
        weather_data: Optional[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Dynamically divides any arbitrary route into 3 logical segments.
        """
        num_segments = 3
        coords_len = len(coordinates)
        seg_distance = round(total_dist_km / num_segments, 1)

        is_hilly = any(
            h in (source_name + destination_name).lower()
            for h in ["shillong", "kohima", "aizawl", "tawang", "gangtok", "tura", "jowai"]
        )

        segments = []
        for idx in range(num_segments):
            start_i = int((idx / num_segments) * coords_len)
            end_i = int(((idx + 1) / num_segments) * coords_len)
            if idx == num_segments - 1:
                end_i = coords_len

            seg_coords = coordinates[start_i:max(start_i + 2, end_i + 1)]
            if not seg_coords:
                seg_coords = coordinates

            mid_point = seg_coords[len(seg_coords) // 2]
            mid_lon, mid_lat = mid_point[0], mid_point[1]

            seg_weather = self._get_segment_weather(mid_lat, mid_lon, weather_data, idx)

            # Mid segment in hill terrain tends to have the highest incline
            if is_hilly:
                slope = 15.0 if idx == 1 else 7.5
                elevation = 1200.0 if idx == 1 else 600.0
                road_quality = 3.2 if idx == 1 else 3.8
                incidents = 4 if idx == 1 else 1
            else:
                slope = 3.0
                elevation = 120.0
                road_quality = 4.2
                incidents = 1

            ml_pred = risk_service.predict(
                rainfall=seg_weather["rainfall_mm"],
                slope=slope,
                road_quality=road_quality,
                visibility=seg_weather["visibility_km"],
                traffic=40.0,
                historical_incidents=incidents,
                elevation=elevation,
                temperature=seg_weather["temperature_c"],
                wind_speed=seg_weather["wind_speed_kmh"],
                road_type="national_highway"
            )

            risk_class = ml_pred["risk"]
            color = RISK_COLORS.get(risk_class, "#22c55e")

            seg_names = [
                f"Segment 1: {source_name} Departure Sector",
                f"Segment 2: Midway Mountain Corridor",
                f"Segment 3: {destination_name} Approach Sector"
            ]

            segments.append({
                "segment_id": f"seg-{idx + 1}",
                "name": seg_names[idx],
                "description": f"En-route sector {idx + 1} of {num_segments}",
                "start_node": source_name if idx == 0 else f"Waypoint {idx}",
                "end_node": destination_name if idx == num_segments - 1 else f"Waypoint {idx + 1}",
                "distance_km": seg_distance,
                "weather": seg_weather,
                "risk": risk_class,
                "confidence": ml_pred["confidence"],
                "risk_score": ml_pred["estimated_risk_score"],
                "color": color,
                "slope_degrees": slope,
                "elevation_m": elevation,
                "road_quality": road_quality,
                "historical_incidents": incidents,
                "coordinates": seg_coords
            })

        return segments

    def _get_segment_weather(
        self,
        lat: float,
        lon: float,
        weather_data: Optional[Dict[str, Any]],
        index: int
    ) -> Dict[str, Any]:
        """
        Extracts or samples localized atmospheric metrics for a segment.
        """
        # If corridor checkpoints already fetched by weather_service, map to them
        if weather_data and "checkpoints" in weather_data:
            cps = weather_data["checkpoints"]
            if index < len(cps):
                cp = cps[index]
                return {
                    "temperature_c": float(cp.get("temperature_c", 23.0)),
                    "rainfall_mm": float(cp.get("precipitation_mm", 0.0)),
                    "wind_speed_kmh": float(cp.get("wind_speed_kmh", 10.0)),
                    "visibility_km": float(cp.get("visibility_km", 8.0)),
                    "condition": cp.get("condition", "Clear"),
                    "checkpoint_name": cp.get("name", f"Checkpoint {index + 1}")
                }

        # Fallback realistic atmospheric profile
        return {
            "temperature_c": 22.5,
            "rainfall_mm": 0.2,
            "wind_speed_kmh": 12.0,
            "visibility_km": 7.5,
            "condition": "Partly cloudy",
            "checkpoint_name": f"Coordinate ({lat:.2f}, {lon:.2f})"
        }

    def _compute_route_risk_summary(self, segments: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Computes the aggregate Route Risk Summary as specified:
          - Overall risk (LOW, MEDIUM, HIGH)
          - Highest-risk segment (name and score)
          - Number of high-risk segments
          - Average risk score
        """
        if not segments:
            return {
                "overall_risk": "LOW",
                "highest_risk_segment": None,
                "high_risk_segments_count": 0,
                "average_risk_score": 0.0
            }

        scores = [seg["risk_score"] for seg in segments]
        avg_score = float(round(sum(scores) / len(scores), 1))

        # Count high risk segments
        high_risk_segs = [s for s in segments if s["risk"] == "HIGH"]
        high_risk_count = len(high_risk_segs)

        # Find highest risk segment
        highest_seg = max(segments, key=lambda s: s["risk_score"])
        highest_risk_info = {
            "segment_id": highest_seg["segment_id"],
            "name": highest_seg["name"],
            "risk": highest_seg["risk"],
            "risk_score": highest_seg["risk_score"],
            "color": highest_seg["color"],
            "reason": f"Elevated slope ({highest_seg.get('slope_degrees')}°) and localized precipitation ({highest_seg['weather']['rainfall_mm']} mm)"
        }

        # Overall risk calculation
        # If any segment is HIGH, the corridor carries elevated risk
        if high_risk_count >= 1 or avg_score >= 60.0:
            overall_risk = "HIGH"
        elif any(s["risk"] == "MEDIUM" for s in segments) or avg_score >= 35.0:
            overall_risk = "MEDIUM"
        else:
            overall_risk = "LOW"

        return {
            "overall_risk": overall_risk,
            "highest_risk_segment": highest_risk_info,
            "high_risk_segments_count": high_risk_count,
            "average_risk_score": avg_score,
            "overall_color": RISK_COLORS.get(overall_risk, "#22c55e"),
            "total_segments_evaluated": len(segments)
        }


# Singleton instance
segmentation_service = SegmentationService()
