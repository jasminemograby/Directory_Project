// Global Design System Configuration
// This file contains all design tokens and styling rules for the Directory system

export const designSystem = {
  global: {
    borderRadius: {
      none: "0",
      xs: "2px",
      sm: "4px",
      md: "6px",
      lg: "8px",
      xl: "12px",
      "2xl": "16px",
      "3xl": "20px",
      "4xl": "24px",
      full: "9999px",
      scale: {
        component: "md",
        card: "lg",
        button: "md",
        input: "md",
        modal: "xl",
        badge: "full",
        chip: "full",
        avatar: "full",
        tooltip: "sm"
      }
    },
    spacing: {
      0: "0",
      1: "4px",
      2: "8px",
      3: "12px",
      4: "16px",
      5: "20px",
      6: "24px",
      8: "32px",
      10: "40px",
      12: "48px",
      16: "64px",
      20: "80px",
      24: "96px",
      32: "128px",
      40: "160px",
      48: "192px",
      64: "256px",
      scale: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        "2xl": "48px",
        "3xl": "64px",
        "4xl": "96px"
      },
      padding: {
        button: {
          sm: "8px 16px",
          md: "12px 24px",
          lg: "16px 32px"
        },
        input: {
          sm: "8px 12px",
          md: "12px 16px",
          lg: "16px 20px"
        },
        card: {
          sm: "16px",
          md: "24px",
          lg: "32px"
        },
        modal: "24px",
        header: "16px 24px"
      },
      margin: {
        section: "48px",
        subsection: "32px",
        element: "16px",
        inline: "8px"
      },
      gap: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px"
      }
    },
    typography: {
      fontFamily: {
        primary: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        secondary: "'Space Grotesk', sans-serif",
        mono: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
        display: "'Space Grotesk', sans-serif"
      },
      fontSize: {
        xs: { size: "12px", lineHeight: "16px", letterSpacing: "0.01em" },
        sm: { size: "14px", lineHeight: "20px", letterSpacing: "0.01em" },
        base: { size: "16px", lineHeight: "24px", letterSpacing: "0" },
        lg: { size: "18px", lineHeight: "28px", letterSpacing: "-0.01em" },
        xl: { size: "20px", lineHeight: "30px", letterSpacing: "-0.01em" },
        "2xl": { size: "24px", lineHeight: "36px", letterSpacing: "-0.02em" },
        "3xl": { size: "30px", lineHeight: "40px", letterSpacing: "-0.02em" },
        "4xl": { size: "36px", lineHeight: "48px", letterSpacing: "-0.03em" },
        "5xl": { size: "48px", lineHeight: "60px", letterSpacing: "-0.03em" },
        "6xl": { size: "60px", lineHeight: "72px", letterSpacing: "-0.04em" }
      },
      fontWeight: {
        light: "300",
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
        extrabold: "800"
      },
      scale: {
        body: "base",
        caption: "sm",
        label: "sm",
        heading1: "4xl",
        heading2: "3xl",
        heading3: "2xl",
        heading4: "xl",
        heading5: "lg",
        heading6: "base"
      }
    },
    transitions: {
      duration: {
        instant: "0ms",
        fast: "150ms",
        normal: "250ms",
        slow: "350ms",
        slower: "500ms"
      },
      easing: {
        linear: "linear",
        easeIn: "cubic-bezier(0.4, 0, 1, 1)",
        easeOut: "cubic-bezier(0, 0, 0.2, 1)",
        easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
        smooth: "cubic-bezier(0.25, 0.1, 0.25, 1)"
      },
      properties: {
        color: "color 150ms ease-in-out",
        backgroundColor: "background-color 150ms ease-in-out",
        borderColor: "border-color 150ms ease-in-out",
        opacity: "opacity 150ms ease-in-out",
        transform: "transform 250ms cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: "box-shadow 250ms ease-in-out",
        all: "all 250ms ease-in-out"
      }
    },
    shadows: {
      none: "none",
      xs: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      sm: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
      md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
      glow: {
        primary: "0 0 30px rgba(6, 95, 70, 0.3)",
        accent: "0 0 20px rgba(217, 119, 6, 0.4)",
        success: "0 0 15px rgba(16, 185, 129, 0.3)",
        error: "0 0 15px rgba(239, 68, 68, 0.3)"
      }
    },
    zIndex: {
      base: 0,
      dropdown: 1000,
      sticky: 1020,
      fixed: 1030,
      modalBackdrop: 1040,
      modal: 1050,
      popover: 1060,
      tooltip: 1070,
      notification: 1080,
      max: 9999
    }
  },
  modes: {
    "day-mode": {
      background: {
        body: "#f8fafc",
        appShell: "#ffffff",
        panel: "#ffffff",
        card: "#ffffff",
        section: "#f8fafc",
        overlay: "rgba(0, 0, 0, 0.5)",
        backdrop: "rgba(0, 0, 0, 0.3)"
      },
      text: {
        primary: "#1e293b",
        secondary: "#475569",
        muted: "#64748b",
        inverse: "#ffffff",
        disabled: "#94a3b8",
        link: "#047857",
        linkHover: "#065f46"
      },
      header: {
        height: "64px",
        background: "#ffffff",
        backgroundTransparent: "rgba(255, 255, 255, 0.95)",
        border: "1px solid #e2e8f0",
        shadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        text: "#1e293b"
      },
      button: {
        primary: {
          background: "#047857",
          backgroundHover: "#065f46",
          backgroundPressed: "#064e3b",
          backgroundDisabled: "#cbd5e1",
          text: "#ffffff",
          textDisabled: "#94a3b8",
          border: "none",
          shadow: "0 4px 6px -1px rgba(6, 95, 70, 0.2)",
          shadowHover: "0 10px 15px -3px rgba(6, 95, 70, 0.3)"
        },
        secondary: {
          background: "#f1f5f9",
          backgroundHover: "#e2e8f0",
          backgroundPressed: "#cbd5e1",
          backgroundDisabled: "#f8fafc",
          text: "#1e293b",
          textDisabled: "#94a3b8",
          border: "1px solid #cbd5e1",
          shadow: "none",
          shadowHover: "0 2px 4px rgba(0, 0, 0, 0.1)"
        },
        outline: {
          background: "transparent",
          backgroundHover: "#f1f5f9",
          backgroundPressed: "#e2e8f0",
          backgroundDisabled: "transparent",
          text: "#047857",
          textHover: "#065f46",
          textDisabled: "#cbd5e1",
          border: "1px solid #047857",
          borderHover: "1px solid #065f46",
          borderDisabled: "1px solid #cbd5e1",
          shadow: "none"
        },
        ghost: {
          background: "transparent",
          backgroundHover: "#f1f5f9",
          backgroundPressed: "#e2e8f0",
          backgroundDisabled: "transparent",
          text: "#1e293b",
          textHover: "#047857",
          textDisabled: "#cbd5e1",
          border: "none",
          shadow: "none"
        }
      },
      input: {
        background: "#ffffff",
        backgroundHover: "#ffffff",
        backgroundFocus: "#ffffff",
        backgroundFilled: "#f8fafc",
        backgroundDisabled: "#f1f5f9",
        backgroundInvalid: "#fef2f2",
        text: "#1e293b",
        textPlaceholder: "#94a3b8",
        textDisabled: "#94a3b8",
        textInvalid: "#dc2626",
        border: "1px solid #cbd5e1",
        borderHover: "1px solid #94a3b8",
        borderFocus: "2px solid #047857",
        borderInvalid: "2px solid #ef4444",
        borderDisabled: "1px solid #e2e8f0",
        shadow: "none",
        shadowFocus: "0 0 0 3px rgba(6, 95, 70, 0.1)"
      },
      border: {
        default: "#e2e8f0",
        subtle: "#f1f5f9",
        strong: "#cbd5e1",
        focus: "#047857",
        error: "#ef4444",
        success: "#10b981",
        warning: "#f59e0b"
      },
      card: {
        surface: "#ffffff",
        surfaceGradient: "linear-gradient(145deg, #ffffff, #f0fdfa)",
        border: "1px solid #e2e8f0",
        radius: "lg",
        shadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
        padding: "24px",
        hover: {
          shadow: "0 20px 60px rgba(6, 95, 70, 0.2)",
          transform: "translateY(-2px)"
        }
      }
    },
    "night-mode": {
      background: {
        body: "#0f172a",
        appShell: "#1e293b",
        panel: "#1e293b",
        card: "#1e293b",
        section: "#0f172a",
        overlay: "rgba(0, 0, 0, 0.7)",
        backdrop: "rgba(0, 0, 0, 0.5)"
      },
      text: {
        primary: "#f8fafc",
        secondary: "#cbd5e1",
        muted: "#94a3b8",
        inverse: "#0f172a",
        disabled: "#475569",
        link: "#2dd4bf",
        linkHover: "#5eead4"
      },
      header: {
        height: "64px",
        background: "#0f172a",
        backgroundTransparent: "rgba(15, 23, 42, 0.95)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        shadow: "0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2)",
        text: "#f8fafc"
      },
      button: {
        primary: {
          background: "linear-gradient(135deg, #0d9488, #059669)",
          backgroundHover: "linear-gradient(135deg, #059669, #047857)",
          backgroundPressed: "linear-gradient(135deg, #047857, #065f46)",
          backgroundDisabled: "#475569",
          text: "#ffffff",
          textDisabled: "#64748b",
          border: "none",
          shadow: "0 4px 6px -1px rgba(13, 148, 136, 0.3), 0 0 15px rgba(13, 148, 136, 0.2)",
          shadowHover: "0 10px 15px -3px rgba(13, 148, 136, 0.4), 0 0 20px rgba(13, 148, 136, 0.3)"
        },
        secondary: {
          background: "transparent",
          backgroundHover: "linear-gradient(135deg, #0d9488, #059669)",
          backgroundPressed: "linear-gradient(135deg, #059669, #047857)",
          backgroundDisabled: "transparent",
          text: "#f8fafc",
          textDisabled: "#64748b",
          border: "2px solid rgba(255, 255, 255, 0.2)",
          borderHover: "transparent",
          shadow: "none",
          shadowHover: "0 2px 4px rgba(0, 0, 0, 0.3)"
        },
        outline: {
          background: "transparent",
          backgroundHover: "#334155",
          backgroundPressed: "#475569",
          backgroundDisabled: "transparent",
          text: "#2dd4bf",
          textHover: "#5eead4",
          textDisabled: "#475569",
          border: "1px solid #2dd4bf",
          borderHover: "1px solid #5eead4",
          borderDisabled: "1px solid #475569",
          shadow: "none"
        },
        ghost: {
          background: "transparent",
          backgroundHover: "#334155",
          backgroundPressed: "#475569",
          backgroundDisabled: "transparent",
          text: "#cbd5e1",
          textHover: "#f8fafc",
          textDisabled: "#475569",
          border: "none",
          shadow: "none"
        }
      },
      input: {
        background: "#1e293b",
        backgroundHover: "#1e293b",
        backgroundFocus: "#1e293b",
        backgroundFilled: "#1e293b",
        backgroundDisabled: "#1e293b",
        backgroundInvalid: "#7f1d1d",
        text: "#f8fafc",
        textPlaceholder: "#94a3b8",
        textDisabled: "#64748b",
        textInvalid: "#fca5a5",
        border: "1px solid #334155",
        borderHover: "1px solid #334155",
        borderFocus: "2px solid #2dd4bf",
        borderInvalid: "2px solid #ef4444",
        borderDisabled: "1px solid #334155",
        shadow: "none",
        shadowFocus: "0 0 0 3px rgba(45, 212, 191, 0.2)"
      },
      border: {
        default: "#334155",
        subtle: "#1e293b",
        strong: "#475569",
        focus: "#2dd4bf",
        error: "#ef4444",
        success: "#10b981",
        warning: "#f59e0b"
      },
      card: {
        surface: "#1e293b",
        surfaceGradient: "linear-gradient(145deg, #1e293b, #334155)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        radius: "lg",
        shadow: "0 10px 40px rgba(0, 0, 0, 0.6)",
        padding: "24px",
        hover: {
          shadow: "0 20px 60px rgba(13, 148, 136, 0.3)",
          transform: "translateY(-2px)"
        }
      }
    }
  },
  branding: {
    color: {
      primary: {
        50: "#f0fdfa",
        100: "#ccfbf1",
        200: "#99f6e4",
        300: "#5eead4",
        400: "#2dd4bf",
        500: "#14b8a6",
        600: "#0d9488",
        700: "#047857",
        800: "#065f46",
        900: "#064e3b",
        base: "#047857",
        light: "#14b8a6",
        dark: "#065f46"
      },
      accent: {
        base: "#d97706",
        light: "#f59e0b",
        dark: "#b45309"
      },
      success: {
        base: "#10b981",
        light: "#34d399",
        dark: "#059669"
      },
      error: {
        base: "#ef4444",
        light: "#f87171",
        dark: "#dc2626"
      },
      warning: {
        base: "#f59e0b",
        light: "#fbbf24",
        dark: "#d97706"
      }
    }
  },
  components: {
    tabs: {
      padding: "8px 16px",
      active: {
        border: {
          "day-mode": "2px solid #047857",
          "night-mode": "2px solid #2dd4bf"
        },
        text: {
          "day-mode": "#047857",
          "night-mode": "#2dd4bf"
        }
      },
      hover: {
        background: {
          "day-mode": "#f1f5f9",
          "night-mode": "#334155"
        }
      }
    },
    card: {
      radius: "lg",
      padding: {
        sm: "16px",
        md: "24px",
        lg: "32px"
      }
    }
  },
  layout: {
    header: {
      height: "64px",
      sticky: true,
      zIndex: 1030
    },
    maxPageWidth: {
      mobile: "100%",
      tablet: "768px",
      desktop: "1280px",
      wide: "1536px"
    }
  }
};

// Helper function to get theme-specific values
export const getThemeValue = (theme, path) => {
  const keys = path.split('.');
  let value = designSystem.modes[theme];
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return null;
    }
  }
  
  return value;
};

// Helper function to get design token
export const getToken = (category, key, theme = null) => {
  if (theme && designSystem.modes[theme] && designSystem.modes[theme][category]) {
    return designSystem.modes[theme][category][key];
  }
  return designSystem.global[category]?.[key] || designSystem[category]?.[key];
};

