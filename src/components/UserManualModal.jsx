import React from 'react';
import { X, BookOpen, Smartphone } from 'lucide-react';

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

        {/* New Section: Install to Phone */}
        <section>
          <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-600 w-6 h-6 rounded-full flex items-center justify-center text-xs"><Smartphone size={14}/></span>
            安裝到手機 (App 體驗)
          </h4>
          <p className="text-sm mb-3">這是一個網頁應用程式 (Web App)，但您可以將它安裝到手機桌面，享受全螢幕體驗！</p>
          
          <div className="bg-gray-50 p-4 rounded-xl text-sm space-y-4 border border-gray-100">
             <div>
               <h5 className="font-bold text-gray-800 mb-1">🍎 iPhone / iPad (iOS)</h5>
               <ol className="list-decimal pl-5 space-y-1 text-gray-600">
                 <li>使用 <b>Safari</b> 瀏覽器打開本網頁</li>
                 <li>點擊下方的 <b>「分享」</b> 按鈕 (方塊向上箭頭)</li>
                 <li>滑動選單，點擊 <b>「加入主畫面」</b></li>
               </ol>
             </div>
             <div className="border-t border-gray-200 pt-3">
               <h5 className="font-bold text-gray-800 mb-1">🤖 Android (Chrome)</h5>
               <ol className="list-decimal pl-5 space-y-1 text-gray-600">
                 <li>使用 <b>Chrome</b> 瀏覽器打開本網頁</li>
                 <li>點擊右上角的 <b>「選單」</b> 按鈕 (三個點)</li>
                 <li>點擊 <b>「安裝應用程式」</b> 或 <b>「加入主畫面」</b></li>
               </ol>
             </div>
          </div>
        </section>
        
        <section>
          <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
            快速入門
          </h4>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-2">
              <span className="font-bold text-gray-800 shrink-0">註冊與登入:</span>
              <span>首次使用請點擊「註冊」，並輸入邀請碼。系統會自動記住您的登入狀態。</span>
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

export default UserManualModal;