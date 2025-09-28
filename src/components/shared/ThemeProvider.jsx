import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

// Predefined theme colors
export const THEME_COLORS = {
  emerald: { name: "Emerald", hue: 140 },
  blue: { name: "Ocean Blue", hue: 200 },
  purple: { name: "Royal Purple", hue: 270 },
  rose: { name: "Rose", hue: 350 },
  amber: { name: "Amber", hue: 45 },
  cyan: { name: "Cyan", hue: 180 },
  custom: { name: "Custom", hue: null },
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Check localStorage first, default to dark
    if (typeof window !== "undefined") {
      return localStorage.getItem("emeraldmind-theme") || "dark";
    }
    return "dark";
  });

  const [themeColor, setThemeColor] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("emeraldmind-theme-color") || "emerald";
    }
    return "emerald";
  });

  const [customHue, setCustomHue] = useState(() => {
    if (typeof window !== "undefined") {
      return parseInt(localStorage.getItem("emeraldmind-custom-hue") || "140");
    }
    return 140;
  });

  const [themeStrength, setThemeStrength] = useState(() => {
    if (typeof window !== "undefined") {
      return parseFloat(
        localStorage.getItem("emeraldmind-theme-strength") || "0.8"
      );
    }
    return 0.8;
  });

  useEffect(() => {
    // Apply theme to document
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Apply custom color theme if not default
    if (themeColor !== "default") {
      const hue =
        themeColor === "custom"
          ? customHue
          : THEME_COLORS[themeColor]?.hue || 140;
      applyCustomColors(root, hue, theme, themeStrength);
    } else {
      // Reset to default theme - remove custom properties so CSS takes over
      const customProps = [
        "--background",
        "--foreground",
        "--card",
        "--card-foreground",
        "--popover",
        "--popover-foreground",
        "--primary",
        "--primary-foreground",
        "--secondary",
        "--secondary-foreground",
        "--muted",
        "--muted-foreground",
        "--accent",
        "--accent-foreground",
        "--border",
        "--input",
        "--ring",
        "--sidebar-background",
        "--sidebar-foreground",
        "--sidebar-primary",
        "--sidebar-primary-foreground",
        "--sidebar-accent",
        "--sidebar-accent-foreground",
        "--sidebar-border",
        "--sidebar-ring",
      ];

      customProps.forEach((prop) => {
        root.style.removeProperty(prop);
      });
    }

    // Save to localStorage
    localStorage.setItem("emeraldmind-theme", theme);
    localStorage.setItem("emeraldmind-theme-color", themeColor);
    localStorage.setItem("emeraldmind-custom-hue", customHue.toString());
    localStorage.setItem(
      "emeraldmind-theme-strength",
      themeStrength.toString()
    );
  }, [theme, themeColor, customHue, themeStrength]);

  const applyCustomColors = (root, hue, currentTheme, strength = 0.8) => {
    // Calculate color intensity based on strength (0.0 to 1.0)
    // At 0% strength: use subtle colors, At 100% strength: use vibrant saturated colors
    const baseSaturation = Math.round(20 + strength * 60); // 20% to 80% saturation
    const accentSaturation = Math.round(40 + strength * 50); // 40% to 90% saturation
    const backgroundSaturation = Math.round(15 + strength * 45); // 15% to 60% saturation

    if (currentTheme === "light") {
      // Light theme colors with much more impactful saturation
      root.style.setProperty(
        "--background",
        `${hue} ${backgroundSaturation}% 96%`
      );
      root.style.setProperty(
        "--foreground",
        `${hue} ${Math.round(strength * 25)}% 15%`
      );
      root.style.setProperty("--card", `${hue} ${backgroundSaturation}% 97%`);
      root.style.setProperty(
        "--card-foreground",
        `${hue} ${Math.round(strength * 25)}% 20%`
      );
      root.style.setProperty(
        "--popover",
        `${hue} ${backgroundSaturation}% 97%`
      );
      root.style.setProperty(
        "--popover-foreground",
        `${hue} ${Math.round(strength * 25)}% 15%`
      );
      root.style.setProperty("--primary", `${hue} ${accentSaturation}% 35%`);
      root.style.setProperty(
        "--primary-foreground",
        `${hue} ${Math.round(strength * 30)}% 97%`
      );
      root.style.setProperty("--secondary", `${hue} ${baseSaturation}% 90%`);
      root.style.setProperty(
        "--secondary-foreground",
        `${hue} ${Math.round(strength * 35)}% 20%`
      );
      root.style.setProperty("--muted", `${hue} ${baseSaturation}% 92%`);
      root.style.setProperty(
        "--muted-foreground",
        `${hue} ${Math.round(strength * 30)}% 45%`
      );
      root.style.setProperty("--accent", `${hue} ${baseSaturation}% 90%`);
      root.style.setProperty(
        "--accent-foreground",
        `${hue} ${Math.round(strength * 35)}% 20%`
      );
      root.style.setProperty(
        "--border",
        `${hue} ${Math.round(strength * 35)}% 85%`
      );
      root.style.setProperty(
        "--input",
        `${hue} ${Math.round(strength * 35)}% 85%`
      );
      root.style.setProperty("--ring", `${hue} ${accentSaturation}% 25%`);

      // Sidebar colors with more impact
      root.style.setProperty(
        "--sidebar-background",
        `${hue} ${backgroundSaturation}% 94%`
      );
      root.style.setProperty(
        "--sidebar-foreground",
        `${hue} ${Math.round(strength * 30)}% 25%`
      );
      root.style.setProperty(
        "--sidebar-primary",
        `${hue} ${accentSaturation}% 35%`
      );
      root.style.setProperty(
        "--sidebar-primary-foreground",
        `${hue} ${Math.round(strength * 30)}% 97%`
      );
      root.style.setProperty(
        "--sidebar-accent",
        `${hue} ${baseSaturation}% 88%`
      );
      root.style.setProperty(
        "--sidebar-accent-foreground",
        `${hue} ${Math.round(strength * 35)}% 20%`
      );
      root.style.setProperty(
        "--sidebar-border",
        `${hue} ${Math.round(strength * 40)}% 82%`
      );
      root.style.setProperty(
        "--sidebar-ring",
        `${hue} ${accentSaturation}% 50%`
      );
    } else {
      // Dark theme colors with much more impactful hue effects
      const darkAccentSat = Math.round(40 + strength * 50); // 40% to 90% in dark mode
      const darkBaseSat = Math.round(10 + strength * 25); // 10% to 35% for backgrounds
      root.style.setProperty(
        "--background",
        `${hue} ${Math.round(strength * 15)}% ${3.9 - Number(strength) * 1}%`
      ); // More noticeable tint
      root.style.setProperty(
        "--foreground",
        `${hue} ${Math.round(strength * 10)}% 98%`
      );
      root.style.setProperty(
        "--card",
        `${hue} ${Math.round(strength * 15)}% ${3.9 - Number(strength) * 1}%`
      );
      root.style.setProperty(
        "--card-foreground",
        `${hue} ${Math.round(strength * 10)}% 98%`
      );
      root.style.setProperty(
        "--popover",
        `${hue} ${Math.round(strength * 15)}% ${3.9 - Number(strength) * 1}%`
      );
      root.style.setProperty(
        "--popover-foreground",
        `${hue} ${Math.round(strength * 10)}% 98%`
      );
      root.style.setProperty(
        "--primary",
        `${hue} ${darkAccentSat}% ${55 + strength * 15}%`
      ); // Much brighter and more saturated
      root.style.setProperty("--primary-foreground", "0 0% 9%");
      root.style.setProperty("--secondary", `${hue} ${darkBaseSat}% 14.9%`);
      root.style.setProperty(
        "--secondary-foreground",
        `${hue} ${Math.round(strength * 10)}% 98%`
      );
      root.style.setProperty("--muted", `${hue} ${darkBaseSat}% 14.9%`);
      root.style.setProperty(
        "--muted-foreground",
        `${hue} ${Math.round(strength * 15)}% 63.9%`
      );
      root.style.setProperty(
        "--accent",
        `${hue} ${Math.round(strength * 25)}% 16%`
      ); // More noticeable tint
      root.style.setProperty(
        "--accent-foreground",
        `${hue} ${Math.round(strength * 10)}% 98%`
      );
      root.style.setProperty(
        "--border",
        `${hue} ${Math.round(strength * 20)}% 15%`
      ); // More visible tint
      root.style.setProperty(
        "--input",
        `${hue} ${Math.round(strength * 20)}% 15%`
      );
      root.style.setProperty(
        "--ring",
        `${hue} ${darkAccentSat}% ${55 + strength * 15}%`
      );

      // Sidebar colors for dark mode
      root.style.setProperty(
        "--sidebar-background",
        `0 0% ${3.9 - strength * 1}%`
      );
      root.style.setProperty("--sidebar-foreground", "0 0% 98%");
      root.style.setProperty(
        "--sidebar-primary",
        `${hue} ${darkAccentSat}% ${50 + strength * 10}%`
      );
      root.style.setProperty("--sidebar-primary-foreground", "0 0% 9%");
      root.style.setProperty(
        "--sidebar-accent",
        `${hue} ${Math.round(strength * 10)}% 14.9%`
      );
      root.style.setProperty("--sidebar-accent-foreground", "0 0% 98%");
      root.style.setProperty(
        "--sidebar-border",
        `${hue} ${Math.round(strength * 5)}% 14.9%`
      );
      root.style.setProperty(
        "--sidebar-ring",
        `${hue} ${darkAccentSat}% ${50 + strength * 10}%`
      );
    }
  };

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  const setCustomThemeColor = (colorKey) => {
    setThemeColor(colorKey);
  };

  const setCustomThemeHue = (hue) => {
    setCustomHue(hue);
  };

  const setCustomThemeStrength = (strength) => {
    setThemeStrength(Math.max(0, Math.min(1, strength))); // Clamp between 0 and 1
  };

  const getThemeStrength = () => {
    if (themeColor === "default") return 0;
    return themeStrength; // Use the user-controlled strength value
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        themeColor,
        customHue,
        themeStrength,
        setCustomThemeColor,
        setCustomThemeHue,
        setCustomThemeStrength,
        getThemeStrength,
        THEME_COLORS,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};
