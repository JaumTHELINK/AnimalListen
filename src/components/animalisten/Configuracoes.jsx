import { useState, useRef } from 'react';
import { Palette, Upload, Settings } from 'lucide-react';

export default function Configuracoes() {
  const [customColor, setCustomColor] = useState('#0855a1');
  const [customLogo, setCustomLogo] = useState(null);
  const logoInputRef = useRef(null);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setCustomLogo(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-icon" style={{ background: 'var(--primary)' }}>
            <Settings size={24} color="white" />
          </div>
          <div>
            <h1 className="page-title">Configurações</h1>
            <p className="page-subtitle">Personalize o sistema conforme sua necessidade</p>
          </div>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '600px' }}>
        <div className="section-header" style={{ marginBottom: '16px' }}>
          <div className="section-icon blue">
            <Palette size={18} />
          </div>
          <h3>Personalização do Prontuário</h3>
        </div>

        <div className="form-group">
          <label className="form-label">Cor do Cabeçalho</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="color-picker"
            />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{customColor}</span>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Logo do Estabelecimento</label>
          <div
            className="logo-upload-area"
            onClick={() => logoInputRef.current?.click()}
          >
            {customLogo ? (
              <img src={customLogo} alt="Logo" className="logo-preview" />
            ) : (
              <>
                <Upload size={20} style={{ color: 'var(--text-muted)' }} />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Upload logo</span>
              </>
            )}
          </div>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            style={{ display: 'none' }}
          />
          {customLogo && (
            <button className="btn btn-outline btn-sm mt-2 w-full" onClick={() => setCustomLogo(null)}>
              Remover logo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
