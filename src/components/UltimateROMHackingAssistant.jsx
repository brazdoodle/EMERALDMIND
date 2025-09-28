// === ULTIMATE ROM HACKING ASSISTANT INTEGRATION ===
// Comprehensive showcase of the complete expert system

import { useCallback, useMemo, useState } from "react";
import { autoCorrectHMAScript } from "../lib/hmaScriptValidator.js";
import { getTutorialSystem } from "../lib/romHackingTutorials.js";
import { analyzeHMAScript } from "../lib/scriptAnalyzer.js";
import { useLabAssistant } from "./LabAssistantService.jsx";

export default function UltimateROMHackingAssistant() {
  const [currentScript, setCurrentScript] = useState("");
  const [analysisResults, setAnalysisResults] = useState(null);
  const [expertResponse, setExpertResponse] = useState("");
  const [currentTutorial, setCurrentTutorial] = useState(null);
  const [showValidation, setShowValidation] = useState(false);
  const [autoCorrection, setAutoCorrection] = useState(null);

  const { quickQuery, isLoading } = useLabAssistant();
  const tutorialSystem = useMemo(() => getTutorialSystem(), []);

  // Comprehensive script analysis
  const analyzeCurrentScript = useCallback(async () => {
    if (!currentScript.trim()) return;

    try {
      // Run comprehensive analysis
      const analysis = analyzeHMAScript(currentScript);
      setAnalysisResults(analysis);

      // Generate auto-correction if needed
      if (analysis.errors?.length > 0) {
        const correction = autoCorrectHMAScript(currentScript);
        setAutoCorrection(correction);
      } else {
        setAutoCorrection(null);
      }

      // Get expert AI feedback on the script
      const expertQuery = `Analyze this HMA script and provide expert feedback:

${currentScript}

Please provide specific suggestions for improvement, flag any issues, and explain ROM hacking best practices that apply.`;

      const response = await quickQuery(expertQuery);
      setExpertResponse(response);
    } catch (error) {
      console.error("Analysis failed:", error);
      setAnalysisResults({ error: error.message });
    }
  }, [currentScript, quickQuery]);

  // Apply auto-correction
  const applyAutoCorrection = useCallback(() => {
    if (autoCorrection?.corrected) {
      setCurrentScript(autoCorrection.corrected);
      setAutoCorrection(null);
      // Re-analyze with corrected script
      setTimeout(analyzeCurrentScript, 100);
    }
  }, [autoCorrection, analyzeCurrentScript]);

  // Tutorial helpers
  const loadTutorial = useCallback(
    (tutorialId) => {
      const tutorial = tutorialSystem.getTutorial(tutorialId);
      setCurrentTutorial(tutorial);

      // Load first step's example code if available
      if (tutorial?.steps?.[0]?.code) {
        setCurrentScript(tutorial.steps[0].code);
      }
    },
    [tutorialSystem]
  );

  // Expert query with context
  const askExpertQuestion = useCallback(
    async (question) => {
      const contextualQuery = currentScript
        ? `Context - Current script:\n\n${currentScript}\n\nQuestion: ${question}`
        : question;

      try {
        const response = await quickQuery(contextualQuery);
        setExpertResponse(response);
      } catch (error) {
        setExpertResponse(`Error: ${error.message}`);
      }
    },
    [currentScript, quickQuery]
  );

  // Sample scripts for demonstration
  const sampleScripts = {
    basicNPC: `#dynamic 0x800000

#org @main
lock
faceplayer
msgbox.default @greeting
release
end

#org @greeting
= Hello! I'm a basic NPC script.`,

    conditionalDialogue: `#dynamic 0x800000

#org @main
lock
faceplayer
checkflag 0x820
if.flag.set.goto @repeat_visit
msgbox.default @first_time
setflag 0x820
goto @end

#org @repeat_visit
msgbox.default @greeting_again

#org @end
release
end

#org @first_time
= Nice to meet you! This is our first conversation.

#org @greeting_again
= Good to see you again!`,

    itemGiving: `#dynamic 0x800000

#org @main
lock
faceplayer
checkflag 0x825
if.flag.set.goto @already_gave
checkitemspace ITEM_POTION 1
compare LASTRESULT 0x1
if.ne.goto @bag_full
giveitem ITEM_POTION 1
setflag 0x825
msgbox.default @gave_item
goto @end

#org @already_gave
msgbox.default @no_more_items

#org @bag_full
msgbox.default @inventory_full

#org @end
release
end

#org @gave_item
= Here's a Potion for your journey!

#org @no_more_items
= I already gave you my gift!

#org @inventory_full
= Your bag is full! Come back later.`,
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-emerald-700 mb-2">
          🔮 Ultimate ROM Hacking Assistant
        </h1>
        <p className="text-gray-600">
          Professional-grade HMA scripting with AI-powered analysis, validation,
          and expert guidance
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button
          onClick={() => loadTutorial("first-npc")}
          className="p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-left transition-colors"
        >
          <div className="font-semibold text-blue-700">📚 Start Tutorial</div>
          <div className="text-sm text-blue-600">Learn ROM hacking basics</div>
        </button>

        <button
          onClick={() => setCurrentScript(sampleScripts.basicNPC)}
          className="p-4 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg text-left transition-colors"
        >
          <div className="font-semibold text-green-700">⚡ Load Sample</div>
          <div className="text-sm text-green-600">Basic NPC script</div>
        </button>

        <button
          onClick={analyzeCurrentScript}
          disabled={!currentScript.trim() || isLoading}
          className="p-4 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg text-left transition-colors disabled:opacity-50"
        >
          <div className="font-semibold text-purple-700">Analyze Script</div>
          <div className="text-sm text-purple-600">Get expert feedback</div>
        </button>
      </div>

      {/* Script Editor */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-700">Script Editor</h2>
            <div className="flex gap-2">
              <select
                onChange={(e) =>
                  setCurrentScript(sampleScripts[e.target.value])
                }
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="">Load Sample...</option>
                <option value="basicNPC">Basic NPC</option>
                <option value="conditionalDialogue">
                  Conditional Dialogue
                </option>
                <option value="itemGiving">Item Giving NPC</option>
              </select>

              {autoCorrection?.changesMade && (
                <button
                  onClick={applyAutoCorrection}
                  className="text-sm bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded"
                >
                  Apply Fixes ({autoCorrection.corrections.length})
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="p-4">
          <textarea
            value={currentScript}
            onChange={(e) => setCurrentScript(e.target.value)}
            placeholder="Enter your HMA script here..."
            className="w-full h-64 font-mono text-sm border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Analysis Results */}
      {analysisResults && (
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="border-b border-gray-200 p-4">
            <h2 className="font-semibold text-gray-700">
              Script Analysis Results
            </h2>
          </div>

          <div className="p-4 space-y-4">
            {/* Quality Score */}
            <div className="flex items-center gap-4">
              <div className="text-sm font-medium text-gray-600">
                Quality Score:
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  analysisResults.qualityScore >= 80
                    ? "bg-green-100 text-green-700"
                    : analysisResults.qualityScore >= 60
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {analysisResults.qualityScore}/100
              </div>
            </div>

            {/* Validation Status */}
            <div className="flex items-center gap-4">
              <div className="text-sm font-medium text-gray-600">
                Validation:
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  analysisResults.validation?.advanced?.isValid
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {analysisResults.validation?.advanced?.isValid
                  ? "Valid"
                  : "Has Issues"}
              </div>
            </div>

            {/* Command Usage */}
            {analysisResults.analysis?.commandUsage &&
              Object.keys(analysisResults.analysis.commandUsage).length > 0 && (
                <div>
                  <div className="text-sm font-medium text-gray-600 mb-2">
                    Commands Used:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(analysisResults.analysis.commandUsage).map(
                      ([cmd, count]) => (
                        <span
                          key={cmd}
                          className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                        >
                          {cmd} ({count})
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* Errors */}
            {analysisResults.errors?.length > 0 && (
              <div>
                <div className="text-sm font-medium text-red-600 mb-2">
                  Errors:
                </div>
                <ul className="space-y-1">
                  {analysisResults.errors.map((error, index) => (
                    <li
                      key={index}
                      className="text-sm text-red-600 bg-red-50 p-2 rounded"
                    >
                      Line {error.line}: {error.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warnings */}
            {analysisResults.warnings?.length > 0 && (
              <div>
                <div className="text-sm font-medium text-yellow-600 mb-2">
                  Warnings:
                </div>
                <ul className="space-y-1">
                  {analysisResults.warnings.map((warning, index) => (
                    <li
                      key={index}
                      className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded"
                    >
                      Line {warning.line}: {warning.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggestions */}
            {analysisResults.suggestions?.length > 0 && (
              <div>
                <div className="text-sm font-medium text-blue-600 mb-2">
                  Suggestions:
                </div>
                {analysisResults.suggestions.map((suggestion, index) => (
                  <div key={index} className="bg-blue-50 p-3 rounded mb-2">
                    <div className="font-medium text-blue-700">
                      {suggestion.title}
                    </div>
                    {suggestion.items && (
                      <ul className="mt-1 space-y-1">
                        {suggestion.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="text-sm text-blue-600">
                            •{" "}
                            {typeof item === "string"
                              ? item
                              : item.title || item.description}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Expert Response */}
      {expertResponse && (
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="border-b border-gray-200 p-4">
            <h2 className="font-semibold text-gray-700">
              🧠 Expert AI Analysis
            </h2>
          </div>

          <div className="p-4">
            <div className="prose prose-sm max-w-none">
              {expertResponse.split("\n").map((line, index) => (
                <p key={index} className="mb-2">
                  {line}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Expert Questions */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="border-b border-gray-200 p-4">
          <h2 className="font-semibold text-gray-700">💬 Ask the Expert</h2>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={() =>
                askExpertQuestion(
                  "How can I improve this script's performance?"
                )
              }
              className="p-3 text-left bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded transition-colors"
              disabled={isLoading}
            >
              <div className="font-medium text-gray-700">Performance Tips</div>
              <div className="text-sm text-gray-500">
                Optimize script efficiency
              </div>
            </button>

            <button
              onClick={() =>
                askExpertQuestion(
                  "What ROM hacking best practices should I follow?"
                )
              }
              className="p-3 text-left bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded transition-colors"
              disabled={isLoading}
            >
              <div className="font-medium text-gray-700">Best Practices</div>
              <div className="text-sm text-gray-500">
                Professional guidelines
              </div>
            </button>

            <button
              onClick={() =>
                askExpertQuestion(
                  "How do I handle flags and variables properly?"
                )
              }
              className="p-3 text-left bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded transition-colors"
              disabled={isLoading}
            >
              <div className="font-medium text-gray-700">Flag Management</div>
              <div className="text-sm text-gray-500">State handling tips</div>
            </button>

            <button
              onClick={() =>
                askExpertQuestion(
                  "What are common scripting mistakes to avoid?"
                )
              }
              className="p-3 text-left bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded transition-colors"
              disabled={isLoading}
            >
              <div className="font-medium text-gray-700">Common Mistakes</div>
              <div className="text-sm text-gray-500">Avoid pitfalls</div>
            </button>
          </div>
        </div>
      </div>

      {/* Current Tutorial Display */}
      {currentTutorial && (
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="border-b border-gray-200 p-4">
            <h2 className="font-semibold text-gray-700">
              📖 {currentTutorial.title}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {currentTutorial.description}
            </p>
          </div>

          <div className="p-4">
            <div className="flex items-center gap-4 mb-4">
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  currentTutorial.difficulty === "beginner"
                    ? "bg-green-100 text-green-700"
                    : currentTutorial.difficulty === "intermediate"
                    ? "bg-yellow-100 text-yellow-700"
                    : currentTutorial.difficulty === "advanced"
                    ? "bg-orange-100 text-orange-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {currentTutorial.difficulty.toUpperCase()}
              </span>
              <span className="text-sm text-gray-500">
                ⏱ {currentTutorial.duration}
              </span>
            </div>

            {currentTutorial.steps && (
              <div className="space-y-4">
                {currentTutorial.steps.map((step, index) => (
                  <div
                    key={step.id}
                    className="border border-gray-200 rounded p-4"
                  >
                    <div className="font-medium text-gray-700 mb-2">
                      Step {step.id}: {step.title}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {step.instruction}
                    </p>
                    {step.code && (
                      <div className="bg-gray-50 p-3 rounded">
                        <pre className="text-xs font-mono text-gray-700 overflow-x-auto">
                          {step.code}
                        </pre>
                      </div>
                    )}
                    {step.explanation && (
                      <p className="text-sm text-blue-600 mt-2">
                        {step.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status Indicator */}
      {isLoading && (
        <div className="fixed bottom-4 right-4 bg-emerald-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
            Expert AI is analyzing...
          </div>
        </div>
      )}
    </div>
  );
}
