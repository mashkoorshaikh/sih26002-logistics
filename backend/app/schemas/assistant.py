from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field, root_validator


class ChatMessage(BaseModel):
    role: str = Field(..., description="user or assistant")
    content: str = Field(..., description="Message text")


class AssistantRequest(BaseModel):
    message: Optional[str] = Field(None, max_length=2000, description="User question (max 2000 characters)")
    query: Optional[str] = Field(None, max_length=2000, description="User question alias (max 2000 characters)")
    source: Optional[Any] = Field("Guwahati", description="Origin city (str or dict)")
    origin: Optional[Any] = Field(None, description="Origin city alias")
    destination: Optional[Any] = Field("Shillong", description="Destination city (str or dict)")
    vehicle_type: Optional[str] = Field("Truck", description="Vehicle type")
    vehicle_weight: Optional[float] = Field(None, description="Vehicle gross weight in kg")
    cargo_type: Optional[str] = Field("Medicine", description="Cargo type")
    fuel_price: Optional[float] = Field(None, ge=10.0, le=500.0, description="Custom fuel price override in INR")
    corridor: Optional[Dict[str, Any]] = Field(None, description="Corridor object alias")
    route_data: Optional[Dict[str, Any]] = Field(None, description="Pre-calculated route payload")
    chat_history: Optional[List[ChatMessage]] = Field(default=[], description="Previous conversation turns")

    @root_validator(pre=True)
    def normalize_aliases(cls, values):
        if not isinstance(values, dict):
            return values
        # Handle query / message
        msg = values.get("message") or values.get("query")
        if msg:
            values["message"] = str(msg)
            values["query"] = str(msg)
        else:
            values["message"] = "Why was this route selected?"
        
        # Handle nested corridor
        corridor = values.get("corridor")
        if isinstance(corridor, dict):
            if not values.get("source") and not values.get("origin"):
                values["source"] = corridor.get("source") or corridor.get("origin")
            if not values.get("destination"):
                values["destination"] = corridor.get("destination")
            if not values.get("vehicle_type"):
                values["vehicle_type"] = corridor.get("vehicle_type")
            if not values.get("cargo_type"):
                values["cargo_type"] = corridor.get("cargo_type")

        # Handle origin / source - could be {"name": "Guwahati", ...} or "Guwahati"
        raw_src = values.get("source") or values.get("origin")
        if isinstance(raw_src, dict):
            src_str = raw_src.get("name") or raw_src.get("city") or raw_src.get("display_name") or "Guwahati"
        elif raw_src:
            src_str = str(raw_src)
        else:
            src_str = "Guwahati"
        values["source"] = src_str
        values["origin"] = src_str

        # Handle destination - could be {"name": "Shillong", ...} or "Shillong"
        raw_dst = values.get("destination")
        if isinstance(raw_dst, dict):
            dst_str = raw_dst.get("name") or raw_dst.get("city") or raw_dst.get("display_name") or "Shillong"
        elif raw_dst:
            dst_str = str(raw_dst)
        else:
            dst_str = "Shillong"
        values["destination"] = dst_str

        return values


class AssistantResponse(BaseModel):
    reply: str
    model_used: str
    is_fallback: bool = False
    corridor: str
    ground_truth_summary: Dict[str, Any]
    tools_called: Optional[List[Dict[str, Any]]] = None
    fallback_reason: Optional[str] = None
