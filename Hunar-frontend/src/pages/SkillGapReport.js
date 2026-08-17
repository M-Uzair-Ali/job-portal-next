import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function SkillGapReport() {
  const location = useLocation();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const { analysisResult, jobTitle, suggestedResources } = location.state || {};

  const extractSkillValue = useCallback((item) => {
    if (typeof item === "string") return item;
    if (typeof item === "number") return String(item);
    if (!item || typeof item !== "object") return "";

    return (
      item.name ??
      item.skill ??
      item.skill_name ??
      item.skillName ??
      item.title ??
      item.label ??
      item.value ??
      item.text ??
      item?.skill?.name ??
      item?.skill?.skill_name ??
      Object.values(item).find((value) => typeof value === "string") ??
      ""
    );
  }, []);

  const normalizeArray = useCallback(
    (array) => {
      if (!Array.isArray(array)) return [];
      return array
        .map(extractSkillValue)
        .filter((value) => value && value !== "undefined");
    },
    [extractSkillValue]
  );

  const firstNonEmpty = useCallback((...arrays) => {
  for (const arr of arrays) {
    if (Array.isArray(arr) && arr.length > 0) return arr;
  }
  return [];
}, []);

  const getSkillList = useCallback(
  (source) => {
    const raw =
      source?.analysisResult ??
      source?.analysis_result ??
      source?.data ??
      source;

    const matchedSkills = firstNonEmpty(
      normalizeArray(raw?.matched_skills),
      normalizeArray(raw?.matchedSkills),
      normalizeArray(raw?.matched),
      normalizeArray(raw?.matched_skill_names),
      normalizeArray(raw?.matchedSkillNames),
      normalizeArray(raw?.matchedSkill)
    );

    const missingSkills = firstNonEmpty(
      normalizeArray(raw?.missing_skills),
      normalizeArray(raw?.missingSkills),
      normalizeArray(raw?.unmatched_skills),
      normalizeArray(raw?.unmatchedSkills),
      normalizeArray(raw?.skills_to_develop),
      normalizeArray(raw?.skillsToDevelop),
      normalizeArray(raw?.missing),
      normalizeArray(raw?.gaps)
    );

    return {
      matchPercentage:
        raw?.match_percentage ?? raw?.matchPercentage ?? null,
      totalSkills:
        raw?.total_skills ?? raw?.totalSkills ?? matchedSkills.length + missingSkills.length,
      matchedSkills,
      missingSkills,
    };
  },
  [normalizeArray, firstNonEmpty]
);

  useEffect(() => {
    if (!analysisResult) {
      navigate("/skill-gap");
      return;
    }

    const formattedReport = getSkillList(analysisResult);
    formattedReport.matchedCount = formattedReport.matchedSkills.length;

    setReport(formattedReport);
    setLoading(false);
  }, [analysisResult, getSkillList, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-stone">Loading report...</p>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  return (
    <div className="min-h-screen bg-cream px-6 py-8 md:px-12">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate(-1)} className="text-sm text-stone mb-4">
          ← Back
        </button>
        <h1 className="text-3xl font-bold text-ink mb-2">Skill Gap Report</h1>
        <p className="text-sm text-stone mb-8">{jobTitle}</p>

        <div className="bg-white border border-sand rounded-md p-8 mb-8">
          <p className="text-sm text-stone mb-2">Overall Match Score</p>
          <p className="text-4xl font-bold text-gold mb-2">{report.matchPercentage}%</p>
          <p className="text-sm text-ink">
            {report.matchedCount} of {report.totalSkills} skills matched
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold text-ink mb-4">Matched Skills</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {report.matchedSkills && report.matchedSkills.length > 0 ? (
              report.matchedSkills.map((skill, i) => (
                <div key={i} className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="font-medium text-ink">✓ {skill}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-stone">No matched skills data</p>
            )}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold text-ink mb-4">Skills to Develop</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {report.missingSkills && report.missingSkills.length > 0 ? (
              report.missingSkills.map((skill, i) => (
                <div key={i} className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="font-medium text-ink">⚠ {skill}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-stone">No missing skills data</p>
            )}
          </div>
        </div>

        {suggestedResources?.length > 0 && (
          <div className="mb-8">
          <h2 className="text-xl font-bold text-ink mb-4">Suggested Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {suggestedResources.map((res, i) => (
               <a 
                key={i}
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white border border-sand rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <p className="text-xs text-gold font-medium mb-1 uppercase tracking-wide">
                  {res.skill}
                </p>
                <p className="font-medium text-ink">{res.resource_title}</p>
                <p className="text-xs text-stone mt-1">{res.provider}</p>
                <p className="text-xs text-stone mt-2">{res.reason}</p>
              </a>
            ))}
          </div>
        </div>
        )}

        <div className="flex gap-3">
          <button onClick={() => navigate("/jobs")} className="flex-1 bg-gold hover:bg-purple2 text-white font-medium py-3 rounded-lg">
            Find More Jobs
          </button>
        </div>
      </div>
    </div>
  );
}