
import React, { useState, useMemo } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { Patient, Appointment, Prescription } from '../types';

interface AdvancedReportsProps {
    patients: Patient[];
    appointments: Appointment[];
    prescriptions: Prescription[];
}

const reportTypes = [
    { id: 'patientDemographics', name: 'reportPatientDemographics', description: 'reportPatientDemographicsDesc', icon: '👥' },
    { id: 'appointmentAnalysis', name: 'reportAppointmentAnalysis', description: 'reportAppointmentAnalysisDesc', icon: '📅' },
    // { id: 'financial', name: 'reportFinancial', description: 'reportFinancialDesc', icon: '💰' },
    // { id: 'clinical', name: 'reportClinicalOutcomes', description: 'reportClinicalOutcomesDesc', icon: '🩺' },
];

const AdvancedReports: React.FC<AdvancedReportsProps> = ({ patients, appointments, prescriptions }) => {
    const { t } = useTranslation();
    const [selectedReport, setSelectedReport] = useState<string | null>(null);
    const [filters, setFilters] = useState({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
    });
    const [reportData, setReportData] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);

    const handleGenerateReport = async () => {
        if (!selectedReport) return;
        setLoading(true);
        setReportData(null);
        
        let data = null;
        try {
            if (selectedReport === 'patientDemographics') {
                data = await (window as any).electronAPI.getPatientDemographicsReport({ patients, filters });
            } else if (selectedReport === 'appointmentAnalysis') {
                data = await (window as any).electronAPI.getAppointmentAnalysisReport({ appointments, filters });
            }
        } catch (error) {
            console.error("Error generating report:", error);
        }

        setTimeout(() => { // Simulate network delay
            setReportData(data);
            setLoading(false);
        }, 1000);
    };
    
    const handleExport = async (format: 'PDF' | 'CSV' | 'Excel') => {
        const exportFn = (window as any).electronAPI[`exportReport${format}`];
        if (exportFn) {
            await exportFn(selectedReport, reportData);
        }
    };
    
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">{t('advancedReports')}</h1>
            <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-full md:w-1/3 lg:w-1/4">
                    <div className="bg-white p-4 rounded-lg shadow-md space-y-2">
                        <h2 className="text-lg font-semibold px-2 mb-2">{t('selectReportType')}</h2>
                        {reportTypes.map(report => (
                            <button
                                key={report.id}
                                onClick={() => { setSelectedReport(report.id); setReportData(null); }}
                                className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${selectedReport === report.id ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
                            >
                                <span className="text-2xl">{report.icon}</span>
                                <div>
                                    <p className="font-semibold">{t(report.name)}</p>
                                    <p className="text-xs opacity-80">{t(report.description)}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="w-full md:w-2/3 lg:w-3/4">
                    {!selectedReport ? (
                        <div className="bg-white p-8 rounded-lg shadow-md text-center">
                            <p className="text-gray-500">{t('selectReport')}</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <h2 className="text-xl font-bold mb-4">{t('filters')}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                    <InputField label={t('startDate')} type="date" value={filters.startDate} onChange={e => setFilters(f => ({...f, startDate: e.target.value}))} />
                                    <InputField label={t('endDate')} type="date" value={filters.endDate} onChange={e => setFilters(f => ({...f, endDate: e.target.value}))} />
                                    <button onClick={handleGenerateReport} disabled={loading} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-blue-300 h-10">
                                        {loading ? `${t('generatingReport')}...` : t('generateReport')}
                                    </button>
                                </div>
                            </div>
                            
                            {loading && (
                                <div className="text-center p-10 bg-white rounded-lg shadow-md">
                                    <div className="w-10 h-10 border-4 border-dashed rounded-full animate-spin border-blue-500 mx-auto"></div>
                                    <p className="mt-4 text-gray-600">{t('generatingReport')}</p>
                                </div>
                            )}

                            {reportData === null && !loading && (
                                 <div className="bg-white p-8 rounded-lg shadow-md text-center">
                                    <p className="text-gray-500">{t('noReportGenerated')}</p>
                                </div>
                            )}

                            {reportData && !loading && (
                                <div className="space-y-6">
                                    <div className="bg-white p-6 rounded-lg shadow-md">
                                        <div className="flex justify-between items-center mb-4">
                                            <h2 className="text-xl font-bold">{t('exportOptions')}</h2>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleExport('PDF')} className="text-sm px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200">PDF</button>
                                                <button onClick={() => handleExport('CSV')} className="text-sm px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200">CSV</button>
                                                <button onClick={() => handleExport('Excel')} className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">Excel</button>
                                            </div>
                                        </div>
                                    </div>
                                    {selectedReport === 'patientDemographics' && <PatientDemographicsView data={reportData} />}
                                    {selectedReport === 'appointmentAnalysis' && <AppointmentAnalysisView data={reportData} />}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Report-specific view components
const PatientDemographicsView: React.FC<{ data: any }> = ({ data }) => {
    const { t } = useTranslation();
    const columns = useMemo(() => [
        { key: 'name', header: t('name') },
        { key: 'age', header: t('age') },
        { key: 'gender', header: t('gender') },
        { key: 'phone', header: t('contact') },
        { key: 'status', header: t('status') }
    ], [t]);
    
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KPI title={t('totalPatients')} value={data.summary.totalPatients} />
                <KPI title={t('averagePatientAge')} value={`${data.summary.averageAge} ${t('years')}`} />
                <KPI title={t('active')} value={data.summary.activePatients} />
                <KPI title={t('inactive')} value={data.summary.inactivePatients} />
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-bold mb-4">{t('genderDistribution')}</h3>
                <PieChart data={data.charts.gender} valueKey="value" labelKey="name" colors={['bg-blue-500', 'bg-pink-500', 'bg-gray-500']} />
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-bold mb-4">{t('detailedDataTable')}</h3>
                <DataTable columns={columns} data={data.tableData} />
            </div>
        </div>
    );
};

const AppointmentAnalysisView: React.FC<{ data: any }> = ({ data }) => {
    const { t } = useTranslation();
    const columns = useMemo(() => [
        { key: 'appointment_date', header: t('appointmentDate') },
        { key: 'appointment_time', header: t('time') },
        { key: 'type', header: t('type') },
        { key: 'status', header: t('status') },
        { key: 'duration', header: `${t('duration')} (${t('minutes')})` }
    ], [t]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KPI title={t('totalAppointments')} value={data.summary.totalAppointments} />
                <KPI title={t('completed')} value={data.summary.completedCount} />
                <KPI title={t('noShowAppointments')} value={data.summary.noShowCount} />
                <KPI title={t('peakAppointmentTime')} value={data.summary.peakTime} />
            </div>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title={t('appointmentStatus')}>
                     <PieChart data={data.charts.status} valueKey="value" labelKey="name" colors={['bg-green-500', 'bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-gray-500']} />
                </ChartCard>
                <ChartCard title={t('appointmentTypes')}>
                    <BarChart data={data.charts.type} valueKey="value" labelKey="name" color="bg-purple-500" />
                </ChartCard>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-bold mb-4">{t('detailedDataTable')}</h3>
                <DataTable columns={columns} data={data.tableData} />
            </div>
        </div>
    );
};


// Reusable components for reports
const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input {...props} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
    </div>
);

const KPI: React.FC<{title: string, value: string | number}> = ({title, value}) => (
    <div className="bg-gray-50 p-4 rounded-lg text-center">
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
);

const ChartCard: React.FC<{title:string, children: React.ReactNode, className?: string}> = ({title, children, className}) => (
    <div className={`bg-white p-6 rounded-lg shadow-md ${className}`}>
        <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>
        {children}
    </div>
);

const PieChart: React.FC<{data: any[], valueKey: string, labelKey: string, colors: string[]}> = ({data, valueKey, labelKey, colors}) => {
    const { t } = useTranslation();
    const total = data.reduce((sum, d) => sum + d[valueKey], 0);
    
    return (
        <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative w-40 h-40">
                <div className="w-40 h-40 rounded-full" style={{
                    background: `conic-gradient(${data.map((d, i) => {
                        const percent = (d[valueKey] / total) * 100;
                        const colorClass = colors[i % colors.length].replace('bg-', '');
                        const colorValue = { 'blue-500': '#3b82f6', 'pink-500': '#ec4899', 'gray-500': '#6b7280', 'green-500': '#22c55e', 'red-500': '#ef4444', 'yellow-500': '#eab308', 'purple-500': '#8b5cf6' }[colorClass] || colorClass;
                        return `${colorValue} 0 ${percent}%`;
                    }).join(', ')})`
                }}></div>
            </div>
            <div className="space-y-2">
                {data.map((d,i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                        <div className={`w-3 h-3 rounded-full ${colors[i % colors.length]}`}></div>
                        <span>{t(d[labelKey])}: {d[valueKey]} ({(d[valueKey]/total * 100).toFixed(1)}%)</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const BarChart: React.FC<{data: any[], valueKey: string, labelKey: string, color: string}> = ({data, valueKey, labelKey, color}) => {
    const { t } = useTranslation();
    const maxValue = Math.max(...data.map(d => d[valueKey]));
    return (
        <div className="flex h-64 items-end space-x-2 rtl:space-x-reverse">
            {data.map((d,i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                    <div className={`${color} w-full rounded-t-md`} style={{height: `${(d[valueKey]/maxValue) * 100}%`}}></div>
                    <span className="text-xs text-gray-500 mt-1">{t(d[labelKey])}</span>
                </div>
            ))}
        </div>
    );
};

// Reusable Data Table Component with Sorting and Pagination
const DataTable: React.FC<{columns: {key: string; header: string}[], data: any[]}> = ({ columns, data }) => {
    const { t } = useTranslation();
    const [sortConfig, setSortConfig] = useState<{key: string; direction: 'ascending' | 'descending' } | null>({key: columns[0].key, direction: 'ascending'});
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    
    const sortedData = useMemo(() => {
        let sortableData = [...data];
        if (sortConfig !== null) {
            sortableData.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return sortableData;
    }, [data, sortConfig]);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * rowsPerPage;
        return sortedData.slice(startIndex, startIndex + rowsPerPage);
    }, [sortedData, currentPage, rowsPerPage]);

    const requestSort = (key: string) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const totalPages = Math.ceil(sortedData.length / rowsPerPage);
    const startRow = (currentPage - 1) * rowsPerPage + 1;
    const endRow = Math.min(currentPage * rowsPerPage, sortedData.length);

    if (data.length === 0) {
        return <p className="text-center text-gray-500 py-8">{t('noResultsFound')}</p>;
    }

    return (
        <div>
            <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            {columns.map(col => (
                                <th key={col.key} scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort(col.key)}>
                                    {col.header}
                                    {sortConfig?.key === col.key && (sortConfig.direction === 'ascending' ? ' ▲' : ' ▼')}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((row, index) => (
                            <tr key={index} className="bg-white border-b hover:bg-gray-50">
                                {columns.map(col => (
                                    <td key={col.key} className="px-6 py-4">{row[col.key]}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center mt-4 text-sm">
                <p className="text-gray-600 mb-2 md:mb-0">
                    {t('showing')} {startRow} {t('to')} {endRow} {t('of')} {sortedData.length} {t('results_plural')}
                </p>
                <div className="flex items-center gap-4">
                     <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">{t('previousPage')}</button>
                     <span>{currentPage} / {totalPages}</span>
                     <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">{t('nextPage')}</button>
                </div>
            </div>
        </div>
    );
};

export default AdvancedReports;
