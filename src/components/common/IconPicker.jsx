import React, { useState, useRef, useEffect } from 'react';
import * as MdIcons from 'react-icons/md';

const ICONOS_SUGERIDOS = [
  // Académico y Estudio
  'MdSchool', 'MdBiotech', 'MdScience', 'MdComputer', 'MdMenuBook', 
  'MdArchitecture', 'MdHistoryEdu', 'MdBrush', 'MdCalculate', 'MdLanguage',
  
  // Administrativo y Oficinas
  'MdBusinessCenter', 'MdMeetingRoom', 'MdPrint', 'MdWork', 'MdAssignment', 
  'MdInfo', 'MdGavel', 'MdContactPage', 'MdCorporateFare', 'MdSupervisedUserCircle',
  
  // Servicios Básicos y Alimentación
  'MdWc', 'MdRestaurant', 'MdCoffee', 'MdLocalDining', 'MdFastfood', 
  'MdLocalHospital', 'MdLocalPharmacy', 'MdStore', 'MdAtm', 'MdWifi',
  
  // Deportes y Recreación
  'MdSportsSoccer', 'MdSportsBasketball', 'MdSportsTennis', 'MdFitnessCenter', 
  'MdSportsEsports', 'MdPool', 'MdTheaterComedy', 'MdMuseum', 'MdStadium',
  
  // Exteriores y Áreas Comunes
  'MdPark', 'MdDomain', 'MdGrass', 'MdDeck', 'MdNaturePeople',
  'MdAccountTree', 'MdFestival', 'MdCampaign', 'MdGroups', 'MdEvent',
  
  // Transporte y Accesibilidad
  'MdLocalParking', 'MdDirectionsBus', 'MdDirectionsWalk', 'MdAccessible', 
  'MdElevator', 'MdStairs', 'MdDirectionsCar', 'MdCommute', 'MdPedalBike',
  
  // Ubicación y Seguridad
  'MdPlace', 'MdMap', 'MdSecurity', 'MdWarning', 'MdEmergency'
];

export default function IconPicker({ iconoActual, onChange, label, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const CurrentIcon = (iconoActual && MdIcons[iconoActual]) ? MdIcons[iconoActual] : null;

  return (
    <div className={`flex flex-col gap-2 items-start w-full relative ${className}`} ref={wrapperRef}>
      {label && (
        <label className="font-['Plus_Jakarta_Sans'] font-medium text-[14px] text-[#040f0f]">
          {label}
        </label>
      )}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white border border-[#090909] flex items-center justify-between p-3 rounded-[8px] w-full text-left focus:outline-none"
      >
        <div className="flex items-center gap-2">
          {CurrentIcon && <CurrentIcon className="text-[20px] text-gray-700 shrink-0" />}
          <span className={`font-['Plus_Jakarta_Sans'] font-normal text-[14px] ${iconoActual ? 'text-black' : 'text-[#a3a3a3]'}`}>
            {iconoActual || 'Seleccionar un ícono...'}
          </span>
        </div>
        <MdIcons.MdArrowDropDown className="text-[20px] text-gray-500 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-[12px] shadow-lg border border-gray-200 z-[60] max-h-[240px] overflow-y-auto p-3 custom-scrollbar">
          <div className="grid grid-cols-5 gap-2">
            {ICONOS_SUGERIDOS.map((iconName) => {
              const IconComp = MdIcons[iconName];
              if (!IconComp) return null;
              const isSelected = iconoActual === iconName;
              
              return (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => {
                    onChange(iconName);
                    setIsOpen(false);
                  }}
                  className={`flex flex-col items-center justify-center p-2 rounded-[8px] transition-colors
                    ${isSelected ? 'bg-[#e8f0fe] text-[#155dfc] border border-[#155dfc]' : 'bg-gray-50 hover:bg-gray-100 text-[#4a4a4a] border border-transparent'}
                  `}
                  title={iconName}
                >
                  <IconComp className="text-[22px]" />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
