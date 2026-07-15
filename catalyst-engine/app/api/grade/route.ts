import { randomUUID } from "node:crypto";
import { gradeList, type Letter } from "@/lib/grading";
import { getCurrentUser } from "@/lib/auth";
import { insertGradeRun, listGradeRuns } from "@/lib/db";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Log in to use the list grader." }, { status: 401 });

  const form = await request.formData();
  const file = form.get("file");
  const icpGradeRaw = form.get("icpGrade");

  if (!(file instanceof File)) {
    return Response.json({ error: "No CSV file provided under field 'file'." }, { status: 400 });
  }

  const csvText = await file.text();
  const icpGrade = typeof icpGradeRaw === "string" && icpGradeRaw ? (icpGradeRaw as Letter) : null;

  try {
    const report = gradeList(csvText, icpGrade);
    insertGradeRun({
      id: randomUUID(),
      userId: user.id,
      filename: file.name || null,
      overallGrade: report.overallGrade,
      totalLeads: report.totalLeads,
      readyToSend: report.readyToSend,
      reportJson: JSON.stringify(report),
    });
    return Response.json(report);
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Failed to grade list." },
      { status: 400 }
    );
  }
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Log in to view history." }, { status: 401 });
  return Response.json({ runs: listGradeRuns(user.id) });
}
