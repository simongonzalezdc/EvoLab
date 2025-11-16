// Semantic biome color system - converts attributes to colors

/**
 * Converts normalized biome attributes into a color value
 * @param tempLevel Normalized temperature (0-1, where 0 is coldest, 1 is hottest)
 * @param depthLevel Normalized depth (0-1, where 0 is shallowest, 1 is deepest)
 * @param hazardType Type of hazard: 'toxic' | 'volcanic' | 'frozen' | 'pressure' | 'none'
 * @param nutrientLevel Normalized nutrients (0-1, where 0 is barren, 1 is nutrient-rich)
 * @returns Hex color value
 */
export function getBiomeColorFromAttributes(
  tempLevel: number,
  depthLevel: number,
  hazardType: 'toxic' | 'volcanic' | 'frozen' | 'pressure' | 'none',
  nutrientLevel: number
): number {
  // Base hue: temperature (reds/oranges warm, blues/cyans cold)
  // Temperature range: 0 (cold/blue) to 1 (warm/red-orange)
  let hue: number;
  if (tempLevel < 0.3) {
    // Cold: blue-cyan range (180-240 degrees)
    hue = 180 + (tempLevel / 0.3) * 60; // 180-240
  } else if (tempLevel < 0.7) {
    // Moderate: cyan-green range (120-180 degrees)
    hue = 120 + ((tempLevel - 0.3) / 0.4) * 60; // 120-180
  } else {
    // Warm: yellow-orange-red range (0-60 degrees)
    hue = 60 - ((tempLevel - 0.7) / 0.3) * 60; // 60-0
  }

  // Lightness: depth (lighter = shallow, darker = deep)
  // Depth range: 0 (shallow/light) to 1 (deep/dark)
  let lightness = 50 - depthLevel * 40; // 50% (shallow) to 10% (deep)

  // Saturation: affected by nutrients and hazards
  let saturation = 60 + nutrientLevel * 20; // 60-80% based on nutrients

  // Special handling for hazards
  switch (hazardType) {
    case 'toxic':
      // Purple tint for toxic
      hue = 280; // Purple
      saturation = 70;
      break;
    case 'volcanic':
      // Orange-red for volcanic
      hue = 15; // Orange-red
      saturation = 90;
      lightness = Math.max(30, lightness); // Keep it visible
      break;
    case 'frozen':
      // Ice blue for frozen
      hue = 200; // Ice blue
      saturation = 40;
      lightness = Math.min(80, lightness + 20); // Lighter
      break;
    case 'pressure':
      // Darker blue for high pressure
      hue = 240; // Deep blue
      saturation = 50;
      lightness = Math.max(10, lightness - 10); // Very dark
      break;
    case 'none':
      // No special hazard, use nutrient-based saturation
      if (nutrientLevel < 0.3) {
        // Barren: desaturated brown/gray
        hue = 30; // Brownish
        saturation = 30;
      }
      break;
  }

  // Convert HSL to RGB to hex
  return hslToHex(hue, saturation, lightness);
}

/**
 * Convert HSL to hex color
 */
function hslToHex(h: number, s: number, l: number): number {
  h = h / 360;
  s = s / 100;
  l = l / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 1/6) {
    r = c; g = x; b = 0;
  } else if (h >= 1/6 && h < 2/6) {
    r = x; g = c; b = 0;
  } else if (h >= 2/6 && h < 3/6) {
    r = 0; g = c; b = x;
  } else if (h >= 3/6 && h < 4/6) {
    r = 0; g = x; b = c;
  } else if (h >= 4/6 && h < 5/6) {
    r = x; g = 0; b = c;
  } else if (h >= 5/6 && h < 1) {
    r = c; g = 0; b = x;
  }

  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  // Ensure values are within valid range
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));

  return (r << 16) | (g << 8) | b;
}

