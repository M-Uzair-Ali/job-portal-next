import re
from sentence_transformers import util
from matcher import model


def split_into_sentences(text):
    """
    Split job description text into clean candidate sentences.
    Lines are joined within paragraphs so wrapped sentences aren't
    cut apart mid-thought — but if a joined block runs too long
    before hitting terminal punctuation (a sign the source is a
    bullet/keyword list, not prose), it's split back into individual
    lines instead, so bullet lists don't collapse into one giant run-on.
    """
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    paragraphs = re.split(r"\n\s*\n", text)

    sentences = []
    for para in paragraphs:
        lines = [line.strip() for line in para.splitlines() if line.strip()]
        lines = [line for line in lines if not NUMBERED_HEADING_PATTERN.match(line)]
        if not lines:
            continue

        joined = re.sub(r"^[•\-\*]\s*", "", " ".join(lines)).strip()
        joined = re.sub(r"\s+", " ", joined)

        # Longest run of characters before the next terminal punctuation
        longest_run = max(
            (len(chunk) for chunk in re.split(r"[.!?]", joined)), default=0
        )

        if longest_run > 200:
            # Likely a bullet/keyword list with no real sentence
            # punctuation — process line by line instead of joining.
            candidates = lines
        else:
            candidates = re.split(r"(?<=[.!?])\s+", joined)

        for s in candidates:
            s = re.sub(r"^[•\-\*]\s*", "", s).strip()
            if len(s) < 25:
                continue
            if BOILERPLATE_PATTERN.search(s):
                continue
            if CONTACT_PATTERN.search(s):
                continue
            sentences.append(s)

    return sentences

BOILERPLATE_PATTERN = re.compile(
    r"\b(equal employment opportunity|sexual exploitation|sexual abuse|"
    r"PSEA|safeguarding|non-discrimination|regardless of sex|"
    r"regardless of race|diversity|inclusive organization|"
    r"protected by law|discrimination based on)\b",
    re.IGNORECASE,
)

CONTACT_PATTERN = re.compile(
    r"(\battn:|\btel:|\bfax:|\bphone:|\boffice:\s*\+?\d|\+92|"
    r"\bhouse no\b|\bmain service road\b|@[\w.-]+\.\w+)",
    re.IGNORECASE,
)

NUMBERED_HEADING_PATTERN = re.compile(r"^\d+[.\)]\s*[A-Z][\w&,\s]{0,50}$")

QUALIFICATION_PATTERN = re.compile(
    r"\b(years?|degree|bachelor|master|llb|b\.?sc|m\.?sc|diploma|"
    r"certification|qualification|enrolled|enrollment)\b",
    re.IGNORECASE,
)


def find_qualification_sentence(sentences, relevance_scores):
    """
    Find the strongest candidate sentence describing required
    education/experience (e.g. degree, years of experience), so the
    summary always surfaces this even if pure relevance/diversity
    scoring would otherwise skip it in favor of longer, more
    elaborate sentences elsewhere in the description.
    """
    candidates = [
        (i, s) for i, s in enumerate(sentences) if QUALIFICATION_PATTERN.search(s)
    ]

    if not candidates:
        return None

    # Among matches, prefer the one closest to overall document relevance
    best_idx = max(candidates, key=lambda pair: relevance_scores[pair[0]].item())[0]
    return best_idx


def extract_key_points(job_description, num_points=5, diversity=0.6):
    """
    Extractive summarization using Maximal Marginal Relevance (MMR):
    picks sentences that are relevant to the overall content AND
    diverse from each other, so the summary doesn't cluster around
    one over-represented section of the description.

    A qualifications/experience sentence (degree, years required, etc.)
    is guaranteed a slot when one exists, since that's usually the
    first thing a candidate wants to see and MMR alone can miss it.

    diversity: 0.0 = pure relevance (old centroid behavior),
               1.0 = pure diversity. 0.6 favors spreading across topics.
    """
    sentences = split_into_sentences(job_description)

    if not sentences:
        return []

    if len(sentences) <= num_points:
        return sentences

    embeddings = model.encode(sentences, convert_to_tensor=True)
    centroid = embeddings.mean(dim=0)

    relevance_scores = util.cos_sim(embeddings, centroid).squeeze(1)

    selected = []
    remaining = list(range(len(sentences)))

    # Reserve one slot for a qualifications sentence, if one exists
    qual_idx = find_qualification_sentence(sentences, relevance_scores)
    if qual_idx is not None:
        selected.append(qual_idx)
        remaining.remove(qual_idx)
    else:
        # No qualifications sentence found — fall back to pure relevance
        first = int(relevance_scores.argmax())
        selected.append(first)
        remaining.remove(first)

    while len(selected) < num_points and remaining:
        mmr_scores = []
        for idx in remaining:
            relevance = relevance_scores[idx].item()
            similarity_to_selected = max(
                util.cos_sim(embeddings[idx], embeddings[s]).item()
                for s in selected
            )
            mmr = (1 - diversity) * relevance - diversity * similarity_to_selected
            mmr_scores.append((mmr, idx))

        mmr_scores.sort(reverse=True)
        best_idx = mmr_scores[0][1]
        selected.append(best_idx)
        remaining.remove(best_idx)

    selected.sort()  # preserve original document order for readability
    return [sentences[i] for i in selected]