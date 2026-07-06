"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Upload, FileWarning, CheckCircle2 } from "lucide-react";
import { toast } from "react-toastify";
import { importsApi, getErrorMessage } from "@/lib/api";
import { exportToCsv } from "@/lib/csv";
import type { ImportJobStatus } from "@/types";

export default function AdminImportPage() {
  const [jobId, setJobId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: job } = useQuery<ImportJobStatus>({
    queryKey: ["import-job", jobId],
    queryFn: async () => {
      const { data } = await importsApi.status(jobId!);
      return data;
    },
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "completed" || status === "failed" ? false : 2000;
    },
  });

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { data } = await importsApi.upload(file);
      setJobId(data.job_id);
      toast.success("Import started");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function downloadErrorReport() {
    if (!job?.errors?.length) return;
    exportToCsv(
      `import_errors_${jobId}.csv`,
      ["row_number", "message"],
      job.errors.map((e) => [e.row_number, e.message])
    );
  }

  const progressPct = job && job.total_rows > 0 ? Math.round((job.processed_rows / job.total_rows) * 100) : 0;

  return (
    <div className="space-y-4 max-w-2xl">
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Bulk Product Import</h1>

      <div className="card p-5 space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Upload a CSV file to create or update products in bulk. Products with a matching slug will be updated.
        </p>
        <a
          href={importsApi.templateUrl()}
          className="inline-flex items-center gap-1.5 text-sm text-primary-700 hover:underline"
        >
          <Download size={15} /> Download CSV Template
        </a>

        <label className="btn-outline text-sm h-9 px-4 inline-flex items-center gap-2 cursor-pointer w-fit">
          <Upload size={15} />
          {uploading ? "Uploading…" : "Upload CSV"}
          <input type="file" accept=".csv" onChange={handleUpload} className="hidden" disabled={uploading} />
        </label>
      </div>

      {job && (
        <div className="card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Import Progress</h2>
            <span className="text-xs font-semibold uppercase text-gray-500">{job.status}</span>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-primary-700 transition-all" style={{ width: `${progressPct}%` }} />
          </div>
          <p className="text-xs text-gray-500">
            {job.processed_rows} / {job.total_rows} rows processed ({progressPct}%)
          </p>

          <div className="flex items-center gap-6 text-sm">
            <span className="flex items-center gap-1.5 text-green-600">
              <CheckCircle2 size={15} /> {job.success_count} succeeded
            </span>
            {job.error_count > 0 && (
              <span className="flex items-center gap-1.5 text-red-600">
                <FileWarning size={15} /> {job.error_count} failed
              </span>
            )}
          </div>

          {job.errors?.length > 0 && (
            <div>
              <button onClick={downloadErrorReport} className="text-xs text-primary-700 hover:underline">
                Download error report (CSV)
              </button>
              <ul className="mt-2 max-h-48 overflow-y-auto text-xs text-gray-600 dark:text-gray-400 space-y-1">
                {job.errors.slice(0, 20).map((e, i) => (
                  <li key={i}>Row {e.row_number}: {e.message}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
