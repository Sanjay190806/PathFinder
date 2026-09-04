"""
Education Taxonomy Catalog API
Exposes the authoritative India-specific education taxonomy and alias search.
"""

from fastapi import APIRouter, Query
from typing import List, Dict, Any

from backend.app.core.education_catalog import (
    get_education_catalog,
    search_education_taxonomy,
    get_education_levels,
    get_streams_for_level,
    get_specializations_for_stream,
    get_education_boards,
    get_institution_types,
    get_study_years,
    EducationLevelOption
)
from fastapi import HTTPException, status

router = APIRouter(prefix="/education", tags=["Education Taxonomy"])

@router.get("/catalog", response_model=Dict[str, Any])
def get_catalog():
    """
    Returns the comprehensive, normalized India Education Catalog.
    Includes Education Levels, Streams, Specializations, and Qualifications.
    """
    catalog = get_education_catalog()
    return {
        "country": "India",
        "taxonomy_version": "JanSahay-SIH26101-Normalized-v2.0",
        "education_levels": [level.model_dump() for level in catalog]
    }

@router.get("/levels", response_model=List[Dict[str, Any]])
def get_levels():
    """Returns top-level metadata for all 10 normalized education levels."""
    return get_education_levels()

@router.get("/streams/{level_id}")
def get_streams(level_id: str):
    """Returns streams available for a given education level ID."""
    streams = get_streams_for_level(level_id)
    if streams is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Education level '{level_id}' not found in catalog."
        )
    return [s.model_dump() for s in streams]

@router.get("/specializations/{stream_id}")
def get_specializations(stream_id: str):
    """Returns specializations available under a given stream ID."""
    specs = get_specializations_for_stream(stream_id)
    if specs is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Stream '{stream_id}' not found in catalog."
        )
    return [sp.model_dump() for sp in specs]

@router.get("/boards", response_model=List[Dict[str, str]])
def get_boards():
    """Returns supported Indian school / university examination boards."""
    return get_education_boards()

@router.get("/institution-types", response_model=List[Dict[str, str]])
def get_institution_types_endpoint():
    """Returns recognized types of academic and technical institutions."""
    return get_institution_types()

@router.get("/study-years", response_model=List[Dict[str, str]])
def get_study_years_endpoint():
    """Returns standard academic progression year options."""
    return get_study_years()

@router.get("/search", response_model=List[Dict[str, Any]])
def search_taxonomy(q: str = Query(..., min_length=1, description="Search query or alias e.g. 'CSE', 'ECE', 'PCM', 'BCA'")):
    """
    Searches across levels, streams, specializations, qualifications, and aliases.
    """
    return search_education_taxonomy(q)
