import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon, Clock, User, MapPin, Search, ChevronRight,
  RefreshCcw, AlertCircle, Phone, Package,
  ChevronLeft, ChevronRight as ChevronRightIcon, CalendarDays,
  Timer, CheckCircle2,
  Wrench, ShieldCheck, X, CheckCircle, AlertTriangle, Users,
  ClipboardCheck
} from 'lucide-react';
import { subscribeToOrders, updateOrder } from '../../services/orderService';
import { getTechnicians } from '../../services/userService';
import { Order } from '../../types/order';
import { AuthUser } from '../../types/auth';
import { format, isSameDay, addDays, subDays, isBefore, startOfWeek, eachDayOfInterval } from 'date-fns';
import { toast, Toaster } from 'react-hot-toast';

const SchedulePage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [technicians, setTechnicians] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<'daily' | 'unscheduled'>('daily');
  const [selectedTechId, setSelectedTechId] = useState<string>('all');

  // Scheduling Modal States
  const [schedulingOrder, setSchedulingOrder] = useState<Order | null>(null);
  const [targetDateTime, setTargetDateTime] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setLoading(true);
    const unsubOrders = subscribeToOrders((data) => {
      setOrders(data);
      setLoading(false);
    });

    const fetchTechs = async () => {
      try {
        const techs = await getTechnicians();
        setTechnicians(techs);
      } catch (e) {
        console.error("Lỗi tải danh sách KTV");
      }
    };
    fetchTechs();

    return () => unsubOrders();
  }, []);

  const safeToDate = (date: any): Date | null => {
    if (!date) return null;
    if (typeof date.toDate === 'function') return date.toDate();
    const d = new Date(date);
    return isNaN(d.getTime()) ? null : d;
  };

  // --- LOGIC LỌC DỮ LIỆU ---
  const filteredOrders = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return orders.filter(o => {
      const matchesSearch =
        (o.customerName || '').toLowerCase().includes(term) ||
        (o.phoneNumber || '').includes(term) ||
        (o.productName || '').toLowerCase().includes(term);

      const matchesTech = selectedTechId === 'all' ||
        o.technicians?.some(t => t.id === selectedTechId);

      return matchesSearch && matchesTech && o.status !== 'deleted';
    });
  }, [orders, searchTerm, selectedTechId]);

  const dailyOrders = useMemo(() => {
    return filteredOrders.filter(o => {
      const d = safeToDate(o.scheduledDate);
      return d && isSameDay(d, selectedDate) && o.status !== 'cancelled';
    }).sort((a, b) => {
      const dateA = safeToDate(a.scheduledDate)!;
      const dateB = safeToDate(b.scheduledDate)!;
      return dateA.getTime() - dateB.getTime();
    });
  }, [filteredOrders, selectedDate]);

  const backlogOrders = useMemo(() => {
    return filteredOrders.filter(o =>
      (o.status === 'assigned' || o.status === 'pending') && !o.scheduledDate
    );
  }, [filteredOrders]);

  const stats = useMemo(() => ({
    today: dailyOrders.length,
    backlog: backlogOrders.length,
    done: dailyOrders.filter(o => o.status === 'completed' || o.status === 'paid').length
  }), [dailyOrders, backlogOrders]);

  // --- VALIDATION & UPDATE LOGIC ---
  const handleConfirmSchedule = async () => {
    const newErrors: Record<string, string> = {};
    if (!schedulingOrder) return;

    if (!targetDateTime) {
      newErrors.dateTime = "Bắt buộc phải chọn thời gian hẹn khách";
    } else {
      const newDate = new Date(targetDateTime);
      const now = new Date();

      if (isBefore(newDate, now)) {
        newErrors.dateTime = "Lỗi: Không được chọn thời gian trong quá khứ";
      }

      // Check Business Hours: 07:30 - 19:00
      const hour = newDate.getHours();
      const min = newDate.getMinutes();
      const timeVal = hour * 60 + min;
      if (timeVal < 7 * 60 + 30 || timeVal > 19 * 60) {
        newErrors.dateTime = "Lưu ý: Thời gian nằm ngoài giờ hành chính (07:30 - 19:00)";
      }
    }

    if (!schedulingOrder.technicians || schedulingOrder.technicians.length === 0) {
      newErrors.technicians = "Cần có Kỹ thuật viên phụ trách trước khi xếp lịch!";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      if (newErrors.technicians) toast.error(newErrors.technicians);
      return;
    }

    try {
      await updateOrder(schedulingOrder.id, {
        scheduledDate: new Date(targetDateTime),
        status: schedulingOrder.status === 'pending' ? 'assigned' : schedulingOrder.status
      });
      toast.success("Đã kích hoạt lịch trình thành công");
      setSchedulingOrder(null);
      setTargetDateTime('');
      if (activeTab === 'unscheduled') setActiveTab('daily');
    } catch (error) {
      toast.error("Lỗi cập nhật dữ liệu");
    }
  };

  const getOrderTypeTag = (type: string) => {
    switch (type) {
      case 'maintenance': return { icon: <ShieldCheck size={12} />, label: 'Bảo trì', class: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
      case 'repair': return { icon: <Wrench size={12} />, label: 'Sửa chữa', class: 'bg-rose-50 text-rose-600 border-rose-100' };
      default: return { icon: <Package size={12} />, label: 'Lắp đặt', class: 'bg-blue-50 text-blue-600 border-blue-100' };
    }
  };

  return (
    <div className="p-4 md:p-8 bg-[#f8fafc] dark:bg-[#0f172a] min-h-screen font-sans text-left transition-all">
      <Toaster position="top-right" />

      {/* --- HEADER --- */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-10">
        <div>
          <h1 className="text-2xl font-black text-[#0b1c30] dark:text-white uppercase tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-[#00459a]">
              <CalendarDays size={28} />
            </div>
            Điều Phối & Lịch Trình
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-[11px] font-black uppercase tracking-widest mt-1">Quản lý lộ trình thi công AquaCare thực tế</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
          <div className="relative w-full sm:w-72">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
             <input
                type="text" placeholder="Tìm theo tên, SĐT, Sản phẩm..." value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-slate-800 rounded-2xl outline-none text-xs font-bold uppercase shadow-sm focus:ring-2 ring-[#00459a]/10"
             />
          </div>

          <div className="flex bg-white dark:bg-[#1e293b] p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm w-full sm:w-auto">
            <button onClick={() => setActiveTab('daily')} className={`flex-1 sm:flex-none px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'daily' ? 'bg-[#00459a] text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:bg-slate-50'}`}>
              <Clock size={14} /> Lịch trình
            </button>
            <button onClick={() => setActiveTab('unscheduled')} className={`flex-1 sm:flex-none px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 relative ${activeTab === 'unscheduled' ? 'bg-[#00459a] text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:bg-slate-50'}`}>
              <AlertCircle size={14} /> Hàng đợi
              {stats.backlog > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center text-[9px] font-black border-2 border-white dark:border-slate-800 animate-pulse shadow-md">{stats.backlog}</span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
        {/* --- LEFT SIDE: Calendar & Stats --- */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-white dark:bg-[#1e293b] p-8 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
             <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                   <button onClick={() => setSelectedDate(subDays(selectedDate, 7))} className="p-1.5 bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"><ChevronLeft size={16} /></button>
                   <div className="text-center">
                     <p className="text-[11px] font-black text-[#0b1c30] dark:text-white uppercase tracking-widest">
                       Tháng {format(selectedDate, 'M/yyyy')}
                     </p>
                   </div>
                   <button onClick={() => setSelectedDate(addDays(selectedDate, 7))} className="p-1.5 bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"><ChevronRightIcon size={16} /></button>
                </div>
                <div className="grid grid-cols-7 gap-1.5">
                   {eachDayOfInterval({ 
                     start: startOfWeek(selectedDate, { weekStartsOn: 1 }), 
                     end: addDays(startOfWeek(selectedDate, { weekStartsOn: 1 }), 6) 
                   }).map(date => {
                      const isSelected = isSameDay(date, selectedDate);
                      const isToday = isSameDay(date, new Date());
                      const count = filteredOrders.filter(o => {
                         const d = safeToDate(o.scheduledDate);
                         return d && isSameDay(d, date) && o.status !== 'cancelled';
                      }).length;
                      
                      return (
                         <button 
                            key={date.toISOString()}
                            onClick={() => setSelectedDate(date)}
                            className={`flex flex-col items-center py-2.5 rounded-xl border ${
                               isSelected 
                                 ? 'bg-[#00459a] border-[#00459a] text-white shadow-lg shadow-blue-500/30' 
                                 : isToday
                                    ? 'bg-blue-50 border-blue-100 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800'
                                    : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50 dark:bg-[#1e293b] dark:border-slate-800 dark:text-slate-300 hover:border-blue-200'
                            } transition-all`}
                         >
                            <span className={`text-[9px] font-black uppercase mb-1 ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>{date.getDay() === 0 ? 'CN' : `T${date.getDay() + 1}`}</span>
                            <span className="text-sm font-black">{format(date, 'd')}</span>
                            <div className="flex gap-0.5 mt-1.5 h-1.5">
                               {count > 0 && <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-rose-500'}`} />}
                               {count > 3 && <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-rose-500'}`} />}
                               {count > 5 && <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-rose-500'}`} />}
                            </div>
                         </button>
                      );
                   })}
                </div>
             </div>

             <div className="space-y-4 mb-8">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Users size={12} /> Bộ lọc nhân sự</label>
                <select value={selectedTechId} onChange={(e) => setSelectedTechId(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none font-black text-[10px] uppercase text-slate-600 dark:text-white transition-all focus:ring-2 ring-blue-500/10">
                  <option value="all">TẤT CẢ KỸ THUẬT VIÊN</option>
                  {technicians.map(t => <option key={t.uid} value={t.uid}>{t.displayName.toUpperCase()}</option>)}
                </select>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-5 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Số ca hẹn</p>
                   <p className="text-2xl font-black text-[#0b1c30] dark:text-white">{stats.today}</p>
                </div>
                <div className="p-5 bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl border border-emerald-100 dark:border-emerald-800">
                   <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-1.5">Xong</p>
                   <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{stats.done}</p>
                </div>
             </div>

             <button onClick={() => setSelectedDate(new Date())} className="w-full py-4 bg-[#00459a] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:brightness-110 transition-all shadow-xl shadow-blue-500/30 flex items-center justify-center gap-2">
                <RefreshCcw size={16} /> Về ngày hiện tại
             </button>
          </div>
        </div>

        {/* --- MAIN LIST --- */}
        <div className="xl:col-span-3 space-y-6">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-40 opacity-50">
                <RefreshCcw className="animate-spin text-[#00459a] mb-5" size={56} />
                <p className="text-xs font-black uppercase tracking-[0.3em]">Đang đồng bộ dữ liệu...</p>
             </div>
          ) : (activeTab === 'daily' ? dailyOrders : backlogOrders).length > 0 ? (
            (activeTab === 'daily' ? dailyOrders : backlogOrders).map((order) => {
              const typeTag = getOrderTypeTag(order.orderType);
              const orderTime = safeToDate(order.scheduledDate);

              return (
                <div key={order.id} className="group bg-white dark:bg-[#1e293b] rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col md:flex-row hover:shadow-2xl transition-all duration-300 transform hover:translate-y-[-4px]">
                  <div className={`md:w-48 p-8 flex flex-col justify-center items-center border-r border-slate-100 dark:border-slate-800 ${activeTab === 'daily' ? 'bg-slate-50/50 dark:bg-slate-900/50' : 'bg-rose-50/30'}`}>
                    {activeTab === 'daily' ? (
                      <>
                        <Clock size={28} className="mb-3 text-[#00459a]" />
                        <span className="text-3xl font-black text-[#0b1c30] dark:text-white tracking-tighter">
                          {orderTime ? format(orderTime, 'HH:mm') : '--:--'}
                        </span>
                        <div className={`mt-4 px-4 py-1.5 rounded-full text-[9px] font-black uppercase border flex items-center gap-1.5 shadow-sm ${typeTag.class}`}>
                           {typeTag.icon} {typeTag.label}
                        </div>
                      </>
                    ) : (
                      <>
                        <Timer size={36} className="mb-3 text-rose-500 animate-pulse" />
                        <span className="text-[10px] font-black text-rose-600 uppercase text-center leading-tight tracking-widest px-4">Đợi xếp giờ hẹn</span>
                        <div className={`mt-4 px-4 py-1.5 rounded-full text-[9px] font-black uppercase border flex items-center gap-1.5 shadow-sm ${typeTag.class}`}>
                           {typeTag.icon} {typeTag.label}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex-1 p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-2 gap-10 text-left">
                    <div className="space-y-6">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-3xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-[#00459a] border border-blue-100 shrink-0 shadow-inner">
                          <User size={24} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Khách hàng</p>
                          <p className="text-base font-black text-[#0b1c30] dark:text-white uppercase truncate">{order.customerName}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <Phone size={12} className="text-blue-500" />
                            <p className="text-xs text-slate-600 dark:text-slate-400 font-black">{order.phoneNumber}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-900/50 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                        <MapPin size={18} className="text-rose-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed italic line-clamp-2 uppercase">{order.address}</p>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between gap-8">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Nội dung</p>
                          <div className="flex items-center gap-3">
                             <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-500 border border-blue-100/50 shadow-sm"><Package size={18} /></div>
                             <span className="text-[13px] font-black text-slate-700 dark:text-slate-200 uppercase truncate max-w-[220px]">{order.productName || 'Dịch vụ thi công'}</span>
                          </div>
                        </div>
                        <div className="text-right">
                           <span className={`px-4 py-2 rounded-2xl text-[9px] font-black uppercase border shadow-sm ${
                              order.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                              order.status === 'processing' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                              'bg-amber-50 text-amber-600 border-amber-100'
                           }`}>
                              {order.status === 'assigned' ? 'Đã giao ca' : order.status === 'processing' ? 'Đang thi công' : 'Hoàn tất'}
                           </span>
                        </div>
                      </div>

                      {activeTab === 'unscheduled' ? (
                        <button onClick={() => { setSchedulingOrder(order); setTargetDateTime(''); setErrors({}); }} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-[2rem] font-black text-[12px] uppercase tracking-[0.2em] shadow-xl shadow-blue-500/30 active:scale-95 transition-all flex items-center justify-center gap-3">
                           <Timer size={20} /> Thiết lập thời gian thi công
                        </button>
                      ) : (
                        <div className="flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-800">
                           <div className="flex flex-col gap-2">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Kỹ thuật viên phụ trách</p>
                              <div className="flex items-center gap-3">
                                 <div className="flex -space-x-2.5">
                                    {order.technicians && order.technicians.length > 0 ? order.technicians.map((t, idx) => (
                                       <div key={idx} className="w-10 h-10 rounded-full bg-[#00459a] border-4 border-white dark:border-[#1e293b] flex items-center justify-center text-[10px] font-black text-white shadow-sm ring-1 ring-blue-100" title={t.name}>{t.name.charAt(0)}</div>
                                    )) : (
                                       <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 border-4 border-white"><User size={16} /></div>
                                    )}
                                 </div>
                                 <span className="text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase">
                                    {order.technicians && order.technicians.length > 0 ? `${order.technicians.length} Nhân sự` : 'Chưa gán'}
                                 </span>
                              </div>
                           </div>
                           <button onClick={() => window.location.href=`/orders?id=${order.id}`} className="px-8 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black text-[#00459a] uppercase rounded-[1.5rem] flex items-center gap-2 hover:bg-blue-50 transition-all shadow-sm">
                              Chi tiết ca <ChevronRight size={18} />
                           </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white dark:bg-[#1e293b] rounded-[4rem] p-32 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 transition-all">
               <div className="w-32 h-32 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-10 shadow-inner ring-[16px] ring-slate-50/50 dark:ring-slate-900/50">
                  <CalendarIcon size={64} className="text-slate-200" />
               </div>
               <h3 className="text-2xl font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Danh sách trống</h3>
               <p className="text-slate-400 text-sm mt-3 max-w-sm mx-auto font-medium leading-relaxed">
                  {activeTab === 'daily' ? 'Không có ca làm việc nào được ghi nhận cho ngày này.' : 'Tuyệt vời! Hệ thống đã được điều phối xong, không còn đơn hàng nào đợi xếp lịch.'}
               </p>
            </div>
          )}
        </div>
      </div>

      {/* --- MODAL XẾP LỊCH & VALIDATION --- */}
      {schedulingOrder && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300 text-left">
           <div className="bg-white dark:bg-[#1e293b] rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in duration-300 border border-white/10 flex flex-col">
              <div className="p-10 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/20">
                 <div className="flex items-center gap-5 text-left">
                    <div className="w-14 h-14 bg-blue-600 text-white rounded-3xl flex items-center justify-center shadow-xl shadow-blue-500/40"><Timer size={28} /></div>
                    <div>
                       <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-base">Xác Nhận Giờ Hẹn</h3>
                       <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">Cập nhật lộ trình cho Kỹ thuật viên</p>
                    </div>
                 </div>
                 <button onClick={() => setSchedulingOrder(null)} className="p-3 text-slate-300 hover:text-rose-500 transition-colors bg-white dark:bg-slate-800 rounded-2xl shadow-sm"><X size={28} /></button>
              </div>

              <div className="p-10 space-y-8 overflow-y-auto max-h-[70vh] custom-scrollbar text-left">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2"><ClipboardCheck size={12} /> Thông tin thi công</label>
                    <div className="p-5 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-3">
                       <p className="text-sm font-black text-[#0b1c30] dark:text-white uppercase flex items-center gap-2"><User size={14} className="text-blue-500" /> {schedulingOrder.customerName}</p>
                       <p className="text-xs font-bold text-slate-500 flex items-center gap-2"><Package size={14} className="text-slate-400" /> {schedulingOrder.productName}</p>
                       <div className="flex gap-2">
                         {schedulingOrder.technicians?.map(t => (
                           <span key={t.id} className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase">#{t.name}</span>
                         ))}
                       </div>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="flex justify-between items-center">
                       <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1">Chọn Ngày & Giờ đến nhà khách</label>
                       <span className="text-[9px] font-bold text-slate-400 uppercase italic">Giờ làm: 07:30 - 19:00</span>
                    </div>
                    <div className="relative group">
                       <CalendarIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-500 z-10" size={20} />
                       <input
                         type="datetime-local"
                         value={targetDateTime}
                         onChange={(e) => { setTargetDateTime(e.target.value); setErrors({}); }}
                         className={`w-full pl-14 pr-6 py-5 bg-blue-50/50 dark:bg-blue-900/10 border-2 ${errors.dateTime ? 'border-rose-500' : 'border-blue-100 focus:border-blue-500'} dark:border-blue-900/30 rounded-3xl outline-none font-black text-sm text-[#00459a] dark:text-blue-400 transition-all shadow-inner`}
                       />
                    </div>
                    {errors.dateTime && <p className="text-[11px] font-black text-rose-500 mt-2 ml-1 flex items-center gap-1 animate-in slide-in-from-top-1"><AlertTriangle size={14} /> {errors.dateTime}</p>}
                    {!errors.dateTime && (
                      <p className="text-[10px] text-slate-400 font-bold italic ml-1 flex items-center gap-2 uppercase tracking-tighter">
                         <CheckCircle2 size={12} className="text-emerald-500" /> Lịch này sẽ tự động xuất hiện trên App của Kỹ thuật viên.
                      </p>
                    )}
                 </div>

                 <div className="pt-6 flex gap-4">
                    <button onClick={() => setSchedulingOrder(null)} className="flex-1 py-5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-3xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95">Hủy bỏ</button>
                    <button onClick={handleConfirmSchedule} className="flex-[2] py-5 bg-[#00459a] text-white rounded-3xl font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-blue-500/40 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3">
                       <CheckCircle size={20} /> Chốt lịch làm việc
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default SchedulePage;
