import { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { DataUploadPage } from './pages/DataUploadPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AIChatPage } from './pages/AIChatPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { ActionPlanPage } from './pages/ActionPlanPage';
import { KnowledgePage } from './pages/KnowledgePage';
import { ReportsPage } from './pages/ReportsPage';
import { apiService } from './services/api';
import type { Dataset, AnalyticsResult, ForecastResult } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsResult | null>(null);
  const [forecast, setForecast] = useState<ForecastResult | null>(null);

  // Initial load
  useEffect(() => {
    loadDatasets();
  }, []);

  const loadDatasets = async () => {
    try {
      const list = await apiService.getDatasets();
      setDatasets(list);
      if (list.length > 0 && !selectedDatasetId) {
        selectDataset(list[0].id);
      }
    } catch (err) {
      console.error('Failed to load datasets:', err);
    }
  };

  const selectDataset = async (datasetId: string) => {
    setSelectedDatasetId(datasetId);
    try {
      const [anData, fcData] = await Promise.all([
        apiService.getAnalytics(datasetId),
        apiService.getForecast(datasetId)
      ]);
      setAnalytics(anData || null);
      setForecast(fcData || null);
    } catch (err) {
      console.error('Failed to fetch dataset analytics:', err);
    }
  };

  const handleLoadDemo = async () => {
    try {
      const demoDs = await apiService.loadDemoDataset();
      if (demoDs) {
        await loadDatasets();
        await selectDataset(demoDs.id);
        setActiveTab('dashboard');
      }
    } catch (err) {
      console.error('Failed to load demo dataset:', err);
    }
  };

  const handleDatasetLoaded = async (ds: Dataset) => {
    await loadDatasets();
    await selectDataset(ds.id);
    setActiveTab('dashboard');
  };

  const currentDataset = datasets.find((d) => d.id === selectedDatasetId) || null;

  return (
    <div className="min-h-screen bg-[#070F1E] text-slate-100 flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        datasets={datasets}
        selectedDatasetId={selectedDatasetId}
        onSelectDataset={selectDataset}
        onLoadDemo={handleLoadDemo}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {activeTab === 'landing' && (
          <LandingPage
            onExploreDemo={handleLoadDemo}
            onGoToUpload={() => setActiveTab('data')}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardPage
            analytics={analytics}
            currentDataset={currentDataset}
            onNavigateTab={setActiveTab}
            onLoadDemo={handleLoadDemo}
          />
        )}

        {activeTab === 'data' && (
          <DataUploadPage
            onDatasetLoaded={handleDatasetLoaded}
            onLoadDemo={handleLoadDemo}
            currentDataset={currentDataset}
          />
        )}


        {activeTab === 'analytics' && (
          <AnalyticsPage
            analytics={analytics}
            forecast={forecast}
          />
        )}

        {activeTab === 'chat' && (
          <AIChatPage
            currentDataset={currentDataset}
          />
        )}

        {activeTab === 'recommendations' && (
          <RecommendationsPage
            currentDataset={currentDataset}
            onActionAdded={() => {}}
          />
        )}

        {activeTab === 'actions' && (
          <ActionPlanPage />
        )}

        {activeTab === 'knowledge' && (
          <KnowledgePage />
        )}

        {activeTab === 'reports' && (
          <ReportsPage
            currentDataset={currentDataset}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
