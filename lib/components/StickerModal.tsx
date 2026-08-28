"use client";

// app/lib/components/StickerModal.tsx
import { useState, useMemo } from "react";
import { X, Printer, CheckSquare, Square, QrCode, Search, FilterX, Globe, Calendar } from "lucide-react";

interface Device {
  device_sn: string;
  site_name: string;
  ip_address?: string;
  [key: string]: any;
}

export default function StickerModal({
  isOpen,
  onClose,
  devices,
}: {
  isOpen: boolean;
  onClose: () => void;
  devices: Device[];
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  // Har site ki individual date store karne ke liye state: { [device_sn]: "YYYY-MM-DD" }
  const [siteDates, setSiteDates] = useState<Record<string, string>>({});
  // Quick apply all date
  const [bulkDate, setBulkDate] = useState("");

  const filteredDevices = useMemo(() => {
    const keywords = searchQuery.toLowerCase().split(/[\s,]+/).filter((k) => k.length > 0);
    if (keywords.length === 0) return devices;
    return devices.filter((d) => {
      const siteInfo = `${d.site_name} ${d.device_sn} ${d.ip_address || ""}`.toLowerCase();
      return keywords.some((key) => siteInfo.includes(key));
    });
  }, [devices, searchQuery]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleSelectAll = () => {
    const allFilteredIds = filteredDevices.map((d) => d.device_sn);
    const areAllFilteredSelected = allFilteredIds.every((id) => selectedIds.includes(id));
    if (areAllFilteredSelected) {
      setSelectedIds((prev) => prev.filter((id) => !allFilteredIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...allFilteredIds])));
    }
  };

  const handleDateChange = (id: string, dateVal: string) => {
    setSiteDates((prev) => ({
      ...prev,
      [id]: dateVal,
    }));
  };

  const handleApplyBulkDate = () => {
    if (!bulkDate) return;
    const updated: Record<string, string> = { ...siteDates };
    selectedIds.forEach((id) => {
      updated[id] = bulkDate;
    });
    setSiteDates(updated);
  };

  const handleGenerate = () => {
    const selectedData = devices
      .filter((d) => selectedIds.includes(d.device_sn))
      .map((d) => ({
        ...d,
        service_date: siteDates[d.device_sn] || "", // User ki enter ki hui date pass hogi
      }));

    localStorage.setItem("print_stickers", JSON.stringify(selectedData));
    window.open("/admin/print-stickers", "_blank");
  };

  if (!isOpen) return null;

  return (
    <div className="animate-in fade-in fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md duration-300">
      <div className="animate-in zoom-in flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-[40px] bg-white shadow-2xl duration-300">
        
        {/* --- FIXED HEADER --- */}
        <div className="z-30 flex shrink-0 items-center justify-between border-b border-slate-100 bg-slate-50 p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-blue-600 p-2.5 shadow-lg shadow-blue-100">
              <QrCode size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg leading-none font-[1000] text-slate-900 uppercase italic">Sticker Terminal</h2>
              <p className="mt-1 font-bold tracking-widest text-[10px] text-slate-400 uppercase">Select Sites & Set Service Date</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-xl border border-slate-200 bg-white p-2 text-slate-400 shadow-sm transition-all active:scale-90">
            <X size={18} strokeWidth={3} />
          </button>
        </div>

        {/* --- SCROLLABLE CONTAINER --- */}
        <div className="custom-scroll relative flex-1 overflow-y-auto bg-[#fcfdfe]">
          
          {/* SEARCH INPUT */}
          <div className="bg-white px-6 pt-3 pb-2">
            <div className="relative">
              <Search className="absolute top-1/2 left-4 -translate-y-1/2 text-blue-500" size={16} />
              <input
                type="text"
                autoComplete="off"
                placeholder="Search: site, sn, ip..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-3.5 pl-11 pr-10 bg-slate-50 border-2 border-slate-50 rounded-[18px] outline-none font-bold text-slate-700 shadow-inner focus:border-blue-500 focus:bg-white transition-all text-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 bg-slate-200 hover:bg-red-100 text-slate-500 hover:text-red-500 rounded-full transition-all"
                >
                  <X size={12} strokeWidth={4} />
                </button>
              )}
            </div>
          </div>

          {/* BULK DATE BAR & SELECTION COUNT */}
          <div className="sticky top-0 z-20 flex flex-col gap-2 border-b border-slate-100 bg-white/95 px-6 py-2.5 shadow-sm backdrop-blur-md">
            <div className="flex items-center justify-between">
              <p className="font-black tracking-widest text-[10px] text-slate-400 uppercase">
                Selected: <span className="font-[1000] text-blue-600 italic">{selectedIds.length}</span>
              </p>
              <button
                onClick={handleSelectAll}
                className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 font-[1000] tracking-[1px] text-[9px] text-blue-600 uppercase shadow-sm transition-all active:scale-95"
              >
                {filteredDevices.length > 0 && filteredDevices.every((d) => selectedIds.includes(d.device_sn))
                  ? "Deselect Result"
                  : `Select Result (${filteredDevices.length})`}
              </button>
            </div>

            {/* Quick Bulk Date Row */}
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2 border-t border-slate-100 pt-1">
                <Calendar size={13} className="shrink-0 text-blue-600" />
                <span className="shrink-0 font-bold text-[9px] text-slate-500 uppercase">Set Date for All:</span>
                <input
                  type="date"
                  value={bulkDate}
                  onChange={(e) => setBulkDate(e.target.value)}
                  className="p-1 px-2 text-[10px] font-bold border border-slate-200 rounded-lg outline-none bg-slate-50 focus:border-blue-500 text-slate-700"
                />
                <button
                  type="button"
                  onClick={handleApplyBulkDate}
                  className="rounded-lg bg-blue-600 px-2.5 py-1 font-black tracking-wider text-[9px] text-white uppercase transition-all hover:bg-blue-700"
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          {/* LIST BODY */}
          <div className="space-y-2.5 p-5">
            {filteredDevices.length > 0 ? (
              filteredDevices.map((device) => {
                const isSelected = selectedIds.includes(device.device_sn);
                return (
                  <div
                    key={device.device_sn}
                    className={`flex flex-col gap-2 p-3.5 rounded-[22px] border-2 transition-all group ${
                      isSelected
                        ? "border-blue-500 bg-blue-50/40 shadow-md shadow-blue-50"
                        : "border-slate-100 bg-white hover:border-slate-200"
                    }`}
                  >
                    <div className="flex cursor-pointer items-center gap-3" onClick={() => toggleSelect(device.device_sn)}>
                      <div
                        className={`p-1.5 rounded-xl border-2 transition-all ${
                          isSelected ? "bg-blue-600 border-blue-600 shadow-sm" : "bg-slate-50 border-slate-200"
                        }`}
                      >
                        {isSelected ? <CheckSquare size={14} className="text-white" /> : <Square size={14} className="text-transparent" />}
                      </div>

                      <div className="flex-1">
                        <p className="text-xs font-[1000] tracking-tight text-slate-800 uppercase italic">{device.site_name}</p>
                        <div className="mt-0.5 flex items-center gap-2">
                          <span className="rounded border border-slate-100 bg-slate-50 px-1.5 py-0.5 font-mono font-bold text-[8.5pt] text-slate-400 uppercase">
                            SN: {device.device_sn}
                          </span>
                          {device.ip_address && (
                            <div className="flex items-center gap-1 font-black text-[8.5pt] text-blue-400">
                              <Globe size={9} /> {device.ip_address}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Individual Date Field (Visible when site is selected) */}
                    {isSelected && (
                      <div className="mt-1 flex items-center gap-2 border-t border-blue-100/60 pt-2 pl-8">
                        <label className="font-black tracking-wider text-[8.5pt] text-slate-500 uppercase">Service Date:</label>
                        <input
                          type="date"
                          value={siteDates[device.device_sn] || ""}
                          onChange={(e) => handleDateChange(device.device_sn, e.target.value)}
                          className="p-1 px-2 text-[9pt] font-bold border border-blue-200 rounded-md outline-none bg-white text-blue-900 focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center gap-3 py-16 text-center opacity-30">
                <FilterX size={36} className="text-slate-300" />
                <p className="font-black tracking-[3px] text-[9px] uppercase">No sites match search</p>
              </div>
            )}
          </div>
        </div>

        {/* --- FIXED FOOTER ACTION --- */}
        <div className="z-30 shrink-0 border-t border-slate-100 bg-slate-50 p-6">
          <button
            disabled={selectedIds.length === 0}
            onClick={handleGenerate}
            className="flex w-full items-center justify-center gap-3 rounded-[28px] border-[#0a2e5c] border-b-[5px] bg-[#1a4a8d] py-4 text-sm font-[1000] tracking-[2px] text-white uppercase italic shadow-xl transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-30"
          >
            <Printer size={18} strokeWidth={3} />
            <span>Generate {selectedIds.length} Stickers</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        .custom-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}