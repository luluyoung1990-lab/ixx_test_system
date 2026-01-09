
import React, { useState, useCallback, useMemo } from 'react';
import { 
  Search, 
  RefreshCw, 
  RotateCcw, 
  Eye, 
  Download, 
  Printer, 
  ArrowRightLeft, 
  Layers,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Play,
  CheckCircle2,
  Clock,
  Trash2,
  User,
  FlaskConical,
  CheckSquare,
  GripVertical,
  Copy,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { LogEntry, EvaluationEntry } from './types';
import { MOCK_LOGS } from './constants';
import Rating from './components/Rating';

// --- Helper Components ---

/**
 * Enhanced cell content component that provides a beautiful hover popover for long text.
 * Now allows overriding maxWidth for flexible layouts.
 */
const CellContent: React.FC<{ text: string; maxWidth?: string; placeholder?: string }> = ({ 
  text, 
  maxWidth = "max-w-xs",
  placeholder = "等待生成..."
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const isEmpty = !text || text.trim() === '';

  const copyToClipboard = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isEmpty) {
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <div 
      className={`relative group px-4 py-4 border-r ${maxWidth}`}
      onMouseEnter={() => !isEmpty && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className={`font-normal line-clamp-2 whitespace-normal break-words leading-relaxed transition-colors ${
        isEmpty ? 'text-gray-300 italic text-xs' : 'text-black group-hover:text-blue-600'
      }`}>
        {isEmpty ? placeholder : text}
      </div>

      {showTooltip && !isEmpty && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[90%] z-[100] w-72 md:w-96 animate-in fade-in zoom-in duration-200 pointer-events-none group-hover:pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-md border border-slate-200 shadow-2xl rounded-xl p-4 text-sm text-slate-700 font-normal shadow-blue-900/10 ring-1 ring-black/5">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">完整内容详情</span>
              <button 
                onClick={copyToClipboard}
                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-blue-600 transition-colors"
                title="复制内容"
              >
                <Copy size={12} />
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto whitespace-pre-wrap leading-relaxed text-gray-800">
              {text}
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white/95"></div>
          </div>
        </div>
      )}
    </div>
  );
};

const Badge: React.FC<{ active: boolean; color: string; text: string }> = ({ active, color, text }) => {
  const colors: Record<string, string> = {
    green: active ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-400 border-gray-200',
    blue: active ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-gray-100 text-gray-400 border-gray-200',
    orange: active ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-gray-100 text-gray-400 border-gray-200',
    purple: active ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-gray-100 text-gray-400 border-gray-200',
  };

  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${colors[color]}`}>
      {text}
    </span>
  );
};

const EmptyState: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex flex-col items-center justify-center py-20 text-gray-400">
    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
      <Layers size={40} className="text-gray-300" />
    </div>
    <p className="text-lg font-medium text-gray-400">{text}</p>
  </div>
);

// --- Main App ---

type ColumnKey = 
  | 'index' 
  | 'userName' 
  | 'userAccount' 
  | 'department' 
  | 'content' 
  | 'source' 
  | 'isOnline' 
  | 'isFileQA' 
  | 'isKnowledgeBase' 
  | 'isDeepThinking' 
  | 'answerContent' 
  | 'actions';

interface ColumnDef {
  key: ColumnKey;
  label: string;
  width?: string;
  className?: string;
}

const App: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>(MOCK_LOGS);
  const [evaluations, setEvaluations] = useState<EvaluationEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'normal' | 'eval'>('normal');
  const [logSubTab, setLogSubTab] = useState<'normal' | 'test'>('normal');
  const [evalSubTab, setEvalSubTab] = useState<'pending' | 'completed' | 'resolved'>('pending');
  
  const [userNameSearch, setUserNameSearch] = useState('');
  const [contentSearch, setContentSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [onlineFilter, setOnlineFilter] = useState('all');
  const [fileFilter, setFileFilter] = useState('all');
  const [kbFilter, setKbFilter] = useState('all');

  const [evalNameSearch, setEvalNameSearch] = useState('');
  const [evalContentSearch, setEvalContentSearch] = useState('');
  const [evalDateSearch, setEvalDateSearch] = useState('');

  const [modelScoreFilter, setModelScoreFilter] = useState<number | 'all'>('all');
  const [humanScoreFilter, setHumanScoreFilter] = useState<number | 'all'>('all');

  // Column definition for the Log table
  const [columnOrder, setColumnOrder] = useState<ColumnDef[]>([
    { key: 'index', label: '序号', width: 'w-12' },
    { key: 'userName', label: '用户名称' },
    { key: 'userAccount', label: '用户账号' },
    { key: 'department', label: '用户部门' },
    { key: 'content', label: '提问内容', className: 'max-w-xs' },
    { key: 'source', label: '来源' },
    { key: 'isOnline', label: '联网' },
    { key: 'isFileQA', label: '文件' },
    { key: 'isKnowledgeBase', label: '知识库' },
    { key: 'isDeepThinking', label: '深度思考' },
    { key: 'answerContent', label: '回答内容', className: 'max-w-xs' },
    { key: 'actions', label: '操作' },
  ]);

  const [draggedColIndex, setDraggedColIndex] = useState<number | null>(null);

  const departments = useMemo(() => Array.from(new Set(MOCK_LOGS.map(l => l.department))), []);
  const sources = useMemo(() => Array.from(new Set(MOCK_LOGS.map(l => l.source))), []);

  const resetLogFilters = () => {
    setUserNameSearch('');
    setContentSearch('');
    setDeptFilter('all');
    setSourceFilter('all');
    setOnlineFilter('all');
    setFileFilter('all');
    setKbFilter('all');
  };

  const resetEvalFilters = () => {
    setEvalNameSearch('');
    setEvalContentSearch('');
    setEvalDateSearch('');
    setModelScoreFilter('all');
    setHumanScoreFilter('all');
  };

  const addToEvaluation = useCallback((log: LogEntry) => {
    if (log.isAddedToEval) return;

    setLogs(prevLogs => prevLogs.map(l => 
      l.id === log.id ? { ...l, isAddedToEval: true } : l
    ));

    const newEval: EvaluationEntry = {
      id: log.id,
      userName: log.userName,
      content: log.content,
      answerContent: '',   
      source: log.source,
      isOnline: log.isOnline,
      isFileQA: log.isFileQA,
      isKnowledgeBase: log.isKnowledgeBase,
      isDeepThinking: log.isDeepThinking || 0,
      joinedDate: new Date().toLocaleString(),
      status: 'pending',
      modelScore: 0,
      humanScore: 0,
      remark: ''
    };
    setEvaluations(prev => [newEval, ...prev]);
  }, []);

  const transferUserType = useCallback((userName: string, currentType: 'normal' | 'test') => {
    const nextType = currentType === 'normal' ? 'test' : 'normal';
    setLogs(prev => prev.map(l => 
      l.userName === userName ? { ...l, userType: nextType } : l
    ));
  }, []);

  const removeFromEvaluation = useCallback((id: string) => {
    const parts = id.split('-rev-');
    const originalLogId = parts[0];

    setEvaluations(prev => {
      const next = prev.filter(e => e.id !== id);
      const remainingForThisBaseId = next.filter(e => e.id.startsWith(originalLogId));
      
      if (remainingForThisBaseId.length === 0) {
        setLogs(prevLogs => prevLogs.map(l => 
          l.id === originalLogId ? { ...l, isAddedToEval: false } : l
        ));
      }
      return next;
    });
  }, []);

  const reAddToEvaluation = useCallback((entry: EvaluationEntry) => {
    if (entry.isReAdded) return;

    const newEval: EvaluationEntry = {
      ...entry,
      id: `${entry.id}-rev-${Date.now()}`, 
      status: 'pending',
      joinedDate: new Date().toLocaleString(),
      batchDate: undefined,
      answerContent: '', 
      modelScore: 0,
      humanScore: 0,
      remark: '',
      isReAdded: false
    };

    setEvaluations(prev => [newEval, ...prev.map(e => e.id === entry.id ? { ...e, isReAdded: true } : e)]);
  }, []);

  const runBatchProcess = useCallback(() => {
    setEvaluations(prev => prev.map(item => {
      if (item.status === 'pending') {
        const mockGeneratedAnswer = `【自动生成回答】针对您关于“${item.content.substring(0, 10)}...”的提问，系统已调取${item.isKnowledgeBase ? '私有知识库' : '通用模型'}进行深度分析。优化后的方案建议重点关注逻辑一致性与数据支撑。`;
        
        return {
          ...item,
          status: 'completed',
          answerContent: mockGeneratedAnswer, 
          batchDate: new Date().toLocaleString(),
          modelScore: Math.floor(Math.random() * 3) + 3
        };
      }
      return item;
    }));
    setEvalSubTab('completed');
  }, []);

  const updateScore = useCallback((id: string, type: 'model' | 'human', score: number) => {
    setEvaluations(prev => prev.map(e => {
      if (e.id === id) {
        const updated = type === 'model' ? { ...e, modelScore: score } : { ...e, humanScore: score };
        return updated;
      }
      return e;
    }));
  }, []);

  const updateRemark = useCallback((id: string, remark: string) => {
    setEvaluations(prev => prev.map(e => e.id === id ? { ...e, remark } : e));
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter(l => {
      if (l.userType !== logSubTab) return false;
      const matchName = !userNameSearch || l.userName.toLowerCase().includes(userNameSearch.toLowerCase());
      const matchContent = !contentSearch || l.content.toLowerCase().includes(contentSearch.toLowerCase());
      const matchDept = deptFilter === 'all' || l.department === deptFilter;
      const matchSource = sourceFilter === 'all' || l.source === sourceFilter;
      const matchOnline = onlineFilter === 'all' || l.isOnline === Number(onlineFilter);
      const matchFile = fileFilter === 'all' || l.isFileQA === Number(fileFilter);
      const matchKb = kbFilter === 'all' || l.isKnowledgeBase === Number(kbFilter);
      return matchName && matchContent && matchDept && matchSource && matchOnline && matchFile && matchKb;
    });
  }, [logs, logSubTab, userNameSearch, contentSearch, deptFilter, sourceFilter, onlineFilter, fileFilter, kbFilter]);

  const filterEvalItem = useCallback((item: EvaluationEntry) => {
    const matchName = !evalNameSearch || item.userName.toLowerCase().includes(evalNameSearch.toLowerCase());
    const matchContent = !evalContentSearch || item.content.toLowerCase().includes(evalContentSearch.toLowerCase());
    const matchDate = !evalDateSearch || (item.batchDate || item.joinedDate).includes(evalDateSearch);
    return matchName && matchContent && matchDate;
  }, [evalNameSearch, evalContentSearch, evalDateSearch]);

  const pendingEvals = useMemo(() => 
    evaluations
      .filter(e => e.status === 'pending')
      .filter(filterEvalItem)
      .sort((a, b) => new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime()), 
  [evaluations, filterEvalItem]);

  const completedEvals = useMemo(() => {
    return evaluations
      .filter(e => e.status === 'completed' && e.humanScore < 3)
      .filter(filterEvalItem)
      .filter(item => {
        const matchModel = modelScoreFilter === 'all' || item.modelScore === modelScoreFilter;
        const matchHuman = humanScoreFilter === 'all' || item.humanScore === humanScoreFilter;
        return matchModel && matchHuman;
      })
      .sort((a, b) => {
        if (!a.batchDate || !b.batchDate) return 0;
        return new Date(b.batchDate).getTime() - new Date(a.batchDate).getTime();
      });
  }, [evaluations, filterEvalItem, modelScoreFilter, humanScoreFilter]);

  const resolvedEvals = useMemo(() => {
    return evaluations
      .filter(e => e.status === 'completed' && e.humanScore >= 3)
      .filter(filterEvalItem)
      .sort((a, b) => {
        if (!a.batchDate || !b.batchDate) return 0;
        return new Date(b.batchDate).getTime() - new Date(a.batchDate).getTime();
      });
  }, [evaluations, filterEvalItem]);

  const handleDragStart = (index: number) => setDraggedColIndex(index);
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedColIndex === null || draggedColIndex === index) return;
    const newOrder = [...columnOrder];
    const draggedItem = newOrder.splice(draggedColIndex, 1)[0];
    newOrder.splice(index, 0, draggedItem);
    setColumnOrder(newOrder);
    setDraggedColIndex(index);
  };
  const handleDragEnd = () => setDraggedColIndex(null);

  const renderLogCell = (log: LogEntry, col: ColumnDef) => {
    switch (col.key) {
      case 'index':
        return <td key={col.key} className="px-4 py-4 border-r text-center font-mono text-gray-400">{log.index}</td>;
      case 'userName':
        return (
          <td key={col.key} className="px-4 py-4 border-r font-semibold text-gray-900">
            <button 
              onClick={() => transferUserType(log.userName, log.userType)}
              title={logSubTab === 'normal' ? "转为测试用户" : "恢复为普通用户"}
              className="text-blue-600 hover:text-blue-800 hover:underline transition-colors decoration-dotted"
            >
              {log.userName}
            </button>
          </td>
        );
      case 'userAccount':
        return <td key={col.key} className="px-4 py-4 border-r text-gray-500">{log.userAccount}</td>;
      case 'department':
        return <td key={col.key} className="px-4 py-4 border-r text-gray-500">{log.department}</td>;
      case 'content':
        return <CellContent key={col.key} text={log.content} />;
      case 'source':
        return <td key={col.key} className="px-4 py-4 border-r text-gray-400 uppercase font-mono text-xs">{log.source}</td>;
      case 'isOnline':
        return (
          <td key={col.key} className="px-4 py-4 border-r text-center">
            <Badge active={log.isOnline === 1} color="green" text={log.isOnline === 1 ? '是' : '否'} />
          </td>
        );
      case 'isFileQA':
        return (
          <td key={col.key} className="px-4 py-4 border-r text-center">
            <Badge active={log.isFileQA === 1} color="blue" text={log.isFileQA === 1 ? '是' : '否'} />
          </td>
        );
      case 'isKnowledgeBase':
        return (
          <td key={col.key} className="px-4 py-4 border-r text-center">
            <Badge active={log.isKnowledgeBase === 1} color="orange" text={log.isKnowledgeBase === 1 ? '是' : '否'} />
          </td>
        );
      case 'isDeepThinking':
        return (
          <td key={col.key} className="px-4 py-4 border-r text-center">
            <Badge active={log.isDeepThinking === 1} color="purple" text={log.isDeepThinking === 1 ? '是' : '否'} />
          </td>
        );
      case 'answerContent':
        return <CellContent key={col.key} text={log.answerContent} />;
      case 'actions':
        return (
          <td key={col.key} className="px-4 py-4 text-center sticky right-0 bg-white group-hover:bg-blue-50/20 z-[1] shadow-[-2px_0_5px_rgba(0,0,0,0.05)]">
            <button
              onClick={() => addToEvaluation(log)}
              disabled={log.isAddedToEval}
              className={`flex items-center justify-center px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                log.isAddedToEval 
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed border' 
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm active:scale-95'
              }`}
            >
              {log.isAddedToEval ? '已加入' : <><Plus size={14} className="mr-1" /> 加入测评集</>}
            </button>
          </td>
        );
      default:
        return <td key={col.key}></td>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 overflow-x-hidden">
      {/* Header */}
      <header className="bg-white border-b px-6 py-3 flex items-center justify-between shadow-sm sticky top-0 z-20">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Layers className="text-white" size={20} />
          </div>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">艾小夏测评系统</h1>
        </div>
        <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('normal')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeTab === 'normal' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            日志记录
          </button>
          <button 
            onClick={() => setActiveTab('eval')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all relative ${
              activeTab === 'eval' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            测评集
            {pendingEvals.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {pendingEvals.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 max-w-[1600px] mx-auto w-full space-y-6">
        {activeTab === 'normal' ? (
          <>
            {/* Filter Section */}
            <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase">用户名称</label>
                  <input 
                    type="text" 
                    value={userNameSearch}
                    onChange={(e) => setUserNameSearch(e.target.value)}
                    placeholder="输入名称" 
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm transition-all bg-gray-50/50" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase">提问内容</label>
                  <input 
                    type="text" 
                    value={contentSearch}
                    onChange={(e) => setContentSearch(e.target.value)}
                    placeholder="搜索提问关键词" 
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm transition-all bg-gray-50/50" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase">回答时间</label>
                  <div className="flex items-center space-x-2">
                    <input type="date" className="w-full px-2 py-2 border rounded-lg text-sm bg-gray-50/50" />
                    <span className="text-gray-400">-</span>
                    <input type="date" className="w-full px-2 py-2 border rounded-lg text-sm bg-gray-50/50" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t border-dashed">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center"><Filter size={10} className="mr-1"/> 用户部门</label>
                  <select 
                    value={deptFilter}
                    onChange={(e) => setDeptFilter(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    <option value="all">全部部门</option>
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center"><ArrowRightLeft size={10} className="mr-1 rotate-90"/> 来源渠道</label>
                  <select 
                    value={sourceFilter}
                    onChange={(e) => setSourceFilter(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    <option value="all">全部来源</option>
                    {sources.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center">联网搜索</label>
                  <select 
                    value={onlineFilter}
                    onChange={(e) => setOnlineFilter(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    <option value="all">全部</option>
                    <option value="1">是</option>
                    <option value="0">否</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center">文件问答</label>
                  <select 
                    value={fileFilter}
                    onChange={(e) => setFileFilter(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    <option value="all">全部</option>
                    <option value="1">是</option>
                    <option value="0">否</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center">知识库</label>
                  <select 
                    value={kbFilter}
                    onChange={(e) => setKbFilter(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    <option value="all">全部</option>
                    <option value="1">是</option>
                    <option value="0">否</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 border-t pt-4">
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold flex items-center hover:bg-blue-700 transition-all shadow-md active:scale-95">
                  <Search size={16} className="mr-2" /> 查询
                </button>
                <button 
                  onClick={resetLogFilters}
                  className="px-6 py-2 border bg-white text-gray-600 rounded-lg text-sm font-semibold flex items-center hover:bg-gray-50 transition-all"
                >
                  <RotateCcw size={16} className="mr-2" /> 重置
                </button>
              </div>
            </div>

            {/* Table Header Controls & Sub-tabs */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <div className="flex items-center justify-between border-b px-6 bg-gray-50/50">
                <div className="flex items-center pt-4">
                  <button 
                    onClick={() => setLogSubTab('normal')}
                    className={`px-6 py-3 text-sm font-bold flex items-center space-x-2 border-b-2 transition-all ${
                      logSubTab === 'normal' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <User size={16} />
                    <span>普通用户</span>
                    <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-[10px] ml-1">
                      {logs.filter(l => l.userType === 'normal').length}
                    </span>
                  </button>
                  <button 
                    onClick={() => setLogSubTab('test')}
                    className={`px-6 py-3 text-sm font-bold flex items-center space-x-2 border-b-2 transition-all ${
                      logSubTab === 'test' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <FlaskConical size={16} />
                    <span>测试用户</span>
                    <span className="bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full text-[10px] ml-1">
                      {logs.filter(l => l.userType === 'test').length}
                    </span>
                  </button>
                </div>
                <div className="flex items-center space-x-1">
                  <button title="刷新" className="p-2 hover:bg-white rounded-lg transition-colors text-gray-400"><RefreshCw size={16} /></button>
                  <button title="查看" className="p-2 hover:bg-white rounded-lg transition-colors text-gray-400"><Eye size={16} /></button>
                  <button title="切换" className="p-2 hover:bg-white rounded-lg transition-colors text-gray-400"><ArrowRightLeft size={16} className="rotate-90" /></button>
                  <button title="下载" className="p-2 hover:bg-white rounded-lg transition-colors text-gray-400"><Download size={16} /></button>
                  <button title="打印" className="p-2 hover:bg-white rounded-lg transition-colors text-gray-400"><Printer size={16} /></button>
                </div>
              </div>

              {/* Logs Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap table-auto border-collapse">
                  <thead className="bg-white border-b text-gray-500 font-bold text-[11px] uppercase tracking-wider select-none">
                    <tr>
                      {columnOrder.map((col, index) => (
                        <th 
                          key={col.key} 
                          draggable 
                          onDragStart={() => handleDragStart(index)}
                          onDragOver={(e) => handleDragOver(e, index)}
                          onDragEnd={handleDragEnd}
                          className={`px-4 py-3 border-r relative group cursor-move hover:bg-gray-50 transition-colors ${col.className || ''} ${draggedColIndex === index ? 'opacity-30' : 'opacity-100'}`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{col.label}</span>
                            <GripVertical size={12} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y bg-white">
                    {filteredLogs.length > 0 ? filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-blue-50/20 transition-colors group">
                        {columnOrder.map(col => renderLogCell(log, col))}
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={columnOrder.length} className="py-20 text-center text-gray-400">
                          暂无符合条件的{logSubTab === 'normal' ? '普通' : '测试'}用户记录
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          /* Evaluation Set View */
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase">姓名查询</label>
                  <input 
                    type="text" 
                    value={evalNameSearch}
                    onChange={(e) => setEvalNameSearch(e.target.value)}
                    placeholder="输入姓名" 
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50/50 outline-none focus:ring-1 focus:ring-blue-500" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase">提问内容</label>
                  <input 
                    type="text" 
                    value={evalContentSearch}
                    onChange={(e) => setEvalContentSearch(e.target.value)}
                    placeholder="提问关键字" 
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50/50 outline-none focus:ring-1 focus:ring-blue-500" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase">日期查询</label>
                  <input 
                    type="date" 
                    value={evalDateSearch}
                    onChange={(e) => setEvalDateSearch(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50/50 outline-none focus:ring-1 focus:ring-blue-500" 
                  />
                </div>
                <div className="flex items-end pb-0.5 space-x-2">
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold flex items-center justify-center hover:bg-blue-700 transition-all shadow-sm">
                    <Search size={14} className="mr-2" /> 搜索测评集
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <div className="flex items-center justify-between border-b px-6 bg-gray-50/50">
                <div className="flex items-center pt-4">
                  <button 
                    onClick={() => setEvalSubTab('pending')}
                    className={`px-6 py-3 text-sm font-bold flex items-center space-x-2 border-b-2 transition-all ${
                      evalSubTab === 'pending' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <Clock size={16} />
                    <span>待跑批测评</span>
                    {pendingEvals.length > 0 && <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-[10px] ml-1">{pendingEvals.length}</span>}
                  </button>
                  <button 
                    onClick={() => setEvalSubTab('completed')}
                    className={`px-6 py-3 text-sm font-bold flex items-center space-x-2 border-b-2 transition-all ${
                      evalSubTab === 'completed' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <CheckCircle2 size={16} />
                    <span>测评结果</span>
                    {completedEvals.length > 0 && <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded-full text-[10px] ml-1">{completedEvals.length}</span>}
                  </button>
                  <button 
                    onClick={() => setEvalSubTab('resolved')}
                    className={`px-6 py-3 text-sm font-bold flex items-center space-x-2 border-b-2 transition-all ${
                      evalSubTab === 'resolved' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <CheckSquare size={16} />
                    <span>已解决问题</span>
                    {resolvedEvals.length > 0 && <span className="bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full text-[10px] ml-1">{resolvedEvals.length}</span>}
                  </button>
                </div>
                <div className="flex items-center space-x-1">
                  <button title="刷新测评集" className="p-2 hover:bg-white rounded-lg transition-colors text-gray-400"><RefreshCw size={16} /></button>
                  <button title="下载测评报告" className="p-2 hover:bg-white rounded-lg transition-colors text-gray-400"><Download size={16} /></button>
                  <button title="打印报告" className="p-2 hover:bg-white rounded-lg transition-colors text-gray-400"><Printer size={16} /></button>
                </div>
              </div>

              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                      {evalSubTab === 'pending' ? <><Clock className="mr-2 text-blue-500" size={24}/>待跑批队列</> : evalSubTab === 'completed' ? <><CheckCircle2 className="mr-2 text-green-500" size={24}/>测评历史结果</> : <><CheckSquare className="mr-2 text-emerald-500" size={24}/>已解决问题库</>}
                    </h2>
                    <p className="text-sm text-gray-500 max-w-2xl mt-1">
                      {evalSubTab === 'pending' 
                        ? '待跑批测评列表已优化：提问内容字段已去掉固定宽度限制，隐藏了回答内容字段。点击开始跑批后生成新回答。' 
                        : '展示历史跑批测评数据。您可以对模型生成的新回答进行双重打分并添加备注。'}
                    </p>
                  </div>

                  {evalSubTab === 'pending' && pendingEvals.length > 0 && (
                    <button 
                      onClick={runBatchProcess}
                      className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
                    >
                      <Sparkles size={18} fill="currentColor" />
                      <span>开始模型跑批</span>
                    </button>
                  )}
                </div>

                {evalSubTab === 'pending' ? (
                  pendingEvals.length === 0 ? (
                    <EmptyState text="待跑批队列为空" />
                  ) : (
                    <div className="overflow-x-auto rounded-xl border shadow-inner bg-white">
                      <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50 border-b text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                          <tr>
                            <th className="px-4 py-4 border-r">加入日期</th>
                            <th className="px-4 py-4 border-r">姓名</th>
                            <th className="px-4 py-4 border-r">提问内容</th>
                            <th className="px-4 py-4 border-r text-center">来源</th>
                            <th className="px-4 py-4 border-r text-center">联网</th>
                            <th className="px-4 py-4 border-r text-center">文件</th>
                            <th className="px-4 py-4 border-r text-center">知识库</th>
                            <th className="px-4 py-4 border-r text-center">深度思考</th>
                            <th className="px-4 py-4 text-center sticky right-0 bg-gray-50 z-[1] shadow-[-2px_0_5px_rgba(0,0,0,0.05)]">操作</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {pendingEvals.map((item) => (
                            <tr key={item.id} className="hover:bg-blue-50/10 transition-colors group">
                              <td className="px-4 py-4 border-r font-mono text-xs text-gray-500">{item.joinedDate}</td>
                              <td className="px-4 py-4 border-r font-bold text-gray-900">{item.userName}</td>
                              <CellContent text={item.content} maxWidth="max-w-none" />
                              <td className="px-4 py-4 border-r text-center text-gray-400 font-mono text-xs">{item.source}</td>
                              <td className="px-4 py-4 border-r text-center">
                                <Badge active={item.isOnline === 1} color="green" text="联网" />
                              </td>
                              <td className="px-4 py-4 border-r text-center">
                                <Badge active={item.isFileQA === 1} color="blue" text="文件" />
                              </td>
                              <td className="px-4 py-4 border-r text-center">
                                <Badge active={item.isKnowledgeBase === 1} color="orange" text="知识库" />
                              </td>
                              <td className="px-4 py-4 border-r text-center">
                                <Badge active={item.isDeepThinking === 1} color="purple" text="深度" />
                              </td>
                              <td className="px-4 py-4 text-center sticky right-0 bg-white group-hover:bg-blue-50/10 z-[1] shadow-[-2px_0_5px_rgba(0,0,0,0.05)]">
                                <button
                                  onClick={() => removeFromEvaluation(item.id)}
                                  className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                  title="从测评集删除"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                ) : (
                  (evalSubTab === 'completed' ? completedEvals : resolvedEvals).length === 0 ? (
                    <EmptyState text="没有符合筛选条件的数据" />
                  ) : (
                    <div className="overflow-x-auto rounded-xl border shadow-inner bg-white">
                      <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50 border-b text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                          <tr>
                            <th className="px-4 py-4 border-r">跑批日期</th>
                            <th className="px-4 py-4 border-r">姓名</th>
                            <th className="px-4 py-4 border-r">提问内容</th>
                            <th className="px-4 py-4 border-r text-center">来源</th>
                            <th className="px-4 py-4 border-r text-center">联网</th>
                            <th className="px-4 py-4 border-r text-center">文件</th>
                            <th className="px-4 py-4 border-r text-center">知识库</th>
                            <th className="px-4 py-4 border-r text-center">深度思考</th>
                            <th className="px-4 py-4 border-r">回答内容</th>
                            <th className="px-4 py-4 border-r">模型打分</th>
                            <th className="px-4 py-4 border-r">人工打分</th>
                            <th className="px-4 py-4 border-r">备注</th>
                            <th className="px-4 py-4 text-center sticky right-0 bg-gray-50 z-[1] shadow-[-2px_0_5px_rgba(0,0,0,0.05)]">操作</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {(evalSubTab === 'completed' ? completedEvals : resolvedEvals).map((item) => (
                            <tr key={item.id} className={`${evalSubTab === 'resolved' ? 'hover:bg-emerald-50/10' : 'hover:bg-green-50/10'} transition-colors group`}>
                              <td className="px-4 py-4 border-r font-mono text-xs text-green-600 font-semibold">{item.batchDate}</td>
                              <td className="px-4 py-4 border-r font-bold text-gray-900">{item.userName}</td>
                              <CellContent text={item.content} />
                              <td className="px-4 py-4 border-r text-center text-gray-400 font-mono text-xs">{item.source}</td>
                              <td className="px-4 py-4 border-r text-center">
                                <Badge active={item.isOnline === 1} color="green" text="联网" />
                              </td>
                              <td className="px-4 py-4 border-r text-center">
                                <Badge active={item.isFileQA === 1} color="blue" text="文件" />
                              </td>
                              <td className="px-4 py-4 border-r text-center">
                                <Badge active={item.isKnowledgeBase === 1} color="orange" text="知识库" />
                              </td>
                              <td className="px-4 py-4 border-r text-center">
                                <Badge active={item.isDeepThinking === 1} color="purple" text="深度" />
                              </td>
                              <CellContent text={item.answerContent} />
                              <td className="px-4 py-4 border-r bg-gray-50/30">
                                <Rating 
                                  value={item.modelScore} 
                                  onChange={(val) => updateScore(item.id, 'model', val)} 
                                />
                              </td>
                              <td className="px-4 py-4 border-r">
                                <Rating 
                                  value={item.humanScore} 
                                  onChange={(val) => updateScore(item.id, 'human', val)} 
                                />
                              </td>
                              <td className="px-4 py-4 border-r min-w-[200px]">
                                <div className="flex items-center space-x-2 bg-gray-50/50 rounded px-2 py-1 group/remark">
                                  <MessageSquare size={12} className="text-gray-300 group-focus-within/remark:text-blue-500" />
                                  <input 
                                    type="text"
                                    value={item.remark || ''}
                                    onChange={(e) => updateRemark(item.id, e.target.value)}
                                    placeholder="点击输入备注..."
                                    className="bg-transparent border-none outline-none text-xs w-full text-gray-600 placeholder:text-gray-300"
                                  />
                                </div>
                              </td>
                              <td className="px-4 py-4 text-center sticky right-0 bg-white group-hover:bg-green-50/10 z-[1] shadow-[-2px_0_5px_rgba(0,0,0,0.05)]">
                                <button
                                  onClick={() => reAddToEvaluation(item)}
                                  disabled={item.isReAdded}
                                  className={`flex items-center justify-center px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                                    item.isReAdded 
                                    ? 'bg-gray-100 text-gray-300 cursor-not-allowed border' 
                                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm active:scale-95'
                                  }`}
                                >
                                  {item.isReAdded ? '已加入' : <><Plus size={14} className="mr-1" /> 加入测评集</>}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
