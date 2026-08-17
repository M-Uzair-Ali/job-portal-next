import spacy
from spacy.matcher import PhraseMatcher
import logging
import re

from skills import TECH_SKILLS

nlp = spacy.load("en_core_web_sm")

matcher = PhraseMatcher(nlp.vocab, attr="LOWER")

patterns = [nlp.make_doc(skill) for skill in TECH_SKILLS]

matcher.add("TECH_SKILLS", patterns)


def extract_skills(text: str) -> list[str]:
    """
    Extract technical skills from resume or job description.
    Uses spacy PhraseMatcher to find skill mentions in text.
    Falls back to simple keyword matching if no results.
    """

    if not text or not isinstance(text, str):
        logging.warning(f"Invalid text input for skill extraction: {type(text)}")
        return []

    doc = nlp(text.lower())

    matches = matcher(doc)

    skills = set()

    for _, start, end in matches:
        skill_text = doc[start:end].text
        skills.add(skill_text)

    # Fallback: if no skills found via spacy matcher, try simple keyword matching
    if len(skills) == 0:
        logging.warning("No skills found via spacy matcher, trying simple keyword matching...")
        skills = simple_keyword_match(text.lower())

    # Log for debugging purposes
    if len(skills) > 0:
        logging.info(f"Extracted {len(skills)} skills: {sorted(skills)}")
    else:
        logging.warning(f"No skills extracted from text (length={len(text)})")

    return sorted(skills)


def simple_keyword_match(text: str) -> set:
    """
    Simple fallback keyword matching for skills when spacy matcher fails.
    """
    found_skills = set()
    text_lower = text.lower()

    for skill in TECH_SKILLS:
        skill_lower = skill.lower()
        # Use word boundary matching to avoid partial matches
        pattern = r'\b' + re.escape(skill_lower) + r'\b'
        if re.search(pattern, text_lower):
            found_skills.add(skill_lower)

    return found_skills
