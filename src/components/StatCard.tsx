import React from "react";

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  onClick: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, bgColor, onClick }) => {
  return (
    <div
      className={`
        p-4 rounded-lg shadow-md cursor-pointer ${bgColor} 
        hover:shadow-lg 
        hover:scale-105 
        transition-transform 
        duration-550`}
      onClick={onClick}
    >
      <div className="flex items-center">
        <Icon className={`w-6 h-6 ${color}`} />
        <div className="ml-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default StatCard;