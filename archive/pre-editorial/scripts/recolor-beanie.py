import os
import colorsys
from PIL import Image

def recolor_beanie(source_path, target_path, mode):
  if not os.path.exists(source_path):
    print(f"Source file {source_path} not found.")
    return

  img = Image.open(source_path).convert("RGBA")
  data = img.getdata()

  new_data = []
  for r, g, b, a in data:
    # RGB to HLS (range 0.0 to 1.0)
    h, l, s = colorsys.rgb_to_hls(r / 255.0, g / 255.0, b / 255.0)

    # Mode-based adjustments
    if mode == 'black':
      # Saturation to almost 0, Lower lightness
      s = s * 0.05
      l = l * 0.35  # Make it dark black/grey
    elif mode == 'orange':
      # Blue (approx 0.6) to Orange (approx 0.07)
      # Hue shift: (h + shift) % 1.0
      h = (h + 0.45) % 1.0
      s = min(s * 1.5, 1.0)  # Boost saturation slightly for vividness
      l = min(l * 1.1, 1.0)
    elif mode == 'green':
      # Blue (approx 0.6) to Green (approx 0.33)
      # Shift = 0.33 - 0.6 = -0.27 (or +0.73)
      h = (h + 0.73) % 1.0
      s = min(s * 1.3, 1.0)
      l = min(l * 0.95, 1.0)

    # HLS to RGB
    new_r, new_g, new_b = colorsys.hls_to_rgb(h, l, s)
    new_data.append((int(new_r * 255), int(new_g * 255), int(new_b * 255), a))

  img.putdata(new_data)
  img.save(target_path)
  print(f"Generated {target_path} successfully under {mode} mode.")

source = "/Users/woojin/Desktop/github/shopping-mall/public/images/products/cobalt-beanie.png"
recolor_beanie(source, "/Users/woojin/Desktop/github/shopping-mall/public/images/products/black-beanie.png", "black")
recolor_beanie(source, "/Users/woojin/Desktop/github/shopping-mall/public/images/products/orange-beanie.png", "orange")
recolor_beanie(source, "/Users/woojin/Desktop/github/shopping-mall/public/images/products/green-beanie.png", "green")
