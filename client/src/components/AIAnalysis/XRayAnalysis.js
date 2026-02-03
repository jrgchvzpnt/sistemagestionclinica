import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './XRayAnalysis.css';

const XRayAnalysis = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalAnalysis: 50,
    completed: 16,
    pending: 19,
    commonFindings: 3
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
        totalAnalysis: data.recentAnalyses?.length || 50,
        completed: data.successRate?.completed || 16,
        pending: data.successRate?.pending || 19,
        commonFindings: data.commonFindings?.length || 3
      });
    } catch (error) {
      console.error('Error fetching AI stats:', error);
    }
  };

  const fetchAnalysisHistory = async () => {
    try {
      const response = await fetch('/api/ai-analysis?analysisType=xray&limit=10', {
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
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      setSelectedFile(file);
    } else {
      alert(t('xrayAnalysis.invalidFileType'));
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile || !selectedPatient) {
      alert(t('xrayAnalysis.missingRequiredFields'));
      return;
    }

    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('patient', selectedPatient);
      formData.append('analysisType', 'xray');
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
        alert(t('xrayAnalysis.analysisStarted'));
        setSelectedFile(null);
        setSelectedPatient('');
        setAnalysisInstructions('');
        fetchAnalysisHistory();
        fetchAnalysisStats();
      } else {
        alert(result.message || t('xrayAnalysis.analysisError'));
      }
    } catch (error) {
      console.error('Error starting analysis:', error);
      alert(t('xrayAnalysis.analysisError'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const downloadSampleXray = () => {
    // Simular descarga de radiografía de muestra
    alert(t('xrayAnalysis.sampleDownloaded'));
  };

  return (
    <div className="xray-analysis">
      <div className="page-header">
        <div className="header-content">
          <div className="header-icon">🧠</div>
          <div>
            <h1>{t('xrayAnalysis.title')}</h1>
            <p>{t('xrayAnalysis.subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{stats.totalAnalysis}</h3>
            <p>{t('xrayAnalysis.totalAnalysis')}</p>
            <span className="stat-period">{t('xrayAnalysis.last30Days')}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.completed}</h3>
            <p>{t('xrayAnalysis.completed')}</p>
            <span className="stat-percentage">32% {t('xrayAnalysis.successRate')}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{stats.pending}</h3>
            <p>{t('xrayAnalysis.pending')}</p>
            <span className="stat-note">{t('xrayAnalysis.processingNow')}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔍</div>
          <div className="stat-content">
            <h3>{stats.commonFindings}</h3>
            <p>{t('xrayAnalysis.commonFindings')}</p>
            <span className="stat-note">{t('xrayAnalysis.mostDetected')}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button className="btn-secondary" onClick={() => fetchAnalysisHistory()}>
          📄 {t('xrayAnalysis.newAnalysis')}
        </button>
        <button className="btn-outline" onClick={() => fetchAnalysisHistory()}>
          📋 {t('xrayAnalysis.analysisHistory')}
        </button>
      </div>

      {/* Upload Section */}
      <div className="upload-section">
        <div className="section-header">
          <h2>📤 {t('xrayAnalysis.uploadTitle')}</h2>
          <p>{t('xrayAnalysis.uploadSubtitle')}</p>
        </div>

        <div className="upload-area">
          <div className="upload-zone" onClick={() => document.getElementById('fileInput').click()}>
            {selectedFile ? (
              <div className="file-selected">
                <div className="file-icon">📄</div>
                <p>{selectedFile.name}</p>
                <span>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            ) : (
              <div className="upload-placeholder">
                <div className="upload-icon">📤</div>
                <p>{t('xrayAnalysis.uploadPlaceholder')}</p>
                <span>{t('xrayAnalysis.supportedFormats')}</span>
                <button className="btn-link" onClick={downloadSampleXray}>
                  {t('xrayAnalysis.downloadSample')}
                </button>
              </div>
            )}
          </div>
          <input
            id="fileInput"
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </div>

        {/* Sample Download */}
        <div className="sample-section">
          <div className="sample-info">
            <h4>💡 {t('xrayAnalysis.needSample')}</h4>
            <p>{t('xrayAnalysis.sampleDescription')}</p>
            <button className="btn-download" onClick={downloadSampleXray}>
              📥 {t('xrayAnalysis.downloadSample')}
            </button>
          </div>
        </div>

        {/* Patient Selection */}
        <div className="form-section">
          <label htmlFor="patientSelect">{t('xrayAnalysis.selectPatient')}</label>
          <select
            id="patientSelect"
            value={selectedPatient}
            onChange={(e) => setSelectedPatient(e.target.value)}
            className="form-select"
          >
            <option value="">{t('xrayAnalysis.choosePatient')}</option>
            <option value="patient1">Juan Pérez - ID: 001</option>
            <option value="patient2">María García - ID: 002</option>
            <option value="patient3">Carlos López - ID: 003</option>
          </select>
        </div>

        {/* Analysis Instructions */}
        <div className="form-section">
          <label htmlFor="instructions">{t('xrayAnalysis.instructions')} ({t('xrayAnalysis.optional')})</label>
          <textarea
            id="instructions"
            value={analysisInstructions}
            onChange={(e) => setAnalysisInstructions(e.target.value)}
            placeholder={t('xrayAnalysis.instructionsPlaceholder')}
            className="form-textarea"
            rows="4"
          />
        </div>

        {/* Analysis Button */}
        <div className="analysis-actions">
          <p className="analysis-note">{t('xrayAnalysis.analysisNote')}</p>
          <button
            className="btn-analyze"
            onClick={handleAnalyze}
            disabled={isAnalyzing || !selectedFile || !selectedPatient}
          >
            {isAnalyzing ? (
              <>
                <span className="spinner"></span>
                {t('xrayAnalysis.analyzing')}
              </>
            ) : (
              <>
                🧠 {t('xrayAnalysis.analyzeButton')}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Recent Analysis */}
      {analysisHistory.length > 0 && (
        <div className="recent-analysis">
          <div className="section-header">
            <h2>{t('xrayAnalysis.recentAnalysis')}</h2>
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

export default XRayAnalysis;
