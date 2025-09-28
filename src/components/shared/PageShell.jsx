import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRGBParty } from "@/contexts/RGBPartyContext";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import PropTypes from "prop-types";

/**
 * Unified page shell component that provides consistent styling across all pages.
 * Handles theme support, responsive layout, and standardized spacing/colors.
 */
export function PageShell({
  title,
  description,
  icon: Icon,
  children,
  actions, // Main action buttons (replaces headerActions)
  statusIndicator, // Status indicator component
  stats = [], // Array of stat badges
  className = "",
  contentClassName = "",
  iconColor = "emerald", // Section color: emerald, blue, purple, orange, cyan
}) {
  // Icon color mapping for different sections
  const getIconColorClass = (color) => {
    const colorMap = {
      emerald: "text-emerald-400",
      blue: "text-blue-400",
      purple: "text-purple-400",
      orange: "text-orange-400",
      cyan: "text-cyan-400",
      slate: "text-slate-400",
    };
    return colorMap[color] || "text-emerald-400";
  };

  const { isRGBPartyMode, toggleRGBPartyMode } = useRGBParty();

  return (
    <div className={`${className}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex justify-between items-start"
          >
            <div>
              <h1 className="text-3xl font-light text-slate-900 dark:text-white mb-2 tracking-tight flex items-center gap-3">
                {Icon && (
                  <Icon className={`w-7 h-7 ${getIconColorClass(iconColor)}`} />
                )}
                {title}
                {/* Secret RGB Party Toggle - Click the sparkles! */}
                <Sparkles
                  className={`w-4 h-4 ml-2 cursor-pointer transition-all duration-300 ${
                    isRGBPartyMode
                      ? "text-pink-400 animate-spin"
                      : "text-slate-300 dark:text-slate-600 hover:text-slate-400 dark:hover:text-slate-500 opacity-5 hover:opacity-20 dark:opacity-10 dark:hover:opacity-30"
                  }`}
                  onClick={toggleRGBPartyMode}
                  title={
                    isRGBPartyMode
                      ? "Turn off RGB Party Mode"
                      : "Secret Easter Eggs! Try: Ctrl+Alt+P (Party), Ctrl+Alt+H (Heal), Ctrl+Alt+S (Sparkles)"
                  }
                />
              </h1>
              {description && (
                <p className="text-base text-slate-600 dark:text-slate-400 font-light ml-10">
                  {description}
                </p>
              )}
            </div>

            {/* Header Actions & Stats */}
            <div className="flex items-center gap-4">
              {/* Stats Badges */}
              {stats.length > 0 && (
                <div className="flex gap-2">
                  {stats.map((stat, index) => (
                    <Badge
                      key={index}
                      variant={stat.variant || "secondary"}
                      className="text-sm"
                    >
                      {stat.label}: {stat.value}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Status Indicator */}
              <div title="Current system status and AI service availability">
                {statusIndicator}
              </div>

              {/* Custom Actions */}
              {actions}
            </div>
          </motion.div>
        </header>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className={`${contentClassName}`}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}

/**
 * Standardized card wrapper for consistent styling (optional use)
 */
export function PageCard({
  title,
  description,
  children,
  className = "",
  contentClassName = "",
  headerActions,
}) {
  // If no title, just return children (minimal wrapper)
  if (!title) {
    return (
      <div className={`${className}`}>
        <div className={`${contentClassName}`}>{children}</div>
      </div>
    );
  }

  return (
    <Card
      className={`bg-card border-border shadow-sm transition-colors duration-300 ${className}`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-xl font-light text-slate-900 dark:text-white">
            {title}
          </CardTitle>
          {description && (
            <CardDescription className="text-base text-slate-600 dark:text-slate-400 font-light">
              {description}
            </CardDescription>
          )}
        </div>
        {headerActions}
      </CardHeader>
      <CardContent className={`space-y-4 ${contentClassName}`}>
        {children}
      </CardContent>
    </Card>
  );
}

/**
 * Status indicator component for API/service states
 */
export function StatusIndicator({ status, labels = {} }) {
  const getStatusInfo = () => {
    switch (status) {
      case "ready":
      case "online":
        return {
          color: "bg-emerald-500 text-emerald-50",
          text: labels.ready || "Ready",
          dotColor: "bg-emerald-400",
        };
      case "slow":
      case "warning":
        return {
          color: "bg-yellow-500 text-yellow-50",
          text: labels.slow || "Slow",
          dotColor: "bg-yellow-400",
        };
      case "offline":
      case "error":
        return {
          color: "bg-red-500 text-red-50",
          text: labels.offline || "Offline",
          dotColor: "bg-red-400",
        };
      default:
        return {
          color: "bg-slate-500 text-slate-50",
          text: labels.unknown || "Unknown",
          dotColor: "bg-slate-400",
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-2 h-2 rounded-full ${statusInfo.dotColor} animate-pulse`}
      />
      <Badge className={`${statusInfo.color} border-0`}>
        {statusInfo.text}
      </Badge>
    </div>
  );
}

// PropTypes definitions
PageShell.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  icon: PropTypes.elementType,
  children: PropTypes.node,
  actions: PropTypes.node,
  statusIndicator: PropTypes.node,
  stats: PropTypes.array,
  className: PropTypes.string,
  contentClassName: PropTypes.string,
  iconColor: PropTypes.string,
};

StatusIndicator.propTypes = {
  status: PropTypes.oneOf([
    "online",
    "offline",
    "loading",
    "error",
    "ready",
    "processing",
  ]),
  labels: PropTypes.object,
};

export default PageShell;
