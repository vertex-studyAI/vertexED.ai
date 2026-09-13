from pathlib import Path

SOURCE = Path("src/pages/NotetakerQuiz.tsx")
TEST = Path("tests/notetaker-quiz-request-invalidation.test.mjs")

source = SOURCE.read_text()


def replace_once(old: str, new: str, label: str) -> None:
    global source
    count = source.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected exactly one match, found {count}")
    source = source.replace(old, new, 1)


replace_once(
    'import React, { useEffect, useMemo, useRef, useState } from "react";',
    'import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";',
    "react hook import",
)
replace_once(
    'import { saveStudyArtifact, consumeArtifactRestore } from "@/lib/userContent";',
    'import { deleteStudyArtifact, saveStudyArtifact, consumeArtifactRestore } from "@/lib/userContent";',
    "user content import",
)

replace_once(
    '  const recordingTimerRef = useRef<number | null>(null);\n',
    '''  const recordingTimerRef = useRef<number | null>(null);\n  const noteRequestIdRef = useRef(0);\n  const quizRequestIdRef = useRef(0);\n  const gradeRequestIdRef = useRef(0);\n  const currentAsyncAccountIdRef = useRef<string | null>(user?.id ?? null);\n  const loadingOwnerRef = useRef<{ kind: "note" | "quiz" | "grade"; id: number } | null>(null);\n  const previousNoteConfigKeyRef = useRef<string | null>(null);\n  const previousQuizConfigKeyRef = useRef<string | null>(null);\n  const previousGradeConfigKeyRef = useRef<string | null>(null);\n''',
    "request refs",
)

replace_once(
    '  const displayFormatLabel = format === "Custom" ? (customFormatText.trim() || "Custom") : format;\n\n',
    '''  const displayFormatLabel = format === "Custom" ? (customFormatText.trim() || "Custom") : format;\n\n  const curriculumKey = useMemo(() => JSON.stringify({\n    board: learner.curriculum.board,\n    subjects: learner.curriculum.subjects,\n  }), [learner.curriculum.board, learner.curriculum.subjects]);\n\n  const noteConfigKey = useMemo(() => JSON.stringify({\n    topic,\n    format,\n    customFormatText,\n    notesLength,\n    flashCount,\n    additionalInfo,\n    curriculumKey,\n  }), [topic, format, customFormatText, notesLength, flashCount, additionalInfo, curriculumKey]);\n\n  const quizConfigKey = useMemo(() => JSON.stringify({\n    notes,\n    quizType,\n    quizDifficulty,\n    frqLength,\n    gradingLeniency,\n    examStyle,\n    mcqOptionCount,\n    curriculumKey,\n  }), [notes, quizType, quizDifficulty, frqLength, gradingLeniency, examStyle, mcqOptionCount, curriculumKey]);\n\n  const gradeConfigKey = useMemo(() => JSON.stringify({\n    generatedQuestions,\n    userAnswers,\n    gradingLeniency,\n    examStyle,\n    curriculumKey,\n  }), [generatedQuestions, userAnswers, gradingLeniency, examStyle, curriculumKey]);\n\n  const invalidateNoteRequest = useCallback(() => {\n    noteRequestIdRef.current += 1;\n    if (loadingOwnerRef.current?.kind === "note") {\n      loadingOwnerRef.current = null;\n      setLoading(false);\n    }\n  }, []);\n\n  const invalidateQuizRequest = useCallback(() => {\n    quizRequestIdRef.current += 1;\n    if (loadingOwnerRef.current?.kind === "quiz") {\n      loadingOwnerRef.current = null;\n      setLoading(false);\n    }\n  }, []);\n\n  const invalidateGradeRequest = useCallback(() => {\n    gradeRequestIdRef.current += 1;\n    if (loadingOwnerRef.current?.kind === "grade") {\n      loadingOwnerRef.current = null;\n      setLoading(false);\n    }\n  }, []);\n\n  const releaseLoadingOwner = useCallback((kind: "note" | "quiz" | "grade", requestId: number) => {\n    if (loadingOwnerRef.current?.kind === kind && loadingOwnerRef.current.id === requestId) {\n      loadingOwnerRef.current = null;\n      setLoading(false);\n    }\n  }, []);\n\n  useLayoutEffect(() => {\n    const nextAccountId = user?.id ?? null;\n    if (currentAsyncAccountIdRef.current === nextAccountId) return;\n    currentAsyncAccountIdRef.current = nextAccountId;\n    invalidateNoteRequest();\n    invalidateQuizRequest();\n    invalidateGradeRequest();\n    setNotes("");\n    setNotesHistory([]);\n    setHistoryIndex(-1);\n    setIsDirty(false);\n    setFlashcards([]);\n    setGeneratedQuestions([]);\n    setUserAnswers({});\n    setQuizSubmitted(false);\n    setQuizResults(null);\n  }, [user?.id, invalidateNoteRequest, invalidateQuizRequest, invalidateGradeRequest]);\n\n  useEffect(() => () => {\n    noteRequestIdRef.current += 1;\n    quizRequestIdRef.current += 1;\n    gradeRequestIdRef.current += 1;\n    loadingOwnerRef.current = null;\n  }, []);\n\n  useEffect(() => {\n    if (previousNoteConfigKeyRef.current === null) {\n      previousNoteConfigKeyRef.current = noteConfigKey;\n      return;\n    }\n    if (previousNoteConfigKeyRef.current === noteConfigKey) return;\n    previousNoteConfigKeyRef.current = noteConfigKey;\n    invalidateNoteRequest();\n  }, [noteConfigKey, invalidateNoteRequest]);\n\n  useEffect(() => {\n    if (previousQuizConfigKeyRef.current === null) {\n      previousQuizConfigKeyRef.current = quizConfigKey;\n      return;\n    }\n    if (previousQuizConfigKeyRef.current === quizConfigKey) return;\n    previousQuizConfigKeyRef.current = quizConfigKey;\n    invalidateQuizRequest();\n  }, [quizConfigKey, invalidateQuizRequest]);\n\n  useEffect(() => {\n    if (previousGradeConfigKeyRef.current === null) {\n      previousGradeConfigKeyRef.current = gradeConfigKey;\n      return;\n    }\n    if (previousGradeConfigKeyRef.current === gradeConfigKey) return;\n    previousGradeConfigKeyRef.current = gradeConfigKey;\n    invalidateGradeRequest();\n  }, [gradeConfigKey, invalidateGradeRequest]);\n\n''',
    "ownership hooks",
)

replace_once(
    '''    setLoading(true);\n    try {\n      const res = await authFetch("/api/note", {''',
    '''    const requestId = noteRequestIdRef.current + 1;\n    noteRequestIdRef.current = requestId;\n    const requestAccountId = currentAsyncAccountIdRef.current;\n    const isCurrentRequest = () =>\n      noteRequestIdRef.current === requestId &&\n      currentAsyncAccountIdRef.current === requestAccountId;\n    loadingOwnerRef.current = { kind: "note", id: requestId };\n    setLoading(true);\n    try {\n      const res = await authFetch("/api/note", {''',
    "note request ownership",
)
replace_once(
    '''        body: JSON.stringify(generateNotesPayload()),\n      });\n\n      if (!res.ok) throw new Error(`Failed: ${res.status}`);\n      const data = await res.json();''',
    '''        body: JSON.stringify(generateNotesPayload()),\n      });\n      if (!isCurrentRequest()) return;\n\n      if (!res.ok) throw new Error(`Failed: ${res.status}`);\n      const data = await res.json();\n      if (!isCurrentRequest()) return;''',
    "note post-await guards",
)
replace_once(
    '''      recordStudySession();\n      if (data?.generation?.degraded) {''',
    '''      if (data?.generation?.degraded) {''',
    "defer note study side effect",
)
replace_once(
    '''      void saveStudyArtifact("note", topic.trim(), {\n        notes: nextNotes,\n        format: displayFormatLabel,\n        flashcards: data?.flashcards ?? [],\n        provenance: data?.provenance ?? null,\n        generation: data?.generation ?? null,\n      }).then((r) => {\n        if (r.ok) {\n          toast({\n            title: r.localOnly ? "Saved on this device" : "Notes saved",\n            description: r.localOnly\n              ? "Cloud sync pending - your notes are stored locally for now."\n              : "Your notes are stored in your account.",\n          });\n        } else if (r.error) {\n          toast({\n            title: "Save failed",\n            description: r.error,\n            variant: "destructive",\n          });\n        }\n      });\n    } catch (err) {\n      console.error(err);\n      alert("Failed to generate notes. Please try again.");\n    } finally {\n      setLoading(false);\n    }''',
    '''      const saved = await saveStudyArtifact("note", topic.trim(), {\n        notes: nextNotes,\n        format: displayFormatLabel,\n        flashcards: data?.flashcards ?? [],\n        provenance: data?.provenance ?? null,\n        generation: data?.generation ?? null,\n      });\n      if (!isCurrentRequest()) {\n        if (saved.ok && saved.id && currentAsyncAccountIdRef.current === requestAccountId) {\n          try {\n            await deleteStudyArtifact(saved.id);\n          } catch (cleanupError) {\n            console.warn("Failed to clean up stale generated notes:", cleanupError);\n          }\n        }\n        return;\n      }\n      recordStudySession();\n      if (saved.ok) {\n        toast({\n          title: saved.localOnly ? "Saved on this device" : "Notes saved",\n          description: saved.localOnly\n            ? "Cloud sync pending - your notes are stored locally for now."\n            : "Your notes are stored in your account.",\n        });\n      } else if (saved.error) {\n        toast({\n          title: "Save failed",\n          description: saved.error,\n          variant: "destructive",\n        });\n      }\n    } catch (err) {\n      if (!isCurrentRequest()) return;\n      console.error(err);\n      alert("Failed to generate notes. Please try again.");\n    } finally {\n      releaseLoadingOwner("note", requestId);\n    }''',
    "note persistence ownership",
)

replace_once(
    '''    setLoading(true);\n    try {\n      const adaptiveTopics =\n        quizType === "Adaptive Learning"''',
    '''    const requestId = quizRequestIdRef.current + 1;\n    quizRequestIdRef.current = requestId;\n    const requestAccountId = currentAsyncAccountIdRef.current;\n    const isCurrentRequest = () =>\n      quizRequestIdRef.current === requestId &&\n      currentAsyncAccountIdRef.current === requestAccountId;\n    loadingOwnerRef.current = { kind: "quiz", id: requestId };\n    setLoading(true);\n    try {\n      const adaptiveTopics =\n        quizType === "Adaptive Learning"''',
    "quiz request ownership",
)
replace_once(
    '''        }),\n      });\n\n      if (!res.ok) throw new Error(`Failed: ${res.status}`);\n      const data = await res.json();\n      const questions = Array.isArray(data.questions) ? data.questions : [];''',
    '''        }),\n      });\n      if (!isCurrentRequest()) return;\n\n      if (!res.ok) throw new Error(`Failed: ${res.status}`);\n      const data = await res.json();\n      if (!isCurrentRequest()) return;\n      const questions = Array.isArray(data.questions) ? data.questions : [];''',
    "quiz post-await guards",
)
replace_once(
    '''    } catch (err) {\n      console.error(err);\n      alert("Failed to generate quiz. Please try again.");\n      setGeneratedQuestions([]);\n    } finally {\n      setLoading(false);\n    }''',
    '''    } catch (err) {\n      if (!isCurrentRequest()) return;\n      console.error(err);\n      alert("Failed to generate quiz. Please try again.");\n      setGeneratedQuestions([]);\n    } finally {\n      releaseLoadingOwner("quiz", requestId);\n    }''',
    "quiz error and loading ownership",
)

replace_once(
    '''    setLoading(true);\n    try {\n      const gradeRes = await authFetch("/api/quiz", {''',
    '''    const requestId = gradeRequestIdRef.current + 1;\n    gradeRequestIdRef.current = requestId;\n    const requestAccountId = currentAsyncAccountIdRef.current;\n    const isCurrentRequest = () =>\n      gradeRequestIdRef.current === requestId &&\n      currentAsyncAccountIdRef.current === requestAccountId;\n    loadingOwnerRef.current = { kind: "grade", id: requestId };\n    setLoading(true);\n    try {\n      const gradeRes = await authFetch("/api/quiz", {''',
    "grade request ownership",
)
replace_once(
    '''        }),\n      });\n\n      if (!gradeRes.ok) throw new Error(`Grade failed: ${gradeRes.status}`);\n      const gradeData = await gradeRes.json();\n      const grades = Array.isArray(gradeData?.grades) ? gradeData.grades : [];''',
    '''        }),\n      });\n      if (!isCurrentRequest()) return;\n\n      if (!gradeRes.ok) throw new Error(`Grade failed: ${gradeRes.status}`);\n      const gradeData = await gradeRes.json();\n      if (!isCurrentRequest()) return;\n      const grades = Array.isArray(gradeData?.grades) ? gradeData.grades : [];''',
    "grade post-await guards",
)
replace_once(
    '''      setQuizResults(merged);\n      setQuizSubmitted(true);''',
    '''      if (!isCurrentRequest()) return;\n      setQuizResults(merged);\n      setQuizSubmitted(true);''',
    "grade pre-publish guard",
)
replace_once(
    '''      recordMeasuredResults(merged);\n      recordStudySession();\n      recordLoopStep("practise");\n\n      void saveStudyArtifact("review", `Quiz review - ${topic.trim() || "study notes"}`, {\n        contractVersion: gradeData?.contractVersion || "vertexed.grading.v2",\n        questions: generatedQuestions,\n        results: merged,\n        coverage: Array.isArray(gradeData?.coverage) ? gradeData.coverage : [],\n        degraded: gradeData?.degraded === true,\n        provenance: {\n          board: learner.curriculum.board,\n          subjects: learner.curriculum.subjects,\n          recordedAt: new Date().toISOString(),\n        },\n      });\n    } catch (err) {\n      console.error("Grading failed:", err);\n      alert("Failed to grade FRQ. Try again.");\n    } finally {\n      setLoading(false);\n    }''',
    '''      const saved = await saveStudyArtifact("review", `Quiz review - ${topic.trim() || "study notes"}`, {\n        contractVersion: gradeData?.contractVersion || "vertexed.grading.v2",\n        questions: generatedQuestions,\n        results: merged,\n        coverage: Array.isArray(gradeData?.coverage) ? gradeData.coverage : [],\n        degraded: gradeData?.degraded === true,\n        provenance: {\n          board: learner.curriculum.board,\n          subjects: learner.curriculum.subjects,\n          recordedAt: new Date().toISOString(),\n        },\n      });\n      if (!isCurrentRequest()) {\n        if (saved.ok && saved.id && currentAsyncAccountIdRef.current === requestAccountId) {\n          try {\n            await deleteStudyArtifact(saved.id);\n          } catch (cleanupError) {\n            console.warn("Failed to clean up stale quiz review:", cleanupError);\n          }\n        }\n        return;\n      }\n      recordMeasuredResults(merged);\n      recordStudySession();\n      recordLoopStep("practise");\n    } catch (err) {\n      if (!isCurrentRequest()) return;\n      console.error("Grading failed:", err);\n      alert("Failed to grade FRQ. Try again.");\n    } finally {\n      releaseLoadingOwner("grade", requestId);\n    }''',
    "grade persistence ownership",
)

SOURCE.write_text(source)

TEST.write_text(r'''import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const source = fs.readFileSync('src/pages/NotetakerQuiz.tsx', 'utf8');

test('notetaker async work is account/config/unmount owned', () => {
  assert.match(source, /const noteRequestIdRef = useRef\(0\);/);
  assert.match(source, /const quizRequestIdRef = useRef\(0\);/);
  assert.match(source, /const gradeRequestIdRef = useRef\(0\);/);
  assert.match(source, /const currentAsyncAccountIdRef = useRef<string \| null>\(user\?\.id \?\? null\);/);
  assert.match(source, /useLayoutEffect\(\(\) => \{[\s\S]*currentAsyncAccountIdRef\.current !== nextAccountId[\s\S]*invalidateNoteRequest\(\);[\s\S]*invalidateQuizRequest\(\);[\s\S]*invalidateGradeRequest\(\);[\s\S]*\}, \[user\?\.id,/);
  assert.match(source, /useEffect\(\(\) => \(\) => \{[\s\S]*noteRequestIdRef\.current \+= 1;[\s\S]*quizRequestIdRef\.current \+= 1;[\s\S]*gradeRequestIdRef\.current \+= 1;/);
  assert.match(source, /previousNoteConfigKeyRef[\s\S]*noteConfigKey[\s\S]*invalidateNoteRequest\(\);/);
  assert.match(source, /previousQuizConfigKeyRef[\s\S]*quizConfigKey[\s\S]*invalidateQuizRequest\(\);/);
  assert.match(source, /previousGradeConfigKeyRef[\s\S]*gradeConfigKey[\s\S]*invalidateGradeRequest\(\);/);
});

test('note generation rejects stale response, persistence, side effects, and loading finalization', () => {
  assert.match(source, /const requestId = noteRequestIdRef\.current \+ 1;[\s\S]*loadingOwnerRef\.current = \{ kind: "note", id: requestId \};/);
  assert.match(source, /await authFetch\("\/api\/note"[\s\S]*if \(!isCurrentRequest\(\)\) return;[\s\S]*await res\.json\(\);[\s\S]*if \(!isCurrentRequest\(\)\) return;/);
  assert.match(source, /const saved = await saveStudyArtifact\("note"[\s\S]*if \(!isCurrentRequest\(\)\) \{[\s\S]*currentAsyncAccountIdRef\.current === requestAccountId[\s\S]*await deleteStudyArtifact\(saved\.id\);[\s\S]*return;[\s\S]*\}[\s\S]*recordStudySession\(\);/);
  assert.match(source, /catch \(err\) \{\s*if \(!isCurrentRequest\(\)\) return;[\s\S]*\} finally \{\s*releaseLoadingOwner\("note", requestId\);\s*\}/);
});

test('quiz generation and AI grading reject stale completions independently', () => {
  assert.match(source, /const requestId = quizRequestIdRef\.current \+ 1;[\s\S]*loadingOwnerRef\.current = \{ kind: "quiz", id: requestId \};[\s\S]*await authFetch\("\/api\/quiz"[\s\S]*action: "generate"[\s\S]*if \(!isCurrentRequest\(\)\) return;[\s\S]*await res\.json\(\);[\s\S]*if \(!isCurrentRequest\(\)\) return;/);
  assert.match(source, /releaseLoadingOwner\("quiz", requestId\);/);
  assert.match(source, /const requestId = gradeRequestIdRef\.current \+ 1;[\s\S]*loadingOwnerRef\.current = \{ kind: "grade", id: requestId \};[\s\S]*action: "grade"[\s\S]*if \(!isCurrentRequest\(\)\) return;[\s\S]*await gradeRes\.json\(\);[\s\S]*if \(!isCurrentRequest\(\)\) return;/);
  assert.match(source, /const saved = await saveStudyArtifact\("review"[\s\S]*if \(!isCurrentRequest\(\)\) \{[\s\S]*currentAsyncAccountIdRef\.current === requestAccountId[\s\S]*await deleteStudyArtifact\(saved\.id\);[\s\S]*return;[\s\S]*\}[\s\S]*recordMeasuredResults\(merged\);[\s\S]*recordStudySession\(\);[\s\S]*recordLoopStep\("practise"\);/);
  assert.match(source, /releaseLoadingOwner\("grade", requestId\);/);
});
''')

print("patched NotetakerQuiz async ownership and wrote focused regressions")
