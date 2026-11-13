import ExcelJS from "exceljs";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { getReports } from "../../../services/report";

const HEADERS = [
  { header: "Quarter", key: "kuarter", width: 12 },
  { header: "Departemen", key: "departemen", width: 18 },
  { header: "Workspace", key: "workspace", width: 18 },
  { header: "Project Name", key: "project", width: 22 },
  { header: "Nama Group", key: "group", width: 18 },
  { header: "Level", key: "itemType", width: 12 },
  { header: "Task Name", key: "taskName", width: 30 },
  { header: "Subtask Name", key: "subtaskName", width: 30 },
  { header: "PIC", key: "pic", width: 18 },
  { header: "Type", key: "type", width: 12 },
  { header: "Status", key: "status", width: 14 },
  { header: "Priority", key: "priority", width: 12 },
  { header: "Scale", key: "scale", width: 10 },
  { header: "Start Date", key: "startDate", width: 14 },
  { header: "End Date", key: "dueDate", width: 14 },
  { header: "Durasi Start-End (Hari)", key: "durationStartToEnd", width: 16 },
  { header: "Finish Date", key: "finishDate", width: 14 },
  { header: "Durasi Start-Finish (Hari)", key: "durationStartToFinish", width: 18 },
  { header: "Durasi Due-Finish (Hari)", key: "durationDueToFinish", width: 16 },
  { header: "Status Penyelesaian", key: "completionStatus", width: 20 },
];

function formatDate(date) {
  if (!date) return "-";
  return dayjs(date).format("DD MMM YYYY");
}

function mapRowToExcel(row) {
  return [
    row.kuarter,
    row.departemen,
    row.workspace,
    row.project,
    row.group,
    row.itemType,
    row.taskName,
    row.subtaskName || "-",
    row.pic,
    row.type,
    row.status,
    row.priority,
    row.scale,
    formatDate(row.startDate),
    formatDate(row.dueDate),
    row.durationStartToEnd ?? "-",
    formatDate(row.finishDate),
    row.durationStartToFinish ?? "-",
    row.durationDueToFinish ?? "-",
    row.completionStatus,
  ];
}

export async function exportGroupReportToExcel({ groupId, groupName, filters }) {
  const toastId = "group-excel-export";
  try {
    toast.loading("Preparing Excel file...", { id: toastId });

    const exportFilters = {
      ...filters,
      groupId,
      limit: "all",
      export: "true",
    };

    const res = await getReports(exportFilters);
    const rows = res?.data || [];

    if (rows.length === 0) {
      toast.error("No data available to export", { id: toastId });
      return;
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Planify";
    workbook.created = new Date();

    const sheet = workbook.addWorksheet("Group Report");

    // Define columns
    sheet.columns = HEADERS.map(({ header, key, width }) => ({ header, key, width }));

    // Style header row
    const headerRow = sheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFFFFFF" },
      };
      cell.font = { bold: true, color: { argb: "FF000000" } };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // Add data rows
    rows.forEach((row) => {
      const dataRow = sheet.addRow(mapRowToExcel(row));
      dataRow.eachCell((cell) => {
        cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
      });
    });

    // Freeze header + auto filter
    sheet.views = [{ state: "frozen", ySplit: 1 }];
    sheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: HEADERS.length },
    };

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStr = dayjs().format("YYYYMMDD_HHmmss");
    const safeName = (groupName || "group").replace(/[^a-zA-Z0-9_]/g, "_");
    link.href = url;
    link.download = `${safeName}_Report_${dateStr}.xlsx`;
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Excel exported successfully!", { id: toastId });
  } catch (err) {
    console.error("[GroupReport] Export error:", err);
    toast.error("Failed to export Excel", { id: toastId });
  }
}

