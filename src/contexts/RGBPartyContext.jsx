import { createContext, useContext, useEffect, useState } from "react";

const RGBPartyContext = createContext();

export const useRGBParty = () => {
  const context = useContext(RGBPartyContext);
  if (!context) {
    throw new Error("useRGBParty must be used within an RGBPartyProvider");
  }
  return context;
};

export const RGBPartyProvider = ({ children }) => {
  const [isRGBPartyMode, setIsRGBPartyMode] = useState(false);
  const [currentHue, setCurrentHue] = useState(0);

  // RGB cycling effect
  useEffect(() => {
    if (!isRGBPartyMode) return;

    const interval = setInterval(() => {
      setCurrentHue((prev) => (prev + 1) % 360);
    }, 50); // Fast cycling for party effect

    return () => clearInterval(interval);
  }, [isRGBPartyMode]);

  // Apply CSS custom properties for RGB colors
  useEffect(() => {
    if (isRGBPartyMode) {
      const hue1 = currentHue;
      const hue2 = (currentHue + 120) % 360;
      const hue3 = (currentHue + 240) % 360;

      document.documentElement.style.setProperty(
        "--rgb-party-primary",
        `hsl(${hue1}, 70%, 50%)`
      );
      document.documentElement.style.setProperty(
        "--rgb-party-secondary",
        `hsl(${hue2}, 70%, 50%)`
      );
      document.documentElement.style.setProperty(
        "--rgb-party-accent",
        `hsl(${hue3}, 70%, 50%)`
      );
      document.documentElement.style.setProperty(
        "--rgb-party-glow",
        `hsl(${hue1}, 70%, 50%, 0.3)`
      );

      document.body.classList.add("rgb-party-mode");
    } else {
      document.body.classList.remove("rgb-party-mode");
      // Reset to default colors
      document.documentElement.style.removeProperty("--rgb-party-primary");
      document.documentElement.style.removeProperty("--rgb-party-secondary");
      document.documentElement.style.removeProperty("--rgb-party-accent");
      document.documentElement.style.removeProperty("--rgb-party-glow");
    }
  }, [isRGBPartyMode, currentHue]);

  const toggleRGBPartyMode = () => {
    setIsRGBPartyMode(!isRGBPartyMode);
  };

  // Secret key combination listeners for various easter eggs
  useEffect(() => {
    const handleKeyDown = (event) => {
      // RGB Party Mode (Ctrl+Alt+P)
      if (event.ctrlKey && event.altKey && event.key === "P") {
        event.preventDefault();
        toggleRGBPartyMode();
      }

      // Secret Konami Code: ↑↑↓↓←→←→BA

      // Pokemon Center Heal Sound (Ctrl+Alt+H)
      if (event.ctrlKey && event.altKey && event.key === "H") {
        event.preventDefault();
        playPokemonCenterHeal();
      }

      // Shiny Sparkle Effect (Ctrl+Alt+S)
      if (event.ctrlKey && event.altKey && event.key === "S") {
        event.preventDefault();
        triggerShinySparkles();
      }

      // Secret Pikachu Sound (Ctrl+Alt+I for "Pika")
      if (event.ctrlKey && event.altKey && event.key === "I") {
        event.preventDefault();
        triggerPikachuCry();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isRGBPartyMode]);

  // Easter Egg Functions
  const playPokemonCenterHeal = () => {
    // Create a healing animation effect
    const healDiv = document.createElement("div");
    healDiv.innerHTML = "💚 Your Pokemon have been healed! 💚";
    healDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(45deg, #10b981, #34d399);
      color: white;
      padding: 20px 40px;
      border-radius: 20px;
      font-size: 24px;
      font-weight: bold;
      z-index: 10000;
      animation: healPulse 3s ease-in-out;
      pointer-events: none;
      box-shadow: 0 0 40px rgba(16, 185, 129, 0.5);
    `;

    // Add healing animation keyframes if not already added
    if (!document.getElementById("heal-animation-styles")) {
      const style = document.createElement("style");
      style.id = "heal-animation-styles";
      style.textContent = `
        @keyframes healPulse {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
          20% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
          80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(healDiv);
    setTimeout(() => healDiv.remove(), 3000);
  };

  const triggerShinySparkles = () => {
    // Create multiple sparkle elements
    for (let i = 0; i < 12; i++) {
      const sparkle = document.createElement("div");
      sparkle.innerHTML = "*";
      sparkle.style.cssText = `
        position: fixed;
        top: ${20 + Math.random() * 60}%;
        left: ${20 + Math.random() * 60}%;
        font-size: ${20 + Math.random() * 30}px;
        z-index: 10000;
        pointer-events: none;
        animation: sparkleFloat ${2 + Math.random() * 2}s ease-out forwards;
      `;

      document.body.appendChild(sparkle);
      setTimeout(() => sparkle.remove(), 4000);
    }

    // Add sparkle animation if not already added
    if (!document.getElementById("sparkle-animation-styles")) {
      const style = document.createElement("style");
      style.id = "sparkle-animation-styles";
      style.textContent = `
        @keyframes sparkleFloat {
          0% { opacity: 0; transform: translateY(0px) rotate(0deg); }
          10% { opacity: 1; }
          100% { opacity: 0; transform: translateY(-100px) rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
  };

  const triggerPikachuCry = () => {
    // Create a Pikachu cry effect with ASCII art
    const pikachuDiv = document.createElement("div");
    pikachuDiv.innerHTML = `
      <div style="text-align: center; font-family: monospace;">
        <div style="font-size: 20px; margin-bottom: 10px;">⚡ PIKA PIKA! ⚡</div>
        <pre style="color: #fbbf24; margin: 0; line-height: 1;">
     (\__/)
    (  o.o )
     > ^ <
        </pre>
      </div>
    `;
    pikachuDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(45deg, #f59e0b, #fbbf24);
      color: white;
      padding: 20px;
      border-radius: 15px;
      z-index: 10000;
      animation: pikachuBounce 2s ease-in-out;
      pointer-events: none;
      box-shadow: 0 0 40px rgba(245, 158, 11, 0.5);
      border: 3px solid #fbbf24;
    `;

    // Add Pikachu animation
    if (!document.getElementById("pikachu-animation-styles")) {
      const style = document.createElement("style");
      style.id = "pikachu-animation-styles";
      style.textContent = `
        @keyframes pikachuBounce {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.3) rotate(-10deg); }
          20% { opacity: 1; transform: translate(-50%, -50%) scale(1.2) rotate(5deg); }
          40% { transform: translate(-50%, -50%) scale(0.9) rotate(-2deg); }
          60% { transform: translate(-50%, -50%) scale(1.1) rotate(2deg); }
          80% { transform: translate(-50%, -50%) scale(1) rotate(0deg); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8) rotate(0deg); }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(pikachuDiv);
    setTimeout(() => pikachuDiv.remove(), 2000);
  };

  return (
    <RGBPartyContext.Provider
      value={{
        isRGBPartyMode,
        toggleRGBPartyMode,
        currentHue,
      }}
    >
      {children}
    </RGBPartyContext.Provider>
  );
};
