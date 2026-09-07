import logging
from typing import Dict, Any
from fastapi import APIRouter, HTTPException
from app.schemas.assistant import AssistantRequest, AssistantResponse
from services.ai_service import ai_service
from services.map_service import map_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "",
    response_model=AssistantResponse,
    summary="Ask AI Logistics Operations Assistant",
    description="Calculates or consumes backend route intelligence (Maps, Weather, ML Risk, Cost, Vehicle Feasibility, OR-Tools Optimization, Accessibility) and generates an OpenAI-powered response strictly grounded in verified facts."
)
async def ask_assistant(request: AssistantRequest):
    try:
        route_data = request.route_data

        # If frontend didn't supply pre-calculated route, calculate it now through full backend pipeline
        if not route_data or not route_data.get("summary"):
            src = request.source or "Guwahati"
            dst = request.destination or "Shillong"
            v_type = request.vehicle_type or "Truck"
            c_type = request.cargo_type or "Medicine"

            logger.info(f"AI Assistant calculating route corridor: {src} -> {dst} for {v_type} ({c_type})")
            route_data = await map_service.calculate_route(
                source=src,
                destination=dst,
                vehicle_type=v_type,
                cargo_type=c_type,
                fuel_price=request.fuel_price
            )

        # Convert chat history to dict format for OpenAI
        history_list = [
            {"role": m.role, "content": m.content}
            for m in (request.chat_history or [])
        ]

        # Call AI Assistant Service
        result = await ai_service.answer_logistics_query(
            query=request.message,
            route_data=route_data,
            chat_history=history_list
        )

        corridor_str = f"{route_data.get('source', {}).get('name', 'Origin')} to {route_data.get('destination', {}).get('name', 'Destination')}"

        return AssistantResponse(
            reply=result["reply"],
            model_used=result["model_used"],
            is_fallback=result.get("is_fallback", False),
            corridor=corridor_str,
            ground_truth_summary=result["ground_truth_summary"],
            tools_called=result.get("tools_called"),
            fallback_reason=result.get("fallback_reason")
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in /api/assistant: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Logistics Assistant encountered an error: {str(e)}"
        )


@router.get(
    "/health",
    summary="Check AI Assistant Configuration Status",
    description="Returns whether the OpenAI API key is configured and what model is active."
)
async def get_assistant_health():
    is_cfg = ai_service.is_configured()
    return {
        "configured": is_cfg,
        "model": ai_service.model,
        "mode": "live-openai" if is_cfg else "deterministic-grounding-fallback"
    }
