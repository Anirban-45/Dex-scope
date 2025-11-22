import { motion } from "framer-motion";

interface StatBarProps {
  name: string;
  value: number;
  maxValue?: number;
  delay?: number;
}

const StatBar = ({ name, value, maxValue = 255, delay = 0 }: StatBarProps) => {
  const percentage = (value / maxValue) * 100;
  
  const getStatColor = (value: number) => {
    if (value >= 150) return "#00C2B8";
    if (value >= 120) return "#23CD5E";
    if (value >= 90) return "#A0E515";
    if (value >= 60) return "#FFDD57";
    if (value >= 30) return "#FF7F0F";
    return "#F34444";
  };

  const formatStatName = (statName: string) => {
    return statName
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold text-foreground">
          {formatStatName(name)}
        </span>
        <span className="text-sm font-bold text-primary">{value}</span>
      </div>
      <div className="h-3 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full shadow-[var(--shadow-stat)]"
          style={{ backgroundColor: getStatColor(value) }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, delay, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

export default StatBar;
