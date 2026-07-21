function ReportTimeline({ report }) {
  const status = report?.status || "pending";

  const steps = [
    {
      label: "Report Submitted",
      time: report?.createdAt,
      done: true
    },
    {
      label: "Under Review",
      done: ["pending", "review"].includes(status)
    },
    {
      label: "In Progress",
      done: ["in_progress", "resolved"].includes(status)
    },
    {
      label: "Resolved",
      done: status === "resolved"
    }
  ];

  return (
    <div className="border rounded-lg p-4 bg-white">
      <h2 className="font-semibold mb-4 text-gray-700">
        Case Timeline
      </h2>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={index} className="flex items-start gap-3">

            {/* DOT */}
            <div
              className={`w-3 h-3 rounded-full mt-1 ${
                step.done ? "bg-green-500" : "bg-gray-300"
              }`}
            />

            {/* CONTENT */}
            <div>
              <p className={`font-medium ${
                step.done ? "text-green-600" : "text-gray-400"
              }`}>
                {step.label}
              </p>

              {step.time && (
                <p className="text-xs text-gray-500">
                  {new Date(step.time).toLocaleString()}
                </p>
              )}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}

export default ReportTimeline;