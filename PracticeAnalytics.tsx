import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';

const PracticeAnalytics: React.FC = () => {
    const { t, language } = useTranslation();
    const [activeTab, setActiveTab] = useState('overview');
    const [dateRange, setDateRange] = useState({
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });
    const [analyticsData, setAnalyticsData] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    const generateAnalyticsData = () => {
      // Mock data generation logic as provided in the problem description
      return {
          summary: { totalPatients: 150, totalAppointments: 320, totalRevenue: 45000, newPatientsThisMonth: 32, patientGrowth: 8.6, revenueGrowth: 12.3 },
          trends: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map(m => ({ month: m, appointments: Math.floor(280 + Math.random() * 80) })),
          demographics: {
              ageGroups: [ { group: t('ageGroup1'), count: 25 }, { group: t('ageGroup2'), count: 45 }, { group: t('ageGroup3'), count: 35 }, { group: t('ageGroup4'), count: 30 }, { group: t('ageGroup5'), count: 15 } ],
              genderDistribution: [ { gender: t('male'), count: 70 }, { gender: t('female'), count: 75 }, { gender: t('other'), count: 5 } ]
          },
          appointments: {
              types: [ { type: t('consultation'), count: 180 }, { type: t('followUp'), count: 85 }, { type: t('procedure'), count: 35 } ],
              status: [ { status: t('completed'), count: 280 }, { status: t('cancelled'), count: 25 }, { status: t('noShow'), count: 15 } ]
          },
          financials: {
              revenueSources: [ { source: t('consultations'), amount: 27000, percentage: 60 }, { source: t('procedure'), amount: 12000, percentage: 27 }, { source: t('labTests'), amount: 4000, percentage: 9 } ]
          },
          clinical: {
              topDiagnoses: [ { diagnosis: t('hypertension'), count: 45, trend: 'up' }, { diagnosis: t('diabetes'), count: 38, trend: 'stable' }, { diagnosis: t('backPain'), count: 28, trend: 'up' } ],
              prescriptionPatterns: [ { medication: 'Lisinopril', count: 58 }, { medication: 'Metformin', count: 52 }, { medication: 'Atorvastatin', count: 48 } ]
          },
          performance: {
              patientSatisfaction: 4.7,
              avgWaitTime: 12,
              appointmentDuration: 22,
              noShowRate: 4.8,
              patientRetention: 88.5
          }
      };
    };
    
    useEffect(() => {
        loadAnalyticsData();
    }, [dateRange, language]);
    
    const loadAnalyticsData = () => {
        setLoading(true);
        setTimeout(() => {
            setAnalyticsData(generateAnalyticsData());
            setLoading(false);
        }, 1000);
    };

    const formatCurrency = (amount: number) => new Intl.NumberFormat(language === 'fa' ? 'fa-IR' : 'en-US', { style: 'currency', currency: language === 'fa' ? 'AFN' : 'USD', minimumFractionDigits: 0 }).format(amount);
    const formatNumber = (num: number) => new Intl.NumberFormat(language === 'fa' ? 'fa-IR' : 'en-US').format(num);

    if (loading) return (
        <div className="text-center p-10">
            <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-blue-500 mx-auto"></div>
            <h3 className="text-xl font-bold mt-4">{t('loadingAnalytics')}</h3>
            <p className="text-gray-600">{t('pleaseWaitAnalytics')}</p>
        </div>
    );
    if (!analyticsData) return <p>{t('noDataAvailable')}</p>;

    const tabs = [
        { id: 'overview', name: t('overview'), icon: '📊' },
        { id: 'patients', name: t('patientManagement'), icon: '👥' },
        { id: 'appointments', name: t('appointmentScheduler'), icon: '📅' },
        { id: 'financial', name: t('financial'), icon: '💰' },
        { id: 'clinical', name: t('clinical'), icon: '🩺' },
        { id: 'performance', name: t('performance'), icon: '⚡' }
    ];

    return (
        <div className="space-y-6">
             <h1 className="text-3xl font-bold text-gray-800">{t('practiceAnalytics')}</h1>
             
             {/* KPIs */}
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 <KPI title={t('totalPatients')} value={formatNumber(analyticsData.summary.totalPatients)} change={`+${analyticsData.summary.patientGrowth}%`} positive />
                 <KPI title={t('totalAppointments')} value={formatNumber(analyticsData.summary.totalAppointments)} change="+8.5%" positive />
                 <KPI title={t('totalRevenue')} value={formatCurrency(analyticsData.summary.totalRevenue)} change={`+${analyticsData.summary.revenueGrowth}%`} positive />
                 <KPI title={t('newPatients')} value={formatNumber(analyticsData.summary.newPatientsThisMonth)} change="+14.3%" positive />
             </div>

            {/* Tabs */}
            <div className="bg-white p-2 rounded-lg shadow-md">
                <div className="flex space-x-1 rtl:space-x-reverse">
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 p-3 rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition ${activeTab === tab.id ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}>
                        {tab.icon} {tab.name}
                    </button>
                ))}
                </div>
            </div>

            {/* Tab Content */}
            <div>
                 {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <ChartCard title={t('monthlyTrends')} className="lg:col-span-2">
                             <BarChart data={analyticsData.trends} valueKey="appointments" labelKey="month" color="bg-blue-500" />
                        </ChartCard>
                        <ChartCard title={t('appointmentStatus')}>
                             <PieChart data={analyticsData.appointments.status} valueKey="count" labelKey="status" colors={['bg-green-500', 'bg-red-500', 'bg-yellow-500']} />
                        </ChartCard>
                    </div>
                 )}
                 {activeTab === 'patients' && (
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ChartCard title={t('patientDemographicsAge')}>
                             <BarChart data={analyticsData.demographics.ageGroups} valueKey="count" labelKey="group" color="bg-purple-500" />
                        </ChartCard>
                        <ChartCard title={t('genderDistribution')}>
                             <PieChart data={analyticsData.demographics.genderDistribution} valueKey="count" labelKey="gender" colors={['bg-blue-500', 'bg-pink-500', 'bg-gray-500']} />
                        </ChartCard>
                     </div>
                 )}
                  {activeTab === 'financial' && (
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ChartCard title={t('revenueSources')}>
                            <div className="space-y-4 p-4">
                                {analyticsData.financials.revenueSources.map((s:any, i:number) => (
                                    <div key={i}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>{s.source}</span>
                                            <span>{formatCurrency(s.amount)} ({s.percentage}%)</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div className="bg-green-600 h-2.5 rounded-full" style={{width: `${s.percentage}%`}}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ChartCard>
                     </div>
                 )}
            </div>
        </div>
    );
};

const KPI: React.FC<{title: string, value: string, change: string, positive: boolean}> = ({title, value, change, positive}) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-sm text-gray-500">{title}</p>
        <div className="flex justify-between items-end">
             <p className="text-3xl font-bold text-gray-800">{value}</p>
             <span className={`text-sm font-semibold ${positive ? 'text-green-600' : 'text-red-600'}`}>{change}</span>
        </div>
    </div>
);

const ChartCard: React.FC<{title:string, children: React.ReactNode, className?: string}> = ({title, children, className}) => (
    <div className={`bg-white p-6 rounded-lg shadow-md ${className}`}>
        <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>
        {children}
    </div>
);

const BarChart: React.FC<{data: any[], valueKey: string, labelKey: string, color: string}> = ({data, valueKey, labelKey, color}) => {
    const maxValue = Math.max(...data.map(d => d[valueKey]));
    return (
        <div className="flex h-64 items-end space-x-2 rtl:space-x-reverse">
            {data.map((d,i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                    <div className={`${color} w-full rounded-t-md`} style={{height: `${(d[valueKey]/maxValue) * 100}%`}}></div>
                    <span className="text-xs text-gray-500 mt-1">{d[labelKey]}</span>
                </div>
            ))}
        </div>
    );
};

const PieChart: React.FC<{data: any[], valueKey: string, labelKey: string, colors: string[]}> = ({data, valueKey, labelKey, colors}) => {
    const total = data.reduce((sum, d) => sum + d[valueKey], 0);
    
    return (
        <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative w-40 h-40">
                <div 
                    className="w-40 h-40 rounded-full" 
                    style={{
                        background: data.reduce((acc, d, i) => {
                            const percent = (d[valueKey] / total) * 100;
                            const prevPercent = acc.cumulative;
                            acc.cumulative += percent;
                            return {
                                cumulative: acc.cumulative,
                                gradient: `${acc.gradient}, ${colors[i % colors.length]} ${prevPercent}% ${acc.cumulative}%`
                            }
                        }, { cumulative: 0, gradient: '' }).gradient.substring(2)
                    }}
                ></div>
            </div>
            <div className="space-y-2">
                {data.map((d,i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                        <div className={`w-3 h-3 rounded-full ${colors[i % colors.length]}`}></div>
                        <span>{d[labelKey]}: {d[valueKey]} ({(d[valueKey]/total * 100).toFixed(1)}%)</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default PracticeAnalytics;
