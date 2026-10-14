'use client';

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { addFarmer, deleteFarmer, addVisit, clearError } from '@/redux/slices/farmerSlice';
import { Farmer, FarmVisit, VisitStatus, VisitType } from '@/types';

export default function HomePage() {
  const dispatch = useDispatch();
  const { farmers, visits, error } = useSelector((state: RootState) => state.farmer);

  // Tab Seçimi (Dashboard / Çiftçiler / Ziyaretler)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'farmers' | 'visits'>('dashboard');

  // Çiftçi Arama & Filtreleme
  const [searchQuery, setSearchQuery] = useState('');

  // Çiftçi Form State
  const [fullName, setFullName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [region, setRegion] = useState('');
  const [district, setDistrict] = useState('');
  const [formError, setFormError] = useState('');

  // Ziyaret Form State
  const [selectedFarmerId, setSelectedFarmerId] = useState<number | ''>('');
  const [visitDate, setVisitDate] = useState('');
  const [visitType, setVisitType] = useState<VisitType>('Routine');
  const [status, setStatus] = useState<VisitStatus>('Planned');
  const [notes, setNotes] = useState('');
  const [nextVisitDate, setNextVisitDate] = useState('');

  // İş Kuralı 7: TC Kimlik & Telefon Doğrulaması
  const validateFarmerForm = () => {
    if (nationalId.length !== 11 || !/^\d+$/.test(nationalId)) {
      setFormError('TC Kimlik Numarası 11 haneli rakamlardan oluşmalıdır.');
      return false;
    }
    if (phoneNumber.length < 10) {
      setFormError('Geçerli bir telefon numarası giriniz.');
      return false;
    }
    setFormError('');
    return true;
  };

  // Çiftçi Ekleme
  const handleFarmerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateFarmerForm()) return;

    const newFarmer: Farmer = {
      id: Date.now(),
      fullName,
      nationalId,
      phoneNumber,
      region,
      district,
      createdAt: new Date().toISOString(),
    };

    dispatch(addFarmer(newFarmer));
    setFullName('');
    setNationalId('');
    setPhoneNumber('');
    setRegion('');
    setDistrict('');
  };

  // Ziyaret Ekleme ve İş Kuralları Kontrolü
  const handleVisitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFarmerId || !visitDate) return;

    const today = new Date().toISOString().split('T')[0];

    // İş Kuralı 1: Geçmiş bir tarih için Planned durumunda ziyaret oluşturulamaz
    if (status === 'Planned' && visitDate < today) {
      alert('İş Kuralı İhlali: Geçmiş bir tarih için Planned (Planlanan) durumunda ziyaret oluşturulamaz!');
      return;
    }

    // İş Kuralı 3: Completed durumundaki ziyaretin Notes alanı boş bırakılamaz
    if (status === 'Completed' && !notes.trim()) {
      alert('İş Kuralı İhlali: Tamamlanan (Completed) ziyaretlerde not alanı boş bırakılamaz!');
      return;
    }

    // İş Kuralı 4: NextVisitDate, VisitDate değerinden önce olamaz
    if (nextVisitDate && nextVisitDate < visitDate) {
      alert('İş Kuralı İhlali: Sonraki Ziyaret Tarihi, Ziyaret Tarihinden önce olamaz!');
      return;
    }

    // İş Kuralı 5: Aynı çiftçi için aynı gün ve aynı ziyaret türünde ikinci kayıt oluşturulamaz
    const isDuplicate = visits.some(
      (v) =>
        v.farmerId === Number(selectedFarmerId) &&
        v.visitDate === visitDate &&
        v.visitType === visitType
    );
    if (isDuplicate) {
      alert('İş Kuralı İhlali: Aynı çiftçi için aynı gün ve aynı ziyaret türünde ikinci kayıt oluşturulamaz!');
      return;
    }

    const newVisit: FarmVisit = {
      id: Date.now(),
      farmerId: Number(selectedFarmerId),
      visitDate,
      visitType,
      notes,
      status,
      nextVisitDate,
      createdAt: new Date().toISOString(),
    };

    dispatch(addVisit(newVisit));
    setNotes('');
    setNextVisitDate('');
    alert('Ziyaret kaydı başarıyla oluşturuldu!');
  };

  // Çiftçi Arama Filtresi (Ad, Bölge veya Telefon Numarası ile)
  const filteredFarmers = farmers.filter(
    (f) =>
      f.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.phoneNumber.includes(searchQuery)
  );

  // Dashboard İstatistikleri
  const plannedCount = visits.filter((v) => v.status === 'Planned').length;
  const completedCount = visits.filter((v) => v.status === 'Completed').length;

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* Başlık ve Sekmeler */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Tarımsal Saha Ziyareti Yönetim Sistemi</h1>
          <p className="text-gray-600 mt-1">Stajyer Web Geliştirme Teknik Değerlendirme Görevi</p>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'dashboard' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-600'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('farmers')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'farmers' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-600'
            }`}
          >
            Çiftçi Yönetimi
          </button>
          <button
            onClick={() => setActiveTab('visits')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'visits' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-600'
            }`}
          >
            Saha Ziyaretleri
          </button>
        </div>
      </header>

      {/* Genel Hata Mesajı (İş Kuralı 6 Uyarısı vb.) */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => dispatch(clearError())} className="font-bold text-sm">
            Kapat
          </button>
        </div>
      )}

      {/* DASHBOARD SEKMESİ */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-sm text-gray-500 font-medium">Toplam Çiftçi Sayısı</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{farmers.length}</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-sm text-gray-500 font-medium">Toplam Ziyaret Sayısı</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{visits.length}</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-sm text-gray-500 font-medium">Planlanan Ziyaretler</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{plannedCount}</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-sm text-gray-500 font-medium">Tamamlanan Ziyaretler</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{completedCount}</p>
            </div>
          </div>
        </div>
      )}

      {/* ÇİFTÇİ YÖNETİMİ SEKMESİ */}
      {activeTab === 'farmers' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Yeni Çiftçi Kaydı</h2>
            {formError && <p className="text-red-500 text-xs mb-3">{formError}</p>}
            <form onSubmit={handleFarmerSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad (FullName)</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-gray-900"
                  placeholder="Ahmet Yılmaz"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kimlik No (NationalId)</label>
                <input
                  type="text"
                  required
                  maxLength={11}
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-gray-900"
                  placeholder="11 Haneli TC Kimlik"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefon (PhoneNumber)</label>
                <input
                  type="text"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-gray-900"
                  placeholder="05XXXXXXXXX"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bölge/İl (Region)</label>
                  <input
                    type="text"
                    required
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-gray-900"
                    placeholder="Ankara"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">İlçe (District)</label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-gray-900"
                    placeholder="Gölbaşı"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg transition"
              >
                Çiftçi Kaydet
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
              <h2 className="text-xl font-semibold text-gray-800">Kayıtlı Çiftçiler ({filteredFarmers.length})</h2>
              <input
                type="text"
                placeholder="Ad, bölge veya telefon ile ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-1.5 border rounded-lg text-sm w-full md:w-64 text-gray-900"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b text-sm text-gray-600 bg-gray-50">
                    <th className="p-3">Ad Soyad</th>
                    <th className="p-3">TC Kimlik</th>
                    <th className="p-3">Telefon</th>
                    <th className="p-3">Bölge / İlçe</th>
                    <th className="p-3 text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {filteredFarmers.map((f) => (
                    <tr key={f.id} className="hover:bg-gray-50">
                      <td className="p-3 font-medium text-gray-900">{f.fullName}</td>
                      <td className="p-3 text-gray-600">{f.nationalId}</td>
                      <td className="p-3 text-gray-600">{f.phoneNumber}</td>
                      <td className="p-3 text-gray-600">{f.region} / {f.district}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => dispatch(deleteFarmer(f.id))}
                          className="text-red-600 hover:bg-red-50 text-xs px-2.5 py-1 rounded border border-red-200"
                        >
                          Sil
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SAHA ZİYARETLERİ SEKMESİ */}
      {activeTab === 'visits' && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Yeni Saha Ziyareti Planla</h2>
          <form onSubmit={handleVisitSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Çiftçi Seç</label>
              <select
                required
                value={selectedFarmerId}
                onChange={(e) => setSelectedFarmerId(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg text-gray-900"
              >
                <option value="">Seçiniz...</option>
                {farmers.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.fullName} ({f.region})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ziyaret Tarihi (VisitDate)</label>
              <input
                type="date"
                required
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ziyaret Türü (VisitType)</label>
              <select
                value={visitType}
                onChange={(e) => setVisitType(e.target.value as VisitType)}
                className="w-full px-3 py-2 border rounded-lg text-gray-900"
              >
                <option value="Routine">Routine (Rutin)</option>
                <option value="Training">Training (Eğitim)</option>
                <option value="Inspection">Inspection (Denetim)</option>
                <option value="Emergency">Emergency (Acil)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Durum (Status)</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as VisitStatus)}
                className="w-full px-3 py-2 border rounded-lg text-gray-900"
              >
                <option value="Planned">Planned (Planlandı)</option>
                <option value="Completed">Completed (Tamamlandı)</option>
                <option value="Cancelled">Cancelled (İptal Edildi)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sonraki Ziyaret Tarihi (NextVisitDate)</label>
              <input
                type="date"
                value={nextVisitDate}
                onChange={(e) => setNextVisitDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notlar (Notes)</label>
              <input
                type="text"
                placeholder="Ziyaret notları..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-gray-900"
              />
            </div>

            <div className="md:col-span-3">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2.5 rounded-lg transition"
              >
                Ziyaret Oluştur
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}