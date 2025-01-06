import React from "react";
import { effectsDiv, effectsH3, effectsIcon, effectsOnclic, effectsP} from "../styles/theme";

interface StatCardProps {
  title: string;
  value: number|null;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  onClick: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, bgColor, onClick }) => {
  return (
    <div className={`${effectsOnclic.effect1} ${bgColor}`} onClick={onClick}>
      <div className="flex items-center">
        <Icon className={`${effectsIcon.taille} ${color}`} />
        <div className={effectsDiv.marginLeft}>
          <h3 className={effectsH3.title}>{title}</h3>
          <p className={effectsP.value}>{value}</p>
        </div>
      </div>
    </div>
  );
};

export default StatCard;