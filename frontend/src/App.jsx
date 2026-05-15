import React, { useState } from 'react';
import { Upload, AlertTriangle, Leaf, LineChart, DollarSign, ArrowRight } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:8000';

function App() {
  const [activeTab, setActiveTab] = useState('disease');
  
  // Shared state across the pipeline
  const [diseaseResult, setDiseaseResult] = useState(null);
  const [yieldResult, setYieldResult] = useState(null);
  const [revenueResult, setRevenueResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Disease Page State
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Yield Page State
  const [yieldForm, setYieldForm] = useState({
    month: 5, rain_mean: 2.0, rain_cumul: 60.0, rain_max: 15.0, rain_days: 5,
    tmax_mean: 35.0, tmax_max: 40.0, tmin_mean: 25.0, tmin_min: 20.0,
    temp_delta_mean: 10.0, temp_var: 4.0, humidity_mean: 60.0, humidity_min: 40.0,
    vpd_mean: 1.5, vpd_max: 2.5, variety: 'Banganapalli'
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const predictDisease = async () => {
    if (!image) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', image);
    try {
      const res = await axios.post(`${API_BASE}/predict/disease`, formData);
      setDiseaseResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Error predicting disease");
    }
    setLoading(false);
  };

  const predictYield = async () => {
    setLoading(true);
    try {
      const payload = { ...yieldForm, disease_severity: diseaseResult?.severity || 0.0 };
      const res = await axios.post(`${API_BASE}/predict/yield`, payload);
      setYieldResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Error predicting yield");
    }
    setLoading(false);
  };

  const predictRevenue = async () => {
    if (!diseaseResult || !yieldResult) return;
    setLoading(true);
    try {
      const payload = {
        disease: diseaseResult.disease,
        severity: diseaseResult.severity,
        yield_predicted: yieldResult.yield_t_ha,
        variety: yieldForm.variety,
        season: 'peak',
        hectares: 1.0
      };
      const res = await axios.post(`${API_BASE}/predict/revenue`, payload);
      setRevenueResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Error predicting revenue");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <nav className="bg-green-700 text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold flex items-center gap-2">
            <Leaf /> MangoDL
          </div>
          <div className="flex gap-4">
            <button onClick={() => setActiveTab('disease')} className={`px-4 py-2 rounded ${activeTab === 'disease' ? 'bg-green-800' : 'hover:bg-green-600'}`}>1. Disease</button>
            <button onClick={() => setActiveTab('yield')} className={`px-4 py-2 rounded ${activeTab === 'yield' ? 'bg-green-800' : 'hover:bg-green-600'}`}>2. Yield</button>
            <button onClick={() => setActiveTab('revenue')} className={`px-4 py-2 rounded ${activeTab === 'revenue' ? 'bg-green-800' : 'hover:bg-green-600'}`}>3. Revenue</button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 mt-6">
        {/* TAB 1: DISEASE */}
        {activeTab === 'disease' && (
          <div className="bg-white p-8 rounded-xl shadow-sm border">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-2"><Leaf className="text-green-600"/> Disease Detection</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50 relative h-80">
                {imagePreview ? (
                  <img src={imagePreview} className="absolute inset-0 w-full h-full object-cover rounded-xl opacity-50" />
                ) : (
                  <Upload className="w-12 h-12 text-gray-400 mb-4" />
                )}
                <input type="file" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*"/>
                <p className="text-gray-500 font-medium z-10">{imagePreview ? 'Click to change image' : 'Drag & drop leaf image or click to upload'}</p>
              </div>
              
              <div className="flex flex-col justify-center">
                <button onClick={predictDisease} disabled={!image || loading} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-lg shadow-md transition disabled:opacity-50">
                  {loading ? 'Analyzing...' : 'Analyze Leaf'}
                </button>

                {diseaseResult && (
                  <div className="mt-8 p-6 bg-green-50 rounded-lg border border-green-200">
                    <h3 className="text-xl font-semibold mb-4">Results</h3>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Detected Disease:</span>
                      <span className="font-bold text-lg">{diseaseResult.disease}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Confidence:</span>
                      <span className="font-bold text-green-700">{(diseaseResult.confidence * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-600">Severity Score (0-3):</span>
                      <span className="font-bold text-orange-600">{diseaseResult.severity.toFixed(2)}</span>
                    </div>
                    <div className="mt-4">
                      <span className="text-gray-600 block mb-2">Grad-CAM Heatmap:</span>
                      <img src={`data:image/jpeg;base64,${diseaseResult.heatmap_b64}`} className="rounded-lg shadow w-full max-h-48 object-contain bg-black" />
                    </div>
                    <button onClick={() => setActiveTab('yield')} className="mt-6 w-full flex items-center justify-center gap-2 text-green-700 font-semibold hover:underline">
                      Continue to Yield Forecast <ArrowRight size={18} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: YIELD */}
        {activeTab === 'yield' && (
          <div className="bg-white p-8 rounded-xl shadow-sm border">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-2"><LineChart className="text-blue-600"/> Yield Forecast</h2>
            
            {diseaseResult ? (
              <div className="mb-6 p-4 bg-blue-50 text-blue-800 rounded flex gap-2 items-start">
                <AlertTriangle className="shrink-0 mt-1"/>
                <div>
                  <p className="font-semibold">Disease Context Injected</p>
                  <p className="text-sm">Using detected severity <b>{diseaseResult.severity.toFixed(2)}</b> ({diseaseResult.disease}) as a novel feature for yield prediction.</p>
                </div>
              </div>
            ) : (
              <div className="mb-6 p-4 bg-yellow-50 text-yellow-800 rounded flex gap-2 items-start">
                <AlertTriangle className="shrink-0 mt-1"/>
                <p>No disease data. Using default severity (0.0 - Healthy).</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold mb-4">Climate & Farm Inputs</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Variety</label>
                    <select className="w-full border rounded p-2" value={yieldForm.variety} onChange={(e)=>setYieldForm({...yieldForm, variety: e.target.value})}>
                      <option>Banganapalli</option>
                      <option>Raspuri</option>
                      <option>Totapuri</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Month</label>
                    <input type="number" className="w-full border rounded p-2" value={yieldForm.month} onChange={(e)=>setYieldForm({...yieldForm, month: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Avg Tmax (°C)</label>
                    <input type="number" className="w-full border rounded p-2" value={yieldForm.tmax_mean} onChange={(e)=>setYieldForm({...yieldForm, tmax_mean: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Avg Rain (mm)</label>
                    <input type="number" className="w-full border rounded p-2" value={yieldForm.rain_mean} onChange={(e)=>setYieldForm({...yieldForm, rain_mean: e.target.value})} />
                  </div>
                </div>
                <button onClick={predictYield} disabled={loading} className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 w-full rounded-lg text-lg shadow transition disabled:opacity-50">
                  {loading ? 'Forecasting...' : 'Forecast Yield'}
                </button>
              </div>

              <div>
                {yieldResult && (
                  <div className="p-6 bg-blue-50 rounded-lg border border-blue-200 h-full flex flex-col justify-center">
                    <h3 className="text-xl font-semibold mb-2">Predicted Yield</h3>
                    <div className="text-5xl font-extrabold text-blue-700 mb-2">{yieldResult.yield_t_ha.toFixed(2)} <span className="text-2xl text-blue-500">t/ha</span></div>
                    <p className="text-gray-600 text-sm mb-6">Based on Phase 4 Optuna XGBoost model.</p>
                    
                    <h4 className="font-bold text-sm text-gray-500 uppercase tracking-wide mb-3">Top SHAP Influencers</h4>
                    <div className="space-y-2">
                      {Object.entries(yieldResult.shap_values)
                        .sort(([,a], [,b]) => Math.abs(b) - Math.abs(a))
                        .slice(0, 4)
                        .map(([feature, val]) => (
                          <div key={feature} className="flex justify-between text-sm">
                            <span className="text-gray-700">{feature.replace('var_', '')}</span>
                            <span className={`font-mono ${val > 0 ? 'text-green-600' : 'text-red-600'}`}>{val > 0 ? '+' : ''}{val.toFixed(2)}</span>
                          </div>
                      ))}
                    </div>

                    {diseaseResult && (
                      <button onClick={() => setActiveTab('revenue')} className="mt-8 w-full flex items-center justify-center gap-2 text-blue-700 font-semibold hover:underline">
                        Calculate Economics <ArrowRight size={18} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: REVENUE */}
        {activeTab === 'revenue' && (
          <div className="bg-white p-8 rounded-xl shadow-sm border">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-2"><DollarSign className="text-emerald-600"/> Revenue Dashboard</h2>
            
            {(!diseaseResult || !yieldResult) ? (
              <div className="p-8 text-center text-gray-500">
                Please complete Disease Detection and Yield Forecast first.
              </div>
            ) : (
              <div>
                {!revenueResult ? (
                  <button onClick={predictRevenue} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-lg text-lg shadow transition w-full md:w-auto">
                    {loading ? 'Calculating...' : 'Generate Economic Report'}
                  </button>
                ) : (
                  <div className="space-y-8">
                    {revenueResult.quality_grade === 'C' || revenueResult.quality_grade === 'D' ? (
                      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded text-red-800">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="mt-0.5 shrink-0"/>
                          <div>
                            <h4 className="font-bold">High Severity Alert</h4>
                            <p className="text-sm">Disease severity ({revenueResult.disease}) has degraded quality to Grade {revenueResult.quality_grade}. Local market sale not recommended.</p>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                        <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-1">Final Yield</p>
                        <p className="text-3xl font-bold text-gray-900">{revenueResult.yield_after_loss.toFixed(2)} t/ha</p>
                        <p className="text-sm text-red-500 mt-1">Loss: {((1 - revenueResult.yield_after_loss / yieldResult.yield_t_ha)*100).toFixed(1)}%</p>
                      </div>
                      <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-200">
                        <p className="text-emerald-700 text-sm font-semibold uppercase tracking-wider mb-1">Net Profit (Market)</p>
                        <p className="text-3xl font-bold text-emerald-900">₹{revenueResult.net_revenue_market.toLocaleString(undefined, {maximumFractionDigits:0})}</p>
                      </div>
                      <div className="bg-orange-50 p-6 rounded-xl border border-orange-200">
                        <p className="text-orange-700 text-sm font-semibold uppercase tracking-wider mb-1">Net Profit (Pulp)</p>
                        <p className="text-3xl font-bold text-orange-900">₹{revenueResult.net_revenue_pulp.toLocaleString(undefined, {maximumFractionDigits:0})}</p>
                      </div>
                    </div>

                    <div className="bg-white border rounded-xl overflow-hidden">
                      <div className="bg-gray-100 px-6 py-4 border-b font-bold text-gray-800">Action Plan</div>
                      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <h4 className="text-sm text-gray-500 font-bold uppercase mb-2">Sales Recommendation</h4>
                          <div className="text-2xl font-bold text-indigo-700 capitalize flex items-center gap-2">
                            <ArrowRight className="text-indigo-400"/> Sell to {revenueResult.recommendation}
                          </div>
                          <p className="text-gray-600 mt-2 text-sm">Based on Grade {revenueResult.quality_grade} economics and current APMC prices for {yieldForm.variety}.</p>
                        </div>
                        <div>
                          <h4 className="text-sm text-gray-500 font-bold uppercase mb-2">Treatment Required</h4>
                          <div className="bg-gray-50 p-4 rounded border text-sm">
                            <p><strong>Chemical:</strong> {revenueResult.treatment.chemical}</p>
                            <p><strong>Dosage:</strong> {revenueResult.treatment.dosage}</p>
                            <p><strong>Rounds:</strong> {revenueResult.treatment.spray_rounds}</p>
                            <p><strong>Total Cost:</strong> ₹{revenueResult.total_cost.toLocaleString(undefined, {maximumFractionDigits:0})}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
