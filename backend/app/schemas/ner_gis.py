from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class GeoJSONGeometry(BaseModel):
    type: str = Field(..., example="LineString")
    coordinates: List[Any] = Field(..., description="Coordinates array in [longitude, latitude] format")


class GeoJSONFeature(BaseModel):
    type: str = "Feature"
    geometry: GeoJSONGeometry
    properties: Dict[str, Any] = Field(default_factory=dict)


class GeoJSONFeatureCollection(BaseModel):
    type: str = "FeatureCollection"
    features: List[GeoJSONFeature] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(
        default_factory=lambda: {
            "region": "North Eastern Region (NER), India",
            "states_supported": [
                "Assam", "Arunachal Pradesh", "Manipur", "Meghalaya",
                "Mizoram", "Nagaland", "Tripura", "Sikkim"
            ],
            "dataset_classification": "SIMULATED_DEMO_BENCHMARK",
            "disclaimer": "Sample/demo logistics model calibrated for SIH26002 prototype evaluation. No official government endorsement implied.",
            "extensible_gis_ready": True,
            "crs": "EPSG:4326"
        }
    )


class NERChallenge(BaseModel):
    id: str
    title: str
    category: str
    icon: str
    severity_level: str
    description: str
    impact_on_logistics: str
    mitigation_strategy: str
    sample_affected_areas: List[str]
