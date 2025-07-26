// Spa Eastman permanent background component
export function SpaBackground() {
  return (
    <div className="fixed inset-0 z-0">
      {/* Spa Eastman authentic gradient background using brand colors */}
      <div 
        className="absolute inset-0" 
        style={{
          background: `
            linear-gradient(135deg, 
              rgba(54, 69, 92, 0.95) 0%,
              rgba(120, 140, 107, 0.9) 35%,
              rgba(133, 161, 171, 0.85) 65%,
              rgba(214, 204, 194, 0.8) 100%
            ),
            radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 70% 80%, rgba(120, 140, 107, 0.2) 0%, transparent 50%)
          `
        }}
      />
      
      {/* Floating spa elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Zen circles in spa green tones */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full border border-white/20 animate-pulse" style={{ borderColor: 'rgba(120, 140, 107, 0.3)' }} />
        <div className="absolute top-3/4 right-1/4 w-24 h-24 rounded-full border border-white/15 animate-pulse delay-1000" style={{ borderColor: 'rgba(133, 161, 171, 0.25)' }} />
        <div className="absolute top-1/2 left-3/4 w-16 h-16 rounded-full border border-white/10 animate-pulse delay-2000" style={{ borderColor: 'rgba(214, 204, 194, 0.2)' }} />
        
        {/* Water ripples effect */}
        <div className="absolute bottom-0 left-0 w-full h-64">
          <svg className="w-full h-full opacity-20" viewBox="0 0 1200 320" preserveAspectRatio="none">
            <path
              d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,128C960,128,1056,192,1152,208C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              fill="rgba(120,140,107,0.15)"
              className="animate-pulse"
            />
          </svg>
        </div>
      </div>
      
      {/* Subtle texture overlay */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}