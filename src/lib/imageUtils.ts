export interface ExtractedImage {
  id: string;
  name: string;
  url: string;
  type: 'front' | 'back' | 'unknown';
  rotation: number;
  flipped: boolean;
  flippedVertical: boolean;
}

export const autoPairImages = (images: ExtractedImage[]): ExtractedImage[] => {
  const paired: ExtractedImage[] = [];
  const remaining = [...images];

  // Try to pair images with similar names
  const frontKeywords = ['front', 'f', 'face', '1', 'a'];
  const backKeywords = ['back', 'b', 'rear', '2'];

  remaining.forEach((image) => {
    const lowerName = image.name.toLowerCase();
    
    // Check if filename suggests front or back
    const isFront = frontKeywords.some((keyword) =>
      lowerName.includes(keyword)
    );
    const isBack = backKeywords.some((keyword) =>
      lowerName.includes(keyword)
    );

    if (isFront) {
      paired.push({ ...image, type: 'front' });
    } else if (isBack) {
      paired.push({ ...image, type: 'back' });
    } else {
      paired.push(image);
    }
  });

  // Sort to group front and back together
  return paired.sort((a, b) => {
    const baseName = (name: string) =>
      name.replace(/[_-](front|back|f|b|1|2)/gi, '');
    const aBase = baseName(a.name);
    const bBase = baseName(b.name);
    
    if (aBase === bBase) {
      return a.type === 'front' ? -1 : 1;
    }
    return aBase.localeCompare(bBase);
  });
};

export const validateImageFile = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  return validTypes.includes(file.type) && file.size <= maxSize;
};

export const createImageFromFile = async (
  file: File,
  id: string
): Promise<ExtractedImage> => {
  const url = URL.createObjectURL(file);
  
  return {
    id,
    name: file.name,
    url,
    type: 'unknown',
    rotation: 0,
    flipped: false,
    flippedVertical: false,
  };
};
