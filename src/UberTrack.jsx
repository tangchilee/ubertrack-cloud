import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { 
  Plus, Calendar, Settings, Bike, Trash2, Wallet, Activity, X, 
  CloudLightning, RefreshCw, DownloadCloud, ChevronLeft, ChevronRight, 
  BarChart3, PieChart, Clock, TrendingUp, ArrowLeft, Home, DollarSign, List, Grid3X3, LineChart, Sun, CloudSun, Palmtree, Hourglass, Edit2, AlertCircle,
  LogOut, User, Lock, Mail, UploadCloud, Info, BookOpen, KeyRound
} from 'lucide-react';

// Firebase Imports
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  writeBatch 
} from 'firebase/firestore';

// ==========================================
// 1. CONFIGURATION (FIREBASE)
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyBSf1K4cQU8q_HRsgKd8eliHxPJtUJmvkk",
  authDomain: "ubertrack-app.firebaseapp.com",
  projectId: "ubertrack-app",
  storageBucket: "ubertrack-app.firebasestorage.app",
  messagingSenderId: "379241410370",
  appId: "1:379241410370:web:aa62471ab3f39f2e05e2db",
  measurementId: "G-VCC74J402E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ==========================================
// 2. UTILITY FUNCTIONS
// ==========================================
const getLocalDateString = (dateInput) => {
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return ""; 
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (e) { return ""; }
};

const getWeekNumber = (d) => {
    try {
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    } catch (e) { return 0; }
};

const formatDuration = (decimalHours) => {
    if (typeof decimalHours !== 'number' || isNaN(decimalHours)) return "0分";
    const hrs = Math.floor(decimalHours);
    const mins = Math.round((decimalHours - hrs) * 60);
    if (hrs === 0 && mins === 0) return "0分";
    if (hrs === 0) return `${mins}分`;
    if (mins === 0) return `${hrs}小時`;
    return `${hrs}小時${mins}分`;
};

const formatCurrency = (amount) => {
    const val = parseFloat(amount);
    if (isNaN(val)) return "$0";
    return new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', minimumFractionDigits: 0 }).format(val);
};

const formatCurrencyShort = (amount) => {
    const val = parseFloat(amount);
    if (isNaN(val)) return "0";
    if (val >= 10000) {
        return (val / 10000).toFixed(1) + "萬";
    }
    return new Intl.NumberFormat('zh-TW').format(val);
};

const formatNumber = (num) => {
    const val = parseFloat(num);
    if (isNaN(val)) return "0";
    return new Intl.NumberFormat('zh-TW').format(val);
};

const formatDecimal = (num) => {
    const val = parseFloat(num);
    if (isNaN(val)) return "0.0";
    return new Intl.NumberFormat('zh-TW', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(val);
};

const formatDateShort = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return "";
    const parts = dateStr.split('-');
    if (parts.length < 3) return dateStr;
    return `${parseInt(parts[1])}/${parseInt(parts[2])}`;
};

const getSmartValue = (item, keys) => {
    for (const key of keys) {
        if (item[key] !== undefined && item[key] !== null && item[key] !== "") {
            return item[key];
        }
    }
    return 0;
};

const getSmartString = (item, keys) => {
    for (const key of keys) {
        if (item[key] !== undefined && item[key] !== null) {
            return item[key];
        }
    }
    return "";
};

// ==========================================
// 3. SUB-COMPONENTS
// ==========================================

// Modified SimpleBarChart to handle clicks
const SimpleBarChart = ({ data, valueKey, color, valueFormatter, height = "h-40", showLabel = true, onBarClick }) => {
    const maxValue = Math.max(...data.map(d => d[valueKey] || 0), 1) * 1.15; 
    return (
        <div className={`relative ${height} flex items-end justify-between gap-0.5 sm:gap-2 px-0 sm:px-2 mt-4 overflow-hidden`}>
             <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-30">
                  {[...Array(4)].map((_, i) => <div key={i} className="border-t border-gray-200 w-full h-px"></div>)}
             </div>
             {data.map((d, i) => {
                 const val = d[valueKey] || 0;
                 const barHeight = (val / (maxValue || 1)) * 100; 
                 return (
                     <div 
                        key={i} 
                        className="flex flex-col items-center flex-1 min-w-0 h-full justify-end group relative z-10 cursor-pointer"
                        onClick={() => onBarClick && onBarClick(d)}
                     >
                         {val > 0 && showLabel && (
                             <span className="text-[8px] sm:text-[10px] font-bold text-gray-600 mb-1 transition-all transform group-hover:scale-110 whitespace-nowrap">
                                {valueFormatter ? valueFormatter(val) : formatNumber(val)}
                             </span>
                         )}
                         <div 
                            className={`w-full max-w-[24px] rounded-t-md opacity-90 ${color} transition-all duration-200 group-hover:opacity-100 group-hover:scale-y-105 origin-bottom`} 
                            style={{ height: `${Math.max(barHeight, 1)}%` }}
                         ></div>
                         <span className="text-[8px] sm:text-[10px] text-gray-400 mt-1 font-medium truncate w-full text-center">{d.label}</span>
                     </div>
                 )
             })}
        </div>
    );
};

// ... ComboChart and MonthStatsCard remain largely the same ...
const ComboChart = ({ title, data, barKey, lineKey, barColor, lineColor, barLabel, lineLabel, isCurrency = false, barTextColor, barValueFormatter }) => {
    const maxBar = Math.max(...data.map(d => d[barKey] || 0), 1) * 1.2; 
    const maxLine = Math.max(...data.map(d => d[lineKey] || 0), 1) * 1.2;

    const points = data.length > 1 ? data.map((d, i) => {
        const val = d[lineKey] || 0;
        const x = ((i + 0.5) / data.length) * 100; 
        const y = 100 - (((val / (maxLine || 1)) * 75) + 25); 
        return `${x},${y}`;
    }).join(' ') : "";

    return (
        <div className="bg-white rounded-3xl border border-gray-200 p-5 shadow-sm relative">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold text-gray-800">{title}</h3>
                <div className="flex gap-3 text-[10px]">
                    <div className="flex items-center gap-1"><div className={`w-2 h-2 rounded-full ${barColor}`}></div><span>{barLabel}</span></div>
                    <div className="flex items-center gap-1"><div className={`w-2 h-2 rounded-full ${lineColor.replace('text-', 'bg-')}`}></div><span>{lineLabel}</span></div>
                </div>
            </div>
            <div className="h-48 relative">
                <div className="absolute inset-0 flex items-end justify-between z-10 px-1 sm:px-2 gap-0.5 sm:gap-2">
                     {data.map((d, i) => {
                         const val = d[barKey] || 0;
                         const barHeight = (val / (maxBar || 1)) * 100;
                         const isTall = barHeight > 15; 
                         return (
                             <div key={i} className="flex flex-col items-center flex-1 min-w-0 h-full justify-end group relative">
                                 {val > 0 && (
                                     <span 
                                        className={`text-[8px] sm:text-[9px] font-bold absolute z-20 transition-all whitespace-nowrap
                                            ${isTall ? 'bottom-auto top-1' : 'bottom-full mb-0.5'}
                                            ${barTextColor || (isTall ? 'text-white' : 'text-gray-500')}
                                        `}
                                        style={isTall ? { bottom: 'auto', top: `${100 - barHeight}%`, paddingTop: '2px' } : {}}
                                     >
                                        {barValueFormatter ? barValueFormatter(val) : (isCurrency ? `$${formatNumber(val)}` : formatNumber(val))}
                                     </span>
                                 )}
                                 <div 
                                    className={`w-full max-w-[20px] rounded-t-sm opacity-80 ${barColor} transition-all duration-500`} 
                                    style={{ height: `${Math.max(barHeight, 1)}%` }}
                                 ></div>
                                 <span className="text-[8px] sm:text-[10px] text-gray-400 mt-1 font-medium w-full text-center truncate">{d.label}</span>
                             </div>
                         )
                     })}
                </div>
                <div className="absolute inset-0 z-30 px-1 sm:px-2 pointer-events-none mb-5">
                    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                        <polyline fill="none" stroke="currentColor" strokeWidth="2" points={points} vectorEffect="non-scaling-stroke" className={`${lineColor}`} />
                    </svg>
                    {data.map((d, i) => {
                        const val = d[lineKey] || 0;
                        if (val === 0) return null;
                        const left = ((i + 0.5) / data.length) * 100; 
                        const bottom = ((val / (maxLine || 1)) * 75) + 25;
                        return (
                            <div key={i} className="absolute flex flex-col items-center" style={{ left: `${left}%`, bottom: `${bottom}%`, transform: 'translate(-50%, 50%)' }}>
                                <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full border-2 border-white shadow-sm ${lineColor.replace('text-', 'bg-')}`}></div>
                                <span className={`text-[8px] sm:text-[9px] font-bold mb-1 absolute bottom-2 bg-white/90 px-1 rounded shadow-sm whitespace-nowrap ${lineColor}`}>
                                    {formatDecimal(val)}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

const MonthStatsCard = ({ data, workDays }) => {
    if (!data) return null;
    const { totalIncome, tripCount, totalHours, hourlyWage, avgNetTripCost, avgGrossTripCost, month } = data;
    
    return (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl p-5 shadow-md text-white mb-2 relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4"><DollarSign size={100} /></div>
            <div className="relative z-10">
                <div className="text-emerald-100 text-xs font-bold mb-1 uppercase tracking-wider flex items-center gap-1"><Calendar size={12} /> 本月 ({month}月) 累積收入</div>
                <div className="text-3xl font-black tracking-tight">{formatCurrency(totalIncome)}</div>
                <div className="flex gap-3 mt-2 text-xs font-medium text-emerald-50 border-b border-emerald-400/30 pb-3 mb-3">
                    <span>{tripCount} 單</span><span>•</span><span>{formatDecimal(totalHours)} h</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center mb-3">
                    <div className="bg-emerald-50 rounded-lg p-2 backdrop-blur-sm text-gray-800">
                        <div className="text-[10px] text-gray-500 mb-0.5 font-bold">平均時薪</div>
                        <div className="text-sm font-extrabold">${formatNumber(hourlyWage ? hourlyWage.toFixed(1) : 0)}</div>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-2 backdrop-blur-sm text-gray-800">
                        <div className="text-[10px] text-gray-500 mb-0.5 font-bold">淨行程</div>
                        <div className="text-sm font-extrabold">${formatDecimal(avgNetTripCost)}</div>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-2 backdrop-blur-sm text-gray-800">
                        <div className="text-[10px] text-gray-500 mb-0.5 font-bold">含獎勵</div>
                        <div className="text-sm font-extrabold">${formatDecimal(avgGrossTripCost)}</div>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-emerald-400/30">
                    <div className="bg-emerald-50 rounded-lg p-2 flex flex-col items-center justify-center text-gray-800">
                        <span className="text-[10px] text-gray-500 font-bold mb-0.5">整天</span>
                        <div className="flex items-center gap-1"><Sun size={12} className="text-orange-500" /><span className="text-sm font-extrabold">{workDays.fullDays}天</span></div>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-2 flex flex-col items-center justify-center text-gray-800">
                        <span className="text-[10px] text-gray-500 font-bold mb-0.5">半天</span>
                        <div className="flex items-center gap-1"><CloudSun size={12} className="text-blue-500" /><span className="text-sm font-extrabold">{workDays.halfDays}天</span></div>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-2 flex flex-col items-center justify-center text-gray-800">
                        <span className="text-[10px] text-gray-500 font-bold mb-0.5">休假</span>
                        <div className="flex items-center gap-1"><Palmtree size={12} className="text-gray-400" /><span className="text-sm font-extrabold">{workDays.offDays}天</span></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ==========================================
// 4. VIEW COMPONENTS
// ==========================================

const OverviewStats = memo(({ annualStats, todayStats, onEditToday }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-5 text-gray-900"><Wallet size={56} /></div>
          <div className="text-xs text-gray-500 font-bold mb-1 tracking-wide">{annualStats.year}年 總收入</div>
          <div className="text-2xl font-extrabold text-gray-900 tracking-tight">{formatCurrency(annualStats.totalIncome)}</div>
      </div>
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-5 text-gray-900"><Bike size={56} /></div>
          <div className="text-xs text-gray-500 font-bold mb-1 tracking-wide">{annualStats.year}年 總單量</div>
          <div className="text-2xl font-extrabold text-gray-900 tracking-tight">{formatNumber(annualStats.totalTrips)} 單</div>
      </div>
    </div>
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-center items-center"><div className="text-xs text-gray-500 font-bold mb-1">平均時薪</div><div className="text-xl font-extrabold text-emerald-600">${formatNumber(annualStats.avgHourly.toFixed(1))}</div></div>
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-center items-center"><div className="text-xs text-gray-500 font-bold mb-1">每趟淨行程</div><div className="text-xl font-extrabold text-gray-900">${formatDecimal(annualStats.avgNetTrip)}</div></div>
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-center items-center"><div className="text-xs text-gray-500 font-bold mb-1">含獎勵均價</div><div className="text-xl font-extrabold text-emerald-600">${formatDecimal(annualStats.avgGrossTrip)}</div></div>
    </div>
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm relative">
      <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2"><div className="bg-emerald-100 text-emerald-600 p-1.5 rounded-lg"><Calendar size={18} /></div><span className="font-bold text-gray-900 text-lg">今日戰績</span></div>
          <div className="flex items-center gap-2"><span className="text-sm text-gray-500 font-medium">{new Date().toLocaleDateString('zh-TW')}</span>{todayStats.hasRecord && (<button onClick={onEditToday} className="p-1.5 bg-gray-100 text-gray-500 rounded-full hover:bg-emerald-100 hover:text-emerald-600 transition-colors"><Edit2 size={14} /></button>)}</div>
      </div>
      {todayStats.hasRecord ? (
        <div className="flex items-end gap-2"><span className="text-5xl font-black text-gray-900 tracking-tighter">{formatCurrency(todayStats.income)}</span><div className="text-sm text-gray-500 mb-2 font-medium flex gap-2"><span className="bg-gray-100 px-2 py-0.5 rounded-md">{todayStats.trips} 單</span><span className="bg-gray-100 px-2 py-0.5 rounded-md">{formatDuration(todayStats.time)}</span></div></div>
      ) : ( <div className="text-gray-400 text-base py-2">今天還沒開始跑單嗎？加油！💪</div> )}
    </div>
  </div>
));

const WeeklyView = memo(({ weeklyStats, handleWeekChange, fetchError, recordsLength }) => {
  const [selectedDayRecord, setSelectedDayRecord] = useState(null);

  useEffect(() => {
      setSelectedDayRecord(null);
  }, [weeklyStats.startStr]);

  const displayStats = useMemo(() => {
      if (selectedDayRecord && selectedDayRecord.originalRecord) {
          const r = selectedDayRecord.originalRecord;
          const tripCost = r.tripCost || 0;
          const promo = r.promo || 0;
          const tripCount = r.tripCount || 0;
          
          return {
              isDaily: true,
              dateLabel: `${selectedDayRecord.date} (${selectedDayRecord.dayLabel})`,
              breakdown: {
                  tripCost: tripCost,
                  promo: promo,
                  tips: r.tips || 0,
                  other: r.other || 0
              },
              totalHours: r.totalHoursDec || 0,
              totalTrips: tripCount,
              hourlyWage: r.hourlyWage || 0,
              avgNetTripCost: tripCount > 0 ? tripCost / tripCount : 0,
              avgGrossTripCost: tripCount > 0 ? (tripCost + promo) / tripCount : 0
          };
      } else if (selectedDayRecord && !selectedDayRecord.originalRecord) {
          return {
              isDaily: true,
              dateLabel: `${selectedDayRecord.date} (${selectedDayRecord.dayLabel})`,
              breakdown: { tripCost: 0, promo: 0, tips: 0, other: 0 },
              totalHours: 0,
              totalTrips: 0,
              hourlyWage: 0,
              avgNetTripCost: 0,
              avgGrossTripCost: 0
          };
      } else {
          return {
              isDaily: false,
              dateLabel: "全週合計",
              breakdown: weeklyStats.breakdown,
              totalHours: weeklyStats.totalHours,
              totalTrips: weeklyStats.totalTrips,
              hourlyWage: weeklyStats.weeklyHourlyWage,
              avgNetTripCost: weeklyStats.avgNetTripCost,
              avgGrossTripCost: weeklyStats.avgGrossTripCost
          };
      }
  }, [selectedDayRecord, weeklyStats]);

  const handleBarClick = (day) => {
      if (selectedDayRecord && selectedDayRecord.date === day.date) {
          setSelectedDayRecord(null); // 取消選擇
      } else {
          setSelectedDayRecord(day); // 選擇新日期
      }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="bg-white rounded-3xl border border-gray-200 p-4 sm:p-6 shadow-sm space-y-6 relative">
            <div className="flex items-center justify-between">
                <button onClick={() => handleWeekChange(-1)} className="p-2.5 bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded-full transition-colors"><ChevronLeft size={22} /></button>
                <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-1"><span className="text-sm text-gray-500 font-bold uppercase tracking-wide">第{weeklyStats.weekNumber}週收入</span></div>
                    <div className="text-2xl font-black text-gray-900 flex items-center gap-2">{formatCurrency(weeklyStats.totalIncome)}</div>
                    <span className="text-xs text-gray-400 mt-1 font-medium bg-gray-50 px-2 py-0.5 rounded">{formatDateShort(weeklyStats.startStr)} - {formatDateShort(weeklyStats.endStr)}</span>
                </div>
                <button onClick={() => handleWeekChange(1)} className="p-2.5 bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded-full transition-colors"><ChevronRight size={22} /></button>
            </div>
            
            <div className="relative">
              <div className="h-44 flex items-end justify-between gap-1 sm:gap-2 px-0 sm:px-1 relative">
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-50">{[...Array(4)].map((_, i) => <div key={i} className="border-t border-gray-100 w-full h-px"></div>)}</div>
                  {weeklyStats.dailyData.map((day, index) => {
                      const heightPct = weeklyStats.maxDailyIncome > 0 ? (day.income / weeklyStats.maxDailyIncome) * 100 : 0;
                      const isSelected = selectedDayRecord && selectedDayRecord.date === day.date;
                      
                      return (
                          <div 
                            key={index} 
                            className="flex flex-col items-center gap-1 sm:gap-2 flex-1 min-w-0 group z-10 h-full justify-end cursor-pointer"
                            onClick={() => handleBarClick(day)}
                          >
                            <div className="relative w-full flex justify-end flex-col items-center h-[85%]">
                                {day.income > 0 && <div className="mb-1 text-[10px] text-gray-600 font-bold bg-white shadow-sm px-1.5 py-0.5 rounded border border-gray-200 transform -translate-y-1 hidden sm:block">${formatNumber(day.income)}</div>}
                                <div 
                                    className={`w-full sm:w-10 rounded-t-lg transition-all duration-300
                                        ${isSelected ? 'ring-4 ring-emerald-200 translate-y-[-4px]' : ''}
                                        ${day.isToday ? 'bg-emerald-500 shadow-md' : (day.income > 0 ? 'bg-emerald-400 group-hover:bg-emerald-300' : 'bg-gray-100 group-hover:bg-gray-200')}
                                    `} 
                                    style={{ height: `${Math.max(heightPct, 4)}%` }}
                                ></div>
                            </div>
                            <span className={`text-[10px] sm:text-xs h-[15px] font-bold ${day.isToday || isSelected ? 'text-emerald-600' : 'text-gray-400'}`}>{day.dayLabel}</span>
                          </div>
                      )
                  })}
              </div>
            </div>

            <div className="space-y-3 pt-2">
                <div className="flex justify-between items-end">
                    <h3 className="text-sm font-bold text-gray-900 ml-1">收入明細</h3>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${displayStats.isDaily ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                        {displayStats.dateLabel}
                    </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100 flex flex-col justify-center"><div className="text-xs text-gray-500 mb-1 font-bold">行程</div><div className="text-lg font-black text-gray-900">${formatCurrencyShort(displayStats.breakdown.tripCost)}</div></div>
                    <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-100 flex flex-col justify-center"><div className="text-xs text-emerald-600 mb-1 font-bold">獎勵</div><div className="text-lg font-black text-emerald-600">${formatCurrencyShort(displayStats.breakdown.promo)}</div></div>
                    <div className="bg-yellow-50 rounded-xl p-3 text-center border border-yellow-100 flex flex-col justify-center"><div className="text-xs text-yellow-600 mb-1 font-bold">小費</div><div className="text-lg font-black text-yellow-600">${formatCurrencyShort(displayStats.breakdown.tips)}</div></div>
                    <div className="bg-purple-50 rounded-xl p-3 text-center border border-purple-100 flex flex-col justify-center"><div className="text-xs text-purple-600 mb-1 font-bold">其他</div><div className="text-lg font-black text-purple-600">${formatCurrencyShort(displayStats.breakdown.other)}</div></div>
                </div>

                <h3 className="text-sm font-bold text-gray-900 ml-1 mt-2">效率分析</h3>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                      <div className="bg-gray-50 p-2 sm:p-3 rounded-xl text-center border border-gray-100"><div className="text-[10px] sm:text-xs text-gray-500 mb-1 flex items-center justify-center gap-1 font-medium"><Clock size={12}/> 總工時</div><div className="text-base sm:text-lg font-extrabold text-gray-900">{formatDecimal(displayStats.totalHours)}<span className="text-[10px] sm:text-xs font-normal text-gray-400 ml-0.5">h</span></div></div>
                      <div className="bg-gray-50 p-2 sm:p-3 rounded-xl text-center border border-gray-100"><div className="text-[10px] sm:text-xs text-gray-500 mb-1 flex items-center justify-center gap-1 font-medium"><Bike size={12}/> 總單量</div><div className="text-base sm:text-lg font-extrabold text-gray-900">{displayStats.totalTrips}</div></div>
                      <div className="bg-emerald-50 p-2 sm:p-3 rounded-xl text-center border border-emerald-100"><div className="text-[10px] sm:text-xs text-emerald-700 mb-1 flex items-center justify-center gap-1 font-medium"><Activity size={12}/> {displayStats.isDaily ? '當日時薪' : '當週時薪'}</div><div className="text-base sm:text-lg font-extrabold text-emerald-600">${formatDecimal(displayStats.hourlyWage)}</div></div>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <div className="bg-white p-2 sm:p-3 rounded-xl flex justify-between items-center px-3 sm:px-4 border border-gray-200 shadow-sm"><div className="text-[10px] sm:text-xs text-gray-500 font-medium">每趟<br/>淨行程</div><div className="text-base sm:text-xl font-extrabold text-gray-900">${formatDecimal(displayStats.avgNetTripCost)}</div></div>
                      <div className="bg-white p-2 sm:p-3 rounded-xl flex justify-between items-center px-3 sm:px-4 border border-gray-200 shadow-sm"><div className="text-[10px] sm:text-xs text-gray-500 flex flex-col font-medium"><span className="flex items-center gap-1 text-emerald-600"><TrendingUp size={12}/> 含獎勵</span><span>每趟平均</span></div><div className="text-base sm:text-xl font-extrabold text-emerald-600">${formatDecimal(displayStats.avgGrossTripCost)}</div></div>
                </div>
            </div>
        </div>
    </div>
  );
});

const MonthlyView = memo(({ 
  selectedMonth, setSelectedMonth, currentYearView, setCurrentYearView, monthlyDataMap, currentSelectedMonthData, currentMonthStats, calculateWorkDays,
  handleEdit, handleDelete // Props for edit/delete
}) => {
    const [isDetailListView, setIsDetailListView] = useState(false);
    
    const targetData = useMemo(() => {
        const data = selectedMonth ? currentSelectedMonthData : currentMonthStats;
        if (!data) return null;
        
        if (!selectedMonth) {
            const hourlyWage = data.totalHours > 0 ? data.totalIncome / data.totalHours : 0;
            const avgNetTripCost = data.tripCount > 0 ? data.tripCost / data.tripCount : 0;
            const avgGrossTripCost = data.tripCount > 0 ? (data.tripCost + data.promo) / data.tripCount : 0;
            return { ...data, hourlyWage, avgNetTripCost, avgGrossTripCost };
        }
        return data;
    }, [selectedMonth, currentSelectedMonthData, currentMonthStats]);

    const monthWorkDays = useMemo(() => {
        return calculateWorkDays(targetData);
    }, [targetData, calculateWorkDays]);

    const handleMonthNavigate = (direction) => {
        if (!selectedMonth) return;
        const [y, m] = selectedMonth.split('-').map(Number);
        const newDate = new Date(y, m - 1 + direction, 1);
        const newKey = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}`;
        setSelectedMonth(newKey);
    };

    const calendarDays = useMemo(() => {
        if (!targetData) return [];
        const { year, month, records = [] } = targetData;
        const daysInMonth = new Date(year, month, 0).getDate();
        const firstDayObj = new Date(year, month - 1, 1);
        let startDay = firstDayObj.getDay(); 
        let offset = startDay === 0 ? 6 : startDay - 1;
        const days = [];
        for(let i=0; i<offset; i++) days.push(null);
        for(let i=1; i<=daysInMonth; i++) {
            const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
            const record = records.find(r => getLocalDateString(r.date) === dateStr);
            days.push({ day: i, record });
        }
        return days;
    }, [targetData]);

    const sortedMonthRecords = useMemo(() => {
        if (!targetData || !targetData.records) return [];
        return [...targetData.records].sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [targetData]);

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300 mt-4">
            {!selectedMonth && (
                <>
                    <MonthStatsCard data={targetData} workDays={monthWorkDays} />
                    <div className="flex items-center justify-between px-2 mb-4">
                        <button onClick={() => setCurrentYearView(prev => prev - 1)} className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500"><ChevronLeft size={20}/></button>
                        <h2 className="text-xl font-black text-gray-900">{currentYearView}年</h2>
                        <button onClick={() => setCurrentYearView(prev => prev + 1)} className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500"><ChevronRight size={20}/></button>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {Array.from({ length: 12 }, (_, i) => {
                            const m = i + 1;
                            const key = `${currentYearView}-${String(m).padStart(2, '0')}`;
                            const data = monthlyDataMap[key];
                            const now = new Date();
                            const isCurrentMonth = currentYearView === now.getFullYear() && m === (now.getMonth() + 1);
                            const hasData = data || isCurrentMonth;
                            return (
                                <button key={m} onClick={() => hasData && setSelectedMonth(key)} disabled={!hasData} className={`p-3 rounded-2xl border flex flex-col items-center justify-between min-h-[90px] transition-all relative overflow-hidden ${hasData ? 'bg-white border-emerald-100 shadow-sm active:scale-95' : 'bg-gray-50 border-gray-100 opacity-60 cursor-default'}`}>
                                    <span className={`text-sm font-bold ${hasData ? 'text-gray-900' : 'text-gray-400'}`}>{m}月</span>
                                    {hasData ? (
                                        <>
                                            <div className="text-emerald-600 font-black text-sm mt-1">{formatCurrencyShort(data ? data.totalIncome : 0)}</div>
                                            <div className="text-[10px] text-gray-500 mt-1 font-medium flex flex-col items-center leading-tight"><span>{data ? data.tripCount : 0}單</span><span>{formatDecimal(data ? data.totalHours : 0)}h</span></div>
                                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-400"></div>
                                        </>
                                    ) : <span className="text-[10px] text-gray-300 mt-2">無紀錄</span>}
                                </button>
                            );
                        })}
                    </div>
                </>
            )}
            {selectedMonth && (
                <div className="animate-in slide-in-from-right duration-300 space-y-6 mt-6">
                    <div className="flex items-center justify-between px-1 mb-2">
                        <div className="flex items-center gap-2">
                            <button onClick={() => setSelectedMonth(null)} className="p-2 bg-white border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50"><ArrowLeft size={20} /></button>
                            <div><h2 className="text-xl font-black text-gray-900">{targetData.year}年 {targetData.month}月</h2><span className="text-xs text-gray-500 font-bold">月報表詳情</span></div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button onClick={() => handleMonthNavigate(-1)} className="p-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"><ChevronLeft size={20}/></button>
                            <button onClick={() => handleMonthNavigate(1)} className="p-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"><ChevronRight size={20}/></button>
                        </div>
                    </div>
                    
                    {/* Details View - White Card */}
                    <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-6 mt-4">
                        <div className="text-center"><div className="text-sm text-gray-500 font-bold mb-1">本月總收入</div><div className="text-4xl font-black text-gray-900">{formatCurrency(targetData.totalIncome)}</div></div>
                        
                        <div className="text-center text-xs font-medium text-gray-500 pb-2">
                             <span>{targetData.tripCount} 單</span> • <span>{formatDecimal(targetData.totalHours)} h</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                            <div className="text-center p-2 rounded-xl bg-gray-50"><div className="text-xs text-gray-500 mb-1 font-medium">行程費用</div><div className="text-base font-bold text-gray-900">${formatNumber(targetData.tripCost)}</div></div>
                            <div className="text-center p-2 rounded-xl bg-emerald-50 border border-emerald-100"><div className="text-xs text-emerald-600 mb-1 font-medium">獎勵</div><div className="text-base font-bold text-emerald-600">${formatNumber(targetData.promo)}</div></div>
                            <div className="text-center p-2 rounded-xl bg-yellow-50 border border-yellow-100"><div className="text-xs text-yellow-600 mb-1 font-medium">小費</div><div className="text-base font-bold text-yellow-600">${formatNumber(targetData.tips)}</div></div>
                            <div className="text-center p-2 rounded-xl bg-purple-50 border border-purple-100"><div className="text-xs text-purple-600 mb-1 font-medium">其他</div><div className="text-base font-bold text-purple-600">${formatNumber(targetData.other)}</div></div>
                        </div>
                        <div className="space-y-3 pt-2">
                            <h3 className="text-base font-bold text-gray-900 ml-1">月效率分析</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white p-4 rounded-xl flex flex-col justify-center items-center border border-gray-200 shadow-sm"><div className="text-xs text-gray-500 font-bold mb-1">平均時薪</div><div className="text-2xl font-extrabold text-emerald-600">${formatNumber(targetData.hourlyWage.toFixed(1))}</div></div>
                                <div className="bg-white p-4 rounded-xl flex flex-col justify-center items-center border border-gray-200 shadow-sm"><div className="text-xs text-gray-500 font-bold mb-1">每小時單量</div><div className="text-2xl font-extrabold text-gray-900">{formatDecimal(targetData.tripsPerHour)}</div></div>
                                <div className="bg-white p-4 rounded-xl flex flex-col justify-center items-center border border-gray-200 shadow-sm"><div className="text-xs text-gray-500 font-bold mb-1">每趟淨行程</div><div className="text-2xl font-extrabold text-gray-900">${formatDecimal(targetData.avgNetTripCost)}</div></div>
                                <div className="bg-white p-4 rounded-xl flex flex-col justify-center items-center border border-gray-200 shadow-sm"><div className="text-xs text-gray-500 font-bold mb-1">含獎勵均價</div><div className="text-2xl font-extrabold text-emerald-600">${formatDecimal(targetData.avgGrossTripCost)}</div></div>
                            </div>
                        </div>
                        
                        <div className="pt-4 border-t border-gray-100">
                            <h4 className="text-sm font-bold text-gray-800 mb-3">當月出勤分析</h4>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="flex flex-col items-center p-2 bg-orange-50 rounded-xl border border-orange-100">
                                    <Sun size={16} className="text-orange-500 mb-1" />
                                    <span className="text-xs text-gray-500 font-bold">整天</span>
                                    <span className="text-base font-black text-orange-600">{monthWorkDays.fullDays}天</span>
                                </div>
                                <div className="flex flex-col items-center p-2 bg-blue-50 rounded-xl border border-blue-100">
                                    <CloudSun size={16} className="text-blue-500 mb-1" />
                                    <span className="text-xs text-gray-500 font-bold">半天</span>
                                    <span className="text-base font-black text-blue-600">{monthWorkDays.halfDays}天</span>
                                </div>
                                <div className="flex flex-col items-center p-2 bg-gray-50 rounded-xl border border-gray-200">
                                    <Palmtree size={16} className="text-gray-400 mb-1" />
                                    <span className="text-xs text-gray-500 font-bold">休假</span>
                                    <span className="text-base font-black text-gray-600">{monthWorkDays.offDays}天</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-3 px-1">
                            <h3 className="text-lg font-bold text-gray-800">每日明細</h3>
                            <button onClick={() => setIsDetailListView(!isDetailListView)} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs font-bold text-gray-600 transition-colors">{isDetailListView ? <Grid3X3 size={14}/> : <List size={14}/>}{isDetailListView ? '切換月曆' : '切換列表'}</button>
                        </div>
                        {!isDetailListView ? (
                            <div className="bg-white rounded-3xl border border-gray-200 p-4 shadow-sm">
                                <div className="grid grid-cols-7 gap-1 mb-2 text-center">{['一','二','三','四','五','六','日'].map(d => <div key={d} className="text-sm text-gray-400 font-bold py-1">{d}</div>)}</div>
                                <div className="grid grid-cols-7 gap-1">
                                    {calendarDays.map((item, idx) => {
                                        if (!item) return <div key={`empty-${idx}`} className="h-14"></div>;
                                        const hasRecord = !!item.record;
                                        const isHighIncome = hasRecord && item.record.totalIncome > 2000; 
                                        return (
                                            <div 
                                                key={`day-${item.day}`} 
                                                className={`h-14 rounded-xl flex flex-col items-center justify-center relative border ${hasRecord ? (isHighIncome ? 'bg-emerald-50 border-emerald-200 cursor-pointer hover:bg-emerald-100' : 'bg-gray-50 border-gray-200 cursor-pointer hover:bg-gray-100') : 'border-transparent'}`}
                                                onClick={() => hasRecord && handleEdit(item.record)}
                                            >
                                                <div className={`text-[10px] font-bold absolute top-0.5 left-1.5 ${hasRecord ? 'text-gray-400' : 'text-gray-300'}`}>{item.day}</div>
                                                {hasRecord && (
                                                    <div className="flex flex-col items-center justify-center w-full leading-none mt-1">
                                                        <span className="text-xs sm:text-sm font-black text-emerald-600 tracking-tight">{formatNumber(item.record.totalIncome)}</span>
                                                        <span className="text-[10px] sm:text-xs text-gray-500 font-bold mt-0.5">{item.record.tripCount}單</span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {sortedMonthRecords.map((record) => (
                                    <div 
                                        key={record.id} 
                                        className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex justify-between items-center cursor-pointer group hover:border-emerald-200 hover:shadow-md transition-all"
                                        onClick={() => handleEdit(record)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="bg-gray-100 text-gray-600 font-bold p-2 rounded-lg text-sm flex flex-col items-center min-w-[50px]"><span>{new Date(record.date).getDate()}日</span></div>
                                            <div><div className="text-lg font-black text-gray-900">{formatCurrency(record.totalIncome)}</div><div className="text-xs text-gray-500 font-medium">{record.tripCount}單 • {formatDuration(record.totalHoursDec)}</div></div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="text-right">
                                                <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full mb-1">時薪 ${formatDecimal(record.hourlyWage)}</div>
                                                <div className="text-[10px] text-gray-400">均單 {formatDecimal(record.tripsPerHour)}</div>
                                            </div>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleDelete(record.id); }} 
                                                className="p-2 bg-gray-50 text-gray-400 rounded-full hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
});

const AnnualView = memo(({ currentYearView, setCurrentYearView, monthlyDataMap, annualStats }) => {
    const [activeTab, setActiveTab] = useState('income');

    const chartData = useMemo(() => {
        return Array.from({ length: 12 }, (_, i) => {
            const m = i + 1;
            const key = `${currentYearView}-${String(m).padStart(2, '0')}`;
            const d = monthlyDataMap[key] || { totalIncome: 0, tripCount: 0, totalHours: 0 };
            const hourlyWage = d.totalHours > 0 ? d.totalIncome / d.totalHours : 0;
            const tripsPerHour = d.totalHours > 0 ? d.tripCount / d.totalHours : 0;
            return {
                label: `${m}月`,
                income: d.totalIncome,
                trips: d.tripCount,
                hours: d.totalHours,
                hourly: hourlyWage,
                tph: tripsPerHour
            };
        });
    }, [currentYearView, monthlyDataMap]);

    const summary = useMemo(() => {
        let tripCost=0, promo=0, tips=0, hours=0, other=0;
        let fullDays = 0, halfDays = 0, offDays = 0;

        const yearRecords = [];
        Object.values(monthlyDataMap).forEach(d => {
            if(d.year === currentYearView) {
                tripCost += d.tripCost;
                promo += d.promo;
                tips += d.tips;
                other += d.other;
                hours += d.totalHours;
                yearRecords.push(...d.records);
            }
        });

        const dailyHours = {};
        yearRecords.forEach(r => {
            const dStr = getLocalDateString(r.date);
            dailyHours[dStr] = (dailyHours[dStr] || 0) + r.totalHoursDec;
        });

        Object.values(dailyHours).forEach(h => {
            if (h <= 1) offDays++;
            else if (h < 4) halfDays++;
            else fullDays++;
        });

        const now = new Date();
        let remainingDays = 0;
        if (currentYearView === now.getFullYear()) {
             const endOfYear = new Date(currentYearView, 11, 31);
             const diffTime = endOfYear - now;
             remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
             if (remainingDays < 0) remainingDays = 0;
        }

        return { tripCost, promo, tips, other, hours, fullDays, halfDays, offDays, remainingDays };
    }, [monthlyDataMap, currentYearView]);

    const mainChartProps = useMemo(() => {
        switch(activeTab) {
            case 'trips': return { valueKey: 'trips', color: 'bg-orange-400', valueFormatter: formatNumber };
            case 'hours': return { valueKey: 'hours', color: 'bg-blue-400', valueFormatter: formatDecimal };
            default: return { valueKey: 'income', color: 'bg-emerald-400', valueFormatter: (v) => `${formatCurrencyShort(v)}` };
        }
    }, [activeTab]);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 mt-4">
            <div className="flex items-center justify-between px-2 mb-4">
                <button onClick={() => setCurrentYearView(prev => prev - 1)} className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500"><ChevronLeft size={20}/></button>
                <h2 className="text-xl font-black text-gray-900">{currentYearView}年 報表</h2>
                <button onClick={() => setCurrentYearView(prev => prev + 1)} className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500"><ChevronRight size={20}/></button>
            </div>
            
            {/* Annual Summary Grid */}
            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-6">
                <h3 className="text-lg font-bold text-gray-800">年度總結算</h3>
                
                <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="bg-gray-50 p-3 rounded-xl text-center border border-gray-100"><div className="text-xs text-gray-500 mb-1 font-bold">行程費用</div><div className="text-sm font-black text-gray-900">${formatNumber(summary.tripCost)}</div></div>
                      <div className="bg-emerald-50 p-3 rounded-xl text-center border border-emerald-100"><div className="text-xs text-emerald-600 mb-1 font-bold">獎勵</div><div className="text-sm font-black text-emerald-600">${formatNumber(summary.promo)}</div></div>
                      <div className="bg-yellow-50 p-3 rounded-xl text-center border border-yellow-100"><div className="text-xs text-yellow-600 mb-1 font-bold">小費</div><div className="text-sm font-black text-yellow-600">${formatNumber(summary.tips)}</div></div>
                      <div className="bg-purple-50 p-3 rounded-xl text-center border border-purple-100"><div className="text-xs text-purple-600 mb-1 font-bold">其他</div><div className="text-sm font-black text-purple-600">${formatNumber(summary.other)}</div></div>
                </div>

                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-4 flex justify-between items-center px-5 shadow-lg text-white">
                    <span className="text-xs font-bold text-emerald-100 uppercase tracking-wider">年度總收入</span>
                    <span className="text-2xl font-black tracking-tight">{formatCurrency(annualStats.totalIncome)}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center"><div className="text-xs text-gray-500 font-bold mb-1">總工時</div><div className="text-xl font-black text-gray-900">{formatDecimal(summary.hours)}h</div></div>
                      <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center"><div className="text-xs text-gray-500 font-bold mb-1">平均時薪</div><div className="text-xl font-black text-emerald-600">${formatNumber(annualStats.avgHourly.toFixed(1))}</div></div>
                      <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center"><div className="text-xs text-gray-500 font-bold mb-1">淨行程均價</div><div className="text-xl font-black text-gray-900">${formatDecimal(annualStats.avgNetTrip)}</div></div>
                      <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center"><div className="text-xs text-gray-500 font-bold mb-1">含獎勵均價</div><div className="text-xl font-black text-emerald-600">${formatDecimal(annualStats.avgGrossTrip)}</div></div>
                </div>

                {/* Work Days Analysis Section */}
                <div className="pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-bold text-gray-800 mb-3">出勤天數分析</h4>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="flex flex-col items-center p-3 bg-orange-50 rounded-xl border border-orange-100">
                             <Sun size={20} className="text-orange-500 mb-1" />
                             <span className="text-xs text-gray-500 font-bold">整天班</span>
                             <span className="text-lg font-black text-orange-600">{summary.fullDays}<span className="text-xs font-normal text-orange-400 ml-0.5">天</span></span>
                        </div>
                        <div className="flex flex-col items-center p-3 bg-blue-50 rounded-xl border border-blue-100">
                             <CloudSun size={20} className="text-blue-500 mb-1" />
                             <span className="text-xs text-gray-500 font-bold">半天班</span>
                             <span className="text-lg font-black text-blue-600">{summary.halfDays}<span className="text-xs font-normal text-blue-400 ml-0.5">天</span></span>
                        </div>
                        <div className="flex flex-col items-center p-3 bg-gray-50 rounded-xl border border-gray-200">
                             <Palmtree size={20} className="text-gray-400 mb-1" />
                             <span className="text-xs text-gray-500 font-bold">休假/輕鬆</span>
                             <span className="text-lg font-black text-gray-600">{summary.offDays}<span className="text-xs font-normal text-gray-400 ml-0.5">天</span></span>
                        </div>
                    </div>
                    {summary.remainingDays > 0 && (
                        <div className="mt-3 bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex items-center justify-center gap-2 text-indigo-600">
                             <Hourglass size={16} />
                             <span className="text-xs font-bold">今年剩餘 <span className="text-base font-black">{summary.remainingDays}</span> 天</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Section 1: Switchable Main Chart */}
            <div className="bg-white rounded-3xl border border-gray-200 p-5 shadow-sm">
                 <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
                     <button onClick={() => setActiveTab('income')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'}`}>每月收入</button>
                     <button onClick={() => setActiveTab('trips')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'trips' ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-500'}`}>總單量</button>
                     <button onClick={() => setActiveTab('hours')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'hours' ? 'bg-white text-blue-500 shadow-sm' : 'text-gray-500'}`}>總時數</button>
                 </div>
                 <h3 className="text-sm font-bold text-gray-800 ml-1 mb-2">
                     {activeTab === 'income' ? '每月總收入' : activeTab === 'trips' ? '每月總單量' : '每月總時數'}
                 </h3>
                 <SimpleBarChart 
                    data={chartData} 
                    valueKey={mainChartProps.valueKey} 
                    color={mainChartProps.color}
                    valueFormatter={mainChartProps.valueFormatter}
                 />
            </div>

            {/* Section 2: Efficiency Charts (Merged) */}
            <ComboChart 
                title="平均時薪 & 每小時單量" 
                data={chartData} 
                barKey="hourly" lineKey="tph" 
                barColor="bg-emerald-400" 
                lineColor="text-orange-500" 
                barLabel="時薪" lineLabel="時均單"
                isCurrency={true} 
                barTextColor="text-gray-900" 
                barValueFormatter={(val) => `$${new Intl.NumberFormat('zh-TW', { maximumFractionDigits: 0 }).format(val)}`} 
            />
        </div>
    );
});

// 5. Recent Record List
const RecentRecordList = memo(({ recentStats, sheetUrl, fetchFromSheet, isLoading, handleDelete, handleEdit }) => (
  <div className="mt-8">
      <div className="flex justify-between items-end mb-4 px-1">
          <div className="flex flex-col">
              <h2 className="text-lg font-bold text-gray-800">最近7天紀錄 (不含今日)</h2>
              <span className="text-xs text-gray-400 font-medium mt-0.5">{formatDateShort(recentStats.startStr)} - {formatDateShort(recentStats.endStr)}</span>
          </div>
          <div className="flex items-center gap-3">
              {sheetUrl && (
                  <button onClick={() => fetchFromSheet()} disabled={isLoading} className="p-2.5 rounded-full bg-white border border-gray-200 text-gray-500 hover:text-emerald-600 active:scale-95 transition-all shadow-sm">
                      {isLoading ? <RefreshCw className="animate-spin w-4 h-4" /> : <DownloadCloud className="w-4 h-4" />}
                  </button>
              )}
              <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full font-medium">
                  {recentStats.recordsLength} 單
              </span>
          </div>
      </div>
      {isLoading && recentStats.recordsLength === 0 ? (
          <div className="space-y-4 animate-pulse">{[1,2,3].map(i => <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>)}</div>
      ) : (
          <div className="space-y-4">
              {recentStats.dailyList.map((dayItem) => {
                  const { dateStr, record } = dayItem;
                  const dateObj = new Date(dateStr);

                  // 4. 修正：若無資料，顯示 $0 的標準卡片，而非「未出勤」
                  const displayRecord = record || { 
                      totalIncome: 0, hourlyWage: 0, tripsPerHour: 0, totalHoursDec: 0, other: 0, id: null 
                  };
                  const isZero = !record;

                  return (
                    <div 
                        key={dateStr} 
                        className={`bg-white border border-gray-200 rounded-2xl p-5 shadow-sm relative overflow-hidden group ${isZero ? 'opacity-70' : ''}`} 
                        onClick={() => record && handleEdit(record)} // Only edit if record exists
                    >
                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isZero ? 'bg-gray-300' : 'bg-emerald-500'}`}></div>
                        <div className="flex justify-between items-start mb-4 pl-3">
                            <div>
                                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1 font-medium"><Calendar size={16} />{dateObj.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })}</div>
                                <div className="text-2xl font-black text-gray-900">{formatCurrency(displayRecord.totalIncome)}</div>
                            </div>
                            {record && (
                                <button onClick={(e) => { e.stopPropagation(); handleDelete(record.id); }} className="text-gray-400 hover:text-red-500 transition-colors p-2 bg-gray-50 rounded-full"><Trash2 size={18} /></button>
                            )}
                        </div>
                        <div className="grid grid-cols-3 gap-2 pl-3">
                            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100"><div className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-bold">時薪</div><div className={`font-extrabold text-lg ${isZero ? 'text-gray-400' : 'text-emerald-600'}`}>${displayRecord.hourlyWage.toFixed(0)}</div></div>
                            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100"><div className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-bold">每小時單量</div><div className={`font-extrabold text-lg ${isZero ? 'text-gray-400' : 'text-gray-900'}`}>{formatDecimal(displayRecord.tripsPerHour)}</div></div>
                            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100"><div className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-bold">工時</div><div className={`font-extrabold text-base leading-7 ${isZero ? 'text-gray-400' : 'text-gray-900'}`}>{formatDuration(displayRecord.totalHoursDec)}</div></div>
                        </div>
                        {/* Display Other Income if exists */}
                        {displayRecord.other !== 0 && (
                            <div className="mt-3 pt-2 border-t border-gray-100 text-right text-xs text-gray-400 font-medium">
                                其他調整: <span className={displayRecord.other > 0 ? "text-emerald-500" : "text-red-500"}>{displayRecord.other > 0 ? '+' : ''}{displayRecord.other}</span>
                            </div>
                        )}
                    </div>
                  );
              })}
          </div>
      )}
  </div>
));

// ==========================================
// 6. LOGIN COMPONENT
// ==========================================
const LoginScreen = ({ onLoginSuccess }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isResetMode, setIsResetMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      if (isLoginMode) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message.replace('Firebase:', '').trim());
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if(!email) {
      setError("請輸入您的電子郵件");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMsg("重設信已寄出！請檢查信箱並依照指示重設密碼。");
    } catch (err) {
      setError(err.message.replace('Firebase:', '').trim());
    } finally {
      setLoading(false);
    }
  };

  if (isResetMode) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-xl border border-gray-100">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
              <KeyRound size={24} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">重設密碼</h1>
            <p className="text-gray-500 text-sm">輸入您的 Email，我們將寄送重設連結給您</p>
          </div>

          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">電子郵件</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-gray-400" size={20}/>
                <input 
                  type="email" 
                  required 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-500 text-sm p-3 rounded-xl flex items-start gap-2">
                <AlertCircle size={16} className="mt-0.5 shrink-0"/>
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="bg-green-50 text-green-600 text-sm p-3 rounded-xl flex items-start gap-2">
                <CloudLightning size={16} className="mt-0.5 shrink-0"/>
                <span>{successMsg}</span>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 mt-4"
            >
              {loading && <RefreshCw className="animate-spin" size={20}/>}
              發送重設信
            </button>

            <button 
              type="button"
              onClick={() => { setIsResetMode(false); setError(null); setSuccessMsg(null); }}
              className="w-full text-gray-500 font-bold py-2 hover:text-gray-700 transition-colors text-sm"
            >
              返回登入
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-xl border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Uber<span className="text-emerald-500">Track</span></h1>
          <p className="text-gray-500 text-sm">專業司機的雲端記帳助手</p>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
          <button 
            onClick={() => { setIsLoginMode(true); setError(null); }}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isLoginMode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
          >
            登入
          </button>
          <button 
            onClick={() => { setIsLoginMode(false); setError(null); }}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isLoginMode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
          >
            註冊
          </button>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">電子郵件</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-gray-400" size={20}/>
              <input 
                type="email" 
                required 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div>
             <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">密碼</label>
             <div className="relative">
               <Lock className="absolute left-4 top-3.5 text-gray-400" size={20}/>
               <input 
                  type="password" 
                  required 
                  minLength={6}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
               />
             </div>
             {isLoginMode && (
                <div className="text-right mt-1">
                  <button 
                    type="button"
                    onClick={() => { setIsResetMode(true); setError(null); }}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
                  >
                    忘記密碼？
                  </button>
                </div>
             )}
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 text-sm p-3 rounded-xl flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5 shrink-0"/>
              <span>{error}</span>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 mt-4"
          >
            {loading && <RefreshCw className="animate-spin" size={20}/>}
            {isLoginMode ? '立即登入' : '建立帳號'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 7. MIGRATION COMPONENT
// ==========================================
const MigrationModal = ({ onMigrate, loading }) => (
  <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <UploadCloud size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">發現舊資料！</h3>
          <p className="text-gray-500 text-sm mb-6">我們偵測到您的裝置上有舊版的紀錄。是否要將它們搬家到雲端，讓資料永久保存？</p>
          <button 
            onClick={onMigrate} 
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="animate-spin" size={20}/> : "開始雲端搬家"}
          </button>
      </div>
  </div>
);

// ==========================================
// 8. HELP MANUAL COMPONENT
// ==========================================
const UserManualModal = ({ onClose }) => (
  <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm" onClick={onClose}>
    <div className="relative bg-white w-full max-w-lg h-[80vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
      
      {/* Header */}
      <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
          <BookOpen className="text-emerald-500" size={24}/> 
          使用說明書
        </h3>
        <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:text-gray-900 transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 text-gray-600 leading-relaxed">
        
        <section>
          <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
            快速入門
          </h4>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-2">
              <span className="font-bold text-gray-800 shrink-0">註冊與登入:</span>
              <span>首次使用請點擊「註冊」，老朋友請直接「登入」。系統會自動記住您的登入狀態。</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-gray-800 shrink-0">舊資料搬家:</span>
              <span>若您是舊版使用者，首次登入時系統會跳出提示，請務必點擊「開始雲端搬家」以保留歷史紀錄。</span>
            </li>
          </ul>
        </section>

        <section>
          <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
            首頁與即時戰況
          </h4>
          <p className="text-sm mb-3">登入後即進入首頁，這裡是您的戰情中心。</p>
          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li><b className="text-gray-800">今日戰績</b>：顯示今天跑單金額。點擊筆型圖示可修改。</li>
            <li><b className="text-gray-800">最近 7 天</b>：白色卡片可點擊修改或刪除；灰色卡片代表無紀錄。</li>
            <li><b className="text-gray-800">功能切換</b>：快速切換週、月、年報表。</li>
          </ul>
        </section>

        <section>
          <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
            記帳功能
          </h4>
          <p className="text-sm mb-3">點擊右下角 <b className="text-emerald-600">綠色「+」</b> 按鈕。</p>
          <div className="bg-gray-50 p-4 rounded-xl text-sm space-y-2">
             <div className="grid grid-cols-2 gap-2">
               <div><span className="font-bold">行程</span>：基本車資</div>
               <div><span className="font-bold">獎勵</span>：達標獎金</div>
               <div><span className="font-bold">小費</span>：額外收入</div>
               <div><span className="font-bold">其他</span>：補貼或扣款</div>
             </div>
             <p className="text-xs text-gray-400 mt-2 border-t border-gray-200 pt-2">💡 小撇步：同一天分早晚班跑，可分兩次記帳，系統會自動加總。</p>
          </div>
        </section>

        <section>
          <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
            數據分析
          </h4>
          <div className="space-y-4">
            <div>
              <h5 className="font-bold text-gray-800 mb-1">📊 週報表</h5>
              <p className="text-sm">點擊長條圖可查看「該日」明細；再次點擊恢復全週總計。</p>
            </div>
            <div>
              <h5 className="font-bold text-gray-800 mb-1">🗓️ 月報表</h5>
              <p className="text-sm">點擊月曆格子可直接「修改」或「刪除」歷史紀錄（包含 7 天前的資料）。</p>
            </div>
            <div>
              <h5 className="font-bold text-gray-800 mb-1">📈 年報表</h5>
              <p className="text-sm">老闆視角，檢視整年度營收趨勢與總結算。</p>
            </div>
          </div>
        </section>

        <section>
          <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">Q</span>
            常見問題
          </h4>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-bold text-gray-800">Q: 為什麼 12/02 是灰色不能刪？</p>
              <p>A: 灰色代表當天無資料，既然沒資料自然無法刪除。</p>
            </div>
            <div>
              <p className="font-bold text-gray-800">Q: 換手機資料還在嗎？</p>
              <p>A: 在！只要登入同一組帳號，資料自動同步。</p>
            </div>
          </div>
        </section>

      </div>
      
      {/* Footer */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50 text-center">
        <p className="text-xs text-emerald-600 font-bold">UberTrack Cloud v3.0</p>
      </div>
    </div>
  </div>
);

// ==========================================
// 9. MAIN APPLICATION
// ==========================================

export default function UberTrackV3_Cloud() {
  const [isStyleLoaded, setIsStyleLoaded] = useState(false);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [records, setRecords] = useState([]);
  
  // Migration State
  const [showMigration, setShowMigration] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  
  const [sheetUrl, setSheetUrl] = useState(() => {
    try { return localStorage.getItem('uber_sheet_url') || ''; } catch (e) { return ''; }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false); // New state for Help Modal
  const [isSyncing, setIsSyncing] = useState(false);
  const [viewMode, setViewMode] = useState('weekly');
  const [currentWeekBase, setCurrentWeekBase] = useState(new Date());
  const [currentYearView, setCurrentYearView] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(null); 
  const [editingRecord, setEditingRecord] = useState(null);

  const [formData, setFormData] = useState({
    date: getLocalDateString(new Date()), tripCost: '', promo: '', tips: '', other: '', hours: '', minutes: '', tripCount: ''
  });

  // Load Tailwind
  useEffect(() => {
    const loadResources = async () => {
        const stylePromise = new Promise((resolve) => {
            if (document.getElementById('tailwind-cdn')) { resolve(); return; }
            const script = document.createElement('script');
            script.id = 'tailwind-cdn';
            script.src = 'https://cdn.tailwindcss.com';
            script.onload = resolve;
            script.onerror = resolve;
            document.head.appendChild(script);
        });
        await stylePromise;
        setIsStyleLoaded(true);
    };
    loadResources();
  }, []);

  // Auth Listener & Data Sync
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);

      if (currentUser) {
        // 1. Check for local legacy data
        const localData = localStorage.getItem('uber_records');
        if (localData && JSON.parse(localData).length > 0) {
            setShowMigration(true);
        }

        // 2. Setup Firestore Listener
        const q = query(collection(db, 'users', currentUser.uid, 'records'));
        const unsubFirestore = onSnapshot(q, (snapshot) => {
           const cloudRecords = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
           // Sort by date desc
           cloudRecords.sort((a, b) => (a.date < b.date ? 1 : -1));
           setRecords(cloudRecords);
        });
        return () => unsubFirestore();
      } else {
        setRecords([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Migration Logic
  const handleMigration = async () => {
     setIsMigrating(true);
     try {
         const localData = JSON.parse(localStorage.getItem('uber_records') || "[]");
         const batch = writeBatch(db);
         
         localData.forEach(record => {
             // Create a reference for each doc
             const docRef = doc(db, 'users', user.uid, 'records', record.id.toString());
             batch.set(docRef, record);
         });

         await batch.commit();
         
         // Clear local storage to prevent duplicate migration
         localStorage.removeItem('uber_records');
         setShowMigration(false);
         alert("搬家成功！所有資料已上傳雲端。");
     } catch (e) {
         console.error(e);
         alert("搬家失敗，請稍後再試: " + e.message);
     } finally {
         setIsMigrating(false);
     }
  };

  const handleLogout = () => signOut(auth);

  // Firestore Sheet Import Logic
  const fetchFromSheet = useCallback(async () => {
    if (!sheetUrl || !user) return;
    setIsSyncing(true);
    try {
      const response = await fetch(sheetUrl);
      const data = await response.json();
      
      if (Array.isArray(data)) {
        const batch = writeBatch(db);
        let count = 0;
        
        data.forEach(item => {
           // Parse fields same as before
           const tripCost = parseFloat(getSmartValue(item, ['tripCost', '行程', '行程費用'])) || 0;
           const promo = parseFloat(getSmartValue(item, ['promo', '獎勵'])) || 0;
           const tips = parseFloat(getSmartValue(item, ['tips', '小費'])) || 0;
           const other = parseFloat(getSmartValue(item, ['other', '其他', '其他費用'])) || 0;
           const tripCount = parseFloat(getSmartValue(item, ['tripCount', '趟數', '單量'])) || 0;
           const totalHoursDec = parseFloat(getSmartValue(item, ['totalHoursDec', '工時', '總工時'])) || 0;
           const rawTotal = parseFloat(getSmartValue(item, ['totalIncome', '總收入'])) || 0;
           const date = getSmartString(item, ['date', '日期']);
           const id = getSmartString(item, ['id', 'ID']) || Date.now().toString() + Math.random();

           const income = tripCost + promo + tips + other;
           const finalIncome = rawTotal > 0 ? rawTotal : income;

           const newRecord = {
               id, date, tripCost, promo, tips, other, tripCount, totalHoursDec,
               totalIncome: finalIncome,
               hourlyWage: totalHoursDec > 0 ? finalIncome / totalHoursDec : 0,
               tripsPerHour: totalHoursDec > 0 ? tripCount / totalHoursDec : 0,
               createdAt: new Date().toISOString()
           };

           const docRef = doc(db, 'users', user.uid, 'records', id.toString());
           batch.set(docRef, newRecord);
           count++;
        });
        
        await batch.commit();
        alert(`成功匯入 ${count} 筆資料到雲端資料庫！`);
        setIsSettingsOpen(false);
      }
    } catch (e) { 
        alert("匯入失敗: " + e.message);
    } 
    finally { setIsSyncing(false); }
  }, [sheetUrl, user]);


  // Stats Calculation (Same logic, relying on 'records' state)
  const stats = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const todayStr = getLocalDateString(new Date());
    
    let annualIncome = 0, annualTime = 0, annualTrips = 0, annualTripCost = 0, annualPromo = 0;
    let todayData = { income: 0, time: 0, trips: 0, hasRecord: false };
    const mData = {}; 
    const rMap = {}; 

    records.forEach(r => {
        const dStr = getLocalDateString(r.date);
        if (!dStr) return;

        if (!rMap[dStr]) {
            rMap[dStr] = { ...r, count: 1 }; 
        } else {
            rMap[dStr].totalIncome += r.totalIncome;
            rMap[dStr].tripCost += r.tripCost;
            rMap[dStr].promo += r.promo;
            rMap[dStr].tips += r.tips;
            rMap[dStr].other += r.other;
            rMap[dStr].tripCount += r.tripCount;
            rMap[dStr].totalHoursDec += r.totalHoursDec;
            rMap[dStr].hourlyWage = rMap[dStr].totalHoursDec > 0 ? rMap[dStr].totalIncome / rMap[dStr].totalHoursDec : 0;
            rMap[dStr].tripsPerHour = rMap[dStr].totalHoursDec > 0 ? rMap[dStr].tripCount / rMap[dStr].totalHoursDec : 0;
        }

        if (dStr.includes(String(currentYear))) {
            annualIncome += r.totalIncome;
            annualTime += r.totalHoursDec;
            annualTrips += r.tripCount;
            annualTripCost += r.tripCost;
            annualPromo += r.promo;
        }
        
        if (dStr === todayStr) {
            todayData.income += r.totalIncome;
            todayData.time += r.totalHoursDec;
            todayData.trips += r.tripCount;
            todayData.hasRecord = true;
            todayData.record = r;
        }

        const monthKey = dStr.substring(0, 7); 
        const [yStr, mStr] = monthKey.split('-');
        const y = parseInt(yStr);
        const m = parseInt(mStr);
        
        if (!mData[monthKey]) {
            mData[monthKey] = {
                key: monthKey, year: y, month: m,
                totalIncome: 0, tripCost: 0, promo: 0, tips: 0, other: 0, tripCount: 0, totalHours: 0, records: []
            };
        }
        mData[monthKey].totalIncome += r.totalIncome;
        mData[monthKey].tripCost += r.tripCost;
        mData[monthKey].promo += r.promo;
        mData[monthKey].tips += r.tips;
        mData[monthKey].other += r.other;
        mData[monthKey].tripCount += r.tripCount;
        mData[monthKey].totalHours += r.totalHoursDec;
        mData[monthKey].records.push(r);
    });
    
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
    if (!mData[currentMonthKey]) {
        mData[currentMonthKey] = {
             key: currentMonthKey, year: now.getFullYear(), month: now.getMonth()+1,
             totalIncome: 0, tripCost: 0, promo: 0, tips: 0, other: 0, tripCount: 0, totalHours: 0, records: []
        };
    }

    const annualStats = {
        year: currentYear,
        totalIncome: annualIncome,
        totalTrips: annualTrips,
        avgHourly: annualTime > 0 ? annualIncome / annualTime : 0,
        avgNetTrip: annualTrips > 0 ? annualTripCost / annualTrips : 0,
        avgGrossTrip: annualTrips > 0 ? (annualTripCost + annualPromo) / annualTrips : 0
    };

    return { annualStats, todayStats: todayData, monthlyDataMap: mData, recordMap: rMap };
  }, [records]);

  // View Helpers
  const calculateWorkDays = useCallback((data) => {
      if (!data) return { fullDays: 0, halfDays: 0, offDays: 0 };
      const { year, month, records } = data;
      const now = new Date();
      let daysToCount;
      if (year === now.getFullYear() && month === (now.getMonth() + 1)) {
          daysToCount = now.getDate(); 
      } else if (new Date(year, month - 1, 1) > now) {
          daysToCount = 0; 
      } else {
          daysToCount = new Date(year, month, 0).getDate(); 
      }
      const dailyHours = {};
      if (records) {
          records.forEach(r => {
               const d = new Date(r.date).getDate();
               dailyHours[d] = (dailyHours[d] || 0) + r.totalHoursDec;
          });
      }
      let fullDays = 0, halfDays = 0, offDays = 0;
      for (let d = 1; d <= daysToCount; d++) {
          const hours = dailyHours[d] || 0;
          if (hours <= 1) offDays++;
          else if (hours < 4) halfDays++;
          else fullDays++;
      }
      return { fullDays, halfDays, offDays };
  }, []);

  const currentMonthStats = useMemo(() => {
      const now = new Date();
      const currentKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
      return stats.monthlyDataMap[currentKey];
  }, [stats.monthlyDataMap]);

  const weeklyStats = useMemo(() => {
    const base = new Date(currentWeekBase);
    base.setHours(0,0,0,0);
    const diff = base.getDate() - base.getDay() + (base.getDay() === 0 ? -6 : 1);
    const startOfWeek = new Date(base);
    startOfWeek.setDate(diff);
    const weekNumber = getWeekNumber(startOfWeek);
    const todayStr = getLocalDateString(new Date());
    const startStr = getLocalDateString(startOfWeek);
    let endStr = "";
    const daysData = [];
    const dayLabels = ['一', '二', '三', '四', '五', '六', '日'];
    let totalIncome = 0, recordCount = 0, totalHours = 0, totalTrips = 0;
    
    // 1. & 2. 修正：正確計算週報表細項
    let totalTripCost = 0, totalPromo = 0, totalTips = 0, totalOther = 0;

    for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        const dStr = getLocalDateString(d);
        if (i === 6) endStr = dStr;
        const rec = stats.recordMap[dStr];
        const dayIncome = rec ? rec.totalIncome : 0;
        
        daysData.push({ 
            date: dStr, 
            dayLabel: dayLabels[i], 
            income: dayIncome, 
            isToday: dStr === todayStr,
            originalRecord: rec // 用於點擊後顯示明細
        });

        if (rec) {
            totalIncome += dayIncome;
            totalHours += rec.totalHoursDec;
            totalTrips += rec.tripCount;
            // 累加各項費用
            totalTripCost += rec.tripCost || 0;
            totalPromo += rec.promo || 0;
            totalTips += rec.tips || 0;
            totalOther += rec.other || 0;
            recordCount++; 
        }
    }
    const maxDailyIncome = Math.max(...daysData.map(d => d.income), 100);
    const weeklyHourlyWage = totalHours > 0 ? totalIncome / totalHours : 0;
    
    // 計算每趟平均
    const avgNetTripCost = totalTrips > 0 ? totalTripCost / totalTrips : 0; 
    const avgGrossTripCost = totalTrips > 0 ? (totalTripCost + totalPromo) / totalTrips : 0; 

    return { 
        totalIncome, recordCount, startStr, endStr, weekNumber, dailyData: daysData, maxDailyIncome, 
        totalHours, totalTrips, weeklyHourlyWage, avgNetTripCost, avgGrossTripCost,
        breakdown: { tripCost: totalTripCost, promo: totalPromo, tips: totalTips, other: totalOther }
    };
  }, [stats.recordMap, currentWeekBase]);

  const recentStats = useMemo(() => {
    const today = new Date();
    const list = [];
    let startStr = "", endStr = "";
    for (let i = 1; i <= 7; i++) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const dStr = getLocalDateString(d);
        if (i === 1) endStr = dStr;
        if (i === 7) startStr = dStr;
        list.push({ dateStr: dStr, record: stats.recordMap[dStr] || null });
    }
    return { dailyList: list, startStr, endStr, recordsLength: list.filter(i=>i.record).length };
  }, [stats.recordMap]);

  const currentSelectedMonthData = useMemo(() => {
      if (!selectedMonth) return null;
      const data = stats.monthlyDataMap[selectedMonth];
      const hourlyWage = data.totalHours > 0 ? data.totalIncome / data.totalHours : 0;
      const avgNetTripCost = data.tripCount > 0 ? data.tripCost / data.tripCount : 0;
      const avgGrossTripCost = data.tripCount > 0 ? (data.tripCost + data.promo) / data.tripCount : 0;
      const tripsPerHour = data.totalHours > 0 ? data.tripCount / data.totalHours : 0;
      return { ...data, hourlyWage, avgNetTripCost, avgGrossTripCost, tripsPerHour };
  }, [selectedMonth, stats.monthlyDataMap]);

  // Interactions
  const handleWeekChange = (direction) => setCurrentWeekBase(prev => { const n = new Date(prev); n.setDate(n.getDate() + (direction * 7)); return n; });
  const goHome = () => { setViewMode('weekly'); setSelectedMonth(null); setCurrentWeekBase(new Date()); setCurrentYearView(new Date().getFullYear()); };
  
  const handleEdit = (record) => {
      if (!record) return;
      setEditingRecord(record);
      const hrs = Math.floor(record.totalHoursDec);
      const mins = Math.round((record.totalHoursDec - hrs) * 60);
      setFormData({
          date: getLocalDateString(record.date), tripCost: record.tripCost, promo: record.promo, tips: record.tips, other: record.other || '', hours: hrs, minutes: mins, tripCount: record.tripCount
      });
      setIsModalOpen(true);
  };

  // Firestore Write
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setIsSyncing(true);
    const income = (parseFloat(formData.tripCost)||0) + (parseFloat(formData.promo)||0) + (parseFloat(formData.tips)||0) + (parseFloat(formData.other)||0);
    const hrs = (parseFloat(formData.hours)||0) + ((parseFloat(formData.minutes)||0)/60);
    const trips = parseFloat(formData.tripCount)||0;
    const id = editingRecord ? editingRecord.id : Date.now().toString();
    
    const newRecord = {
      id, ...formData,
      totalIncome: income, totalHoursDec: hrs,
      hourlyWage: hrs > 0 ? income/hrs : 0, tripsPerHour: hrs > 0 ? trips/hrs : 0,
      createdAt: editingRecord ? editingRecord.createdAt : new Date().toISOString()
    };

    try {
        await setDoc(doc(db, 'users', user.uid, 'records', id.toString()), newRecord);
        setIsModalOpen(false);
        setFormData({ date: getLocalDateString(new Date()), tripCost: '', promo: '', tips: '', other: '', hours: '', minutes: '', tripCount: '' });
    } catch (e) {
        alert("儲存失敗: " + e.message);
    } finally {
        setIsSyncing(false);
    }
  };

  const handleDelete = async (id) => {
      if (!user || !window.confirm('確定刪除？')) return;
      try {
          await deleteDoc(doc(db, 'users', user.uid, 'records', id.toString()));
      } catch (e) {
          alert("刪除失敗");
      }
  };

  // RENDER
  if (!isStyleLoaded || authLoading) {
      return (
          <div className="flex flex-col items-center justify-center h-screen bg-gray-50 gap-4">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-emerald-500 rounded-full animate-spin"></div>
              <div className="text-emerald-600 font-bold animate-pulse">UberTrack Cloud 載入中...</div>
          </div>
      );
  }

  // Not logged in -> Show Login Screen
  if (!user) {
      return <LoginScreen />;
  }

  // Logged in -> Show Dashboard
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-emerald-200">
      {/* Migration Modal */}
      {showMigration && <MigrationModal onMigrate={handleMigration} loading={isMigrating} />}

      {/* Help Modal - Add this */}
      {isHelpOpen && <UserManualModal onClose={() => setIsHelpOpen(false)} />}

      <div className="bg-white px-6 pt-8 pb-10 rounded-b-[2.5rem] shadow-sm border-b border-gray-100 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">Uber<span className="text-emerald-500">Track</span></h1>
            <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> 雲端連線中
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={goHome} className="p-2.5 rounded-full border border-gray-200 text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 transition-all"><Home className="w-6 h-6" /></button>
            {/* Help Button - Add this */}
            <button onClick={() => setIsHelpOpen(true)} className="p-2.5 rounded-full border border-gray-200 text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 transition-all"><BookOpen className="w-6 h-6" /></button>
            <button onClick={() => setIsSettingsOpen(true)} className="p-2.5 rounded-full border bg-gray-100 border-gray-200 text-gray-500 hover:text-gray-900"><User className="w-6 h-6" /></button>
          </div>
        </div>
        {!selectedMonth && viewMode === 'weekly' && <OverviewStats annualStats={stats.annualStats} todayStats={stats.todayStats} onEditToday={() => handleEdit(stats.todayStats.record)} />}
      </div>

      {!selectedMonth && (
        <div className="px-6 mt-[-20px] mb-6 relative z-10">
            <div className="bg-gray-100 p-1.5 rounded-xl flex border border-gray-200 shadow-lg">
                <button onClick={() => setViewMode('weekly')} className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${viewMode === 'weekly' ? 'bg-white text-emerald-600 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'}`}><BarChart3 size={18} /> 週報表</button>
                <button onClick={() => setViewMode('monthly')} className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${viewMode === 'monthly' ? 'bg-white text-emerald-600 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'}`}><PieChart size={18} /> 月報表</button>
                <button onClick={() => setViewMode('annual')} className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${viewMode === 'annual' ? 'bg-white text-emerald-600 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'}`}><LineChart size={18} /> 年報表</button>
            </div>
        </div>
      )}

      <div className="px-5 pb-32">
        {viewMode === 'weekly' && !selectedMonth && (
            <>
                <WeeklyView weeklyStats={weeklyStats} handleWeekChange={handleWeekChange} fetchError={null} recordsLength={records.length} />
                <RecentRecordList recentStats={recentStats} sheetUrl={sheetUrl} fetchFromSheet={() => setIsSettingsOpen(true)} isLoading={false} handleDelete={handleDelete} handleEdit={handleEdit} />
            </>
        )}
        {viewMode === 'monthly' && (
            <MonthlyView 
                selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth}
                currentYearView={currentYearView} setCurrentYearView={setCurrentYearView}
                monthlyDataMap={stats.monthlyDataMap} currentSelectedMonthData={currentSelectedMonthData}
                currentMonthStats={currentMonthStats} calculateWorkDays={calculateWorkDays}
                handleEdit={handleEdit} handleDelete={handleDelete}
            />
        )}
        {viewMode === 'annual' && (
            <AnnualView 
                currentYearView={currentYearView} setCurrentYearView={setCurrentYearView}
                monthlyDataMap={stats.monthlyDataMap} annualStats={stats.annualStats}
            />
        )}
      </div>

      {!selectedMonth && (
        <button onClick={() => { setEditingRecord(null); setFormData({ date: getLocalDateString(new Date()), tripCost: '', promo: '', tips: '', other: '', hours: '', minutes: '', tripCount: '' }); setIsModalOpen(true); }} className="fixed bottom-8 right-6 w-16 h-16 bg-emerald-500 hover:bg-emerald-400 text-white rounded-full shadow-[0_8px_30px_rgb(16,185,129,0.4)] flex items-center justify-center transition-transform active:scale-95 z-50 border-4 border-white"><Plus size={32} strokeWidth={3} /></button>
      )}

      {/* User Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setIsSettingsOpen(false)}></div>
          <div className="relative bg-white w-full max-w-sm rounded-3xl border border-gray-100 p-6 shadow-2xl overflow-hidden">
             <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl font-bold text-gray-500">
                    {user.email[0].toUpperCase()}
                </div>
                <h3 className="font-bold text-gray-900">{user.email}</h3>
                <p className="text-xs text-gray-400">UberTrack Cloud Member</p>
             </div>

             <div className="space-y-3">
                 <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <h4 className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-1"><CloudLightning size={12}/> 舊版資料匯入工具</h4>
                    <p className="text-[10px] text-gray-400 mb-3">若您有舊版的 Google Apps Script 網址，可在此貼上並將資料匯入雲端。</p>
                    <input type="text" placeholder="https://script.google.com/..." value={sheetUrl} onChange={(e) => { setSheetUrl(e.target.value); localStorage.setItem('uber_sheet_url', e.target.value); }} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs mb-2" />
                    <button onClick={fetchFromSheet} disabled={isSyncing || !sheetUrl} className="w-full bg-blue-50 text-blue-600 font-bold py-2 rounded-lg text-xs hover:bg-blue-100 transition-colors flex items-center justify-center gap-1">{isSyncing ? <RefreshCw className="animate-spin" size={12}/> : <DownloadCloud size={12}/>} 開始匯入</button>
                 </div>

                 <button onClick={handleLogout} className="w-full bg-red-50 text-red-600 font-bold py-3 rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2"><LogOut size={16}/> 登出帳號</button>
             </div>
             <button onClick={() => setIsSettingsOpen(false)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600"><X size={20}/></button>
          </div>
        </div>
      )}

      {/* Record Modal (Add/Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full sm:w-[450px] sm:rounded-3xl rounded-t-[2rem] border-t sm:border border-gray-200 p-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-8"><h3 className="text-2xl font-black text-gray-900">{editingRecord ? "編輯紀錄" : "新增紀錄"}</h3><button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:text-gray-900"><X size={24} /></button></div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2"><label className="text-sm font-bold text-gray-500 uppercase tracking-wider ml-1">日期</label><div className="relative"><input required type="date" name="date" value={formData.date} onChange={(e) => setFormData(p => ({...p, date: e.target.value}))} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 text-lg font-bold focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all" /><Calendar className="absolute right-5 top-4.5 text-gray-400 pointer-events-none" size={24} /></div></div>
              <div className="space-y-2"><label className="text-sm font-bold text-gray-500 uppercase tracking-wider ml-1">收入詳情</label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative"><input type="number" placeholder="0" name="tripCost" value={formData.tripCost} onChange={(e) => setFormData(p => ({...p, tripCost: e.target.value}))} className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-4 pr-2 py-4 text-gray-900 text-base font-bold focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /><span className="absolute text-[10px] text-gray-400 top-2 right-3 font-bold">行程</span></div>
                  <div className="relative"><input type="number" placeholder="0" name="promo" value={formData.promo} onChange={(e) => setFormData(p => ({...p, promo: e.target.value}))} className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-4 pr-2 py-4 text-gray-900 text-base font-bold focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /><span className="absolute text-[10px] text-gray-400 top-2 right-3 font-bold">獎勵</span></div>
                  <div className="relative"><input type="number" placeholder="0" name="tips" value={formData.tips} onChange={(e) => setFormData(p => ({...p, tips: e.target.value}))} className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-4 pr-2 py-4 text-gray-900 text-base font-bold focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /><span className="absolute text-[10px] text-gray-400 top-2 right-3 font-bold">小費</span></div>
                  <div className="relative"><input type="number" placeholder="0" name="other" value={formData.other} onChange={(e) => setFormData(p => ({...p, other: e.target.value}))} className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-4 pr-2 py-4 text-gray-900 text-base font-bold focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /><span className="absolute text-[10px] text-gray-400 top-2 right-3 font-bold">其他</span></div>
                </div>
              </div>
              <div className="space-y-2"><label className="text-sm font-bold text-gray-500 uppercase tracking-wider ml-1">工時</label><div className="grid grid-cols-2 gap-3"><div className="relative"><input required type="number" placeholder="0" name="hours" value={formData.hours} onChange={(e) => setFormData(p => ({...p, hours: e.target.value}))} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 text-lg font-bold focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /><span className="absolute right-5 top-5 text-gray-400 text-sm font-bold">時</span></div><div className="relative"><input type="number" placeholder="0" name="minutes" max="59" value={formData.minutes} onChange={(e) => setFormData(p => ({...p, minutes: e.target.value}))} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 text-lg font-bold focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /><span className="absolute right-5 top-5 text-gray-400 text-sm font-bold">分</span></div></div></div>
              <div className="space-y-2"><label className="text-sm font-bold text-gray-500 uppercase tracking-wider ml-1">趟數</label><div className="relative"><input required type="number" placeholder="例如: 15" name="tripCount" value={formData.tripCount} onChange={(e) => setFormData(p => ({...p, tripCount: e.target.value}))} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 text-lg font-bold focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /><Bike className="absolute right-5 top-4.5 text-gray-400" size={24} /></div></div>
              <button type="submit" disabled={isSyncing} className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-black text-lg py-5 rounded-2xl shadow-xl shadow-emerald-500/30 transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2">{isSyncing ? <CloudLightning className="animate-pulse" size={24} /> : "儲存紀錄"}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}