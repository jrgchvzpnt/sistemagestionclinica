import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../Common.css';
import './TestReportsAnalysis.css';

const TestReportsAnalysis = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalAnalysis: 0,
    completed: 0,
    processing: 0,
    mainTestType: 0
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [analysisInstructions, setAnalysisInstructions] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState([]);

  useEffect(() => {
    fetchAnalysisStats();
    fetchAnalysisHistory();
  }, []);

  const fetchAnalysisStats = async () => {
    try {
      const response = await fetch('/api/dashboard/ai-insights', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setStats({
        totalAnalysis: data.testReports?.total || 0,
        completed: data.testReports?.completed || 0,
        processing: data.testReports?.processing || 0,
        mainTestType: data.testReports?.mainType || 0
      });
    } catch (error) {
      console.error('Error fetching AI stats:', error);
    }
  };

  const fetchAnalysisHistory = async () => {
    try {
      const response = await fetch('/api/ai-analysis?analysisType=test-report&limit=10', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setAnalysisHistory(data.analyses || []);
    } catch (error) {
      console.error('Error fetching analysis history:', error);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && (file.type === 'application/pdf' || file.type === 'image/jpeg' || file.type === 'image/png')) {
      setSelectedFile(file);
    } else {
      alert(t('testReportsAnalysis.invalidFileType'));
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile || !selectedPatient) {
      alert(t('testReportsAnalysis.missingRequiredFields'));
      return;
    }

    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append('report', selectedFile);
      formData.append('patient', selectedPatient);
      formData.append('analysisType', 'test-report');
      formData.append('instructions', analysisInstructions);

      const response = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const result = await response.json();
      
      if (response.ok) {
        alert(t('testReportsAnalysis.analysisStarted'));
        setSelectedFile(null);
        setSelectedPatient('');
        setAnalysisInstructions('');
        fetchAnalysisHistory();
        fetchAnalysisStats();
      } else {
        alert(result.message || t('testReportsAnalysis.analysisError'));
      }
    } catch (error) {
      console.error('Error starting analysis:', error);
      alert(t('testReportsAnalysis.analysisError'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const browseFiles = () => {
    document.getElementById('fileInput').click();
  };

  return (
    <div className="test-reports-analysis">
      <div className="page-header">
        <div className="header-content">
          <div className="header-icon">🧠</div>
          <div>
            <h1>{t('testReportsAnalysis.title')}</h1>
            <p>{t('testReportsAnalysis.subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{stats.totalAnalysis}</h3>
            <p>{t('testReportsAnalysis.totalAnalysis')}</p>
            <span className="stat-period">{t('testReportsAnalysis.last30Days')}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.completed}</h3>
            <p>{t('testReportsAnalysis.completed')}</p>
            <span className="stat-percentage">0% {t('testReportsAnalysis.successRate')}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{stats.processing}</h3>
            <p>{t('testReportsAnalysis.processing')}</p>
            <span className="stat-note">{t('testReportsAnalysis.processingNow')}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🧪</div>
          <div className="stat-content">
            <h3>{stats.mainTestType}</h3>
            <p>{t('testReportsAnalysis.mainTestType')}</p>
            <span className="stat-note">{t('testReportsAnalysis.noData')}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button className="btn-secondary" onClick={() => fetchAnalysisHistory()}>
          📄 {t('testReportsAnalysis.newAnalysis')}
        </button>
        <button className="btn-outline" onClick={() => fetchAnalysisHistory()}>
          📋 {t('testReportsAnalysis.analysisHistory')}
        </button>
      </div>

      {/* Upload Section */}
      <div className="upload-section">
        <div className="section-header">
          <h2>📤 {t('testReportsAnalysis.uploadTitle')}</h2>
          <p>{t('testReportsAnalysis.uploadSubtitle')}</p>
        </div>

        <div className="upload-area">
          <div className="upload-zone" onClick={browseFiles}>
            {selectedFile ? (
              <div className="file-selected">
                <div className="file-icon">📄</div>
                <p>{selectedFile.name}</p>
                <span>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            ) : (
              <div className="upload-placeholder">
                <div className="upload-icon">📤</div>
                <p>{t('testReportsAnalysis.uploadPlaceholder')}</p>
                <span>{t('testReportsAnalysis.supportedFormats')}</span>
                <button className="btn-link" onClick={browseFiles}>
                  {t('testReportsAnalysis.browseFiles')}
                </button>
              </div>
            )}
          </div>
          <input
            id="fileInput"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </div>

        {/* Patient Selection */}
        <div className="form-section">
          <label htmlFor="patientSelect">{t('testReportsAnalysis.selectPatient')}</label>
          <select
            id="patientSelect"
            value={selectedPatient}
            onChange={(e) => setSelectedPatient(e.target.value)}
            className="form-select"
          >
            <option value="">{t('testReportsAnalysis.choosePatient')}</option>
            <option value="patient1">Juan Pérez - ID: 001</option>
            <option value="patient2">María García - ID: 002</option>
            <option value="patient3">Carlos López - ID: 003</option>
          </select>
        </div>

        {/* Analysis Instructions */}
        <div className="form-section">
          <label htmlFor="instructions">{t('testReportsAnalysis.instructions')} ({t('testReportsAnalysis.optional')})</label>
          <textarea
            id="instructions"
            value={analysisInstructions}
            onChange={(e) => setAnalysisInstructions(e.target.value)}
            placeholder={t('testReportsAnalysis.instructionsPlaceholder')}
            className="form-textarea"
            rows="4"
          />
        </div>

        {/* Analysis Button */}
        <div className="analysis-actions">
          <p className="analysis-note">{t('testReportsAnalysis.analysisNote')}</p>
          <button
            className="btn-analyze"
            onClick={handleAnalyze}
            disabled={isAnalyzing || !selectedFile || !selectedPatient}
          >
            {isAnalyzing ? (
              <>
                <span className="spinner"></span>
                {t('testReportsAnalysis.analyzing')}
              </>
            ) : (
              <>
                🧠 {t('testReportsAnalysis.analyzeButton')}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Recent Analysis */}
      {analysisHistory.length > 0 && (
        <div className="recent-analysis">
          <div className="section-header">
            <h2>{t('testReportsAnalysis.recentAnalysis')}</h2>
          </div>
          <div className="analysis-list">
            {analysisHistory.slice(0, 5).map((analysis, index) => (
              <div key={index} className="analysis-item">
                <div className="analysis-info">
                  <h4>{analysis.patient?.firstName} {analysis.patient?.lastName}</h4>
                  <p>{new Date(analysis.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="analysis-status">
                  <span className={`status ${analysis.status}`}>
                    {analysis.status === 'completed' ? '✅' : '⏳'} {analysis.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestReportsAnalysis;
