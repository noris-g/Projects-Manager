import { useState, useEffect } from "react";

export default function FilesPage() {
  const [csvData, setCsvData] = useState([]);
  const [headers, setHeaders] = useState([]);

  // Active tab: "csv" or "overview"
  const [activeTab, setActiveTab] = useState("csv");

  // Your hardcoded CSV text
  const csvText = `
Month,Product Sales,Service Revenue,Subscription Revenue,Other Income,Payroll,Marketing,R&D,Operations,Administrative,Other Expenses,Total Income,Total Spending,Net Profit
January,80000,25000,12000,3000,42000,8000,6000,15000,7000,3000,120000,81000,39000
February,78000,24000,12500,2500,41000,7500,6500,14800,6800,3200,117000,78800,38200
March,85000,26000,13000,4000,43000,9000,7000,15500,7200,3500,128000,85200,42800
April,87000,27000,13500,3500,44500,9200,7200,15800,7300,3600,131000,87300,43700
May,90000,28000,14000,3000,45000,9500,7500,16000,7500,3700,135000,88200,46800
June,92000,29000,14500,3500,46000,9800,7600,16200,7600,3800,139000,91000,48000
July,95000,30000,15000,4000,47000,10000,7800,16500,7800,3900,144000,92400,51600
August,97000,31000,15500,4200,48000,10200,7900,16800,7900,4000,147700,94800,52800
September,94000,30500,16000,3800,46500,9800,7700,16000,7800,3900,144300,89700,54600
October,99000,32000,16500,4500,49000,10500,8000,17000,8000,4200,151000,98700,52300
November,102000,33000,17000,4800,50000,11000,8200,17500,8200,4400,156800,100300,56500
December,110000,35000,18000,5000,52000,11500,8500,18000,8500,4500,168000,105000,63000
  `.trim();

  const projectOverview = `
Project Name: Aurora Analytics Dashboard

Project Summary:
Aurora Analytics is an internal dashboard that aggregates financial, operational, and customer engagement data into a unified intelligence platform. It enables real-time tracking, reporting, and AI-driven predictions for strategic decision-making.

Roles and Responsibilities:

1. Emma Carter — Project Manager
   - Oversees roadmap, timelines, deliverables
   - Maintains communication between teams
   - Approves major milestones and releases
   - Prepares weekly project status reports

2. Liam Rodriguez — Lead Frontend Engineer
   - Builds all React components and dashboard views
   - Implements KPI widgets, charts, and filters
   - Manages client-side state and caching
   - Ensures responsiveness and accessibility

3. Sophia Martinez — Backend Engineer
   - Designs REST API and database models
   - Implements authentication and user permissions
   - Connects services to data pipelines
   - Optimizes performance and scalability

4. Noah Kim — Data Scientist
   - Analyzes company financials and KPIs
   - Builds forecasting and anomaly detection models
   - Prepares structured datasets for dashboards
   - Ensures model accuracy and documentation

5. Ava Thompson — UX/UI Designer
   - Designs visual layouts and interaction flows
   - Delivers page mockups and prototypes
   - Defines color systems and component guidelines
   - Works with frontend to maintain design fidelity

6. Ethan Brooks — QA Tester
   - Writes automated and manual test plans
   - Verifies API reliability and UI consistency
   - Logs bugs and performs regression testing
   - Ensures high-quality releases across devices

Project Goals:
- Provide leadership with a real-time overview of business health
- Automate reporting and reduce manual spreadsheet work
- Deliver predictive insights using machine learning
- Ensure modularity so new data sources can be added easily
`;

  // Parse CSV into table format
  useEffect(() => {
    const lines = csvText.split("\n");
    const headerRow = lines[0].split(",");
    setHeaders(headerRow);

    const rows = lines.slice(1).map((line) => line.split(","));
    setCsvData(rows);
  }, []);

  return (
    <div className="p-6">

      {/* ---------- TABS (VS CODE STYLE) ---------- */}
      <div className="flex border-b mb-4">
        <button
          onClick={() => setActiveTab("csv")}
          className={`px-4 py-2 text-sm border-r ${
            activeTab === "csv"
              ? "bg-white border-t border-l border-r font-semibold"
              : "bg-slate-200 hover:bg-slate-300"
          }`}
        >
          financials.csv
        </button>

        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 text-sm border-r ${
            activeTab === "overview"
              ? "bg-white border-t border-l border-r font-semibold"
              : "bg-slate-200 hover:bg-slate-300"
          }`}
        >
          project_overview.txt
        </button>
      </div>

      {/* ---------- TAB CONTENT ---------- */}
      {activeTab === "csv" && (
        <div>
          <h1 className="text-xl font-semibold mb-4">Financial Data (CSV Demo)</h1>

          <div className="overflow-auto border rounded-lg shadow-md bg-white">
            <table className="min-w-max w-full border-collapse text-sm">
              <thead className="bg-slate-100 border-b">
                <tr>
                  {headers.map((h, idx) => (
                    <th key={idx} className="p-3 text-left font-semibold border-r">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {csvData.map((row, i) => (
                  <tr key={i} className="odd:bg-white even:bg-slate-50">
                    {row.map((cell, j) => (
                      <td key={j} className="p-3 border-r">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-slate-500 text-sm mt-3">
            This CSV is hardcoded to demonstrate file reading & AI data extraction.
          </p>
        </div>
      )}

      {activeTab === "overview" && (
        <pre className="whitespace-pre-wrap text-sm bg-white border rounded-lg p-4 shadow-md">
          {projectOverview}
        </pre>
      )}
    </div>
  );
}
