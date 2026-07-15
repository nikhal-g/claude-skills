import { gradeList, type Letter } from "@/lib/grading";

export async function POST(request: Request) {
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
    return Response.json(report);
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Failed to grade list." },
      { status: 400 }
    );
  }
}
